# AI Service Documentation

## Overview

AI Service adalah modul cerdas Zhidesk yang mengintegrasikan kemampuan Artificial Intelligence (Google Gemini) dengan sistem database. Modul ini menyediakan fitur generasi schema table, sample data, query generation, dan analisis data menggunakan natural language processing.

## Architecture

```
src/service/ai/
├── types.ts          # Schema Zod dan type definitions untuk AI
├── generator.ts      # AIGenerator - core AI engine dengan Google Gemini
├── database.ts       # AIDatabaseService - integrasi AI dengan database
├── router.ts         # ORPC router endpoints utama
├── database.router.ts # ORPC router khusus operasi database + AI
└── README.md         # Dokumentasi ini
```

## Core Components

### 1. AIGenerator (`generator.ts`)
Core AI engine yang berkomunikasi dengan Google Gemini API:

```typescript
const aiGenerator = new AIGenerator()
const result = await aiGenerator.generateText("Hello, world!")
```

### 2. AIDatabaseService (`database.ts`)
Service yang mengintegrasikan AI dengan database system:

```typescript
const aiService = AIDatabaseService.getInstance()
const tableSchema = await aiService.generateTableSchema("Create users table with email and name")
```

### 3. ORPC Routers (`router.ts`, `database.router.ts`)
Endpoint ORPC untuk komunikasi antara processes.

## AI Models Supported

- **gemini-2.5-flash**: Model Google Gemini yang cepat dan efisien

## Configuration

```typescript
const config = {
  model: 'gemini-2.5-flash',
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
  temperature: 0.7,
  maxTokens: 1024,
  topP: 0.9,
  topK: 40
}
```

## Features

### 1. Table Schema Generation
Generate complete table schema dari deskripsi natural language:

```typescript
const table = await aiService.generateTableSchema(
  "Create a users table with email, name, and role fields"
)
```

### 2. Sample Data Generation
Generate realistic sample data untuk table yang sudah ada:

```typescript
const sampleData = await aiService.generateSampleData(
  'users',
  'my-database',
  5 // jumlah records
)
```

### 3. Query Generation
Convert natural language queries ke database query objects:

```typescript
const query = await aiService.generateQuery(
  'my-database',
  'users',
  "Find all active users with role admin"
)
```

### 4. Data Analysis
Analisis data dan berikan insights:

```typescript
const analysis = await aiService.analyzeData(
  'my-database',
  'users'
)
```

### 5. Migration Script Generation
Generate migration scripts antara schema versions:

```typescript
const migrationScript = await aiService.generateMigration(oldTable, newTable)
```

## Basic AI Operations

### Text Generation
```typescript
const result = await aiGenerator.generateText(
  "Write a poem about databases",
  { temperature: 0.8 }
)
```

### Structured Object Generation
```typescript
const schema = z.object({
  name: z.string(),
  age: z.number()
})

const result = await aiGenerator.generateObject(
  "Generate a user profile",
  schema
)
```

### Multiple Objects Generation
```typescript
const result = await aiGenerator.generateObjects(
  "Generate user profiles",
  schema,
  3 // jumlah objects
)
```

## Integration dengan Database Service

AI Service terintegrasi sempurna dengan Database Service:

```typescript
// Generate schema dan langsung create table
const tableSchema = await aiService.generateTableSchema(description)
await databaseService.createDatabaseTable('my-db', tableSchema)

// Generate dan insert sample data
const sampleData = await aiService.generateSampleData('users', 'my-db', 10)
await databaseService.createMany('my-db', 'users', sampleData)
```

## ORPC Endpoints

### AI Database Operations
- `generateTableSchema` - Generate table schema dari deskripsi
- `generateSampleData` - Generate sample data untuk table
- `generateQuery` - Generate query dari natural language
- `analyzeData` - Analisis data dan berikan insights

