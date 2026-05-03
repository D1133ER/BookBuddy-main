export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: (stats: UserStats) => boolean;
};

export type UserStats = {
  transactionsCount: number;
  reviewsCount: number;
  booksLentCount: number;
};

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'prolific-lender',
    title: 'Prolific Lender',
    description: 'Lent out more than 5 books',
    icon: '📚',
    requirement: (stats) => stats.booksLentCount > 5,
  },
  {
    id: 'active-reviewer',
    title: 'Active Reviewer',
    description: 'Wrote more than 3 reviews',
    icon: '✍️',
    requirement: (stats) => stats.reviewsCount > 3,
  },
  {
    id: 'community-pillar',
    title: 'Community Pillar',
    description: 'Completed more than 10 transactions',
    icon: '🌟',
    requirement: (stats) => stats.transactionsCount > 10,
  },
];
