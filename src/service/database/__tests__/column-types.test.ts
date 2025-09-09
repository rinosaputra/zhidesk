// File: src/schema/database/__tests__/column-types.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { createTestGenerator } from './test-utils'
import {
  createStringField,
  createNumberField,
  createBooleanField,
  createDateField,
  createEnumField,
  createReferenceField,
  createArrayField,
  createObjectField
} from '../factories'
import { DatabaseGenerator } from '../generator'

describe('Database Generator - Column Types', () => {
  let generator: DatabaseGenerator

  beforeEach(() => {
    generator = createTestGenerator()
  })

  describe('String Column', () => {
    it('should generate string schema with basic validation', () => {
      const field = createStringField({
        name: 'name',
        label: 'Full Name',
        required: true,
        validation: {
          min: 2,
          max: 100,
          trim: true
        }
      })

      const schema = generator['generateFieldSchema'](field)

      // Test valid values
      expect(schema.parse('John Doe')).toBe('John Doe')
      expect(schema.parse('  trimmed  ')).toBe('trimmed') // Should trim

      // Test invalid values
      expect(() => schema.parse('A')).toThrow() // Too short
      expect(() => schema.parse('A'.repeat(101))).toThrow() // Too long
      expect(() => schema.parse(null)).toThrow() // Required field
    })

    it('should handle string format validation', () => {
      const emailField = createStringField({
        name: 'email',
        label: 'Email',
        validation: { format: 'email' }
      })

      const schema = generator['generateFieldSchema'](emailField)

      expect(schema.parse('test@example.com')).toBe('test@example.com')
      expect(() => schema.parse('invalid-email')).toThrow()
    })
  })

  describe('Number Column', () => {
    it('should generate number schema with validation', () => {
      const field = createNumberField({
        name: 'age',
        label: 'Age',
        required: true,
        coerce: true,
        validation: {
          min: 0,
          max: 120,
          integer: true
        }
      })

      const schema = generator['generateFieldSchema'](field)

      expect(schema.parse(25)).toBe(25)
      expect(schema.parse('25')).toBe(25) // Coercion

      expect(() => schema.parse(-1)).toThrow() // Below min
      expect(() => schema.parse(121)).toThrow() // Above max
      expect(() => schema.parse(25.5)).toThrow() // Not integer
    })

    it('should handle number coercion', () => {
      const field = createNumberField({
        name: 'price',
        label: 'Price',
        coerce: true
      })

      const schema = generator['generateFieldSchema'](field)

      expect(schema.parse('100.50')).toBe(100.5)
      expect(schema.parse(100.5)).toBe(100.5)
    })
  })

  describe('Boolean Column', () => {
    it('should generate boolean schema with validation', () => {
      const field = createBooleanField({
        name: 'isActive',
        label: 'Active Status',
        default: false,
        coerce: true,
        validation: {
          is: 'true'
        }
      })

      const schema = generator['generateFieldSchema'](field)

      expect(schema.parse(true)).toBe(true)
      expect(schema.parse('true')).toBe(true) // Coercion
      expect(schema.parse(1)).toBe(true) // Coercion

      expect(() => schema.parse(false)).toThrow() // Must be true
    })

    it('should handle boolean coercion', () => {
      const field = createBooleanField({
        name: 'verified',
        label: 'Verified',
        coerce: true
      })

      const schema = generator['generateFieldSchema'](field)

      expect(schema.parse('all is true if not empty')).toBe(true)
      expect(schema.parse('')).toBe(false)
      expect(schema.parse(1)).toBe(true)
      expect(schema.parse(0)).toBe(false)
    })
  })

  describe('Date Column', () => {
    it('should generate date schema with validation', () => {
      const pastDate = new Date('2000-01-01')
      const futureDate = new Date('2030-01-01')

      const field = createDateField({
        name: 'birthDate',
        label: 'Birth Date',
        coerce: true,
        validation: {
          past: true,
          max: new Date('2020-01-01')
        }
      })

      const schema = generator['generateFieldSchema'](field)

      expect(schema.parse('2000-01-01')).toEqual(pastDate)
      expect(() => schema.parse(futureDate)).toThrow() // Future date not allowed
      expect(() => schema.parse('2025-01-01')).toThrow() // Above max
    })
  })

  describe('Enum Column', () => {
    it('should generate enum schema with options', () => {
      const field = createEnumField({
        name: 'status',
        label: 'Status',
        options: ['active', 'inactive', 'pending'],
        default: 'pending'
      })

      const schema = generator['generateFieldSchema'](field)

      expect(schema.parse('active')).toBe('active')
      expect(schema.parse('inactive')).toBe('inactive')
      expect(schema.parse('pending')).toBe('pending')
      expect(schema.parse(undefined)).toBe('pending') // Default value

      expect(() => schema.parse('invalid')).toThrow()
    })
  })

  describe('Reference Column', () => {
    it('should generate reference schema', () => {
      const field = createReferenceField({
        name: 'userId',
        label: 'User ID',
        reference: {
          tableName: 'users'
        },
        required: true
      })

      const schema = generator['generateFieldSchema'](field)

      expect(schema.parse('123e4567-e89b-12d3-a456-426614174000')).toBe(
        '123e4567-e89b-12d3-a456-426614174000'
      )
      expect(() => schema.parse('invalid-uuid')).toThrow() // Invalid UUID
      expect(() => schema.parse(null)).toThrow() // Required field
    })
  })

  describe('Array Column', () => {
    it('should generate array schema with validation', () => {
      const field = createArrayField({
        name: 'tags',
        label: 'Tags',
        items: createStringField({
          name: 'tag',
          label: 'Tag',
          validation: { min: 1 }
        }),
        validation: {
          min: 1,
          max: 5,
          unique: true
        }
      })

      const schema = generator['generateFieldSchema'](field)

      expect(schema.parse(['tech', 'programming'])).toEqual(['tech', 'programming'])
      expect(() => schema.parse([])).toThrow() // Below min
      expect(() => schema.parse(['a', 'b', 'c', 'd', 'e', 'f'])).toThrow() // Above max
      expect(() => schema.parse(['duplicate', 'duplicate'])).toThrow() // Not unique
      expect(() => schema.parse([''])).toThrow() // Empty string in items
    })
  })

  describe('Object Column', () => {
    it('should generate object schema with nested fields', () => {
      const field = createObjectField({
        name: 'address',
        label: 'Address',
        fields: [
          createStringField({
            name: 'street',
            label: 'Street',
            required: true
          }),
          createStringField({
            name: 'city',
            label: 'City',
            required: true
          }),
          createStringField({
            name: 'zipCode',
            label: 'ZIP Code',
            validation: { pattern: '^\\d{5}$' }
          })
        ]
      })

      const schema = generator['generateFieldSchema'](field)

      const validAddress = {
        street: '123 Main St',
        city: 'Springfield',
        zipCode: '12345'
      }

      expect(schema.parse(validAddress)).toEqual(validAddress)
      expect(() => schema.parse({ street: '123 Main St' })).toThrow() // Missing city
      expect(() => schema.parse({ ...validAddress, zipCode: 'invalid' })).toThrow() // Invalid zip
    })
  })
})
