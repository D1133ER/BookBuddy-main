import { db, User } from "@/lib/mockDb";

export async function getCurrentUser() {
  const session = db.session;
  if (!session?.user) return null;

  return session.user;
}

export async function getUserById(id: string) {
  const users = db.users;
  return users.find(u => u.id === id) || null;
}

export async function updateUserProfile(id: string, updates: Partial<User>) {
  const users = db.users;
  const index = users.findIndex(u => u.id === id);
  if (index === -1) throw new Error("User not found");

  const updatedUser: User = {
    ...users[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };

  users[index] = updatedUser;
  db.users = users;

  return updatedUser;
}

export async function getUserStats(userId: string) {
  const books = db.books.filter(b => b.owner_id === userId).length;
  const transactions = db.transactions.filter(t => t.borrower_id === userId || t.lender_id === userId).length;
  const reviews = db.reviews.filter(r => r.reviewee_id === userId);
  
  let averageRating = 0;
  if (reviews.length > 0) {
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    averageRating = parseFloat((sum / reviews.length).toFixed(1));
  }

  return {
    books,
    exchanges: transactions,
    rating: averageRating,
  };
}
