// File: src/service/orpc/database/types.ts
import z from 'zod'

// Basic types
export const databaseId = z.string().min(1, 'Database ID is required')
export const tableName = z.string().min(1, 'Table name is required')
export const documentId = z.string().min(1, 'Document ID is required')

// Query options
export const queryOptions = z.object({
  skip: z.number().optional(),
  limit: z.number().optional(),
  sort: z.record(z.string(), z.number()).optional()
})

// Search options
export const searchOptions = queryOptions

// Field definition for table creation
export const fieldDefinition = z.object({
  name: z.string().min(1, 'Field name is required'),
  type: z.string().min(1, 'Field type is required'),
  required: z.boolean().optional(),
  unique: z.boolean().optional(),
  defaultValue: z.any().optional(),
  validation: z.any().optional()
})

// Table configuration
export const tableConfig = z.object({
  name: z.string().min(1, 'Table name is required'),
  fields: z.array(fieldDefinition),
  softDelete: z.boolean().optional(),
  timestamps: z.boolean().optional()
})

// Aggregation stage types
export const aggregationStage = z.record(z.string(), z.any())

// Common response schemas
export const successResponse = z.object({
  success: z.literal(true)
})

export const errorResponse = z.object({
  success: z.literal(false),
  error: z.string()
})

export const dataResponse = <T extends z.ZodTypeAny>(
  schema: T
): z.ZodType<{
  success: boolean
  error?: string
  data?: z.infer<T>
}> =>
  z.object({
    success: z.boolean(),
    data: schema.optional(),
    error: z.string().optional()
  })

// Specific response schemas
export const databaseListResponse = z.object({
  success: z.boolean(),
  databases: z.array(z.string()),
  error: z.string().optional()
})

export const existenceResponse = z.object({
  success: z.boolean(),
  exists: z.boolean(),
  error: z.string().optional()
})

export const countResponse = z.object({
  success: z.boolean(),
  count: z.number(),
  error: z.string().optional()
})

export const documentResponse = z.object({
  success: z.boolean(),
  document: z.any().nullable().optional(),
  error: z.string().optional()
})

export const documentsResponse = z.object({
  success: z.boolean(),
  documents: z.array(z.any()).optional(),
  error: z.string().optional()
})

export const distinctResponse = z.object({
  success: z.boolean(),
  values: z.array(z.any()),
  error: z.string().optional()
})

export const aggregationResponse = z.object({
  success: z.boolean(),
  results: z.array(z.any()),
  error: z.string().optional()
})

export const schemaResponse = z.object({
  success: z.boolean(),
  schema: z.any().optional(),
  error: z.string().optional()
})

export const operationResponse = z.object({
  success: z.boolean(),
  count: z.number().optional(),
  deleted: z.boolean().optional(),
  error: z.string().optional()
})
