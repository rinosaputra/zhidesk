// File: src/schema/database/client.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { z } from 'zod'
import { DatabaseClient } from './client'
import type {
  SchemaDatabase,
  SchemaColumnString,
  SchemaColumnNumber,
  SchemaColumnBoolean,
  SchemaColumnDate,
  SchemaColumnEnum,
  SchemaColumnArray,
  SchemaColumnObject
} from './index'
import { getSchemaCore } from './index'

// Mock data untuk testing
const createMockDatabase = (): SchemaDatabase => ({
  ...getSchemaCore({}),
  name: 'Test DB',
  description: 'A test database',
  version: 1,
  tables: [
    {
      ...getSchemaCore({}),
      name: 'users',
      description: 'Users table',
      columns: [
        {
          ...getSchemaCore({}),
          name: 'name',
          description: 'User name',
          isNullable: false,
          isOptional: false,
          type: 'string',
          validation: {
            min: 3,
            max: 50,
            trim: true
          }
        },
        {
          ...getSchemaCore({}),
          name: 'email',
          description: 'User email',
          isNullable: false,
          isOptional: false,
          type: 'string',
          validation: {
            format: 'email'
          }
        },
        {
          ...getSchemaCore({}),
          name: 'age',
          description: 'User age',
          isNullable: true,
          isOptional: false,
          type: 'number',
          validation: {
            min: 18,
            max: 120,
            integer: true
          }
        },
        {
          ...getSchemaCore({}),
          name: 'role',
          description: 'User role',
          isNullable: false,
          isOptional: false,
          type: 'enum',
          validation: {
            options: [
              { label: 'Admin', value: 'admin' },
              { label: 'User', value: 'user' },
              { label: 'Guest', value: 'guest' }
            ],
            defaultValue: 'user'
          }
        },
        {
          ...getSchemaCore({}),
          name: 'isVerified',
          description: 'Is user verified',
          isNullable: false,
          isOptional: false,
          type: 'boolean',
          validation: {
            defaultValue: false
          }
        },
        {
          ...getSchemaCore({}),
          name: 'birthDate',
          description: 'User birth date',
          isNullable: true,
          isOptional: false,
          type: 'date',
          validation: {
            past: true
          }
        },
        {
          ...getSchemaCore({}),
          name: 'tags',
          description: 'User tags',
          isNullable: false,
          isOptional: false,
          type: 'array',
          validation: {
            min: 1,
            max: 10,
            column: {
              ...getSchemaCore({}),
              name: 'tag',
              description: 'Individual tag',
              isNullable: false,
              isOptional: false,
              type: 'string',
              validation: { min: 2, max: 20 }
            }
          }
        },
        {
          ...getSchemaCore({}),
          name: 'address',
          description: 'User address',
          isNullable: false,
          isOptional: false,
          type: 'object',
          validation: {
            columns: [
              {
                ...getSchemaCore({}),
                name: 'street',
                description: 'Street address',
                isNullable: false,
                isOptional: false,
                type: 'string'
              },
              {
                ...getSchemaCore({}),
                name: 'city',
                description: 'City name',
                isNullable: false,
                isOptional: false,
                type: 'string'
              },
              {
                ...getSchemaCore({}),
                name: 'zipCode',
                description: 'Zip code',
                isNullable: false,
                isOptional: false,
                type: 'string',
                validation: { pattern: '^\\d{5}(-\\d{4})?$' }
              }
            ]
          }
        }
      ]
    },
    {
      ...getSchemaCore({}),
      name: 'posts',
      description: 'Posts table',
      columns: [
        {
          ...getSchemaCore({}),
          name: 'title',
          description: 'Post title',
          isNullable: false,
          isOptional: false,
          type: 'string',
          validation: { min: 5, max: 100 }
        },
        {
          ...getSchemaCore({}),
          name: 'content',
          description: 'Post content',
          isNullable: false,
          isOptional: false,
          type: 'string',
          validation: { min: 10 }
        },
        {
          ...getSchemaCore({}),
          name: 'authorId',
          description: 'Reference to author',
          isNullable: false,
          isOptional: false,
          type: 'reference',
          validation: {
            table: 'users',
            column: '_id',
            selects: ['name', 'email']
          }
        }
      ]
    }
  ]
})

