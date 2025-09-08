# Database Schema System

Sebuah sistem schema database yang lengkap dengan type safety, validation, dan generator untuk aplikasi TypeScript. Sistem ini menggunakan Zod untuk validation dan mendukung berbagai tipe field dengan fitur lengkap.

## Fitur Utama

- ✅ **Type Safety** - Full TypeScript support dengan interface yang jelas
- ✅ **Zod Validation** - Validation yang powerful dengan Zod schema
- ✅ **Multiple Field Types** - Support berbagai tipe field (string, number, boolean, date, enum, reference, array, object)
- ✅ **Factory Functions** - Helper functions untuk membuat schema dengan mudah
- ✅ **Recursive Schema** - Support untuk nested objects dan arrays
- ✅ **Default Values** - Automatic default value generation
- ✅ **Timestamps** - Automatic timestamp management
- ✅ **Soft Delete** - Support soft delete functionality
- ✅ **Relationship** - Reference fields untuk relational data

## Instalasi

```bash
npm install zod
npm install -D @types/zod
```

## Struktur File

```
src/schema/database/
├── types.ts          # Type definitions dan Zod schemas
├── factories.ts      # Factory functions untuk membuat field dan table
├── generator.ts      # Database schema generator dan validator
└── examples.ts       # Contoh implementasi
```

## Penggunaan Dasar

### Membuat Table Schema

```typescript
import { createTable, createStringField, createNumberField, createEnumField } from './factories'

const userTable = createTable({
  name: 'users',
  label: 'Users',
  description: 'User accounts table',
  timestamps: true,
  softDelete: true,
  fields: [
    createStringField({
      name: 'email',
      label: 'Email Address',
      required: true,
      unique: true,
      validation: {
        format: 'email',
        max: 255
      }
    }),
    createStringField({
      name: 'firstName',
      label: 'First Name',
      required: true,
      validation: {
        min: 2,
        max: 50
      }
    }),
    createEnumField({
      name: 'role',
      label: 'User Role',
      options: ['admin', 'user', 'moderator'],
      default: 'user'
    })
  ]
})
```

### Menggunakan Database Generator

```typescript
import { DatabaseGenerator } from './generator'

// Initialize generator
const generator = new DatabaseGenerator({
  name: 'my-app-database',
  version: 1,
  tables: [userTable, postTable]
})

// Generate schema untuk table
const userSchema = generator.generateTableSchema('users')

// Validate data
try {
  const validUser = generator.validateData('users', {
    email: 'user@example.com',
    firstName: 'John',
    role: 'user'
  })
  console.log('Valid user:', validUser)
} catch (error) {
  console.error('Validation error:', error.errors)
}

// Extract default values
const defaults = generator.extractDefaults('users')
console.log('Default values:', defaults)
```

## Tipe Field yang Didukung

### 1. String Field

```typescript
createStringField({
  name: 'title',
  label: 'Post Title',
  required: true,
  validation: {
    min: 5,
    max: 200,
    format: 'email' // 'email' | 'url' | 'uuid' | 'phone' | 'password'
  }
})
```

### 2. Number Field

```typescript
createNumberField({
  name: 'age',
  label: 'Age',
  validation: {
    min: 0,
    max: 150,
    integer: true
  }
})
```

### 3. Boolean Field

```typescript
createBooleanField({
  name: 'isActive',
  label: 'Active Status',
  default: true
})
```

### 4. Date Field

```typescript
createDateField({
  name: 'birthDate',
  label: 'Birth Date',
  validation: {
    past: true
  }
})
```

### 5. Enum Field

```typescript
createEnumField({
  name: 'status',
  label: 'Status',
  options: ['pending', 'approved', 'rejected'],
  default: 'pending'
})
```

### 6. Reference Field (Relationship)

```typescript
createReferenceField({
  name: 'authorId',
  label: 'Author',
  reference: {
    tableName: 'users'
  },
  required: true
})
```

### 7. Array Field

```typescript
createArrayField({
  name: 'tags',
  label: 'Tags',
  items: createStringField({
    name: 'tag',
    validation: { max: 20 }
  }),
  validation: {
    max: 10,
    unique: true
  }
})
```

### 8. Object Field

```typescript
createObjectField({
  name: 'address',
  label: 'Address',
  fields: [
    createStringField({ name: 'street', label: 'Street' }),
    createStringField({ name: 'city', label: 'City' }),
    createStringField({ name: 'zipCode', label: 'Zip Code' })
  ]
})
```

## Validation Features

### String Validation

- `min` / `max` - Panjang string
- `length` - Panjang exact
- `pattern` - Regex pattern
- `format` - Predefined formats (email, url, uuid, phone, password)
- `trim` - Auto trim

