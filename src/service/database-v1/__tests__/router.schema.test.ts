// File: src/service/database/__tests__/router.schema.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { call } from '@orpc/server'
import { DatabaseService } from '../service'
import { databaseRouter } from '../router'
import { createStringField } from '../factories'

describe('Schema Operations', () => {
  let mockDb: any

  beforeEach(() => {
    mockDb = DatabaseService.getInstance()
    vi.clearAllMocks()
  })

  describe('updateTableField', () => {
    it('should update field properties successfully', async () => {
      // Arrange
      const input = {
        databaseId: 'test-db',
        tableName: 'users',
        fieldName: 'email',
        updates: {
          label: 'Updated Email Label',
          required: true
        }
      }

      const mockSchema = {
        name: 'users',
        fields: [
          { name: 'email', label: 'Updated Email Label', required: true, type: 'string' },
          { name: 'name', label: 'Name', type: 'string' }
        ]
      }

      mockDb.updateTableField.mockResolvedValue(mockSchema)

      // Act
      const result = await call(databaseRouter.updateTableField, input)

      // Assert
      expect(result).toEqual({
        success: true,
        schema: mockSchema
      })
    })

    it('should handle field not found', async () => {
      // Arrange
      const input = {
        databaseId: 'test-db',
        tableName: 'users',
        fieldName: 'nonexistent',
        updates: { label: 'New Label' }
      }

      const error = new Error('Field nonexistent not found in table users')
      mockDb.updateTableField.mockRejectedValue(error)

      // Act
      const result = await call(databaseRouter.updateTableField, input)

      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Field nonexistent not found in table users'
      })
    })
  })

  describe('addTableField', () => {
    it('should add new field successfully', async () => {
      // Arrange
      const newField = createStringField({
        name: 'phone',
        label: 'Phone Number',
        required: false,
        validation: { max: 20 }
      })

      const input = {
        databaseId: 'test-db',
        tableName: 'users',
        field: newField
      }

      const mockSchema = {
        name: 'users',
        fields: [
          { name: 'email', type: 'string' },
          { name: 'phone', type: 'string', label: 'Phone Number' }
        ]
      }

      mockDb.addTableField.mockResolvedValue(mockSchema)

      // Act
      const result = await call(databaseRouter.addTableField, input)

      // Assert
      expect(result).toEqual({
        success: true,
        schema: mockSchema
      })
    })
  })

  describe('removeTableField', () => {
    it('should remove field successfully', async () => {
      // Arrange
      const input = {
        databaseId: 'test-db',
        tableName: 'users',
        fieldName: 'lastLogin'
      }

      const mockSchema = {
        name: 'users',
        fields: [
          { name: 'email', type: 'string' }
          // lastLogin removed
        ]
      }

      mockDb.removeTableField.mockResolvedValue(mockSchema)

      // Act
      const result = await call(databaseRouter.removeTableField, input)

      // Assert
      expect(result).toEqual({
        success: true,
        schema: mockSchema
      })
    })
  })
})
