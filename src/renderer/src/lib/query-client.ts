// File: src/renderer/src/lib/query-client.ts
import { QueryClient } from '@tanstack/react-query'
import { StandardRPCJsonSerializer } from '@orpc/client/standard'
import { orpc } from './orpc-query'

// Create custom serializer untuk oRPC types
export const serializer = new StandardRPCJsonSerializer({
  customJsonSerializers: [
    // Tambahkan custom serializers jika needed
  ]
})

// Create Query Client dengan oRPC configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      queryKeyHashFn: (queryKey) => {
        const [json, meta] = serializer.serialize(queryKey)
        return JSON.stringify({ json, meta })
      }
    },
    mutations: {
      retry: 1
    },
    dehydrate: {
      serializeData: (data) => {
        const [json, meta] = serializer.serialize(data)
        return { json, meta }
      }
    },
    hydrate: {
      deserializeData: (data) => {
        return serializer.deserialize(data.json, data.meta)
      }
    }
  }
})

// Utility functions untuk collection operations
export const collectionQueryKeys = {
  all: (collectionName: string) => ['collections', collectionName] as const,
  lists: (collectionName: string) => [...collectionQueryKeys.all(collectionName), 'list'] as const,
  list: (collectionName: string, query?: object) =>
    [...collectionQueryKeys.lists(collectionName), { query }] as const,
  details: (collectionName: string) =>
    [...collectionQueryKeys.all(collectionName), 'detail'] as const,
  detail: (collectionName: string, id: string) =>
    [...collectionQueryKeys.details(collectionName), id] as const,
  stats: (collectionName: string) => [...collectionQueryKeys.all(collectionName), 'stats'] as const
}

// Prefetch utilities
export const prefetchCollections = async (): Promise<void> => {
  await queryClient.prefetchQuery(orpc.collection.getAll.queryOptions())
}

export const prefetchCollectionDocuments = async (
  collectionName: string,
  query?: object
): Promise<void> => {
  await queryClient.prefetchQuery(
    orpc.collection.document.getAll.queryOptions({
      input: { collectionName, ...(query && { query }) }
    })
  )
}

export const prefetchCollectionDocument = async (
  collectionName: string,
  id: string
): Promise<void> => {
  await queryClient.prefetchQuery(
    orpc.collection.document.getById.queryOptions({
      input: { collectionName, id }
    })
  )
}