### Number Validation

- `min` / `max` - Range values
- `integer` - Harus integer
- `positive` / `nonnegative` - Value constraints
- `multipleOf` - Kelipatan tertentu

### Date Validation

- `min` / `max` - Date range
- `past` - Harus tanggal lalu
- `future` - Harus tanggal depan

### Array Validation

- `min` / `max` / `length` - Jumlah elements
- `unique` - Elements harus unique

## Contoh Lengkap

```typescript
import {
  createTable,
  createStringField,
  createNumberField,
  createBooleanField,
  createDateField,
  createEnumField,
  createReferenceField,
  createArrayField,
  createObjectField
} from './factories'

// User table
export const userTable = createTable({
  name: 'users',
  label: 'Users',
  timestamps: true,
  softDelete: true,
  fields: [
    createStringField({
      name: 'email',
      label: 'Email',
      required: true,
      unique: true,
      validation: { format: 'email' }
    }),
    createStringField({
      name: 'password',
      label: 'Password',
      required: true,
      hidden: true,
      validation: { format: 'password', min: 8 }
    }),
    createEnumField({
      name: 'role',
      label: 'Role',
      options: ['admin', 'user', 'moderator'],
      default: 'user'
    }),
    createBooleanField({
      name: 'isActive',
      label: 'Active',
      default: true
    })
  ]
})

// Post table dengan relationships
export const postTable = createTable({
  name: 'posts',
  label: 'Posts',
  timestamps: true,
  fields: [
    createStringField({
      name: 'title',
      label: 'Title',
      required: true,
      validation: { min: 5, max: 200 }
    }),
    createReferenceField({
      name: 'authorId',
      label: 'Author',
      reference: { tableName: 'users' },
      required: true
    }),
    createArrayField({
      name: 'tags',
      label: 'Tags',
      items: createStringField({ name: 'tag' }),
      validation: { max: 10 }
    }),
    createObjectField({
      name: 'metadata',
      label: 'Metadata',
      fields: [
        createNumberField({ name: 'wordCount', label: 'Word Count' }),
        createNumberField({ name: 'readTime', label: 'Read Time' })
      ]
    })
  ]
})

// Usage
const generator = new DatabaseGenerator({
  name: 'blog-database',
  tables: [userTable, postTable]
})

// Validate post data
const validPost = generator.validateData('posts', {
  title: 'My First Post',
  authorId: 'uuid-12345',
  tags: ['tech', 'programming'],
  metadata: {
    wordCount: 1500,
    readTime: 5
  }
})
```

## API Reference

### DatabaseGenerator

- `constructor(config: Partial<Database>)` - Initialize generator
- `registerTable(table: Table)` - Register table schema
- `getTable(tableName: string)` - Get table schema
- `generateTableSchema(tableName: string)` - Generate Zod schema
- `validateData(tableName: string, data: any)` - Validate data against schema
- `extractDefaults(tableName: string)` - Get default values for table

### Factory Functions

- `createTable(config: Table)` - Create table definition
- `createStringField(config)` - Create string field
- `createNumberField(config)` - Create number field
- `createBooleanField(config)` - Create boolean field
- `createDateField(config)` - Create date field
- `createEnumField(config)` - Create enum field
- `createReferenceField(config)` - Create reference field
- `createArrayField(config)` - Create array field
- `createObjectField(config)` - Create object field

## Error Handling

Sistem ini melempar error Zod yang detail ketika validation gagal:

```typescript
try {
  const data = generator.validateData('users', invalidData)
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('Validation errors:', error.errors)
    // Output: [{ path: ['email'], message: 'Invalid email', ... }]
  }
}
```

## Best Practices

1. **Gunakan Factory Functions** - Selalu gunakan factory functions untuk consistency
2. **Definisikan Validation** - Selalu tambahkan validation rules yang appropriate
3. **Gunakan Timestamps** - Enable timestamps untuk audit tracking
4. **Consider Soft Delete** - Gunakan soft delete untuk data recovery
5. **Handle Relationships** - Gunakan reference fields untuk relational data

## Contoh Output Validation Error

```json
{
  "errors": [
    {
      "path": ["email"],
      "message": "Invalid email address",
      "code": "invalid_string"
    },
    {
      "path": ["age"],
      "message": "Number must be greater than or equal to 0",
      "code": "too_small"
    }
  ]
}
```

## Development

```bash
# Run tests
npm test

# Build project
npm run build

# Run linting
npm run lint
```

## License

MIT License - bebas untuk digunakan dalam project komersial dan open source.
