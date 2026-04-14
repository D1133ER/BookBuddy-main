export interface Book {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  condition: number;
  available: boolean;
  description?: string;
  owner_id?: string;
  isbn?: string;
  publicationDate?: string;
  genre?: string;
  rating?: number;
  ratingsCount?: number;
  publisher?: string;
  source?: string;
}

export interface BorrowedBook extends Book {
  borrowedFrom: string;
  dueDate: string;
}
