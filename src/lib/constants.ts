// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh',
  },
  USERS: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    STATS: '/users/stats',
  },
  BOOKS: {
    LIST: '/books',
    CREATE: '/books',
    DETAIL: (id: string) => `/books/${id}`,
    UPDATE: (id: string) => `/books/${id}`,
    DELETE: (id: string) => `/books/${id}`,
    MY_BOOKS: '/books/my-books',
  },
  TRANSACTIONS: {
    LIST: '/transactions',
    CREATE: '/transactions',
    DETAIL: (id: string) => `/transactions/${id}`,
    UPDATE_STATUS: (id: string) => `/transactions/${id}/status`,
  },
  MESSAGES: {
    CONVERSATIONS: '/messages/conversations',
    CONVERSATION: (userId: string) => `/messages/conversations/${userId}`,
    SEND: '/messages',
  },
  REVIEWS: {
    LIST: '/reviews',
    CREATE: '/reviews',
    DETAIL: (id: string) => `/reviews/${id}`,
  },
} as const;

// Route Paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  CATALOG: '/catalog',
  MY_BOOKS: '/my-books',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  TRANSACTIONS: '/transactions',
  MESSAGES: '/messages',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER: 'user',
  IS_LOGGED_IN: 'isLoggedIn',
  CATALOG_CACHE: 'bookbuddy.catalog.cache.v1',
} as const;

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// Book Condition Labels
export const BOOK_CONDITION_LABELS = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent',
} as const;

// Transaction Status Labels
export const TRANSACTION_STATUS_LABELS = {
  pending: 'Pending',
  active: 'Active',
  completed: 'Completed',
  cancelled: 'Cancelled',
} as const;

// Validation Constants
export const VALIDATION = {
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 100,
  },
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 50,
  },
  BOOK: {
    TITLE_MAX_LENGTH: 500,
    AUTHOR_MAX_LENGTH: 300,
    DESCRIPTION_MAX_LENGTH: 5000,
  },
  MESSAGE: {
    CONTENT_MAX_LENGTH: 2000,
  },
} as const;
