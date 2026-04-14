
import { Suspense, lazy, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import HeroSection from "./HeroSection";
import PublicNavbar from "../layout/PublicNavbar";
import { MOCK_DB_CHANGE_EVENT, db } from "@/lib/mockDb";
import { DEFAULT_BOOK_COVER } from "@/lib/mockDbSeed";
import { Book } from "@/types/book";

const FeaturedBooks = lazy(() => import("./FeaturedBooks"));
const HowItWorks = lazy(() => import("./HowItWorks"));
const Footer = lazy(() => import("../layout/Footer"));

const readFeaturedBooks = (): Book[] =>
  db.books.slice(0, 6).map((book) => ({
    id: book.id,
    title: book.title,
    author: book.author,
    coverImage: book.cover_image || DEFAULT_BOOK_COVER,
    condition: book.condition,
    available: book.available,
    description: book.description,
    owner_id: book.owner_id,
    isbn: book.isbn,
    publicationDate: book.publication_date,
    genre: book.genre,
    rating: book.rating,
    ratingsCount: book.ratings_count,
    publisher: book.publisher,
    source: book.source,
  }));

const SectionPlaceholder = ({
  id,
  className,
}: {
  id?: string;
  className: string;
}) => (
  <section id={id} aria-hidden="true" className={className}>
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <div className="h-8 w-52 rounded-full bg-slate-200" />
      <div className="mt-4 h-4 max-w-2xl rounded-full bg-slate-200" />
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="min-h-[320px] rounded-2xl bg-white/80 shadow-sm" />
        ))}
      </div>
    </div>
  </section>
);

const FooterPlaceholder = () => <div aria-hidden="true" className="min-h-[240px] bg-slate-900" />;

const Home = () => {
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>(() => readFeaturedBooks());
  const [showDeferredSections, setShowDeferredSections] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!location.hash) {
      return;
    }

    const target = document.getElementById(location.hash.slice(1));
    if (target) {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
    }
  }, [location.hash]);

  useEffect(() => {
    const handleDbChange = (event: Event) => {
      const detail = (event as CustomEvent<{ key?: string }>).detail;

      if (!detail?.key || ["books", "transactions", "reviews"].includes(detail.key)) {
        setFeaturedBooks(readFeaturedBooks());
      }
    };

    window.addEventListener(MOCK_DB_CHANGE_EVENT, handleDbChange as EventListener);

    return () => {
      window.removeEventListener(MOCK_DB_CHANGE_EVENT, handleDbChange as EventListener);
    };
  }, []);

  useEffect(() => {
    let timeoutId = 0;
    const frameId = window.requestAnimationFrame(() => {
      timeoutId = window.setTimeout(() => setShowDeferredSections(true), 200);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timeoutId);
    };
  }, []);

  const handleFeaturedRequest = async (bookId: string) => {
    if (!db.session?.user) {
      navigate("/login", { state: { from: location } });
      return;
    }

    const { toast } = await import("@/components/ui/use-toast");

    try {
      const { requestBook } = await import("@/services/transactionService");

      await requestBook(bookId);
      toast({
        title: "Request sent",
        description: "The owner has been notified and your request is now tracked in Transactions.",
      });
    } catch (error: any) {
      toast({
        title: "Unable to request this book",
        description: error.message || "Please try again in a moment.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />
      <main className="pt-[70px]">
        <HeroSection />
        {showDeferredSections ? (
          <Suspense fallback={<SectionPlaceholder id="community" className="min-h-[560px] bg-gray-50" />}>
            <section id="community">
              <FeaturedBooks books={featuredBooks} onRequest={handleFeaturedRequest} />
            </section>
          </Suspense>
        ) : (
          <SectionPlaceholder id="community" className="min-h-[560px] bg-gray-50" />
        )}
        {showDeferredSections ? (
          <Suspense fallback={<SectionPlaceholder id="how-it-works" className="min-h-[420px] bg-slate-50" />}>
            <div id="how-it-works">
              <HowItWorks />
            </div>
          </Suspense>
        ) : (
          <SectionPlaceholder id="how-it-works" className="min-h-[420px] bg-slate-50" />
        )}
        <section id="neighbor-shelves" className="bg-white px-4 py-16">
          <div className="container mx-auto max-w-6xl text-center">
            <h2 className="mb-6 text-3xl font-bold text-slate-950">
              Build a neighborhood shelf that actually stays organized
            </h2>
            <p className="mx-auto mb-8 max-w-3xl text-lg text-gray-700">
              Lend the books you have finished, request titles near you, and keep pickup details inside one calm workflow. BookBuddy is designed for small local communities where trust, clarity, and follow-through matter.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <div>
                <Link
                  to="/register"
                  className="inline-flex rounded-md bg-primary px-8 py-3 text-lg font-medium text-white transition-colors hover:bg-primary/90"
                >
                  Sign up now
                </Link>
              </div>
              <div>
                <Link
                  to="/catalog?available=true"
                  className="inline-flex rounded-md border border-gray-300 bg-white px-8 py-3 text-lg font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Browse available books
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="bg-gray-100 px-4 py-12">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-3">
              <div>
                <h3 className="text-4xl font-bold text-primary mb-2">42</h3>
                <p className="text-gray-700">Neighborhood shelves currently sharing</p>
              </div>
              <div>
                <h3 className="text-4xl font-bold text-primary mb-2">380+</h3>
                <p className="text-gray-700">Books moving through active requests</p>
              </div>
              <div>
                <h3 className="text-4xl font-bold text-primary mb-2">94%</h3>
                <p className="text-gray-700">On-time return rate across local exchanges</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      {showDeferredSections ? (
        <Suspense fallback={<FooterPlaceholder />}>
          <Footer />
        </Suspense>
      ) : (
        <FooterPlaceholder />
      )}
    </div>
  );
};

export default Home;
