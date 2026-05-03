import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  type CatalogBook,
  createDashboardPopularBooks,
  createDashboardRecentTransactions,
  createDemoBorrowedBooks,
  createDemoConversations,
  createDemoTransactions,
  createFeaturedBooks,
  createProfileBorrowedBooks,
  createProfileOwnedBooks,
  getCatalogAverageRating,
} from '@/lib/bookCatalog';
import { getAvailableBooks } from '@/services';

export function useCatalogData() {
  const {
    data: books = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['books', 'all'],
    queryFn: () => getAvailableBooks(),
  });

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
    error: error ? (error as Error).message : null,
  };
}

export interface SearchFilters {
  searchTerm: string;
  genres: string[];
  availability: boolean | null;
  condition: number | null;
  sortBy: 'title' | 'author' | 'rating' | 'dateAdded';
}

export const useAdvancedCatalogSearch = (books: CatalogBook[]) => {
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
    genres: [],
    availability: null,
    condition: null,
    sortBy: 'title',
  });

  const filteredBooks = useMemo(() => {
    return books
      .filter((book) => {
        // Search term filter
        if (
          filters.searchTerm &&
          !book.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
          !book.author.toLowerCase().includes(filters.searchTerm.toLowerCase())
        ) {
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
        if (
          filters.genres.length > 0 &&
          (!book.genre || !filters.genres.some((genre) => book.genre!.includes(genre)))
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case 'title':
            return a.title.localeCompare(b.title);
          case 'author':
            return a.author.localeCompare(b.author);
          case 'rating':
            return (b.rating || 0) - (a.rating || 0);
          case 'dateAdded':
            return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
          default:
            return 0;
        }
      });
  }, [books, filters]);

  return {
    filteredBooks,
    filters,
    setFilters,
    totalResults: filteredBooks.length,
  };
};
