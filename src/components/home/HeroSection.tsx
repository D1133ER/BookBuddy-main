
import { Link } from "react-router-dom";

interface HeroSectionProps {
  title?: string;
  description?: string;
  ctaText?: string;
  ctaTo?: string;
  secondaryCtaTo?: string;
  backgroundImage?: string;
}

const HeroSection = ({
  title = "Borrow Books From Nearby Readers",
  description = "BookBuddy helps neighbors share shelves, coordinate pickup, and keep returns organized without juggling chat apps, spreadsheets, or DMs.",
  ctaText = "Browse Books",
  ctaTo = "/catalog",
  secondaryCtaTo = "/register",
  backgroundImage = "/hero-library.svg",
}: HeroSectionProps) => {
  const trustedMembers = ["MC", "JB", "AB", "TA"];

  return (
    <div className="relative w-full min-h-[600px] bg-slate-900 overflow-hidden flex items-center">
      <div className="absolute inset-0">
        <img
          src={backgroundImage}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover"
          loading="eager"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/80 to-gray-900/35"></div>
      </div>

      <div className="relative z-10 flex h-full w-full max-w-7xl mx-auto flex-col items-start justify-center px-6 py-20 text-left">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/25 bg-slate-950/50 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
          <span className="flex h-2 w-2 rounded-full bg-primary"></span>
          Local lending, pickup, and return tracking
        </div>
        
        <h1 className="mb-6 max-w-3xl text-5xl font-extrabold leading-tight text-white md:text-6xl lg:text-7xl">
          {title}
        </h1>

        <p className="mb-10 max-w-2xl text-xl leading-relaxed text-white md:text-2xl">
          {description}
        </p>

        <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
          <div>
            <Link
              to={ctaTo}
              aria-label="Browse the community book catalog"
              className="inline-flex h-14 items-center justify-center rounded-xl bg-primary px-8 text-lg font-medium text-white shadow-lg shadow-primary/30 transition-colors hover:bg-primary/90"
            >
              {ctaText}
            </Link>
          </div>

          <div>
            <Link
              to={secondaryCtaTo}
              aria-label="Create a free account and start lending locally"
              className="inline-flex h-14 items-center justify-center rounded-xl border border-white/35 bg-slate-950/45 px-8 text-lg font-medium text-white backdrop-blur-md transition-colors hover:bg-slate-950/60"
            >
              Join for free
            </Link>
          </div>
        </div>

        <div className="mt-16 flex items-center gap-4 rounded-2xl border border-white/15 bg-slate-950/35 p-4 backdrop-blur-sm">
          <div className="flex -space-x-3">
            {trustedMembers.map((member) => (
              <div
                key={member}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-white/90 text-xs font-semibold text-slate-900"
              >
                {member}
              </div>
            ))}
          </div>
          <p className="text-sm text-white">
            Trusted by neighborhood coordinators running <span className="font-bold">pickup-friendly</span> community shelves
          </p>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
