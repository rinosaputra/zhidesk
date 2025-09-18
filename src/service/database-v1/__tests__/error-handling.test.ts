/* eslint-disable @typescript-eslint/no-explicit-any */
// File: src/schema/database/__tests__/error-handling.test.ts
import { describe, it, expect } from 'vitest'
import { DatabaseGenerator } from '../generator'
import {
  createTable,
  createStringField,
  createObjectField,
  createReferenceField
} from '../factories'
import { TableSchema } from '../types'

describe('Database Generator - Error Handling', () => {
  const generator = new DatabaseGenerator()

  it('should throw error for non-existent table', () => {
    expect(() => generator.generateTableSchema('nonexistent')).toThrow(
      'Table nonexistent not found'
    )
    expect(() => generator.extractDefaults('nonexistent')).not.toThrow()
    expect(generator.extractDefaults('nonexistent')).toEqual({})
  })

  it('should handle invalid field configurations', () => {
    const invalidTable = TableSchema.safeParse({
      name: 'invalid',
      label: 'Invalid Table',
      fields: [
        {
          // Invalid field without type
          name: 'invalidField',
          label: 'Invalid Field'
        } as any
      ]
    })

    expect(invalidTable.success).toBe(false)
  })

  it('should handle enum field without options', () => {
    const tableWithInvalidEnum = TableSchema.safeParse({
      name: 'badEnum',
      label: 'Bad Enum Table',
      fields: [
        {
          type: 'enum',
          name: 'badEnum',
          label: 'Bad Enum',
          options: [] // Empty options array
        } as any
      ]
    })

    expect(tableWithInvalidEnum.success).toBe(false)
  })

  it('should handle circular references in object fields', () => {
    // This test ensures the generator doesn't get stuck in infinite loops
    const selfReferencingTable = createTable({
      name: 'selfRef',
      label: 'Self Referencing',
      fields: [
        createStringField({
          name: 'name',
          label: 'Name',
          required: true
        }),
        createObjectField({
          name: 'parent',
          label: 'Parent',
          fields: [
            createStringField({
              name: 'name',
              label: 'Parent Name'
            }),
            createReferenceField({
              name: 'childId',
              label: 'Child',
              reference: {
                tableName: 'selfRef'
              }
            })
          ]
        })
      ]
    })

    generator.registerTable(selfReferencingTable)

    // Should be able to generate schema without infinite loop
    const schema = generator.generateTableSchema('selfRef')
    expect(schema).toBeDefined()
  })
})
