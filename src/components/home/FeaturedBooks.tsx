import { useState } from "react";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import BookCard from "../books/BookCard";
import { Book } from "@/types/book";

interface FeaturedBooksProps {
  books?: Book[];
  title?: string;
  description?: string;
  onRequest?: (id: string) => void | Promise<void>;
}

const FeaturedBooks = ({
  books = [],
  title = "Featured Books",
  description = "Discover titles that are already circulating through nearby readers",
  onRequest,
}: FeaturedBooksProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 4;
  const pageCount = Math.max(1, Math.ceil(books.length / itemsPerPage));

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(pageCount - 1, prev + 1));
  };

  const handleRequestBook = (id: string) => {
    onRequest?.(id);
  };

  const startIndex = currentPage * itemsPerPage;
  const visibleBooks = books.slice(startIndex, startIndex + itemsPerPage);

  return (
    <section className="w-full bg-gray-50 py-16">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-10 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
            <p className="mt-2 text-gray-700">{description}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevious}
              disabled={currentPage === 0}
              className="rounded-full"
              aria-label="Show previous featured books"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              disabled={currentPage >= pageCount - 1}
              className="rounded-full"
              aria-label="Show next featured books"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {visibleBooks.map((book) => (
            <div key={book.id} className="flex justify-center">
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
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <div className="flex gap-2">
            {Array.from({ length: pageCount }).map(
              (_, index) => (
                <Button
                  key={index}
                  variant={currentPage === index ? "default" : "outline"}
                  size="sm"
                  className="h-10 w-10 rounded-full p-0"
                  onClick={() => setCurrentPage(index)}
                  aria-label={`Show featured books page ${index + 1}`}
                >
                  {index + 1}
                </Button>
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedBooks;
