// File: src/schema/database/__tests__/factories.test.ts
import { describe, it, expect } from 'vitest'
import {
  createStringField,
  createNumberField,
  createBooleanField,
  // createDateField,
  // createEnumField,
  // createReferenceField,
  // createArrayField,
  createObjectField,
  createTable
} from '../factories'

describe('Factory Functions', () => {
  it('should create string field with correct type', () => {
    const field = createStringField({
      name: 'test',
      label: 'Test Field'
    })

    expect(field.type).toBe('string')
    expect(field.name).toBe('test')
    expect(field.label).toBe('Test Field')
  })

  it('should create number field with validation', () => {
    const field = createNumberField({
      name: 'age',
      label: 'Age',
      validation: { min: 0, max: 120 }
    })

    expect(field.type).toBe('number')
    expect(field.validation?.min).toBe(0)
    expect(field.validation?.max).toBe(120)
  })

  it('should create complete table with multiple field types', () => {
    const table = createTable({
      name: 'users',
      label: 'Users',
      timestamps: true,
      fields: [
        createStringField({ name: 'name', label: 'Name', required: true }),
        createNumberField({ name: 'age', label: 'Age' }),
        createBooleanField({ name: 'active', label: 'Active', default: true })
      ]
    })

    expect(table.name).toBe('users')
    expect(table.fields).toHaveLength(3)
    expect(table.timestamps).toBe(true)
    expect(table.fields[0].type).toBe('string')
    expect(table.fields[1].type).toBe('number')
    expect(table.fields[2].type).toBe('boolean')
  })

  it('should create nested object fields', () => {
    const field = createObjectField({
      name: 'address',
      label: 'Address',
      fields: [
        createStringField({ name: 'street', label: 'Street' }),
        createStringField({ name: 'city', label: 'City' })
      ]
    })

    expect(field.type).toBe('object')
    expect(field.fields).toHaveLength(2)
    expect(field.fields[0].name).toBe('street')
    expect(field.fields[1].name).toBe('city')
  })
})
