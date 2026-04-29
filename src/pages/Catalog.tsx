import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BookCard from '@/components/books/BookCard';
import BookDetail from '@/components/books/BookDetail';
import PageTransition from '@/components/layout/PageTransition';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Search, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCatalogData, useAdvancedCatalogSearch } from '@/hooks/useCatalogData';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  createFadeUpItem,
  createHoverLift,
  createStaggerContainer,
  pressScale,
} from '@/lib/motion';
import { useRequestBookMutation, useToggleWishlistMutation } from '@/hooks/useTransactions';
import { useUserWishlist, useBook } from '@/hooks/useBooks';
import { trackEvent } from '@/lib/analytics';
import { Grid } from 'react-window';
import { getErrorMessage } from '@/lib/helpers';

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const shouldReduceMotion = useReducedMotion() ?? false;
  const containerVariants = createStaggerContainer(shouldReduceMotion, 0.08, 0.04);
  const itemVariants = createFadeUpItem(shouldReduceMotion, 20);

  const { books, error, isLoading } = useCatalogData();
  const { filteredBooks, filters, setFilters } = useAdvancedCatalogSearch(books);
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: wishlistBooks } = useUserWishlist(user?.id || '');
  const wishlistBookIds = new Set(wishlistBooks?.map((b) => b.id) || []);

  const [columns, setColumns] = useState(4);
  const [containerWidth, setContainerWidth] = useState(1200);

  useEffect(() => {
    const handleResize = () => {
      const width = Math.min(window.innerWidth - 32, 1280);
      setContainerWidth(width);
      if (width < 640) setColumns(1);
      else if (width < 768) setColumns(2);
      else if (width < 1024) setColumns(3);
      else setColumns(4);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load selected book from URL
  const selectedBookId = searchParams.get('book') || '';
  const { data: fullSelectedBook } = useBook(selectedBookId);

  const updateSearchParams = (updates: Record<string, string | null>) => {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) nextParams.set(key, value);
      else nextParams.delete(key);
    });
    setSearchParams(nextParams, { replace: true });
  };

  const requestMutation = useRequestBookMutation();
  const wishlistMutation = useToggleWishlistMutation();

  const handleRequestBook = async (id: string) => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: location } });
      return;
    }

    try {
      await requestMutation.mutateAsync(id);
      trackEvent({
        category: 'Engagement',
        action: 'Book Requested',
        label: id,
      });
      toast.success('Request sent', {
        description: 'The owner has been notified and your request is now listed in Transactions.',
      });
    } catch (err: unknown) {
      toast.error('Unable to request book', {
        description: getErrorMessage(err, 'Please try again in a moment.'),
      });
    }
  };

  const handleToggleWishlist = async (id: string) => {
    if (!isLoggedIn || !user?.id) {
      navigate('/login', { state: { from: location } });
      return;
    }
    try {
      await wishlistMutation.mutateAsync({ userId: user.id, bookId: id });
      trackEvent({
        category: 'Engagement',
        action: 'Wishlist Toggled',
        label: id,
      });
    } catch (err) {
      toast.error('Error', {
        description: 'Could not update wishlist.',
      });
    }
  };

  return (
    <PageTransition className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow pt-[70px] px-4 py-8">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial="hidden"
            animate="show"
            variants={containerVariants}
            className="space-y-6"
          >
            <motion.div variants={itemVariants} className="mb-2">
              <h1 className="text-3xl font-bold mb-2">Book Catalog</h1>
              <p className="text-gray-600">
                Browse a curated local shelf, filter what is currently available, and send a tracked
                borrowing request in one step.
              </p>
              {error && <p className="mt-2 text-sm text-amber-700">{error}</p>}
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search by title, author, or genre..."
                    className="pl-9"
                    value={filters.searchTerm}
                    onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                  />
                </div>
                <motion.div
                  whileHover={createHoverLift(shouldReduceMotion, -2)}
                  whileTap={pressScale}
                >
                  <Button
                    variant="outline"
                    className={filters.availability ? 'bg-primary text-white' : ''}
                    onClick={() =>
                      setFilters({ ...filters, availability: filters.availability ? null : true })
                    }
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    {filters.availability ? 'Showing Available' : 'Show Available Only'}
                  </Button>
                </motion.div>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/3">
                  <Select
                    value={filters.sortBy}
                    onValueChange={(val) =>
                      setFilters({ ...filters, sortBy: val as typeof filters.sortBy })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="title">Title (A-Z)</SelectItem>
                      <SelectItem value="author">Author (A-Z)</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="dateAdded">Newest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full md:w-1/3">
                  <Select
                    value={filters.condition ? filters.condition.toString() : 'all'}
                    onValueChange={(val) =>
                      setFilters({ ...filters, condition: val === 'all' ? null : parseInt(val) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Condition</SelectItem>
                      <SelectItem value="4">Like New & Up</SelectItem>
                      <SelectItem value="3">Good & Up</SelectItem>
                      <SelectItem value="2">Fair & Up</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full md:w-1/3">
                  <Select
                    value={filters.genres.length > 0 ? filters.genres[0] : 'all'}
                    onValueChange={(val) =>
                      setFilters({ ...filters, genres: val === 'all' ? [] : [val] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Genre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Genres</SelectItem>
                      <SelectItem value="Fiction">Fiction</SelectItem>
                      <SelectItem value="Non-fiction">Non-fiction</SelectItem>
                      <SelectItem value="Science Fiction">Science Fiction</SelectItem>
                      <SelectItem value="History">History</SelectItem>
                      <SelectItem value="Romance">Romance</SelectItem>
                      <SelectItem value="Horror">Horror</SelectItem>
                      <SelectItem value="Memoir">Memoir</SelectItem>
                      <SelectItem value="Self-help">Self-help</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </motion.div>

            {isLoading ? (
              <motion.div
                variants={itemVariants}
                className="py-16 text-center bg-white rounded-lg shadow-sm"
              >
                <p className="text-gray-500 text-lg">Refreshing live book metadata...</p>
              </motion.div>
            ) : filteredBooks.length === 0 ? (
              <motion.div
                variants={itemVariants}
                className="text-center py-12 bg-white rounded-lg shadow-sm"
              >
                <p className="text-gray-500 text-lg">
                  No books found matching your search criteria.
                </p>
                <Button
                  variant="link"
                  onClick={() => {
                    setFilters({
                      searchTerm: '',
                      genres: [],
                      availability: null,
                      condition: null,
                      sortBy: 'title',
                    });
                  }}
                >
                  Clear filters
                </Button>
              </motion.div>
            ) : (
              <motion.div variants={containerVariants} className="w-full flex justify-center">
                <Grid
                  columnCount={columns}
                  columnWidth={Math.floor(containerWidth / columns)}
                  rowCount={Math.ceil(filteredBooks.length / columns)}
                  rowHeight={460}
                  style={{
                    height: Math.min(800, Math.ceil(filteredBooks.length / columns) * 460),
                    width: containerWidth,
                  }}
                  className="scrollbar-hide"
                  cellProps={{}}
                  cellComponent={({ columnIndex, rowIndex, style }) => {
                    const index = rowIndex * columns + columnIndex;
                    const book = filteredBooks[index];

                    if (!book) return null;

                    return (
                      <div style={{ ...style, padding: '12px' }}>
                        <motion.div variants={itemVariants} className="flex justify-center h-full">
                          <div className="space-y-3 w-full max-w-[250px]">
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
                              onRequest={handleRequestBook}
                              isWishlisted={wishlistBookIds.has(book.id)}
                              onToggleWishlist={handleToggleWishlist}
                            />
                            <Button
                              variant="ghost"
                              className="w-full"
                              onClick={() => updateSearchParams({ book: book.id })}
                            >
                              View Details
                            </Button>
                          </div>
                        </motion.div>
                      </div>
                    );
                  }}
                />
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>

      <Dialog
        open={Boolean(fullSelectedBook)}
        onOpenChange={(open) => !open && updateSearchParams({ book: null })}
      >
        <DialogContent className="max-w-4xl">
          {fullSelectedBook && (
            <BookDetail
              book={fullSelectedBook}
              owner={{
                id: fullSelectedBook.owner?.id || fullSelectedBook.owner_id || 'community-owner',
                name: fullSelectedBook.owner?.display_name || 'Community Shelf',
                avatar: fullSelectedBook.owner?.avatar_url,
              }}
              onRequestBook={handleRequestBook}
              onClose={() => updateSearchParams({ book: null })}
            />
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </PageTransition>
  );
};

export default Catalog;
