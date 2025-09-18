// File: src/service/database/__tests__/router.mock.test.ts
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { describe, it, expect } from 'vitest'
import { call, implement } from '@orpc/server'
import { databaseRouter } from '../router'

describe('Database Router - Mocking Tests', () => {
  describe('Procedure Mocking', () => {
    it('should mock individual procedures using implement', () => {
      // Mock untuk findById procedure
      const mockFindById = implement(databaseRouter.findById).handler(async ({ input }) => {
        return {
          success: true,
          document: {
            _id: input.id,
            email: 'mock@example.com',
            firstName: 'Mock',
            lastName: 'User'
          }
        }
      })

      // Mock untuk create procedure
      const mockCreate = implement(databaseRouter.create).handler(async ({ input }) => {
        return {
          success: true,
          document: {
            _id: 'mock-id',
            ...input.data,
            _createdAt: new Date()
          }
        }
      })

      // Test mocked procedures
      expect(mockFindById).toBeDefined()
      expect(mockCreate).toBeDefined()
    })

    it('should create mock router for testing', async () => {
      // Buat mock router menggunakan implement
      const mockRouter = implement(databaseRouter).router({
        findById: implement(databaseRouter.findById).handler(async ({ input }) => ({
          success: true,
          document: { _id: input.id, name: 'Mock User' }
        })),

        create: implement(databaseRouter.create).handler(async ({ input }) => ({
          success: true,
          document: { _id: 'mock-id', ...input.data }
        }))
      })

      // Test mock router
      const result = await call(mockRouter.findById, {
        databaseId: 'test-db',
        tableName: 'users',
        id: '123'
      })

      expect(result.success).toBe(true)
      expect(result.document?.name).toBe('Mock User')
    })
  })

  describe('Error Scenario Mocking', () => {
    it('should mock error responses', async () => {
      const mockWithError = implement(databaseRouter.findById).handler(async () => {
        return {
          success: false,
          document: null,
          error: 'Mocked error response'
        }
      })

      const result = await call(mockWithError, {
        databaseId: 'test-db',
        tableName: 'users',
        id: '123'
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Mocked error response')
    })

    it.skip('should mock validation errors', async () => {
      const mockWithValidationError = implement(databaseRouter.create).handler(async () => {
        throw new Error('Validation failed: email is required')
      })

      const result = await call(mockWithValidationError, {
        databaseId: 'test-db',
        tableName: 'users',
        data: { firstName: 'John' } // Missing email
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Validation failed')
    })
  })
})
