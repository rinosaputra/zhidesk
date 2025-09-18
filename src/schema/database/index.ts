// File: src/schema/database/index.ts
import z from 'zod'
import { v4 as uuid } from 'uuid'

export const SchemaCore = z.object({
  _id: z
    .string()
    .describe('Unique identifier for the document default uuid()')
    .default(() => uuid()),
  _createdAt: z
    .date()
    .describe('Timestamp when the document was created')
    .default(() => new Date()),
  _updatedAt: z
    .date()
    .describe('Timestamp when the document was last updated')
    .default(() => new Date())
})

export type SchemaCore = z.infer<typeof SchemaCore>

export type OmitSchemaCore<T extends SchemaCore> = Omit<T, keyof SchemaCore> & Partial<SchemaCore>

export const getSchemaCore = (): SchemaCore => ({
  _id: uuid(),
  _createdAt: new Date(),
  _updatedAt: new Date()
})

// function omitEmptyValue<Data extends Record<string, unknown>>(data?: Data): Data | undefined {
//   if (!data) return undefined
//   return Object.fromEntries(Object.entries(data).filter(([, v]) => !!v)) as Data
// }

export const ColumnType = {
  string: 'string',
  number: 'number',
  boolean: 'boolean',
  date: 'date',
  enum: 'enum',
  reference: 'reference',
  array: 'array',
  object: 'object'
} as const
export type ColumnType = keyof typeof ColumnType

export const SchemaColumnCore = SchemaCore.extend({
  name: z.string().describe('Name of the column'),
  description: z.string().describe('Description of the column'),
  isNullable: z.boolean().describe('Whether the column is nullable'),
  isOptional: z.boolean().describe('Whether the column is optional')
}).describe('Base schema for all columns')
export type SchemaColumnCore = z.infer<typeof SchemaColumnCore>

export const SchemaColumnStringValidation = z
  .object({
    unique: z.boolean().describe(`Whether the column value must be unique`),
    min: z.number().describe('Minimum length of the string'),
    max: z.number().describe('Maximum length of the string'),
    length: z.number().describe('Exact length of the string'),
    pattern: z.string().describe('Regular expression pattern for validation'),
    trim: z.boolean().describe('Whether to trim whitespace from the string'),
    transform: z.enum(['lowercase', 'uppercase', 'capitalize', 'none']),
    format: z
      .enum(['email', 'url', 'uuid', 'phone', 'password', 'none'])
      .describe('Predefined format validation'),
    uiComponent: z.enum(['input', 'textarea']).describe('UI component type for rendering'),
    defaultValue: z.string().describe('Default value for the column')
  })
  .describe('Validation schema for string columns')
export type SchemaColumnStringValidation = z.infer<typeof SchemaColumnStringValidation>

export const SchemaColumnString = SchemaColumnCore.extend({
  type: z.literal(ColumnType.string).describe('Type String for storing string values'),
  validation: SchemaColumnStringValidation.partial().optional()
}).describe('Schema for string columns')
export type SchemaColumnString = z.infer<typeof SchemaColumnString>

export const SchemaColumnNumberValidation = z.object({
  unique: z.boolean().describe(`Whether the column value must be unique`),
  min: z.number().describe('Minimum value of the number'),
  max: z.number().describe('Maximum value of the number'),
  integer: z.boolean().describe('Whether the number is an integer'),
  positive: z.boolean().describe('Whether the number is positive'),
  nonnegative: z.boolean().describe('Whether the number is non-negative'),
  multipleOf: z.number().describe('Value must be a multiple of this number'),
  defaultValue: z.number().describe('Default value for the column')
})
export type SchemaColumnNumberValidation = z.infer<typeof SchemaColumnNumberValidation>

export const SchemaColumnNumber = SchemaColumnCore.extend({
  type: z.literal(ColumnType.number).describe('Type Number for storing number values'),
  validation: SchemaColumnNumberValidation.partial().optional()
}).describe('Schema for number columns')
export type SchemaColumnNumber = z.infer<typeof SchemaColumnNumber>

export const SchemaColumnBooleanValidation = z.object({
  literal: z.enum(['true', 'false']).describe('Required boolean value (if specified)'),
  uiComponent: z.enum(['switch', 'checkbox']).describe('UI component type for rendering'),
  defaultValue: z.boolean().describe('Default value for the column')
})
export type SchemaColumnBooleanValidation = z.infer<typeof SchemaColumnBooleanValidation>

export const SchemaColumnBoolean = SchemaColumnCore.extend({
  type: z.literal(ColumnType.boolean).describe('Type Boolean for true/false values'),
  validation: SchemaColumnBooleanValidation.partial().optional()
}).describe('Schema for boolean columns')
export type SchemaColumnBoolean = z.infer<typeof SchemaColumnBoolean>

export const SchemaColumnDateValidation = z.object({
  unique: z.boolean().describe(`Whether the column value must be unique`),
  min: z.date().describe('Earliest allowed date'),
  max: z.date().describe('Latest allowed date'),
  past: z.boolean().describe('Whether the date must be in the past'),
  future: z.boolean().describe('Whether the date must be in the future'),
  format: z.string().describe('Date format string for display and parsing'),
  uiComponent: z.enum(['date', 'datetime', 'time']).describe('Type of date input'),
  defaultValue: z.date().describe('Default value for the column')
})
export type SchemaColumnDateValidation = z.infer<typeof SchemaColumnDateValidation>

export const SchemaColumnDate = SchemaColumnCore.extend({
  type: z.literal(ColumnType.date).describe('Type Date for storing date and time values'),
  validation: SchemaColumnDateValidation.partial().optional()
}).describe('Schema for date columns')
export type SchemaColumnDate = z.infer<typeof SchemaColumnDate>

