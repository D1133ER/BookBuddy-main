import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CatalogBook,
  createDashboardPopularBooks,
  createDashboardRecentTransactions,
  createDemoBorrowedBooks,
  createDemoConversations,
  createDemoTransactions,
  createFeaturedBooks,
  createProfileBorrowedBooks,
  createProfileOwnedBooks,
  getCatalogAverageRating,
  realBookCatalog,
} from "@/lib/bookCatalog";
import { MOCK_DB_CHANGE_EVENT, db } from "@/lib/mockDb";
import { mapMockBookToCatalogBook } from "@/lib/mockDbSeed";

const readCatalogBooks = (): CatalogBook[] => {
  const books = db.books.map(mapMockBookToCatalogBook);
  return books.length > 0 ? books : realBookCatalog;
};

export function useCatalogData() {
  const [books, setBooks] = useState<CatalogBook[]>(() => readCatalogBooks());
  const [isLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const nextBooks = readCatalogBooks();
    setBooks(nextBooks);
    setError(null);
    return nextBooks;
  }, []);

  useEffect(() => {
    const handleDbChange = (event: Event) => {
      const detail = (event as CustomEvent<{ key?: string }>).detail;

      if (!detail?.key || ["books", "transactions", "reviews"].includes(detail.key)) {
        setBooks(readCatalogBooks());
        setError(null);
      }
    };

    window.addEventListener(MOCK_DB_CHANGE_EVENT, handleDbChange as EventListener);

    return () => {
      window.removeEventListener(MOCK_DB_CHANGE_EVENT, handleDbChange as EventListener);
    };
  }, [refresh]);

  const data = useMemo(() => {
    return {
      books,
      featuredBooks: createFeaturedBooks(books),
      profileOwnedBooks: createProfileOwnedBooks(books),
      profileBorrowedBooks: createProfileBorrowedBooks(books),
      demoBorrowedBooks: createDemoBorrowedBooks(books),
      dashboardPopularBooks: createDashboardPopularBooks(books),
      dashboardRecentTransactions: createDashboardRecentTransactions(books),
      demoTransactions: createDemoTransactions(books),
      demoConversations: createDemoConversations(books),
      averageRating: getCatalogAverageRating(books),
    };
  }, [books]);

  return {
    ...data,
    isLoading,
    error,
    refresh,
  };
}