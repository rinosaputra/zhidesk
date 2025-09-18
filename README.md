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
![Google Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)

Platform desktop low-code untuk membangun aplikasi bisnis dengan cepat melalui konfigurasi JSON, dibangun dengan Electron, React, TypeScript, Vite, LowDB, ORPC, Zod, dan Google Gemini AI.

## ✨ Fitur Utama

- **🏗️ Low-Code Platform** - Bangun aplikasi dari konfigurasi JSON tanpa menulis kode manual
- **🤖 AI-Powered Development** - Generate schema, data, dan query dengan Google Gemini AI
- **📝 JSON-based UI Generator** - Hasilkan form dan antarmuka CRUD dari konfigurasi JSON
- **✅ JSON-based Zod Schema Generator** - Buat skema validasi otomatis dari konfigurasi
- **📊 JSON-based PDF Generator** - Hasilkan laporan PDF dari template JSON
- **💾 Database Lokal Terdistribusi** - Menggunakan LowDB dengan file terpisah untuk setiap collection
- **🔌 ORPC Communication** - Komunikasi type-safe antara proses main dan renderer
- **🎨 Modern UI** - Menggunakan ChadcnUI untuk antarmuka yang elegan
- **⚡ State Management** - Zustand untuk manajemen state yang efisien
- **🔄 TanStack Query** - State management dan caching untuk data asynchronous
- **🛡️ Type-Safe Validation** - Validasi data dengan Zod schema generation
- **🔍 Advanced Query & Filtering** - Dukungan untuk query kompleks dengan operator MongoDB-style
- **📈 Real-time Updates** - Sistem notifikasi dan pembaruan data secara real-time
- **🔐 Role-based Access Control** - Manajemen akses berbasis peran untuk keamanan data

## 🏗️ Arsitektur

Zhidesk mengikuti pola arsitektur modern dengan pemisahan tanggung jawab yang jelas:

```
zhidesk/
├── src/
│   ├── main/                 # Proses utama Electron
│   │   ├── main.ts          # Entry point Electron
│   │   ├── menu.ts          # Konfigurasi menu aplikasi
│   │   └── window.ts        # Manajemen window
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
│   │   │   ├── types/       # Type definitions
│   │   │   └── utils/       # Utility functions dan helpers
│   │   └── index.html       # Template HTML
│   ├── service/             # Service layer dan database operations
│   │   ├── ai/              # AI Service dengan Google Gemini integration
│   │   │   ├── types.ts     # Schema Zod dan type definitions
│   │   │   ├── generator.ts # AIGenerator - core AI engine
│   │   │   ├── database.ts  # AIDatabaseService - integrasi AI dengan database
│   │   │   ├── router.ts    # ORPC router endpoints utama
│   │   │   └── database.router.ts # ORPC router khusus operasi database + AI
│   │   ├── database/        # Database Service dengan performa tinggi
│   │   │   ├── types.ts     # Schema Zod dan type definitions
│   │   │   ├── factories.ts # Factory functions untuk field dan table
│   │   │   ├── generator.ts # DatabaseGenerator untuk schema generation
│   │   │   ├── service.ts   # DatabaseService - core implementation
│   │   │   ├── router.ts    # ORPC router endpoints
│   │   │   ├── examples.ts  # Contoh table configurations
│   │   │   └── utils.ts     # Utility functions untuk path management
│   │   └── orpc/            # ORPC router dan handlers
│   │       └── router.ts    # Main router definition
│   └── types/               # Definisi TypeScript bersama
├── data/                    # Penyimpanan data LowDB (JSON files)
│   ├── database.json       # Centralized metadata storage
│   ├── my-app/             # Database directory
│   │   ├── users.json      # Table file dengan struktur teroptimasi
│   │   └── products.json   # Table file dengan struktur teroptimasi
│   └── backups/            # Backup files
├── dist/                   # Direktori output build
├── build/                  # Sumber daya build
└── tests/                  # Test files dan fixtures
```

## 🚀 Memulai

### Prasyarat

