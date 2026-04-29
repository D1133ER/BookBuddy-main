import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Users, MapPin, Heart } from 'lucide-react';

interface HeroSectionProps {
  title?: string;
  description?: string;
  ctaText?: string;
  ctaTo?: string;
  secondaryCtaTo?: string;
  backgroundImage?: string;
}

const HeroSection = ({
  title = 'Borrow Books From Nearby Readers',
  description = 'BookBuddy helps neighbors share shelves, coordinate pickup, and keep returns organized without juggling chat apps, spreadsheets, or DMs.',
  ctaText = 'Browse Books',
  ctaTo = '/catalog',
  secondaryCtaTo = '/register',
  backgroundImage = '/hero-library.svg',
}: HeroSectionProps) => {
  const trustedMembers = ['MC', 'JB', 'AB', 'TA'];

  const features = [
    { icon: <MapPin className="w-5 h-5" />, text: 'Local pickup' },
    { icon: <BookOpen className="w-5 h-5" />, text: 'Share books' },
    { icon: <Heart className="w-5 h-5" />, text: 'Build community' },
  ];

  return (
    <div className="relative w-full min-h-[700px] bg-slate-900 overflow-hidden flex items-center">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <img
          src={backgroundImage}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover"
          loading="eager"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/80 to-slate-800/40"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent"></div>
      </div>

      {/* Animated floating orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute top-20 -left-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        className="absolute bottom-10 -right-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"
      />

      <div className="relative z-10 flex h-full w-full max-w-7xl mx-auto flex-col items-start justify-center px-6 py-20 text-left">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 flex flex-wrap items-center gap-3"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
              className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-4 py-1.5 text-sm font-medium text-white"
            >
              {feature.icon}
              {feature.text}
            </motion.div>
          ))}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6 max-w-3xl text-5xl font-extrabold leading-tight text-white md:text-6xl lg:text-7xl"
        >
          {title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-10 max-w-2xl text-xl leading-relaxed text-white/80 md:text-2xl"
        >
          {description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row"
        >
          <div>
            <Link
              to={ctaTo}
              aria-label="Browse the community book catalog"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 text-lg font-medium text-white shadow-lg shadow-indigo-500/40 hover:bg-indigo-500 hover:scale-105 hover:shadow-xl transition-all"
            >
              {ctaText}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div>
            <Link
              to={secondaryCtaTo}
              aria-label="Create a free account and start lending locally"
              className="inline-flex h-14 items-center justify-center rounded-xl border-2 border-white/40 bg-transparent backdrop-blur-md px-8 text-lg font-medium text-white hover:bg-white hover:text-indigo-600 hover:scale-105 transition-all"
            >
              Join for free
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 rounded-2xl border border-white/15 bg-slate-900/50 p-5 backdrop-blur-sm"
        >
          <div className="flex -space-x-3">
            {trustedMembers.map((member, index) => (
              <motion.div
                key={member}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-900 bg-gradient-to-br from-indigo-500 to-purple-500 text-sm font-bold text-white"
              >
                {member}
              </motion.div>
            ))}
          </div>
          <div>
            <p className="text-sm text-white">
              <span className="font-bold text-white">Trusted by 500+</span> neighborhood
              coordinators
            </p>
            <p className="text-xs text-white/60">Running pickup-friendly community shelves</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;
