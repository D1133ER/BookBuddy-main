import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getAvailableBooks,
  getUserBooks,
  addBook,
  deleteBook,
  toggleBookAvailability,
  getBookById,
  getUserWishlist,
  toggleWishlistItem,
} from '@/services';
import { Book } from '@/types/book';

export const useAvailableBooks = (searchQuery?: string) => {
  return useQuery({
    queryKey: ['books', 'available', searchQuery],
    queryFn: () => getAvailableBooks(searchQuery),
  });
};

export const useUserBooks = () => {
  return useQuery({
    queryKey: ['books', 'user'],
    queryFn: () => getUserBooks(),
  });
};

export const useBook = (id: string) => {
  return useQuery({
    queryKey: ['books', id],
    queryFn: () => getBookById(id),
    enabled: !!id,
  });
};

export const useAddBookMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (book: Omit<Book, 'id'>) => addBook(book),
    onMutate: async (newBook) => {
      await queryClient.cancelQueries({ queryKey: ['books'] });
      const previousBooks = queryClient.getQueryData(['books', 'user']);

      const tempBook: Book = {
        ...newBook,
        id: `temp-${Date.now()}`,
        owner_id: '',
      };

      queryClient.setQueryData(['books', 'user'], (old: Book[] = []) => [...old, tempBook]);

      return { previousBooks };
    },
    onError: (_err, _newBook, context) => {
      queryClient.setQueryData(['books', 'user'], context?.previousBooks);
      toast.error('Failed to add book', { description: 'Please try again.' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast.success('Book added successfully');
    },
  });
};

export const useDeleteBookMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBook(id),
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ['books'] });
      const previousBooks = queryClient.getQueryData(['books', 'user']);

      queryClient.setQueryData(['books', 'user'], (old: Book[] = []) =>
        old.filter((b) => b.id !== deletedId),
      );

      return { previousBooks };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(['books', 'user'], context?.previousBooks);
      toast.error('Failed to delete book', { description: 'Please try again.' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
};

export const useToggleAvailabilityMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, available }: { id: string; available: boolean }) =>
      toggleBookAvailability(id, available),
    onMutate: async ({ id, available }) => {
      await queryClient.cancelQueries({ queryKey: ['books'] });
      const previousBooks = queryClient.getQueryData(['books', 'user']);

      queryClient.setQueryData(['books', 'user'], (old: Book[] = []) =>
        old.map((b) => (b.id === id ? { ...b, available } : b)),
      );

      queryClient.setQueryData(['books', 'available'], (old: Book[] = []) =>
        old.map((b) => (b.id === id ? { ...b, available } : b)),
      );

      return { previousBooks };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(['books', 'user'], context?.previousBooks);
      toast.error('Failed to update availability');
    },
    onSuccess: (_, { available }) => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast.success(available ? 'Book is now available' : 'Book lending paused');
    },
  });
};

export const useUserWishlist = (userId: string) => {
  return useQuery({
    queryKey: ['wishlist', userId],
    queryFn: () => getUserWishlist(userId),
    enabled: !!userId,
  });
};

export const useToggleWishlistMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, bookId }: { userId: string; bookId: string }) =>
      toggleWishlistItem(userId, bookId),
    onMutate: async ({ userId, bookId }) => {
      await queryClient.cancelQueries({ queryKey: ['wishlist', userId] });
      const previousWishlist = queryClient.getQueryData(['wishlist', userId]);

      queryClient.setQueryData(['wishlist', userId], (old: Book[] = []) => {
        const isWishlisted = old.some((b) => b.id === bookId);
        if (isWishlisted) {
          return old.filter((b) => b.id !== bookId);
        }
        return old;
      });

      return { previousWishlist };
    },
    onError: (_err, { userId }, context) => {
      queryClient.setQueryData(['wishlist', userId], context?.previousWishlist);
      toast.error('Failed to update wishlist');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });
};
