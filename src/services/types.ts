import { Book } from '@/types/book';
import { User } from '@/lib/mockDb';

/** A book enriched with its owner's profile. */
export interface BookWithOwner extends Book {
  owner: User | undefined;
}

export interface IBookService {
  getUserBooks(): Promise<Book[]>;
  addBook(book: Omit<Book, 'id'>): Promise<Book>;
  toggleBookAvailability(id: string, available: boolean): Promise<void>;
  deleteBook(id: string): Promise<void>;
  getAvailableBooks(searchQuery?: string): Promise<Book[]>;
  getBookById(id: string): Promise<BookWithOwner>;
  toggleWishlistItem(userId: string, bookId: string): Promise<unknown>;
  getUserWishlist(userId: string): Promise<Book[]>;
}

export interface IAuthService {
  login(username: string): Promise<User | null>;
  register(userData: Omit<User, 'id'>): Promise<User>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
}

/** A transaction row enriched with its related book/user data from the mock DB. */
export interface TransactionRow {
  id: string;
  book_id: string;
  borrower_id: string;
  lender_id: string;
  status: string;
  request_date?: string;
  approval_date?: string;
  return_date?: string;
  due_date?: string;
  notes?: string;
  created_at?: string;
  book?: Book;
  borrower?: User;
  lender?: User;
}

export interface ITransactionService {
  getTransactions(filters?: { userId: string; type?: string }): Promise<TransactionRow[]>;
  requestBook(bookId: string): Promise<TransactionRow>;
  updateTransactionStatus(id: string, status: string): Promise<TransactionRow>;
}
