// File: src/renderer/src/lib/orpc-query.ts
import { createTanstackQueryUtils } from '@orpc/tanstack-query'
import { getORPCClient } from './orpc-client'

const client = getORPCClient()

export const orpc = createTanstackQueryUtils(client)

// Export individual database utilities untuk easier access
export const database = {
  // Database management
  getAll: orpc.database.getAllDatabases,
  exists: orpc.database.databaseExists,
  initialize: orpc.database.initializeDatabase,
  close: orpc.database.closeDatabase,

  // Table operations
  table: {
    getAll: orpc.database.getTables,
    getSchema: orpc.database.getTableSchema,
    create: orpc.database.createTable,
    getDatabaseSchema: orpc.database.getDatabaseSchema
  },

  // Document operations
  document: {
    find: orpc.database.find,
    findOne: orpc.database.findOne,
    findById: orpc.database.findById,
    create: orpc.database.create,
    createMany: orpc.database.createMany,
    update: orpc.database.update,
    updateMany: orpc.database.updateMany,
    delete: orpc.database.delete,
    deleteMany: orpc.database.deleteMany,
    count: orpc.database.count,
    distinct: orpc.database.distinct,
    exists: orpc.database.exists,
    search: orpc.database.search,
    aggregate: orpc.database.aggregate
  }
}

// Export types untuk TypeScript support
export type DatabaseRouter = typeof database
