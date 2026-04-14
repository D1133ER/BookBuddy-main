
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Star, BookOpen, CalendarDays } from "lucide-react";
import { DEFAULT_BOOK_COVER } from "@/lib/mockDbSeed";

interface BookCardProps {
  id?: string;
  title?: string;
  author?: string;
  coverImage?: string;
  condition?: number;
  available?: boolean;
  genre?: string;
  rating?: number;
  publicationDate?: string;
  onRequest?: (id: string) => void;
  isOwner?: boolean;
  borrowed?: boolean;
}

const BookCard = ({
  id,
  title,
  author,
  coverImage,
  condition,
  available,
  genre,
  rating,
  publicationDate,
  onRequest = () => {},
  isOwner = false,
  borrowed = false,
}: BookCardProps) => {
  const bookId = id ?? "book-placeholder";
  const bookTitle = title ?? "Community Pick";
  const bookAuthor = author ?? "Unknown Author";
  const bookCoverImage = coverImage ?? DEFAULT_BOOK_COVER;
  const bookCondition = condition ?? 4;
  const isAvailable = available ?? true;
  const bookGenre = genre;
  const bookRating = rating;
  const bookPublicationDate = publicationDate;
  const primaryGenre = bookGenre?.split("/")[0]?.trim();
  const publicationYear = bookPublicationDate?.split("-")[0];
  const actionLabel = isOwner
    ? isAvailable
      ? "Pause Lending"
      : "Make Available"
    : isAvailable
      ? "Request Book"
      : borrowed
        ? "Currently Borrowed"
        : "Not Available";
  const actionDisabled = isOwner ? false : !isAvailable;

  const renderConditionStars = () => {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            size={14}
            className={`${index < bookCondition ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="h-full transition-transform duration-300 motion-safe:hover:-translate-y-1">
      <Card className="group w-[250px] min-h-[390px] overflow-hidden flex flex-col bg-white border-transparent shadow-sm hover:shadow-xl transition-shadow duration-300 rounded-2xl">
        <div className="relative h-[180px] overflow-hidden group">
          <img
            src={bookCoverImage}
            alt={bookTitle}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <Badge
            className={`absolute top-3 right-3 shadow-md ${isAvailable ? "bg-green-500/90 hover:bg-green-600/90" : "bg-red-500/90 hover:bg-red-600/90"}`}
          >
            {isAvailable ? "Available" : "Unavailable"}
          </Badge>
        </div>

        <CardHeader className="p-4 pb-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-bold text-lg line-clamp-1" title={bookTitle}>
                {bookTitle}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-1">{bookAuthor}</p>
            </div>
            {typeof bookRating === "number" && (
              <div className="rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                {bookRating.toFixed(1)} ★
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-0 pb-3 flex-grow space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {primaryGenre && (
              <Badge variant="secondary" className="rounded-full px-2.5 py-1 text-[11px]">
                {primaryGenre}
              </Badge>
            )}
            {publicationYear && (
              <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] text-slate-600">
                <CalendarDays className="h-3 w-3" />
                {publicationYear}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-medium text-gray-600">Condition:</span>
            {renderConditionStars()}
          </div>
          {!bookRating && (
            <p className="text-xs text-slate-600">
              Community rating will appear when enough readers have reviewed this title.
            </p>
          )}
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <Button
            className="w-full rounded-lg"
            disabled={actionDisabled}
            onClick={() => onRequest(bookId)}
            variant={actionDisabled ? "secondary" : "default"}
          >
            <BookOpen className="mr-2 h-4 w-4" />
            {actionLabel}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default BookCard;
