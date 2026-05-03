import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Book } from '@/types/book';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarDays, Building2, Hash, Star } from 'lucide-react';
import { createFadeUpItem, createStaggerContainer } from '@/lib/motion';

interface BookDetailProps {
  book: Book;
  owner?: {
    id: string;
    name: string;
    avatar?: string;
  };
  onRequestBook?: (bookId: string) => void;
  onClose?: () => void;
  isOwner?: boolean;
}

const BookDetail = ({
  book,
  owner = {
    id: 'user-1',
    name: 'Book Owner',
    avatar: 'owner',
  },
  onRequestBook,
  onClose,
  isOwner = false,
}: BookDetailProps) => {
  const conditionLabels = ['Poor', 'Fair', 'Good', 'Very Good', 'Like New'];
  const shouldReduceMotion = useReducedMotion() ?? false;
  const containerVariants = createStaggerContainer(shouldReduceMotion, 0.08, 0.04);
  const itemVariants = createFadeUpItem(shouldReduceMotion, 18);

  const handleRequestBook = () => {
    if (onRequestBook) {
      onRequestBook(book.id);
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="flex flex-col md:flex-row gap-6"
    >
      <motion.div variants={itemVariants} className="md:w-1/3">
        <div className="aspect-[2/3] overflow-hidden rounded-lg bg-gray-100">
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>
      </motion.div>

      <div className="md:w-2/3 space-y-4">
        <motion.div variants={itemVariants}>
          <h2 className="text-2xl font-bold">{book.title}</h2>
          <p className="text-lg text-muted-foreground">{book.author}</p>
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {conditionLabels[book.condition - 1]}
          </Badge>
          <Badge
            variant="outline"
            className={
              book.available
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-red-50 text-red-700 border-red-200'
            }
          >
            {book.available ? 'Available' : 'Unavailable'}
          </Badge>
          {book.genre && (
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              {book.genre}
            </Badge>
          )}
          {typeof book.rating === 'number' && (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              <Star className="mr-1 h-3.5 w-3.5 fill-current" />
              {book.rating.toFixed(1)}
              {typeof book.ratingsCount === 'number' ? ` (${book.ratingsCount})` : ''}
            </Badge>
          )}
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl border bg-slate-50/70 p-4"
        >
          {book.isbn && (
            <div className="flex items-start gap-2 text-sm">
              <Hash className="mt-0.5 h-4 w-4 text-slate-500" />
              <div>
                <p className="font-medium text-slate-700">ISBN</p>
                <p className="text-muted-foreground">{book.isbn}</p>
              </div>
            </div>
          )}
          {book.publicationDate && (
            <div className="flex items-start gap-2 text-sm">
              <CalendarDays className="mt-0.5 h-4 w-4 text-slate-500" />
              <div>
                <p className="font-medium text-slate-700">Published</p>
                <p className="text-muted-foreground">{book.publicationDate}</p>
              </div>
            </div>
          )}
          {book.publisher && (
            <div className="flex items-start gap-2 text-sm">
              <Building2 className="mt-0.5 h-4 w-4 text-slate-500" />
              <div>
                <p className="font-medium text-slate-700">Publisher</p>
                <p className="text-muted-foreground">{book.publisher}</p>
              </div>
            </div>
          )}
          {book.source && (
            <div className="flex items-start gap-2 text-sm">
              <Star className="mt-0.5 h-4 w-4 text-slate-500" />
              <div>
                <p className="font-medium text-slate-700">Metadata Source</p>
                <p className="text-muted-foreground">{book.source}</p>
              </div>
            </div>
          )}
        </motion.div>

        {book.description && (
          <motion.div variants={itemVariants} className="pt-2">
            <h3 className="text-sm font-medium mb-1">Description</h3>
            <p className="text-sm text-muted-foreground">
              {book.description || 'No description available.'}
            </p>
          </motion.div>
        )}

        <motion.div variants={itemVariants} className="pt-2">
          <h3 className="text-sm font-medium mb-2">Owner</h3>
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={owner.avatar || undefined} alt={owner.name} />
              <AvatarFallback>{owner.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{owner.name}</p>
              <p className="text-xs text-muted-foreground">
                Member since {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="pt-4 flex justify-end space-x-3">
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
          {!isOwner && book.available && <Button onClick={handleRequestBook}>Request Book</Button>}
          {isOwner && <Button variant="outline">Edit Book</Button>}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default BookDetail;
