// File: src/renderer/src/components/database/types.ts
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
  name: z
    .string()
    .min(1, 'Field name is required')
    .describe('Technical field name (must be unique within table)'),
  label: z
    .string()
    .min(1, 'Field label is required')
    .describe('Human-readable label for display purposes'),
  type: z
    .enum(FieldType)
    .describe('Type of field (string, number, boolean, date, enum, reference, array, object)'),
  description: z
    .string()
    .optional()
    .describe('Optional description for documentation and tooltips'),
  required: zBool(false).describe('Whether the field is mandatory (must have a value)'),
  unique: zBool(false).describe('Whether field values must be unique across all documents'),
  index: zBool(false).describe('Whether to create an index for faster queries on this field'),
  hidden: zBool(false).describe('Whether the field should be hidden from UI displays'),
  readonly: zBool(false).describe('Whether the field is read-only and cannot be modified'),
  default: z.any().optional().describe('Default value for the field when not provided'),
  coerce: zBool(false).describe('Whether to automatically convert values to the correct type')
})

// String field
export const StringFieldSchema = BaseFieldSchema.extend({
  type: z.literal('string').describe('Text field for storing string values'),
  validation: z
    .object({
      min: z.coerce.number().optional().describe('Minimum character length allowed'),
      max: z.coerce.number().optional().describe('Maximum character length allowed'),
      length: z.coerce.number().optional().describe('Exact character length required'),
      pattern: z.string().optional().describe('Regular expression pattern for validation'),
      format: z
        .enum(['email', 'url', 'uuid', 'phone', 'password', 'string'])
        .optional()
        .describe('Predefined format validation'),
      trim: zBool(true).describe('Whether to automatically trim whitespace from input'),
      transform: z
        .enum(['lowercase', 'uppercase', 'capitalize', 'none'])
        .optional()
        .describe('Text transformation to apply'),
      as: z.enum(['input', 'textarea']).optional().describe('UI component type for rendering')
    })
    .optional()
    .describe('String-specific validation rules')
})

// Number field
export const NumberFieldSchema = BaseFieldSchema.extend({
  type: z.literal('number').describe('Numeric field for storing number values'),
  validation: z
    .object({
      min: z.coerce.number().optional().describe('Minimum value allowed'),
      max: z.coerce.number().optional().describe('Maximum value allowed'),
      integer: zBool(false).describe('Whether the value must be an integer (no decimals)'),
      positive: zBool(false).describe('Whether the value must be positive (greater than zero)'),
      nonnegative: zBool(false).describe(
        'Whether the value must be non-negative (zero or positive)'
      ),
      multipleOf: z.coerce.number().optional().describe('Value must be a multiple of this number')
    })
    .optional()
    .describe('Number-specific validation rules')
})

// Boolean field
export const BooleanFieldSchema = BaseFieldSchema.extend({
  type: z.literal('boolean').describe('Boolean field for true/false values'),
  validation: z
    .object({
      is: z.enum(['true', 'false']).optional().describe('Required boolean value (if specified)'),
      as: z.enum(['switch', 'checkbox']).optional().describe('UI component type for rendering')
    })
    .optional()
    .describe('Boolean-specific validation rules')
})

// Date field
export const DateFieldSchema = BaseFieldSchema.extend({
  type: z.literal('date').describe('Date field for storing date and time values'),
  validation: z
    .object({
      min: z.date().optional().describe('Earliest allowed date'),
      max: z.date().optional().describe('Latest allowed date'),
      past: zBool(false).describe('Whether the date must be in the past'),
      future: zBool(false).describe('Whether the date must be in the future'),
      format: z.string().optional().describe('Date format string for display and parsing'),
      as: z
        .enum(['date', 'datetime', 'time'])
        .optional()
        .describe('Type of date input (date only, datetime, or time only)')
    })
    .optional()
    .describe('Date-specific validation rules')
})

// Enum field
export const EnumFieldSchema = BaseFieldSchema.extend({
  type: z.literal('enum').describe('Enum field for selecting from predefined options'),
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
  validation: z
    .object({
      as: z.enum(['select', 'radio']).optional().describe('UI component type for rendering')
    })
    .optional()
    .describe('Enum-specific validation rules')
})

