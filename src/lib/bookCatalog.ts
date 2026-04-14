import { Book, BorrowedBook } from "@/types/book";
import { createBookCoverDataUri } from "@/lib/bookCovers";

export interface CatalogBook extends Book {
  ratingsCount?: number;
  source?: string;
}

export interface PopularBookMetric {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  transactions: number;
  maxTransactions: number;
  genre?: string;
}

export interface RecentTransactionMetric {
  id: string;
  user: {
    name: string;
    avatar?: string;
  };
  book: string;
  type: "borrow" | "lend" | "return";
  status: "pending" | "active" | "completed" | "cancelled";
  date: string;
}

export interface DemoTransaction {
  id: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  book: {
    id: string;
    title: string;
    author: string;
    coverImage: string;
    condition: number;
    genre?: string;
    rating?: number;
  };
  type: "borrow" | "lend" | "return";
  status: "pending" | "active" | "completed" | "cancelled";
  date: string;
  dueDate?: string;
  notes?: string;
}

export interface DemoConversation {
  id: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  lastMessage: {
    text: string;
    timestamp: string;
    isRead: boolean;
  };
  messages: {
    id: string;
    senderId: string;
    text: string;
    timestamp: string;
  }[];
}

const sourceNote = (source: string) => source;

export const realBookCatalog: CatalogBook[] = [
  {
    id: "book-1",
    title: "Sapiens",
    author: "Yuval Noah Harari",
    coverImage: createBookCoverDataUri({
      title: "Sapiens",
      author: "Yuval Noah Harari",
      category: "History",
      paletteIndex: 0,
    }),
    condition: 5,
    available: true,
    description:
      "Harari traces the history of humankind from the Stone Age through the modern era, drawing on biology, anthropology, and economics to explain how Homo sapiens shaped the world.",
    isbn: "9780062316097",
    publicationDate: "2015-02-10",
    genre: "Science / History / Non-fiction",
    publisher: "Harper",
    owner_id: "user-1",
    source: sourceNote("Google Books API"),
  },
  {
    id: "book-2",
    title: "The Midnight Library",
    author: "Matt Haig",
    coverImage: createBookCoverDataUri({
      title: "The Midnight Library",
      author: "Matt Haig",
      category: "Fiction",
      paletteIndex: 2,
    }),
    condition: 4,
    available: true,
    description:
      "Nora Seed discovers a library between life and death where each book lets her explore a different version of the life she might have lived.",
    isbn: "9781443455886",
    publicationDate: "2020-09-29",
    genre: "Fiction / Contemporary",
    rating: 5,
    ratingsCount: 1,
    publisher: "HarperCollins",
    owner_id: "user-2",
    source: sourceNote("Google Books API"),
  },
  {
    id: "book-3",
    title: "Atomic Habits",
    author: "James Clear",
    coverImage: createBookCoverDataUri({
      title: "Atomic Habits",
      author: "James Clear",
      category: "Self Help",
      paletteIndex: 4,
    }),
    condition: 5,
    available: true,
    description:
      "Clear presents a practical framework for building good habits and breaking bad ones through small, repeatable improvements.",
    isbn: "9780735211292",
    publicationDate: "2018-10-16",
    genre: "Non-fiction / Self-help / Business",
    publisher: "Avery",
    owner_id: "user-3",
    source: sourceNote("Open Library API"),
  },
  {
    id: "book-4",
    title: "Educated",
    author: "Tara Westover",
    coverImage: createBookCoverDataUri({
      title: "Educated",
      author: "Tara Westover",
      category: "Memoir",
      paletteIndex: 3,
    }),
    condition: 4,
    available: true,
    description:
      "Westover recounts growing up in a survivalist family in rural Idaho and how education became her path into a wider world.",
    isbn: "9780399590504",
    publicationDate: "2018-02-20",
    genre: "Biography / Memoir / Non-fiction",
    publisher: "Random House",
    owner_id: "user-1",
    source: sourceNote("Open Library API"),
  },
  {
    id: "book-5",
    title: "Project Hail Mary",
    author: "Andy Weir",
    coverImage: createBookCoverDataUri({
      title: "Project Hail Mary",
      author: "Andy Weir",
      category: "Sci Fi",
      paletteIndex: 1,
    }),
    condition: 5,
    available: false,
    description:
      "A lone astronaut wakes up far from Earth and must solve a scientific mystery to stop an extinction-level threat.",
    isbn: "9780593135204",
    publicationDate: "2021-05-04",
    genre: "Science Fiction / Adventure",
    publisher: "Ballantine Books",
    owner_id: "user-2",
    source: sourceNote("Open Library API"),
  },
  {
    id: "book-6",
    title: "The Vanishing Half",
    author: "Brit Bennett",
    coverImage: createBookCoverDataUri({
      title: "The Vanishing Half",
      author: "Brit Bennett",
      category: "Literary",
      paletteIndex: 5,
    }),
    condition: 4,
    available: true,
    description:
      "Twin sisters choose radically different lives, forcing the novel to explore identity, family, race, and reinvention across decades.",
    isbn: "9780525536291",
    publicationDate: "2020-06-02",
    genre: "Fiction / Literary Fiction",
    publisher: "Riverhead Books",
    owner_id: "user-3",
    source: sourceNote("Open Library API"),
  },
  {
    id: "book-7",
    title: "The Seven Husbands of Evelyn Hugo",
    author: "Taylor Jenkins Reid",
    coverImage: createBookCoverDataUri({
      title: "The Seven Husbands of Evelyn Hugo",
      author: "Taylor Jenkins Reid",
      category: "Historical",
      paletteIndex: 6,
    }),
    condition: 4,
    available: true,
    description:
      "An aging Hollywood legend finally reveals the truth behind her fame, ambition, and greatest love to an unexpected journalist.",
    isbn: "9781501139231",
    publicationDate: "2017-06-13",
    genre: "Fiction / Historical Fiction / Romance",
    publisher: "Atria Books",
    owner_id: "user-1",
    source: sourceNote("Open Library API"),
  },
  {
    id: "book-8",
    title: "The Shining",
    author: "Stephen King",
    coverImage: createBookCoverDataUri({
      title: "The Shining",
      author: "Stephen King",
      category: "Horror",
      paletteIndex: 7,
    }),
    condition: 3,
    available: false,
    description:
      "Jack Torrance takes a caretaker job at the isolated Overlook Hotel, where the building's evil influence begins to consume his family.",
    isbn: "9780307743657",
    publicationDate: "2012-06-26",
    genre: "Fiction / Horror",
    rating: 4,
    ratingsCount: 3,
    publisher: "Vintage",
    owner_id: "user-2",
    source: sourceNote("Google Books API"),
  },
];

