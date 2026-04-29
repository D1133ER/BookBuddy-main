import { db, Transaction } from '@/lib/mockDb';
import { mapMockBookToAppBook } from '@/lib/mockDbSeed';

export const getTransactions = async (filters: {
  userId: string;
  type?: 'lender' | 'borrower';
}) => {
  const transactions = await db.getTransactions();
  let userTransactions = filters.userId
    ? transactions.filter((t) => t.lender_id === filters.userId || t.borrower_id === filters.userId)
    : transactions;

  if (filters.type === 'lender') {
    userTransactions = userTransactions.filter((t) => t.lender_id === filters.userId);
  } else if (filters.type === 'borrower') {
    userTransactions = userTransactions.filter((t) => t.borrower_id === filters.userId);
  }

  const books = await db.getBooks();
  const users = await db.getUsers();

  return userTransactions
    .map((t) => {
      const foundBook = books.find((b) => b.id === t.book_id);
      return {
        ...t,
        book: foundBook ? mapMockBookToAppBook(foundBook) : undefined,
        borrower: users.find((u) => u.id === t.borrower_id),
        lender: users.find((u) => u.id === t.lender_id),
      };
    })
    .sort((a, b) => (a.request_date && b.request_date && a.request_date < b.request_date ? 1 : -1));
};

export const requestBook = async (bookId: string) => {
  const session = await db.getSession();
  const userId = session?.user?.id;
  if (!userId) throw new Error('Not authenticated');

  const books = await db.getBooks();
  const book = books.find((b) => b.id === bookId);
  if (!book) throw new Error('Book not found');
  if (!book.available) throw new Error('Book not available');

  const newTransaction: Transaction = {
    id: db.generateId(),
    book_id: bookId,
    borrower_id: userId,
    lender_id: book.owner_id,
    status: 'pending',
    request_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };

  const transactions = await db.getTransactions();
  await db.setTransactions([...transactions, newTransaction]);
  return newTransaction;
};

export const updateTransactionStatus = async (transactionId: string, status: string) => {
  const transactions = await db.getTransactions();
  const index = transactions.findIndex((t) => t.id === transactionId);
  if (index === -1) throw new Error('Transaction not found');

  const transaction = { ...transactions[index], status };

  if (status === 'active') {
    transaction.approval_date = new Date().toISOString();
    // Set due date to 14 days from now
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);
    transaction.due_date = dueDate.toISOString();

    // Mark book as unavailable
    const books = await db.getBooks();
    const bookIndex = books.findIndex((b) => b.id === transaction.book_id);
    if (bookIndex !== -1) {
      books[bookIndex] = { ...books[bookIndex], available: false };
      await db.setBooks(books);
    }
  } else if (status === 'completed' || status === 'cancelled') {
    if (status === 'completed') {
      transaction.return_date = new Date().toISOString();
    }

    // Mark book as available again
    const books = await db.getBooks();
    const bookIndex = books.findIndex((b) => b.id === transaction.book_id);
    if (bookIndex !== -1) {
      books[bookIndex] = { ...books[bookIndex], available: true };
      await db.setBooks(books);
    }
  }

  transactions[index] = transaction;
  await db.setTransactions(transactions);
  return transaction;
};
