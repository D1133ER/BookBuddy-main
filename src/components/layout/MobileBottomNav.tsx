import { Link, useLocation } from 'react-router-dom';
import { Home, Search, PlusSquare, MessageSquare, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const MobileNavItem = ({
  to,
  icon: Icon,
  label,
  isActive,
}: {
  to: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
}) => (
  <Link
    to={to}
    className={cn(
      'flex flex-col items-center justify-center gap-1 rounded-lg p-2 transition-colors',
      isActive ? 'text-primary' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-100',
    )}
    aria-current={isActive ? 'page' : undefined}
  >
    <Icon className="h-5 w-5" />
    <span className="text-xs font-medium">{label}</span>
  </Link>
);

export const MobileBottomNav = () => {
  const location = useLocation();
  const { isLoggedIn } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 px-2 py-2 backdrop-blur support-[transition-safe]:transition-all support-[transition-safe]:duration-200 dark:border-gray-800 dark:bg-gray-950/95 lg:hidden"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        <MobileNavItem to="/" icon={Home} label="Home" isActive={isActive('/')} />
        <MobileNavItem to="/catalog" icon={Search} label="Browse" isActive={isActive('/catalog')} />
        {isLoggedIn ? (
          <>
            <MobileNavItem
              to="/my-books"
              icon={PlusSquare}
              label="My Books"
              isActive={isActive('/my-books')}
            />
            <MobileNavItem
              to="/messages"
              icon={MessageSquare}
              label="Messages"
              isActive={isActive('/messages')}
            />
            <MobileNavItem
              to="/profile"
              icon={User}
              label="Profile"
              isActive={isActive('/profile')}
            />
          </>
        ) : (
          <MobileNavItem to="/login" icon={User} label="Sign In" isActive={isActive('/login')} />
        )}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