// Reference field (relationship)
export const ReferenceFieldSchema = BaseFieldSchema.extend({
  type: z.literal('reference').describe('Reference field for relationships to other tables'),
  reference: z
    .object({
      tableName: z
        .string()
        .min(1, 'Reference table name is required')
        .describe('Name of the referenced table'),
      columnName: z
        .string()
        .min(1, 'Reference column name is required')
        .default('_id')
        .optional()
        .describe('Column name in the referenced table'),
      join: z
        .string()
        .default(' ')
        .optional()
        .describe('Join configuration for relationship queries'),
      concat: z
        .string()
        .min(1, 'Reference concat is required')
        .array()
        .optional()
        .describe('Fields to concatenate for display purposes')
    })
    .describe('Reference relationship configuration'),
  validation: z
    .object({
      cascadeDelete: zBool(false).describe(
        'Whether to delete referenced documents when parent is deleted'
      ),
      required: zBool(false).describe('Whether the reference must exist (foreign key constraint)')
    })
    .optional()
    .describe('Reference-specific validation rules')
})

// Object field
export const ObjectFieldSchema = BaseFieldSchema.extend({
  type: z.literal('object').describe('Object field for storing nested structured data'),
  fields: z
    .discriminatedUnion('type', [
      StringFieldSchema,
      NumberFieldSchema,
      BooleanFieldSchema,
      DateFieldSchema,
      EnumFieldSchema,
      ReferenceFieldSchema
    ])
    .array()
    .describe('Fields within the nested object'),
  validation: z
    .object({
      strict: zBool(true).describe(
        'Whether to disallow additional properties not defined in schema'
      ),
      passthrough: zBool(false).describe(
        'Whether to allow additional properties and pass them through'
      )
    })
    .optional()
    .describe('Object-specific validation rules')
})

// Array field
export const ArrayFieldSchema = BaseFieldSchema.extend({
  type: z.literal('array').describe('Array field for storing lists of items'),
  items: z
    .discriminatedUnion('type', [
      StringFieldSchema,
      NumberFieldSchema,
      BooleanFieldSchema,
      DateFieldSchema,
      EnumFieldSchema,
      ReferenceFieldSchema,
      ObjectFieldSchema
    ])
    .describe('Schema for items within the array'),
  validation: z
    .object({
      min: z.coerce.number().optional().describe('Minimum number of items required'),
      max: z.coerce.number().optional().describe('Maximum number of items allowed'),
      length: z.coerce.number().optional().describe('Exact number of items required'),
      unique: zBool(false).describe('Whether array items must be unique')
    })
    .optional()
    .describe('Array-specific validation rules')
})

// Union of all field types
export const FieldSchema = z
  .discriminatedUnion('type', [
    StringFieldSchema,
    NumberFieldSchema,
    BooleanFieldSchema,
    DateFieldSchema,
    EnumFieldSchema,
    ReferenceFieldSchema,
    ArrayFieldSchema,
    ObjectFieldSchema
  ])
  .describe('Union type for all supported field types')

// Table schema
export const TableSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Table name is required')
      .describe('Technical table name (must be unique within database)'),
    label: z
      .string()
      .min(1, 'Table label is required')
      .describe('Human-readable label for display purposes'),
    description: z
      .string()
      .optional()
      .describe('Optional description of the table purpose and contents'),
    fields: z
      .array(FieldSchema)
      .min(1, 'At least one field is required')
      .describe('Array of field definitions for the table'),
    indexes: z
      .array(z.string())
      .optional()
      .describe('Additional index configurations for query optimization'),
    timestamps: zBool(true).describe(
      'Whether to automatically manage createdAt and updatedAt fields'
    ),
    softDelete: zBool(false).describe(
      'Whether to use soft delete (set deletedAt instead of actual deletion)'
    ),
    validation: z
      .object({
        strict: zBool(true).describe(
          'Whether to enforce strict schema validation (no extra properties)'
        ),
        additionalProperties: zBool(false).describe(
          'Whether to allow additional properties not defined in schema'
        )
      })
      .optional()
      .describe('Table-level validation settings')
  })
  .describe('Schema definition for a database table')

