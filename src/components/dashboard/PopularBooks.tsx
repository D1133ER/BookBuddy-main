
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, ArrowRight, BookMarked } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, useReducedMotion } from "framer-motion";
import { createFadeUpItem, createHoverLift, createStaggerContainer } from "@/lib/motion";

interface PopularBook {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  transactions: number;
  maxTransactions: number;
  genre?: string;
}

interface PopularBooksProps {
  books?: PopularBook[];
  onViewAll?: () => void;
}

const PopularBooks = ({ books = [], onViewAll }: PopularBooksProps) => {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const containerVariants = createStaggerContainer(shouldReduceMotion, 0.09, 0.04);
  const itemVariants = createFadeUpItem(shouldReduceMotion, 18);

  // Generate colors for progress bars
  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-blue-500";
    if (percentage >= 40) return "bg-yellow-500";
    if (percentage >= 20) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <Card className="border-t-4 border-t-blue-500 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold flex items-center">
          <BookMarked className="h-5 w-5 mr-2 text-blue-500" />
          Popular Books
        </CardTitle>
        {onViewAll && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewAll}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            View all
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {books.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 p-6 text-sm text-muted-foreground">
            Popular titles will appear here as soon as readers start requesting books.
          </div>
        ) : (
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
          className="space-y-5"
        >
          {books.map((book) => {
            const percentage = (book.transactions / book.maxTransactions) * 100;
            const progressColor = getProgressColor(percentage);

            return (
              <motion.div
                key={book.id}
                variants={itemVariants}
                whileHover={createHoverLift(shouldReduceMotion, -4)}
                className="space-y-2 group"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-14 rounded overflow-hidden shadow-sm ring-1 ring-slate-200">
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <div>
                      <p className="font-medium group-hover:text-blue-600 transition-colors">
                        {book.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {book.author}
                      </p>
                      {book.genre && (
                        <p className="text-xs text-blue-600/80 mt-0.5">
                          {book.genre.split("/")[0].trim()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="h-3 w-3 text-blue-500" />
                    <span className="text-sm font-medium">
                      {book.transactions}
                    </span>
                  </div>
                </div>
                <div className="relative pt-1">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <span className="text-xs font-semibold inline-block text-blue-600">
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-muted-foreground">
                        Popularity
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={percentage}
                    className="h-2 bg-gray-200"
                    indicatorClassName={progressColor}
                  />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default PopularBooks;
