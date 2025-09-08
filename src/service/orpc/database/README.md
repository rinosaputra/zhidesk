# Database Router API Documentation

Sebuah RESTful API router yang komprehensif untuk mengelola database, tables, dan data operations menggunakan oRPC framework.

## 📋 Overview

Router ini menyediakan endpoint lengkap untuk:

- ✅ Database management (create, list, check existence)
- ✅ Table operations (schema management, creation)
- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ Query operations (search, filter, pagination)
- ✅ Aggregation operations (MongoDB-like pipeline)
- ✅ Advanced operations (distinct values, counting, existence checks)

## 🚀 Quick Start

### Installation

```bash
npm install @orpc/server zod
```

### Basic Usage

```typescript
import { oRPCRouter } from './src/service/orpc/router'

// Initialize database
const result = await oRPCRouter.database.initializeDatabase({
  databaseId: 'my-app',
  databaseName: 'My Application Database',
  tables: []
})

if (result.success) {
  console.log('Database initialized successfully')
}
```

## 📊 API Endpoints

### Database Management

#### 1. Get All Databases

```typescript
const result = await oRPCRouter.database.getAllDatabases()
// Returns: { success: boolean, databases: string[], error?: string }
```

#### 2. Check Database Existence

```typescript
const result = await oRPCRouter.database.databaseExists({
  databaseId: 'my-app'
})
// Returns: { success: boolean, exists: boolean, error?: string }
```

#### 3. Initialize Database

```typescript
const result = await oRPCRouter.database.initializeDatabase({
  databaseId: 'my-app',
  databaseName: 'My App Database',
  tables: [] // Optional table configurations
})
```

#### 4. Close Database

```typescript
const result = await oRPCRouter.database.closeDatabase({
  databaseId: 'my-app'
})
```

### Table Operations

#### 1. Get All Tables

```typescript
const result = await oRPCRouter.database.getTables({
  databaseId: 'my-app'
})
// Returns: { success: boolean, tables: any[], error?: string }
```

#### 2. Get Table Schema

```typescript
const result = await oRPCRouter.database.getTableSchema({
  databaseId: 'my-app',
  tableName: 'users'
})
```

#### 3. Create Table

```typescript
const result = await oRPCRouter.database.createTable({
  databaseId: 'my-app',
  tableConfig: {
    name: 'users',
    fields: [
      { name: 'email', type: 'string', required: true },
      { name: 'name', type: 'string', required: true }
    ]
  }
})
```

### CRUD Operations

#### 1. Create Document

```typescript
const result = await oRPCRouter.database.create({
  databaseId: 'my-app',
  tableName: 'users',
  data: {
    email: 'user@example.com',
    name: 'John Doe',
    age: 30
  }
})
```

#### 2. Find Documents

```typescript
const result = await oRPCRouter.database.find({
  databaseId: 'my-app',
  tableName: 'users',
  query: { age: { $gt: 25 } },
  options: {
    limit: 10,
    skip: 0,
    sort: { name: 1 }
  }
})
```

#### 3. Find One Document

```typescript
const result = await oRPCRouter.database.findOne({
  databaseId: 'my-app',
  tableName: 'users',
  query: { email: 'user@example.com' }
})
```

#### 4. Find by ID

```typescript
const result = await oRPCRouter.database.findById({
  databaseId: 'my-app',
  tableName: 'users',
  id: 'user-123'
})
```

#### 5. Update Document

```typescript
const result = await oRPCRouter.database.update({
  databaseId: 'my-app',
  tableName: 'users',
  id: 'user-123',
  data: { age: 31 }
})
```

#### 6. Delete Document

```typescript
const result = await oRPCRouter.database.delete({
  databaseId: 'my-app',
  tableName: 'users',
  id: 'user-123'
})
```

### Batch Operations

#### 1. Create Multiple Documents

```typescript
const result = await oRPCRouter.database.createMany({
  databaseId: 'my-app',
  tableName: 'users',
  data: [
    { name: 'User 1', email: 'user1@example.com' },
    { name: 'User 2', email: 'user2@example.com' }
  ]
})
```

#### 2. Update Multiple Documents

```typescript
const result = await oRPCRouter.database.updateMany({
  databaseId: 'my-app',
  tableName: 'users',
  query: { status: 'active' },
  data: { lastLogin: new Date() }
})
```

#### 3. Delete Multiple Documents

```typescript
const result = await oRPCRouter.database.deleteMany({
  databaseId: 'my-app',
  tableName: 'users',
  query: { status: 'inactive' }
})
```

### Query Operations

#### 1. Count Documents

```typescript
const result = await oRPCRouter.database.count({
  databaseId: 'my-app',
  tableName: 'users',
  query: { status: 'active' }
})
// Returns: { success: boolean, count: number, error?: string }
```

#### 2. Distinct Values

```typescript
const result = await oRPCRouter.database.distinct({
  databaseId: 'my-app',
  tableName: 'users',
  field: 'department',
  query: { status: 'active' }
})
// Returns: { success: boolean, values: any[], error?: string }
```

#### 3. Check Existence

```typescript
const result = await oRPCRouter.database.exists({
  databaseId: 'my-app',
  tableName: 'users',
  query: { email: 'user@example.com' }
})
```

#### 4. Search Documents

