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
├── database.json     # Metadata database (new)
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

Singleton class yang mengelola semua operasi database dengan struktur data yang dioptimasi:

```typescript
const db = DatabaseService.getInstance()

// Initialize database dengan metadata terpusat
await db.initializeDatabase('my-db', 'My Database', [userTable, postTable])

// CRUD operations dengan performa tinggi untuk operasi berdasarkan ID
await db.create('my-db', 'users', { email: 'user@example.com', age: 25 })
const user = await db.findById('my-db', 'users', 'document-id') // O(1) operation
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

## Struktur Data Baru & Optimasi

### Struktur File yang Dioptimasi

**Format Lama (Array):**

```json
[
  {
    "_id": "uuid-1",
    "email": "user@example.com",
    "name": "John Doe"
  },
  {
    "_id": "uuid-2",
    "email": "admin@example.com",
    "name": "Jane Smith"
  }
]
```

**Format Baru (Object dengan ID sebagai Key):**

```json
{
  "uuid-1": {
    "_id": "uuid-1",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "uuid-2": {
    "_id": "uuid-2",
    "email": "admin@example.com",
    "name": "Jane Smith"
  }
}
```

### Keuntungan Struktur Baru

1. **Pencarian Berdasarkan ID**: Operasi `findById()` sekarang O(1) - sangat cepat
2. **Update Efisien**: Update berdasarkan ID langsung mengakses key yang spesifik
3. **Delete Optimal**: Delete berdasarkan ID langsung menghapus key
4. **Konsistensi Data**: Struktur storage sama dengan struktur memory

### Metadata Terpusat

File `data/database.json` menyimpan metadata semua database:

```json
{
  "my-app": {
    "name": "My Application",
    "version": 1,
    "tables": [...],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
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

### CRUD Operations (Dioptimasi)

- `create()` - Insert single document (otomatis generate UUID)
- `createMany()` - Insert multiple documents dengan batch processing
- `find()` - Query documents dengan filter (konversi ke array untuk filtering)
- `findOne()` - Find single document
- `findById()` - **O(1)** Find by ID - sangat cepat
- `update()` - **O(1)** Update single document berdasarkan ID
- `updateMany()` - Update multiple documents
- `delete()` - **O(1)** Delete single document (soft/hard delete)
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

## Performance Characteristics

| Operation    | Complexity | Keterangan                              |
| ------------ | ---------- | --------------------------------------- |
| `findById()` | O(1)       | Langsung akses melalui key              |
| `update()`   | O(1)       | Langsung akses melalui key              |
| `delete()`   | O(1)       | Langsung akses melalui key              |
| `find()`     | O(n)       | Perlu konversi ke array untuk filtering |
| `create()`   | O(1)       | Insert dengan key yang sudah diketahui  |

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

### 1. Initialize Database dengan Metadata

```typescript
import { DatabaseService } from './service'
import { exampleUserTable, examplePostTable } from './examples'

const db = DatabaseService.getInstance()

// Check metadata terpusat
const exists = await db.databaseExists('my-app')
if (!exists) {
  await db.initializeDatabase('my-app', 'My Application', [exampleUserTable, examplePostTable])
}
```

### 2. Create Document dengan Auto-ID

```typescript
// ID akan digenerate otomatis jika tidak disediakan
const user = await db.create('my-app', 'users', {
  email: 'john@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'user',
  isActive: true
})

console.log(user._id) // UUID yang digenerate otomatis
```

### 3. Query Documents dengan Performa Tinggi

```typescript
// Operasi sangat cepat - O(1)
const user = await db.findById('my-app', 'users', 'specific-user-id')

// Operasi regular - O(n)
const activeUsers = await db.find('my-app', 'users', {
  isActive: true,
  role: 'user'
})

// Search dengan full-text
const results = await db.search('my-app', 'users', 'john', ['firstName', 'lastName', 'email'])
```

### 4. Update dan Delete yang Efisien

```typescript
// Update sangat cepat - O(1)
const updatedUser = await db.update('my-app', 'users', 'user-id', {
  isActive: false
})

// Delete sangat cepat - O(1)
const deleted = await db.delete('my-app', 'users', 'user-id')
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

### 1. Database Initialization dengan Metadata

```typescript
// Selalu gunakan databaseExists() yang memeriksa metadata terpusat
const exists = await db.databaseExists('my-app')
if (!exists) {
  await db.initializeDatabase('my-app', 'My App', tables)
}
```

### 2. Gunakan findById() untuk Operasi Berdasarkan ID

```typescript
// ✅ Recommended - Sangat cepat
const user = await db.findById('my-app', 'users', id)

// ❌ Avoid - Lebih lambat
const users = await db.find('my-app', 'users', { _id: id })
const user = users[0]
```

### 3. Validation sebelum Operasi

```typescript
// Selalu validate data sebelum operasi
try {
  const validated = generator.validateData('users', data)
  await db.create('my-app', 'users', validated)
} catch (error) {
  // Handle validation error
}
```

### 4. Error Handling untuk Operasi Critical

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

## Testing

Test modul database dengan Vitest:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { DatabaseService } from './service'

describe('DatabaseService', () => {
  let db: DatabaseService

  beforeEach(() => {
    db = DatabaseService.getInstance()
  })

  afterEach(async () => {
    await db.closeDatabase('test')
  })

  it('should initialize database dengan metadata', async () => {
    await db.initializeDatabase('test', 'Test DB', [])
    expect(await db.databaseExists('test')).toBe(true)
  })

  it('should perform O(1) findById operations', async () => {
    await db.initializeDatabase('test', 'Test DB', [])
    const user = await db.create('test', 'users', { name: 'Test User' })

    // This should be very fast
    const foundUser = await db.findById('test', 'users', user._id!)
    expect(foundUser?.name).toBe('Test User')
  })
})
```

## Backup & Restore

Gunakan ORPC utilities untuk backup/restore:

```typescript
// Backup database (termasuk metadata)
await orpc.utils.backup.call({ databaseId: 'my-app' })

// Restore database
await orpc.utils.restore.call({ databaseId: 'my-app', backupData })
```

## Integration dengan ORPC

Semua operations tersedia melalui ORPC router dengan performa yang dioptimasi:

```typescript
// Dari renderer process
const response = await orpc.database.findById.call({
  databaseId: 'my-app',
  tableName: 'users',
  id: 'user-id'
})

if (response.success) {
  const user = response.document
  // Process data dengan cepat
}
```

## Limitations

1. **File-based**: Storage menggunakan JSON files, tidak suitable untuk very large datasets
2. **In-memory**: Data di-load ke memory, perlu consider memory usage untuk large datasets
3. **Single process**: Tidak support concurrent writes dari multiple processes
4. **Query Operations**: Operasi find() masih O(n) karena perlu konversi ke array

## Future Enhancements

1. **Indexing**: Support untuk advanced indexing strategies
2. **Transactions**: Atomic operations across multiple collections
3. **Migration**: Schema migration utilities
4. **Replication**: Multi-database replication
5. **Caching**: Query result caching untuk performance
6. **Secondary Indexes**: Index untuk field selain \_id

---

Untuk pertanyaan atau issues, refer ke contoh di `examples.ts` atau buat issue di repository.
