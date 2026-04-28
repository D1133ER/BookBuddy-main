import { db, User } from '@/lib/mockDb';

export const getProfile = async (): Promise<User | null> => {
  const session = await db.getSession();
  const userId = session?.user?.id;
  if (!userId) return null;

  const users = await db.getUsers();
  return users.find((u) => u.id === userId) || null;
};

export const getUserById = async (id: string): Promise<User | null> => {
  const users = await db.getUsers();
  return users.find((u) => u.id === id) || null;
};

export const updateProfile = async (userData: Partial<User>): Promise<User> => {
  const session = await db.getSession();
  const userId = session?.user?.id;
  if (!userId) throw new Error('Not authenticated');

  const users = await db.getUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) throw new Error('User not found');

  const updatedUser = {
    ...users[index],
    ...userData,
    updated_at: new Date().toISOString(),
  };
  users[index] = updatedUser;
  await db.setUsers(users);

  // Update session if user profile changed
  await db.setSession({ user: updatedUser });

  return updatedUser;
};

export const getUserStats = async (userId: string) => {
  const books = (await db.getBooks()).filter((b) => b.owner_id === userId).length;
  const transactions = (await db.getTransactions()).filter(
    (t) => t.borrower_id === userId || t.lender_id === userId,
  ).length;
  const reviews = (await db.getReviews()).filter((r) => r.reviewee_id === userId);

  const rating =
    reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0;

  return {
    booksShared: books,
    transactionsCompleted: transactions,
    averageRating: rating,
    reviewsCount: reviews.length,
  };
};