// Database schema
export const DatabaseSchema = z
  .object({
    name: z.string().min(1, 'Database name is required').describe('Name of the database'),
    version: z.coerce.number().default(1).describe('Version number for schema migration purposes'),
    tables: z
      .array(TableSchema)
      .min(1, 'At least one table is required')
      .describe('Array of table definitions in the database'),
    createdAt: z
      .date()
      .default(() => new Date())
      .describe('Timestamp when the database was created'),
    updatedAt: z
      .date()
      .default(() => new Date())
      .describe('Timestamp when the database was last updated')
  })
  .describe('Schema definition for a complete database')

// Type inference
export type BaseField = z.infer<typeof BaseFieldSchema>
export type StringField = z.infer<typeof StringFieldSchema>
export type NumberField = z.infer<typeof NumberFieldSchema>
export type BooleanField = z.infer<typeof BooleanFieldSchema>
export type DateField = z.infer<typeof DateFieldSchema>
export type EnumField = z.infer<typeof EnumFieldSchema>
export type ReferenceField = z.infer<typeof ReferenceFieldSchema>
export type ObjectField = z.infer<typeof ObjectFieldSchema>
export type ArrayField = z.infer<typeof ArrayFieldSchema>

export type Field = z.infer<typeof FieldSchema>

export type Table = z.infer<typeof TableSchema>
export type Database = z.infer<typeof DatabaseSchema>

// Basic types
export const databaseId = z
  .string()
  .min(1, 'Database ID is required')
  .describe('Unique identifier for a database instance')
export const tableName = z
  .string()
  .min(1, 'Table name is required')
  .describe('Name of a table within a database')
export const documentId = z
  .string()
  .min(1, 'Document ID is required')
  .describe('Unique identifier for a document/record')

// Document type untuk data yang disimpan
export type DocumentData = {
  _id?: string
  _createdAt?: Date
  _updatedAt?: Date
  _deletedAt?: Date
  [key: string]: unknown
}

export const documentData = z
  .record(z.string(), z.any())
  .describe('Generic document data structure with key-value pairs')

// Query type untuk operasi find
export const queryObject = z
  .record(z.string(), z.any())
  .describe('Query object for filtering documents')

export type QueryObject = z.infer<typeof queryObject>

// Table configuration
export const tableConfig = TableSchema.describe('Table configuration schema')

// Query options
export const queryOptions = z
  .object({
    skip: z.coerce
      .number()
      .int()
      .nonnegative()
      .optional()
      .describe('Number of documents to skip (for pagination)'),
    limit: z.coerce
      .number()
      .int()
      .positive()
      .optional()
      .describe('Maximum number of documents to return (for pagination)'),
    sort: z
      .record(z.string(), z.union([z.literal(1), z.literal(-1)]))
      .optional()
      .describe('Sorting configuration (field: 1 for ascending, -1 for descending)')
  })
  .describe('Options for query operations (pagination and sorting)')

export type QueryOptions = z.infer<typeof queryOptions>

// Search options
export const searchOptions = queryOptions.describe(
  'Options for search operations (extends query options)'
)

export type SearchOptions = z.infer<typeof searchOptions>

// Aggregation stage types
export const matchStage = z
  .object({
    $match: queryObject.optional().describe('Filter documents based on specified criteria')
  })
  .describe('Match stage for filtering documents in aggregation pipeline')

export const groupStage = z
  .object({
    $group: z
      .object({
        _id: z
          .union([z.string(), z.record(z.string(), z.any())])
          .describe('Grouping key or expression')
      })
      .catchall(z.any())
      .describe('Grouping stage configuration')
  })
  .describe('Group stage for grouping documents in aggregation pipeline')

export const sortStage = z
  .object({
    $sort: z
      .record(z.string(), z.union([z.literal(1), z.literal(-1)]))
      .describe('Sorting configuration for aggregation')
  })
  .describe('Sort stage for sorting documents in aggregation pipeline')

export const projectStage = z
  .object({
    $project: z
      .record(z.string(), z.any())
      .describe('Projection configuration for field selection and transformation')
  })
  .describe('Project stage for shaping documents in aggregation pipeline')

