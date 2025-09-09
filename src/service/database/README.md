# Database Service Documentation

## Overview

Database Service adalah modul utama Zhidesk yang menyediakan sistem database berbasis JSON dengan fitur lengkap untuk operasi CRUD, query, aggregation, dan validasi schema menggunakan Zod. Modul ini menggunakan LowDB sebagai storage engine dan menyediakan interface yang type-safe melalui ORPC.

## Architecture

```
src/service/database/
├── types.ts          # Schema Zod dan type definitions
├── factories.ts      # Factory functions untuk membuat field dan table
├── generator.ts      # DatabaseGenerator untuk schema generation dan validation
├── service.ts        # DatabaseService - core implementation
├── router.ts         # ORPC router endpoints
├── examples.ts       # Contoh table configurations
└── README.md         # Dokumentasi ini
```

## Core Components

### 1. Types & Schemas (`types.ts`)

Mendefinisikan semua Zod schemas dan TypeScript types untuk:

- Field types (String, Number, Boolean, Date, Enum, Reference, Array, Object)
- Table configuration
- Database metadata
- Input/Output schemas untuk ORPC operations
- Aggregation stages

### 2. Factory Functions (`factories.ts`)

Helper functions untuk membuat field dan table configurations dengan type safety:

```typescript
// Contoh penggunaan factories
const userTable = createTable({
  name: 'users',
  label: 'Users',
  fields: [
    createStringField({
      name: 'email',
      label: 'Email',
      required: true,
      validation: { format: 'email' }
    }),
    createNumberField({
      name: 'age',
      label: 'Age',
      validation: { min: 0 }
    })
  ]
})
```

### 3. Database Generator (`generator.ts`)

Class untuk generate Zod schemas dari table configuration dan validasi data:

```typescript
const generator = new DatabaseGenerator()
generator.registerTable(userTable)

// Generate schema untuk validasi
const userSchema = generator.generateTableSchema('users')

// Extract default values
const defaults = generator.extractDefaults('users')

// Validasi data
const validatedData = generator.validateData('users', userData)
```

### 4. Database Service (`service.ts`)

Singleton class yang mengelola semua operasi database:

```typescript
const db = DatabaseService.getInstance()

// Initialize database
await db.initializeDatabase('my-db', 'My Database', [userTable, postTable])

// CRUD operations
await db.create('my-db', 'users', { email: 'user@example.com', age: 25 })
const users = await db.find('my-db', 'users', { age: { $gt: 20 } })
```

### 5. ORPC Router (`router.ts`)

Endpoint ORPC untuk komunikasi antara main process dan renderer:

```typescript
// Contoh pemanggilan dari renderer
const result = await orpc.database.find.call({
  databaseId: 'my-db',
  tableName: 'users',
  query: { age: { $gt: 20 } }
})
```

## Field Types Supported

### Basic Fields

- **String**: Text data dengan validasi email, URL, UUID, etc.
- **Number**: Numeric data dengan validasi min/max, integer, positive
- **Boolean**: True/false values
- **Date**: Date values dengan validasi past/future
- **Enum**: Predefined options

### Complex Fields

- **Reference**: Relationship ke table lain
- **Array**: List of items (bisa nested)
- **Object**: Structured data dengan nested fields

## Operations

### CRUD Operations

- `create()` - Insert single document
- `createMany()` - Insert multiple documents
- `find()` - Query documents dengan filter
- `findOne()` - Find single document
- `findById()` - Find by ID
- `update()` - Update single document
- `updateMany()` - Update multiple documents
- `delete()` - Delete single document (soft/hard delete)
- `deleteMany()` - Delete multiple documents

### Query Operations

- `count()` - Count documents matching query
- `distinct()` - Get distinct values for field
- `exists()` - Check if document exists
- `search()` - Full-text search across multiple fields

### Aggregation Operations

Support MongoDB-like aggregation pipeline:

- `$match` - Filter documents
- `$group` - Group documents
- `$sort` - Sort documents
- `$project` - Project fields
- `$skip` - Skip documents
- `$limit` - Limit documents
- `$unwind` - Unwind arrays
- `$lookup` - Join with other collections
- `$addFields` - Add computed fields

## Validation Features

### Field-level Validation

