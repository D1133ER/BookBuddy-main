import { db } from "@/lib/mockDb";

export type Review = typeof db.reviews[0];
export type ReviewInsert = Omit<Review, "id" | "created_at" | "reviewee_id"> & { reviewee_id?: string };

export async function getReviewsByUser(userId: string) {
  const reviews = db.reviews.filter(r => r.reviewee_id === userId)
    .sort((a, b) => (a.created_at && b.created_at && a.created_at < b.created_at ? 1 : -1));

  return reviews.map(r => {
    const reviewer = db.users.find(u => u.id === r.reviewer_id);
    const transaction = db.transactions.find(t => t.id === r.transaction_id);
    return { ...r, reviewer, transaction };
  });
}

export async function addReview(review: Omit<ReviewInsert, "reviewer_id">) {
  const session = db.session;
  const user = session?.user;
  if (!user) throw new Error("User not authenticated");

  const transaction = db.transactions.find(t => t.id === review.transaction_id);
  if (!transaction) throw new Error("Transaction not found");
  if (transaction.status !== "completed")
    throw new Error("Transaction must be completed to leave a review");

  if (
    transaction.borrower_id !== user.id &&
    transaction.lender_id !== user.id
  ) {
    throw new Error("You can only review transactions you were part of");
  }

  const revieweeId =
    transaction.borrower_id === user.id
      ? transaction.lender_id
      : transaction.borrower_id;

  const existingReview = db.reviews.find(
    r => r.transaction_id === review.transaction_id && r.reviewer_id === user.id
  );

  if (existingReview)
    throw new Error("You have already reviewed this transaction");

  const newReview = {
    id: db.generateId(),
    transaction_id: review.transaction_id,
    reviewer_id: user.id,
    reviewee_id: revieweeId,
    rating: review.rating,
    comment: review.comment,
    created_at: new Date().toISOString(),
  };

  db.reviews = [...db.reviews, newReview];
  return newReview;
}

export async function updateReview(id: string, updates: Partial<Review>) {
  const reviews = db.reviews;
  const index = reviews.findIndex(r => r.id === id);
  if (index === -1) throw new Error("Review not found");

  const updatedReview = { ...reviews[index], ...updates };
  reviews[index] = updatedReview;
  db.reviews = reviews;

  return updatedReview;
}

export async function deleteReview(id: string) {
  db.reviews = db.reviews.filter(r => r.id !== id);
  return true;
}
