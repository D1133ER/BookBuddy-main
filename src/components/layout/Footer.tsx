
import { Link } from "react-router-dom";
import { Mail, MapPin, ShieldCheck } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full bg-slate-900 text-white py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold">BookBuddy</h3>
            <p className="text-slate-300">
              A local-first lending workflow for real neighborhoods. Share books,
              coordinate pickup, and keep returns from slipping through the cracks.
            </p>
            <div className="space-y-2 text-sm text-slate-200">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-400" />
                Pickup-friendly community shelves
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-slate-400" />
                Requests and return tracking in one place
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Explore</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/catalog"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Book Catalog
                </Link>
              </li>
              <li>
                <Link
                  to="/catalog?available=true"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Available Now
                </Link>
              </li>
              <li>
                <Link
                  to="/#community"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Community Shelf
                </Link>
              </li>
              <li>
                <Link
                  to="/#how-it-works"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Account</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/profile"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  My Profile
                </Link>
              </li>
              <li>
                <Link
                  to="/my-books"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  My Books
                </Link>
              </li>
              <li>
                <Link
                  to="/transactions"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Transactions
                </Link>
              </li>
              <li>
                <Link
                  to="/messages"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Messages
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/register"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Start Lending
                </Link>
              </li>
              <li>
                <a
                  href="mailto:hello@bookbuddy.local"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Contact Support
                </a>
              </li>
              <li>
                <Link
                  to="/transactions"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Track Requests
                </Link>
              </li>
              <li>
                <Link
                  to="/messages"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Coordinate Pickups
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-700 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-300 text-sm">
            &copy; {new Date().getFullYear()} BookBuddy. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex items-center space-x-2">
            <Mail className="h-4 w-4 text-slate-300" />
            <a href="mailto:hello@bookbuddy.local" className="text-slate-300 text-sm hover:text-white transition-colors">
              hello@bookbuddy.local
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
