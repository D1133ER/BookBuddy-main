import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BookCard from "@/components/books/BookCard";
import BookDetail from "@/components/books/BookDetail";
import PageTransition from "@/components/layout/PageTransition";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Search, Filter } from "lucide-react";
import { useCatalogData } from "@/hooks/useCatalogData";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import {
  createFadeUpItem,
  createHoverLift,
  createStaggerContainer,
  pressScale,
} from "@/lib/motion";
import { requestBook } from "@/services/transactionService";
import { db } from "@/lib/mockDb";

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const shouldReduceMotion = useReducedMotion() ?? false;
  const containerVariants = createStaggerContainer(shouldReduceMotion, 0.08, 0.04);
  const itemVariants = createFadeUpItem(shouldReduceMotion, 20);
  const { books, error, isLoading } = useCatalogData();
  const { isLoggedIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const searchQuery = searchParams.get("search") || "";
  const availableOnly = searchParams.get("available") === "true";
  const selectedBookId = searchParams.get("book");

  const updateSearchParams = (updates: Record<string, string | null>) => {
    const nextParams = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        nextParams.set(key, value);
      } else {
        nextParams.delete(key);
      }
    });

    setSearchParams(nextParams, { replace: true });
  };

  useEffect(() => {
    if (!selectedBookId) {
      return;
    }

    if (!books.some((book) => book.id === selectedBookId)) {
      updateSearchParams({ book: null });
    }
  }, [books, selectedBookId]);

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.genre?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAvailability = availableOnly ? book.available : true;
    return matchesSearch && matchesAvailability;
  });

  const selectedBook = books.find((book) => book.id === selectedBookId);
  const selectedOwner = selectedBook
    ? db.users.find((user) => user.id === selectedBook.owner_id)
    : null;

  const handleRequestBook = async (id: string) => {
    if (!isLoggedIn) {
      navigate("/login", { state: { from: location } });
      return;
    }

    try {
      await requestBook(id);
      toast({
        title: "Request sent",
        description: "The owner has been notified and your request is now listed in Transactions.",
      });
    } catch (requestError: any) {
      toast({
        title: "Unable to request book",
        description: requestError.message || "Please try again in a moment.",
        variant: "destructive",
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
                Browse a curated local shelf, filter what is currently available, and send a tracked borrowing request in one step.
              </p>
              {error && (
                <p className="mt-2 text-sm text-amber-700">
                  {error}
                </p>
              )}
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search by title, author, or genre..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => updateSearchParams({ search: e.target.value || null })}
                  />
                </div>
                <motion.div whileHover={createHoverLift(shouldReduceMotion, -2)} whileTap={pressScale}>
                  <Button
                    variant="outline"
                    className={availableOnly ? "bg-primary text-white" : ""}
                    onClick={() => updateSearchParams({ available: availableOnly ? null : "true" })}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    {availableOnly ? "Showing Available" : "Show Available Only"}
                  </Button>
                </motion.div>
              </div>
            </motion.div>

            {isLoading ? (
              <motion.div variants={itemVariants} className="py-16 text-center bg-white rounded-lg shadow-sm">
                <p className="text-gray-500 text-lg">Refreshing live book metadata...</p>
              </motion.div>
            ) : filteredBooks.length === 0 ? (
              <motion.div variants={itemVariants} className="text-center py-12 bg-white rounded-lg shadow-sm">
                <p className="text-gray-500 text-lg">
                  No books found matching your search criteria.
                </p>
                <Button
                  variant="link"
                  onClick={() => {
                    updateSearchParams({ search: null, available: null, book: null });
                  }}
                >
                  Clear filters
                </Button>
              </motion.div>
            ) : (
              <motion.div
                variants={containerVariants}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
              >
                {filteredBooks.map((book) => (
                  <motion.div key={book.id} variants={itemVariants} className="flex justify-center">
                    <div className="space-y-3">
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
                ))}
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>

      <Dialog open={Boolean(selectedBook)} onOpenChange={(open) => !open && updateSearchParams({ book: null })}>
        <DialogContent className="max-w-4xl">
          {selectedBook && (
            <BookDetail
              book={selectedBook}
              owner={{
                id: selectedOwner?.id || selectedBook.owner_id || "community-owner",
                name: selectedOwner?.display_name || "Community Shelf",
                avatar: selectedOwner?.avatar_url,
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
