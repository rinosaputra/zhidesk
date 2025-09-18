/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { DatabaseService } from './service'
import {
  BuildSchemaTable,
  SchemaDatabase,
  SchemaDatabaseTableProps,
  SchemaTable,
  SchemaTableColumn,
  TableQuery,
  getSchemaCore
} from '@schema/database'
import { LowWithLodash } from '@service/libs/lowdb'
import { format } from 'date-fns'
import z from 'zod'

const createMockDb = (): SchemaDatabase => ({
  ...getSchemaCore(),
  name: 'Test DB',
  description: 'A test database',
  version: 1,
  tables: [
    {
      ...getSchemaCore(),
      name: 'users',
      description: 'Users table',
      columns: [
        {
          ...getSchemaCore(),
          name: 'name',
          description: 'User name',
          isNullable: false,
          isOptional: false,
          type: 'string'
        },
        {
          ...getSchemaCore(),
          name: 'age',
          description: 'User age',
          isNullable: false,
          isOptional: false,
          type: 'number'
        }
      ]
    }
  ]
})

describe('DatabaseService', () => {
  let service: DatabaseService
  let mockDb: SchemaDatabase
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockDbStore: any // Using 'any' for easier test setup

  beforeEach(() => {
    mockDb = createMockDb()
    const tableId = mockDb.tables[0]._id
    const nameColumnId = mockDb.tables[0].columns[0]._id
    const ageColumnId = mockDb.tables[0].columns[1]._id

    mockDbStore = {
      [mockDb._id]: {
        ...mockDb,
        tables: {
          [tableId]: {
            ...mockDb.tables[0],
            columns: {
              [nameColumnId]: mockDb.tables[0].columns[0],
              [ageColumnId]: mockDb.tables[0].columns[1]
            }
          }
        }
      }
    }

    service = new DatabaseService({
      defaultValue: mockDbStore,
      onMemory: true
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Initialization', () => {
    it('should initialize databases from constructor', () => {
      const db = service.getDatabaseInstance({ databaseId: mockDb._id })
      expect(db.value()?.name).toBe('Test DB')
    })

    it('should return cached database instance on subsequent calls', () => {
      const dbInstance1 = service.initializeDatabaseStore({})
      const dbInstance2 = service.initializeDatabaseStore({})
      expect(dbInstance1).toBe(dbInstance2)
    })

    it('should throw an error if database is not found', () => {
      expect(() => service.getDatabaseInstance({ databaseId: 'non-existent' })).toThrow(
        "Database with ID 'non-existent' not found"
      )
    })
  })

  describe('Audit Logs', () => {
    it('should get an audit log for the current date', () => {
      const log = service.getAuditLogStore({})
      expect(log).toBeInstanceOf(LowWithLodash)
      expect(log.chain.value()).toEqual([])
    })

    it('should log an audit event', async () => {
      const logEntry = {
        type: 'database' as const,
        method: 'insert' as const,
        data: { name: 'test' }
      }
      await service.logAuditEvent(logEntry)
      const log = service.getAuditLogStore({})
      const logged = log.chain.value()[0]
      expect(logged.type).toBe(logEntry.type)
      expect(logged.method).toBe(logEntry.method)
      expect(logged.data).toEqual(logEntry.data)
    })

    it('should not log an audit event if disabled', async () => {
      // @ts-expect-error - private property access for test
      service.configuration.disabled = { auditLogging: true }
      const logEntry = {
        type: 'database' as const,
        method: 'insert' as const,
        data: { name: 'test' }
      }
      await service.logAuditEvent(logEntry)
      const log = service.getAuditLogStore({})
      expect(log.chain.value()).toHaveLength(0)
    })

    it('should cache audit logs by date', () => {
      const key = format(new Date(), 'yyyy-MM-dd')
      const log1 = service.getAuditLogStore({})
      const log2 = service.getAuditLogStore({})
      expect(log1).toBe(log2)
      // @ts-expect-error - private property access for test
      expect(Object.keys(service.auditLogStores)).toContain(key)
    })
  })

  describe('Database operations', () => {
    it('should get a specific database', () => {
      const db = service.getDatabaseInstance({ databaseId: mockDb._id }).value()
      expect(db.name).toBe('Test DB')
    })

    it('should get all databases', () => {
      const dbs = service.getDatabaseInstance({ databaseId: mockDb._id })
      expect(dbs.value()).toEqual(mockDbStore[mockDb._id])
    })

    it('should set and update a database', async () => {
      await service.modifyDatabase({ databaseId: mockDb._id }, async (data) => {
        data.set('name', 'Updated DB Name').value()
        return
      })
      const db = service.getDatabaseInstance({ databaseId: mockDb._id }).value()
      expect(db.name).toBe('Updated DB Name')
    })

    it('should create a new table in a database', async () => {
      const newTable: SchemaTable = {
        ...getSchemaCore(),
        name: 'products',
        description: 'Products table',
        columns: [
          {
            ...getSchemaCore(),
            name: 'price',
            description: 'Product price',
            type: 'number',
            isNullable: false,
            isOptional: false
          }
        ]
      }

      await service.createTableSchema({
        body: newTable,
        props: { databaseId: mockDb._id, tableId: newTable._id }
      })

      const db = service.getDatabaseInstance({ databaseId: mockDb._id }).value()
      expect(db.tables[newTable._id]).toBeDefined()
      expect(db.tables[newTable._id].name).toBe('products')
    })

    it('should throw an error when creating a table that already exists', async () => {
      const existingTable = mockDb.tables[0]
      await expect(
        service.createTableSchema({
          body: existingTable,
          props: { databaseId: mockDb._id, tableId: existingTable._id }
        })
      ).rejects.toThrow(/Table '.*' already exists/)
    })

    it('should update a table schema', async () => {
      const tableId = mockDb.tables[0]._id
      const updatedInfo = { name: 'new_users', description: 'Updated users table' }

      await service.updateTableSchema({
        body: updatedInfo,
        props: { databaseId: mockDb._id, tableId }
      })

      const table = service.getDatabaseInstance({ databaseId: mockDb._id }).value().tables[tableId]
      expect(table.name).toBe('new_users')
      expect(table.description).toBe('Updated users table')
    })

    it('should throw an error when updating a non-existent table', async () => {
      await expect(
        service.updateTableSchema({
          body: { name: 'test' },
          props: { databaseId: mockDb._id, tableId: 'non-existent' }
        })
      ).rejects.toThrow('Table not found')
    })

    it('should add a new column to a table schema (alter)', async () => {
      const tableId = mockDb.tables[0]._id
      const newColumn: SchemaTableColumn = {
        ...getSchemaCore(),
        name: 'email',
        description: 'User email',
        type: 'string',
        isNullable: false,
        isOptional: false
      }

      await service.modifyTableColumn({
        body: newColumn,
        props: { databaseId: mockDb._id, tableId }
      })

      const table = service.getDatabaseInstance({ databaseId: mockDb._id }).value().tables[tableId]
      expect(table.columns[newColumn._id]).toBeDefined()
      expect(table.columns[newColumn._id].name).toBe('email')
    })

    it('should update an existing column in a table schema (alter)', async () => {
      const tableId = mockDb.tables[0]._id
      const columnToUpdate = mockDb.tables[0].columns[0]
      const updatedColumn: SchemaTableColumn = {
        ...columnToUpdate,
        description: 'The full name of the user'
      }

      await service.modifyTableColumn({
        body: updatedColumn,
        props: { databaseId: mockDb._id, tableId }
      })

      const table = service.getDatabaseInstance({ databaseId: mockDb._id }).value().tables[tableId]
      expect(table.columns[columnToUpdate._id].description).toBe('The full name of the user')
    })
  })

  describe('Table operations', () => {
    it('should get table props, creating them if they do not exist', () => {
      const tableId = 'new-table'
      const props = service.getTableStorageConfig({ tableId })
      expect(props).toBeDefined()
      expect(props.filename).toBe('default')
      expect(props.filepath).toContain(tableId)
      expect(props.defaultValue).toEqual({ rows: {}, indexs: {} })
    })

    it('should get a table store, creating it if it does not exist', () => {
      const props = { tableId: 'new-table', databaseId: mockDb._id }
      const defaultValue = { 'item-1': { name: 'first item' } }
      const table = service.getTableStore(props, defaultValue)
      expect(table).toBeInstanceOf(LowWithLodash)
      expect(table.data.rows).toEqual(defaultValue)
    })

    it('should return a cached table store instance', () => {
      const props = { tableId: mockDb.tables[0]._id, databaseId: mockDb._id }
      const table1 = service.getTableStore(props)
      const table2 = service.getTableStore(props)
      expect(table1).toBe(table2)
    })

    it('should generate a zod validation schema for a table', () => {
      const tableId = mockDb.tables[0]._id
      const schema = service.generateTableValidationSchema({ databaseId: mockDb._id, tableId })
      const shape = schema.shape
      expect(shape).toHaveProperty('name')
      expect((shape.name as z.ZodString).def.type).toBe('string')
    })
  })

  describe('Query operations', () => {
    it('should evaluate filter conditions correctly', () => {
      expect(service.evaluateFilterCondition({ key: 'equals', value: 'test' }, 'test')).toBe(true)
      expect(service.evaluateFilterCondition({ key: 'equals', value: 'test' }, 'other')).toBe(false)
      expect(service.evaluateFilterCondition({ key: 'notEquals', value: 'test' }, 'other')).toBe(
        true
      )
    })

    it('should evaluate complex nested filter conditions', () => {
      const condition = {
        key: 'and',
        value: [
          { key: 'greaterThan', value: 20 },
          {
            key: 'or',
            value: [
              { key: 'lessThan', value: 30 },
              { key: 'equals', value: 42 }
            ]
          }
        ]
      }

      expect(service.evaluateFilterCondition(condition as any, 25)).toBe(true) // > 20 and < 30
      expect(service.evaluateFilterCondition(condition as any, 42)).toBe(true) // > 20 and == 42
      expect(service.evaluateFilterCondition(condition as any, 19)).toBe(false) // < 20
      expect(service.evaluateFilterCondition(condition as any, 35)).toBe(false) // > 20 but not (< 30 or == 42)
    })

    it('should build a filter query from a request body', () => {
      const tableId = mockDb.tables[0]._id
      const columns = service
        .getDatabaseInstance({ databaseId: mockDb._id })
        .get(['tables', tableId, 'columns'])
        .value()
      const name = service.getColumnIdByName({ databaseId: mockDb._id, tableId }, 'name')
      const age = service.getColumnIdByName({ databaseId: mockDb._id, tableId }, 'age')
      const filterBody: TableQuery['filter'] = {
        [name]: {
          equals: 'John'
        },
        [age]: {
          greaterThan: 30
        }
      }

      const filterQuery = service.buildFilterQuery(filterBody, columns)

      expect(filterQuery).toHaveLength(2)
      expect(filterQuery[0].key).toBe(name)
      expect(filterQuery[0].column.name).toBe('name')
      expect(filterQuery[0].conditions[0]).toEqual({ key: 'equals', value: 'John' })
      expect(filterQuery[1].key).toBe(age)
      expect(filterQuery[1].column.name).toBe('age')
      expect(filterQuery[1].conditions[0]).toEqual({ key: 'greaterThan', value: 30 })
    })

    it('should build a sort query from a request body', () => {
      const tableId = mockDb.tables[0]._id
      const columns = service
        .getDatabaseInstance({ databaseId: mockDb._id })
        .get(['tables', tableId, 'columns'])
        .value()

      const name = service.getColumnIdByName({ databaseId: mockDb._id, tableId }, 'name')
      const age = service.getColumnIdByName({ databaseId: mockDb._id, tableId }, 'age')
      const sortBody = {
        [age]: 'desc' as const,
        [name]: 'asc' as const
      }

      const sortQuery = service.buildSortQuery(sortBody, columns)

      expect(sortQuery).toHaveLength(2)
      expect(sortQuery[0].key).toBe(age)
      expect(sortQuery[0].direction).toBe('desc')
      expect(sortQuery[1].key).toBe(name)
      expect(sortQuery[1].direction).toBe('asc')
    })

    it('should query table records with filtering, sorting, and pagination', () => {
      const props = { tableId: mockDb.tables[0]._id, databaseId: mockDb._id }
      const age = service.getColumnIdByName(props, 'age')
      const rows = {
        '1': { name: 'Alice', age: 25 },
        '2': { name: 'Bob', age: 35 },
        '3': { name: 'Charlie', age: 30 },
        '4': { name: 'Alice', age: 40 }
      }
      service.getTableStore(props, rows)

      const query: BuildSchemaTable<SchemaDatabaseTableProps, TableQuery> = {
        props,
        body: {
          filter: {
            [age]: { greaterThan: 28 }
          },
          sort: {
            [age]: 'asc'
          },
          limit: 2,
          offset: 0
        }
      }

      const result = service.queryTableRecords(query)
      console.log(result)
      expect(result.total).toBe(3)
      expect(result.data).toHaveLength(2)
      expect(result.data[0]).toEqual({ name: 'Charlie', age: 30 })
      expect(result.data[1]).toEqual({ name: 'Bob', age: 35 })
      expect(result.hasMore).toBe(true)
    })

    it('should handle empty query gracefully', () => {
      const props = { tableId: mockDb.tables[0]._id, databaseId: mockDb._id }
      const rows = {
        '1': { name: 'Alice', age: 25 },
        '2': { name: 'Bob', age: 35 }
      }
      service.getTableStore(props, rows)

      const query: BuildSchemaTable<SchemaDatabaseTableProps, TableQuery> = {
        props,
        body: { filter: {}, sort: {}, limit: 10, offset: 0 }
      }

      const result = service.queryTableRecords(query)
      expect(result.total).toBe(2)
      expect(result.data).toHaveLength(2)
      expect(result.hasMore).toBe(false)
    })
  })
})
