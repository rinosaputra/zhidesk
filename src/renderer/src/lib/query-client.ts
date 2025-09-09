// File: src/renderer/src/lib/query-client.ts
import { QueryClient } from '@tanstack/react-query'
import { StandardRPCJsonSerializer } from '@orpc/client/standard'

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
      staleTime: 30 * 1000, // 30 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      queryKeyHashFn: (queryKey) => {
        try {
          const [json, meta] = serializer.serialize(queryKey)
          return JSON.stringify({ json, meta })
        } catch {
          return JSON.stringify(queryKey)
        }
      }
    },
    mutations: {
      retry: 1
    },
    dehydrate: {
      serializeData: (data) => {
        try {
          const [json, meta] = serializer.serialize(data)
          return { json, meta }
        } catch {
          return data
        }
      }
    },
    hydrate: {
      deserializeData: (data) => {
        try {
          return serializer.deserialize(data.json, data.meta)
        } catch {
          return data
        }
      }
    }
  }
})
