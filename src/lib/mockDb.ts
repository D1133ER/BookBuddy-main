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

export type MockDbCollectionKey =
  | "users"
  | "books"
  | "transactions"
  | "reviews"
  | "messages"
  | "session";

export const MOCK_DB_CHANGE_EVENT = "bookbuddy:db-change";

class MockDB {
  private get<T>(key: string): T[] {
    const data = localStorage.getItem(key);

    if (!data) {
      return [];
    }

    try {
      return JSON.parse(data) as T[];
    } catch {
      localStorage.removeItem(key);
      return [];
    }
  }

  private set<T>(key: Exclude<MockDbCollectionKey, "session">, data: T[]) {
    localStorage.setItem(key, JSON.stringify(data));
    this.emitChange(key);
  }

  private emitChange(key: MockDbCollectionKey) {
    if (typeof window === "undefined") {
      return;
    }

    window.dispatchEvent(
      new CustomEvent(MOCK_DB_CHANGE_EVENT, {
        detail: { key },
      }),
    );
  }

  public get users() { return this.get<User>('users'); }
  public set users(data: User[]) { this.set('users', data); }

  public get books() { return this.get<Book>('books'); }
  public set books(data: Book[]) { this.set('books', data); }

  public get transactions() { return this.get<Transaction>('transactions'); }
  public set transactions(data: Transaction[]) { this.set('transactions', data); }

  public get reviews() { return this.get<Review>('reviews'); }
  public set reviews(data: Review[]) { this.set('reviews', data); }

  public get messages() { return this.get<Message>('messages'); }
  public set messages(data: Message[]) { this.set('messages', data); }

  public get session() { 
    const session = localStorage.getItem('session');

    if (!session) {
      return null;
    }

    try {
      return JSON.parse(session);
    } catch {
      localStorage.removeItem('session');
      return null;
    }
  }
  public set session(data: any) { 
    if (data) localStorage.setItem('session', JSON.stringify(data));
    else localStorage.removeItem('session');
    this.emitChange('session');
  }

  generateId() {
    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
  }
}

export const db = new MockDB();
