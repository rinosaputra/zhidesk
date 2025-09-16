// File: src/service/database/__tests__/router.integration.test.ts
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { call } from '@orpc/server'
import { DatabaseService } from '../service'
import { databaseRouter } from '../router'
import { exampleUserTable } from '../examples'

// Integration test dengan service yang sebenarnya
describe('Database Router - Integration Tests', () => {
  let dbService: DatabaseService

  beforeEach(async () => {
    dbService = DatabaseService.getInstance()
    // Clean up sebelum test
    try {
      await dbService.closeDatabase('test-integration')
    } catch (error) {
      // Ignore jika database tidak exist
    }
  })

  afterEach(async () => {
    // Clean up setelah test
    try {
      await dbService.closeDatabase('test-integration')
    } catch (error) {
      // Ignore jika database tidak exist
    }
  })

  it('should perform full CRUD lifecycle', async () => {
    // Initialize database
    const initResult = await call(databaseRouter.initializeDatabase, {
      databaseId: 'test-integration',
      databaseName: 'Integration Test DB',
      tables: [exampleUserTable]
    })
    expect(initResult.success).toBe(true)

    // Create document
    const createResult = await call(databaseRouter.create, {
      databaseId: 'test-integration',
      tableName: 'users',
      data: {
        email: 'test@example.com',
        firstName: 'Integration',
        lastName: 'Test',
        role: 'user',
        password: '12345678',
        isActive: true,
        lastLogin: new Date()
      }
    })
    expect(createResult.success).toBe(true)
    expect(createResult.document).toHaveProperty('_id')

    const documentId = createResult.document!._id

    // Find by ID
    const findResult = await call(databaseRouter.findById, {
      databaseId: 'test-integration',
      tableName: 'users',
      id: documentId!
    })
    expect(findResult.success).toBe(true)
    expect(findResult.document).toEqual(createResult.document)

    // Update document
    const updateResult = await call(databaseRouter.update, {
      databaseId: 'test-integration',
      tableName: 'users',
      id: documentId!,
      data: { firstName: 'Updated' }
    })
    expect(updateResult.success).toBe(true)

    // Verify update
    const verifyResult = await call(databaseRouter.findById, {
      databaseId: 'test-integration',
      tableName: 'users',
      id: documentId!
    })
    expect(verifyResult.document?.firstName).toBe('Updated')

    // Delete document
    const deleteResult = await call(databaseRouter.delete, {
      databaseId: 'test-integration',
      tableName: 'users',
      id: documentId!
    })
    expect(deleteResult.success).toBe(true)
    expect(deleteResult.deleted).toBe(true)
  })

  it('should handle query operations', async () => {
    // Initialize database
    await call(databaseRouter.initializeDatabase, {
      databaseId: 'test-integration',
      databaseName: 'Integration Test DB',
      tables: [exampleUserTable]
    })

    // Create multiple documents
    const createMany = await call(databaseRouter.createMany, {
      databaseId: 'test-integration',
      tableName: 'users',
      data: [
        {
          _id: 'user1',
          email: 'user1@example.com',
          firstName: 'User1',
          role: 'admin',
          password: '12345678',
          lastName: 'lastName',
          isActive: true,
          lastLogin: new Date()
        },
        {
          _id: 'user2',
          email: 'user2@example.com',
          firstName: 'User2',
          role: 'user',
          password: '12345678',
          lastName: 'lastName',
          isActive: true,
          lastLogin: new Date()
        },
        {
          _id: 'user3',
          email: 'user3@example.com',
          firstName: 'User3',
          role: 'admin',
          password: '12345678',
          lastName: 'lastName',
          isActive: true,
          lastLogin: new Date()
        }
      ]
    })
    if (!createMany.success) console.log(createMany.error)
    expect(createMany.success).toBe(true)
    expect(Object.values(createMany.documents ?? {}).length).toBe(3)

    // Count documents
    const countResult = await call(databaseRouter.count, {
      databaseId: 'test-integration',
      tableName: 'users',
      query: { role: 'admin' }
    })
    expect(countResult.success).toBe(true)
    expect(countResult.count).toBe(2)

    // Distinct values
    const distinctResult = await call(databaseRouter.distinct, {
      databaseId: 'test-integration',
      tableName: 'users',
      field: 'role'
    })
    expect(distinctResult.success).toBe(true)
    expect(distinctResult.values).toEqual(['admin', 'user'])
  })
})