export const SchemaColumnEnumValidation = z.object({
  options: z
    .array(
      z.object({
        label: z
          .string()
          .min(1, 'Reference enum label is required')
          .describe('Display text for the option'),
        value: z
          .string()
          .min(1, 'Reference enum value is required')
          .describe('Stored value for the option')
      })
    )
    .min(1, 'At least one enum option is required')
    .describe('Available options for selection'),
  uiComponent: z.enum(['select', 'radio']).describe('UI component type for rendering'),
  defaultValue: z.string().describe('Default value for the column')
})
export type SchemaColumnEnumValidation = z.infer<typeof SchemaColumnEnumValidation>

export const SchemaColumnEnum = SchemaColumnCore.extend({
  type: z.literal(ColumnType.enum).describe('Type Enum for selecting from predefined options'),
  validation: SchemaColumnEnumValidation.partial({ uiComponent: true, defaultValue: true })
}).describe('Schema for enum columns')
export type SchemaColumnEnum = z.infer<typeof SchemaColumnEnum>

export const SchemaColumnReferenceValidation = z.object({
  unique: z.boolean().describe(`Whether the column value must be unique`),
  table: z.string().describe('Name of the reference table'),
  column: z.string().describe('Name of the reference column'),
  selects: z.string().array().describe('Select columns to show'),
  defaultValue: z.string().describe('Default value for the column')
})
export type SchemaColumnReferenceValidation = z.infer<typeof SchemaColumnReferenceValidation>

export const SchemaColumnReference = SchemaColumnCore.extend({
  type: z.literal(ColumnType.reference).describe('Type Reference for referencing other tables'),
  validation: SchemaColumnReferenceValidation.partial({ unique: true, defaultValue: true })
}).describe('Schema for reference columns')
export type SchemaColumnReference = z.infer<typeof SchemaColumnReference>

export type SchemaColumnArrayValidation = {
  min?: number
  max?: number
  length?: number
  column: SchemaTableColumn
}
export const SchemaColumnArrayValidation: z.ZodType<SchemaColumnArrayValidation> = z.object({
  min: z.number().optional().describe('Minimum number of items in the array'),
  max: z.number().optional().describe('Maximum number of items in the array'),
  length: z.number().optional().describe('Exact number of items in the array'),
  column: z.lazy(() => SchemaTableColumn).describe('Column type for array items')
})

export const SchemaColumnArray = SchemaColumnCore.extend({
  type: z.literal(ColumnType.array).describe('Type Array for storing arrays of values'),
  validation: SchemaColumnArrayValidation
}).describe('Schema for array columns')
export type SchemaColumnArray = z.infer<typeof SchemaColumnArray>

export type SchemaColumnObjectValidation = {
  strict?: boolean
  passthrough?: boolean
  columns: SchemaTableColumn[]
}
export const SchemaColumnObjectValidation: z.ZodType<SchemaColumnObjectValidation> = z.object({
  strict: z
    .boolean()
    .optional()
    .describe('Whether to disallow additional properties not defined in schema'),
  passthrough: z
    .boolean()
    .optional()
    .describe('Whether to allow additional properties and pass them through'),
  columns: z
    .lazy(() => SchemaTableColumn)
    .array()
    .min(1, 'Array must contain at least 1 element(s)')
    .describe('Array of column definitions')
})

export const SchemaColumnObject = SchemaColumnCore.extend({
  type: z.literal(ColumnType.object).describe('Type Object for storing nested structured data'),
  validation: SchemaColumnObjectValidation
}).describe('Schema for object columns')
export type SchemaColumnObject = z.infer<typeof SchemaColumnObject>

export type SchemaTableColumn =
  | SchemaColumnString
  | SchemaColumnNumber
  | SchemaColumnBoolean
  | SchemaColumnDate
  | SchemaColumnEnum
  | SchemaColumnReference
  | SchemaColumnArray
  | SchemaColumnObject

export const SchemaTableColumn: z.ZodType<SchemaTableColumn> = z
  .discriminatedUnion('type', [
    SchemaColumnString,
    SchemaColumnNumber,
    SchemaColumnBoolean,
    SchemaColumnDate,
    SchemaColumnEnum,
    SchemaColumnReference,
    SchemaColumnArray,
    SchemaColumnObject
  ])
  .describe('Union type for all column types')

export const SchemaTable = SchemaCore.extend({
  name: z.string().describe('Name of the table'),
  description: z.string().describe('Description of the table'),
  columns: SchemaTableColumn.array()
    .min(1, 'Array must contain at least 1 element(s)')
    .describe('Array of column definitions')
})
export type SchemaTable = z.infer<typeof SchemaTable>

export const SchemaDatabase = SchemaCore.extend({
  name: z.string().describe('Name of the database'),
  description: z.string().describe('Description of the database'),
  version: z.number().positive().describe('Version number of the database'),
  tables: SchemaTable.array()
    .min(1, `Database must contain at least 1 tabel(s)`)
    .describe('Array of table definitions')
})
export type SchemaDatabase = z.infer<typeof SchemaDatabase>

export const SchemaDatabaseStore = z.record(
  z.uuid(),
  SchemaDatabase.omit({
    tables: true
  }).extend({
    tables: z.record(
      z.uuid(),
      SchemaTable.omit({
        columns: true
      }).extend({
        columns: z.record(z.uuid(), SchemaTableColumn)
      })
    )
  })
)
export type SchemaDatabaseStore = z.infer<typeof SchemaDatabaseStore>
