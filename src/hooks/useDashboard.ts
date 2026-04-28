import { useQuery } from '@tanstack/react-query';
import { getTransactions, getConversations, getUserStats } from '@/services';

export const useDashboardStats = (userId: string) => {
  return useQuery({
    queryKey: ['dashboard', 'stats', userId],
    queryFn: () => getUserStats(userId),
    enabled: !!userId,
  });
};

export const useDashboardTransactions = (userId: string) => {
  return useQuery({
    queryKey: ['dashboard', 'transactions', userId],
    queryFn: () => getTransactions({ userId }),
    enabled: !!userId,
  });
};

export const useDashboardAllTransactions = () => {
  return useQuery({
    queryKey: ['dashboard', 'transactions', 'all'],
    queryFn: () => getTransactions({ userId: '' }),
  });
};

export const useDashboardConversations = (userId: string) => {
  return useQuery({
    queryKey: ['dashboard', 'conversations', userId],
    queryFn: () => getConversations(),
    enabled: !!userId,
  });
};
