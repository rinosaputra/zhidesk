// File: src/service/database/router.ts
import { os } from '@orpc/server'
import { DatabaseService } from './service'
import {
  // Input schemas
  databaseExistsInput,
  initializeDatabaseInput,
  closeDatabaseInput,
  getTablesInput,
  getTableSchemaInput,
  createTableInput,
  getDatabaseSchemaInput,
  findInput,
  findOneInput,
  findByIdInput,
  createInput,
  createManyInput,
  updateInput,
  updateManyInput,
  deleteInput,
  deleteManyInput,
  countInput,
  distinctInput,
  existsInput,
  searchInput,
  aggregateInput,
  findByFieldInput,

  // Output schemas
  getAllDatabasesOutput,
  databaseExistsOutput,
  initializeDatabaseOutput,
  closeDatabaseOutput,
  getTablesOutput,
  getTableSchemaOutput,
  createTableOutput,
  getDatabaseSchemaOutput,
  findOutput,
  findOneOutput,
  findByIdOutput,
  createOutput,
  createManyOutput,
  updateOutput,
  updateManyOutput,
  deleteOutput,
  deleteManyOutput,
  countOutput,
  distinctOutput,
  existsOutput,
  searchOutput,
  aggregateOutput,
  findByFieldOutput
} from './types'

export const databaseRouter = {
  // ==================== DATABASE MANAGEMENT ====================

  getAllDatabases: os.output(getAllDatabasesOutput).handler(async () => {
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
    .input(databaseExistsInput)
    .output(databaseExistsOutput)
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
    .input(initializeDatabaseInput)
    .output(initializeDatabaseOutput)
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
    .input(closeDatabaseInput)
    .output(closeDatabaseOutput)
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
    .input(getTablesInput)
    .output(getTablesOutput)
    .handler(async ({ input }) => {
      try {
        const db = DatabaseService.getInstance()
        const tables = db.getAllDatabaseTables(input.databaseId)
        console.log({ tables })
        return {
          success: true,
          tables
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
    .input(getTableSchemaInput)
    .output(getTableSchemaOutput)
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
    .input(createTableInput)
    .output(createTableOutput)
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
    .input(getDatabaseSchemaInput)
    .output(getDatabaseSchemaOutput)
    .handler(async ({ input }) => {
      try {
        const db = DatabaseService.getInstance()
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
    .input(findInput)
    .output(findOutput)
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
    .input(findOneInput)
    .output(findOneOutput)
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
    .input(findByIdInput)
    .output(findByIdOutput)
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
    .input(createInput)
    .output(createOutput)
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
    .input(createManyInput)
    .output(createManyOutput)
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
    .input(updateInput)
    .output(updateOutput)
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
    .input(updateManyInput)
    .output(updateManyOutput)
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
    .input(deleteInput)
    .output(deleteOutput)
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
    .input(deleteManyInput)
    .output(deleteManyOutput)
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
    .input(countInput)
    .output(countOutput)
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
    .input(distinctInput)
    .output(distinctOutput)
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
    .input(existsInput)
    .output(existsOutput)
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
    .input(searchInput)
    .output(searchOutput)
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
    .input(aggregateInput)
    .output(aggregateOutput)
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
    .input(findByFieldInput)
    .output(findByFieldOutput)
    .handler(async ({ input }) => {
      try {
        const db = DatabaseService.getInstance()
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
