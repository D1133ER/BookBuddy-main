import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Book, LogIn, LogOut, Menu, Search, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navLinkClassName =
  "rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950";

const actionLinkClassName =
  "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors";

const PublicNavbar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuth();

  const displayName = user?.displayName || user?.username || "Member";

  const closePanels = () => {
    setIsSearchOpen(false);
    setIsMenuOpen(false);
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextQuery = searchQuery.trim();
    if (!nextQuery) {
      return;
    }

    navigate(`/catalog?search=${encodeURIComponent(nextQuery)}`);
    closePanels();
  };

  const handleLogout = () => {
    logout();
    closePanels();
    navigate("/", { replace: true });
  };

  return (
    <nav className="fixed left-0 top-0 z-50 w-full border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-6 lg:px-8">
      <div className="mx-auto flex h-[70px] max-w-7xl items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2" aria-label="Go to the BookBuddy homepage">
            <div className="rounded-lg bg-primary/10 p-1.5">
              <Book className="h-5 w-5 text-primary" />
            </div>
            <span className="hidden text-xl font-bold tracking-tight text-slate-950 sm:inline">BookBuddy</span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            <Link to="/" className={navLinkClassName}>
              Home
            </Link>
            <Link to="/catalog" className={navLinkClassName}>
              Catalog
            </Link>
            <Link to="/#how-it-works" className={navLinkClassName}>
              How It Works
            </Link>
          </div>
        </div>

        <form onSubmit={handleSearch} className="relative hidden w-full max-w-sm md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search the catalog"
            className="h-10 w-full rounded-full border border-slate-300 bg-white pl-9 pr-4 text-sm text-slate-950 outline-none transition-colors placeholder:text-slate-500 focus:border-primary focus:ring-2 focus:ring-primary/20"
            aria-label="Search the catalog"
          />
        </form>

        <div className="hidden items-center gap-2 md:flex">
          {isLoggedIn ? (
            <>
              <span className="hidden text-sm font-medium text-slate-700 lg:inline">{displayName}</span>
              <Link to="/dashboard" className={navLinkClassName}>
                Dashboard
              </Link>
              <Link to="/messages" className={navLinkClassName}>
                Messages
              </Link>
              <Link to="/profile" className={navLinkClassName}>
                Profile
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className={`${actionLinkClassName} border border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-100`}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={`${actionLinkClassName} border border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-100`}>
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Link>
              <Link to="/register" className={`${actionLinkClassName} bg-primary text-white hover:bg-primary/90`}>
                Join BookBuddy
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={() => {
              setIsSearchOpen((current) => !current);
              setIsMenuOpen(false);
            }}
            className="rounded-md p-2 text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950"
            aria-label={isSearchOpen ? "Close mobile search" : "Open mobile search"}
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setIsMenuOpen((current) => !current);
              setIsSearchOpen(false);
            }}
            className="rounded-md p-2 text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950"
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isSearchOpen && (
        <div className="border-t border-slate-200 px-4 py-3 md:hidden">
          <form onSubmit={handleSearch} className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search the catalog"
              className="h-11 w-full rounded-full border border-slate-300 bg-white pl-9 pr-12 text-sm text-slate-950 outline-none transition-colors placeholder:text-slate-500 focus:border-primary focus:ring-2 focus:ring-primary/20"
              aria-label="Search the catalog"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setIsSearchOpen(false)}
              className="absolute right-2 top-1/2 rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950"
              aria-label="Close search"
            >
              <X className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      {isMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            <Link to="/" className={navLinkClassName} onClick={closePanels}>
              Home
            </Link>
            <Link to="/catalog" className={navLinkClassName} onClick={closePanels}>
              Catalog
            </Link>
            <Link to="/#how-it-works" className={navLinkClassName} onClick={closePanels}>
              How It Works
            </Link>

            {isLoggedIn ? (
              <>
                <div className="px-3 py-2 text-sm font-medium text-slate-700">Signed in as {displayName}</div>
                <Link to="/dashboard" className={navLinkClassName} onClick={closePanels}>
                  Dashboard
                </Link>
                <Link to="/messages" className={navLinkClassName} onClick={closePanels}>
                  Messages
                </Link>
                <Link to="/profile" className={navLinkClassName} onClick={closePanels}>
                  Profile
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center rounded-md px-3 py-2 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <div className="mt-2 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={closePanels}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-100"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={closePanels}
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
                >
                  Join BookBuddy
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default PublicNavbar;