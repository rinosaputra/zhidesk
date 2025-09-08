/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { databaseRouter } from '../router'
import { DatabaseService } from '@service/database'
import { z } from 'zod'
import { call, ORPCError } from '@orpc/server'

// Mock DatabaseService yang lebih akurat
vi.mock('@service/database', () => {
  const mockDbInstance = {
    // Database Management
    getAllDatabases: vi.fn(),
    databaseExists: vi.fn(),
    initializeDatabase: vi.fn(),
    closeDatabase: vi.fn(),

    // Table Operations
    getAllDatabaseTables: vi.fn(),
    getTableSchema: vi.fn(),
    createDatabaseTable: vi.fn(),

    // Data Operations
    find: vi.fn(),
    findOne: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    createMany: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),

    // Query Operations
    count: vi.fn(),
    distinct: vi.fn(),
    exists: vi.fn(),
    search: vi.fn(),

    // Aggregation Operations
    aggregate: vi.fn(),

    // Database Info - Diperbaiki: method name yang benar
    getDatabaseSchema: vi.fn() // Diubah dari getDatabaseDatabaseSchema
  }

  return {
    DatabaseService: {
      getInstance: vi.fn(() => mockDbInstance)
    }
  }
})

describe('Database Router', () => {
  let mockDb: any

  beforeEach(() => {
    mockDb = DatabaseService.getInstance()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('Database Management', () => {
    it('should get all databases successfully', async () => {
      const mockDatabases = ['db1', 'db2', 'db3']
      mockDb.getAllDatabases.mockResolvedValue(mockDatabases)

      // Diperbaiki: Gunakan call() daripada handler() langsung
      const result = await call(databaseRouter.getAllDatabases, {})

      expect(result).toEqual({
        success: true,
        databases: mockDatabases
      })
      expect(mockDb.getAllDatabases).toHaveBeenCalled()
    })

    it('should handle error when getting all databases fails', async () => {
      const error = new Error('Database connection failed')
      mockDb.getAllDatabases.mockRejectedValue(error)

      const result = await call(databaseRouter.getAllDatabases, {})

      expect(result).toEqual({
        success: false,
        databases: [],
        error: 'Database connection failed'
      })
    })

    it('should check database existence successfully', async () => {
      const input = { databaseId: 'test-db' }
      mockDb.databaseExists.mockResolvedValue(true)

      // Diperbaiki: Gunakan call() dengan input
      const result = await call(databaseRouter.databaseExists, input)

      expect(result).toEqual({
        success: true,
        exists: true
      })
      expect(mockDb.databaseExists).toHaveBeenCalledWith(input.databaseId)
    })

    it('should validate input for database existence check', async () => {
      const invalidInput = { databaseId: '' }

      // Diperbaiki: Gunakan call() untuk testing validation
      await expect(call(databaseRouter.databaseExists, invalidInput)).rejects.toThrow(z.ZodError)
    })

    it('should initialize database successfully', async () => {
      const input = {
        databaseId: 'test-db',
        databaseName: 'Test Database',
        tables: [{ name: 'users' }]
      }
      mockDb.initializeDatabase.mockResolvedValue(undefined)

      // Diperbaiki: Gunakan call() dengan input
      const result = await call(databaseRouter.initializeDatabase, {
        ...input,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        tables: input.tables
      })

      expect(result).toEqual({
        success: true
      })
      expect(mockDb.initializeDatabase).toHaveBeenCalledWith(
        input.databaseId,
        input.databaseName,
        input.tables
      )
    })
  })

  describe('Table Operations', () => {
    it('should get all tables successfully', async () => {
      const input = { databaseId: 'test-db' }
      const mockTables = [{ name: 'users' }, { name: 'products' }]
      mockDb.getAllDatabaseTables.mockReturnValue(mockTables)

      // Diperbaiki: Gunakan call() dengan input
      const result = await call(databaseRouter.getTables, input)

      expect(result).toEqual({
        success: true,
        tables: mockTables
      })
      expect(mockDb.getAllDatabaseTables).toHaveBeenCalledWith(input.databaseId)
    })

    it('should get table schema successfully', async () => {
      const input = { databaseId: 'test-db', tableName: 'users' }
      const mockSchema = { fields: [{ name: 'id', type: 'string' }] }
      mockDb.getTableSchema.mockReturnValue(mockSchema)

      // Diperbaiki: Gunakan call() dengan input
      const result = await call(databaseRouter.getTableSchema, input)

      expect(result).toEqual({
        success: true,
        schema: mockSchema
      })
      expect(mockDb.getTableSchema).toHaveBeenCalledWith(input.databaseId, input.tableName)
    })
  })

  describe('CRUD Operations', () => {
    const mockDocument = { _id: '123', name: 'Test User', email: 'test@example.com' }

    it('should find documents successfully', async () => {
      const input = {
        databaseId: 'test-db',
        tableName: 'users',
        query: { status: 'active' },
        options: { limit: 10 }
      }
      mockDb.find.mockResolvedValue([mockDocument])

      // Diperbaiki: Gunakan call() dengan input
      const result = await call(databaseRouter.find, input)

      expect(result).toEqual({
        success: true,
        documents: [mockDocument]
      })
      expect(mockDb.find).toHaveBeenCalledWith(
        input.databaseId,
        input.tableName,
        input.query,
        input.options
      )
    })

    it('should find one document successfully', async () => {
      const input = {
        databaseId: 'test-db',
        tableName: 'users',
        query: { email: 'test@example.com' }
      }
      mockDb.findOne.mockResolvedValue(mockDocument)

      // Diperbaiki: Gunakan call() dengan input
      const result = await call(databaseRouter.findOne, input)

      expect(result).toEqual({
        success: true,
        document: mockDocument
      })
    })

    it('should find by ID successfully', async () => {
      const input = {
        databaseId: 'test-db',
        tableName: 'users',
        id: '123'
      }
      mockDb.findById.mockResolvedValue(mockDocument)

      // Diperbaiki: Gunakan call() dengan input
      const result = await call(databaseRouter.findById, input)

      expect(result).toEqual({
        success: true,
        document: mockDocument
      })
    })

    it('should create document successfully', async () => {
      const input = {
        databaseId: 'test-db',
        tableName: 'users',
        data: { name: 'New User' }
      }
      mockDb.create.mockResolvedValue(mockDocument)

      // Diperbaiki: Gunakan call() dengan input
      const result = await call(databaseRouter.create, input)

      expect(result).toEqual({
        success: true,
        document: mockDocument
      })
    })

    it('should update document successfully', async () => {
      const input = {
        databaseId: 'test-db',
        tableName: 'users',
        id: '123',
        data: { name: 'Updated User' }
      }
      mockDb.update.mockResolvedValue(mockDocument)

      // Diperbaiki: Gunakan call() dengan input
      const result = await call(databaseRouter.update, input)

      expect(result).toEqual({
        success: true,
        document: mockDocument
      })
    })

    it('should delete document successfully', async () => {
      const input = {
        databaseId: 'test-db',
        tableName: 'users',
        id: '123'
      }
      mockDb.delete.mockResolvedValue(true)

      // Diperbaiki: Gunakan call() dengan input
      const result = await call(databaseRouter.delete, input)

      expect(result).toEqual({
        success: true,
        deleted: true
      })
    })
  })

  describe('Batch Operations', () => {
    it('should create many documents successfully', async () => {
      const input = {
        databaseId: 'test-db',
        tableName: 'users',
        data: [{ name: 'User 1' }, { name: 'User 2' }]
      }
      const mockDocuments = [
        { _id: '1', name: 'User 1' },
        { _id: '2', name: 'User 2' }
      ]
      mockDb.createMany.mockResolvedValue(mockDocuments)

      // Diperbaiki: Gunakan call() dengan input
      const result = await call(databaseRouter.createMany, input)

      expect(result).toEqual({
        success: true,
        documents: mockDocuments
      })
    })

    it('should update many documents successfully', async () => {
      const input = {
        databaseId: 'test-db',
        tableName: 'users',
        query: { status: 'active' },
        data: { lastLogin: new Date() }
      }
      mockDb.updateMany.mockResolvedValue(5)

      // Diperbaiki: Gunakan call() dengan input
      const result = await call(databaseRouter.updateMany, input)

      expect(result).toEqual({
        success: true,
        count: 5
      })
    })
  })

  describe('Query Operations', () => {
    it('should count documents successfully', async () => {
      const input = {
        databaseId: 'test-db',
        tableName: 'users',
        query: { status: 'active' }
      }
      mockDb.count.mockResolvedValue(42)

      // Diperbaiki: Gunakan call() dengan input
      const result = await call(databaseRouter.count, input)

      expect(result).toEqual({
        success: true,
        count: 42
      })
    })

    it('should get distinct values successfully', async () => {
      const input = {
        databaseId: 'test-db',
        tableName: 'users',
        field: 'department',
        query: { status: 'active' }
      }
      const mockValues = ['Engineering', 'Marketing', 'Sales']
      mockDb.distinct.mockResolvedValue(mockValues)

      // Diperbaiki: Gunakan call() dengan input
      const result = await call(databaseRouter.distinct, input)

      expect(result).toEqual({
        success: true,
        values: mockValues
      })
    })

    it('should search documents successfully', async () => {
      const input = {
        databaseId: 'test-db',
        tableName: 'users',
        searchTerm: 'john',
        fields: ['firstName', 'lastName'],
        options: { limit: 10 }
      }
      const mockResults = [{ _id: '1', firstName: 'John', lastName: 'Doe' }]
      mockDb.search.mockResolvedValue(mockResults)

      // Diperbaiki: Gunakan call() dengan input
      const result = await call(databaseRouter.search, input)

      expect(result).toEqual({
        success: true,
        documents: mockResults
      })
    })
  })

  describe('Aggregation Operations', () => {
    it('should aggregate documents successfully', async () => {
      const input = {
        databaseId: 'test-db',
        tableName: 'orders',
        pipeline: [
          { $match: { status: 'completed' } },
          { $group: { _id: '$customerId', total: { $sum: '$amount' } } }
        ]
      }
      const mockResults = [{ _id: 'cust-1', total: 1000 }]
      mockDb.aggregate.mockResolvedValue(mockResults)

      // Diperbaiki: Gunakan call() dengan input
      const result = await call(databaseRouter.aggregate, input)

      expect(result).toEqual({
        success: true,
        results: mockResults
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle unexpected errors gracefully in find operation', async () => {
      const input = {
        databaseId: 'test-db',
        tableName: 'users',
        query: {},
        options: {}
      }
      const error = new Error('Unexpected database error')
      mockDb.find.mockRejectedValue(error)

      // Diperbaiki: Gunakan call() dengan input lengkap
      const result = await call(databaseRouter.find, input)

      expect(result).toEqual({
        success: false,
        documents: [],
        error: 'Unexpected database error'
      })
    })

    it('should handle non-Error objects in catch block', async () => {
      const input = {
        databaseId: 'test-db',
        tableName: 'users',
        query: {},
        options: {}
      }

      // Test dengan string error
      mockDb.find.mockRejectedValue('String error message')

      // Diperbaiki: Gunakan call() dengan input lengkap
      const result = await call(databaseRouter.find, input)

      expect(result).toEqual({
        success: false,
        documents: [],
        error: 'Failed to find documents'
      })
    })
  })

  describe('Input Validation', () => {
    it('should validate required fields for findById', async () => {
      const invalidInput = {
        databaseId: 'test-db',
        tableName: 'users',
        id: '' // Empty string should fail validation
      }

      await expect(call(databaseRouter.findById, invalidInput)).rejects.toThrow(ORPCError)
    })

    it('should validate required fields for search', async () => {
      const invalidInput = {
        databaseId: 'test-db',
        tableName: 'users',
        searchTerm: '', // Empty search term should fail
        fields: ['name']
      }

      await expect(call(databaseRouter.search, invalidInput)).rejects.toThrow(ORPCError)
    })

    it('should validate required fields for distinct', async () => {
      const invalidInput = {
        databaseId: 'test-db',
        tableName: 'users',
        field: '', // Empty field should fail
        query: {}
      }

      await expect(call(databaseRouter.distinct, invalidInput)).rejects.toThrow(ORPCError)
    })
  })

  // Test tambahan untuk coverage yang lebih baik
  describe('Additional Tests', () => {
    it('should close database successfully', async () => {
      const input = { databaseId: 'test-db' }
      mockDb.closeDatabase.mockResolvedValue(undefined)

      const result = await call(databaseRouter.closeDatabase, input)

      expect(result).toEqual({
        success: true
      })
    })

    it('should create table successfully', async () => {
      const input = {
        databaseId: 'test-db',
        tableConfig: { name: 'users', fields: [] }
      }
      mockDb.createDatabaseTable.mockResolvedValue(true)

      const result = await call(databaseRouter.createTable, input)

      expect(result).toEqual({
        success: true
      })
    })

    it('should check document existence successfully', async () => {
      const input = {
        databaseId: 'test-db',
        tableName: 'users',
        query: { email: 'test@example.com' }
      }
      mockDb.exists.mockResolvedValue(true)

      const result = await call(databaseRouter.exists, input)

      expect(result).toEqual({
        success: true,
        exists: true
      })
    })

    it('should delete many documents successfully', async () => {
      const input = {
        databaseId: 'test-db',
        tableName: 'users',
        query: { status: 'inactive' }
      }
      mockDb.deleteMany.mockResolvedValue(3)

      const result = await call(databaseRouter.deleteMany, input)

      expect(result).toEqual({
        success: true,
        count: 3
      })
    })

    it('should get database schema successfully', async () => {
      const input = { databaseId: 'test-db' }
      const mockSchema = { tables: [] }
      // Diperbaiki: Method name yang benar
      mockDb.getDatabaseSchema.mockReturnValue(mockSchema)

      const result = await call(databaseRouter.getDatabaseSchema, input)

      expect(result).toEqual({
        success: true,
        schema: mockSchema
      })
    })
  })
})
