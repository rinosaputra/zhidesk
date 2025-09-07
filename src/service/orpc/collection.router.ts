// File: src/service/orpc/collection.router.ts
import { os } from '@orpc/server'
import * as z from 'zod'
import databaseService from '../database/lowdb'
import { DocGenerator } from '@schema/collection/doc.class'
import { CollectionSchemaType } from '@schema/collection/doc'

// Inisialisasi DocGenerator
const docGenerator = new DocGenerator()

const SchemaRouter = {
  // ==================== SCHEMA OPERATIONS ====================

  // Generate schema for validation
  generate: os
    .input(
      z.object({
        schemaName: z.string().min(1, 'Schema name is required')
      })
    )
    .output(
      z.object({
        success: z.boolean(),
        schema: z.any().optional(),
        error: z.string().optional()
      })
    )
    .handler(async ({ input }) => {
      try {
        const schema = docGenerator.generate(input.schemaName)
        return {
          success: true,
          schema
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Schema not found'
        }
      }
    }),

  // Extract defaults for form generation
  extractDefaults: os
    .input(
      z.object({
        schemaName: z.string().min(1, 'Schema name is required')
      })
    )
    .output(
      z.object({
        success: z.boolean(),
        defaults: z.any().optional(),
        error: z.string().optional()
      })
    )
    .handler(async ({ input }) => {
      try {
        const defaults = docGenerator.extractDefaults(input.schemaName)
        return {
          success: true,
          defaults
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Schema not found'
        }
      }
    })
}