- **Node.js** 18.0.0 atau lebih tinggi
- **npm**, **yarn**, atau **pnpm** sebagai package manager
- **Git** untuk kontrol versi
- **Google Gemini API Key** (opsional, untuk fitur AI)

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

3. **Setup environment**

   ```bash
   cp .env.example .env
   # Edit file .env dan tambahkan Google Gemini API key
   GOOGLE_GENAI_API_KEY=your_api_key_here
   ```

4. **Mulai mode pengembangan**
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

# Jalankan test dengan coverage
npm run test:coverage

# Jalankan test dalam watch mode
npm run test:watch

# Generate dokumentasi API
npm run docs

# Analisis bundle size
npm run analyze
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
- **Google Gemini AI** - AI-powered development dan data generation

### Manajemen State & Data

- **Zustand** - Solusi manajemen state minimalis dan efisien
- **TanStack Query** - State management dan caching untuk data asynchronous
- **React Hook Form** - Manajemen form dengan validasi

### UI & Komponen

- **Tailwind CSS** - Framework CSS utility-first
- **ChadcnUI** - Library komponen yang dirancang dengan indah
- **Lucide React** - Library ikon yang elegan
- **React Router DOM** - Routing untuk aplikasi single-page
- **React Table** - Tabel dengan fitur sorting, filtering, dan pagination

### AI Integration

- **Google Gemini API** - AI model untuk code generation dan data analysis
- **Custom AI Service** - Integrasi AI dengan database operations

### Build & Pengembangan

- **electron-vite** - Konfigurasi Vite yang dioptimalkan untuk Electron
- **@electron-toolkit** - Alat penting untuk pengembangan Electron
- **Vitest** - Testing framework yang cepat
- **Testing Library** - Utilities untuk testing React components
- **ESLint** - Linting untuk kode quality
- **Prettier** - Code formatting

## 🏗️ Fitur Database Terbaru

### Centralized Metadata System

Database service sekarang menggunakan sistem metadata terpusat dengan performa tinggi:

```typescript
// Initialize database dengan metadata terpusat
await db.initializeDatabase('my-app', 'My Application')

// Operasi findById() yang sangat cepat - O(1)
const user = await db.findById('my-app', 'users', 'specific-user-id')

// Struktur data teroptimasi dengan ID sebagai key
{
  "uuid-1": {
    "_id": "uuid-1",
    "email": "user@example.com",
    "name": "John Doe",
    "_createdAt": "2024-01-01T00:00:00.000Z",
    "_updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Performance Characteristics

| Operation    | Complexity | Keterangan                              |
| ------------ | ---------- | --------------------------------------- |
| `findById()` | O(1)       | Langsung akses melalui key              |
| `update()`   | O(1)       | Langsung akses melalui key              |
| `delete()`   | O(1)       | Langsung akses melalui key              |
| `find()`     | O(n)       | Perlu konversi ke array untuk filtering |
| `create()`   | O(1)       | Insert dengan key yang sudah diketahui  |

## 🤖 Integrasi AI dengan Google Gemini

Zhidesk sekarang memiliki integrasi AI yang powerful dengan Google Gemini:

### AI-Powered Schema Generation

```typescript
// Generate table schema dari deskripsi natural language
const tableSchema = await orpc.ai.database.generateTableSchema.call({
  description: 'Create products table with name, price, category, and stock quantity'
})

// Generate sample data yang realistic
const sampleData = await orpc.ai.database.generateSampleData.call({
  databaseId: 'my-shop',
  tableName: 'products',
  count: 10
})
```

### Natural Language Query

```typescript
// Query database menggunakan natural language
const queryResponse = await orpc.ai.database.generateQuery.call({
  databaseId: 'my-shop',
  tableName: 'products',
  naturalLanguageQuery: 'Find all electronics products under $100'
})
```

### AI Data Analysis

```typescript
// Dapatkan insights dari data yang ada
const analysis = await orpc.ai.database.analyzeData.call({
  databaseId: 'my-shop',
  tableName: 'products'
})
```

## 📦 Konfigurasi Pengembangan

### Environment Variables

Buat file `.env` untuk konfigurasi environment:

```env
# Application
VITE_APP_NAME=Zhidesk
VITE_APP_VERSION=1.0.0

