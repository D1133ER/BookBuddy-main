import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Define basic mock models
export interface User {
  id: string;
  username: string;
  email?: string;
  display_name: string;
  avatar_url?: string;
  location?: string;
  bio?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  description?: string;
  cover_image?: string;
  condition: number;
  available: boolean;
  owner_id: string;
  isbn?: string;
  publication_date?: string;
  genre?: string;
  rating?: number;
  ratings_count?: number;
  publisher?: string;
  source?: string;
  created_at?: string;
}

export interface Transaction {
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
}

export interface Review {
  id: string;
  transaction_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment?: string;
  created_at?: string;
}

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  created_at?: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  book_id: string;
  added_at: string;
}

export type MockDbCollectionKey =
  | 'users'
  | 'books'
  | 'transactions'
  | 'reviews'
  | 'messages'
  | 'wishlist'
  | 'session';

export const MOCK_DB_CHANGE_EVENT = 'bookbuddy:db-change';

interface BookBuddyDB extends DBSchema {
  collections: {
    key: string;
    // IDB stores arbitrary serialisable data; narrowed at call-sites via typed getters
    value: unknown;
  };
}

class MockDB {
  private dbPromise: Promise<IDBPDatabase<BookBuddyDB>>;
  private channel: BroadcastChannel;

  constructor() {
    this.dbPromise = openDB<BookBuddyDB>('bookbuddy-db', 1, {
      upgrade(db) {
        db.createObjectStore('collections');
      },
    });

    this.channel = new BroadcastChannel('bookbuddy:db-sync');
    this.channel.onmessage = (event) => {
      if (event.data && event.data.type === 'db-change') {
        this.emitChangeEvent(event.data.key, false);
      }
    };
  }

  private async getCollection<T>(key: MockDbCollectionKey): Promise<T[]> {
    const db = await this.dbPromise;
    return (await db.get('collections', key)) || [];
  }

  private async setCollection<T>(key: MockDbCollectionKey, data: T[]) {
    const db = await this.dbPromise;
    await db.put('collections', data, key);
    this.emitChangeEvent(key, true);
  }

  private emitChangeEvent(key: MockDbCollectionKey, broadcast: boolean) {
    if (typeof window === 'undefined') return;

    window.dispatchEvent(
      new CustomEvent(MOCK_DB_CHANGE_EVENT, {
        detail: { key },
      }),
    );

    if (broadcast) {
      this.channel.postMessage({ type: 'db-change', key });
    }
  }

  // Getters/Setters replaced with async methods
  public async getUsers() {
    return this.getCollection<User>('users');
  }
  public async setUsers(data: User[]) {
    await this.setCollection('users', data);
  }

  public async getBooks() {
    return this.getCollection<Book>('books');
  }
  public async setBooks(data: Book[]) {
    await this.setCollection('books', data);
  }

  public async getTransactions() {
    return this.getCollection<Transaction>('transactions');
  }
  public async setTransactions(data: Transaction[]) {
    await this.setCollection('transactions', data);
  }

  public async getReviews() {
    return this.getCollection<Review>('reviews');
  }
  public async setReviews(data: Review[]) {
    await this.setCollection('reviews', data);
  }

  public async getMessages() {
    return this.getCollection<Message>('messages');
  }
  public async setMessages(data: Message[]) {
    await this.setCollection('messages', data);
  }

  public async getSession() {
    const db = await this.dbPromise;
    return (await db.get('collections', 'session')) || null;
  }
  public async setSession(data: Record<string, unknown> | null) {
    const db = await this.dbPromise;
    if (data) await db.put('collections', data, 'session');
    else await db.delete('collections', 'session');
    this.emitChangeEvent('session', true);
  }

  public async getWishlist() {
    return this.getCollection<WishlistItem>('wishlist');
  }
  public async setWishlist(data: WishlistItem[]) {
    await this.setCollection('wishlist', data);
  }

  generateId() {
    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
  }
}

export const db = new MockDB();
