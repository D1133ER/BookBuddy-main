import { Book } from '@/types/book';
import { User } from '@/lib/mockDb';

export interface IBookService {
  getUserBooks(): Promise<Book[]>;
  addBook(book: Omit<Book, 'id'>): Promise<Book>;
  toggleBookAvailability(id: string, available: boolean): Promise<void>;
  deleteBook(id: string): Promise<void>;
  getAvailableBooks(searchQuery?: string): Promise<Book[]>;
  getBookById(id: string): Promise<Book & { owner: any }>;
  toggleWishlistItem(userId: string, bookId: string): Promise<any>;
  getUserWishlist(userId: string): Promise<Book[]>;
}

export interface IAuthService {
  login(username: string): Promise<User | null>;
  register(userData: Omit<User, 'id'>): Promise<User>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
}

export interface ITransactionService {
  getTransactions(filters?: { userId: string; type?: string }): Promise<any[]>;
  requestBook(bookId: string): Promise<any>;
  updateTransactionStatus(id: string, status: string): Promise<any>;
}
