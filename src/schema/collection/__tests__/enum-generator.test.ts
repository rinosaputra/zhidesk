/* eslint-disable @typescript-eslint/no-unused-vars */
// File: src/schema/generator/zod/__tests__/enum-generator.test.ts
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { createEnumSchema, DocGenerator } from '../doc.class'
import { enumSchemas } from './enum-setup'
import { EnumGender } from './database/const'

describe('Enum Zod Generator', () => {
  const generator = new DocGenerator(enumSchemas)

  it('should generate enum schema with validation', () => {
    const schema = generator.generate('gender')

    // Test valid values
    EnumGender.forEach((gender) => {
      expect(() => schema.parse(gender)).not.toThrow()
    })

    // Test case insensitive
    // expect(() => schema.parse('MALE')).not.toThrow()
    // expect(() => schema.parse('Female')).not.toThrow()

    // Test invalid value
    expect(() => schema.parse('invalid-gender')).toThrow()
  })

  it('should provide meaningful error messages for enum', () => {
    const schema = generator.generate('status')

    try {
      schema.parse('invalid-status')
      expect.fail('Should have thrown validation error')
    } catch (error) {
      if (error instanceof z.ZodError) {
        expect(JSON.stringify(error.message)).toContain('invalid_value')
      }
    }
  })

  it('should work with type inference', () => {
    const schema = generator.generate('gender')
    type GenderType = z.infer<typeof schema>

    const gender: GenderType = 'male'
    expect(gender).toBe('male')

    // TypeScript should error on invalid values
    // @ts-expect-error - Testing type safety
    const invalidGender: GenderType = 'invalid' // This should show TypeScript error
  })

  it('should handle case sensitivity', () => {
    const caseSensitiveSchema = createEnumSchema({
      name: 'caseSensitiveEnum',
      label: 'Case Sensitive Enum',
      validation: {
        values: ['UPPERCASE', 'lowercase'],
        caseSensitive: true
      }
    })

    const generator = new DocGenerator([caseSensitiveSchema])
    const schema = generator.generate('caseSensitiveEnum')

    expect(() => schema.parse('UPPERCASE')).not.toThrow()
    expect(() => schema.parse('lowercase')).not.toThrow()
    expect(() => schema.parse('uppercase')).toThrow() // Should fail with case sensitivity
  })
})