```typescript
const result = await oRPCRouter.database.search({
  databaseId: 'my-app',
  tableName: 'users',
  searchTerm: 'john',
  fields: ['firstName', 'lastName', 'email'],
  options: {
    limit: 10,
    sort: { firstName: 1 }
  }
})
```

### Aggregation Operations

#### 1. Aggregate Pipeline

```typescript
const result = await oRPCRouter.database.aggregate({
  databaseId: 'my-app',
  tableName: 'orders',
  pipeline: [
    { $match: { status: 'completed' } },
    {
      $group: {
        _id: '$customerId',
        totalAmount: { $sum: '$amount' },
        orderCount: { $sum: 1 }
      }
    },
    { $sort: { totalAmount: -1 } }
  ]
})
```

## 🎯 Example Usage Scenarios

### 1. User Management System

```typescript
// Initialize users database
await oRPCRouter.database.initializeDatabase({
  databaseId: 'user-management',
  databaseName: 'User Management System',
  tables: [
    {
      name: 'users',
      fields: [
        { name: 'email', type: 'string', required: true, unique: true },
        { name: 'password', type: 'string', required: true },
        { name: 'firstName', type: 'string', required: true },
        { name: 'lastName', type: 'string', required: true },
        { name: 'role', type: 'enum', options: ['admin', 'user', 'moderator'] }
      ]
    }
  ]
})

// Create user
const user = await oRPCRouter.database.create({
  databaseId: 'user-management',
  tableName: 'users',
  data: {
    email: 'admin@example.com',
    password: 'hashed_password',
    firstName: 'John',
    lastName: 'Doe',
    role: 'admin'
  }
})

// Find admin users
const admins = await oRPCRouter.database.find({
  databaseId: 'user-management',
  tableName: 'users',
  query: { role: 'admin' }
})
```

### 2. E-commerce Analytics

```typescript
// Sales aggregation
const salesReport = await oRPCRouter.database.aggregate({
  databaseId: 'ecommerce',
  tableName: 'orders',
  pipeline: [
    { $match: { status: 'completed', date: { $gte: '2024-01-01' } } },
    {
      $group: {
        _id: { month: { $month: '$date' }, product: '$productId' },
        totalSales: { $sum: '$amount' },
        averageOrder: { $avg: '$amount' },
        orderCount: { $sum: 1 }
      }
    },
    { $sort: { totalSales: -1 } },
    { $limit: 10 }
  ]
})
```

### 3. Content Management System

```typescript
// Search articles
const articles = await oRPCRouter.database.search({
  databaseId: 'cms',
  tableName: 'articles',
  searchTerm: 'typescript',
  fields: ['title', 'content', 'tags'],
  options: {
    limit: 20,
    sort: { publishDate: -1 }
  }
})

// Get article statistics
const stats = await oRPCRouter.database.aggregate({
  databaseId: 'cms',
  tableName: 'articles',
  pipeline: [
    { $match: { status: 'published' } },
    {
      $group: {
        _id: '$category',
        articleCount: { $sum: 1 },
        totalViews: { $sum: '$views' },
        averageRating: { $avg: '$rating' }
      }
    }
  ]
})
```

## 🔧 Error Handling

Semua endpoint mengembalikan response dengan format konsisten:

```typescript
{
  success: boolean,    // true jika operasi berhasil
  data?: any,          // data hasil operasi (jika ada)
  error?: string       // message error (jika gagal)
}
```

Contoh error handling:

```typescript
try {
  const result = await oRPCRouter.database.create({
    databaseId: 'my-app',
    tableName: 'users',
    data: userData
  })

  if (!result.success) {
    console.error('Failed to create user:', result.error)
    return
  }

  console.log('User created:', result.document)
} catch (error) {
  console.error('Unexpected error:', error)
}
```

## 🛡️ Validation

Semua input divalidasi menggunakan Zod schema:

- Database ID: required string
- Table name: required string
- Document ID: required string (untuk operations yang membutuhkan ID)
- Query objects: optional any
- Data objects: required any

## 📈 Performance Tips

1. **Gunakan Projection**: Untuk large datasets, gunakan projection di query options
2. **Pagination**: Selalu gunakan limit dan skip untuk large result sets
3. **Indexing**: Buat indexes untuk fields yang sering di-query
4. **Batch Operations**: Gunakan createMany/updateMany untuk bulk operations
5. **Connection Pooling**: Reuse database connections

## 🔄 Response Examples

### Success Response

```json
{
  "success": true,
  "documents": [
    {
      "_id": "user-123",
      "name": "John Doe",
      "email": "john@example.com"
    }
  ]
}
```

### Error Response

```json
{
  "success": false,
  "error": "Database 'my-app' not initialized"
}
```

## 🚨 Common Errors

- `Database not initialized` - Database belum diinisialisasi
- `Table not found` - Table tidak ditemukan
- `Document not found` - Document tidak ditemukan
- `Validation failed` - Data validation gagal
- `Duplicate key` - Violation unique constraint

## 📚 Related Resources

- [oRPC Documentation](https://orpc.dev)
- [Zod Validation](https://zod.dev)
- [DatabaseService Documentation](./DATABASE_SERVICE_README.md)

---

**Note**: Router ini designed untuk work dengan `DatabaseService` yang menggunakan LowDB sebagai storage engine. Untuk production environments, consider menggunakan database yang lebih scalable.
