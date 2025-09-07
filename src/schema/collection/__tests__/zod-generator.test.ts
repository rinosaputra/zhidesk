// File: src/schema/collection/__tests__/zod-generator.test.ts
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { describe, it, expect, beforeEach } from 'vitest'
import {
  createArraySchema,
  createObjectSchema,
  createStringSchema,
  DocGenerator
} from '../doc.class'
import { testSchemas, TestSchemasResult } from './zod-setup'

describe('DocGenerator', () => {
  let generator: DocGenerator

  beforeEach(() => {
    generator = new DocGenerator()
    // Register all test schemas
    testSchemas.forEach((schema) => {
      generator.registerSchema(schema)
    })
  })

  describe('Basic Schema Generation', () => {
    it('should generate string schema with validation', () => {
      const schema = generator.generate('nisn')

      // Test valid data
      expect(() => schema.parse('1234567890')).not.toThrow()

      // Test invalid data
      expect(() => schema.parse('12345')).toThrow() // Too short
      expect(() => schema.parse('12345678901')).toThrow() // Too long
      expect(() => schema.parse('abc123def')).toThrow() // Contains letters

      // Type safety test
      const result: string = schema.parse('1234567890')
      expect(result).toBe('1234567890')
    })

    it('should generate number schema with validation', () => {
      const schema = generator.generate('age')

      // Test valid data
      expect(() => schema.parse(15)).not.toThrow()
      expect(() => schema.parse('15')).not.toThrow() // Coerce should work

      // Test invalid data
      expect(() => schema.parse(4)).toThrow() // Below min
      expect(() => schema.parse(26)).toThrow() // Above max
      expect(() => schema.parse(15.5)).toThrow() // Not integer

      // Type safety test
      const result: number = schema.parse(15)
      expect(result).toBe(15)
    })

    it('should generate complex object schema with type inference', () => {
      const schema = generator.generate('student')

      const validStudent: TestSchemasResult['student'] = {
        nisn: '1234567890',
        name: 'John Doe',
        age: 15,
        isActive: true,
        birthDate: new Date('2010-05-15'),
        hobbies: ['Reading', 'Sports'],
        address: {
          street: 'Jl. Merdeka No. 123',
          city: 'Jakarta'
        }
      }

      expect(() => schema.parse(validStudent)).not.toThrow()

      // Type inference test
      const result: TestSchemasResult['student'] = schema.parse(validStudent)
      expect(result.nisn).toBe('1234567890')
      expect(result.name).toBe('John Doe')
      expect(result.age).toBe(15)
    })
  })

  describe('Type Inference', () => {
    it('should infer correct types for generated schemas', () => {
      const nisnSchema = generator.generate('nisn')
      const ageSchema = generator.generate('age')
      const studentSchema = generator.generate('student')

      // Type inference tests
      const nisn: string = nisnSchema.parse('1234567890')
      const age: number = ageSchema.parse(15)
      const student: TestSchemasResult['student'] = studentSchema.parse({
        nisn: '1234567890',
        name: 'John Doe',
        age: 15,
        isActive: true,
        birthDate: new Date('2010-05-15'),
        hobbies: ['Reading'],
        address: {
          street: 'Jl. Merdeka No. 123',
          city: 'Jakarta'
        }
      })

      expect(nisn).toBe('1234567890')
      expect(age).toBe(15)
      expect(student.name).toBe('John Doe')
    })
  })

  describe('Array Schema Generation', () => {
    it('should generate array schema with validation', () => {
      const schema = generator.generate('hobbies')

      // Test valid data
      expect(() => schema.parse(['Reading', 'Sports'])).not.toThrow()
      expect(() => schema.parse(['Music'])).not.toThrow() // Min 1

      // Test invalid data
      expect(() => schema.parse([])).toThrow() // Below min
      expect(() => schema.parse(['1', '2', '3', '4', '5', '6'])).toThrow() // Above max
    })
  })

  describe('Object Schema Generation', () => {
    it('should generate object schema with nested validation', () => {
      const schema = generator.generate('address')

      const validAddress = {
        street: 'Jl. Merdeka No. 123',
        city: 'Jakarta'
      }

      const invalidAddress = {
        street: '', // Empty string should fail
        city: 'Jakarta'
      }

      expect(() => schema.parse(validAddress)).not.toThrow()
      expect(() => schema.parse(invalidAddress)).toThrow()
    })

    it('should generate complex object schema', () => {
      const schema = generator.generate('student')

      const validStudent = {
        nisn: '1234567890',
        name: 'John Doe',
        age: 15,
        isActive: true,
        birthDate: new Date('2010-05-15'),
        hobbies: ['Reading', 'Sports'],
        address: {
          street: 'Jl. Merdeka No. 123',
          city: 'Jakarta'
        }
      }

      expect(() => schema.parse(validStudent)).not.toThrow()
    })

    it('should reject invalid complex object', () => {
      const schema = generator.generate('student')

      const invalidStudent = {
        nisn: '123', // Too short
        name: 'J', // Too short
        age: 3, // Too young
        isActive: true,
        birthDate: new Date('2020-05-15'), // Too recent
        hobbies: [], // No hobbies
        address: {
          street: '', // Empty street
          city: 'Jakarta'
        }
      }

      expect(() => schema.parse(invalidStudent)).toThrow()
    })
  })

  describe('Modifiers', () => {
    it('should apply nullable modifier', () => {
      const nullableSchema = createStringSchema({
        name: 'nullableTest',
        label: 'Nullable Test',
        nullable: true
      })

      generator.registerSchema(nullableSchema)
      const schema = generator.generate('nullableTest')

      expect(() => schema.parse('test')).not.toThrow()
      expect(() => schema.parse(null)).not.toThrow()
      expect(() => schema.parse(undefined)).toThrow()
    })

    it('should apply optional modifier', () => {
      const optionalSchema = createStringSchema({
        name: 'optionalTest',
        label: 'Optional Test',
        optional: true
      })

      generator.registerSchema(optionalSchema)
      const schema = generator.generate('optionalTest')

      expect(() => schema.parse('test')).not.toThrow()
      expect(() => schema.parse(undefined)).not.toThrow()
      expect(() => schema.parse(null)).toThrow()
    })

    it('should apply noempty modifier', () => {
      const noemptySchema = createStringSchema({
        name: 'noemptyTest',
        label: 'Noempty Test',
        noempty: true
      })

      generator.registerSchema(noemptySchema)
      const schema = generator.generate('noemptyTest')

      expect(() => schema.parse('test')).not.toThrow()
      expect(() => schema.parse('')).toThrow()
    })

    it('should apply default values', () => {
      const defaultSchema = createStringSchema({
        name: 'defaultTest',
        label: 'Default Test',
        default: 'defaultValue'
      })

      generator.registerSchema(defaultSchema)
      const schema = generator.generate('defaultTest')

      expect(schema.parse(undefined)).toBe('defaultValue')
      expect(schema.parse('customValue')).toBe('customValue')
    })
  })

  describe('Coercion', () => {
    it('should coerce string values', () => {
      const schema = generator.generate('nisn')
      expect(schema.parse(1234567890)).toBe('1234567890')
    })

    it('should coerce number values', () => {
      const schema = generator.generate('age')
      expect(schema.parse('15')).toBe(15)
    })

    it('should coerce boolean values', () => {
      const schema = generator.generate('isActive')

      expect(schema.parse(true)).toBe(true)
      expect(schema.parse(false)).toBe(false)
      expect(schema.parse(1)).toBe(true)
      expect(schema.parse(0)).toBe(false)
      expect(schema.parse('true')).toBe(true)
      expect(schema.parse('false')).toBe(false)
    })

    it('should coerce date values', () => {
      const schema = generator.generate('birthDate')
      const date = new Date('2010-05-15')

      expect(schema.parse('2010-05-15')).toEqual(date)
      expect(schema.parse(date.getTime())).toEqual(date)
    })
  })

  describe('Error Messages', () => {
    it('should provide meaningful error messages for string validation', () => {
      const schema = generator.generate('nisn')

      const result = schema.safeParse('123')
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Too small')
      }
    })

    it('should provide meaningful error messages for number validation', () => {
      const schema = generator.generate('age')

      const result = schema.safeParse(3)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Too small')
      }
    })
  })

  describe('Default Values Extraction', () => {
    it('should extract default values correctly', () => {
      const defaults = generator.extractDefaults('student')

      expect(defaults).toEqual({
        nisn: '',
        name: '',
        age: 0,
        isActive: true,
        birthDate: undefined,
        hobbies: [],
        address: {
          street: '',
          city: ''
        }
      })
    })
  })

  describe('Edge Cases', () => {
    it('should throw error for unknown schema', () => {
      expect(() => generator.generate('unknownSchema')).toThrow(
        'Schema unknownSchema not found in registry'
      )
    })

    it('should handle empty array validation', () => {
      const emptyArraySchema = createArraySchema({
        name: 'emptyArrayTest',
        label: 'Empty Array Test',
        properties: createStringSchema({
          name: 'emptyArrayItem',
          label: 'Empty Array Item'
        }),
        validation: {
          min: 0,
          max: 10
        }
      })

      generator.registerSchema(emptyArraySchema)
      const schema = generator.generate('emptyArrayTest')

      expect(() => schema.parse([])).not.toThrow()
      expect(() => schema.parse(['item'])).not.toThrow()
      expect(() => schema.parse(new Array(11).fill('item'))).toThrow()
    })

    it('should handle strict object validation', () => {
      const strictSchema = createObjectSchema({
        name: 'strictTest',
        label: 'Strict Test',
        properties: [
          createStringSchema({
            name: 'requiredField',
            label: 'Required Field'
          })
        ],
        validation: {
          strict: true
        }
      })

      generator.registerSchema(strictSchema)
      const schema = generator.generate('strictTest')

      expect(() => schema.parse({ requiredField: 'value' })).not.toThrow()
      expect(() => schema.parse({ requiredField: 'value', extraField: 'extra' })).toThrow()
    })
  })

  describe('Boolean Coercion Edge Cases', () => {
    it('should handle various boolean coercion inputs correctly', () => {
      const schema = generator.generate('isActive')

      // Test various truthy values
      expect(schema.parse('true')).toBe(true)
      expect(schema.parse('1')).toBe(true)
      expect(schema.parse(1)).toBe(true)

      // Test various falsy values
      expect(schema.parse('false')).toBe(false)
      expect(schema.parse('0')).toBe(false)
      expect(schema.parse(0)).toBe(false)

      // Test actual booleans
      expect(schema.parse(true)).toBe(true)
      expect(schema.parse(false)).toBe(false)
    })
  })

  describe('Date Validation', () => {
    it('should validate date ranges correctly', () => {
      const schema = generator.generate('birthDate')

      // Valid date (before max)
      expect(() => schema.parse(new Date('2010-05-15'))).not.toThrow()

      // Invalid date (after max)
      expect(() => schema.parse(new Date('2020-05-15'))).toThrow()

      // Valid string date
      expect(() => schema.parse('2010-05-15')).not.toThrow()
    })
  })
})
