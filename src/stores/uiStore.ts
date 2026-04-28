import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface ModalState {
  isAddBookOpen: boolean;
  isDeleteConfirmOpen: boolean;
  selectedBookId: string | null;
  isBookDetailOpen: boolean;
  bookDetailId: string | null;

  // Filters
  catalogFilters: {
    searchTerm: string;
    genres: string[];
    availability: boolean | null;
    condition: number | null;
    sortBy: 'title' | 'author' | 'rating' | 'dateAdded';
  };

  // UI state
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;

  // Actions
  openAddBook: () => void;
  closeAddBook: () => void;
  openDeleteConfirm: (bookId: string) => void;
  closeDeleteConfirm: () => void;
  openBookDetail: (bookId: string) => void;
  closeBookDetail: () => void;
  setCatalogFilters: (filters: Partial<CatalogFilters>) => void;
  resetCatalogFilters: () => void;
  toggleSidebar: () => void;
  toggleMobileMenu: () => void;
}

type CatalogFilters = ModalState['catalogFilters'];

const defaultFilters: CatalogFilters = {
  searchTerm: '',
  genres: [],
  availability: null,
  condition: null,
  sortBy: 'title',
};

export const useUIStore = create<ModalState>()(
  devtools(
    (set) => ({
      // Modals
      isAddBookOpen: false,
      isDeleteConfirmOpen: false,
      selectedBookId: null,
      isBookDetailOpen: false,
      bookDetailId: null,

      // Filters
      catalogFilters: defaultFilters,

      // UI state
      sidebarOpen: true,
      mobileMenuOpen: false,

      // Actions
      openAddBook: () => set({ isAddBookOpen: true }),
      closeAddBook: () => set({ isAddBookOpen: false }),

      openDeleteConfirm: (bookId) =>
        set({
          isDeleteConfirmOpen: true,
          selectedBookId: bookId,
        }),
      closeDeleteConfirm: () =>
        set({
          isDeleteConfirmOpen: false,
          selectedBookId: null,
        }),

      openBookDetail: (bookId) =>
        set({
          isBookDetailOpen: true,
          bookDetailId: bookId,
        }),
      closeBookDetail: () =>
        set({
          isBookDetailOpen: false,
          bookDetailId: null,
        }),

      setCatalogFilters: (filters) =>
        set((state) => ({
          catalogFilters: { ...state.catalogFilters, ...filters },
        })),

      resetCatalogFilters: () => set({ catalogFilters: defaultFilters }),

      toggleSidebar: () =>
        set((state) => ({
          sidebarOpen: !state.sidebarOpen,
        })),

      toggleMobileMenu: () =>
        set((state) => ({
          mobileMenuOpen: !state.mobileMenuOpen,
        })),
    }),
    { name: 'UIStore' },
  ),
);
