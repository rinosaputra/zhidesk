// File: src/service/database/__tests__/router.performance.test.ts
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { call } from '@orpc/server'
import { DatabaseService } from '../service'
import { databaseRouter } from '../router'
// Mock DatabaseService yang lebih akurat
// Mock DatabaseService yang lebih akurat
vi.mock('../service', () => {
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
describe('Database Router - Performance Tests', () => {
  let mockDb: ReturnType<typeof DatabaseService.getInstance>

  beforeEach(() => {
    mockDb = DatabaseService.getInstance() as any
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should measure performance of findById (O(1) operation)', async () => {
    const input = {
      databaseId: 'test-db',
      tableName: 'users',
      id: '123'
    }

    const mockDocument = { _id: '123', name: 'Test User' }
    mockDb.findById.mockResolvedValue(mockDocument)

    // Measure execution time
    const startTime = performance.now()
    const result = await call(databaseRouter.findById, input)
    const endTime = performance.now()
    const executionTime = endTime - startTime

    // Assert
    expect(result.success).toBe(true)
    expect(result.document).toEqual(mockDocument)

    // Performance assertion: should be fast (O(1) operation)
    expect(executionTime).toBeLessThan(100) // Should complete in less than 100ms
    console.log(`findById execution time: ${executionTime}ms`)
  })

  it('should measure performance of bulk operations', async () => {
    const documents = Array(1000)
      .fill(0)
      .map((_, index) => ({
        _id: `user-${index}`,
        email: `user${index}@example.com`,
        firstName: `User ${index}`,
        role: 'admin',
        password: '12345678',
        lastName: 'lastName',
        isActive: true,
        lastLogin: new Date()
      }))

    mockDb.find.mockResolvedValue(documents)

    const input = {
      databaseId: 'test-db',
      tableName: 'users',
      query: {},
      options: { limit: 1000 }
    }

    // Measure execution time
    const startTime = performance.now()
    const result = await call(databaseRouter.find, input)
    const endTime = performance.now()
    const executionTime = endTime - startTime

    // Assert
    expect(result.success).toBe(true)
    expect(result.documents).toHaveLength(1000)

    console.log(`Bulk find (1000 documents) execution time: ${executionTime}ms`)
  })
})
