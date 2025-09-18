/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
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
import { DatabaseService } from '../service'
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { DatabaseGenerator } from '../generator'
import { exampleUserTable, examplePostTable } from '../examples'
import { mkdir, rm, access } from 'fs/promises'

// Mock dependencies
vi.mock('lowdb')
vi.mock('lowdb/node')
vi.mock('../generator')
vi.mock('../examples')
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

  // Sample data yang sesuai dengan schema exampleUserTable
  const sampleUsers = [
    {
      _id: 'user1',
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'user',
      isActive: true,
      lastLogin: new Date('2023-01-15'),
      _createdAt: new Date('2023-01-01'),
      _updatedAt: new Date('2023-01-01')
    },
    {
      _id: 'user2',
      email: 'jane@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'admin',
      isActive: true,
      lastLogin: new Date('2023-01-16'),
      _createdAt: new Date('2023-01-02'),
      _updatedAt: new Date('2023-01-02')
    },
    {
      _id: 'user3',
      email: 'bob@example.com',
      firstName: 'Bob',
      lastName: 'Johnson',
      role: 'user',
      isActive: false,
      lastLogin: new Date('2023-01-14'),
      _createdAt: new Date('2023-01-03'),
      _updatedAt: new Date('2023-01-03')
    }
  ]

  // // Sample data yang sesuai dengan schema examplePostTable
  // const _samplePosts = [
  //   {
  //     _id: 'post1',
  //     title: 'First Post',
  //     content: 'This is the first post content',
  //     authorId: 'user1',
  //     tags: ['tech', 'programming'],
  //     metadata: {
  //       wordCount: 150,
  //       readTime: 5
  //     },
  //     _createdAt: new Date('2023-01-10'),
  //     _updatedAt: new Date('2023-01-10')
  //   },
  //   {
  //     _id: 'post2',
  //     title: 'Second Post',
  //     content: 'This is the second post content',
  //     authorId: 'user2',
  //     tags: ['design', 'ui'],
  //     metadata: {
  //       wordCount: 200,
  //       readTime: 7
  //     },
  //     _createdAt: new Date('2023-01-11'),
  //     _updatedAt: new Date('2023-01-11')
  //   }
  // ]

  // const _sampleOrders = [
  //   {
  //     _id: 'order1',
  //     userId: 'user1',
  //     productId: 'prod1',
  //     quantity: 2,
  //     total: 2000,
  //     status: 'completed',
  //     date: new Date('2023-01-15'),
  //     _createdAt: new Date('2023-01-15'),
  //     _updatedAt: new Date('2023-01-15')
  //   },
  //   {
  //     _id: 'order2',
  //     userId: 'user1',
  //     productId: 'prod2',
  //     quantity: 1,
  //     total: 500,
  //     status: 'pending',
  //     date: new Date('2023-01-16'),
  //     _createdAt: new Date('2023-01-16'),
  //     _updatedAt: new Date('2023-01-16')
  //   }
  // ]

  beforeAll(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2023-01-20'))
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  beforeEach(async () => {
    vi.clearAllMocks()

    // Reset singleton instance dengan cara yang lebih aman
    if ((DatabaseService as any).instance) {
      ;(DatabaseService as any).instance = null
    }

    databaseService = DatabaseService.getInstance()

    // Setup LowDB mock
    ;(Low as unknown as Mock).mockImplementation(() => mockLowDBInstance)
    ;(JSONFile as unknown as Mock).mockImplementation(() => ({}))

    // Setup DatabaseGenerator mock yang lebih akurat
    vi.mocked(DatabaseGenerator).mockImplementation(() => {
      const mockGenerator = {
        getAllTables: vi.fn().mockReturnValue([exampleUserTable, examplePostTable]),
        getTable: vi.fn().mockImplementation((tableName: string) => {
          if (tableName === 'users') return exampleUserTable
          if (tableName === 'posts') return examplePostTable
          return null
        }),
        validateData: vi.fn().mockImplementation((tableName: string, data: any) => {
          // Validasi sederhana berdasarkan table
          if (tableName === 'users') {
            if (!data.email) throw new Error('Email is required')
            if (!data.firstName) throw new Error('First name is required')
          }
          if (tableName === 'posts') {
            if (!data.title) throw new Error('Title is required')
            if (!data.content) throw new Error('Content is required')
          }
          return { ...data, _id: data._id || `mock-id-${Math.random()}` }
        }),
        extractDefaults: vi.fn().mockImplementation((tableName: string) => {
          const defaults: any = { _id: `default-${tableName}-id` }
          if (tableName === 'users') {
            defaults.role = 'user'
            defaults.isActive = true
          }
          if (tableName === 'posts') {
            defaults.tags = []
            defaults.metadata = { wordCount: 0, readTime: 0 }
          }
          return defaults
        }),
        registerTable: vi.fn(),
        getDatabase: vi.fn().mockReturnValue({
          name: testDatabaseName,
          version: 1,
          tables: [exampleUserTable, examplePostTable],
          createdAt: new Date(),
          updatedAt: new Date()
        })
      }
      return mockGenerator as any
    })

    // Mock fs operations
    vi.mocked(access).mockResolvedValue(undefined)
    vi.mocked(mkdir).mockResolvedValue(undefined)
    vi.mocked(rm).mockResolvedValue(undefined)

    // Reset data mock
    mockLowDBInstance.data = []
  })

  afterEach(async () => {
    // Cleanup databases yang mungkin dibuat selama test
    const databases = await databaseService.getAllDatabases()
    for (const dbId of databases) {
      await databaseService.closeDatabase(dbId)
    }
  })

  describe('Singleton Pattern', () => {
    test('should return same instance', () => {
      const instance1 = DatabaseService.getInstance()
      const instance2 = DatabaseService.getInstance()
      expect(instance1).toBe(instance2)
    })
  })

  describe('Database Initialization', () => {
    test('should initialize database successfully', async () => {
      await expect(
        databaseService.initializeDatabase(testDatabaseId, testDatabaseName, [
          exampleUserTable,
          examplePostTable
        ])
      ).resolves.toBeUndefined()

      expect(mkdir).toHaveBeenCalled()
      expect(DatabaseGenerator).toHaveBeenCalled()
    })

    test('should throw error on initialization failure', async () => {
      vi.mocked(mkdir).mockRejectedValueOnce(new Error('FS error'))

      await expect(
        databaseService.initializeDatabase(testDatabaseId, testDatabaseName, [])
      ).rejects.toThrow('FS error')
    })
  })

  describe('CRUD Operations - Users', () => {
    beforeEach(async () => {
      await databaseService.initializeDatabase(testDatabaseId, testDatabaseName, [
        exampleUserTable,
        examplePostTable
      ])
      mockLowDBInstance.data = [...sampleUsers]
    })

    test('should create single document', async () => {
      const newUser = {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User'
      }

      const result = await databaseService.create(testDatabaseId, 'users', newUser)
      expect(result).toMatchObject(newUser)
      expect(result._id).toBeDefined()
      // expect(result._createdAt).toBeDefined()
      expect(mockLowDBInstance.write).toHaveBeenCalled()
    })

    test('should find all documents', async () => {
      const results = await databaseService.find(testDatabaseId, 'users', {})
      expect(results).toHaveLength(3)
    })

    test('should find with query', async () => {
      const results = await databaseService.find(testDatabaseId, 'users', { role: 'admin' })
      expect(results).toHaveLength(1)
      expect(results[0].email).toBe('jane@example.com')
    })

    test('should update document', async () => {
      const updatedData = { firstName: 'Johnny', isActive: false }
      const result = await databaseService.update(testDatabaseId, 'users', 'user1', updatedData)

      expect(result.firstName).toBe('Johnny')
      expect(result.isActive).toBe(false)
      expect(result._updatedAt).toBeDefined()
    })

    test('should delete document', async () => {
      const result = await databaseService.delete(testDatabaseId, 'users', 'user1')
      expect(result).toBe(true)

      const remainingUsers = await databaseService.find(testDatabaseId, 'users', {})
      expect(remainingUsers).toHaveLength(3)
    })
  })

  describe('Query Operations', () => {
    beforeEach(async () => {
      await databaseService.initializeDatabase(testDatabaseId, testDatabaseName, [
        exampleUserTable,
        examplePostTable
      ])
      mockLowDBInstance.data = [...sampleUsers]
    })

    test('should count documents', async () => {
      const count = await databaseService.count(testDatabaseId, 'users', { isActive: true })
      expect(count).toBe(2)
    })

    test('should get distinct values', async () => {
      const roles = await databaseService.distinct(testDatabaseId, 'users', 'role')
      expect(roles).toEqual(['user', 'admin'])
    })

    test('should check if document exists', async () => {
      const exists = await databaseService.exists(testDatabaseId, 'users', {
        email: 'john@example.com'
      })
      expect(exists).toBe(true)
    })
  })

  describe('Error Handling', () => {
    test('should handle database not initialized', async () => {
      await expect(databaseService.find('non-existent-db', 'users', {})).rejects.toThrow()
    })

    test('should handle validation errors', async () => {
      await databaseService.initializeDatabase(testDatabaseId, testDatabaseName, [exampleUserTable])

      await expect(
        databaseService.create(testDatabaseId, 'users', { firstName: 'Test' }) // Missing email
      ).rejects.toThrow('Email is required')
    })
  })

  describe('Edge Cases', () => {
    test('should handle empty database', async () => {
      await databaseService.initializeDatabase(testDatabaseId, testDatabaseName, [exampleUserTable])
      mockLowDBInstance.data = []

      const results = await databaseService.find(testDatabaseId, 'users', {})
      expect(results).toHaveLength(0)
    })

    test('should handle null data in database', async () => {
      await databaseService.initializeDatabase(testDatabaseId, testDatabaseName, [exampleUserTable])

      // Simulate null data scenario
      const nullDbInstance = {
        data: null,
        read: vi.fn().mockResolvedValue(undefined),
        write: vi.fn().mockResolvedValue(undefined)
      }

      vi.mocked(Low).mockImplementationOnce(() => nullDbInstance as any)

      const results = await databaseService.find(testDatabaseId, 'users', {})
      expect(results).toHaveLength(0)
    })
  })
})