### Basic AI Operations
- `generateText` - Generate text dari prompt
- `generateObject` - Generate structured object
- `generateObjects` - Generate multiple objects
- `updateAIConfig` - Update AI configuration
- `validateApiKey` - Validasi API key

## Example Usage

### 1. Generate Complete Table Schema
```typescript
const response = await orpc.ai.database.generateTableSchema.call({
  description: "Create products table with name, price, category, and stock quantity",
  options: {
    temperature: 0.3 // More deterministic output
  }
})

if (response.success) {
  await orpc.database.createTable.call({
    databaseId: 'my-shop',
    tableConfig: response.table
  })
}
```

### 2. Generate and Insert Sample Data
```typescript
// Generate sample data
const sampleResponse = await orpc.ai.database.generateSampleData.call({
  databaseId: 'my-shop',
  tableName: 'products',
  count: 10
})

if (sampleResponse.success) {
  // Insert ke database
  await orpc.database.createMany.call({
    databaseId: 'my-shop',
    tableName: 'products',
    data: sampleResponse.data
  })
}
```

### 3. Natural Language Query
```typescript
const queryResponse = await orpc.ai.database.generateQuery.call({
  databaseId: 'my-shop',
  tableName: 'products',
  naturalLanguageQuery: "Find all electronics products under $100"
})

if (queryResponse.success) {
  const products = await orpc.database.find.call({
    databaseId: 'my-shop',
    tableName: 'products',
    query: queryResponse.query
  })
}
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

## Best Practices

### 1. API Key Management
```typescript
// Validasi API key sebelum penggunaan
const validation = await orpc.ai.validateApiKey.call()
if (!validation.valid) {
  // Handle invalid API key
}
```

### 2. Temperature Settings
```typescript
// Untuk schema generation, gunakan temperature rendah
await aiService.generateTableSchema(description, { temperature: 0.3 })

// Untuk creative tasks, gunakan temperature lebih tinggi
await aiService.generateText(prompt, { temperature: 0.9 })
```

### 3. Error Handling
```typescript
try {
  const result = await aiService.generateTableSchema(description)
  if (!result.success) {
    throw new Error(result.error)
  }
  // Process result
} catch (error) {
  console.error('AI generation failed:', error)
}
```

## Limitations

1. **API Dependency**: Membutuhkan koneksi internet dan API key yang valid
2. **Token Limits**: Terbatas oleh maxTokens configuration
3. **Cost Considerations**: Penggunaan API mungkin incur costs
4. **Response Time**: Terdapat latency dalam komunikasi dengan AI service

## Future Enhancements

1. **Multiple AI Providers**: Support untuk OpenAI, Anthropic, dll
2. **Caching**: Cache responses untuk reduce API calls
3. **Rate Limiting**: Implement rate limiting untuk API calls
4. **Local Models**: Support untuk local AI models
5. **Batch Processing**: Batch operations untuk efficiency

## Environment Variables

```bash
GOOGLE_GENAI_API_KEY=your_api_key_here
```

## Testing

Test AI service dengan Vitest:

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { AIDatabaseService } from './database'

describe('AIDatabaseService', () => {
  let aiService: AIDatabaseService

  beforeEach(() => {
    aiService = AIDatabaseService.getInstance()
  })

  it('should generate valid table schema', async () => {
    const table = await aiService.generateTableSchema(
      "Create simple users table"
    )
    expect(table).toHaveProperty('name')
    expect(table).toHaveProperty('fields')
    expect(table.fields.length).toBeGreaterThan(0)
  })
})
```

## Security Considerations

1. **API Key Protection**: Jangan expose API keys di client-side code
2. **Input Validation**: Validasi semua input sebelum processing
3. **Error Handling**: Handle errors dengan proper tanpa expose sensitive information
4. **Rate Limiting**: Implement rate limiting untuk prevent abuse

---

Untuk pertanyaan atau issues, refer ke contoh usage atau buat issue di repository.