export const skipStage = z
  .object({
    $skip: z.coerce
      .number()
      .int()
      .nonnegative()
      .describe('Number of documents to skip in aggregation')
  })
  .describe('Skip stage for pagination in aggregation pipeline')

export const limitStage = z
  .object({
    $limit: z.coerce
      .number()
      .int()
      .positive()
      .describe('Maximum number of documents to return in aggregation')
  })
  .describe('Limit stage for pagination in aggregation pipeline')

export const unwindStage = z
  .object({
    $unwind: z
      .string()
      .describe('Array field path to unwind (deconstruct array into multiple documents)')
  })
  .describe('Unwind stage for deconstructing arrays in aggregation pipeline')

export const lookupStage = z
  .object({
    $lookup: z
      .object({
        from: z.string().describe('Name of the collection to join with'),
        localField: z.string().describe('Field from the input documents'),
        foreignField: z.string().describe('Field from the documents of the "from" collection'),
        as: z.string().describe('Name of the new array field to add to the input documents')
      })
      .describe('Lookup configuration for joining collections')
  })
  .describe('Lookup stage for joining collections in aggregation pipeline')

export const addFieldsStage = z
  .object({
    $addFields: z
      .record(z.string(), z.any())
      .describe('New fields to add or existing fields to modify')
  })
  .describe('AddFields stage for adding computed fields in aggregation pipeline')

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

