// File: src/renderer/src/components/database/store.ts
import { create } from 'zustand'
import { InitializeDatabaseOutput } from './types'

type DatabaseModalType = 'database' | 'table'

type DatabaseErrorType = 'database' | 'table'

interface DatabaseState {
  ready: boolean
  setReady(ready: boolean): void
  error: null | {
    message: string
    type: DatabaseErrorType
  }
  setInitialize(data?: InitializeDatabaseOutput): void
  databaseId: string
  setDatabaseId(id: string): boolean
  tableId: string
  setTableId(id: string): void
  modal: {
    open: boolean
    type: DatabaseModalType
  }
  openModal(type: DatabaseModalType): void
  setModal(open: boolean): void
  searchTable: string
  setSearchTable(value: string): void
}

const useDatabaseStore = create<DatabaseState>()((set, get) => ({
  ready: false,
  setReady: (ready) => set({ ready }),
  error: null,
  setInitialize: (data) => {
    if (data?.error) {
      return set({
        ready: false,
        error: {
          message: data.error,
          type: 'database'
        }
      })
    }
    return set({ ready: true, error: null })
  },
  databaseId: '',
  setDatabaseId: (databaseId) => {
    if (get().databaseId === databaseId) return false
    set({ databaseId, ready: false, tableId: '', error: null })
    return true
  },
  tableId: '',
  setTableId: (tableId) => set({ tableId }),
  modal: {
    open: false,
    type: 'table' as DatabaseModalType
  },
  openModal: (type) => set({ modal: { open: true, type } }),
  setModal: (open) => set({ modal: { open, type: get().modal.type } }),
  searchTable: '',
  setSearchTable: (searchTable) => set({ searchTable })
}))

export default useDatabaseStore
