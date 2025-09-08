// File: src/service/database/__tests__/DatabaseService.test.ts
import {
  describe,
  test,
  expect,
  beforeEach,
  afterEach,
  vi,
  Mock,
  beforeAll,
  afterAll
} from 'vitest'
import { DatabaseService } from '../index'
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { DatabaseGenerator } from '@schema/database/generator'
import { exampleUserTable, examplePostTable } from '@schema/database/examples'
import { mkdir, rm, access } from 'fs/promises'
import { join } from 'path'

// Mock dependencies
vi.mock('lowdb')
vi.mock('lowdb/node')
vi.mock('@schema/database/generator')
vi.mock('@schema/database/examples')
vi.mock('fs/promises')

describe('DatabaseService', () => {
  let databaseService: DatabaseService
  const testDatabaseId = 'test-db'
  const testDatabaseName = 'Test Database'
  const mockLowDBInstance = {
    data: [] as any[],
    read: vi.fn().mockResolvedValue(undefined),
    write: vi.fn().mockResolvedValue(undefined)
  }

  // Sample data untuk testing
  const sampleUsers = [
    {
      _id: 'user1',
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
      department: 'IT',
      isActive: true,
      createdAt: new Date('2023-01-01')
    },
    {
      _id: 'user2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      age: 25,
      department: 'HR',
      isActive: true,
      createdAt: new Date('2023-01-02')
    },
    {
      _id: 'user3',
      name: 'Bob Johnson',
      email: 'bob@example.com',
      age: 35,
      department: 'IT',
      isActive: false,
      createdAt: new Date('2023-01-03')
    },
    {
      _id: 'user4',
      name: 'Alice Brown',
      email: 'alice@example.com',
      age: 28,
      department: 'Finance',
      isActive: true,
      createdAt: new Date('2023-01-04')
    }
  ]

  const sampleProducts = [
    {
      _id: 'prod1',
      name: 'Laptop',
      price: 1000,
      category: 'Electronics',
      stock: 15,
      tags: ['tech', 'computer']
    },
    {
      _id: 'prod2',
      name: 'Phone',
      price: 500,
      category: 'Electronics',
      stock: 30,
      tags: ['tech', 'mobile']
    },
    {
      _id: 'prod3',
      name: 'Desk',
      price: 300,
      category: 'Furniture',
      stock: 10,
      tags: ['office', 'wood']
    },
    {
      _id: 'prod4',
      name: 'Chair',
      price: 150,
      category: 'Furniture',
      stock: 25,
      tags: ['office', 'comfort']
    }
  ]

  const sampleOrders = [
    {
      _id: 'order1',
      userId: 'user1',
      productId: 'prod1',
      quantity: 2,
      total: 2000,
      status: 'completed',
      date: new Date('2023-01-15')
    },
    {
      _id: 'order2',
      userId: 'user1',
      productId: 'prod2',
      quantity: 1,
      total: 500,
      status: 'pending',
      date: new Date('2023-01-16')
    },
    {
      _id: 'order3',
      userId: 'user2',
      productId: 'prod3',
      quantity: 1,
      total: 300,
      status: 'completed',
      date: new Date('2023-01-17')
    },
    {
      _id: 'order4',
      userId: 'user3',
      productId: 'prod4',
      quantity: 3,
      total: 450,
      status: 'cancelled',
      date: new Date('2023-01-18')
    }
  ]

  beforeAll(() => {
    // Setup global mocks
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2023-01-20'))
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  beforeEach(async () => {
    // Clear all mocks
    vi.clearAllMocks()

    // Reset singleton instance
    // @ts-ignore - Access private property for testing
    DatabaseService.instance = null

    databaseService = DatabaseService.getInstance()

    // Setup mocks
    ;(Low as Mock).mockImplementation(() => mockLowDBInstance)
    ;(JSONFile as Mock).mockImplementation(() => ({}))
    ;(DatabaseGenerator as Mock).mockImplementation(() => ({
      getAllTables: vi.fn().mockReturnValue([exampleUserTable, examplePostTable]),
      getTable: vi.fn().mockImplementation((tableName) => {
        if (tableName === 'users') return exampleUserTable
        if (tableName === 'posts') return examplePostTable
        return null
      }),
      validateData: vi.fn().mockImplementation((tableName, data) => {
        // Simple validation
        if (tableName === 'users' && !data.name) {
          throw new Error('Name is required')
        }
        return data
      }),
      extractDefaults: vi.fn().mockReturnValue({
        _id: 'default-id',
        createdAt: new Date(),
        isActive: true
      }),
      registerTable: vi.fn(),
      getDatabase: vi.fn().mockReturnValue({ name: 'test-database', tables: [] })
    }))

    // Mock default untuk fs operations
    ;(access as Mock).mockResolvedValue(undefined)
    ;(mkdir as Mock).mockResolvedValue(undefined)

    // Clean test data directory
    await rm(join('data', testDatabaseId), { recursive: true, force: true })
  })

  afterEach(async () => {
    await databaseService.closeDatabase(testDatabaseId)
  })

  describe('Singleton Pattern', () => {
    test('should return same instance', () => {
      const instance1 = DatabaseService.getInstance()
      const instance2 = DatabaseService.getInstance()
      expect(instance1).toBe(instance2)
    })

    test('should maintain state between instances', () => {
      const instance1 = DatabaseService.getInstance()
      // @ts-ignore - Access private property
      instance1.baseDataPath = 'custom-path'

      const instance2 = DatabaseService.getInstance()
      // @ts-ignore - Access private property
      expect(instance2.baseDataPath).toBe('custom-path')
    })
  })

  describe('Database Initialization', () => {
    test('should initialize database successfully', async () => {
      const result = await databaseService.initializeDatabase(testDatabaseId, testDatabaseName, [])
      expect(result).toBeUndefined()
      expect(mkdir).toHaveBeenCalled()
      expect(DatabaseGenerator).toHaveBeenCalled()
    })

    test('should throw error on initialization failure', async () => {
      ;(mkdir as Mock).mockRejectedValueOnce(new Error('FS error'))
      await expect(
        databaseService.initializeDatabase(testDatabaseId, testDatabaseName, [])
      ).rejects.toThrow('FS error')
    })

    test('should initialize with custom tables', async () => {
      const customTable = { name: 'custom', fields: [] }
      await databaseService.initializeDatabase(testDatabaseId, testDatabaseName, [customTable])

      const generator = databaseService['generators'].get(testDatabaseId)
      expect(generator?.registerTable).toHaveBeenCalledWith(customTable)
    })
  })

  describe('CRUD Operations - Users', () => {
    beforeEach(async () => {
      await databaseService.initializeDatabase(testDatabaseId, testDatabaseName, [])
      mockLowDBInstance.data = [...sampleUsers]
    })

    describe('Create Operations', () => {
      test('should create single document', async () => {
        const newUser = { name: 'Test User', email: 'test@example.com', age: 40 }
        const result = await databaseService.create(testDatabaseId, 'users', newUser)

        expect(result).toMatchObject(newUser)
        expect(result._id).toBeDefined()
        expect(result.createdAt).toBeDefined()
        expect(mockLowDBInstance.write).toHaveBeenCalled()
      })

      test('should create multiple documents', async () => {
        const newUsers = [
          { name: 'User One', email: 'one@example.com' },
          { name: 'User Two', email: 'two@example.com' }
        ]

        const results = await databaseService.createMany(testDatabaseId, 'users', newUsers)
        expect(results).toHaveLength(2)
        expect(results[0].name).toBe('User One')
        expect(results[1].name).toBe('User Two')
        expect(mockLowDBInstance.write).toHaveBeenCalled()
      })

      test('should validate data on create', async () => {
        await expect(
          databaseService.create(testDatabaseId, 'users', { email: 'invalid@example.com' })
        ).rejects.toThrow('Name is required')
      })
    })

    describe('Read Operations', () => {
      test('should find all documents', async () => {
        const results = await databaseService.find(testDatabaseId, 'users', {})
        expect(results).toHaveLength(4)
      })

      test('should find with simple query', async () => {
        const results = await databaseService.find(testDatabaseId, 'users', { department: 'IT' })
        expect(results).toHaveLength(2)
        expect(results.every((user) => user.department === 'IT')).toBe(true)
      })

      test('should find with complex query', async () => {
        const results = await databaseService.find(testDatabaseId, 'users', {
          department: 'IT',
          isActive: true
        })
        expect(results).toHaveLength(1)
        expect(results[0].name).toBe('John Doe')
      })

      test('should find one document', async () => {
        const result = await databaseService.findOne(testDatabaseId, 'users', {
          email: 'john@example.com'
        })
        expect(result).toBeDefined()
        expect(result?.name).toBe('John Doe')
      })

      test('should return null when findOne finds nothing', async () => {
        const result = await databaseService.findOne(testDatabaseId, 'users', {
          email: 'nonexistent@example.com'
        })
        expect(result).toBeNull()
      })

      test('should find by ID', async () => {
        const result = await databaseService.findById(testDatabaseId, 'users', 'user2')
        expect(result).toBeDefined()
        expect(result?.name).toBe('Jane Smith')
      })

      test('should return null for non-existent ID', async () => {
        const result = await databaseService.findById(testDatabaseId, 'users', 'nonexistent')
        expect(result).toBeNull()
      })

      test('should find by field', async () => {
        const results = await databaseService.findByField(
          testDatabaseId,
          'users',
          'department',
          'HR'
        )
        expect(results).toHaveLength(1)
        expect(results[0].name).toBe('Jane Smith')
      })

      test('should support pagination', async () => {
        const results = await databaseService.find(
          testDatabaseId,
          'users',
          {},
          { skip: 1, limit: 2 }
        )
        expect(results).toHaveLength(2)
      })

      test('should support sorting', async () => {
        const results = await databaseService.find(
          testDatabaseId,
          'users',
          {},
          { sort: { age: -1 } }
        )
        expect(results[0].age).toBe(35) // Bob Johnson
        expect(results[1].age).toBe(30) // John Doe
      })
    })

    describe('Update Operations', () => {
      test('should update document', async () => {
        const updatedData = { age: 31, department: 'Engineering' }
        const result = await databaseService.update(testDatabaseId, 'users', 'user1', updatedData)

        expect(result.age).toBe(31)
        expect(result.department).toBe('Engineering')
        expect(result._updatedAt).toBeDefined()
        expect(mockLowDBInstance.write).toHaveBeenCalled()
      })

      test('should throw error when updating non-existent document', async () => {
        await expect(
          databaseService.update(testDatabaseId, 'users', 'nonexistent', { age: 40 })
        ).rejects.toThrow('Document not found')
      })

      test('should update multiple documents', async () => {
        const updateCount = await databaseService.updateMany(
          testDatabaseId,
          'users',
          { department: 'IT' },
          { isActive: false }
        )

        expect(updateCount).toBe(2)
        expect(mockLowDBInstance.write).toHaveBeenCalled()

        // Verify updates
        const updatedUsers = await databaseService.find(testDatabaseId, 'users', {
          department: 'IT'
        })
        expect(updatedUsers.every((user) => user.isActive === false)).toBe(true)
      })

      test('should return 0 when no documents match updateMany query', async () => {
        const updateCount = await databaseService.updateMany(
          testDatabaseId,
          'users',
          { department: 'Nonexistent' },
          { isActive: false }
        )

        expect(updateCount).toBe(0)
      })
    })

    describe('Delete Operations', () => {
      test('should delete document', async () => {
        const result = await databaseService.delete(testDatabaseId, 'users', 'user1')
        expect(result).toBe(true)
        expect(mockLowDBInstance.write).toHaveBeenCalled()

        const remainingUsers = await databaseService.find(testDatabaseId, 'users', {})
        expect(remainingUsers).toHaveLength(3)
        expect(remainingUsers.find((user) => user._id === 'user1')).toBeUndefined()
      })

      test('should return false when deleting non-existent document', async () => {
        const result = await databaseService.delete(testDatabaseId, 'users', 'nonexistent')
        expect(result).toBe(false)
      })

      test('should delete multiple documents', async () => {
        const deleteCount = await databaseService.deleteMany(testDatabaseId, 'users', {
          department: 'IT'
        })

        expect(deleteCount).toBe(2)
        expect(mockLowDBInstance.write).toHaveBeenCalled()

        const remainingUsers = await databaseService.find(testDatabaseId, 'users', {})
        expect(remainingUsers).toHaveLength(2)
      })

      test('should return 0 when no documents match deleteMany query', async () => {
        const deleteCount = await databaseService.deleteMany(testDatabaseId, 'users', {
          department: 'Nonexistent'
        })

        expect(deleteCount).toBe(0)
      })
    })
  })

  describe('Query Operations', () => {
    beforeEach(async () => {
      await databaseService.initializeDatabase(testDatabaseId, testDatabaseName, [])
      mockLowDBInstance.data = [...sampleUsers, ...sampleProducts]
    })

    test('should count documents', async () => {
      const count = await databaseService.count(testDatabaseId, 'users', { department: 'IT' })
      expect(count).toBe(2)
    })

    test('should get distinct values', async () => {
      const departments = await databaseService.distinct(testDatabaseId, 'users', 'department')
      expect(departments).toEqual(['IT', 'HR', 'Finance'])
    })

    test('should get distinct values with query', async () => {
      const departments = await databaseService.distinct(testDatabaseId, 'users', 'department', {
        isActive: true
      })
      expect(departments).toEqual(['IT', 'HR', 'Finance'])
    })

    test('should check if document exists', async () => {
      const exists = await databaseService.exists(testDatabaseId, 'users', { name: 'John Doe' })
      expect(exists).toBe(true)

      const notExists = await databaseService.exists(testDatabaseId, 'users', {
        name: 'Nonexistent'
      })
      expect(notExists).toBe(false)
    })

    test('should search text across multiple fields', async () => {
      const results = await databaseService.search(testDatabaseId, 'users', 'john', [
        'name',
        'email',
        'department'
      ])
      expect(results).toHaveLength(1)
      expect(results[0].name).toBe('John Doe')
    })

    test('should return empty array for no search matches', async () => {
      const results = await databaseService.search(testDatabaseId, 'users', 'nonexistent', [
        'name',
        'email'
      ])
      expect(results).toHaveLength(0)
    })

    test('should support search with options', async () => {
      const results = await databaseService.search(testDatabaseId, 'users', 'example', ['email'], {
        limit: 2
      })
      expect(results.length).toBeLessThanOrEqual(2)
    })
  })

  describe('Aggregation Operations', () => {
    beforeEach(async () => {
      await databaseService.initializeDatabase(testDatabaseId, testDatabaseName, [])
      mockLowDBInstance.data = [...sampleOrders]
    })

    test('should execute $match and $group pipeline', async () => {
      const pipeline = [
        { $match: { status: 'completed' } },
        {
          $group: {
            _id: '$userId',
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: '$total' }
          }
        }
      ]

      const results = await databaseService.aggregate(testDatabaseId, 'orders', pipeline)

      expect(results).toHaveLength(2)
      const user1Result = results.find((r: any) => r._id === 'user1')
      expect(user1Result).toMatchObject({
        totalOrders: 1,
        totalRevenue: 2000
      })
    })

    test('should execute $sort and $limit pipeline', async () => {
      const pipeline = [{ $sort: { total: -1 } }, { $limit: 2 }]

      const results = await databaseService.aggregate(testDatabaseId, 'orders', pipeline)

      expect(results).toHaveLength(2)
      expect(results[0].total).toBe(2000) // order1
      expect(results[1].total).toBe(500) // order2
    })

    test('should execute $project pipeline', async () => {
      const pipeline = [
        {
          $project: {
            userId: 1,
            total: 1,
            status: 1
          }
        }
      ]

      const results = await databaseService.aggregate(testDatabaseId, 'orders', pipeline)

      expect(results[0]).toHaveProperty('userId')
      expect(results[0]).toHaveProperty('total')
      expect(results[0]).toHaveProperty('status')
      expect(results[0]).not.toHaveProperty('productId')
      expect(results[0]).not.toHaveProperty('quantity')
    })

    test('should handle complex aggregation with multiple stages', async () => {
      const pipeline = [
        { $match: { status: { $in: ['completed', 'pending'] } } },
        {
          $group: {
            _id: '$userId',
            orderCount: { $sum: 1 },
            averageOrderValue: { $avg: '$total' },
            maxOrderValue: { $max: '$total' }
          }
        },
        { $sort: { orderCount: -1 } }
      ]

      const results = await databaseService.aggregate(testDatabaseId, 'orders', pipeline)

      expect(results).toHaveLength(2)
      expect(results[0]._id).toBe('user1') // Most orders
      expect(results[0].orderCount).toBe(2)
    })
  })

  describe('Schema Operations', () => {
    beforeEach(async () => {
      await databaseService.initializeDatabase(testDatabaseId, testDatabaseName, [])
    })

    test('should get table schema', async () => {
      const schema = databaseService.getTableSchema(testDatabaseId, 'users')
      expect(schema).toBeDefined()
    })

    test('should get all database tables', async () => {
      const tables = databaseService.getAllDatabaseTables(testDatabaseId)
      expect(tables).toHaveLength(2)
      expect(tables.map((t: any) => t.name)).toEqual(['users', 'posts'])
    })

    test('should get database schema', async () => {
      const schema = databaseService.getDatabaseDatabaseSchema(testDatabaseId)
      expect(schema).toBeDefined()
      expect(schema.name).toBe('test-database')
    })
  })

  describe('Database Management', () => {
    test('should check database existence', async () => {
      // Mock access untuk mensimulasikan bahwa direktori tidak ada
      ;(access as Mock).mockRejectedValueOnce(new Error('Directory does not exist'))
      const exists = await databaseService.databaseExists(testDatabaseId)
      expect(exists).toBe(false)

      // Mock access untuk mensimulasikan bahwa direktori ada
      ;(access as Mock).mockResolvedValueOnce(undefined)
      const existsAfter = await databaseService.databaseExists(testDatabaseId)
      expect(existsAfter).toBe(true)
    })

    test('should get all databases', async () => {
      await databaseService.initializeDatabase(testDatabaseId, testDatabaseName, [])
      const databases = await databaseService.getAllDatabases()
      expect(databases).toContain(testDatabaseId)
    })

    test('should close database', async () => {
      await databaseService.initializeDatabase(testDatabaseId, testDatabaseName, [])

      // @ts-ignore - Access private properties
      const initialDbCount = databaseService.dbs.size
      const initialGeneratorCount = databaseService.generators.size

      await databaseService.closeDatabase(testDatabaseId)

      // @ts-ignore - Access private properties
      expect(databaseService.dbs.size).toBe(initialDbCount - 2) // 2 tables
      expect(databaseService.generators.size).toBe(initialGeneratorCount - 1)
    })

    test('should handle closing non-existent database', async () => {
      await expect(databaseService.closeDatabase('nonexistent-db')).resolves.toBeUndefined()
    })
  })

  describe('Error Handling', () => {
    test('should handle database not initialized', async () => {
      await expect(databaseService.find('non-existent-db', 'users', {})).rejects.toThrow(
        'Database non-existent-db not initialized'
      )
    })

    test('should handle file system errors', async () => {
      ;(Low as Mock).mockImplementationOnce(() => ({
        ...mockLowDBInstance,
        read: vi.fn().mockRejectedValue(new Error('Read error'))
      }))

      await databaseService.initializeDatabase(testDatabaseId, testDatabaseName, [])
      await expect(databaseService.find(testDatabaseId, 'users', {})).rejects.toThrow('Read error')
    })

    test('should handle validation errors', async () => {
      await databaseService.initializeDatabase(testDatabaseId, testDatabaseName, [])
      await expect(
        databaseService.create(testDatabaseId, 'users', { email: 'invalid@example.com' })
      ).rejects.toThrow('Name is required')
    })
  })

  describe('Edge Cases', () => {
    test('should handle empty database', async () => {
      await databaseService.initializeDatabase(testDatabaseId, testDatabaseName, [])
      mockLowDBInstance.data = []

      const results = await databaseService.find(testDatabaseId, 'users', {})
      expect(results).toHaveLength(0)

      const count = await databaseService.count(testDatabaseId, 'users', {})
      expect(count).toBe(0)

      const exists = await databaseService.exists(testDatabaseId, 'users', { name: 'test' })
      expect(exists).toBe(false)
    })

    test('should handle null data in database', async () => {
      await databaseService.initializeDatabase(testDatabaseId, testDatabaseName, [])
      // @ts-ignore - Simulate null data
      mockLowDBInstance.data = null

      const results = await databaseService.find(testDatabaseId, 'users', {})
      expect(results).toHaveLength(0)
    })

    test('should handle large datasets', async () => {
      await databaseService.initializeDatabase(testDatabaseId, testDatabaseName, [])

      // Create large dataset
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        _id: `item${i}`,
        value: i,
        category: i % 2 === 0 ? 'even' : 'odd'
      }))

      mockLowDBInstance.data = largeData

      const results = await databaseService.find(
        testDatabaseId,
        'users',
        { category: 'even' },
        { limit: 10 }
      )

      expect(results).toHaveLength(10)
      expect(results.every((item: any) => item.category === 'even')).toBe(true)
    })
  })
})
