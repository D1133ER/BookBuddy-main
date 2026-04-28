import { useEffect, useState, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/layout/PageTransition';
import BookCard from '@/components/books/BookCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, BookOpen, BookX, Loader2, Heart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Book } from '@/types/book';
import { toast } from 'sonner';
import { createFadeUpItem, createStaggerContainer } from '@/lib/motion';
import { DEFAULT_BOOK_COVER } from '@/lib/mockDbSeed';
import { useAuth } from '@/contexts/AuthContext';
import { bookSchema } from '@/lib/validations';
import { trackEvent } from '@/lib/analytics';
import {
  useUserBooks,
  useUserWishlist,
  useAddBookMutation,
  useToggleAvailabilityMutation,
  useToggleWishlistMutation,
} from '@/hooks/useBooks';
import { useUserTransactions, useUpdateTransactionStatusMutation } from '@/hooks/useTransactions';

interface AddBookFormProps {
  onAddBook: (book: Omit<Book, 'id'>) => Promise<boolean>;
  onClose: () => void;
  isSubmitting: boolean;
}

const AddBookForm = ({ onAddBook, onClose, isSubmitting }: AddBookFormProps) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [condition, setCondition] = useState('4');
  const [coverImage, setCoverImage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const result = bookSchema.safeParse({
      title,
      author,
      condition: parseInt(condition),
      coverImage: coverImage || undefined,
    });

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        errors[field] = err.message;
      });
      setFieldErrors(errors);
      return;
    }

    const newBook: Omit<Book, 'id'> = {
      title: result.data.title,
      author: result.data.author,
      condition: result.data.condition,
      coverImage: result.data.coverImage || DEFAULT_BOOK_COVER,
      available: true,
    };

    const success = await onAddBook(newBook);
    if (success) {
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Book Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter book title"
          aria-invalid={!!fieldErrors.title}
        />
        {fieldErrors.title && <p className="text-xs text-destructive">{fieldErrors.title}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="author">Author</Label>
        <Input
          id="author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Enter author name"
          aria-invalid={!!fieldErrors.author}
        />
        {fieldErrors.author && <p className="text-xs text-destructive">{fieldErrors.author}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="condition">Condition (1-5)</Label>
        <select
          id="condition"
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2"
          required
        >
          <option value="1">1 - Poor</option>
          <option value="2">2 - Fair</option>
          <option value="3">3 - Good</option>
          <option value="4">4 - Very Good</option>
          <option value="5">5 - Like New</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="coverImage">Cover Image URL (optional)</Label>
        <Input
          id="coverImage"
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
          placeholder="https://example.com/book-cover.jpg"
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            'Add Book'
          )}
        </Button>
      </DialogFooter>
    </form>
  );
};

