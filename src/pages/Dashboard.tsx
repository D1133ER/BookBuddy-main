import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/layout/PageTransition';
import { BookOpen, BookPlus, TrendingUp, Users } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import PopularBooks from '@/components/dashboard/PopularBooks';
import { Skeleton } from '@/components/ui/skeleton';
import ActivityChart from '@/components/dashboard/ActivityChart';
import UserDistributionChart from '@/components/dashboard/UserDistributionChart';
import WelcomeBanner from '@/components/dashboard/WelcomeBanner';
import { useCatalogData } from '@/hooks/useCatalogData';
import { createFadeUpItem, createStaggerContainer } from '@/lib/motion';
import { useAuth } from '@/contexts/AuthContext';
import { DEFAULT_BOOK_COVER } from '@/lib/mockDbSeed';
import {
  useDashboardStats,
  useDashboardTransactions,
  useDashboardAllTransactions,
  useDashboardConversations,
  useDashboardSmartSwaps,
} from '@/hooks/useDashboard';
import BookCard from '@/components/books/BookCard';
import type { TransactionRow } from '@/services/types';

type DashboardRecentTransaction = {
  id: string;
  user: {
    name: string;
    avatar?: string;
  };
  book: string;
  type: 'borrow' | 'lend' | 'return';
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  date: string;
};

const formatStatus = (status: string): DashboardRecentTransaction['status'] => {
  if (['pending', 'active', 'completed', 'cancelled'].includes(status)) {
    return status as DashboardRecentTransaction['status'];
  }
  return 'pending';
};

