import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BookCard from '@/components/books/BookCard';

// Framer motion uses ResizeObserver in jsdom; stub it.
// @ts-expect-error
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('BookCard', () => {
  const baseProps = {
    id: 'book-1',
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    condition: 5,
    available: true,
    genre: 'Fantasy',
    rating: 4.8,
  };

  it('renders title and author', () => {
    render(<BookCard {...baseProps} />);
    expect(screen.getByText('The Hobbit')).toBeInTheDocument();
    expect(screen.getByText('J.R.R. Tolkien')).toBeInTheDocument();
  });

  it('renders condition stars correctly', () => {
    const { container } = render(<BookCard {...baseProps} condition={3} />);
    const stars = container.querySelectorAll('.lucide-star');
    expect(stars).toHaveLength(5);

    // 3 filled stars (yellow), 2 unfilled (gray)
    expect(stars[0]).toHaveClass('fill-yellow-500');
    expect(stars[2]).toHaveClass('fill-yellow-500');
    expect(stars[3]).not.toHaveClass('fill-yellow-500');
  });

  it('shows Available badge when available', () => {
    render(<BookCard {...baseProps} available={true} />);
    expect(screen.getByText('Available')).toBeInTheDocument();
  });

  it('shows Unavailable badge when not available', () => {
    render(<BookCard {...baseProps} available={false} />);
    expect(screen.getByText('Unavailable')).toBeInTheDocument();
  });

  it('shows rating when provided', () => {
    render(<BookCard {...baseProps} />);
    expect(screen.getByText(/4\.8/)).toBeInTheDocument();
  });

  it('calls onRequest with the book id when button is clicked', () => {
    const onRequest = vi.fn();
    render(<BookCard {...baseProps} onRequest={onRequest} />);
    fireEvent.click(screen.getByRole('button', { name: /request book/i }));
    expect(onRequest).toHaveBeenCalledWith('book-1');
  });

  it('disables the button when book is not available and not owner', () => {
    render(<BookCard {...baseProps} available={false} isOwner={false} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows Pause Lending button text for owner with available book', () => {
    render(<BookCard {...baseProps} isOwner={true} available={true} />);
    expect(screen.getByRole('button', { name: /pause lending/i })).toBeInTheDocument();
  });

  it('shows Make Available button text for owner with unavailable book', () => {
    render(<BookCard {...baseProps} isOwner={true} available={false} />);
    expect(screen.getByRole('button', { name: /make available/i })).toBeInTheDocument();
  });

  it('renders a fallback title when no title prop is given', () => {
    render(<BookCard />);
    expect(screen.getByText('Community Pick')).toBeInTheDocument();
  });
});
