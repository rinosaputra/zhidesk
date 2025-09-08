// File: src/service/orpc/database/router.ts
import { os } from '@orpc/server'
import * as z from 'zod'
import { DatabaseService } from '@service/database'
import {
  databaseId,
  tableName,
  documentId,
  queryOptions,
  searchOptions,
  tableConfig,
  aggregationStage,
  databaseListResponse,
  existenceResponse,
  countResponse,
  documentResponse,
  documentsResponse,
  distinctResponse,
  aggregationResponse,
  schemaResponse,
  operationResponse
} from './types'

export const databaseRouter = {
  // ==================== DATABASE MANAGEMENT ====================

  getAllDatabases: os.output(databaseListResponse).handler(async () => {
    try {
      const db = DatabaseService.getInstance()
      const databases = await db.getAllDatabases()
      return {
        success: true,
        databases
      }
    } catch (error) {
      return {
        success: false,
        databases: [],
        error: error instanceof Error ? error.message : 'Failed to get databases'
      }
    }
  }),

  databaseExists: os
    .input(z.object({ databaseId }))
    .output(existenceResponse)
    .handler(async ({ input }) => {
      try {
        const db = DatabaseService.getInstance()
        const exists = await db.databaseExists(input.databaseId)
        return {
          success: true,
          exists
        }
      } catch (error) {
        return {
          success: false,
          exists: false,
          error: error instanceof Error ? error.message : 'Failed to check database existence'
        }
      }
    }),

  initializeDatabase: os
    .input(
      z.object({
        databaseId,
        databaseName: z.string().min(1, 'Database name is required'),
        tables: z.array(tableConfig).optional()
      })
    )
    .output(operationResponse)
    .handler(async ({ input }) => {
      try {
        const db = DatabaseService.getInstance()
        await db.initializeDatabase(input.databaseId, input.databaseName, input.tables || [])
        return {
          success: true
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to initialize database'
        }
      }
    }),

  closeDatabase: os
    .input(z.object({ databaseId }))
    .output(operationResponse)
    .handler(async ({ input }) => {
      try {
        const db = DatabaseService.getInstance()
        await db.closeDatabase(input.databaseId)
        return {
          success: true
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to close database'
        }
      }
    }),

  // ==================== TABLE OPERATIONS ====================

  getTables: os
    .input(z.object({ databaseId }))
    .output(schemaResponse.extend({ tables: z.array(z.any()).optional() }))
    .handler(async ({ input }) => {
      try {
        const db = DatabaseService.getInstance()
        const tables = db.getAllDatabaseTables(input.databaseId)
        return {
          success: true,
          tables,
          schema: tables
        }
      } catch (error) {
        return {
          success: false,
          tables: [],
          error: error instanceof Error ? error.message : 'Failed to get tables'
        }
      }
    }),

  getTableSchema: os
    .input(z.object({ databaseId, tableName }))
    .output(schemaResponse)
    .handler(async ({ input }) => {
      try {
        const db = DatabaseService.getInstance()
        const schema = db.getTableSchema(input.databaseId, input.tableName)
        return {
          success: true,
          schema
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to get table schema'
        }
      }
    }),

  createTable: os
    .input(z.object({ databaseId, tableConfig }))
    .output(operationResponse)
    .handler(async ({ input }) => {
      try {
        const db = DatabaseService.getInstance()
        const result = await db.createDatabaseTable(input.databaseId, input.tableConfig)
        return {
          success: result,
          error: result ? undefined : 'Failed to create table'
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create table'
        }
      }
    }),

  getDatabaseSchema: os
    .input(z.object({ databaseId }))
    .output(schemaResponse)
    .handler(async ({ input }) => {
      try {
        const db = DatabaseService.getInstance()
        // const schema = db.getDatabaseDatabaseSchema(input.databaseId)
        const tables = db.getAllDatabaseTables(input.databaseId) ?? []
        return {
          success: true,
          schema: {
            tables
          }
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to get database schema'
        }
      }
    }),

  // ==================== DATA OPERATIONS ====================

  find: os
    .input(
      z.object({
        databaseId,
        tableName,
        query: z.any().optional(),
        options: queryOptions.optional()
      })
    )
    .output(documentsResponse)
    .handler(async ({ input }) => {
      try {
        const db = DatabaseService.getInstance()
        const documents = await db.find(
          input.databaseId,
          input.tableName,
          input.query || {},
          input.options || {}
        )
        return {
          success: true,
          documents
        }
      } catch (error) {
        return {
          success: false,
          documents: [],
          error: error instanceof Error ? error.message : 'Failed to find documents'
        }
      }
    }),

  findOne: os
    .input(
      z.object({
        databaseId,
        tableName,
        query: z.any().optional()
      })
    )
    .output(documentResponse)
    .handler(async ({ input }) => {
      try {
        const db = DatabaseService.getInstance()
        const document = await db.findOne(input.databaseId, input.tableName, input.query || {})
        return {
          success: true,
          document
        }
      } catch (error) {
        return {
          success: false,
          document: null,
          error: error instanceof Error ? error.message : 'Failed to find document'
        }
      }
    }),

  findById: os
    .input(z.object({ databaseId, tableName, id: documentId }))
    .output(documentResponse)
    .handler(async ({ input }) => {
      try {
        const db = DatabaseService.getInstance()
        const document = await db.findById(input.databaseId, input.tableName, input.id)
        return {
          success: true,
          document
        }
      } catch (error) {
        return {
          success: false,
          document: null,
          error: error instanceof Error ? error.message : 'Failed to find document by ID'
        }
      }
    }),

  create: os
    .input(z.object({ databaseId, tableName, data: z.any() }))
    .output(documentResponse)
    .handler(async ({ input }) => {
      try {
        const db = DatabaseService.getInstance()
        const document = await db.create(input.databaseId, input.tableName, input.data)
        return {
          success: true,
          document
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create document'
        }
      }
    }),

  createMany: os
    .input(z.object({ databaseId, tableName, data: z.array(z.any()) }))
    .output(documentsResponse)
    .handler(async ({ input }) => {
      try {
        const db = DatabaseService.getInstance()
        const documents = await db.createMany(input.databaseId, input.tableName, input.data)
        return {
          success: true,
          documents
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create documents'
        }
      }
    }),

  update: os
    .input(z.object({ databaseId, tableName, id: documentId, data: z.any() }))
    .output(documentResponse)
    .handler(async ({ input }) => {
      try {
        const db = DatabaseService.getInstance()
        const document = await db.update(input.databaseId, input.tableName, input.id, input.data)
        return {
          success: true,
          document
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to update document'
        }
      }
    }),

  updateMany: os
    .input(z.object({ databaseId, tableName, query: z.any(), data: z.any() }))
    .output(operationResponse.extend({ count: z.number().optional() }))
    .handler(async ({ input }) => {
      try {
        const db = DatabaseService.getInstance()
        const count = await db.updateMany(
          input.databaseId,
          input.tableName,
          input.query,
          input.data
        )
        return {
          success: true,
          count
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to update documents'
        }
      }
    }),

  delete: os
    .input(z.object({ databaseId, tableName, id: documentId }))
    .output(operationResponse.extend({ deleted: z.boolean().optional() }))
    .handler(async ({ input }) => {
      try {
        const db = DatabaseService.getInstance()
        const deleted = await db.delete(input.databaseId, input.tableName, input.id)
        return {
          success: true,
          deleted
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to delete document'
        }
      }
    }),

  deleteMany: os
    .input(z.object({ databaseId, tableName, query: z.any() }))
    .output(operationResponse.extend({ count: z.number().optional() }))
    .handler(async ({ input }) => {
      try {
        const db = DatabaseService.getInstance()
        const count = await db.deleteMany(input.databaseId, input.tableName, input.query)
        return {
          success: true,
          count
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to delete documents'
        }
      }
    }),

  // ==================== QUERY OPERATIONS ====================

  count: os
    .input(z.object({ databaseId, tableName, query: z.any().optional() }))
    .output(countResponse)
    .handler(async ({ input }) => {
      try {
        const db = DatabaseService.getInstance()
        const count = await db.count(input.databaseId, input.tableName, input.query || {})
        return {
          success: true,
          count
        }
      } catch (error) {
        return {
          success: false,
          count: 0,
          error: error instanceof Error ? error.message : 'Failed to count documents'
        }
      }
    }),

  distinct: os
    .input(
      z.object({
        databaseId,
        tableName,
        field: z.string().min(1, 'Field name is required'),
        query: z.any().optional()
      })
    )
    .output(distinctResponse)
    .handler(async ({ input }) => {
      try {
        const db = DatabaseService.getInstance()
        const values = await db.distinct(
          input.databaseId,
          input.tableName,
          input.field,
          input.query || {}
        )
        return {
          success: true,
          values
        }
      } catch (error) {
        return {
          success: false,
          values: [],
          error: error instanceof Error ? error.message : 'Failed to get distinct values'
        }
      }
    }),

  exists: os
    .input(z.object({ databaseId, tableName, query: z.any() }))
    .output(existenceResponse)
    .handler(async ({ input }) => {
      try {
        const db = DatabaseService.getInstance()
        const exists = await db.exists(input.databaseId, input.tableName, input.query)
        return {
          success: true,
          exists
        }
      } catch (error) {
        return {
          success: false,
          exists: false,
          error: error instanceof Error ? error.message : 'Failed to check existence'
        }
      }
    }),

  search: os
    .input(
      z.object({
        databaseId,
        tableName,
        searchTerm: z.string().min(1, 'Search term is required'),
        fields: z.array(z.string()).min(1, 'At least one field is required'),
        options: searchOptions.optional()
      })
    )
    .output(documentsResponse)
    .handler(async ({ input }) => {
      try {
        const db = DatabaseService.getInstance()
        const documents = await db.search(
          input.databaseId,
          input.tableName,
          input.searchTerm,
          input.fields,
          input.options || {}
        )
        return {
          success: true,
          documents
        }
      } catch (error) {
        return {
          success: false,
          documents: [],
          error: error instanceof Error ? error.message : 'Failed to search documents'
        }
      }
    }),

  // ==================== AGGREGATION OPERATIONS ====================

  aggregate: os
    .input(
      z.object({
        databaseId,
        tableName,
        pipeline: z.array(aggregationStage)
      })
    )
    .output(aggregationResponse)
    .handler(async ({ input }) => {
      try {
        const db = DatabaseService.getInstance()
        const results = await db.aggregate(input.databaseId, input.tableName, input.pipeline)
        return {
          success: true,
          results
        }
      } catch (error) {
        return {
          success: false,
          results: [],
          error: error instanceof Error ? error.message : 'Failed to aggregate documents'
        }
      }
    }),

  // ==================== UTILITY OPERATIONS ====================

  findByField: os
    .input(
      z.object({
        databaseId,
        tableName,
        field: z.string().min(1, 'Field name is required'),
        value: z.any()
      })
    )
    .output(documentsResponse)
    .handler(async ({ input }) => {
      try {
        const db = DatabaseService.getInstance()
        // Note: findByField method perlu ditambahkan ke DatabaseService
        const documents = await db.findByField(
          input.databaseId,
          input.tableName,
          input.field,
          input.value
        )
        return {
          success: true,
          documents
        }
      } catch (error) {
        return {
          success: false,
          documents: [],
          error: error instanceof Error ? error.message : 'Failed to find by field'
        }
      }
    })
}