const buildMonthlyActivity = (transactions: TransactionRow[], userId: string) => {
  const now = new Date();
  return Array.from({ length: 6 }).map((_, offset) => {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - (5 - offset), 1);
    const monthKey = `${monthDate.getFullYear()}-${monthDate.getMonth()}`;
    const value = transactions.filter((transaction) => {
      if (![transaction.borrower_id, transaction.lender_id].includes(userId)) {
        return false;
      }
      const sourceDate = new Date(transaction.request_date || transaction.created_at || Date.now());
      return `${sourceDate.getFullYear()}-${sourceDate.getMonth()}` === monthKey;
    }).length;

    return {
      month: monthDate.toLocaleDateString(undefined, { month: 'short' }),
      value,
    };
  });
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const shouldReduceMotion = useReducedMotion() ?? false;
  const containerVariants = createStaggerContainer(shouldReduceMotion, 0.08, 0.04);
  const itemVariants = createFadeUpItem(shouldReduceMotion, 20);

  const { books, isLoading: isLoadingCatalog } = useCatalogData();
  const { data: stats, isLoading: isLoadingStats } = useDashboardStats(user?.id || '');
  const { data: smartSwaps = [], isLoading: isLoadingSwaps } = useDashboardSmartSwaps(
    user?.id || '',
  );
  const { data: userTransactions = [], isLoading: isLoadingUserTx } = useDashboardTransactions(
    user?.id || '',
  );
  const { data: allTransactions = [], isLoading: isLoadingAllTx } = useDashboardAllTransactions();
  const { data: conversations = [], isLoading: isLoadingConversations } = useDashboardConversations(
    user?.id || '',
  );

  const isLoading =
    isLoadingCatalog ||
    isLoadingStats ||
    isLoadingSwaps ||
    isLoadingUserTx ||
    isLoadingAllTx ||
    isLoadingConversations;

  const snapshot = useMemo(() => {
    if (!user?.id) return null;

    const activeExchangeCount = userTransactions.filter((transaction) =>
      ['pending', 'active'].includes(transaction.status),
    ).length;
    const borrowedCount = userTransactions.filter(
      (transaction) => transaction.borrower_id === user.id && transaction.status === 'active',
    ).length;
    const approvedCount = userTransactions.filter((transaction) =>
      ['active', 'completed'].includes(transaction.status),
    ).length;
    const approvalRate =
      userTransactions.length > 0 ? Math.round((approvedCount / userTransactions.length) * 100) : 0;

    const recentTransactions = userTransactions
      .filter((transaction) => transaction.book)
      .slice(0, 5)
      .reduce<DashboardRecentTransaction[]>((items, transaction) => {
        const isBorrower = transaction.borrower_id === user.id;
        const otherUser = isBorrower ? transaction.lender : transaction.borrower;

        if (!otherUser || !transaction.book) return items;

        items.push({
          id: transaction.id,
          user: {
            name: otherUser.display_name || otherUser.username,
            avatar: otherUser.avatar_url || undefined,
          },
          book: transaction.book.title,
          type: transaction.status === 'completed' ? 'return' : isBorrower ? 'borrow' : 'lend',
          status: formatStatus(transaction.status),
          date: transaction.request_date || transaction.created_at || new Date().toISOString(),
        });
        return items;
      }, []);

    const popularityByBook = allTransactions.reduce<Map<string, number>>((map, transaction) => {
      map.set(transaction.book_id, (map.get(transaction.book_id) || 0) + 1);
      return map;
    }, new Map());

    const maxTransactions = Math.max(...Array.from(popularityByBook.values()), 1);
    const popularBooks = books
      .map((book) => ({
        id: book.id,
        title: book.title,
        author: book.author,
        coverImage: book.coverImage || DEFAULT_BOOK_COVER,
        transactions: popularityByBook.get(book.id) || 0,
        maxTransactions,
        genre: book.genre,
      }))
      .sort(
        (left, right) =>
          right.transactions - left.transactions || left.title.localeCompare(right.title),
      )
      .slice(0, 4);

    const statusCounts = {
      pending: userTransactions.filter((transaction) => transaction.status === 'pending').length,
      active: userTransactions.filter((transaction) => transaction.status === 'active').length,
      completed: userTransactions.filter((transaction) => transaction.status === 'completed')
        .length,
      cancelled: userTransactions.filter((transaction) => transaction.status === 'cancelled')
        .length,
    };

    return {
      userBookCount: stats?.booksShared || 0,
      borrowedCount,
      activeExchangeCount,
      conversationCount: conversations.length,
      approvalRate,
      totalExchanges: userTransactions.length,
      recentTransactions,
      popularBooks,
      activityData: buildMonthlyActivity(allTransactions, user.id),
      requestBreakdown: [
        {
          label: 'Pending',
          value: statusCounts.pending,
          color: 'fill-amber-500',
          hoverColor: 'fill-amber-600',
          bgColor: 'bg-amber-100',
          textColor: 'text-amber-700',
        },
        {
          label: 'Active',
          value: statusCounts.active,
          color: 'fill-blue-500',
          hoverColor: 'fill-blue-600',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-700',
        },
        {
          label: 'Completed',
          value: statusCounts.completed,
          color: 'fill-green-500',
          hoverColor: 'fill-green-600',
          bgColor: 'bg-green-100',
          textColor: 'text-green-700',
        },
        {
          label: 'Cancelled',
          value: statusCounts.cancelled,
          color: 'fill-rose-500',
          hoverColor: 'fill-rose-600',
          bgColor: 'bg-rose-100',
          textColor: 'text-rose-700',
        },
      ],
    };
  }, [user?.id, stats, userTransactions, allTransactions, conversations, books]);

  const handleAddBook = () => navigate('/my-books?action=add');
  const handleViewAllTransactions = () => navigate('/transactions');
  const handleViewAllBooks = () => navigate('/catalog');

  if (!user) return null;

  return (
    <PageTransition className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />

      <main className="flex-grow pt-[70px] px-4 py-8">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial="hidden"
            animate="show"
            variants={containerVariants}
            className="space-y-8"
          >
            {isLoading && !snapshot && (
              <motion.div variants={itemVariants} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-lg border bg-white p-6 space-y-3">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 rounded-lg border bg-white p-6">
                    <Skeleton className="h-5 w-40 mb-4" />
                    <Skeleton className="h-[300px] w-full" />
                  </div>
                  <div className="rounded-lg border bg-white p-6">
                    <Skeleton className="h-5 w-32 mb-4" />
                    <Skeleton className="h-[300px] w-full" />
                  </div>
                </div>
              </motion.div>
            )}

            {snapshot && (
              <>
                <motion.div variants={itemVariants}>
                  <WelcomeBanner
                    username={user?.displayName || user?.username || 'Reader'}
                    onAddBook={handleAddBook}
                    bookCount={snapshot.userBookCount}
                    activeExchangeCount={snapshot.activeExchangeCount}
                  />
                </motion.div>

                {/* Smart Swaps Section */}
                {smartSwaps.length > 0 && (
                  <motion.div variants={itemVariants} className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-800">Perfect Match Swaps</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {smartSwaps.map((book) => (
                        <BookCard
                          key={book.id}
                          id={book.id}
                          title={book.title}
                          author={book.author}
                          coverImage={book.coverImage}
                          condition={book.condition}
                          available={book.available}
                          genre={book.genre}
                          rating={book.rating}
                          publicationDate={book.publicationDate}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}

                <motion.div
                  variants={itemVariants}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                  <StatCard
                    title="My Listed Books"
                    value={snapshot.userBookCount}
                    icon={<BookOpen className="h-6 w-6 text-purple-600" />}
                    description="Titles you currently have available to lend"
                    accentColor="bg-purple-100"
                  />
                  <StatCard
                    title="Borrowed Right Now"
                    value={snapshot.borrowedCount}
                    icon={<BookPlus className="h-6 w-6 text-blue-600" />}
                    description="Books you currently have checked out"
                    accentColor="bg-blue-100"
                  />
                  <StatCard
                    title="Open Requests"
                    value={snapshot.activeExchangeCount}
                    icon={<TrendingUp className="h-6 w-6 text-green-600" />}
                    description="Pending and active exchanges linked to your account"
                    accentColor="bg-green-100"
                  />
                  <StatCard
                    title="Inbox Threads"
                    value={snapshot.conversationCount}
                    icon={<Users className="h-6 w-6 text-amber-600" />}
                    description="Conversations currently linked to your requests"
                    accentColor="bg-amber-100"
                  />
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                >
                  <div className="lg:col-span-2">
                    <ActivityChart
                      data={snapshot.activityData}
                      totalExchanges={snapshot.totalExchanges}
                      approvalRate={snapshot.approvalRate}
                      activeThreads={snapshot.conversationCount}
                    />
                  </div>
                  <div>
                    <UserDistributionChart data={snapshot.requestBreakdown} totalLabel="Requests" />
                  </div>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
                >
                  <RecentTransactions
                    transactions={snapshot.recentTransactions}
                    onViewAll={handleViewAllTransactions}
                  />
                  <PopularBooks books={snapshot.popularBooks} onViewAll={handleViewAllBooks} />
                </motion.div>
              </>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </PageTransition>
  );
};

export default Dashboard;
