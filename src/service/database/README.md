# DatabaseService

Sebuah service database berbasis file yang menggunakan LowDB dengan fitur schema validation, query operations, dan aggregation pipeline.

## Fitur Utama

- ✅ **Singleton Pattern** - Instance tunggal untuk seluruh aplikasi
- ✅ **Multiple Databases** - Dukungan multiple databases dengan isolasi data
- ✅ **Schema Validation** - Validasi data berdasarkan schema yang didefinisikan
- ✅ **CRUD Operations** - Create, Read, Update, Delete operations
- ✅ **Query Operations** - Filtering, sorting, pagination
- ✅ **Aggregation Pipeline** - MongoDB-like aggregation pipeline
- ✅ **Full-text Search** - Pencarian teks across multiple fields
- ✅ **Type Safety** - TypeScript support dengan interface yang jelas

## Instalasi

```bash
npm install lodash lowdb
npm install -D @types/lodash
```

## Penggunaan Dasar

### Inisialisasi Database

```typescript
import { DatabaseService } from './src/service/database'

const databaseService = DatabaseService.getInstance()

// Inisialisasi database baru
await databaseService.initializeDatabase('my-db', 'My Database', [
  {
    name: 'users',
    fields: [
      { name: 'name', type: 'string', required: true },
      { name: 'email', type: 'string', required: true },
      { name: 'age', type: 'number' }
    ]
  }
])
```

### CRUD Operations

```typescript
// Create
const user = await databaseService.create('my-db', 'users', {
  name: 'John Doe',
  email: 'john@example.com',
  age: 30
})

// Read
const users = await databaseService.find('my-db', 'users', { age: { $gt: 25 } })
const user = await databaseService.findOne('my-db', 'users', { email: 'john@example.com' })

// Update
const updatedUser = await databaseService.update('my-db', 'users', 'user-id', { age: 31 })

// Delete
const deleted = await databaseService.delete('my-db', 'users', 'user-id')
```

### Query Operations

```typescript
// Dengan pagination dan sorting
const results = await databaseService.find(
  'my-db',
  'users',
  { department: 'IT' },
  {
    skip: 0,
    limit: 10,
    sort: { name: 1, age: -1 }
  }
)

// Pencarian teks
const searchResults = await databaseService.search('my-db', 'users', 'john', [
  'name',
  'email',
  'department'
])

// Aggregation
const pipeline = [
  { $match: { status: 'active' } },
  {
    $group: {
      _id: '$department',
      total: { $sum: 1 },
      avgAge: { $avg: '$age' }
    }
  }
]

const aggregationResult = await databaseService.aggregate('my-db', 'users', pipeline)
```

## API Reference

### Database Management

- `initializeDatabase(databaseId: string, databaseName: string, tables: any[])`: Inisialisasi database baru
- `databaseExists(databaseId: string)`: Cek apakah database exists
- `getAllDatabases()`: Get semua databases yang terdaftar
- `closeDatabase(databaseId: string)`: Tutup koneksi database

### CRUD Operations

- `create(databaseId: string, tableName: string, data: any)`: Create document baru
- `createMany(databaseId: string, tableName: string, items: any[])`: Create multiple documents
- `find(databaseId: string, tableName: string, query: any, options?: any)`: Find documents dengan query
- `findOne(databaseId: string, tableName: string, query: any)`: Find single document
- `findById(databaseId: string, tableName: string, id: string)`: Find document by ID
- `update(databaseId: string, tableName: string, id: string, data: any)`: Update document
- `updateMany(databaseId: string, tableName: string, query: any, update: any)`: Update multiple documents
- `delete(databaseId: string, tableName: string, id: string)`: Delete document
- `deleteMany(databaseId: string, tableName: string, query: any)`: Delete multiple documents

### Query Operations

- `count(databaseId: string, tableName: string, query: any)`: Count documents
- `distinct(databaseId: string, tableName: string, field: string, query: any)`: Get distinct values
- `exists(databaseId: string, tableName: string, query: any)`: Check if document exists
- `search(databaseId: string, tableName: string, searchTerm: string, fields: string[], options?: any)`: Full-text search

