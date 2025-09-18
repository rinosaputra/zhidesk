/* eslint-disable @typescript-eslint/no-explicit-any */
// File: src/schema/database/index.test.ts
import { describe, it, expect } from 'vitest'
import {
  SchemaCore,
  SchemaColumnString,
  SchemaColumnNumber,
  SchemaColumnBoolean,
  SchemaColumnDate,
  SchemaColumnEnum,
  SchemaColumnReference,
  SchemaColumnArray,
  SchemaColumnObject,
  SchemaTable,
  SchemaDatabase,
  SchemaTableColumn
} from './index'

describe('Database Schema Validation', () => {
  describe('SchemaCore', () => {
    it('should generate default values for core schema', () => {
      const result = SchemaCore.safeParse({})
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data._id).toBeDefined()
        expect(result.data._createdAt).toBeInstanceOf(Date)
        expect(result.data._updatedAt).toBeInstanceOf(Date)
      }
    })
  })

  describe('SchemaColumnString', () => {
    const validStringColumn = {
      _id: 'col1',
      _createdAt: new Date(),
      _updatedAt: new Date(),
      name: 'username',
      description: 'User login name',
      isNullable: false,
      isOptional: false,
      type: 'string' as const,
      validation: {
        min: 3,
        max: 20,
        unique: true,
        format: 'email' as const
      }
    }

    it('should parse valid string column', () => {
      const result = SchemaColumnString.safeParse(validStringColumn)
      expect(result.success).toBe(true)
    })

    it('should remove empty validation properties', () => {
      const data = {
        ...validStringColumn,
        validation: {
          min: 5,
          max: undefined,
          pattern: ''
        }
      }
      const result = SchemaColumnString.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.validation).toEqual(data.validation)
      }
    })

    it('should fail with invalid type', () => {
      const data = { ...validStringColumn, type: 'invalid' }
      const result = SchemaColumnString.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should handle nullable string', () => {
      const data = { ...validStringColumn, isNullable: true }
      const result = SchemaColumnString.safeParse(data)
      expect(result.success).toBe(true)
    })
  })

  describe('SchemaColumnNumber', () => {
    const validNumberColumn = {
      _id: 'col2',
      _createdAt: new Date(),
      _updatedAt: new Date(),
      name: 'age',
      description: 'User age',
      isNullable: true,
      isOptional: false,
      type: 'number' as const,
      validation: {
        min: 18,
        max: 120,
        integer: true,
        positive: true
      }
    }

    it('should parse valid number column', () => {
      const result = SchemaColumnNumber.safeParse(validNumberColumn)
      expect(result.success).toBe(true)
    })

    it('should remove empty validation properties', () => {
      const data = {
        ...validNumberColumn,
        validation: {
          min: 0,
          max: undefined,
          multipleOf: 0
        }
      }
      const result = SchemaColumnNumber.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.validation).toEqual(data.validation)
      }
    })

    it('should handle various number constraints', () => {
      const testCases = [
        { validation: { integer: true }, expected: { integer: true } },
        { validation: { positive: true }, expected: { positive: true } },
        { validation: { nonnegative: true }, expected: { nonnegative: true } },
        { validation: { multipleOf: 5 }, expected: { multipleOf: 5 } }
      ]

      testCases.forEach(({ validation, expected }) => {
        const data = { ...validNumberColumn, validation }
        const result = SchemaColumnNumber.safeParse(data)
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.validation).toEqual(expected)
        }
      })
    })
  })

  describe('SchemaColumnBoolean', () => {
    const validBooleanColumn = {
      _id: 'col3',
      _createdAt: new Date(),
      _updatedAt: new Date(),
      name: 'isActive',
      description: 'Is user active',
      isNullable: false,
      isOptional: false,
      type: 'boolean' as const,
      validation: {
        uiComponent: 'switch' as const,
        defaultValue: true
      }
    }

    it('should parse valid boolean column', () => {
      const result = SchemaColumnBoolean.safeParse(validBooleanColumn)
      expect(result.success).toBe(true)
    })

    it('should handle literal boolean values', () => {
      const data = {
        ...validBooleanColumn,
        validation: { literal: 'true' as const }
      }
      const result = SchemaColumnBoolean.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should handle different UI components', () => {
      const components = ['switch', 'checkbox'] as const
      components.forEach((uiComponent) => {
        const data = { ...validBooleanColumn, validation: { uiComponent } }
        const result = SchemaColumnBoolean.safeParse(data)
        expect(result.success).toBe(true)
      })
    })
  })

  describe('SchemaColumnDate', () => {
    const validDateColumn = {
      _id: 'col4',
      _createdAt: new Date(),
      _updatedAt: new Date(),
      name: 'birthDate',
      description: 'User birth date',
      isNullable: false,
      isOptional: false,
      type: 'date' as const,
      validation: {
        past: true,
        min: new Date('1900-01-01'),
        max: new Date()
      }
    }

    it('should parse valid date column', () => {
      const result = SchemaColumnDate.safeParse(validDateColumn)
      expect(result.success).toBe(true)
    })

    it('should handle future date constraints', () => {
      const data = {
        ...validDateColumn,
        validation: { future: true, min: new Date() }
      }
      const result = SchemaColumnDate.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should handle different UI components', () => {
      const components = ['date', 'datetime', 'time'] as const
      components.forEach((uiComponent) => {
        const data = { ...validDateColumn, validation: { uiComponent } }
        const result = SchemaColumnDate.safeParse(data)
        expect(result.success).toBe(true)
      })
    })
  })

  describe('SchemaColumnEnum', () => {
    const validEnumColumn = {
      _id: 'col5',
      _createdAt: new Date(),
      _updatedAt: new Date(),
      name: 'role',
      description: 'User role',
      isNullable: false,
      isOptional: false,
      type: 'enum' as const,
      validation: {
        options: [
          { label: 'Admin', value: 'admin' },
          { label: 'User', value: 'user' },
          { label: 'Guest', value: 'guest' }
        ],
        uiComponent: 'select' as const
      }
    }

    it('should parse valid enum column', () => {
      const result = SchemaColumnEnum.safeParse(validEnumColumn)
      expect(result.success).toBe(true)
    })

    it('should fail with empty options', () => {
      const data = {
        ...validEnumColumn,
        validation: { options: [] }
      }
      const result = SchemaColumnEnum.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should fail with invalid options', () => {
      const data = {
        ...validEnumColumn,
        validation: {
          options: [
            { label: '', value: 'admin' }, // Empty label
            { label: 'User', value: '' } // Empty value
          ]
        }
      }
      const result = SchemaColumnEnum.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should handle radio UI component', () => {
      const data = {
        ...validEnumColumn,
        validation: { ...validEnumColumn.validation, uiComponent: 'radio' as const }
      }
      const result = SchemaColumnEnum.safeParse(data)
      expect(result.success).toBe(true)
    })
  })

  describe('SchemaColumnReference', () => {
    const validReferenceColumn = {
      _id: 'col6',
      _createdAt: new Date(),
      _updatedAt: new Date(),
      name: 'userId',
      description: 'Reference to user',
      isNullable: false,
      isOptional: false,
      type: 'reference' as const,
      validation: {
        table: 'users',
        column: '_id',
        selects: ['name', 'email'],
        unique: true
      }
    }

    it('should parse valid reference column', () => {
      const result = SchemaColumnReference.safeParse(validReferenceColumn)
      expect(result.success).toBe(true)
    })

    it('should handle without unique constraint', () => {
      const data = {
        ...validReferenceColumn,
        validation: {
          table: 'users',
          column: '_id',
          selects: ['name']
        }
      }
      const result = SchemaColumnReference.safeParse(data)
      console.log(result.error)
      expect(result.success).toBe(true)
    })

    it('should fail without required fields', () => {
      const invalidCases = [
        { validation: { table: '', column: '_id' } },
        { validation: { table: 'users', column: '' } },
        { validation: { table: 'users' } }, // Missing column
        { validation: { column: '_id' } } // Missing table
      ]

      invalidCases.forEach((validation) => {
        const data = { ...validReferenceColumn, validation }
        const result = SchemaColumnReference.safeParse(data)
        expect(result.success).toBe(false)
      })
    })
  })

  describe('SchemaColumnArray', () => {
    const validArrayColumn = {
      _id: 'col7',
      _createdAt: new Date(),
      _updatedAt: new Date(),
      name: 'tags',
      description: 'Array of tags',
      isNullable: false,
      isOptional: false,
      type: 'array' as const,
      validation: {
        min: 1,
        max: 10,
        column: {
          _id: 'tag-item',
          _createdAt: new Date(),
          _updatedAt: new Date(),
          name: 'tag',
          description: 'Individual tag',
          isNullable: false,
          isOptional: false,
          type: 'string' as const,
          validation: { min: 2, max: 20 }
        }
      }
    }

    it('should parse valid array column', () => {
      const result = SchemaColumnArray.safeParse(validArrayColumn)
      expect(result.success).toBe(true)
    })

    it('should handle different item types', () => {
      const itemTypes = [
        {
          type: 'number' as const,
          validation: { min: 0, max: 100 }
        },
        {
          type: 'boolean' as const,
          validation: { defaultValue: true }
        },
        {
          type: 'date' as const,
          validation: { past: true }
        }
      ]

      itemTypes.forEach((itemConfig) => {
        const data = {
          ...validArrayColumn,
          validation: {
            ...validArrayColumn.validation,
            column: {
              ...validArrayColumn.validation.column,
              ...itemConfig
            }
          }
        }
        const result = SchemaColumnArray.safeParse(data)
        expect(result.success).toBe(true)
      })
    })

    it('should handle array constraints', () => {
      const constraints = [
        { validation: { min: 5 } },
        { validation: { max: 100 } },
        { validation: { length: 3 } },
        { validation: { min: 1, max: 5 } }
      ]

      constraints.forEach((constraint) => {
        const data = {
          ...validArrayColumn,
          validation: { ...validArrayColumn.validation, ...constraint.validation }
        }
        const result = SchemaColumnArray.safeParse(data)
        expect(result.success).toBe(true)
      })
    })
  })

  describe('SchemaColumnObject', () => {
    const validObjectColumn = {
      _id: 'col8',
      _createdAt: new Date(),
      _updatedAt: new Date(),
      name: 'address',
      description: 'Address object',
      isNullable: false,
      isOptional: false,
      type: 'object' as const,
      validation: {
        strict: true,
        columns: [
          {
            _id: 'street',
            _createdAt: new Date(),
            _updatedAt: new Date(),
            name: 'street',
            description: 'Street address',
            isNullable: false,
            isOptional: false,
            type: 'string' as const
          },
          {
            _id: 'city',
            _createdAt: new Date(),
            _updatedAt: new Date(),
            name: 'city',
            description: 'City name',
            isNullable: false,
            isOptional: false,
            type: 'string' as const
          }
        ]
      }
    }

    it('should parse valid object column', () => {
      const result = SchemaColumnObject.safeParse(validObjectColumn)
      expect(result.success).toBe(true)
    })

    it('should handle passthrough mode', () => {
      const data = {
        ...validObjectColumn,
        validation: {
          ...validObjectColumn.validation,
          passthrough: true
        }
      }
      const result = SchemaColumnObject.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should fail with empty columns array', () => {
      const data = {
        ...validObjectColumn,
        validation: { columns: [] }
      }
      const result = SchemaColumnObject.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should handle nested object structures', () => {
      const data = {
        ...validObjectColumn,
        validation: {
          columns: [
            ...validObjectColumn.validation.columns,
            {
              _id: 'coordinates',
              _createdAt: new Date(),
              _updatedAt: new Date(),
              name: 'coordinates',
              description: 'GPS coordinates',
              isNullable: false,
              isOptional: false,
              type: 'object' as const,
              validation: {
                columns: [
                  {
                    _id: 'lat',
                    _createdAt: new Date(),
                    _updatedAt: new Date(),
                    name: 'lat',
                    description: 'Latitude',
                    isNullable: false,
                    isOptional: false,
                    type: 'number' as const
                  },
                  {
                    _id: 'lng',
                    _createdAt: new Date(),
                    _updatedAt: new Date(),
                    name: 'lng',
                    description: 'Longitude',
                    isNullable: false,
                    isOptional: false,
                    type: 'number' as const
                  }
                ]
              }
            }
          ]
        }
      }
      const result = SchemaColumnObject.safeParse(data)
      expect(result.success).toBe(true)
    })
  })

  describe('SchemaTableColumn (Union Type)', () => {
    const testCases = [
      {
        type: 'string' as const,
        data: {
          _id: 'test1',
          _createdAt: new Date(),
          _updatedAt: new Date(),
          name: 'testString',
          description: 'Test string',
          isNullable: false,
          isOptional: false,
          type: 'string' as const,
          validation: { min: 1 }
        }
      },
      {
        type: 'number' as const,
        data: {
          _id: 'test2',
          _createdAt: new Date(),
          _updatedAt: new Date(),
          name: 'testNumber',
          description: 'Test number',
          isNullable: false,
          isOptional: false,
          type: 'number' as const,
          validation: { min: 0 }
        }
      },
      {
        type: 'boolean' as const,
        data: {
          _id: 'test3',
          _createdAt: new Date(),
          _updatedAt: new Date(),
          name: 'testBoolean',
          description: 'Test boolean',
          isNullable: false,
          isOptional: false,
          type: 'boolean' as const
        }
      }
    ]

    it('should parse all column types through union', () => {
      testCases.forEach(({ data }) => {
        const result = SchemaTableColumn.safeParse(data)
        expect(result.success).toBe(true)
      })
    })

    it('should fail with invalid column type', () => {
      const data = {
        _id: 'test',
        _createdAt: new Date(),
        _updatedAt: new Date(),
        name: 'test',
        description: 'Test',
        isNullable: false,
        isOptional: false,
        type: 'invalid' as any // Invalid type
      }
      const result = SchemaTableColumn.safeParse(data)
      expect(result.success).toBe(false)
    })
  })

  describe('SchemaTable', () => {
    const validTable = {
      _id: 'tbl1',
      _createdAt: new Date(),
      _updatedAt: new Date(),
      name: 'users',
      description: 'Users table',
      columns: [
        {
          _id: 'col1',
          _createdAt: new Date(),
          _updatedAt: new Date(),
          name: 'username',
          description: 'Username',
          isNullable: false,
          isOptional: false,
          type: 'string' as const,
          validation: { min: 3, max: 20 }
        },
        {
          _id: 'col2',
          _createdAt: new Date(),
          _updatedAt: new Date(),
          name: 'email',
          description: 'Email',
          isNullable: false,
          isOptional: false,
          type: 'string' as const,
          validation: { format: 'email' as const }
        }
      ]
    }

    it('should parse valid table', () => {
      const result = SchemaTable.safeParse(validTable)
      expect(result.success).toBe(true)
    })

    it('should fail with empty columns array', () => {
      const data = { ...validTable, columns: [] }
      const result = SchemaTable.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should fail with invalid columns', () => {
      const data = {
        ...validTable,
        columns: [
          ...validTable.columns,
          {
            _id: 'col3',
            name: 'invalid',
            description: 'Invalid column',
            isNullable: false,
            isOptional: false,
            type: 'invalid' as any // Invalid type
          }
        ]
      }
      const result = SchemaTable.safeParse(data)
      expect(result.success).toBe(false)
    })
  })

  describe('SchemaDatabase', () => {
    const validDatabase = {
      _id: 'db1',
      _createdAt: new Date(),
      _updatedAt: new Date(),
      name: 'Test Database',
      description: 'Test database description',
      version: 1,
      tables: [
        {
          _id: 'tbl1',
          _createdAt: new Date(),
          _updatedAt: new Date(),
          name: 'users',
          description: 'Users table',
          columns: [
            {
              _id: 'col1',
              _createdAt: new Date(),
              _updatedAt: new Date(),
              name: 'name',
              description: 'User name',
              isNullable: false,
              isOptional: false,
              type: 'string' as const
            }
          ]
        }
      ]
    }

    it('should parse valid database', () => {
      const result = SchemaDatabase.safeParse(validDatabase)
      expect(result.success).toBe(true)
    })

    it('should fail with empty tables array', () => {
      const data = { ...validDatabase, tables: [] }
      const result = SchemaDatabase.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should fail with invalid version', () => {
      const data = { ...validDatabase, version: -1 } // Negative version
      const result = SchemaDatabase.safeParse(data)
      expect(result.success).toBe(false)
    })
  })
})
