// File: src/renderer/src/components/database/store.ts
import { create } from 'zustand'
import {
  FilterCondition,
  GetTableSchemaOutput,
  InitializeDatabaseOutput,
  QueryOptions,
  Table
} from './types'

type DatabaseModalType = 'database' | 'table' | 'record'

type DatabaseErrorType = 'database' | 'table'

type DatabaseStoreModal<Method extends 'create' | 'update', Value = undefined, Id = undefined> = {
  method: Method
  value: Value
  id: Id
}

type DatabaseStoreModalGen =
  | DatabaseStoreModal<'create'>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | DatabaseStoreModal<'update', any, string>

export interface DatabaseStore {
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
  } & DatabaseStoreModalGen
  searchTable: string
  sidebar: boolean
  query: {
    show: boolean
    filters: FilterCondition[]
  }
  pagination: Record<'limit' | 'skip', number>
  sort: Record<string, 'asc' | 'desc' | undefined>
}

const defaultDatabaseStore: DatabaseStore = {
  ready: false,
  error: null,
  databaseId: '',
  tableName: '',
  modal: {
    open: false,
    type: 'table' as DatabaseModalType,
    method: 'create',
    id: undefined,
    value: undefined
  },
  searchTable: '',
  tableSchema: null,
  sidebar: true,
  query: {
    show: false,
    filters: []
  },
  pagination: {
    limit: 20,
    skip: 0
  },
  sort: {}
}

interface DatabaseState extends DatabaseStore {
  setReady(ready: boolean): void
  setInitialize(data?: InitializeDatabaseOutput): void
  setDatabaseId(id: string): boolean
  setTableName(name: string): boolean
  setTableSchema(data?: GetTableSchemaOutput): void
  openModal(type: DatabaseModalType, gen: DatabaseStoreModalGen): void
  setModal(open: boolean): void
  setSearchTable(value: string): void
  toggleSidebar(): void
  openFilters(open: boolean): void
  setFilters(filters: FilterCondition[]): void
  setPagination(name: 'limit' | 'page', size: number): void
  toggleSort(field: string): void
  getQueryOptions(): QueryOptions
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
    const data = get()
    if (data.tableName === tableName) return false
    set({
      ...defaultDatabaseStore,
      databaseId: data.databaseId,
      ready: data.ready,
      error: data.error,
      tableName
    })
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
  openModal: (type, gen) =>
    set({ modal: { ...(gen as DatabaseStoreModal<'create'>), type, open: true } }),
  setModal: (open) => set({ modal: { ...get().modal, open } }),
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
  },
  setPagination: (name, size) => set({ pagination: { ...get().pagination, [name]: size } }),
  toggleSort: (field) => {
    const sort = get().sort
    const find = sort[field]
    if (find === 'desc') {
      set({ sort: { ...sort, [field]: undefined } })
    } else if (find === 'asc') {
      set({ sort: { ...sort, [field]: 'desc' } })
    } else {
      set({ sort: { ...sort, [field]: 'asc' } })
    }
  },
  getQueryOptions: () => {
    const { pagination, sort } = get()
    return {
      ...pagination,
      sort: Object.fromEntries(
        Object.entries(sort)
          .filter(([, e]) => typeof e !== 'undefined')
          .map(([i, e]) => [i, e === 'asc' ? -1 : 1])
      )
    }
  }
}))

export default useDatabaseStore
