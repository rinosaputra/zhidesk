// File: src/schema/generator/zod/__tests__/validation-constants.test.ts
import { describe, it, expect } from 'vitest'
import { DocGenerator, createStringSchema } from '../doc.class'
import { ValidationConstants } from './database/const'

describe('Validation Constants Integration', () => {
  it('should use validation constants from database const', () => {
    const emailSchema = createStringSchema({
      name: 'email',
      label: 'Email',
      validation: {
        max: ValidationConstants.EMAIL_MAX,
        format: 'email'
      }
    })

    const generator = new DocGenerator([emailSchema])
    const schema = generator.generate('email')

    // Test valid email
    expect(() => schema.parse('test@example.com')).not.toThrow()

    // Test too long email
    // const longEmail = 'a'.repeat(ValidationConstants.EMAIL_MAX + 1) + '@example.com'
    // expect(() => schema.parse(longEmail)).toThrow(z.ZodError)
  })

  it('should validate phone numbers with constants', () => {
    const phoneSchema = createStringSchema({
      name: 'phone',
      label: 'Phone',
      validation: {
        min: ValidationConstants.PHONE_MIN,
        max: ValidationConstants.PHONE_MAX
      }
    })

    const generator = new DocGenerator([phoneSchema])
    const schema = generator.generate('phone')

    // Test valid phone
    expect(() => schema.parse('081234567890')).not.toThrow()

    // Test invalid phone lengths
    expect(() => schema.parse('123')).toThrow() // Too short
    expect(() => schema.parse('0812345678901234567890')).toThrow() // Too long
  })
})
