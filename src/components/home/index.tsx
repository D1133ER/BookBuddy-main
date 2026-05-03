import { Suspense, lazy, useEffect, useState, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import HeroSection from './HeroSection';
import PublicNavbar from '../layout/PublicNavbar';
import { useAuth } from '@/contexts/AuthContext';
import { useAvailableBooks } from '@/hooks/useBooks';
import { useRequestBookMutation } from '@/hooks/useTransactions';
// import { trackEvent } from '@/lib/analytics';
import { getErrorMessage } from '@/lib/helpers';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { ArrowRight, BookMarked, Users, Heart, Star, Sparkles } from 'lucide-react';

const FeaturedBooks = lazy(() => import('./FeaturedBooks'));
const HowItWorks = lazy(() => import('./HowItWorks'));
const Footer = lazy(() => import('../layout/Footer'));

const SectionPlaceholder = ({ id, className }: { id?: string; className: string }) => (
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
  const { data: books = [] } = useAvailableBooks();
  const featuredBooks = useMemo(() => books.slice(0, 6), [books]);

  const [showDeferredSections, setShowDeferredSections] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const requestMutation = useRequestBookMutation();

  useEffect(() => {
    if (!location.hash) return;
    const target = document.getElementById(location.hash.slice(1));
    if (target) {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      target.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start',
      });
    }
  }, [location.hash]);

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
    if (!isLoggedIn) {
      navigate('/login', { state: { from: location } });
      return;
    }

    try {
      await requestMutation.mutateAsync(bookId);
      toast.success('Request sent', {
        description: 'The owner has been notified and your request is now tracked in Transactions.',
      });
    } catch (error: unknown) {
      toast.error('Unable to request book', {
        description: getErrorMessage(error, 'Please try again in a moment.'),
      });
    }
  };

  const benefits = [
    {
      icon: <BookMarked className="w-6 h-6" />,
      title: 'List Books',
      desc: 'Share your collection with neighbors',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Connect',
      desc: 'Meet fellow book lovers',
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: 'Build Trust',
      desc: 'Create a reading community',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah M.',
      text: 'Found amazing books from neighbors!',
      rating: 5,
    },
    {
      name: 'James L.',
      text: 'My bookshelf has never been fuller.',
      rating: 5,
    },
    { name: 'Emma K.', text: 'Love the pickup system.', rating: 5 },
  ];

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />
      <main className="pt-[70px]">
        <HeroSection />

        {/* Benefits Section */}
        <section className="bg-gradient-to-b from-white to-slate-50 py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex flex-col items-center text-center p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{benefit.title}</h3>
                  <p className="text-slate-600">{benefit.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {showDeferredSections ? (
          <Suspense
            fallback={<SectionPlaceholder id="community" className="min-h-[560px] bg-gray-50" />}
          >
            <section id="community">
              <FeaturedBooks books={featuredBooks} onRequest={handleFeaturedRequest} />
            </section>
          </Suspense>
        ) : (
          <SectionPlaceholder id="community" className="min-h-[560px] bg-gray-50" />
        )}

        {/* Testimonials */}
        <section className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <h2 className="text-3xl font-bold text-white mb-3">What Readers Say</h2>
              <p className="text-white/80">Join thousands of happy book swappers</p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-6"
                >
                  <div className="flex gap-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-white mb-3">"{testimonial.text}"</p>
                  <p className="text-white/70 font-medium">- {testimonial.name}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {showDeferredSections ? (
          <Suspense
            fallback={
              <SectionPlaceholder id="how-it-works" className="min-h-[420px] bg-slate-50" />
            }
          >
            <div id="how-it-works">
              <HowItWorks />
            </div>
          </Suspense>
        ) : (
          <SectionPlaceholder id="how-it-works" className="min-h-[420px] bg-slate-50" />
        )}

        {/* CTA Section */}
        <section id="neighbor-shelves" className="bg-white px-4 py-20">
          <div className="container mx-auto max-w-6xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-100 rounded-full blur-3xl -z-10" />
              <Sparkles className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
              <h2 className="mb-6 text-3xl md:text-4xl font-bold text-slate-950">
                Ready to start your neighborhood shelf?
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600">
                Join BookBuddy today and discover how easy it is to share books with your community.
                Start lending, borrowing, and building connections through literature.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-4 text-lg font-medium text-white shadow-lg shadow-indigo-500/40 hover:bg-indigo-700 hover:scale-105 hover:shadow-xl transition-all"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/catalog?available=true"
                  className="inline-flex rounded-xl border-2 border-gray-300 bg-white px-8 py-4 text-lg font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:scale-105 transition-all"
                >
                  Browse Books
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-slate-900 px-4 py-16">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { number: '500+', label: 'Active Communities' },
                { number: '5K+', label: 'Books Shared' },
                { number: '12K+', label: 'Happy Readers' },
                { number: '98%', label: 'Return Rate' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <h3 className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.number}</h3>
                  <p className="text-gray-400">{stat.label}</p>
                </motion.div>
              ))}
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
