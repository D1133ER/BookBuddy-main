import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, useReducedMotion } from 'framer-motion';
import { createFadeUpItem, createHoverLift, createStaggerContainer } from '@/lib/motion';

interface Transaction {
  id: string;
  user: {
    name: string;
    avatar?: string;
  };
  book: string;
  type: 'borrow' | 'lend' | 'return';
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  date: string;
}

interface RecentTransactionsProps {
  transactions?: Transaction[];
  onViewAll?: () => void;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  active: 'bg-blue-100 text-blue-800 border-blue-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const typeIcons = {
  borrow: (
    <svg className="h-3 w-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <title>Borrow</title>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
  lend: (
    <svg className="h-3 w-3 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <title>Lend</title>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  ),
  return: (
    <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <title>Return</title>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
      />
    </svg>
  ),
};

const typeLabels = {
  borrow: 'Borrowed',
  lend: 'Lent',
  return: 'Returned',
};

const RecentTransactions = ({ transactions = [], onViewAll }: RecentTransactionsProps) => {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const containerVariants = createStaggerContainer(shouldReduceMotion, 0.08, 0.04);
  const itemVariants = createFadeUpItem(shouldReduceMotion, 18);

  return (
    <Card className="border-t-4 border-t-purple-500 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold flex items-center">
          <BookOpen className="h-5 w-5 mr-2 text-purple-500" />
          Recent Transactions
        </CardTitle>
        {onViewAll && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewAll}
            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
          >
            View all
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 p-6 text-sm text-muted-foreground">
            Your latest requests and returns will appear here once you start borrowing or lending.
          </div>
        ) : (
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
            className="space-y-3"
          >
            {transactions.map((transaction) => (
              <motion.div
                key={transaction.id}
                variants={itemVariants}
                whileHover={createHoverLift(shouldReduceMotion, -3)}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors border border-border/40"
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="border-2 border-white shadow-sm">
                    <AvatarImage
                      src={transaction.user.avatar || undefined}
                      alt={transaction.user.name}
                    />
                    <AvatarFallback className="bg-purple-100 text-purple-700">
                      {transaction.user.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center">
                      <p className="font-medium">{transaction.user.name}</p>
                      <span className="mx-2 text-muted-foreground">
                        {typeIcons[transaction.type]}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <span className="font-medium text-primary/80">
                        {typeLabels[transaction.type]}
                      </span>
                      <span className="mx-1">•</span>"{transaction.book}"
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className={statusColors[transaction.status]}>
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                  </Badge>
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {new Date(transaction.date).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;
