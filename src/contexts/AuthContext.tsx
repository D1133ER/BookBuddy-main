import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCurrentUser, login as signIn, logout as signOut, register as signUp } from '@/services';
import { MOCK_DB_CHANGE_EVENT } from '@/lib/mockDb';

interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  location?: string;
  bio?: string;
  isAdmin?: boolean;
}

/** Raw shape of the user object stored in the mock DB session. */
interface SessionUser {
  id: string;
  username: string;
  display_name?: string;
  email?: string;
  avatar_url?: string;
  location?: string;
  bio?: string;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, _password?: string) => Promise<void>;
  register: (name: string, email: string, _password?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const persistLegacyAuthState = (user: User | null) => {
  if (user) {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('user', JSON.stringify(user));
    return;
  }

  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('user');
  localStorage.removeItem('auth_token');
};

const mapSessionUser = (sessionUser: SessionUser): User => ({
  id: sessionUser.id,
  username: sessionUser.username,
  displayName: sessionUser.display_name || sessionUser.username,
  email: sessionUser.email || '',
  avatarUrl: sessionUser.avatar_url || '',
  location: sessionUser.location,
  bio: sessionUser.bio,
  isAdmin: Boolean(sessionUser.isAdmin),
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      try {
        const currentUser = await getCurrentUser();

        if (!isMounted) {
          return;
        }

        if (currentUser) {
          const nextUser = mapSessionUser(currentUser);
          setUser(nextUser);
          setIsLoggedIn(true);
          persistLegacyAuthState(nextUser);
          return;
        }

        setUser(null);
        setIsLoggedIn(false);
        persistLegacyAuthState(null);
      } catch (error) {
        console.error('Auth session load error:', error);
        if (!isMounted) {
          return;
        }

        setUser(null);
        setIsLoggedIn(false);
        persistLegacyAuthState(null);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    const handleDbChange = (event: Event) => {
      const detail = (event as CustomEvent<{ key?: string }>).detail;
      if (!detail?.key || detail.key === 'session') {
        void loadSession();
      }
    };

    void loadSession();
    window.addEventListener(MOCK_DB_CHANGE_EVENT, handleDbChange as EventListener);

    return () => {
      isMounted = false;
      window.removeEventListener(MOCK_DB_CHANGE_EVENT, handleDbChange as EventListener);
    };
  }, []);

  const login = async (username: string, _password?: string) => {
    setIsLoading(true);

    try {
      const loggedUser = await signIn(username);
      if (loggedUser) {
        const nextUser = mapSessionUser(loggedUser);
        setUser(nextUser);
        setIsLoggedIn(true);
        persistLegacyAuthState(nextUser);
      } else {
        throw new Error('Invalid credentials');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, _password?: string) => {
    setIsLoading(true);

    try {
      const response = await signUp({
        display_name: name,
        email: email,
        username: email.split('@')[0],
      });
      const nextUser = mapSessionUser(response);
      setUser(nextUser);
      setIsLoggedIn(true);
      persistLegacyAuthState(nextUser);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    void signOut();
    setUser(null);
    setIsLoggedIn(false);
    persistLegacyAuthState(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
