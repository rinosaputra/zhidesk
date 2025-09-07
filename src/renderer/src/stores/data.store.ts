// File: src/renderer/src/stores/data.store.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface DataState {
  currentCollection: string | null
  collections: string[]
  selectedItems: string[]
  filter: string
  sortBy: string
  sortOrder: 'asc' | 'desc'

  // Actions
  setCurrentCollection: (collection: string | null) => void
  setCollections: (collections: string[]) => void
  setSelectedItems: (items: string[]) => void
  setFilter: (filter: string) => void
  setSortBy: (field: string) => void
  setSortOrder: (order: 'asc' | 'desc') => void
  toggleSortOrder: () => void
  clearSelection: () => void
}

export const useDataStore = create<DataState>()(
  devtools(
    (set) => ({
      // Initial state
      currentCollection: null,
      collections: [],
      selectedItems: [],
      filter: '',
      sortBy: 'id',
      sortOrder: 'asc',

      // Actions
      setCurrentCollection: (collection) => set({ currentCollection: collection }),
      setCollections: (collections) => set({ collections }),
      setSelectedItems: (items) => set({ selectedItems: items }),
      setFilter: (filter) => set({ filter }),
      setSortBy: (field) => set({ sortBy: field }),
      setSortOrder: (order) => set({ sortOrder: order }),
      toggleSortOrder: () =>
        set((state) => ({
          sortOrder: state.sortOrder === 'asc' ? 'desc' : 'asc'
        })),
      clearSelection: () => set({ selectedItems: [] })
    }),
    {
      name: 'data-store',
      enabled: process.env.NODE_ENV === 'development'
    }
  )
)