# Database
VITE_DB_PATH=./data
VITE_BACKUP_PATH=./backups

# AI Configuration
GOOGLE_GENAI_API_KEY=your_api_key_here
VITE_AI_MODEL=gemini-2.5-flash
VITE_AI_TEMPERATURE=0.7

# Features
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_UPDATE_CHECK=true
VITE_ENABLE_AI=true

# Development
VITE_DEV_TOOLS=true
```

### Alias Path

**Alias Proses Utama:**

- `@service/*` → `src/service/*`
- `_types/*` → `src/types/*`
- `@main/*` → `src/main/*`

**Alias Proses Renderer:**

- `@/*` → `src/renderer/src/*`
- `@service/*` → `src/service/*`
- `_types/*` → `src/types/*`
- `@preload/*` → `src/preload/*`

## 🧪 Testing

Zhidesk menggunakan Vitest untuk testing dengan coverage yang komprehensif:

```bash
# Run semua tests
npm run test

# Run tests dengan coverage
npm run test:coverage

# Run tests dalam watch mode
npm run test:watch

# Run specific test file
npm run test -- src/service/database/__tests__/service.test.ts

# Run tests untuk AI service
npm run test -- src/service/ai/__tests__/generator.test.ts

# Run e2e tests
npm run test:e2e
```

Test suite mencakup:

- Schema generation dan validation
- AI integration dan text generation
- Database operations dengan performa tinggi
- Error handling dan validation
- UI component testing
- Integration tests untuk ORPC communication
- E2E tests dengan Playwright

## 📦 Membangun untuk Produksi

```bash
# Build aplikasi lengkap untuk current platform
npm run build

# Build untuk platform tertentu
npm run build:win
npm run build:mac
npm run build:linux

# Build hanya proses main
npm run build:main

# Build hanya proses renderer
npm run build:renderer

# Build untuk distribusi (installer)
npm run dist

# Aplikasi yang terbangun akan tersedia di dist/
```

## 🚀 Deployment

### Desktop Application

1. **Build aplikasi**:

   ```bash
   npm run build
   ```

2. **Distribusikan installer**:
   - Windows: `dist/zhidesk Setup 1.0.0.exe`
   - macOS: `dist/zhidesk-1.0.0.dmg`
   - Linux: `dist/zhidesk-1.0.0.AppImage`

### Update Mechanism

Zhidesk mendukung automatic updates:

```typescript
// Check for updates
const updateInfo = await orpc.app.checkForUpdates.call()

// Download and install updates
await orpc.app.downloadUpdate.call()
await orpc.app.installUpdate.call()

// Restart aplikasi
await orpc.app.restart.call()
```

## 🤝 Berkontribusi

Kami menyambut kontribusi dari komunitas! Berikut panduan untuk berkontribusi:

### Development Workflow

1. **Fork repository**
2. **Buat feature branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit changes**:
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push ke branch**:
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Buat Pull Request**

### Coding Standards

- Gunakan TypeScript strict mode
- Ikuti ESLint dan Prettier configuration
- Tulis tests untuk semua fitur baru
- Dokumentasikan kode dengan JSDoc
- Gunakan semantic commit messages
- Maintain consistency dengan existing codebase

### Area Kontribusi

- **AI Integration**: Tambahkan support untuk AI providers lainnya
- **Database Features**: Enhanced query capabilities dan performance optimizations
- **UI Components**: Komponen baru dan improvement existing components
- **Documentation**: Perbaikan dokumentasi dan contoh penggunaan
- **Testing**: Tambahan test coverage dan testing utilities

## 📄 Lisensi

Lisensi MIT - lihat file LICENSE untuk detailnya.

---

**Zhidesk** - Build Applications Faster with JSON Configuration and AI 🚀

Platform low-code desktop yang memungkinkan Anda membangun aplikasi bisnis dengan cepat melalui konfigurasi JSON dan AI-powered development, dengan fitur form generation, validasi otomatis, database teroptimasi, dan laporan PDF yang powerful.
