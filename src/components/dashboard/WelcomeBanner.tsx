import { Button } from '@/components/ui/button';
import { BookPlus, BookOpen, TrendingUp } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  createFadeUpItem,
  createHoverLift,
  createStaggerContainer,
  pressScale,
} from '@/lib/motion';

interface WelcomeBannerProps {
  username?: string;
  onAddBook?: () => void;
  bookCount?: number;
  activeExchangeCount?: number;
}

const WelcomeBanner = ({
  username = 'Reader',
  onAddBook,
  bookCount = 0,
  activeExchangeCount = 0,
}: WelcomeBannerProps) => {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const containerVariants = createStaggerContainer(shouldReduceMotion, 0.1, 0.04);
  const itemVariants = createFadeUpItem(shouldReduceMotion, 20);

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="bg-gradient-to-r from-indigo-600 via-purple-600 to-purple-700 rounded-xl p-8 text-white shadow-lg relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-2xl"></div>
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full -ml-10 -mb-10 blur-xl"></div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Welcome back, {username}!
          </h1>
          <p className="mt-2 text-white/90 max-w-md">
            Manage your books, track exchanges, and connect with fellow readers in your community.
          </p>
          <div className="flex items-center mt-4 space-x-4 text-sm text-white/80">
            <div className="flex items-center">
              <BookOpen className="h-4 w-4 mr-1" />
              <span>{bookCount} Books</span>
            </div>
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>{activeExchangeCount} Active Exchanges</span>
            </div>
          </div>
        </motion.div>
        <motion.div
          variants={itemVariants}
          whileHover={createHoverLift(shouldReduceMotion, -4)}
          whileTap={pressScale}
        >
          <Button
            onClick={onAddBook}
            variant="secondary"
            className="bg-white text-purple-700 hover:bg-white/90 shadow-md transition-all hover:shadow-lg"
            size="lg"
          >
            <BookPlus className="mr-2 h-5 w-5" />
            Add New Book
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default WelcomeBanner;
