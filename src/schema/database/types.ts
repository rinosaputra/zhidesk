// File: src/schema/database/types.ts
import { z } from 'zod'

// Base types
export const BaseFieldSchema = z.object({
  name: z.string().min(1, 'Field name is required'),
  label: z.string().min(1, 'Field label is required'),
  type: z.enum(['string', 'number', 'boolean', 'date', 'enum', 'reference', 'array', 'object']),
  description: z.string().optional(),
  required: z.boolean().default(false).optional(),
  unique: z.boolean().default(false).optional(),
  index: z.boolean().default(false).optional(),
  hidden: z.boolean().default(false).optional(),
  readonly: z.boolean().default(false).optional(),
  default: z.any().optional(),
  coerce: z.boolean().default(false).optional()
})

// String field
export const StringFieldSchema = BaseFieldSchema.extend({
  type: z.literal('string'),
  validation: z
    .object({
      min: z.number().min(0).optional(),
      max: z.number().min(1).optional(),
      length: z.number().min(0).optional(),
      pattern: z.string().optional(),
      format: z.enum(['email', 'url', 'uuid', 'phone', 'password']).optional(),
      trim: z.boolean().default(true).optional()
    })
    .optional()
})

// Number field
export const NumberFieldSchema = BaseFieldSchema.extend({
  type: z.literal('number'),
  validation: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
      integer: z.boolean().default(false).optional(),
      positive: z.boolean().default(false).optional(),
      nonnegative: z.boolean().default(false).optional(),
      multipleOf: z.number().optional()
    })
    .optional()
})

// Boolean field
export const BooleanFieldSchema = BaseFieldSchema.extend({
  type: z.literal('boolean'),
  validation: z
    .object({
      is: z.enum(['true', 'false']).optional()
    })
    .optional()
})

// Date field
export const DateFieldSchema = BaseFieldSchema.extend({
  type: z.literal('date'),
  validation: z
    .object({
      min: z.date().optional(),
      max: z.date().optional(),
      past: z.boolean().default(false).optional(),
      future: z.boolean().default(false).optional()
    })
    .optional()
})

// Enum field
export const EnumFieldSchema = BaseFieldSchema.extend({
  type: z.literal('enum'),
  options: z.array(z.string()).min(1, 'At least one enum option is required')
})

// Reference field (relationship)
export const ReferenceFieldSchema = BaseFieldSchema.extend({
  type: z.literal('reference'),
  reference: z.object({
    tableName: z.string().min(1, 'Reference table name is required'),
    columnName: z.string().min(1, 'Reference column name is required').default('_id').optional()
  }),
  validation: z
    .object({
      cascadeDelete: z.boolean().default(false).optional(),
      required: z.boolean().default(false).optional()
    })
    .optional()
})

// Array field
export const ArrayFieldSchema = BaseFieldSchema.extend({
  type: z.literal('array'),
  items: z.lazy(() => FieldSchema), // Recursive
  validation: z
    .object({
      min: z.number().min(0).optional(),
      max: z.number().min(1).optional(),
      length: z.number().min(0).optional(),
      unique: z.boolean().default(false).optional()
    })
    .optional()
})

// Object field
export const ObjectFieldSchema = BaseFieldSchema.extend({
  type: z.literal('object'),
  fields: z.array(z.lazy(() => FieldSchema)), // Recursive
  validation: z
    .object({
      strict: z.boolean().default(true),
      passthrough: z.boolean().default(false)
    })
    .optional()
})

// Union of all field types
export const FieldSchema = z.discriminatedUnion('type', [
  StringFieldSchema,
  NumberFieldSchema,
  BooleanFieldSchema,
  DateFieldSchema,
  EnumFieldSchema,
  ReferenceFieldSchema,
  ArrayFieldSchema,
  ObjectFieldSchema
])

// Table schema
export const TableSchema = z.object({
  name: z.string().min(1, 'Table name is required'),
  label: z.string().min(1, 'Table label is required'),
  description: z.string().optional(),
  fields: z.array(FieldSchema).min(1, 'At least one field is required'),
  indexes: z.array(z.string()).optional(),
  timestamps: z.boolean().default(true).optional(),
  softDelete: z.boolean().default(false).optional(),
  validation: z
    .object({
      strict: z.boolean().default(true).optional(),
      additionalProperties: z.boolean().default(false).optional()
    })
    .optional()
})

// Database schema
export const DatabaseSchema = z.object({
  name: z.string().min(1, 'Database name is required'),
  version: z.number().default(1),
  tables: z.array(TableSchema).min(1, 'At least one table is required'),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date())
})

// Type inference
export type BaseField = z.infer<typeof BaseFieldSchema>
export type StringField = z.infer<typeof StringFieldSchema>
export type NumberField = z.infer<typeof NumberFieldSchema>
export type BooleanField = z.infer<typeof BooleanFieldSchema>
export type DateField = z.infer<typeof DateFieldSchema>
export type EnumField = z.infer<typeof EnumFieldSchema>
export type ReferenceField = z.infer<typeof ReferenceFieldSchema>
export type ArrayField = z.infer<typeof ArrayFieldSchema>
export type ObjectField = z.infer<typeof ObjectFieldSchema>
export type Field = z.infer<typeof FieldSchema>
export type Table = z.infer<typeof TableSchema>
export type Database = z.infer<typeof DatabaseSchema>
