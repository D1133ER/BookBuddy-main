# BookBuddy API Documentation

This document describes the BookBuddy service layer and the recommended data-fetching patterns using TanStack Query.

## Service Architecture

BookBuddy uses a **Service Factory** pattern to decouple the UI from the data persistence layer. This allows the application to switch between a local-first mock implementation (using IndexedDB) and a production API.

### VITE_USE_MOCK_DB Flag

The storage backend is controlled by the `VITE_USE_MOCK_DB` environment variable:

- `true` (default): Uses `idb` (IndexedDB) for local persistence.
- `false`: (Future) Would connect to a real production API.

## Data Fetching Pattern

We use **TanStack Query** (React Query) for all data-fetching operations. Direct service calls should only be made within custom hooks or mutations.

### Custom Hooks

| Hook                  | Description                             | Cache Key                    |
| --------------------- | --------------------------------------- | ---------------------------- |
| `useAvailableBooks`   | Fetches all available books             | `['books', 'available']`     |
| `useBook(id)`         | Fetches a single book with owner info   | `['book', id]`               |
| `useUserBooks`        | Fetches books owned by the current user | `['books', 'user', id]`      |
| `useUserWishlist`     | Fetches the user's wishlist             | `['wishlist', id]`           |
| `useUserTransactions` | Fetches transactions for the user       | `['transactions', type, id]` |

### Mutations

Mutations automatically handle cache invalidation to keep the UI in sync across tabs via `BroadcastChannel`.

| Mutation                             | Description                     | Invalidates                     |
| ------------------------------------ | ------------------------------- | ------------------------------- |
| `useAddBookMutation`                 | Adds a new book to the shelf    | `['books']`                     |
| `useRequestBookMutation`             | Sends a borrowing request       | `['transactions']`              |
| `useToggleAvailabilityMutation`      | Toggles book availability       | `['books']`                     |
| `useToggleWishlistMutation`          | Adds/Removes book from wishlist | `['wishlist']`                  |
| `useUpdateTransactionStatusMutation` | Updates loan status             | `['transactions']`, `['books']` |

## Service Interfaces

All service implementations must adhere to the interfaces defined in `src/services/types.ts`.

### BookService

```typescript
interface IBookService {
  getUserBooks(): Promise<Book[]>;
  addBook(book: Omit<Book, 'id'>): Promise<Book>;
  toggleBookAvailability(id: string, available: boolean): Promise<void>;
  getAvailableBooks(searchQuery?: string): Promise<Book[]>;
  getBookById(id: string): Promise<Book & { owner: any }>;
  toggleWishlistItem(userId: string, bookId: string): Promise<any>;
}
```

### AuthService

```typescript
interface IAuthService {
  login(username: string): Promise<User | null>;
  register(userData: Omit<User, 'id'>): Promise<User>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
}
```

## Real-time Sync

The `MockDB` implementation includes a `BroadcastChannel` that notifies other tabs of changes. When a mutation occurs in one tab, all other tabs will automatically refetch the relevant queries via `queryClient.invalidateQueries`.
