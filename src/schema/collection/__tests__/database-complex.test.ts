// File: src/schema/generator/zod/__tests__/database-complex.test.ts
import { describe, it, expect } from 'vitest'
import {
  DocGenerator,
  createObjectSchema,
  createStringSchema,
  createArraySchema
} from '../doc.class'

describe('Database Complex Scenarios', () => {
  // Test untuk complex nested structures
  const complexStudentSchema = createObjectSchema({
    name: 'complexStudent',
    label: 'Complex Student',
    properties: [
      createStringSchema({
        name: 'nisn',
        label: 'NISN',
        coerce: true
      }),
      createStringSchema({
        name: 'name',
        label: 'Name',
        coerce: true
      }),
      createObjectSchema({
        name: 'address',
        label: 'Address',
        properties: [
          createStringSchema({ name: 'street', label: 'Street' }),
          createStringSchema({ name: 'city', label: 'City' })
        ]
      }),
      createArraySchema({
        name: 'previousSchools',
        label: 'Previous Schools',
        properties: createObjectSchema({
          name: 'school',
          label: 'School',
          properties: [
            createStringSchema({ name: 'name', label: 'School Name' }),
            createStringSchema({ name: 'level', label: 'Level' }),
            createStringSchema({ name: 'year', label: 'Year' })
          ]
        })
      })
    ]
  })

  const schemas = [complexStudentSchema]
  const generator = new DocGenerator(schemas)

  it('should handle deeply nested objects', () => {
    const schema = generator.generate('complexStudent')

    const complexStudent = {
      nisn: '1234567890',
      name: 'John Doe',
      address: {
        street: '123 Main St',
        city: 'Jakarta'
      },
      previousSchools: [
        {
          name: 'Elementary School',
          level: 'Elementary',
          year: '2015'
        }
      ]
    }

    expect(() => schema.parse(complexStudent)).not.toThrow()
  })

  it('should validate nested array structures', () => {
    const schema = generator.generate('complexStudent')

    // Test dengan multiple previous schools
    const studentWithMultipleSchools = {
      nisn: '1234567890',
      name: 'John Doe',
      address: {
        street: '123 Main St',
        city: 'Jakarta'
      },
      previousSchools: [
        {
          name: 'Elementary School',
          level: 'Elementary',
          year: '2015'
        },
        {
          name: 'Middle School',
          level: 'Middle',
          year: '2018'
        }
      ]
    }

    expect(() => schema.parse(studentWithMultipleSchools)).not.toThrow()
  })
})
