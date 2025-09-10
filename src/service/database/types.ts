// File: src/service/database/types.ts
import { z } from 'zod'

const zBool = (defaultValue: boolean): z.ZodOptional<z.ZodDefault<z.ZodBoolean>> =>
  z.coerce
    .boolean()
    .default(defaultValue)
    .optional()
    .transform((e) => !!e) as unknown as z.ZodOptional<z.ZodDefault<z.ZodBoolean>>

export const FieldType = {
  string: 'string',
  number: 'number',
  boolean: 'boolean',
  date: 'date',
  enum: 'enum',
  reference: 'reference',
  array: 'array',
  object: 'object'
} as const

export type FieldType = keyof typeof FieldType

// Base types
export const BaseFieldSchema = z.object({
  name: z.string().min(1, 'Field name is required'),
  label: z.string().min(1, 'Field label is required'),
  type: z.enum(FieldType),
  description: z.string().optional(),
  required: zBool(false),
  unique: zBool(false),
  index: zBool(false),
  hidden: zBool(false),
  readonly: zBool(false),
  default: z.any().optional(),
  coerce: zBool(false)
})

// String field
export const StringFieldSchema = BaseFieldSchema.extend({
  type: z.literal('string'),
  validation: z
    .object({
      min: z.coerce.number().optional(),
      max: z.coerce.number().optional(),
      length: z.coerce.number().optional(),
      pattern: z.string().optional(),
      format: z.enum(['email', 'url', 'uuid', 'phone', 'password', 'string']).optional(),
      trim: zBool(true)
    })
    .optional()
})

// Number field
export const NumberFieldSchema = BaseFieldSchema.extend({
  type: z.literal('number'),
  validation: z
    .object({
      min: z.coerce.number().optional(),
      max: z.coerce.number().optional(),
      integer: zBool(false),
      positive: zBool(false),
      nonnegative: zBool(false),
      multipleOf: z.coerce.number().optional()
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
      past: zBool(false),
      future: zBool(false)
    })
    .optional()
})

// Enum field
export const EnumFieldSchema = BaseFieldSchema.extend({
  type: z.literal('enum'),
  options: z
    .array(
      z.object({
        label: z.string().min(1, 'Reference enum label is required'),
        value: z.string().min(1, 'Reference enum value is required')
      })
    )
    .min(1, 'At least one enum option is required')
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
      cascadeDelete: zBool(false),
      required: zBool(false)
    })
    .optional()
})

// Array field
export const ArrayFieldSchema: z.ZodType<ArrayField> = z.lazy(() =>
  BaseFieldSchema.extend({
    type: z.literal('array'),
    items: FieldSchema, // Recursive
    validation: z
      .object({
        min: z.coerce.number().optional(),
        max: z.coerce.number().optional(),
        length: z.coerce.number().optional(),
        unique: zBool(false)
      })
      .optional()
  })
)

// Object field
export const ObjectFieldSchema: z.ZodType<ObjectField> = z.lazy(() =>
  BaseFieldSchema.extend({
    type: z.literal('object'),
    fields: FieldSchema.array(), // Recursive
    validation: z
      .object({
        strict: zBool(true),
        passthrough: zBool(false)
      })
      .optional()
  })
)

// Union of all field types
export const FieldSchema: z.ZodType<Field, Field> = z.lazy(() =>
  z.discriminatedUnion('type', [
    StringFieldSchema,
    NumberFieldSchema,
    BooleanFieldSchema,
    DateFieldSchema,
    EnumFieldSchema,
    ReferenceFieldSchema,
    ArrayFieldSchema,
    ObjectFieldSchema
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ] as any)
)

// Table schema
export const TableSchema = z.object({
  name: z.string().min(1, 'Table name is required'),
  label: z.string().min(1, 'Table label is required'),
  description: z.string().optional(),
  fields: z.array(FieldSchema).min(1, 'At least one field is required'),
  indexes: z.array(z.string()).optional(),
  timestamps: zBool(true),
  softDelete: zBool(false),
  validation: z
    .object({
      strict: zBool(true),
      additionalProperties: zBool(false)
    })
    .optional()
})

