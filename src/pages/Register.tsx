import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Book, ArrowRight } from 'lucide-react';
import PageTransition from '@/components/layout/PageTransition';
import { useAuth } from '@/contexts/AuthContext';
import { registerSchema } from '@/lib/validations';
import { ZodError } from 'zod';
import { getErrorMessage } from '@/lib/helpers';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      registerSchema.parse({
        username: name.trim().toLowerCase().replace(/\s+/g, '_'),
        email,
        password,
        confirmPassword,
      });

      await register(name, email, password);
      navigate('/dashboard');
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        setError(err.errors[0]?.message ?? 'Invalid input');
      } else {
        setError(getErrorMessage(err, 'Failed to register. Please try again.'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition className="min-h-screen bg-white">
      <main role="main" className="min-h-screen flex bg-white">
        {/* Left Side - Form */}
        <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 py-12">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <div className="mb-8">
              <Link to="/" className="flex items-center gap-2 mb-8">
                <div className="bg-primary/10 p-2 rounded-xl">
                  <Book className="h-6 w-6 text-primary" />
                </div>
                <span className="text-2xl font-bold text-gray-900">BookBuddy</span>
              </Link>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900 tracking-tight">
                Create an account
              </h2>
              <p className="mt-2 text-sm text-gray-600">Join our community of book lovers today</p>
            </div>

            <div className="mt-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-11 rounded-xl"
                    required
                  />
                </div>

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
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
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

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-11 rounded-xl"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 rounded-xl text-base font-medium mt-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    'Creating account...'
                  ) : (
                    <span className="flex items-center gap-2">
                      Create account <ArrowRight className="h-4 w-4" />
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
                    <span className="bg-white px-2 text-gray-600">Already have an account?</span>
                  </div>
                </div>

                <div className="mt-6">
                  <Link to="/login">
                    <Button
                      variant="outline"
                      className="w-full h-11 rounded-xl font-medium border-gray-200 text-gray-700 hover:bg-gray-50"
                    >
                      Sign in to existing account
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
            alt="Illustration of books shared across a neighborhood"
            loading="eager"
          />
          <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/55 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-16 text-white">
            <h3 className="text-4xl font-bold mb-4">
              Start a shelf your neighbors will actually use.
            </h3>
            <p className="max-w-xl text-lg text-white/95">
              Create a local-first account, list the books you are willing to lend, and keep every
              request, pickup, and return in one place.
            </p>
          </div>
        </div>
      </main>
    </PageTransition>
  );
};

export default Register;
