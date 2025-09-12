// File: src/renderer/src/components/database/store.ts
import { create } from 'zustand'
import { FilterCondition, GetTableSchemaOutput, InitializeDatabaseOutput, Table } from './types'

type DatabaseModalType = 'database' | 'table'

type DatabaseErrorType = 'database' | 'table'

interface DatabaseStore {
  ready: boolean
  error: null | {
    message: string
    type: DatabaseErrorType
  }
  databaseId: string
  tableName: string
  tableSchema: null | Table
  modal: {
    open: boolean
    type: DatabaseModalType
  }
  searchTable: string
  sidebar: boolean
  query: {
    show: boolean
    filters: FilterCondition[]
  }
}

const defaultDatabaseStore: DatabaseStore = {
  ready: false,
  error: null,
  databaseId: '',
  tableName: '',
  tableSchema: null,
  modal: {
    open: false,
    type: 'table' as DatabaseModalType
  },
  searchTable: '',
  sidebar: true,
  query: {
    show: false,
    filters: []
  }
}

interface DatabaseState extends DatabaseStore {
  setReady(ready: boolean): void
  setInitialize(data?: InitializeDatabaseOutput): void
  setDatabaseId(id: string): boolean
  setTableName(name: string): boolean
  setTableSchema(data?: GetTableSchemaOutput): void
  openModal(type: DatabaseModalType): void
  setModal(open: boolean): void
  setSearchTable(value: string): void
  toggleSidebar(): void
  openFilters(open: boolean): void
  setFilters(filters: FilterCondition[]): void
}

const useDatabaseStore = create<DatabaseState>()((set, get) => ({
  ...defaultDatabaseStore,
  setReady: (ready) => set({ ready }),
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
  setDatabaseId: (databaseId) => {
    if (get().databaseId === databaseId) return false
    set({ ...defaultDatabaseStore, databaseId })
    return true
  },
  setTableName: (tableName) => {
    if (get().tableName === tableName) return false
    set({ tableName })
    return true
  },
  setTableSchema: (data) => {
    if (data?.error) {
      return set({
        error: {
          message: data.error,
          type: 'table'
        }
      })
    }
    return set({ tableSchema: data?.schema ?? null })
  },
  openModal: (type) => set({ modal: { open: true, type } }),
  setModal: (open) => set({ modal: { open, type: get().modal.type } }),
  setSearchTable: (searchTable) => set({ searchTable }),
  toggleSidebar: () => set({ sidebar: !get().sidebar }),
  setFilters: (filters) => set({ query: { filters, show: !!filters.length } }),
  openFilters: (show) => {
    const { filters } = get().query
    set({
      query: {
        show,
        filters: !show
          ? filters
          : filters.length
            ? filters
            : [
                {
                  field: '',
                  operator: 'contains',
                  value: ''
                }
              ]
      }
    })
  }
}))

export default useDatabaseStore
