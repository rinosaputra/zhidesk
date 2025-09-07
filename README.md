# Zhidesk - Platform Low-Code Desktop

![Electron](https://img.shields.io/badge/Electron-47848F?style=for-the-badge&logo=electron&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![LowDB](https://img.shields.io/badge/LowDB-00D8FF?style=for-the-badge&logo=json&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-764ABC?style=for-the-badge&logo=redux&logoColor=white)
![ORPC](https://img.shields.io/badge/ORPC-FF6B35?style=for-the-badge&logo=json&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)

Platform desktop low-code untuk membangun aplikasi bisnis dengan cepat melalui konfigurasi JSON, dibangun dengan Electron, React, TypeScript, Vite, LowDB, ORPC, dan Zod.

## ✨ Fitur Utama

- **🏗️ Low-Code Platform** - Bangun aplikasi dari konfigurasi JSON tanpa menulis kode manual
- **📝 JSON-based UI Generator** - Hasilkan form dan antarmuka CRUD dari konfigurasi JSON
- **✅ JSON-based Zod Schema Generator** - Buat skema validasi otomatis dari konfigurasi
- **📊 JSON-based PDF Generator** - Hasilkan laporan PDF dari template JSON
- **💾 Database Lokal Terdistribusi** - Menggunakan LowDB dengan file terpisah untuk setiap collection
- **🔌 ORPC Communication** - Komunikasi type-safe antara proses main dan renderer
- **🎨 Modern UI** - Menggunakan ChadcnUI untuk antarmuka yang elegan
- **⚡ State Management** - Zustand untuk manajemen state yang efisien
- **🔄 TanStack Query** - State management dan caching untuk data asynchronous
- **🛡️ Type-Safe Validation** - Validasi data dengan Zod schema generation

## 🏗️ Arsitektur

Zhidesk mengikuti pola arsitektur modern dengan pemisahan tanggung jawab yang jelas:

```
zhidesk/
├── src/
│   ├── main/                 # Proses utama Electron
│   │   ├── main.ts          # Entry point Electron
│   ├── preload/
│   │   ├── index.ts         # Skrip preload dengan ORPC client
│   │   └── index.d.ts       # Type definitions untuk preload
│   ├── renderer/            # Aplikasi frontend React + TypeScript
│   │   ├── src/
│   │   │   ├── components/  # Komponen UI yang dapat digunakan kembali
│   │   │   ├── pages/       # Komponen halaman berdasarkan route
│   │   │   ├── hooks/       # Custom hooks (useORPC, useInvalidateQueries, dll)
│   │   │   ├── stores/      # State management dengan Zustand
│   │   │   ├── lib/         # Library dan utilities (ORPC, query client, dll)
│   │   │   └── types/       # Type definitions
│   │   └── index.html       # Template HTML
│   ├── service/             # Service layer dan database operations
│   │   ├── database/        # Service untuk operasi LowDB
│   │   ├── orpc/            # ORPC router dan handlers
│   │   │   ├── router.ts    # Main router definition
│   │   │   └── collection.router.ts # Collection management router
│   │   └── index.ts         # Barrel exports
│   ├── generators/          # Generator utilities
│   │   ├── formGenerator.ts # Generator UI form dari JSON
│   │   ├── zodSchemaGenerator.ts # Generator Zod schema dari JSON
│   │   └── pdfGenerator.ts  # Generator PDF dari JSON
│   ├── types/               # Definisi TypeScript bersama
│   └── schema/              # Skema validasi Zod dan DocGenerator
│       ├── collection/      # Schema collection system
│       │   ├── doc.ts       # Type definitions dan Zod schemas
│       │   ├── doc.class.ts # DocGenerator class implementation
│       │   └── __tests__/   # Test files untuk schema generation
│       └── generator/       # Zod generator utilities
├── data/                    # Penyimpanan data LowDB (JSON files)
│   ├── db.json             # Main database file (metadata)
│   ├── users.json          # Collection file untuk users
│   ├── settings.json       # Collection file untuk settings
│   └── *.json              # File collection lainnya
├── dist/                   # Direktori output build
└── build/                  # Sumber daya build
```

## 📦 Konfigurasi Pengembangan

### Konfigurasi TypeScript

Proyek menggunakan beberapa konfigurasi TypeScript:

- **`tsconfig.node.json`**: Konfigurasi proses utama dan skrip preload
- **`tsconfig.web.json`**: Konfigurasi proses renderer
- **Konfigurasi yang diperluas**: Dibangun di atas fondasi `@electron-toolkit/tsconfig`

### Konfigurasi Vite

Sistem build menggunakan electron-vite dengan konfigurasi yang dioptimalkan:

```typescript
// Alias dikonfigurasi untuk impor yang bersih:
{
  resolve: {
    alias: {
      '@': resolve(__dirname, './src/renderer'),
      '@service': resolve(__dirname, './src/service'),
      '_types': resolve(__dirname, './src/types'),
      '@schema': resolve(__dirname, './src/schema'),
    },
  },
}
```

### Alias Path

**Alias Proses Utama:**

- `@service/*` → `src/service/*`
- `_types/*` → `src/types/*`
- `@schema/*` → `src/schema/*`

**Alias Proses Renderer:**

- `@/*` → `src/renderer/src/*`
- `@service/*` → `src/service/*`
- `_types/*` → `src/types/*`
- `@schema/*` → `src/schema/*`

## 🚀 Memulai

### Prasyarat

- **Node.js** 18.0.0 atau lebih tinggi
- **npm**, **yarn**, atau **pnpm** sebagai package manager
- **Git** untuk kontrol versi

### Instalasi

1. **Clone repositori**

   ```bash
   git clone <url-repositori>
   cd zhidesk
   ```

2. **Instal dependensi**

   ```bash
   npm install
   ```

3. **Mulai mode pengembangan**
   ```bash
   npm run dev
   ```

### Skrip Pengembangan

```bash
# Mulai server pengembangan (Electron + Vite)
npm run dev

# Build untuk produksi
npm run build

# Build proses main
npm run build:main

# Build hanya proses renderer
npm run build:renderer

# Jalankan pengecekan tipe TypeScript
npm run typecheck

# Lint codebase
npm run lint

# Format kode dengan Prettier
npm run format

# Jalankan test suite
npm run test
```

## 🎯 Teknologi & Paket Utama

### Stack Inti

- **Electron** - Framework aplikasi desktop lintas platform
- **React 18** - Library UI dengan TypeScript dan hook modern
- **Vite** - Alat build dan server pengembangan yang cepat
- **TypeScript** - Keamanan tipe penuh di seluruh aplikasi
- **LowDB** - Database JSON dengan lodash untuk operasi data
- **ORPC** - Remote Procedure Call yang type-safe untuk komunikasi proses
- **Zod** - Validasi dan deklarasi skema TypeScript-first
- **TanStack Query** - State management dan caching untuk data asynchronous

### Manajemen State & Data

- **Zustand** - Solusi manajemen state minimalis dan efisien
- **TanStack Query** - State management dan caching untuk data asynchronous
- **React Hook Form** - Manajemen form dengan validasi
- **DocGenerator** - Generator Zod schema dari konfigurasi JSON

### UI & Komponen

- **Tailwind CSS** - Framework CSS utility-first
- **ChadcnUI** - Library komponen yang dirancang dengan indah
- **Lucide React** - Library ikon yang elegan

### Build & Pengembangan

- **electron-vite** - Konfigurasi Vite yang dioptimalkan untuk Electron
- **@electron-toolkit** - Alat penting untuk pengembangan Electron
- **Vitest** - Testing framework yang cepat

## 🔧 Zod Schema Generator

### DocGenerator Class

Zhidesk menyertakan sistem generasi schema Zod yang powerful melalui `DocGenerator`:

```typescript
import { DocGenerator, createStringSchema, createNumberSchema } from '@schema/collection/doc.class'

// Define schemas
const userSchemas = [
  createStringSchema({
    name: 'name',
    label: 'Full Name',
    coerce: true,
    validation: { min: 2, max: 100 }
  }),
  createNumberSchema({
    name: 'age',
    label: 'Age',
    coerce: true,
    validation: { min: 0, max: 120, int: true }
  })
]

// Create generator
const generator = new DocGenerator(userSchemas)

// Generate and use schemas
const nameSchema = generator.generate('name')
const ageSchema = generator.generate('age')

// Validate data
const validName = nameSchema.parse('John Doe')
const validAge = ageSchema.parse('25') // Coerced to number
```

### Supported Schema Types

- **String**: Text fields dengan validasi format (email, url, uuid, phone, password)
- **Number**: Numeric fields dengan range validation
- **Boolean**: True/false fields dengan coercion
- **Date**: Date fields dengan range validation
- **Enum**: Predefined value validation
- **Array**: Lists of items dengan validation
- **Object**: Nested structures dengan validation
- **Reference**: Relationship ke collections lain

### Collection Schema Generation

```typescript
import { createCollection, createObjectSchema } from '@schema/collection/doc.class'

// Define collection schema
const studentCollection = createCollection({
  name: 'students',
  label: 'Students',
  fields: [
    createStringSchema({
      name: 'nisn',
      label: 'NISN',
      validation: { length: 10, regex: '^\\d+$' }
    }),
    createStringSchema({
      name: 'name',
      label: 'Full Name',
      validation: { min: 2, max: 100 }
    })
  ],
  timestamps: true,
  softDelete: false
})

// Register and generate collection schema
generator.registerCollection(studentCollection)
const collectionSchema = generator.generateCollectionSchema('students')
```

### Default Values Extraction

```typescript
// Extract default values for forms
const defaults = generator.extractDefaults('student')

// Result:
{
  nisn: '',
  name: '',
  age: 0,
  isActive: false,
  birthDate: undefined,
  hobbies: [],
  address: {
    street: '',
    city: ''
  }
}
```

## 🔧 Implementasi ORPC

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

### Integration dengan TanStack Query

```typescript
// src/renderer/src/lib/orpc-query.ts
import { createTanstackQueryUtils } from '@orpc/tanstack-query'
import { getORPCClient } from './orpc-client'

export const orpc = createTanstackQueryUtils(getORPCClient(), {
  path: ['zhidesk', 'v1']
})

// Custom hooks untuk collection operations
export const useCollections = () => {
  return useQuery(
    orpc.collection.getAll.queryOptions()
  )
}
```

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

## 🔧 Database Operations (Updated)

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

## 🧪 Testing

Zhidesk menggunakan Vitest untuk testing dengan coverage yang komprehensif:

```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test -- src/schema/collection/__tests__/zod-generator.test.ts
```

Test suite mencakup:
- Schema generation dan validation
- Type inference dan coercion
- Default values extraction
- Collection schema generation
- Error handling dan messages
- Database operations dengan file terpisah

## 📦 Membangun untuk Produksi

```bash
# Build aplikasi lengkap
npm run build

# Build hanya proses main
npm run build:main

# Build hanya proses renderer
npm run build:renderer

# Aplikasi yang terbangun akan tersedia di dist/
```

## 🤝 Berkontribusi

1. Ikuti struktur proyek yang telah ditetapkan
2. Gunakan TypeScript dan alias path secara konsisten
3. Pertahankan keamanan tipe di semua lapisan
4. Gunakan ORPC untuk komunikasi antara proses
5. Manfaatkan Zustand untuk state management
6. Gunakan TanStack Query untuk data fetching
7. Tambahkan tests untuk fitur baru
8. Gunakan DocGenerator untuk schema validation
9. Ikuti pola database terdistribusi dengan file terpisah

## 📄 Lisensi

Lisensi MIT - lihat file LICENSE untuk detailnya.

---

**Zhidesk** - Build Applications Faster with JSON Configuration 🚀

Platform low-code desktop yang memungkinkan Anda membangun aplikasi bisnis dengan cepat melalui konfigurasi JSON, dengan fitur form generation, validasi otomatis, dan laporan PDF yang powerful.
