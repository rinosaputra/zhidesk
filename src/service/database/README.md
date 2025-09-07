## 📊 Struktur Database LowDB (Updated)

Aplikasi menggunakan LowDB dengan struktur file terpisah untuk setiap collection:

```typescript
interface DatabaseSchema {
  collections: Record<string, string> // Path ke file collection
  _meta: {
    version: string
    createdAt: string
    lastModified: string
  }
}

interface CollectionData {
  documents: any[]
  _meta: {
    createdAt: string
    lastModified: string
  }
}
```

- **Struktur Terdistribusi**: Setiap collection memiliki file JSON terpisah
- **Pengembangan**: File database utama di `data/db.json`, collections di `data/*.json`
- **Produksi**: File disimpan di direktori data pengguna (userData)
- **Manajemen Collections**: Collections dibuat dan dikelola secara dinamis melalui ORPC

## 🔧 Implementasi ORPC (Updated)

### Server Side (Main Process) - Collection Router

```typescript
// src/service/orpc/router.ts
import { os } from '@orpc/server'
import * as z from 'zod'
import { CollectionRouter } from './collection.router'

export const oRPCRouter = {
  // Collection management operations
  collection: CollectionRouter,

  // Additional services can be added here
  utils: {
    // Utility functions
  }
}

export type oRPCRouter = typeof oRPCRouter
```

### Client Side (Renderer Process) - Updated Usage

```typescript
// Contoh penggunaan collection operations yang type-safe dengan ORPC
const collections = await orpc.collection.getAll.call()
const documents = await orpc.collection.document.getAll.call({
  collectionName: 'users'
})
const newDocument = await orpc.collection.document.create.call({
  collectionName: 'users',
  data: { name: 'John Doe', email: 'john@example.com' }
})
```

## 📦 Database Operations (Updated)

### Collection Management

```typescript
// Create new collection
await orpc.collection.create.call({
  name: 'students',
  label: 'Students',
  fields: [
    {
      name: 'nisn',
      type: 'string',
      label: 'NISN',
      validation: { required: true, length: 10 }
    },
    {
      name: 'name',
      type: 'string',
      label: 'Full Name',
      validation: { required: true, min: 2, max: 100 }
    }
  ],
  timestamps: true,
  softDelete: false
})

// Get all collections
const { collections } = await orpc.collection.getAll.call()

// Delete collection
await orpc.collection.delete.call({ collectionName: 'old_collection' })
```

### Document Operations

```typescript
// CRUD operations dengan type-safe validation
const result = await orpc.collection.document.create.call({
  collectionName: 'students',
  data: {
    nisn: '1234567890',
    name: 'John Doe',
    age: 18,
    grade: 'XII'
  }
})

const students = await orpc.collection.document.getAll.call({
  collectionName: 'students',
  limit: 10,
  offset: 0
})

const student = await orpc.collection.document.getById.call({
  collectionName: 'students',
  id: 'student-123'
})

await orpc.collection.document.update.call({
  collectionName: 'students',
  id: 'student-123',
  data: { grade: 'XII-A' }
})

await orpc.collection.document.delete.call({
  collectionName: 'students',
  id: 'student-123'
})
```

### Advanced Query Operations

```typescript
// Query dengan filter
const results = await orpc.collection.document.find.call({
  collectionName: 'students',
  query: { grade: 'XII', age: { $gte: 18 } }
})

// Pagination
const page = await orpc.collection.document.paginate.call({
  collectionName: 'students',
  page: 2,
  limit: 20,
  query: { grade: 'XII' }
})

// Count documents
const count = await orpc.collection.document.count.call({
  collectionName: 'students',
  query: { grade: 'XII' }
})
```

## 🎯 Integration dengan TanStack Query (Updated)

### Query Hooks untuk Collections

```typescript
// Custom hooks untuk collection operations
export const useCollections = () => {
  return useQuery(
    orpc.collection.getAll.queryOptions()
  )
}

export const useCollectionDocuments = (collectionName: string, query?: object) => {
  return useQuery(
    orpc.collection.document.getAll.queryOptions({
      input: { collectionName, ...(query && { query }) }
    })
  )
}

export const useCollectionDocument = (collectionName: string, id: string) => {
  return useQuery(
    orpc.collection.document.getById.queryOptions({
      input: { collectionName, id }
    })
  )
}

export const useCreateDocument = (collectionName: string) => {
  const queryClient = useQueryClient()

  return useMutation(
    orpc.collection.document.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.collection.document.getAll.key({ collectionName })
        })
      }
    })
  )
}
```

### Mutation Hooks dengan Optimistic Updates

```typescript
export const useUpdateDocument = (collectionName: string) => {
  const queryClient = useQueryClient()

  return useMutation(
    orpc.collection.document.update.mutationOptions({
      onMutate: async (variables) => {
        // Cancel outgoing queries
        await queryClient.cancelQueries({
          queryKey: orpc.collection.document.getById.key({
            collectionName,
            id: variables.id
          })
        })

        // Snapshot previous value
        const previousDocument = queryClient.getQueryData(
          orpc.collection.document.getById.queryKey({
            collectionName,
            id: variables.id
          })
        )

        // Optimistic update
        queryClient.setQueryData(
          orpc.collection.document.getById.queryKey({
            collectionName,
            id: variables.id
          }),
          (old: any) => ({ ...old, ...variables.data })
        )

        return { previousDocument }
      },
      onError: (error, variables, context) => {
        // Rollback on error
        queryClient.setQueryData(
          orpc.collection.document.getById.queryKey({
            collectionName,
            id: variables.id
          }),
          context?.previousDocument
        )
      },
      onSettled: (data, error, variables) => {
        // Invalidate queries setelah mutation
        queryClient.invalidateQueries({
          queryKey: orpc.collection.document.getById.key({
            collectionName,
            id: variables.id
          })
        })
      }
    })
  )
}
```

## 🔧 Error Handling dan Validation

```typescript
// Type-safe error handling
try {
  const result = await orpc.collection.document.create.call({
    collectionName: 'students',
    data: invalidData
  })
} catch (error) {
  if (isDefinedError(error)) {
    // Handle specific error types
    switch (error.name) {
      case 'ZodError':
        console.error('Validation failed:', error.details)
        break
      case 'CollectionNotFoundError':
        console.error('Collection does not exist')
        break
      case 'DocumentNotFoundError':
        console.error('Document not found')
        break
      default:
        console.error('Unknown error:', error.message)
    }
  }
}
```

## 📊 Backup dan Restore Operations

```typescript
// Backup database
const backupPath = await orpc.utils.backup.call()

// Restore dari backup
const success = await orpc.utils.restore.call(backupPath)

// Get database statistics
const stats = await orpc.utils.getStats.call()
```
