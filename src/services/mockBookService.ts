import { db, type User } from '@/lib/mockDb';
import { DEFAULT_BOOK_COVER, mapMockBookToAppBook } from '@/lib/mockDbSeed';
import type { Book as AppBook } from '@/types/book';

// Note: Book type from mockDb is slightly different from AppBook, we map it.
type MockBook = Awaited<ReturnType<typeof db.getBooks>>[0];

export const getUserBooks = async (): Promise<AppBook[]> => {
  const session = await db.getSession();
  const userId = session?.user?.id;
  if (!userId) return [];

  const books = (await db.getBooks())
    .filter((b) => b.owner_id === userId)
    .sort((a, b) => (a.created_at && b.created_at && a.created_at < b.created_at ? 1 : -1));

  return books.map(mapMockBookToAppBook);
};

export const addBook = async (book: Omit<AppBook, 'id'>): Promise<AppBook> => {
  const session = await db.getSession();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error('User not authenticated');
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

  const books = await db.getBooks();
  await db.setBooks([...books, newBook]);

  return mapMockBookToAppBook(newBook);
};

export const toggleBookAvailability = async (id: string, available: boolean): Promise<void> => {
  const books = await db.getBooks();
  const index = books.findIndex((b) => b.id === id);
  if (index !== -1) {
    books[index] = { ...books[index], available };
    await db.setBooks(books);
  }
};

export const deleteBook = async (id: string): Promise<void> => {
  const books = await db.getBooks();
  await db.setBooks(books.filter((b) => b.id !== id));
};

export const getAvailableBooks = async (searchQuery?: string): Promise<AppBook[]> => {
  let books = (await db.getBooks()).filter((b) => b.available);

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    books = books.filter(
      (b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q),
    );
  }

  return books.map(mapMockBookToAppBook);
};

export const getBookById = async (id: string): Promise<AppBook & { owner: User | undefined }> => {
  const books = await db.getBooks();
  const book = books.find((b) => b.id === id);
  if (!book) throw new Error('Book not found');

  const users = await db.getUsers();
  const owner = users.find((u) => u.id === book.owner_id);

  return {
    ...mapMockBookToAppBook(book),
    owner,
  };
};

export const getUserWishlist = async (userId: string) => {
  const wishlist = (await db.getWishlist()) || [];
  const wishlistItems = wishlist.filter((item) => item.user_id === userId);
  const bookIds = wishlistItems.map((item) => item.book_id);
  const books = await db.getBooks();
  const userWishlistBooks = books.filter((book) => bookIds.includes(book.id));
  return userWishlistBooks.map(mapMockBookToAppBook);
};

export const toggleWishlistItem = async (userId: string, bookId: string) => {
  const wishlist = (await db.getWishlist()) || [];
  const existingIndex = wishlist.findIndex(
    (item) => item.user_id === userId && item.book_id === bookId,
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
      added_at: new Date().toISOString(),
    });
  }

  await db.setWishlist(wishlist);
  return wishlist;
};

export const getSmartSwapMatches = async (userId: string): Promise<AppBook[]> => {
  const wishlist = await getUserWishlist(userId);
  if (wishlist.length === 0) return [];

  // Find books that the user wants, are available, and owned by others
  const allAvailableBooks = await getAvailableBooks();
  const matches = allAvailableBooks.filter((book: AppBook) =>
    wishlist.some((wish: AppBook) => wish.id === book.id),
  );

  return matches;
};