### Aggregation Pipeline

Supported stages:

- `$match` - Filter documents
- `$group` - Group documents
- `$sort` - Sort documents
- `$project` - Project fields
- `$skip` - Skip documents
- `$limit` - Limit documents
- `$unwind` - Unwind arrays
- `$lookup` - Join collections
- `$addFields` - Add computed fields

Supported operators dalam `$group`:

- `$sum` - Sum values
- `$avg` - Average values
- `$min` - Minimum value
- `$max` - Maximum value
- `$push` - Push to array
- `$addToSet` - Add to set
- `$first` - First value
- `$last` - Last value
- `$count` - Count documents

## Schema Definition

```typescript
const userTable = {
  name: 'users',
  fields: [
    { name: '_id', type: 'string', required: true },
    { name: 'name', type: 'string', required: true },
    { name: 'email', type: 'string', required: true, unique: true },
    { name: 'age', type: 'number', min: 0, max: 150 },
    { name: 'department', type: 'string', enum: ['IT', 'HR', 'Finance'] },
    { name: 'isActive', type: 'boolean', default: true },
    { name: 'createdAt', type: 'date', default: () => new Date() },
    { name: 'updatedAt', type: 'date' }
  ],
  indexes: [{ fields: ['email'], unique: true }, { fields: ['department', 'isActive'] }],
  softDelete: true
}
```

## Konfigurasi

### Base Data Path

Secara default, data disimpan di folder `data/`. Anda bisa mengubahnya dengan mengakses property private:

```typescript
// @ts-ignore
databaseService.baseDataPath = '/custom/data/path'
```

### Default Tables

Secara otomatis, setiap database akan memiliki tables:

- `users` - User table dengan basic fields
- `posts` - Post table untuk contoh

## Error Handling

Service ini melempar error dengan message yang jelas:

```typescript
try {
  await databaseService.create('my-db', 'users', {})
} catch (error) {
  console.error('Error:', error.message)
  // Contoh error: "Name is required", "Database my-db not initialized", dll.
}
```

## Performance Considerations

- **File-based**: Cocok untuk development dan small-scale applications
- **In-memory operations**: Semua operations dilakukan di memory untuk kecepatan
- **Automatic persistence**: Data secara otomatis disimpan ke file setelah operations
- **Batching**: Gunakan `createMany` untuk bulk operations

## Batasan

- Tidak designed untuk high-throughput production environments
- Tidak support transactions ACID
- Limited scalability untuk very large datasets
- File locking sederhana (potensi race conditions pada concurrent writes)

## Testing

```bash
# Run tests
npm test

# Run tests dengan coverage
npm run test:coverage

# Run tests dalam watch mode
npm run test:watch
```

## Contoh Lengkap

```typescript
import { DatabaseService } from './src/service/database'

async function example() {
  const dbService = DatabaseService.getInstance()

  // Initialize database
  await dbService.initializeDatabase('company', 'Company Database', [
    {
      name: 'employees',
      fields: [
        { name: 'name', type: 'string', required: true },
        { name: 'email', type: 'string', required: true },
        { name: 'department', type: 'string', required: true },
        { name: 'salary', type: 'number', min: 0 }
      ]
    }
  ])

  // Create employees
  await dbService.createMany('company', 'employees', [
    { name: 'Alice', email: 'alice@company.com', department: 'Engineering', salary: 80000 },
    { name: 'Bob', email: 'bob@company.com', department: 'Marketing', salary: 70000 },
    { name: 'Charlie', email: 'charlie@company.com', department: 'Engineering', salary: 90000 }
  ])

  // Query data
  const engineers = await dbService.find('company', 'employees', { department: 'Engineering' })

  // Aggregation
  const departmentStats = await dbService.aggregate('company', 'employees', [
    {
      $group: {
        _id: '$department',
        averageSalary: { $avg: '$salary' },
        employeeCount: { $sum: 1 }
      }
    },
    { $sort: { averageSalary: -1 } }
  ])

  console.log(departmentStats)
}

example().catch(console.error)
```

## License

MIT License - bebas untuk digunakan dalam project komersial dan open source.
