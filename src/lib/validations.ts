import { z } from 'zod';

// Login Validation Schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Register Validation Schema
export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type RegisterInput = z.infer<typeof registerSchema>;

// Book Validation Schema
export const bookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title is too long'),
  author: z.string().min(1, 'Author is required').max(300, 'Author name is too long'),
  description: z.string().max(5000, 'Description is too long').optional(),
  coverImage: z.string().url('Invalid URL').optional().or(z.literal('')),
  condition: z.number().min(1, 'Condition must be between 1 and 5').max(5),
  isbn: z.string().regex(/^(?:ISBN(?:-1[30])?:?\s*)?(?=[-0-9\s]{17}$|[-0-9X\s]{13}$|[0-9X]{10,13}$)/, 'Invalid ISBN format').optional().or(z.literal('')),
  genre: z.string().max(100, 'Genre name is too long').optional(),
  publicationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional().or(z.literal('')),
  publisher: z.string().max(200, 'Publisher name is too long').optional(),
});

export type BookInput = z.infer<typeof bookSchema>;

// Transaction Validation Schema
export const transactionSchema = z.object({
  bookId: z.string().uuid('Invalid book ID'),
  notes: z.string().max(1000, 'Notes are too long').optional(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
});

export type TransactionInput = z.infer<typeof transactionSchema>;

// Message Validation Schema
export const messageSchema = z.object({
  recipientId: z.string().uuid('Invalid recipient ID'),
  content: z.string().min(1, 'Message cannot be empty').max(2000, 'Message is too long'),
});

export type MessageInput = z.infer<typeof messageSchema>;

// Profile Update Schema
export const profileUpdateSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .optional(),
  displayName: z.string().max(100, 'Display name is too long').optional(),
  bio: z.string().max(500, 'Bio is too long').optional(),
  location: z.string().max(200, 'Location name is too long').optional(),
  avatarUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

// Pagination Schema
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export type PaginationInput = z.infer<typeof paginationSchema>;