const MyBooks = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const shouldReduceMotion = useReducedMotion() ?? false;
  const containerVariants = createStaggerContainer(shouldReduceMotion, 0.08, 0.04);
  const itemVariants = createFadeUpItem(shouldReduceMotion, 18);

  // Queries
  const { data: userBooks = [], isLoading: isLoadingBooks } = useUserBooks();
  const { data: transactions = [], isLoading: isLoadingTransactions } = useUserTransactions(
    user?.id || '',
    'borrower',
  );
  const { data: wishlistBooks = [], isLoading: isLoadingWishlist } = useUserWishlist(
    user?.id || '',
  );

  const isLoading = isLoadingBooks || isLoadingTransactions || isLoadingWishlist;

  const borrowedBooks = useMemo(() => {
    return transactions
      .filter((t) => t.status === 'active' && t.book && t.lender)
      .map((t) => ({
        id: t.book!.id,
        title: t.book!.title,
        author: t.book!.author,
        coverImage: t.book!.coverImage || DEFAULT_BOOK_COVER,
        condition: t.book!.condition,
        borrowedFrom: t.lender?.display_name || t.lender?.username || 'Community Member',
        dueDate: t.due_date || t.request_date || new Date().toISOString(),
        transactionId: t.id,
        lenderId: t.lender_id,
        available: false,
        genre: t.book!.genre,
        rating: t.book!.rating,
        publicationDate: t.book!.publicationDate,
      }));
  }, [transactions]);

  // Mutations
  const addBookMutation = useAddBookMutation();
  const toggleAvailabilityMutation = useToggleAvailabilityMutation();
  const toggleWishlistMutation = useToggleWishlistMutation();
  const updateStatusMutation = useUpdateTransactionStatusMutation();

  const [isAddBookOpen, setIsAddBookOpen] = useState(false);

  useEffect(() => {
    setIsAddBookOpen(searchParams.get('action') === 'add');
  }, [searchParams]);

  const updateAddDialogState = (open: boolean) => {
    const nextParams = new URLSearchParams(searchParams);
    if (open) nextParams.set('action', 'add');
    else nextParams.delete('action');
    setSearchParams(nextParams, { replace: true });
    setIsAddBookOpen(open);
  };

  const handleAddBook = async (newBook: Omit<Book, 'id'>) => {
    try {
      await addBookMutation.mutateAsync(newBook);
      trackEvent({
        category: 'Content',
        action: 'Book Added',
      });
      toast.success('Success', {
        description: 'Book added to your collection.',
      });
      return true;
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to add book. Please try again.',
      });
      return false;
    }
  };

  const handleToggleAvailability = async (id: string) => {
    try {
      const book = userBooks.find((book) => book.id === id);
      if (!book) return;

      await toggleAvailabilityMutation.mutateAsync({ id, available: !book.available });
      toast.success('Success', {
        description: `Book marked as ${!book.available ? 'available' : 'unavailable'}.`,
      });
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to update book availability. Please try again.',
      });
    }
  };

  const handleToggleWishlist = async (id: string) => {
    if (!user) return;
    try {
      await toggleWishlistMutation.mutateAsync({ userId: user.id, bookId: id });
      trackEvent({
        category: 'Engagement',
        action: 'Wishlist Toggled',
        label: id,
      });
      toast.success('Wishlist updated', {
        description: 'Book removed from your wishlist.',
      });
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to update wishlist. Please try again.',
      });
    }
  };

  const handleReturnBook = async (transactionId: string) => {
    try {
      await updateStatusMutation.mutateAsync({ id: transactionId, status: 'completed' });
      toast.success('Return recorded', {
        description: 'The book is now marked as returned and available again for the lender.',
      });
    } catch (error) {
      toast.error('Unable to complete return', {
        description: 'Please try again from the Transactions page if this keeps happening.',
      });
    }
  };

  if (!user) {
    return null;
  }

  return (
    <PageTransition className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow pt-[70px] px-4 py-8">
        <motion.div
          initial="hidden"
          animate="show"
          variants={containerVariants}
          className="container mx-auto max-w-7xl"
        >
          <motion.div
            variants={itemVariants}
            className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold mb-2">My Books</h1>
              <p className="text-gray-600">Manage your book collection and borrowed books</p>
            </div>

            <Dialog open={isAddBookOpen} onOpenChange={updateAddDialogState}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Book
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add a New Book</DialogTitle>
                  <DialogDescription>
                    Enter the details of the book you want to add to your collection.
                  </DialogDescription>
                </DialogHeader>
                <AddBookForm
                  onAddBook={handleAddBook}
                  onClose={() => updateAddDialogState(false)}
                  isSubmitting={addBookMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Tabs defaultValue="my-books" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="my-books" className="flex items-center">
                  <BookOpen className="mr-2 h-4 w-4" />
                  My Books ({userBooks.length})
                </TabsTrigger>
                <TabsTrigger value="borrowed" className="flex items-center">
                  <BookX className="mr-2 h-4 w-4" />
                  Borrowed ({borrowedBooks.length})
                </TabsTrigger>
                <TabsTrigger value="wishlist" className="flex items-center">
                  <Heart className="mr-2 h-4 w-4" />
                  Wishlist ({wishlistBooks.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="my-books">
                {isLoading && userBooks.length === 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="rounded-2xl border bg-white p-0 overflow-hidden">
                        <Skeleton className="h-[180px] w-full" />
                        <div className="p-4 space-y-2">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-1/3" />
                          <Skeleton className="h-9 w-full mt-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : userBooks.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                    <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No books in your collection yet</h3>
                    <p className="text-gray-500 mb-4">
                      Add books to your collection to share with others
                    </p>
                    <Button onClick={() => updateAddDialogState(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Book
                    </Button>
                  </div>
                ) : (
                  <motion.div
                    variants={containerVariants}
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                  >
                    {userBooks.map((book) => (
                      <motion.div
                        key={book.id}
                        variants={itemVariants}
                        className="flex justify-center"
                      >
                        <BookCard
                          id={book.id}
                          title={book.title}
                          author={book.author}
                          coverImage={book.coverImage}
                          condition={book.condition}
                          available={book.available}
                          genre={book.genre}
                          rating={book.rating}
                          publicationDate={book.publicationDate}
                          onRequest={() => handleToggleAvailability(book.id)}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </TabsContent>

              <TabsContent value="borrowed">
                {isLoading && borrowedBooks.length === 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="rounded-2xl border bg-white overflow-hidden">
                        <Skeleton className="h-[180px] w-full" />
                        <div className="p-4 space-y-2">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-9 w-full mt-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : borrowedBooks.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                    <BookX className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No borrowed books</h3>
                    <p className="text-gray-500 mb-4">You haven't borrowed any books yet</p>
                    <Button onClick={() => navigate('/catalog')}>Browse Catalog</Button>
                  </div>
                ) : (
                  <motion.div
                    variants={containerVariants}
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                  >
                    {borrowedBooks.map((book) => (
                      <motion.div
                        key={book.transactionId}
                        variants={itemVariants}
                        className="flex justify-center"
                      >
                        <div className="w-[250px] h-[400px] overflow-hidden flex flex-col bg-white rounded-lg shadow-md">
                          <BookCard
                            id={book.id}
                            title={book.title}
                            author={book.author}
                            coverImage={book.coverImage}
                            condition={book.condition}
                            available={false}
                            genre={book.genre}
                            rating={book.rating}
                            publicationDate={book.publicationDate}
                            onRequest={() => {}}
                            borrowed={true}
                          />
                          <div className="p-4 bg-gray-50 border-t border-gray-200">
                            <p className="text-sm text-gray-600 mb-1">
                              <span className="font-medium">From:</span> {book.borrowedFrom}
                            </p>
                            <p className="text-sm text-gray-600 mb-3">
                              <span className="font-medium">Due:</span>{' '}
                              {new Date(book.dueDate).toLocaleDateString()}
                            </p>
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() => handleReturnBook(book.transactionId)}
                              disabled={updateStatusMutation.isPending}
                            >
                              {updateStatusMutation.isPending ? 'Updating...' : 'Mark as Returned'}
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </TabsContent>

              <TabsContent value="wishlist">
                {isLoading && wishlistBooks.length === 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="rounded-2xl border bg-white overflow-hidden">
                        <Skeleton className="h-[180px] w-full" />
                        <div className="p-4 space-y-2">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-9 w-full mt-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : wishlistBooks.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                    <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">Your wishlist is empty</h3>
                    <p className="text-gray-500 mb-4">
                      Explore the catalog and save books you're interested in
                    </p>
                    <Button onClick={() => navigate('/catalog')}>Browse Catalog</Button>
                  </div>
                ) : (
                  <motion.div
                    variants={containerVariants}
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                  >
                    {wishlistBooks.map((book) => (
                      <motion.div
                        key={book.id}
                        variants={itemVariants}
                        className="flex justify-center"
                      >
                        <BookCard
                          id={book.id}
                          title={book.title}
                          author={book.author}
                          coverImage={book.coverImage}
                          condition={book.condition}
                          available={book.available}
                          genre={book.genre}
                          rating={book.rating}
                          publicationDate={book.publicationDate}
                          onRequest={() => {}}
                          isWishlisted={true}
                          onToggleWishlist={handleToggleWishlist}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      </main>

      <Footer />
    </PageTransition>
  );
};

export default MyBooks;