const DocumentRouter = {
  // ==================== CRUD OPERATIONS ====================
  // Create document
  create: os
    .input(
      z.object({
        collectionName: z.string().min(1, 'Collection name is required'),
        data: z.record(z.string(), z.any())
      })
    )
    .output(
      z.object({
        success: z.boolean(),
        document: z.any().optional(),
        error: z.string().optional()
      })
    )
    .handler(async ({ input }) => {
      try {
        // Validate data against collection schema
        const schema = docGenerator.generateCollectionSchema(input.collectionName)
        const validatedData = schema.parse(input.data)

        // Add timestamps if enabled
        const collection = docGenerator.getCollection(input.collectionName)
        const documentData = collection?.timestamps
          ? {
              ...validatedData,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          : { ...validatedData }

        // Save to database
        const document = await databaseService.create(input.collectionName, documentData)

        return {
          success: true,
          document
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Validation failed'
        }
      }
    }),

  // Read all documents
  getAll: os
    .input(
      z.object({
        collectionName: z.string().min(1, 'Collection name is required'),
        limit: z.number().optional(),
        offset: z.number().optional()
      })
    )
    .output(
      z.object({
        success: z.boolean(),
        documents: z.array(z.any()),
        total: z.number(),
        error: z.string().optional()
      })
    )
    .handler(async ({ input }) => {
      try {
        const documents = await databaseService.getAll(input.collectionName)
        const total = documents.length

        // Apply pagination
        let result = documents
        if (input.offset !== undefined) {
          result = result.slice(input.offset)
        }
        if (input.limit !== undefined) {
          result = result.slice(0, input.limit)
        }

        return {
          success: true,
          documents: result,
          total
        }
      } catch (error) {
        return {
          success: false,
          documents: [],
          total: 0,
          error: error instanceof Error ? error.message : 'Collection not found'
        }
      }
    }),

  // Read single document
  getById: os
    .input(
      z.object({
        collectionName: z.string().min(1, 'Collection name is required'),
        id: z.string().min(1, 'Document ID is required')
      })
    )
    .output(
      z.object({
        success: z.boolean(),
        document: z.any().optional(),
        error: z.string().optional()
      })
    )
    .handler(async ({ input }) => {
      try {
        const document = await databaseService.getById(input.collectionName, input.id)

        if (!document) {
          return {
            success: false,
            error: 'Document not found'
          }
        }

        return {
          success: true,
          document
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Document not found'
        }
      }
    }),

  // Update document
  update: os
    .input(
      z.object({
        collectionName: z.string().min(1, 'Collection name is required'),
        id: z.string().min(1, 'Document ID is required'),
        data: z.record(z.string(), z.any())
      })
    )
    .output(
      z.object({
        success: z.boolean(),
        document: z.any().optional(),
        error: z.string().optional()
      })
    )
    .handler(async ({ input }) => {
      try {
        // Validate data against collection schema
        const schema = docGenerator.generateCollectionSchema(input.collectionName)
        const validatedData = schema.partial().parse(input.data)

        // Update with timestamps if enabled
        const collectionConfig = docGenerator.getCollection(input.collectionName)
        const updateData = collectionConfig?.timestamps
          ? { ...validatedData, updatedAt: new Date() }
          : validatedData

        // Update document in database
        const document = await databaseService.update(input.collectionName, input.id, updateData)

        if (!document) {
          return {
            success: false,
            error: 'Document not found'
          }
        }

        return {
          success: true,
          document
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Update failed'
        }
      }
    }),

  // Delete document
  delete: os
    .input(
      z.object({
        collectionName: z.string().min(1, 'Collection name is required'),
        id: z.string().min(1, 'Document ID is required')
      })
    )
    .output(
      z.object({
        success: z.boolean(),
        error: z.string().optional()
      })
    )
    .handler(async ({ input }) => {
      try {
        // Check if document exists first
        const document = await databaseService.getById(input.collectionName, input.id)
        if (!document) {
          return {
            success: false,
            error: 'Document not found'
          }
        }

        // Soft delete if enabled
        const collectionConfig = docGenerator.getCollection(input.collectionName)
        if (collectionConfig?.softDelete) {
          await databaseService.update(input.collectionName, input.id, {
            deletedAt: new Date(),
            updatedAt: new Date()
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any)
        } else {
          await databaseService.delete(input.collectionName, input.id)
        }

        return {
          success: true
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Delete failed'
        }
      }
    }),

  // Find documents by query
  find: os
    .input(
      z.object({
        collectionName: z.string().min(1, 'Collection name is required'),
        query: z.record(z.string(), z.any()),
        limit: z.number().optional(),
        offset: z.number().optional()
      })
    )
    .output(
      z.object({
        success: z.boolean(),
        documents: z.array(z.any()),
        total: z.number(),
        error: z.string().optional()
      })
    )
    .handler(async ({ input }) => {
      try {
        const documents = await databaseService.find(input.collectionName, input.query)
        const total = documents.length

        // Apply pagination
        let result = documents
        if (input.offset !== undefined) {
          result = result.slice(input.offset)
        }
        if (input.limit !== undefined) {
          result = result.slice(0, input.limit)
        }

        return {
          success: true,
          documents: result,
          total
        }
      } catch (error) {
        return {
          success: false,
          documents: [],
          total: 0,
          error: error instanceof Error ? error.message : 'Query failed'
        }
      }
    }),

  // Paginate documents
  paginate: os
    .input(
      z.object({
        collectionName: z.string().min(1, 'Collection name is required'),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        query: z.record(z.string(), z.any()).optional()
      })
    )
    .output(
      z.object({
        success: z.boolean(),
        data: z.array(z.any()),
        total: z.number(),
        page: z.number(),
        totalPages: z.number(),
        error: z.string().optional()
      })
    )
    .handler(async ({ input }) => {
      try {
        const result = await databaseService.paginate(
          input.collectionName,
          input.page,
          input.limit,
          input.query
        )

        return {
          success: true,
          data: result.data,
          total: result.total,
          page: result.page,
          totalPages: result.totalPages
        }
      } catch (error) {
        return {
          success: false,
          data: [],
          total: 0,
          page: input.page,
          totalPages: 0,
          error: error instanceof Error ? error.message : 'Pagination failed'
        }
      }
    }),

  // Count documents
  count: os
    .input(
      z.object({
        collectionName: z.string().min(1, 'Collection name is required'),
        query: z.record(z.string(), z.any()).optional()
      })
    )
    .output(
      z.object({
        success: z.boolean(),
        count: z.number(),
        error: z.string().optional()
      })
    )
    .handler(async ({ input }) => {
      try {
        const count = await databaseService.count(input.collectionName, input.query)
        return {
          success: true,
          count
        }
      } catch (error) {
        return {
          success: false,
          count: 0,
          error: error instanceof Error ? error.message : 'Count failed'
        }
      }
    })
}

export const CollectionRouter = {
  // ==================== COLLECTION MANAGEMENT ====================
  // Create new collection
  create: os
    .input(
      z.object({
        name: z.string().min(1, 'Collection name is required'),
        label: z.string().min(1, 'Collection label is required'),
        description: z.string().optional(),
        fields: z.array(z.any()).min(1, 'At least one field is required'),
        timestamps: z.boolean().default(true).optional(),
        softDelete: z.boolean().default(false).optional()
      })
    )
    .output(
      z.object({
        success: z.boolean(),
        collection: z.any().optional(),
        error: z.string().optional()
      })
    )
    .handler(async ({ input }) => {
      try {
        const collectionConfig: CollectionSchemaType = {
          name: input.name,
          label: input.label,
          description: input.description,
          fields: input.fields,
          timestamps: input.timestamps,
          softDelete: input.softDelete,
          validation: { strict: true }
        }

        // Register collection ke DocGenerator
        docGenerator.registerCollection(collectionConfig)

        // Create collection in database
        const created = await databaseService.createCollection(input.name)
        if (!created) {
          return {
            success: false,
            error: 'Collection already exists'
          }
        }

        return {
          success: true,
          collection: collectionConfig
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        }
      }
    }),

  // Get all collections
  getAll: os
    .output(
      z.object({
        success: z.boolean(),
        collections: z.array(z.any()),
        error: z.string().optional()
      })
    )
    .handler(async () => {
      try {
        const collectionNames = databaseService.getCollections()

        const collections = await Promise.all(
          collectionNames.map(async (name) => {
            const count = await databaseService.count(name)
            return {
              name,
              count
            }
          })
        )

        return {
          success: true,
          collections
        }
      } catch (error) {
        return {
          success: false,
          collections: [],
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        }
      }
    }),

  // Get collection schema
  getSchema: os
    .input(
      z.object({
        collectionName: z.string().min(1, 'Collection name is required')
      })
    )
    .output(
      z.object({
        success: z.boolean(),
        schema: z.any().optional(),
        error: z.string().optional()
      })
    )
    .handler(async ({ input }) => {
      try {
        const schema = docGenerator.generateCollectionSchema(input.collectionName)
        return {
          success: true,
          schema: schema.shape
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Collection not found'
        }
      }
    }),

  // Delete collection
  delete: os
    .input(
      z.object({
        collectionName: z.string().min(1, 'Collection name is required')
      })
    )
    .output(
      z.object({
        success: z.boolean(),
        error: z.string().optional()
      })
    )
    .handler(async ({ input }) => {
      try {
        const deleted = await databaseService.deleteCollection(input.collectionName)
        if (!deleted) {
          return {
            success: false,
            error: 'Collection not found'
          }
        }

        // Remove from DocGenerator if needed
        // docGenerator.unregisterCollection(input.collectionName)

        return {
          success: true
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Delete failed'
        }
      }
    }),

  // Check if collection exists
  exists: os
    .input(
      z.object({
        collectionName: z.string().min(1, 'Collection name is required')
      })
    )
    .output(
      z.object({
        success: z.boolean(),
        exists: z.boolean(),
        error: z.string().optional()
      })
    )
    .handler(async ({ input }) => {
      try {
        const exists = databaseService.collectionExists(input.collectionName)
        return {
          success: true,
          exists
        }
      } catch (error) {
        return {
          success: false,
          exists: false,
          error: error instanceof Error ? error.message : 'Check failed'
        }
      }
    }),

  // Get collection stats
  getStats: os
    .input(
      z.object({
        collectionName: z.string().min(1, 'Collection name is required')
      })
    )
    .output(
      z.object({
        success: z.boolean(),
        count: z.number(),
        error: z.string().optional()
      })
    )
    .handler(async ({ input }) => {
      try {
        const count = await databaseService.count(input.collectionName)
        return {
          success: true,
          count
        }
      } catch (error) {
        return {
          success: false,
          count: 0,
          error: error instanceof Error ? error.message : 'Stats failed'
        }
      }
    }),

  document: DocumentRouter,
  schema: SchemaRouter
}