```typescript
createStringField({
  name: 'email',
  validation: {
    format: 'email',
    min: 5,
    max: 255,
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
  }
})
```

### Table-level Validation

```typescript
createTable({
  name: 'users',
  validation: {
    strict: true, // Tidak allow additional properties
    additionalProperties: false
  }
})
```

## Example Usage

### 1. Initialize Database

```typescript
import { DatabaseService } from './service'
import { exampleUserTable, examplePostTable } from './examples'

const db = DatabaseService.getInstance()
await db.initializeDatabase('my-app', 'My Application', [exampleUserTable, examplePostTable])
```

### 2. Create Document

```typescript
const user = await db.create('my-app', 'users', {
  email: 'john@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'user',
  isActive: true
})
```

### 3. Query Documents

```typescript
// Find active users
const activeUsers = await db.find('my-app', 'users', {
  isActive: true,
  role: 'user'
})

// Search with full-text
const results = await db.search('my-app', 'users', 'john', ['firstName', 'lastName', 'email'])
```

### 4. Aggregation

```typescript
const pipeline = [
  { $match: { isActive: true } },
  {
    $group: {
      _id: '$role',
      count: { $sum: 1 },
      averageAge: { $avg: '$age' }
    }
  },
  { $sort: { count: -1 } }
]

const stats = await db.aggregate('my-app', 'users', pipeline)
```

## Error Handling

Semua operations return response dengan format:

```typescript
{
  success: boolean;
  error?: string;
  // ... data lainnya
}
```

Handle errors dengan proper error checking:

```typescript
const result = await db.find('my-app', 'users', query)
if (!result.success) {
  console.error('Error:', result.error)
  // Handle error
}
```

## Best Practices

### 1. Database Initialization

```typescript
// Check jika database sudah ada sebelum initialize
const exists = await db.databaseExists('my-app')
if (!exists) {
  await db.initializeDatabase('my-app', 'My App', tables)
}
```

### 2. Validation

```typescript
// Selalu validate data sebelum operasi
try {
  const validated = generator.validateData('users', data)
  await db.create('my-app', 'users', validated)
} catch (error) {
  // Handle validation error
}
```

### 3. Error Handling

```typescript
// Gunakan try-catch untuk operations yang critical
try {
  const result = await db.update('my-app', 'users', id, updateData)
  if (!result.success) {
    throw new Error(result.error)
  }
} catch (error) {
  // Handle error appropriately
}
```

### 4. Performance

- Gunakan indexing untuk field yang sering di-query
- Gunakan projection untuk hanya mengambil field yang diperlukan
- Batasi hasil query dengan `limit` untuk large datasets

## Testing

Test modul database dengan Vitest:

```typescript
import { describe, it, expect } from 'vitest'
import { DatabaseService } from './service'

describe('DatabaseService', () => {
  it('should initialize database', async () => {
    const db = DatabaseService.getInstance()
    await db.initializeDatabase('test', 'Test DB', [])
    expect(await db.databaseExists('test')).toBe(true)
  })
})
```

## Backup & Restore

Gunakan ORPC utilities untuk backup/restore:

```typescript
// Backup database
await orpc.utils.backup.call({ databaseId: 'my-app' })

// Restore database
await orpc.utils.restore.call({ databaseId: 'my-app', backupData })
```

## Integration dengan ORPC

Semua operations tersedia melalui ORPC router:

```typescript
// Dari renderer process
const response = await orpc.database.find.call({
  databaseId: 'my-app',
  tableName: 'users',
  query: { isActive: true }
})

if (response.success) {
  const users = response.documents
  // Process data
}
```

## Limitations

1. **File-based**: Storage menggunakan JSON files, tidak suitable untuk very large datasets
2. **In-memory**: Data di-load ke memory, perlu consider memory usage untuk large datasets
3. **Single process**: Tidak support concurrent writes dari multiple processes

## Future Enhancements

1. **Indexing**: Support untuk advanced indexing strategies
2. **Transactions**: Atomic operations across multiple collections
3. **Migration**: Schema migration utilities
4. **Replication**: Multi-database replication
5. **Caching**: Query result caching untuk performance

---

Untuk pertanyaan atau issues, refer ke contoh di `examples.ts` atau buat issue di repository.
