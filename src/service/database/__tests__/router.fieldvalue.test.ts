// File: src/service/database/__tests__/router.fieldvalue.test.ts
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { call } from '@orpc/server'
import { DatabaseService } from '../service'
import { databaseRouter } from '../router'

vi.mock('../service', () => {
  const mockDbInstance = {
    updateFieldValue: vi.fn() // Diubah dari getDatabaseDatabaseSchema
  }

  return {
    DatabaseService: {
      getInstance: vi.fn(() => mockDbInstance)
    }
  }
})

describe('Field Operations', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockDb: DatabaseService

  beforeEach(() => {
    mockDb = DatabaseService.getInstance()
    vi.clearAllMocks()
  })

  describe('updateFieldValue', () => {
    it('should update single field successfully', async () => {
      // Arrange
      const input = {
        databaseId: 'test-db',
        tableName: 'users',
        id: 'user-123',
        field: 'name',
        value: 'Updated Name'
      }

      const mockDocument = {
        _id: 'user-123',
        name: 'Updated Name',
        email: 'original@example.com'
      }

      mockDb.updateFieldValue.mockResolvedValue(mockDocument)

      // Act
      const result = await call(databaseRouter.updateFieldValue, input)

      // Assert
      expect(result).toEqual({
        success: true,
        document: mockDocument
      })
      expect(mockDb.updateFieldValue).toHaveBeenCalledWith(
        'test-db',
        'users',
        'user-123',
        'name',
        'Updated Name'
      )
    })

    it('should handle validation errors', async () => {
      // Arrange
      const input = {
        databaseId: 'test-db',
        tableName: 'users',
        id: 'user-123',
        field: 'invalidField',
        value: 'some value'
      }

      const error = new Error("Field 'invalidField' does not exist in table 'users'")
      mockDb.updateFieldValue.mockRejectedValue(error)

      // Act
      const result = await call(databaseRouter.updateFieldValue, input)

      // Assert
      expect(result).toEqual({
        success: false,
        error: "Field 'invalidField' does not exist in table 'users'"
      })
    })

    it('should handle document not found', async () => {
      // Arrange
      const input = {
        databaseId: 'test-db',
        tableName: 'users',
        id: 'nonexistent-id',
        field: 'name',
        value: 'New Name'
      }

      const error = new Error('Document not found')
      mockDb.updateFieldValue.mockRejectedValue(error)

      // Act
      const result = await call(databaseRouter.updateFieldValue, input)

      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Document not found'
      })
    })
  })
})