export const aggregationStage: z.ZodType<AggregationStage> = z
  .union([
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
  .describe('Union type for all aggregation pipeline stages')

// ==================== INPUT SCHEMAS ====================

export const databaseExistsInput = z
  .object({ databaseId })
  .describe('Input for checking if a database exists')
export type DatabaseExistsInput = z.infer<typeof databaseExistsInput>

export const initializeDatabaseInput = z
  .object({
    databaseId,
    databaseName: z
      .string()
      .min(1, 'Database name is required')
      .describe('Name for the new database'),
    reset: z
      .boolean()
      .optional()
      .default(false)
      .describe('Whether to reset the database if it already exists')
  })
  .describe('Input for initializing a new database')
export type InitializeDatabaseInput = z.infer<typeof initializeDatabaseInput>

export const closeDatabaseInput = z
  .object({ databaseId })
  .describe('Input for closing a database connection')
export type CloseDatabaseInput = z.infer<typeof closeDatabaseInput>

export const getTablesInput = z
  .object({ databaseId })
  .describe('Input for retrieving all tables in a database')
export type GetTablesInput = z.infer<typeof getTablesInput>

export const getTableSchemaInput = z
  .object({ databaseId, tableName })
  .describe('Input for retrieving a specific table schema')
export type GetTableSchemaInput = z.infer<typeof getTableSchemaInput>

export const createTableInput = z
  .object({ databaseId, tableConfig })
  .describe('Input for creating a new table')
export type CreateTableInput = z.infer<typeof createTableInput>

export const getDatabaseSchemaInput = z
  .object({ databaseId })
  .describe('Input for retrieving the complete database schema')
export type GetDatabaseSchemaInput = z.infer<typeof getDatabaseSchemaInput>

export const findInput = z
  .object({
    databaseId,
    tableName,
    query: queryObject.optional().default({}).describe('Filter criteria for documents'),
    options: queryOptions.optional().describe('Query options for pagination and sorting')
  })
  .describe('Input for finding documents with optional filtering and pagination')
export type FindInput = z.infer<typeof findInput>

export const findOneInput = z
  .object({
    databaseId,
    tableName,
    query: queryObject.optional().default({}).describe('Filter criteria for document')
  })
  .describe('Input for finding a single document')
export type FindOneInput = z.infer<typeof findOneInput>

export const findByIdInput = z
  .object({ databaseId, tableName, id: documentId })
  .describe('Input for finding a document by its ID')
export type FindByIdInput = z.infer<typeof findByIdInput>

export const createInput = z
  .object({
    databaseId,
    tableName,
    data: documentData.describe('Document data to create')
  })
  .describe('Input for creating a new document')
export type CreateInput = z.infer<typeof createInput>

export const createManyInput = z
  .object({
    databaseId,
    tableName,
    data: z.array(documentData).describe('Array of document data to create')
  })
  .describe('Input for creating multiple documents in bulk')
export type CreateManyInput = z.infer<typeof createManyInput>

export const updateInput = z
  .object({
    databaseId,
    tableName,
    id: documentId,
    data: documentData.describe('Data to update (will be merged with existing document)')
  })
  .describe('Input for updating a specific document by ID')
export type UpdateInput = z.infer<typeof updateInput>

export const updateManyInput = z
  .object({
    databaseId,
    tableName,
    query: queryObject.describe('Filter criteria for documents to update'),
    data: documentData.describe('Data to update on matching documents')
  })
  .describe('Input for updating multiple documents matching a query')
export type UpdateManyInput = z.infer<typeof updateManyInput>

export const deleteInput = z
  .object({ databaseId, tableName, id: documentId })
  .describe('Input for deleting a specific document by ID')
export type DeleteInput = z.infer<typeof deleteInput>

export const deleteManyInput = z
  .object({
    databaseId,
    tableName,
    query: queryObject.describe('Filter criteria for documents to delete')
  })
  .describe('Input for deleting multiple documents matching a query')
export type DeleteManyInput = z.infer<typeof deleteManyInput>

export const countInput = z
  .object({
    databaseId,
    tableName,
    query: queryObject.optional().default({}).describe('Filter criteria for documents to count')
  })
  .describe('Input for counting documents matching a query')
export type CountInput = z.infer<typeof countInput>

export const distinctInput = z
  .object({
    databaseId,
    tableName,
    field: z
      .string()
      .min(1, 'Field name is required')
      .describe('Field name to get distinct values from'),
    query: queryObject.optional().default({}).describe('Filter criteria for documents to consider')
  })
  .describe('Input for getting distinct values of a field')
export type DistinctInput = z.infer<typeof distinctInput>

export const existsInput = z
  .object({
    databaseId,
    tableName,
    query: queryObject.describe('Filter criteria to check existence')
  })
  .describe('Input for checking if any documents match a query')
export type ExistsInput = z.infer<typeof existsInput>

export const searchInput = z
  .object({
    databaseId,
    tableName,
    searchTerm: z.string().min(1, 'Search term is required').describe('Text to search for'),
    fields: z
      .array(z.string().min(1, 'Field cannot be empty'))
      .min(1, 'At least one field is required')
      .describe('Field names to search within'),
    options: searchOptions.optional().describe('Search options for pagination and sorting')
  })
  .describe('Input for full-text search across multiple fields')
export type SearchInput = z.infer<typeof searchInput>

export const aggregateInput = z
  .object({
    databaseId,
    tableName,
    pipeline: z.array(aggregationStage).describe('Aggregation pipeline stages')
  })
  .describe('Input for executing an aggregation pipeline')
export type AggregateInput = z.infer<typeof aggregateInput>

export const findByFieldInput = z
  .object({
    databaseId,
    tableName,
    field: z.string().min(1, 'Field name is required').describe('Field name to search by'),
    value: z.any().describe('Value to match in the specified field')
  })
  .describe('Input for finding documents by a specific field value')
export type FindByFieldInput = z.infer<typeof findByFieldInput>

export const updateFieldValueInput = z
  .object({
    databaseId,
    tableName,
    id: documentId,
    field: z.string().min(1, 'Field name is required').describe('Field name to update'),
    value: z.any().describe('New value for the field')
  })
  .describe('Input for updating a specific field value in a document')
export type UpdateFieldValueInput = z.infer<typeof updateFieldValueInput>

// Schema untuk mengubah field table
export const updateTableFieldInput = z
  .object({
    databaseId,
    tableName,
    fieldName: z.string().min(1, 'Field name is required').describe('Name of the field to update'),
    updates: z
      .object({
        label: z.string().optional().describe('New label for the field'),
        description: z.string().optional().describe('New description for the field'),
        required: z.boolean().optional().describe('Whether the field should be required'),
        unique: z.boolean().optional().describe('Whether field values should be unique'),
        hidden: z.boolean().optional().describe('Whether the field should be hidden'),
        readonly: z.boolean().optional().describe('Whether the field should be read-only'),
        default: z.any().optional().describe('New default value for the field'),
        validation: z.any().optional().describe('New validation rules for the field')
      })
      .refine((obj) => Object.keys(obj).length > 0, {
        message: 'At least one update property is required'
      })
  })
  .describe('Input for updating a field definition in a table schema')
export type UpdateTableFieldInput = z.infer<typeof updateTableFieldInput>

export const addTableFieldInput = z
  .object({
    databaseId,
    tableName,
    field: FieldSchema.describe('Field definition to add to the table')
  })
  .describe('Input for adding a new field to a table schema')
export type AddTableFieldInput = z.infer<typeof addTableFieldInput>

export const removeTableFieldInput = z
  .object({
    databaseId,
    tableName,
    fieldName: z.string().min(1, 'Field name is required').describe('Name of the field to remove')
  })
  .describe('Input for removing a field from a table schema')
export type RemoveTableFieldInput = z.infer<typeof removeTableFieldInput>

// ==================== OUTPUT SCHEMAS ====================

// Base response schema
const baseResponse = z
  .object({
    success: z.boolean().describe('Whether the operation was successful'),
    error: z.string().optional().describe('Error message if the operation failed')
  })
  .describe('Base response format for all operations')

export const databaseExistsOutput = baseResponse
  .extend({
    exists: z.boolean().describe('Whether the database exists')
  })
  .describe('Response for database existence check')
export type DatabaseExistsOutput = z.infer<typeof databaseExistsOutput>

export const initializeDatabaseOutput = baseResponse.describe(
  'Response for database initialization'
)
export type InitializeDatabaseOutput = z.infer<typeof initializeDatabaseOutput>

export const closeDatabaseOutput = baseResponse.describe('Response for closing database connection')
export type CloseDatabaseOutput = z.infer<typeof closeDatabaseOutput>

export const getTablesOutput = baseResponse
  .extend({
    tables: z.array(tableConfig).describe('Array of table configurations')
  })
  .describe('Response for retrieving all tables')
export type GetTablesOutput = z.infer<typeof getTablesOutput>

export const getTableSchemaOutput = baseResponse
  .extend({
    schema: tableConfig.optional().describe('Table schema if found')
  })
  .describe('Response for retrieving a specific table schema')
export type GetTableSchemaOutput = z.infer<typeof getTableSchemaOutput>

export const createTableOutput = baseResponse.describe('Response for table creation')
export type CreateTableOutput = z.infer<typeof createTableOutput>

export const getDatabaseSchemaOutput = baseResponse
  .extend({
    schema: z
      .object({
        tables: z.array(tableConfig).describe('Array of table schemas in the database')
      })
      .optional()
      .describe('Complete database schema if found')
  })
  .describe('Response for retrieving complete database schema')
export type GetDatabaseSchemaOutput = z.infer<typeof getDatabaseSchemaOutput>

export const findOutput = baseResponse
  .extend({
    documents: z.array(documentData).optional().describe('Array of found documents')
  })
  .describe('Response for find operation')
export type FindOutput = z.infer<typeof findOutput>

export const findOneOutput = baseResponse
  .extend({
    document: documentData.nullable().optional().describe('Found document or null')
  })
  .describe('Response for findOne operation')
export type FindOneOutput = z.infer<typeof findOneOutput>

export const findByIdOutput = baseResponse
  .extend({
    document: documentData.nullable().optional().describe('Found document or null')
  })
  .describe('Response for findById operation')
export type FindByIdOutput = z.infer<typeof findByIdOutput>

export const createOutput = baseResponse
  .extend({
    document: documentData.optional().describe('Created document with generated fields')
  })
  .describe('Response for document creation')
export type CreateOutput = z.infer<typeof createOutput>

export const createManyOutput = baseResponse
  .extend({
    documents: z.array(documentData).optional().describe('Array of created documents')
  })
  .describe('Response for bulk document creation')
export type CreateManyOutput = z.infer<typeof createManyOutput>

export const updateOutput = baseResponse
  .extend({
    document: documentData.optional().describe('Updated document')
  })
  .describe('Response for document update')
export type UpdateOutput = z.infer<typeof updateOutput>

export const updateManyOutput = baseResponse
  .extend({
    count: z.coerce.number().int().nonnegative().optional().describe('Number of documents updated')
  })
  .describe('Response for bulk document update')
export type UpdateManyOutput = z.infer<typeof updateManyOutput>

export const deleteOutput = baseResponse
  .extend({
    deleted: z.boolean().optional().describe('Whether the document was deleted')
  })
  .describe('Response for document deletion')
export type DeleteOutput = z.infer<typeof deleteOutput>

export const deleteManyOutput = baseResponse
  .extend({
    count: z.coerce.number().int().nonnegative().optional().describe('Number of documents deleted')
  })
  .describe('Response for bulk document deletion')
export type DeleteManyOutput = z.infer<typeof deleteManyOutput>

export const countOutput = baseResponse
  .extend({
    count: z.coerce.number().int().nonnegative().describe('Number of documents matching the query')
  })
  .describe('Response for count operation')
export type CountOutput = z.infer<typeof countOutput>

export const distinctOutput = baseResponse
  .extend({
    values: z.array(z.any()).describe('Array of distinct values from the field')
  })
  .describe('Response for distinct values operation')
export type DistinctOutput = z.infer<typeof distinctOutput>

export const existsOutput = baseResponse
  .extend({
    exists: z.boolean().describe('Whether any documents match the query')
  })
  .describe('Response for existence check')
export type ExistsOutput = z.infer<typeof existsOutput>

export const searchOutput = baseResponse
  .extend({
    documents: z.array(documentData).optional().describe('Array of documents matching the search')
  })
  .describe('Response for search operation')
export type SearchOutput = z.infer<typeof searchOutput>

export const aggregateOutput = baseResponse
  .extend({
    results: z.array(documentData).describe('Array of aggregation results')
  })
  .describe('Response for aggregation operation')
export type AggregateOutput = z.infer<typeof aggregateOutput>

export const findByFieldOutput = baseResponse
  .extend({
    documents: z
      .array(documentData)
      .optional()
      .describe('Array of documents matching the field value')
  })
  .describe('Response for findByField operation')
export type FindByFieldOutput = z.infer<typeof findByFieldOutput>

export const getAllDatabasesOutput = baseResponse
  .extend({
    databases: z.array(z.string()).describe('Array of database IDs')
  })
  .describe('Response for getting all databases')
export type GetAllDatabasesOutput = z.infer<typeof getAllDatabasesOutput>

export const updateFieldValueOutput = baseResponse
  .extend({
    document: documentData.optional().describe('Updated document with the new field value')
  })
  .describe('Response for field value update operation')
export type UpdateFieldValueOutput = z.infer<typeof updateFieldValueOutput>

export const updateTableFieldOutput = baseResponse
  .extend({
    schema: tableConfig.optional().describe('Updated table schema')
  })
  .describe('Response for table field update operation')
export type UpdateTableFieldOutput = z.infer<typeof updateTableFieldOutput>

export const addTableFieldOutput = baseResponse
  .extend({
    schema: tableConfig.optional().describe('Updated table schema with new field')
  })
  .describe('Response for adding table field operation')
export type AddTableFieldOutput = z.infer<typeof addTableFieldOutput>

export const removeTableFieldOutput = baseResponse
  .extend({
    schema: tableConfig.optional().describe('Updated table schema without the removed field')
  })
  .describe('Response for removing table field operation')
export type RemoveTableFieldOutput = z.infer<typeof removeTableFieldOutput>

// === ADD ===

export const FilterConditionOperator = {
  equals: 'equals',
  contains: 'contains',
  greaterThan: 'greaterThan',
  lessThan: 'lessThan',
  in: 'in',
  notEquals: 'notEquals'
} as const

export type FilterConditionOperator = keyof typeof FilterConditionOperator

export interface FilterCondition {
  field: string
  operator: FilterConditionOperator
  value: string
}

export interface Pagination {
  page: number
  pageSize: number
  total: number
}
