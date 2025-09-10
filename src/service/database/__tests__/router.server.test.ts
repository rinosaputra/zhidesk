// File: src/service/database/__tests__/router.server.test.ts
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { call } from '@orpc/server'
import { DatabaseService } from '../service'
import { databaseRouter } from '../router'
import { exampleUserTable } from '../examples'

// Mock untuk DatabaseService
vi.mock('../service', () => {
  const mockDatabaseService = {
    getInstance: vi.fn(() => mockDatabaseService),
    getAllDatabases: vi.fn(),
    databaseExists: vi.fn(),
    initializeDatabase: vi.fn(),
    closeDatabase: vi.fn(),
    getAllDatabaseTables: vi.fn(),
    getTableSchema: vi.fn(),
    createDatabaseTable: vi.fn(),
    find: vi.fn(),
    findOne: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    createMany: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
    count: vi.fn(),
    distinct: vi.fn(),
    exists: vi.fn(),
    search: vi.fn(),
    aggregate: vi.fn(),
    findByField: vi.fn()
  }

  return { DatabaseService: mockDatabaseService }
})

describe('Database Router - Server-Side Testing', () => {
  let mockDb: ReturnType<typeof DatabaseService.getInstance>

  beforeEach(() => {
    mockDb = DatabaseService.getInstance() as any
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('Database Management Operations', () => {
    it('should initialize database successfully using call utility', async () => {
      // Arrange
      const input = {
        databaseId: 'test-db',
        databaseName: 'Test Database',
        tables: [exampleUserTable]
      }

      mockDb.initializeDatabase.mockResolvedValue(true)

      // Act - Menggunakan call utility langsung
      const result = await call(databaseRouter.initializeDatabase, input)

      // Assert
      expect(result).toEqual({
        success: true,
        error: undefined
      })
      expect(mockDb.initializeDatabase).toHaveBeenCalledWith('test-db', 'Test Database', [
        exampleUserTable
      ])
    })

    it('should check database existence', async () => {
      // Arrange
      const input = { databaseId: 'test-db' }
      mockDb.databaseExists.mockResolvedValue(true)

      // Act
      const result = await call(databaseRouter.databaseExists, input)

      // Assert
      expect(result).toEqual({
        success: true,
        exists: true
      })
    })
  })

  describe('CRUD Operations', () => {
    const testDocument = {
      _id: '123',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe'
    }

    it('should create document successfully', async () => {
      // Arrange
      const input = {
        databaseId: 'test-db',
        tableName: 'users',
        data: {
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe'
        }
      }

      mockDb.create.mockResolvedValue(testDocument)

      // Act
      const result = await call(databaseRouter.create, input)

      // Assert
      expect(result).toEqual({
        success: true,
        document: testDocument
      })
    })

    it('should find document by ID', async () => {
      // Arrange
      const input = {
        databaseId: 'test-db',
        tableName: 'users',
        id: '123'
      }

      mockDb.findById.mockResolvedValue(testDocument)

      // Act
      const result = await call(databaseRouter.findById, input)

      // Assert
      expect(result).toEqual({
        success: true,
        document: testDocument
      })
    })

    it('should update document', async () => {
      // Arrange
      const input = {
        databaseId: 'test-db',
        tableName: 'users',
        id: '123',
        data: { firstName: 'Jane' }
      }

      const updatedDocument = { ...testDocument, firstName: 'Jane' }
      mockDb.update.mockResolvedValue(updatedDocument)

      // Act
      const result = await call(databaseRouter.update, input)

      // Assert
      expect(result).toEqual({
        success: true,
        document: updatedDocument
      })
    })

    it('should delete document', async () => {
      // Arrange
      const input = {
        databaseId: 'test-db',
        tableName: 'users',
        id: '123'
      }

      mockDb.delete.mockResolvedValue(true)

      // Act
      const result = await call(databaseRouter.delete, input)

      // Assert
      expect(result).toEqual({
        success: true,
        deleted: true
      })
    })
  })

  describe('Query Operations', () => {
    it('should count documents with query', async () => {
      // Arrange
      const input = {
        databaseId: 'test-db',
        tableName: 'users',
        query: { active: true }
      }

      mockDb.count.mockResolvedValue(5)

      // Act
      const result = await call(databaseRouter.count, input)

      // Assert
      expect(result).toEqual({
        success: true,
        count: 5
      })
    })

    it('should get distinct values', async () => {
      // Arrange
      const input = {
        databaseId: 'test-db',
        tableName: 'users',
        field: 'role',
        query: { active: true }
      }

      const mockValues = ['admin', 'user', 'moderator']
      mockDb.distinct.mockResolvedValue(mockValues)

      // Act
      const result = await call(databaseRouter.distinct, input)

      // Assert
      expect(result).toEqual({
        success: true,
        values: mockValues
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle service errors gracefully', async () => {
      // Arrange
      const input = {
        databaseId: 'test-db',
        tableName: 'users',
        id: '123'
      }

      const error = new Error('Database connection failed')
      mockDb.findById.mockRejectedValue(error)

      // Act
      const result = await call(databaseRouter.findById, input)

      // Assert
      expect(result).toEqual({
        success: false,
        document: null,
        error: 'Database connection failed'
      })
    })

    it('should handle unknown error types', async () => {
      // Arrange
      const input = {
        databaseId: 'test-db',
        tableName: 'users',
        id: '123'
      }

      mockDb.findById.mockRejectedValue('Unexpected error string')

      // Act
      const result = await call(databaseRouter.findById, input)

      // Assert
      expect(result).toEqual({
        success: false,
        document: null,
        error: 'Failed to find document by ID'
      })
    })
  })

  describe('Aggregation Operations', () => {
    it('should execute aggregation pipeline', async () => {
      // Arrange
      const input = {
        databaseId: 'test-db',
        tableName: 'users',
        pipeline: [{ $match: { active: true } }, { $group: { _id: '$role', count: { $sum: 1 } } }]
      }

      const mockResults = [
        { _id: 'admin', count: 5 },
        { _id: 'user', count: 20 }
      ]

      mockDb.aggregate.mockResolvedValue(mockResults)

      // Act
      const result = await call(databaseRouter.aggregate, input)

      // Assert
      expect(result).toEqual({
        success: true,
        results: mockResults
      })
    })
  })

  describe('Concurrent Operations', () => {
    it('should handle multiple concurrent requests', async () => {
      // Arrange
      const requests = Array(5)
        .fill(0)
        .map((_, index) => ({
          databaseId: 'test-db',
          tableName: 'users',
          id: `user-${index}`
        }))

      mockDb.findById.mockImplementation(async (dbId, table, id) => {
        await new Promise((resolve) => setTimeout(resolve, 10)) // Simulate delay
        return { _id: id, name: `User ${id}` }
      })

      // Act - Execute all requests concurrently
      const results = await Promise.all(
        requests.map((input) => call(databaseRouter.findById, input))
      )

      // Assert
      results.forEach((result, index) => {
        expect(result.success).toBe(true)
        expect(result.document?._id).toBe(`user-${index}`)
      })
      expect(mockDb.findById).toHaveBeenCalledTimes(5)
    })
  })
})
