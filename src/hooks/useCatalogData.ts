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

export interface SearchFilters {
  searchTerm: string;
  genres: string[];
  availability: boolean | null;
  condition: number | null;
  sortBy: "title" | "author" | "rating" | "dateAdded";
}

export const useAdvancedCatalogSearch = (books: CatalogBook[]) => {
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: "",
    genres: [],
    availability: null,
    condition: null,
    sortBy: "title"
  });

  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      // Search term filter
      if (filters.searchTerm && 
          !book.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
          !book.author.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
        return false;
      }
      
      // Availability filter
      if (filters.availability !== null && book.available !== filters.availability) {
        return false;
      }
      
      // Condition filter
      if (filters.condition !== null && book.condition < filters.condition) {
        return false;
      }
      
      // Genre filter
      if (filters.genres.length > 0 && 
          (!book.genre || !filters.genres.some(genre => book.genre!.includes(genre)))) {
        return false;
      }
      
      return true;
    }).sort((a, b) => {
      switch (filters.sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "author":
          return a.author.localeCompare(b.author);
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "dateAdded":
          return new Date(b.publicationDate || "").getTime() - new Date(a.publicationDate || "").getTime();
        default:
          return 0;
      }
    });
  }, [books, filters]);

  return { filteredBooks, filters, setFilters };
};