import { db } from "@/lib/mockDb";
import { DEFAULT_BOOK_COVER, mapMockBookToAppBook } from "@/lib/mockDbSeed";
import { Book as AppBook } from "@/types/book";

// Note: Book type from mockDb is slightly different from AppBook, we map it.
type MockBook = typeof db.books[0];

export const getUserBooks = async (): Promise<AppBook[]> => {
  const session = db.session;
  const userId = session?.user?.id;
  if (!userId) return [];

  const books = db.books.filter(b => b.owner_id === userId)
    .sort((a, b) => (a.created_at && b.created_at && a.created_at < b.created_at ? 1 : -1));

  return books.map(mapMockBookToAppBook);
};

export const addBook = async (book: Omit<AppBook, "id">): Promise<AppBook> => {
  const session = db.session;
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const newBook: MockBook = {
    id: db.generateId(),
    owner_id: userId,
    title: book.title,
    author: book.author,
    description: book.description,
    cover_image: book.coverImage || DEFAULT_BOOK_COVER,
    condition: book.condition,
    available: book.available,
    isbn: book.isbn,
    publication_date: book.publicationDate,
    genre: book.genre,
    rating: book.rating,
    ratings_count: book.ratingsCount,
    publisher: book.publisher,
    source: book.source,
    created_at: new Date().toISOString(),
  };

  db.books = [...db.books, newBook];

  return mapMockBookToAppBook(newBook);
};

export const toggleBookAvailability = async (
  id: string,
  available: boolean,
): Promise<void> => {
  const books = db.books;
  const index = books.findIndex(b => b.id === id);
  if (index !== -1) {
    books[index] = { ...books[index], available };
    db.books = books;
  }
};

export const deleteBook = async (id: string): Promise<void> => {
  db.books = db.books.filter(b => b.id !== id);
};

export const getAvailableBooks = async (
  searchQuery?: string,
): Promise<AppBook[]> => {
  let books = db.books.filter(b => b.available);

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    books = books.filter(b => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q));
  }

  return books.map(mapMockBookToAppBook);
};

export const getBookById = async (
  id: string,
): Promise<AppBook & { owner: any }> => {
  const book = db.books.find(b => b.id === id);
  if (!book) throw new Error("Book not found");

  const owner = db.users.find(u => u.id === book.owner_id);

  return {
    ...mapMockBookToAppBook(book),
    owner,
  };
};

export const toggleWishlistItem = async (userId: string, bookId: string) => {
  const wishlist = db.wishlist || [];
  const existingIndex = wishlist.findIndex(item => 
    item.user_id === userId && item.book_id === bookId
  );
  
  if (existingIndex >= 0) {
    // Remove from wishlist
    wishlist.splice(existingIndex, 1);
  } else {
    // Add to wishlist
    wishlist.push({
      id: db.generateId(),
      user_id: userId,
      book_id: bookId,
      added_at: new Date().toISOString()
    });
  }
  
  db.wishlist = wishlist;
  return wishlist;
};

export const getUserWishlist = async (userId: string) => {
  const wishlistItems = (db.wishlist || []).filter(item => item.user_id === userId);
  const bookIds = wishlistItems.map(item => item.book_id);
  const userWishlistBooks = db.books.filter(book => bookIds.includes(book.id));
  return userWishlistBooks.map(mapMockBookToAppBook);
};
