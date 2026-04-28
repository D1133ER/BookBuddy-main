import * as mockAuthService from './mockAuthService';
import * as mockBookService from './mockBookService';
import * as mockTransactionService from './mockTransactionService';
import * as mockUserService from './mockUserService';
import { chatService as mockChatServiceInstance } from './mockChatService';
export * from './mockChatService';
import * as mockMessageService from './mockMessageService';

const useMockDb = import.meta.env.VITE_USE_MOCK_DB !== 'false';

let authService: typeof mockAuthService;
let bookService: typeof mockBookService;
let transactionService: typeof mockTransactionService;
let userService: typeof mockUserService;
let chatService: typeof mockChatServiceInstance;
let messageService: typeof mockMessageService;

if (useMockDb) {
  authService = mockAuthService;
  bookService = mockBookService;
  transactionService = mockTransactionService;
  userService = mockUserService;
  chatService = mockChatServiceInstance;
  messageService = mockMessageService;
} else {
  // TODO: Import real API services when backend is ready
  // import * as realAuthService from "./realAuthService";
  // import * as realBookService from "./realBookService";
  // etc.
  console.warn(
    'VITE_USE_MOCK_DB=false - Mock services still in use. Connect to real API in Phase 5.',
  );
  authService = mockAuthService;
  bookService = mockBookService;
  transactionService = mockTransactionService;
  userService = mockUserService;
  chatService = mockChatServiceInstance;
  messageService = mockMessageService;
}

export { authService, bookService, transactionService, userService, chatService, messageService };

export const { login, register, logout, getCurrentUser } = authService;
export const {
  getUserBooks,
  addBook,
  toggleBookAvailability,
  deleteBook,
  getAvailableBooks,
  getBookById,
  toggleWishlistItem,
  getUserWishlist,
} = bookService;
export const { getTransactions, requestBook, updateTransactionStatus } = transactionService;
export const { getProfile, getUserById, updateProfile, getUserStats } = userService;
export const { getConversations, getConversation, sendMessage } = messageService;