export const getCatalogBookById = (id: string, books: CatalogBook[] = realBookCatalog) =>
  books.find((book) => book.id === id);

export const getCatalogBooksByIds = (ids: string[], books: CatalogBook[] = realBookCatalog) =>
  ids
    .map((id) => getCatalogBookById(id, books))
    .filter((book): book is CatalogBook => Boolean(book));

export const createFeaturedBooks = (books: CatalogBook[] = realBookCatalog) => books.slice(0, 6);
export const featuredBooks = createFeaturedBooks(realBookCatalog);

export const createProfileOwnedBooks = (books: CatalogBook[] = realBookCatalog) =>
  getCatalogBooksByIds(["book-1", "book-3", "book-5", "book-7"], books);

export const profileOwnedBooks = createProfileOwnedBooks(realBookCatalog);

export const createProfileBorrowedBooks = (books: CatalogBook[] = realBookCatalog) =>
  getCatalogBooksByIds(["book-2", "book-8"], books).map((book) => ({
    ...book,
    available: false,
  }));

export const profileBorrowedBooks = createProfileBorrowedBooks(realBookCatalog);

export const createDemoBorrowedBooks = (
  books: CatalogBook[] = realBookCatalog,
): BorrowedBook[] => {
  const [projectHailMary, midnightLibrary] = getCatalogBooksByIds(["book-5", "book-2"], books);

  return [
    {
      ...projectHailMary,
      borrowedFrom: "Maya Chen",
      dueDate: "2026-05-02",
      available: false,
    },
    {
      ...midnightLibrary,
      borrowedFrom: "Jordan Brooks",
      dueDate: "2026-05-18",
      available: false,
    },
  ];
};

export const demoBorrowedBooks = createDemoBorrowedBooks(realBookCatalog);

export const createDashboardPopularBooks = (
  books: CatalogBook[] = realBookCatalog,
): PopularBookMetric[] => {
  const [projectHailMary, evelynHugo, atomicHabits, midnightLibrary] = getCatalogBooksByIds(
    ["book-5", "book-7", "book-3", "book-2"],
    books,
  );

  return [
    {
      id: "popular-1",
      title: projectHailMary.title,
      author: projectHailMary.author,
      coverImage: projectHailMary.coverImage,
      genre: projectHailMary.genre,
      transactions: 48,
      maxTransactions: 60,
    },
    {
      id: "popular-2",
      title: evelynHugo.title,
      author: evelynHugo.author,
      coverImage: evelynHugo.coverImage,
      genre: evelynHugo.genre,
      transactions: 44,
      maxTransactions: 60,
    },
    {
      id: "popular-3",
      title: atomicHabits.title,
      author: atomicHabits.author,
      coverImage: atomicHabits.coverImage,
      genre: atomicHabits.genre,
      transactions: 41,
      maxTransactions: 60,
    },
    {
      id: "popular-4",
      title: midnightLibrary.title,
      author: midnightLibrary.author,
      coverImage: midnightLibrary.coverImage,
      genre: midnightLibrary.genre,
      transactions: 37,
      maxTransactions: 60,
    },
  ];
};

export const dashboardPopularBooks = createDashboardPopularBooks(realBookCatalog);

