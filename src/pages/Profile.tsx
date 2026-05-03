import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/layout/PageTransition';
import ProfileCard from '@/components/profile/ProfileCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import BookCard from '@/components/books/BookCard';
import { useCatalogData } from '@/hooks/useCatalogData';
import { createFadeUpItem, createStaggerContainer } from '@/lib/motion';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const Profile = () => {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion() ?? false;
  const containerVariants = createStaggerContainer(shouldReduceMotion, 0.08, 0.04);
  const itemVariants = createFadeUpItem(shouldReduceMotion, 18);
  const { averageRating, profileBorrowedBooks, profileOwnedBooks } = useCatalogData();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleEditProfile = () => {
    toast({
      title: 'Profile synced',
      description:
        'Your BookBuddy account details are already connected. A full profile editor can be added next.',
    });
  };

  const handleRequestBook = (id: string) => {
    if (profileOwnedBooks.some((entry) => entry.id === id)) {
      navigate('/my-books');
      toast({
        title: 'Manage your shelf in My Books',
        description: 'Use My Books to pause lending or make a title available again.',
      });
      return;
    }

    if (profileBorrowedBooks.some((entry) => entry.id === id)) {
      navigate('/transactions');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <PageTransition className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow pt-[70px] px-4 py-8">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial="hidden"
            animate="show"
            variants={containerVariants}
            className="space-y-8"
          >
            <motion.div variants={itemVariants}>
              <ProfileCard
                user={{
                  id: user.id,
                  name: user.displayName || user.username,
                  username: user.username?.toLowerCase() || 'user',
                  avatar: user?.avatarUrl,
                  bio:
                    user.bio ||
                    'Book enthusiast with a balanced shelf of speculative fiction, memoirs, and conversation-starting nonfiction.',
                  location: user.location || 'BookBuddy community',
                  joinDate: new Date().toISOString(),
                  stats: {
                    books: profileOwnedBooks.length,
                    exchanges: profileBorrowedBooks.length + profileOwnedBooks.length,
                    rating: averageRating || 0,
                  },
                }}
                isCurrentUser={true}
                onEdit={handleEditProfile}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Tabs defaultValue="my-books">
                <TabsList className="mb-6">
                  <TabsTrigger value="my-books">My Books</TabsTrigger>
                  <TabsTrigger value="borrowed">Borrowed Books</TabsTrigger>
                  <TabsTrigger value="history">Exchange History</TabsTrigger>
                </TabsList>

                <TabsContent value="my-books">
                  <Card>
                    <CardContent className="p-6">
                      <motion.div
                        variants={containerVariants}
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                      >
                        {profileOwnedBooks.map((book) => (
                          <motion.div key={book.id} variants={itemVariants}>
                            <BookCard
                              id={book.id}
                              title={book.title}
                              author={book.author}
                              coverImage={book.coverImage}
                              condition={book.condition}
                              available={book.available}
                              genre={book.genre}
                              rating={book.rating}
                              publicationDate={book.publicationDate}
                              onRequest={handleRequestBook}
                              isOwner={true}
                            />
                          </motion.div>
                        ))}
                      </motion.div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="borrowed">
                  <Card>
                    <CardContent className="p-6">
                      {profileBorrowedBooks.length > 0 ? (
                        <motion.div
                          variants={containerVariants}
                          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                        >
                          {profileBorrowedBooks.map((book) => (
                            <motion.div key={book.id} variants={itemVariants}>
                              <BookCard
                                id={book.id}
                                title={book.title}
                                author={book.author}
                                coverImage={book.coverImage}
                                condition={book.condition}
                                available={book.available}
                                genre={book.genre}
                                rating={book.rating}
                                publicationDate={book.publicationDate}
                                onRequest={handleRequestBook}
                                borrowed={true}
                              />
                            </motion.div>
                          ))}
                        </motion.div>
                      ) : (
                        <div className="text-center py-12">
                          <p className="text-muted-foreground">
                            You haven't borrowed any books yet.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="history">
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">
                          Your exchange history will appear here as your next lending cycles
                          complete.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </PageTransition>
  );
};

export default Profile;
