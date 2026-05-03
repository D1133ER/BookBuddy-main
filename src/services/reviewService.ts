import { db, type Review } from '@/lib/mockDb';

export type ReviewData = Review;
export type ReviewInsert = Omit<Review, 'id' | 'created_at' | 'reviewee_id'> & {
  reviewee_id?: string;
};

export async function getReviewsByUser(userId: string) {
  const reviews = (await db.getReviews())
    .filter((r) => r.reviewee_id === userId)
    .sort((a, b) => (a.created_at && b.created_at && a.created_at < b.created_at ? 1 : -1));

  const users = await db.getUsers();
  const transactions = await db.getTransactions();

  return reviews.map((r) => {
    const reviewer = users.find((u) => u.id === r.reviewer_id);
    const transaction = transactions.find((t) => t.id === r.transaction_id);
    return { ...r, reviewer, transaction };
  });
}

export async function addReview(review: Omit<ReviewInsert, 'reviewer_id'>) {
  const session = await db.getSession();
  const user = session?.user;
  if (!user) throw new Error('User not authenticated');

  const transactions = await db.getTransactions();
  const transaction = transactions.find((t) => t.id === review.transaction_id);
  if (!transaction) throw new Error('Transaction not found');
  if (transaction.status !== 'completed')
    throw new Error('Transaction must be completed to leave a review');

  if (transaction.borrower_id !== user.id && transaction.lender_id !== user.id) {
    throw new Error('You can only review transactions you were part of');
  }

  const revieweeId =
    transaction.borrower_id === user.id ? transaction.lender_id : transaction.borrower_id;

  const allReviews = await db.getReviews();
  const existingReview = allReviews.find(
    (r) => r.transaction_id === review.transaction_id && r.reviewer_id === user.id,
  );

  if (existingReview) throw new Error('You have already reviewed this transaction');

  const newReview: Review = {
    id: db.generateId(),
    transaction_id: review.transaction_id,
    reviewer_id: user.id,
    reviewee_id: revieweeId,
    rating: review.rating,
    comment: review.comment,
    created_at: new Date().toISOString(),
  };

  await db.setReviews([...allReviews, newReview]);
  return newReview;
}

export async function updateReview(id: string, updates: Partial<Review>) {
  const reviews = await db.getReviews();
  const index = reviews.findIndex((r) => r.id === id);
  if (index === -1) throw new Error('Review not found');

  const updatedReview = { ...reviews[index], ...updates };
  reviews[index] = updatedReview;
  await db.setReviews(reviews);

  return updatedReview;
}

export async function deleteReview(id: string) {
  const reviews = await db.getReviews();
  await db.setReviews(reviews.filter((r) => r.id !== id));
  return true;
}
