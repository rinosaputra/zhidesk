// File: src/renderer/src/lib/orpc-query.ts
import { createTanstackQueryUtils } from '@orpc/tanstack-query'
import { getORPCClient } from './orpc-client'

const client = getORPCClient()

export const orpc = createTanstackQueryUtils(client, {
  path: ['zhidesk', 'v1']
})

// Export individual collection utilities untuk easier access
export const collection = {
  // Collection management
  create: orpc.collection.create,
  getAll: orpc.collection.getAll,
  getSchema: orpc.collection.getSchema,
  delete: orpc.collection.delete,
  exists: orpc.collection.exists,
  getStats: orpc.collection.getStats,

  // Document operations
  document: {
    create: orpc.collection.document.create,
    getAll: orpc.collection.document.getAll,
    getById: orpc.collection.document.getById,
    update: orpc.collection.document.update,
    delete: orpc.collection.document.delete,
    find: orpc.collection.document.find,
    paginate: orpc.collection.document.paginate,
    count: orpc.collection.document.count
  },

  // Schema operations
  schema: {
    generate: orpc.collection.schema.generate,
    extractDefaults: orpc.collection.schema.extractDefaults
  }
}

// Export types untuk TypeScript support
export type CollectionRouter = typeof collection