describe('DatabaseClient', () => {
  let mockDb: SchemaDatabase
  let client: DatabaseClient
  let databaseId: string
  let tableId: string
  let props: { databaseId: string; tableId: string }

  beforeEach(() => {
    mockDb = createMockDatabase()
    client = new DatabaseClient([mockDb])
    databaseId = mockDb._id
    tableId = mockDb.tables[0]._id
    props = { databaseId, tableId }
  })

  describe('Initialization', () => {
    it('should be initialized with a database schema', () => {
      expect(client).toBeInstanceOf(DatabaseClient)
    })

    it('should throw error for non-existent database', () => {
      expect(() => client.getTables({ databaseId: 'nonexistent' })).toThrow(
        'Database not initialized'
      )
    })
  })

  describe('getTables', () => {
    it('should return all tables from the database schema', () => {
      const tables = client.getTables(props).values().value()
      expect(tables).toHaveLength(2)
      expect(tables[0].name).toBe('users')
      expect(tables[1].name).toBe('posts')
    })
  })

  describe('getTable', () => {
    it('should return a specific table by id', () => {
      const table = client.getTable(props).value()
      expect(table.name).toBe('users')
      expect(table.description).toBe('Users table')
    })

    it('should throw an error if table is not found', () => {
      expect(() => client.getTable({ ...props, tableId: 'nonexistent' }).value()).toThrow(
        'Table not found'
      )
    })
  })

  describe('getTableColumns', () => {
    it('should return columns for a specific table', () => {
      const columns = client.getTableColumns(props).values().value()
      expect(columns).toHaveLength(8)
      expect(columns[0].name).toBe('name')
      expect(columns[1].name).toBe('email')
    })
  })

  describe('generateZodString', () => {
    it('should generate a zod string schema with min validation', () => {
      const column: SchemaColumnString = {
        ...getSchemaCore({}),
        name: 'username',
        description: 'Username',
        isNullable: false,
        isOptional: false,
        type: 'string',
        validation: { min: 8 }
      }
      const zodSchema = client.generateZodString(column)
      // @ts-ignore #infinite
      const result = zodSchema.safeParse('username')
      expect(result.success).toBe(true)
      expect(zodSchema.safeParse('user').success).toBe(false)
    })

    it('should generate a zod email schema', () => {
      const column: SchemaColumnString = {
        ...getSchemaCore({}),
        name: 'email',
        description: 'Email',
        isNullable: false,
        isOptional: false,
        type: 'string',
        validation: { format: 'email' }
      }
      const zodSchema = client.generateZodString(column)
      // @ts-ignore #infinite
      expect(zodSchema.safeParse('test@example.com').success).toBe(true)
      expect(zodSchema.safeParse('invalid-email').success).toBe(false)
    })

    it('should generate a zod uuid schema', () => {
      const column: SchemaColumnString = {
        ...getSchemaCore({}),
        name: 'uuid',
        description: 'UUID',
        isNullable: false,
        isOptional: false,
        type: 'string',
        validation: { format: 'uuid' }
      }
      const zodSchema = client.generateZodString(column)
      const validUUID = '123e4567-e89b-12d3-a456-426614174000'
      expect(zodSchema.safeParse(validUUID).success).toBe(true)
      expect(zodSchema.safeParse('invalid-uuid').success).toBe(false)
    })

    it('should handle nullable and optional strings', () => {
      const column: SchemaColumnString = {
        ...getSchemaCore({}),
        name: 'optionalField',
        description: 'Optional field',
        isNullable: true,
        isOptional: true,
        type: 'string'
      }
      const zodSchema = client.generateZodString(column)
      expect(zodSchema.safeParse(null).success).toBe(true)
      expect(zodSchema.safeParse(undefined).success).toBe(true)
    })

    it('should handle string with default value', () => {
      const column: SchemaColumnString = {
        ...getSchemaCore({}),
        name: 'status',
        description: 'Status',
        isNullable: false,
        isOptional: false,
        type: 'string',
        validation: { defaultValue: 'active' }
      }
      const zodSchema = client.generateZodString(column)
      // @ts-ignore #infinite
      expect(zodSchema.safeParse(undefined).success).toBe(true)
      if (zodSchema.safeParse(undefined).success) {
        expect(zodSchema.safeParse(undefined).data).toBe('active')
      }
    })
  })

  describe('generateZodNumber', () => {
    it('should generate a zod number schema with min and max validation', () => {
      const column: SchemaColumnNumber = {
        ...getSchemaCore({}),
        name: 'quantity',
        description: 'Quantity',
        isNullable: false,
        isOptional: false,
        type: 'number',
        validation: { min: 1, max: 100, integer: true }
      }
      const zodSchema = client.generateZodNumber(column)
      expect(zodSchema.safeParse(50).success).toBe(true)
      expect(zodSchema.safeParse(0).success).toBe(false)
      expect(zodSchema.safeParse(101).success).toBe(false)
      expect(zodSchema.safeParse(50.5).success).toBe(false) // integer constraint
    })

    it('should handle nullable and optional numbers', () => {
      const column: SchemaColumnNumber = {
        ...getSchemaCore({}),
        name: 'score',
        description: 'Score',
        isNullable: true,
        isOptional: true,
        type: 'number'
      }
      const zodSchema = client.generateZodNumber(column)
      // @ts-ignore #infinite
      expect(zodSchema.safeParse(null).success).toBe(true)
      expect(zodSchema.safeParse(undefined).success).toBe(true)
    })
  })

  describe('generateZodEnum', () => {
    it('should generate a zod enum schema from options', () => {
      const column: SchemaColumnEnum = {
        ...getSchemaCore({}),
        name: 'status',
        description: 'Status',
        isNullable: false,
        isOptional: false,
        type: 'enum',
        validation: {
          options: [
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' },
            { label: 'Pending', value: 'pending' }
          ]
        }
      }
      const zodSchema = client.generateZodEnum(column)
      expect(zodSchema.safeParse('active').success).toBe(true)
      expect(zodSchema.safeParse('invalid').success).toBe(false)
    })

    it('should handle enum with default value', () => {
      const column: SchemaColumnEnum = {
        ...getSchemaCore({}),
        name: 'role',
        description: 'Role',
        isNullable: false,
        isOptional: false,
        type: 'enum',
        validation: {
          options: [
            { label: 'Admin', value: 'admin' },
            { label: 'User', value: 'user' }
          ],
          defaultValue: 'user'
        }
      }
      const zodSchema = client.generateZodEnum(column)
      // @ts-ignore #infinite
      expect(zodSchema.safeParse(undefined).success).toBe(true)
      if (zodSchema.safeParse(undefined).success) {
        expect(zodSchema.safeParse(undefined).data).toBe('user')
      }
    })
  })

  describe('generateZodBoolean', () => {
    it('should generate a zod boolean schema', () => {
      const column: SchemaColumnBoolean = {
        ...getSchemaCore({}),
        name: 'isActive',
        description: 'Is active',
        isNullable: false,
        isOptional: false,
        type: 'boolean'
      }
      const zodSchema = client.generateZodBoolean(column)
      expect(zodSchema.safeParse(true).success).toBe(true)
      expect(zodSchema.safeParse(false).success).toBe(true)
      expect(zodSchema.safeParse('true').success).toBe(false)
    })

    it('should handle boolean with default value', () => {
      const column: SchemaColumnBoolean = {
        ...getSchemaCore({}),
        name: 'verified',
        description: 'Verified',
        isNullable: false,
        isOptional: false,
        type: 'boolean',
        validation: { defaultValue: true }
      }
      const zodSchema = client.generateZodBoolean(column)
      // @ts-ignore #infinite
      expect(zodSchema.safeParse(undefined).success).toBe(true)
      if (zodSchema.safeParse(undefined).success) {
        expect(zodSchema.safeParse(undefined).data).toBe(true)
      }
    })
  })

  describe('generateZodDate', () => {
    it('should generate a zod date schema with past constraint', () => {
      const column: SchemaColumnDate = {
        ...getSchemaCore({}),
        name: 'birthDate',
        description: 'Birth date',
        isNullable: false,
        isOptional: false,
        type: 'date',
        validation: { past: true }
      }
      const zodSchema = client.generateZodDate(column)
      const pastDate = new Date(Date.now() - 86400000) // Yesterday
      const futureDate = new Date(Date.now() + 86400000) // Tomorrow
      expect(zodSchema.safeParse(pastDate).success).toBe(true)
      expect(zodSchema.safeParse(futureDate).success).toBe(false)
    })
  })

  describe('generateZodArray', () => {
    it('should generate a zod array schema', () => {
      const column: SchemaColumnArray = {
        ...getSchemaCore({}),
        name: 'tags',
        description: 'Tags',
        isNullable: false,
        isOptional: false,
        type: 'array',
        validation: {
          min: 1,
          max: 5,
          column: {
            ...getSchemaCore({}),
            name: 'tag',
            description: 'Tag',
            isNullable: false,
            isOptional: false,
            type: 'string',
            validation: { min: 2 }
          }
        }
      }
      const zodSchema = client.generateZodArray(column, {})
      // @ts-ignore #infinite
      expect(zodSchema.safeParse(['tag1', 'tag2']).success).toBe(true)
      expect(zodSchema.safeParse([]).success).toBe(false) // min: 1
      expect(zodSchema.safeParse(['t']).success).toBe(false) // min length: 2
    })
  })

  describe('generateZodObject', () => {
    it('should generate a zod object schema', () => {
      const column: SchemaColumnObject = {
        ...getSchemaCore({}),
        name: 'address',
        description: 'Address',
        isNullable: false,
        isOptional: false,
        type: 'object',
        validation: {
          columns: [
            {
              ...getSchemaCore({}),
              name: 'street',
              description: 'Street',
              isNullable: false,
              isOptional: false,
              type: 'string'
            },
            {
              ...getSchemaCore({}),
              name: 'city',
              description: 'City',
              isNullable: false,
              isOptional: false,
              type: 'string'
            }
          ]
        }
      }
      const zodSchema = client.generateZodObject(column, {})
      const validData = { street: 'Main St', city: 'New York' }
      const invalidData = { street: 'Main St' } // Missing city
      expect(zodSchema.safeParse(validData).success).toBe(true)
      expect(zodSchema.safeParse(invalidData).success).toBe(false)
    })
  })

  describe('generateZod', () => {
    it('should generate zod schema for string type', () => {
      const column = client.getTableColumns(props).values().value()[0] // name column
      const zodSchema = client.generateZodSchemaForColumn(column, {})
      expect(zodSchema.safeParse('John Doe').success).toBe(true)
      expect(zodSchema.safeParse('Jo').success).toBe(false) // min: 3
    })

    it('should generate zod schema for number type', () => {
      const column = client.getTableColumns(props).values().value()[2] // age column
      const zodSchema = client.generateZodSchemaForColumn(column, {})
      expect(zodSchema.safeParse(25).success).toBe(true)
      expect(zodSchema.safeParse(17).success).toBe(false) // min: 18
      expect(zodSchema.safeParse(null).success).toBe(true) // nullable
    })

    it('should generate zod schema for enum type', () => {
      const column = client.getTableColumns(props).values().value()[3] // role column
      const zodSchema = client.generateZodSchemaForColumn(column, {})
      expect(zodSchema.safeParse('admin').success).toBe(true)
      expect(zodSchema.safeParse('user').success).toBe(true)
      expect(zodSchema.safeParse('invalid').success).toBe(false)
    })

    it('should generate zod schema for boolean type', () => {
      const column = client.getTableColumns(props).values().value()[4] // isVerified column
      const zodSchema = client.generateZodSchemaForColumn(column, {})
      expect(zodSchema.safeParse(true).success).toBe(true)
      expect(zodSchema.safeParse(false).success).toBe(true)
    })

    it('should generate zod schema for date type', () => {
      const column = client.getTableColumns(props).values().value()[5] // birthDate column
      const zodSchema = client.generateZodSchemaForColumn(column, {})
      const pastDate = new Date(Date.now() - 86400000)
      expect(zodSchema.safeParse(pastDate).success).toBe(true)
    })

    it('should generate zod schema for array type', () => {
      const column = client.getTableColumns(props).values().value()[6] // tags column
      const zodSchema = client.generateZodSchemaForColumn(column, {})
      expect(zodSchema.safeParse(['tag1', 'tag2']).success).toBe(true)
      expect(zodSchema.safeParse(['t']).success).toBe(false) // min length: 2
    })

    it('should generate zod schema for object type', () => {
      const column = client.getTableColumns(props).values().value()[7] // address column
      const zodSchema = client.generateZodSchemaForColumn(column, {})
      const validAddress = { street: 'Main St', city: 'New York', zipCode: '12345' }
      expect(zodSchema.safeParse(validAddress).success).toBe(true)
    })

    it('should generate zod string for reference type', () => {
      const postsTableId = mockDb.tables[1]._id
      const postsProps = { databaseId, tableId: postsTableId }
      const column = client.getTableColumns(postsProps).values().value()[2] // authorId column (reference)
      const zodSchema = client.generateZodSchemaForColumn(column, {})
      expect(zodSchema.safeParse('some-id').success).toBe(true)
    })
  })

  describe('generateZodSchema', () => {
    it('should generate a complete zod object schema for a table', () => {
      const zodSchema = client.generateZodSchema(props, {})
      expect(zodSchema).toBeInstanceOf(z.ZodObject)

      // Test valid data
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25,
        role: 'admin',
        isVerified: true,
        birthDate: new Date('1990-01-01'),
        tags: ['developer', 'typescript'],
        address: {
          street: 'Main St',
          city: 'New York',
          zipCode: '10001'
        }
      }
      expect(zodSchema.safeParse(validData).success).toBe(true)

      // Test invalid data
      const invalidData = {
        name: 'Jo', // Too short
        email: 'invalid-email', // Invalid email
        age: 17, // Too young
        role: 'invalid-role', // Invalid role
        isVerified: true,
        birthDate: new Date('2030-01-01'), // Future date
        tags: ['t'], // Tag too short
        address: {
          street: 'Main St',
          city: 'New York'
          // Missing zipCode
        }
      }
      const result = zodSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error?.issues ?? []).toHaveLength(7) // Multiple validation errors
      }
    })

    it('should include metadata in generated schema', () => {
      const zodSchema = client.generateZodSchema(props, {})
      const nameField = zodSchema.shape.name
      expect(nameField.description).toBe('User name')
    })
  })

  describe('generateZodJSON', () => {
    it('should generate a JSON schema for a table', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const jsonSchema = client.generateZodJSON(props) as unknown as any
      expect(jsonSchema).toBeInstanceOf(Object)
      expect(jsonSchema.title).toBe('users')
      expect(jsonSchema.description).toBe('Users table')
      expect(jsonSchema.type).toBe('object')

      // Check properties
      expect(jsonSchema.properties).toBeDefined()
      expect(jsonSchema.properties.name.type).toBe('string')
      expect(jsonSchema.properties.name.description).toBe('User name')

      expect(jsonSchema.properties.email.type).toBe('string')
      expect(jsonSchema.properties.email.format).toBe('email')

      expect(jsonSchema.properties.age.type).toBe('number')
      expect(jsonSchema.properties.age.description).toBe('User age')

      // Check required fields
      expect(jsonSchema.required).toContain('name')
      expect(jsonSchema.required).toContain('email')
      expect(jsonSchema.required).toContain('role')
      expect(jsonSchema.required).toContain('isVerified')
    })
  })

  describe('setMeta', () => {
    it('should set metadata on zod schema', () => {
      const column: SchemaColumnString = {
        ...getSchemaCore({}),
        name: 'testField',
        description: 'Test field description',
        isNullable: false,
        isOptional: false,
        type: 'string'
      }
      const baseSchema = z.string()
      const result = client.setMeta(baseSchema, column)

      expect(result.description).toBe('Test field description')
    })
  })

  describe('Error Handling', () => {
    it('should handle missing validation gracefully', () => {
      const column: SchemaColumnString = {
        ...getSchemaCore({}),
        name: 'test',
        description: 'Test',
        isNullable: false,
        isOptional: false,
        type: 'string'
        // No validation
      }
      const zodSchema = client.generateZodString(column)
      expect(zodSchema.safeParse('test').success).toBe(true)
    })

    it('should handle empty enum options', () => {
      const column: SchemaColumnEnum = {
        ...getSchemaCore({}),
        name: 'emptyEnum',
        description: 'Empty enum',
        isNullable: false,
        isOptional: false,
        type: 'enum',
        validation: {
          options: []
        }
      }
      const zodSchema = client.generateZodEnum(column)
      expect(zodSchema.safeParse('any').success).toBe(true) // Falls back to string
    })
  })
})
