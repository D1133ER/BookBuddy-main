import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Book, ArrowRight } from 'lucide-react';
import PageTransition from '@/components/layout/PageTransition';
import { useAuth } from '@/contexts/AuthContext';
import { loginSchema } from '@/lib/validations';
import { ZodError } from 'zod';
import { getErrorMessage } from '@/lib/helpers';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const fillDemoCredentials = () => {
    setEmail('maya@bookbuddy.local');
    setPassword('BookBuddy123');
  };

  // Get the redirect path from location state, default to dashboard
  const from =
    (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate inputs
    try {
      loginSchema.parse({ email, password });
    } catch (validationError: unknown) {
      if (validationError instanceof ZodError) {
        setError(validationError.errors[0]?.message ?? 'Invalid input');
      } else {
        setError(getErrorMessage(validationError, 'Invalid input'));
      }
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to login. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition className="min-h-screen bg-white">
      <main role="main" className="min-h-screen flex bg-white">
        {/* Left Side - Form */}
        <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <div className="mb-8">
              <Link to="/" className="flex items-center gap-2 mb-8">
                <div className="bg-primary/10 p-2 rounded-xl">
                  <Book className="h-6 w-6 text-primary" />
                </div>
                <span className="text-2xl font-bold text-gray-900">BookBuddy</span>
              </Link>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900 tracking-tight">
                Welcome back
              </h2>
              <p className="mt-2 text-sm text-gray-600">Sign in to continue your reading journey</p>
              <div className="mt-4 rounded-xl border border-primary/15 bg-primary/5 p-3 text-sm text-slate-700">
                <p className="font-medium text-slate-900">Demo member access</p>
                <p className="mt-1">
                  Use Maya's seeded community account to test requests, messaging, and returns
                  locally.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-3 h-9 rounded-lg"
                  onClick={fillDemoCredentials}
                >
                  Use demo account
                </Button>
              </div>
            </div>

            <div className="mt-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Password
                    </Label>
                    <a
                      href="mailto:hello@bookbuddy.local?subject=BookBuddy%20sign-in%20help"
                      className="text-sm font-medium text-primary hover:text-primary/60 transition-colors"
                    >
                      Need sign-in help?
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 rounded-xl"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 rounded-xl text-base font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    'Signing in...'
                  ) : (
                    <span className="flex items-center gap-2">
                      Sign in <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-2 text-gray-600">New to BookBuddy?</span>
                  </div>
                </div>

                <div className="mt-6">
                  <Link to="/register">
                    <Button
                      variant="outline"
                      className="w-full h-11 rounded-xl font-medium border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300"
                    >
                      Create an account
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Image */}
        <div className="hidden lg:block relative w-0 flex-1 bg-gray-50">
          <img
            className="absolute inset-0 h-full w-full object-cover"
            src="/hero-library.svg"
            alt="Illustration of community book lending"
            loading="eager"
          />
          <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/55 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-16 text-white">
            <h3 className="text-4xl font-bold mb-4">Discover your next great read.</h3>
            <p className="max-w-xl text-lg text-white/95">
              Join thousands of readers in your local community who are sharing their favorite
              books, discovering new authors, and building lasting connections through literature.
            </p>
          </div>
        </div>
      </main>
    </PageTransition>
  );
};

export default Login;
