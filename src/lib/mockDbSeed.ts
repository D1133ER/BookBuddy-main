import { CatalogBook, realBookCatalog } from "@/lib/bookCatalog";
import {
  Book as MockBook,
  Message as MockMessage,
  Review as MockReview,
  Transaction as MockTransaction,
  User as MockUser,
  db,
} from "@/lib/mockDb";
import { Book as AppBook } from "@/types/book";

const SEED_VERSION_KEY = "bookbuddy.seed.version";
const SEED_VERSION = "2026-04-14.2";

export const DEFAULT_BOOK_COVER = "/placeholder-book-cover.svg";

const communityUsers: MockUser[] = [
  {
    id: "user-1",
    username: "maya.chen",
    email: "maya@bookbuddy.local",
    display_name: "Maya Chen",
    avatar_url: "",
    location: "Queenstown Reading Circle",
    bio: "Organizes Sunday sidewalk pickups and keeps a strong nonfiction shelf in circulation.",
    created_at: "2025-10-03T10:00:00.000Z",
  },
  {
    id: "user-2",
    username: "jordan.brooks",
    email: "jordan@bookbuddy.local",
    display_name: "Jordan Brooks",
    avatar_url: "",
    location: "Bishan Exchange Hub",
    bio: "Shares contemporary fiction and usually replies within a day to borrowing requests.",
    created_at: "2025-11-18T09:30:00.000Z",
  },
  {
    id: "user-3",
    username: "aisha.bello",
    email: "aisha@bookbuddy.local",
    display_name: "Aisha Bello",
    avatar_url: "",
    location: "Tiong Bahru Book Loop",
    bio: "Rotates business, self-improvement, and memoir titles with flexible pickup windows.",
    created_at: "2025-12-07T14:15:00.000Z",
  },
  {
    id: "user-4",
    username: "theo.alvarez",
    email: "theo@bookbuddy.local",
    display_name: "Theo Alvarez",
    avatar_url: "",
    location: "Jurong Community Shelf",
    bio: "Coordinates neighborhood drop-offs for longer science-fiction and thriller reads.",
    created_at: "2026-01-09T11:45:00.000Z",
  },
];

const communityTransactions: MockTransaction[] = [
  {
    id: "tx-community-1",
    book_id: "book-5",
    borrower_id: "user-3",
    lender_id: "user-2",
    status: "active",
    request_date: "2026-03-28T10:00:00.000Z",
    approval_date: "2026-03-29T08:30:00.000Z",
    due_date: "2026-04-22T12:00:00.000Z",
    notes: "Can pick this up after work near the MRT.",
    created_at: "2026-03-28T10:00:00.000Z",
  },
  {
    id: "tx-community-2",
    book_id: "book-2",
    borrower_id: "user-1",
    lender_id: "user-2",
    status: "completed",
    request_date: "2026-02-10T09:00:00.000Z",
    approval_date: "2026-02-10T18:00:00.000Z",
    return_date: "2026-03-05T16:00:00.000Z",
    due_date: "2026-03-07T12:00:00.000Z",
    notes: "Happy to swap this for a weekend pickup.",
    created_at: "2026-02-10T09:00:00.000Z",
  },
];

const communityMessages: MockMessage[] = [
  {
    id: "msg-community-1",
    sender_id: "user-3",
    recipient_id: "user-2",
    content: 'Hi Jordan, could I borrow "Project Hail Mary" this week?',
    is_read: true,
    created_at: "2026-03-28T10:02:00.000Z",
  },
  {
    id: "msg-community-2",
    sender_id: "user-2",
    recipient_id: "user-3",
    content: "Yes, approved. I can meet after 6pm on Tuesday near Bishan MRT.",
    is_read: true,
    created_at: "2026-03-29T08:35:00.000Z",
  },
  {
    id: "msg-community-3",
    sender_id: "user-1",
    recipient_id: "user-2",
    content: 'Thanks again for lending "The Midnight Library". I can return it this Friday.',
    is_read: true,
    created_at: "2026-03-03T13:10:00.000Z",
  },
];

const communityReviews: MockReview[] = [
  {
    id: "review-community-1",
    transaction_id: "tx-community-2",
    reviewer_id: "user-1",
    reviewee_id: "user-2",
    rating: 5,
    comment: "Fast replies and a smooth handoff.",
    created_at: "2026-03-05T18:00:00.000Z",
  },
  {
    id: "review-community-2",
    transaction_id: "tx-community-2",
    reviewer_id: "user-2",
    reviewee_id: "user-1",
    rating: 5,
    comment: "Returned the book in great condition.",
    created_at: "2026-03-05T18:05:00.000Z",
  },
];