export const createDashboardRecentTransactions = (
  books: CatalogBook[] = realBookCatalog,
): RecentTransactionMetric[] => {
  const [projectHailMary, evelynHugo, atomicHabits, sapiens] = getCatalogBooksByIds(
    ["book-5", "book-7", "book-3", "book-1"],
    books,
  );

  return [
    {
      id: "recent-1",
      user: { name: "Maya Chen", avatar: "maya" },
      book: projectHailMary.title,
      type: "borrow",
      status: "active",
      date: "2026-04-12",
    },
    {
      id: "recent-2",
      user: { name: "Jordan Brooks", avatar: "jordan" },
      book: evelynHugo.title,
      type: "lend",
      status: "completed",
      date: "2026-04-10",
    },
    {
      id: "recent-3",
      user: { name: "Avery Singh", avatar: "avery" },
      book: atomicHabits.title,
      type: "borrow",
      status: "pending",
      date: "2026-04-09",
    },
    {
      id: "recent-4",
      user: { name: "Priya Nair", avatar: "priya" },
      book: sapiens.title,
      type: "return",
      status: "completed",
      date: "2026-04-06",
    },
  ];
};

export const dashboardRecentTransactions = createDashboardRecentTransactions(realBookCatalog);

export const createDemoTransactions = (
  books: CatalogBook[] = realBookCatalog,
): DemoTransaction[] => {
  const [projectHailMary, midnightLibrary, shining] = getCatalogBooksByIds(
    ["book-5", "book-2", "book-8"],
    books,
  );

  return [
    {
      id: "tx-1",
      user: { id: "user-2", name: "Maya Chen", avatar: "maya" },
      book: {
        id: projectHailMary.id,
        title: projectHailMary.title,
        author: projectHailMary.author,
        coverImage: projectHailMary.coverImage,
        condition: projectHailMary.condition,
        genre: projectHailMary.genre,
        rating: projectHailMary.rating,
      },
      type: "lend",
      status: "pending",
      date: "2026-04-11",
      notes:
        "Could I borrow this for my science fiction book club next weekend? I can return it in two weeks.",
    },
    {
      id: "tx-2",
      user: { id: "user-3", name: "Jordan Brooks", avatar: "jordan" },
      book: {
        id: midnightLibrary.id,
        title: midnightLibrary.title,
        author: midnightLibrary.author,
        coverImage: midnightLibrary.coverImage,
        condition: midnightLibrary.condition,
        genre: midnightLibrary.genre,
        rating: midnightLibrary.rating,
      },
      type: "borrow",
      status: "active",
      date: "2026-04-08",
      dueDate: "2026-04-22",
      notes: "This one is for my office book circle. I'll keep the cover protected.",
    },
    {
      id: "tx-3",
      user: { id: "user-4", name: "Avery Singh", avatar: "avery" },
      book: {
        id: shining.id,
        title: shining.title,
        author: shining.author,
        coverImage: shining.coverImage,
        condition: shining.condition,
        genre: shining.genre,
        rating: shining.rating,
      },
      type: "borrow",
      status: "completed",
      date: "2026-03-28",
      notes: "Thanks again. Returning this at tomorrow's meetup.",
    },
  ];
};

export const demoTransactions = createDemoTransactions(realBookCatalog);

export const createDemoConversations = (
  books: CatalogBook[] = realBookCatalog,
): DemoConversation[] => {
  const [projectHailMary, midnightLibrary] = getCatalogBooksByIds(["book-5", "book-2"], books);

  return [
    {
      id: "conv-1",
      user: {
        id: "user-2",
        name: "Maya Chen",
        avatar: "maya",
      },
      lastMessage: {
        text: `I can pick up ${projectHailMary.title} after work tomorrow if that suits you.`,
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        isRead: false,
      },
      messages: [
        {
          id: "msg-1",
          senderId: "user-2",
          text: `Hi, I'd love to borrow ${projectHailMary.title} for our club's May read.`,
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "msg-2",
          senderId: "current-user",
          text: "That works. I can lend it for two weeks if you need a bit of extra time.",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "msg-3",
          senderId: "user-2",
          text: `I can pick up ${projectHailMary.title} after work tomorrow if that suits you.`,
          timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        },
      ],
    },
    {
      id: "conv-2",
      user: {
        id: "user-3",
        name: "Jordan Brooks",
        avatar: "jordan",
      },
      lastMessage: {
        text: `Finished ${midnightLibrary.title}. The ending stayed with me all week.`,
        timestamp: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
        isRead: true,
      },
      messages: [
        {
          id: "msg-4",
          senderId: "current-user",
          text: `Hope you're enjoying ${midnightLibrary.title}.`,
          timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "msg-5",
          senderId: "user-3",
          text: "Absolutely. I love the premise and pacing.",
          timestamp: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "msg-6",
          senderId: "user-3",
          text: `Finished ${midnightLibrary.title}. The ending stayed with me all week.`,
          timestamp: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
        },
      ],
    },
  ];
};

export const demoConversations = createDemoConversations(realBookCatalog);

export const getCatalogAverageRating = (books: CatalogBook[] = realBookCatalog) => {
  const ratings = books
    .map((book) => book.rating)
    .filter((rating): rating is number => typeof rating === "number");

  if (ratings.length === 0) {
    return undefined;
  }

  const average = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  return Number(average.toFixed(1));
};