// Database schema
export const DatabaseSchema = z.object({
  name: z.string().min(1, 'Database name is required'),
  version: z.coerce.number().default(1),
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

export type ArrayField = BaseField & {
  type: 'array'
  items: Field // Recursive
  validation?: {
    min?: number
    max?: number
    length?: number
    unique?: boolean
  }
}

export type ObjectField = BaseField & {
  type: 'object'
  fields: Field[] // Recursive
  validation?: {
    min?: number
    max?: number
    strict?: boolean
    passthrough?: boolean
  }
}

export type Field =
  | StringField
  | NumberField
  | BooleanField
  | DateField
  | EnumField
  | ReferenceField
  | ArrayField
  | ObjectField

export type Table = z.infer<typeof TableSchema>
export type Database = z.infer<typeof DatabaseSchema>

// Basic types
export const databaseId = z.string().min(1, 'Database ID is required')
export const tableName = z.string().min(1, 'Table name is required')
export const documentId = z.string().min(1, 'Document ID is required')

// Document type untuk data yang disimpan
export type DocumentData = {
  _id?: string
  _createdAt?: Date
  _updatedAt?: Date
  _deletedAt?: Date
  [key: string]: unknown
}

export const documentData = z.record(z.string(), z.any())

// Query type untuk operasi find
export const queryObject = z.record(z.string(), z.any())

export type QueryObject = z.infer<typeof queryObject>

// Table configuration
export const tableConfig = TableSchema

// Query options
export const queryOptions = z.object({
  skip: z.coerce.number().int().nonnegative().optional(),
  limit: z.coerce.number().int().positive().optional(),
  sort: z.record(z.string(), z.union([z.literal(1), z.literal(-1)])).optional()
})

export type QueryOptions = z.infer<typeof queryOptions>

// Search options
export const searchOptions = queryOptions

export type SearchOptions = z.infer<typeof searchOptions>

// Aggregation stage types
export const matchStage = z.object({
  $match: queryObject.optional()
})

export const groupStage = z.object({
  $group: z
    .object({
      _id: z.union([z.string(), z.record(z.string(), z.any())])
    })
    .catchall(z.any())
})

export const sortStage = z.object({
  $sort: z.record(z.string(), z.union([z.literal(1), z.literal(-1)]))
})

export const projectStage = z.object({
  $project: z.record(z.string(), z.any())
})

export const skipStage = z.object({
  $skip: z.coerce.number().int().nonnegative()
})

export const limitStage = z.object({
  $limit: z.coerce.number().int().positive()
})

export const unwindStage = z.object({
  $unwind: z.string()
})

export const lookupStage = z.object({
  $lookup: z.object({
    from: z.string(),
    localField: z.string(),
    foreignField: z.string(),
    as: z.string()
  })
})

export const addFieldsStage = z.object({
  $addFields: z.record(z.string(), z.any())
})

export type AggregationStage = {
  $match?: Record<string, unknown>
  $group?: {
    _id: string | Record<string, unknown>
    [key: string]:
      | {
          $sum?: unknown
          $avg?: unknown
          $min?: unknown
          $max?: unknown
          $push?: unknown
          $addToSet?: unknown
          $first?: unknown
          $last?: unknown
          $count?: unknown
          [operator: string]: unknown
        }
      | unknown
  }
  $sort?: Record<string, 1 | -1>
  $project?: Record<string, unknown>
  $skip?: number
  $limit?: number
  $unwind?: string
  $lookup?: {
    from: string
    localField: string
    foreignField: string
    as: string
  }
  $addFields?: Record<string, unknown>
  [key: string]: unknown
}

export const aggregationStage: z.ZodType<AggregationStage> = z.union([
  matchStage,
  groupStage,
  sortStage,
  projectStage,
  skipStage,
  limitStage,
  unwindStage,
  lookupStage,
  addFieldsStage
])

// ==================== INPUT SCHEMAS ====================

export const databaseExistsInput = z.object({ databaseId })
export type DatabaseExistsInput = z.infer<typeof databaseExistsInput>

export const initializeDatabaseInput = z.object({
  databaseId,
  databaseName: z.string().min(1, 'Database name is required'),
  tables: z.array(tableConfig)
})
export type InitializeDatabaseInput = z.infer<typeof initializeDatabaseInput>

export const closeDatabaseInput = z.object({ databaseId })
export type CloseDatabaseInput = z.infer<typeof closeDatabaseInput>

export const getTablesInput = z.object({ databaseId })
export type GetTablesInput = z.infer<typeof getTablesInput>

export const getTableSchemaInput = z.object({ databaseId, tableName })
export type GetTableSchemaInput = z.infer<typeof getTableSchemaInput>

export const createTableInput = z.object({ databaseId, tableConfig })
export type CreateTableInput = z.infer<typeof createTableInput>

export const getDatabaseSchemaInput = z.object({ databaseId })
export type GetDatabaseSchemaInput = z.infer<typeof getDatabaseSchemaInput>

export const findInput = z.object({
  databaseId,
  tableName,
  query: queryObject.optional().default({}),
  options: queryOptions.optional()
})
export type FindInput = z.infer<typeof findInput>

export const findOneInput = z.object({
  databaseId,
  tableName,
  query: queryObject.optional().default({})
})
export type FindOneInput = z.infer<typeof findOneInput>

export const findByIdInput = z.object({ databaseId, tableName, id: documentId })
export type FindByIdInput = z.infer<typeof findByIdInput>

export const createInput = z.object({
  databaseId,
  tableName,
  data: documentData
})
export type CreateInput = z.infer<typeof createInput>

export const createManyInput = z.object({
  databaseId,
  tableName,
  data: z.array(documentData)
})
export type CreateManyInput = z.infer<typeof createManyInput>

export const updateInput = z.object({
  databaseId,
  tableName,
  id: documentId,
  data: documentData
})
export type UpdateInput = z.infer<typeof updateInput>

export const updateManyInput = z.object({
  databaseId,
  tableName,
  query: queryObject,
  data: documentData
})
export type UpdateManyInput = z.infer<typeof updateManyInput>

export const deleteInput = z.object({ databaseId, tableName, id: documentId })
export type DeleteInput = z.infer<typeof deleteInput>

export const deleteManyInput = z.object({
  databaseId,
  tableName,
  query: queryObject
})
export type DeleteManyInput = z.infer<typeof deleteManyInput>

export const countInput = z.object({
  databaseId,
  tableName,
  query: queryObject.optional().default({})
})
export type CountInput = z.infer<typeof countInput>

export const distinctInput = z.object({
  databaseId,
  tableName,
  field: z.string().min(1, 'Field name is required'),
  query: queryObject.optional().default({})
})
export type DistinctInput = z.infer<typeof distinctInput>

export const existsInput = z.object({
  databaseId,
  tableName,
  query: queryObject
})
export type ExistsInput = z.infer<typeof existsInput>

export const searchInput = z.object({
  databaseId,
  tableName,
  searchTerm: z.string().min(1, 'Search term is required'),
  fields: z
    .array(z.string().min(1, 'Field cannot be empty'))
    .min(1, 'At least one field is required'),
  options: searchOptions.optional()
})
export type SearchInput = z.infer<typeof searchInput>

export const aggregateInput = z.object({
  databaseId,
  tableName,
  pipeline: z.array(aggregationStage)
})
export type AggregateInput = z.infer<typeof aggregateInput>

export const findByFieldInput = z.object({
  databaseId,
  tableName,
  field: z.string().min(1, 'Field name is required'),
  value: z.any()
})
export type FindByFieldInput = z.infer<typeof findByFieldInput>

// ==================== OUTPUT SCHEMAS ====================

// Base response schema
const baseResponse = z.object({
  success: z.boolean(),
  error: z.string().optional()
})

export const databaseExistsOutput = baseResponse.extend({
  exists: z.boolean()
})
export type DatabaseExistsOutput = z.infer<typeof databaseExistsOutput>

export const initializeDatabaseOutput = baseResponse
export type InitializeDatabaseOutput = z.infer<typeof initializeDatabaseOutput>

export const closeDatabaseOutput = baseResponse
export type CloseDatabaseOutput = z.infer<typeof closeDatabaseOutput>

export const getTablesOutput = baseResponse.extend({
  tables: z.array(tableConfig)
})
export type GetTablesOutput = z.infer<typeof getTablesOutput>

export const getTableSchemaOutput = baseResponse.extend({
  schema: tableConfig.optional()
})
export type GetTableSchemaOutput = z.infer<typeof getTableSchemaOutput>

export const createTableOutput = baseResponse
export type CreateTableOutput = z.infer<typeof createTableOutput>

export const getDatabaseSchemaOutput = baseResponse.extend({
  schema: z
    .object({
      tables: z.array(tableConfig)
    })
    .optional()
})
export type GetDatabaseSchemaOutput = z.infer<typeof getDatabaseSchemaOutput>

export const findOutput = baseResponse.extend({
  documents: z.array(documentData).optional()
})
export type FindOutput = z.infer<typeof findOutput>

export const findOneOutput = baseResponse.extend({
  document: documentData.nullable().optional()
})
export type FindOneOutput = z.infer<typeof findOneOutput>

export const findByIdOutput = baseResponse.extend({
  document: documentData.nullable().optional()
})
export type FindByIdOutput = z.infer<typeof findByIdOutput>

export const createOutput = baseResponse.extend({
  document: documentData.optional()
})
export type CreateOutput = z.infer<typeof createOutput>

export const createManyOutput = baseResponse.extend({
  documents: z.array(documentData).optional()
})
export type CreateManyOutput = z.infer<typeof createManyOutput>

export const updateOutput = baseResponse.extend({
  document: documentData.optional()
})
export type UpdateOutput = z.infer<typeof updateOutput>

export const updateManyOutput = baseResponse.extend({
  count: z.coerce.number().int().nonnegative().optional()
})
export type UpdateManyOutput = z.infer<typeof updateManyOutput>

export const deleteOutput = baseResponse.extend({
  deleted: z.boolean().optional()
})
export type DeleteOutput = z.infer<typeof deleteOutput>

export const deleteManyOutput = baseResponse.extend({
  count: z.coerce.number().int().nonnegative().optional()
})
export type DeleteManyOutput = z.infer<typeof deleteManyOutput>

export const countOutput = baseResponse.extend({
  count: z.coerce.number().int().nonnegative()
})
export type CountOutput = z.infer<typeof countOutput>

export const distinctOutput = baseResponse.extend({
  values: z.array(z.any())
})
export type DistinctOutput = z.infer<typeof distinctOutput>

export const existsOutput = baseResponse.extend({
  exists: z.boolean()
})
export type ExistsOutput = z.infer<typeof existsOutput>

export const searchOutput = baseResponse.extend({
  documents: z.array(documentData).optional()
})
export type SearchOutput = z.infer<typeof searchOutput>

export const aggregateOutput = baseResponse.extend({
  results: z.array(documentData)
})
export type AggregateOutput = z.infer<typeof aggregateOutput>

export const findByFieldOutput = baseResponse.extend({
  documents: z.array(documentData).optional()
})
export type FindByFieldOutput = z.infer<typeof findByFieldOutput>

export const getAllDatabasesOutput = baseResponse.extend({
  databases: z.array(z.string())
})
export type GetAllDatabasesOutput = z.infer<typeof getAllDatabasesOutput>