const seededBookIds = new Set(realBookCatalog.map((book) => book.id));

const mergeById = <T extends { id: string }>(existing: T[], seeded: T[]) => {
  const seededMap = new Map(seeded.map((entry) => [entry.id, entry]));

  const mergedExisting = existing.map((entry) => {
    const seed = seededMap.get(entry.id);
    return seed ? { ...seed, ...entry } : entry;
  });

  const missingSeededEntries = seeded.filter(
    (entry) => !existing.some((existingEntry) => existingEntry.id === entry.id),
  );

  return [...mergedExisting, ...missingSeededEntries];
};

const mergeSeededBooks = (existing: MockBook[], seeded: MockBook[], shouldRefreshSeededBooks: boolean) => {
  const seededMap = new Map(seeded.map((book) => [book.id, book]));

  const mergedExisting = existing.map((book) => {
    const seededBook = seededMap.get(book.id);
    if (!seededBook) {
      return book;
    }

    if (!shouldRefreshSeededBooks) {
      return { ...seededBook, ...book };
    }

    return {
      ...seededBook,
      available: book.available,
      created_at: book.created_at || seededBook.created_at,
    };
  });

  const missingSeededBooks = seeded.filter((book) => !existing.some((existingBook) => existingBook.id === book.id));

  return [...mergedExisting, ...missingSeededBooks];
};

export const mapCatalogBookToMockBook = (book: CatalogBook): MockBook => ({
  id: book.id,
  title: book.title,
  author: book.author,
  description: book.description,
  cover_image: book.coverImage || DEFAULT_BOOK_COVER,
  condition: book.condition,
  available: book.available,
  owner_id: book.owner_id || "user-1",
  isbn: book.isbn,
  publication_date: book.publicationDate,
  genre: book.genre,
  rating: book.rating,
  ratings_count: book.ratingsCount,
  publisher: book.publisher,
  source: book.source,
  created_at: "2026-01-01T09:00:00.000Z",
});

export const mapMockBookToCatalogBook = (book: MockBook): CatalogBook => ({
  id: book.id,
  title: book.title,
  author: book.author,
  description: book.description,
  coverImage: book.cover_image || DEFAULT_BOOK_COVER,
  condition: book.condition,
  available: book.available,
  owner_id: book.owner_id,
  isbn: book.isbn,
  publicationDate: book.publication_date,
  genre: book.genre,
  rating: book.rating,
  ratingsCount: book.ratings_count,
  publisher: book.publisher,
  source: book.source,
  createdAt: book.created_at,
});

export const mapMockBookToAppBook = (book: MockBook): AppBook => ({
  id: book.id,
  title: book.title,
  author: book.author,
  description: book.description,
  coverImage: book.cover_image || DEFAULT_BOOK_COVER,
  condition: book.condition,
  available: book.available,
  owner_id: book.owner_id,
  isbn: book.isbn,
  publicationDate: book.publication_date,
  genre: book.genre,
  rating: book.rating,
  ratingsCount: book.ratings_count,
  publisher: book.publisher,
  source: book.source,
});

export const ensureMockDbSeeded = () => {
  if (typeof window === "undefined") {
    return;
  }

  const previousSeedVersion = localStorage.getItem(SEED_VERSION_KEY);
  const shouldRefreshSeededBooks = previousSeedVersion !== SEED_VERSION;
  const seededBooks = realBookCatalog.map(mapCatalogBookToMockBook);
  const mergedUsers = mergeById(db.users, communityUsers);
  const mergedBooks = mergeSeededBooks(db.books, seededBooks, shouldRefreshSeededBooks);
  const mergedTransactions = mergeById(db.transactions, communityTransactions);
  const mergedMessages = mergeById(db.messages, communityMessages);
  const mergedReviews = mergeById(db.reviews, communityReviews);

  if (mergedUsers.length !== db.users.length) {
    db.users = mergedUsers;
  }

  if (
    mergedBooks.length !== db.books.length ||
    (shouldRefreshSeededBooks && db.books.some((book) => seededBookIds.has(book.id)))
  ) {
    db.books = mergedBooks;
  }

  if (mergedTransactions.length !== db.transactions.length) {
    db.transactions = mergedTransactions;
  }

  if (mergedMessages.length !== db.messages.length) {
    db.messages = mergedMessages;
  }

  if (mergedReviews.length !== db.reviews.length) {
    db.reviews = mergedReviews;
  }

  localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION);
};