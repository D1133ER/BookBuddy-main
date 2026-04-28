import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getTransactions, requestBook, updateTransactionStatus } from '@/services';

export { useToggleWishlistMutation } from './useBooks';

export const useUserTransactions = (userId: string, type?: 'lender' | 'borrower') => {
  return useQuery({
    queryKey: ['transactions', userId, type],
    queryFn: () => getTransactions({ userId, type }),
    enabled: !!userId,
  });
};

export const useRequestBookMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookId: string) => requestBook(bookId),
    onMutate: async (_bookId) => {
      await queryClient.cancelQueries({ queryKey: ['transactions'] });
      const previousTransactions = queryClient.getQueryData(['transactions']);

      toast.loading('Sending request...', { id: 'request-toast' });

      return { previousTransactions };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(['transactions'], context?.previousTransactions);
      toast.error('Request failed', { id: 'request-toast' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast.success('Request sent!', { id: 'request-toast' });
    },
  });
};

export const useUpdateTransactionStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateTransactionStatus(id, status),
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: ['transactions'] });
      const previousTransactions = queryClient.getQueryData(['transactions']);

      queryClient.setQueryData(['transactions'], (old: any[] = []) =>
        old.map((t) => (t.id === vars.id ? { ...t, status: vars.status } : t)),
      );

      toast.loading('Updating...', { id: 'status-toast' });

      return { previousTransactions };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(['transactions'], context?.previousTransactions);
      toast.error('Update failed', { id: 'status-toast' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast.success('Status updated!', { id: 'status-toast' });
    },
  });
};
