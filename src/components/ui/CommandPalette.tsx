import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, Home, LayoutDashboard, BookOpen, MessageSquare, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAvailableBooks } from '@/hooks/useBooks';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';

export const CommandPalette = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = useCallback((callback: () => void) => {
    setOpen(false);
    callback();
  }, []);

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          value={search}
          onValueChange={setSearch}
          placeholder="Search books, pages, or actions..."
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Pages">
            <CommandItem onSelect={() => handleSelect(() => navigate('/'))}>
              <Home className="mr-2 h-4 w-4" />
              <span>Home</span>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect(() => navigate('/catalog'))}>
              <Book className="mr-2 h-4 w-4" />
              <span>Catalog</span>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect(() => navigate('/dashboard'))}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </CommandItem>
            {isLoggedIn && (
              <>
                <CommandItem onSelect={() => handleSelect(() => navigate('/my-books'))}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  <span>My Books</span>
                </CommandItem>
                <CommandItem onSelect={() => handleSelect(() => navigate('/transactions'))}>
                  <Book className="mr-2 h-4 w-4" />
                  <span>Transactions</span>
                </CommandItem>
                <CommandItem onSelect={() => handleSelect(() => navigate('/messages'))}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  <span>Messages</span>
                </CommandItem>
                <CommandItem onSelect={() => handleSelect(() => navigate('/profile'))}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </CommandItem>
              </>
            )}
          </CommandGroup>
          {search.length >= 2 && <BookSearchResults search={search} onSelect={handleSelect} />}
        </CommandList>
      </CommandDialog>
      <kbd className="fixed bottom-4 right-4 hidden rounded-md border bg-white px-2 py-1 text-xs text-gray-400 shadow dark:bg-gray-800 sm:block">
        ⌘K
      </kbd>
    </>
  );
};

function BookSearchResults({
  search,
  onSelect,
}: {
  search: string;
  onSelect: (cb: () => void) => void;
}) {
  const navigate = useNavigate();
  const { data: books, isLoading } = useAvailableBooks(search);

  if (isLoading) {
    return (
      <CommandGroup heading="Books">
        <CommandItem disabled>Searching...</CommandItem>
      </CommandGroup>
    );
  }

  if (!books?.length) {
    return null;
  }

  return (
    <CommandGroup heading="Books">
      {books.slice(0, 5).map((book) => (
        <CommandItem
          key={book.id}
          value={book.title}
          onSelect={() => onSelect(() => navigate(`/catalog?book=${book.id}`))}
        >
          <Book className="mr-2 h-4 w-4" />
          <span className="flex-1">{book.title}</span>
          <span className="text-xs text-muted-foreground">by {book.author}</span>
        </CommandItem>
      ))}
    </CommandGroup>
  );
}

export default CommandPalette;
