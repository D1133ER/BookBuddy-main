import { useCallback, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";
import BookCard from "@/components/books/BookCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, BookOpen, BookX, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getUserBooks,
  addBook,
  toggleBookAvailability,
} from "@/services/bookService";
import { Book, BorrowedBook } from "@/types/book";
import { useToast } from "@/components/ui/use-toast";
import { createFadeUpItem, createStaggerContainer } from "@/lib/motion";
import { DEFAULT_BOOK_COVER, mapMockBookToAppBook } from "@/lib/mockDbSeed";
import { useAuth } from "@/contexts/AuthContext";
import { getTransactions, updateTransactionStatus } from "@/services/transactionService";
import { bookSchema } from "@/lib/validations";

type BorrowedBookView = BorrowedBook & {
  transactionId: string;
  lenderId: string;
};

interface AddBookFormProps {
  onAddBook: (book: Omit<Book, "id">) => Promise<boolean>;
  onClose: () => void;
  isSubmitting: boolean;
}

const AddBookForm = ({
  onAddBook,
  onClose,
  isSubmitting,
}: AddBookFormProps) => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [condition, setCondition] = useState("4");
  const [coverImage, setCoverImage] = useState("");
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

    const newBook: Omit<Book, "id"> = {
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
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            "Add Book"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
};

const MyBooks = () => {
  const [userBooks, setUserBooks] = useState<Book[]>([]);
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowedBookView[]>([]);
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const shouldReduceMotion = useReducedMotion() ?? false;
  const containerVariants = createStaggerContainer(shouldReduceMotion, 0.08, 0.04);
  const itemVariants = createFadeUpItem(shouldReduceMotion, 18);

  const loadShelf = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const [books, borrowerTransactions] = await Promise.all([
        getUserBooks(),
        getTransactions({ userId: user.id, type: "borrower" }),
      ]);

      const activeBorrowedBooks = borrowerTransactions
        .filter((transaction) => transaction.status === "active" && transaction.book && transaction.lender)
        .map((transaction) => ({
          ...mapMockBookToAppBook(transaction.book!),
          borrowedFrom: transaction.lender?.display_name || transaction.lender?.username || "Community Member",
          dueDate: transaction.due_date || transaction.request_date || new Date().toISOString(),
          transactionId: transaction.id,
          lenderId: transaction.lender_id,
          available: false,
        }));

      setUserBooks(books);
      setBorrowedBooks(activeBorrowedBooks);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error fetching books:", error);
      }
      toast({
        title: "Error",
        description: "Failed to load your books. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, user?.id]);

  useEffect(() => {
    void loadShelf();
  }, [loadShelf]);

  useEffect(() => {
    setIsAddBookOpen(searchParams.get("action") === "add");
  }, [searchParams]);

  const updateAddDialogState = (open: boolean) => {
    const nextParams = new URLSearchParams(searchParams);

    if (open) {
      nextParams.set("action", "add");
    } else {
      nextParams.delete("action");
    }

    setSearchParams(nextParams, { replace: true });
    setIsAddBookOpen(open);
  };

  const handleAddBook = async (newBook: Omit<Book, "id">) => {
    try {
      setIsSubmitting(true);
      await addBook(newBook);
      await loadShelf();
      toast({
        title: "Success",
        description: "Book added to your collection.",
      });
      return true;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error adding book:", error);
      }
      toast({
        title: "Error",
        description: "Failed to add book. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleAvailability = async (id: string) => {
    try {
      const book = userBooks.find((book) => book.id === id);
      if (!book) return;

      await toggleBookAvailability(id, !book.available);
      await loadShelf();

      toast({
        title: "Success",
        description: `Book marked as ${!book.available ? "available" : "unavailable"}.`,
      });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error toggling availability:", error);
      }
      toast({
        title: "Error",
        description: "Failed to update book availability. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReturnBook = async (transactionId: string) => {
    try {
      await updateTransactionStatus(transactionId, "completed");
      await loadShelf();
      toast({
        title: "Return recorded",
        description: "The book is now marked as returned and available again for the lender.",
      });
    } catch (error) {
      toast({
        title: "Unable to complete return",
        description: "Please try again from the Transactions page if this keeps happening.",
        variant: "destructive",
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
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Books</h1>
              <p className="text-gray-600">
                Manage your book collection and borrowed books
              </p>
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
                    Enter the details of the book you want to add to your
                    collection.
                  </DialogDescription>
                </DialogHeader>
                <AddBookForm
                  onAddBook={handleAddBook}
                  onClose={() => updateAddDialogState(false)}
                  isSubmitting={isSubmitting}
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
            </TabsList>

            <TabsContent value="my-books">
              {isLoading ? (
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
                  <h3 className="text-lg font-medium mb-2">
                    No books in your collection yet
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Add books to your collection to share with others
                  </p>
                  <Button onClick={() => updateAddDialogState(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Book
                  </Button>
                </div>
              ) : (
                <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {userBooks.map((book) => (
                    <motion.div key={book.id} variants={itemVariants} className="flex justify-center">
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
              {isLoading ? (
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
                  <h3 className="text-lg font-medium mb-2">
                    No borrowed books
                  </h3>
                  <p className="text-gray-500 mb-4">
                    You haven't borrowed any books yet
                  </p>
                  <Button onClick={() => navigate("/catalog")}>
                    Browse Catalog
                  </Button>
                </div>
              ) : (
                <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {borrowedBooks.map((book) => (
                    <motion.div key={book.id} variants={itemVariants} className="flex justify-center">
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
                            <span className="font-medium">From:</span>{" "}
                            {book.borrowedFrom}
                          </p>
                          <p className="text-sm text-gray-600 mb-3">
                            <span className="font-medium">Due:</span>{" "}
                            {new Date(book.dueDate).toLocaleDateString()}
                          </p>
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => handleReturnBook(book.transactionId)}
                          >
                            Mark as Returned
                          </Button>
                        </div>
                      </div>
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
