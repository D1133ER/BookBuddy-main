import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Book,
  MessageSquare,
  LogIn,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { getInitials } from "@/lib/helpers";

const Navbar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuth();
  
  const displayName = user?.displayName || user?.username || "Guest";
  const username = user?.username || "guest";
  const avatarUrl = user?.avatarUrl;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <nav className="fixed left-0 top-0 z-50 h-[70px] w-full border-b border-gray-200 bg-white/80 px-4 backdrop-blur-md md:px-6 lg:px-8">
      <div className="h-full flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <div className="bg-primary/10 p-1.5 rounded-lg mr-2">
            <Book className="h-5 w-5 text-primary" />
          </div>
          <span className="text-xl font-bold hidden sm:inline text-gray-900 tracking-tight">
            BookBuddy
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1 lg:space-x-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative w-64 lg:w-80">
            <Input
              type="text"
              placeholder="Search books..."
              className="pl-9 pr-4 py-2 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <button type="submit" className="sr-only">
              Search
            </button>
          </form>

          {/* Navigation Links */}
          <Link to="/">
            <Button variant="ghost">Home</Button>
          </Link>
          <Link to="/catalog">
            <Button variant="ghost">Catalog</Button>
          </Link>
          {isLoggedIn && (
            <>
              <Link to="/my-books">
                <Button variant="ghost">My Books</Button>
              </Link>
              <Link to="/messages">
                <Button variant="ghost">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Messages
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Search Toggle */}
        <div className="md:hidden flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            aria-label={isSearchOpen ? "Close mobile search" : "Open mobile search"}
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>

        {/* User Menu */}
        <div className="flex items-center">
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full"
                  aria-label={`Open account menu for ${displayName}`}
                >
                  <Avatar>
                    <AvatarImage src={avatarUrl || undefined} alt={`${displayName} avatar`} />
                    <AvatarFallback>
                      {getInitials(displayName)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{displayName}</p>
                    <p className="text-xs text-muted-foreground">@{username}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="cursor-pointer w-full">
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer w-full">
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/my-books" className="cursor-pointer w-full">
                    My Books
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/messages" className="cursor-pointer w-full">
                    Messages
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="hidden sm:flex">
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu */}
          <div className="md:hidden ml-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open navigation menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between py-4">
                    <div className="flex items-center">
                      <Book className="h-6 w-6 text-primary mr-2" />
                      <span className="text-xl font-bold">BookBuddy</span>
                    </div>
                    <SheetClose asChild>
                      <Button variant="ghost" size="icon" aria-label="Close navigation menu">
                        <X className="h-5 w-5" />
                      </Button>
                    </SheetClose>
                  </div>

                  <div className="space-y-4 py-4">
                    <div className="w-full">
                      <form onSubmit={handleSearch}>
                        <Input
                          type="text"
                          placeholder="Search books..."
                          className="w-full"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button type="submit" className="sr-only">
                          Search
                        </button>
                      </form>
                    </div>

                    <div className="flex flex-col space-y-3">
                      <SheetClose asChild>
                        <Link
                          to="/"
                          className="py-2 px-3 rounded-md hover:bg-gray-100"
                        >
                          Home
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          to="/catalog"
                          className="py-2 px-3 rounded-md hover:bg-gray-100"
                        >
                          Catalog
                        </Link>
                      </SheetClose>
                      {isLoggedIn ? (
                        <>
                          <SheetClose asChild>
                            <Link
                              to="/my-books"
                              className="py-2 px-3 rounded-md hover:bg-gray-100"
                            >
                              My Books
                            </Link>
                          </SheetClose>
                          <SheetClose asChild>
                            <Link
                              to="/messages"
                              className="py-2 px-3 rounded-md hover:bg-gray-100"
                            >
                              Messages
                            </Link>
                          </SheetClose>
                          <SheetClose asChild>
                            <Link
                              to="/dashboard"
                              className="py-2 px-3 rounded-md hover:bg-gray-100"
                            >
                              Dashboard
                            </Link>
                          </SheetClose>
                          <SheetClose asChild>
                            <Link
                              to="/profile"
                              className="py-2 px-3 rounded-md hover:bg-gray-100"
                            >
                              Profile
                            </Link>
                          </SheetClose>
                          <SheetClose asChild>
                            <div
                              className="py-2 px-3 rounded-md hover:bg-gray-100 cursor-pointer"
                              onClick={handleLogout}
                            >
                              <LogOut className="h-4 w-4 inline mr-2" />
                              Logout
                            </div>
                          </SheetClose>
                        </>
                      ) : (
                        <>
                          <SheetClose asChild>
                            <Link
                              to="/login"
                              className="py-2 px-3 rounded-md hover:bg-gray-100"
                            >
                              <LogIn className="h-4 w-4 inline mr-2" />
                              Login
                            </Link>
                          </SheetClose>
                          <SheetClose asChild>
                            <Link
                              to="/register"
                              className="py-2 px-3 rounded-md hover:bg-gray-100 font-medium"
                            >
                              Sign Up
                            </Link>
                          </SheetClose>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar (Conditional) */}
      {isSearchOpen && (
        <div className="absolute left-0 right-0 border-b border-gray-200 bg-white px-4 py-2 md:hidden">
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="text"
              placeholder="Search books..."
              className="pl-9 pr-4 py-2 w-full"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              onClick={() => setIsSearchOpen(false)}
              aria-label="Close search"
            >
              <X className="h-4 w-4" />
            </Button>
            <button type="submit" className="sr-only">
              Search
            </button>
          </form>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
