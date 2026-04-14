import { Message as MockMessage, Transaction as MockTransaction, db } from "@/lib/mockDb";

export type Transaction = MockTransaction;
export type TransactionInsert = Omit<Transaction, "id" | "created_at">;

const openStatuses = new Set(["pending", "active"]);

const createMessage = (senderId: string, recipientId: string, content: string): MockMessage => ({
  id: db.generateId(),
  sender_id: senderId,
  recipient_id: recipientId,
  content,
  is_read: false,
  created_at: new Date().toISOString(),
});

const getDefaultDueDate = () => {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 21);
  return dueDate.toISOString();
};

export async function getTransactions(options?: {
  userId?: string;
  status?: string;
  type?: "borrower" | "lender" | "all";
}) {
  let targetTransactions = [...db.transactions];

  if (options?.userId) {
    if (options.type === "borrower") {
      targetTransactions = targetTransactions.filter(t => t.borrower_id === options.userId);
    } else if (options.type === "lender") {
      targetTransactions = targetTransactions.filter(t => t.lender_id === options.userId);
    } else {
      targetTransactions = targetTransactions.filter(
        t => t.borrower_id === options.userId || t.lender_id === options.userId
      );
    }
  }

  if (options?.status) {
    targetTransactions = targetTransactions.filter(t => t.status === options.status);
  }

  targetTransactions.sort((a, b) => {
    return new Date(b.request_date || b.created_at || 0).getTime() - new Date(a.request_date || a.created_at || 0).getTime();
  });

  return targetTransactions.map(t => {
    const book = db.books.find(b => b.id === t.book_id);
    const borrower = db.users.find(u => u.id === t.borrower_id);
    const lender = db.users.find(u => u.id === t.lender_id);
    return { ...t, book, borrower, lender };
  });
}

export async function getTransactionById(id: string) {
  const transaction = db.transactions.find(t => t.id === id);
  if (!transaction) throw new Error("Transaction not found");

  const book = db.books.find(b => b.id === transaction.book_id);
  const borrower = db.users.find(u => u.id === transaction.borrower_id);
  const lender = db.users.find(u => u.id === transaction.lender_id);

  return { ...transaction, book, borrower, lender };
}

export async function requestBook(bookId: string, notes?: string) {
  const session = db.session;
  const user = session?.user;
  if (!user) throw new Error("User not authenticated");

  const book = db.books.find(b => b.id === bookId);
  if (!book) throw new Error("Book not found");
  if (!book.available) throw new Error("Book is not available");
  if (book.owner_id === user.id)
    throw new Error("You cannot borrow your own book");

  const existingRequest = db.transactions.find(
    (transaction) =>
      transaction.book_id === bookId &&
      transaction.borrower_id === user.id &&
      openStatuses.has(transaction.status),
  );

  if (existingRequest) {
    throw new Error("You already have an open request for this book");
  }

  const newTx = {
    id: db.generateId(),
    book_id: bookId,
    borrower_id: user.id,
    lender_id: book.owner_id,
    status: "pending",
    notes,
    request_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };

  db.transactions = [...db.transactions, newTx];

  const openingMessage = notes?.trim()
    ? `Hi, I would love to borrow "${book.title}". ${notes.trim()}`
    : `Hi, I would love to borrow "${book.title}". I am available to coordinate pickup this week if it works for you.`;

  db.messages = [...db.messages, createMessage(user.id, book.owner_id, openingMessage)];

  return newTx;
}

export async function updateTransactionStatus(
  id: string,
  status: string,
  dueDate?: string,
) {
  const session = db.session;
  const actingUser = session?.user;

  if (!actingUser) {
    throw new Error("User not authenticated");
  }

  const transactions = db.transactions;
  const index = transactions.findIndex(t => t.id === id);
  if (index === -1) throw new Error("Transaction not found");

  const currentTransaction = transactions[index];
  if (![currentTransaction.borrower_id, currentTransaction.lender_id].includes(actingUser.id)) {
    throw new Error("You cannot update this transaction");
  }

  const updates: Partial<Transaction> = { status };

  if (status === "active") {
    updates.approval_date = new Date().toISOString();
    updates.due_date = dueDate || currentTransaction.due_date || getDefaultDueDate();
  }

  if (status === "completed") {
    updates.return_date = new Date().toISOString();
  }

  const updatedTx = { ...transactions[index], ...updates };
  transactions[index] = updatedTx;
  db.transactions = transactions;

  if (status === "active") {
    const books = db.books;
    const bIdx = books.findIndex(b => b.id === updatedTx.book_id);
    if (bIdx !== -1) {
      books[bIdx].available = false;
      db.books = books;
    }
  }

  if (status === "completed") {
    const books = db.books;
    const bIdx = books.findIndex(b => b.id === updatedTx.book_id);
    if (bIdx !== -1) {
      books[bIdx].available = true;
      db.books = books;
    }
  }

  const book = db.books.find((entry) => entry.id === updatedTx.book_id);
  const otherUserId = actingUser.id === updatedTx.borrower_id ? updatedTx.lender_id : updatedTx.borrower_id;

  if (book) {
    let content: string | null = null;

    if (status === "active") {
      const friendlyDueDate = new Date(updatedTx.due_date || getDefaultDueDate()).toLocaleDateString();
      content = `Your request for "${book.title}" is approved. Let's coordinate pickup and aim to return it by ${friendlyDueDate}.`;
    }

    if (status === "cancelled") {
      content = `The request for "${book.title}" was declined for now. Feel free to check back later.`;
    }

    if (status === "completed") {
      content = `The exchange for "${book.title}" has been marked complete. Thanks for keeping the community shelf moving.`;
    }

    if (content) {
      db.messages = [...db.messages, createMessage(actingUser.id, otherUserId, content)];
    }
  }

  return updatedTx;
}
