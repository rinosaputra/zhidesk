# Zhidesk Copilot Instructions

## Project Overview
Zhidesk is a desktop low-code platform for building business applications rapidly via JSON configuration. It uses Electron (main process), React (renderer), TypeScript, Vite, LowDB (JSON file DB), ORPC (type-safe IPC), Zod (validation), Zustand (state), and TanStack Query (data fetching/caching).

## Architecture & Key Patterns
- **Electron Main/Renderer Separation**: `src/main` (Electron entry), `src/preload` (ORPC client), `src/renderer/src` (React UI)
- **Service Layer**: `src/service/database` (LowDB CRUD, schema validation, aggregation), `src/service/orpc` (ORPC routers)
- **Schema & Form Generation**: `src/schema/collection` (Zod schemas, DocGenerator), `src/schema/generator` (schema utilities)
- **Distributed Database**: Each collection is a separate JSON file in `data/`. Main DB metadata in `data/db.json`.
- **ORPC Communication**: All cross-process calls use ORPC routers (`src/service/orpc/router.ts`).
- **TypeScript Path Aliases**: Use aliases (`@service`, `_types`, `@schema`, `@`) for imports. See Vite config and tsconfig.*.json.

## Developer Workflows
- **Install**: `npm install`
- **Dev Mode**: `npm run dev` (Electron + Vite)
- **Build**: `npm run build`, `npm run build:main`, `npm run build:renderer`
- **Typecheck**: `npm run typecheck`
- **Lint/Format**: `npm run lint`, `npm run format`
- **Test**: `npm run test`, `npm run test:coverage`, or specific files (Vitest)
- **DatabaseService Usage**: See `src/service/database/README.md` for API and patterns (singleton, multi-db, schema validation, aggregation, full-text search)
- **ORPC Usage**: All DB and collection operations (CRUD, query, aggregation) are performed via ORPC calls from renderer to main. See `src/service/orpc/router.ts` and `src/renderer/src/lib/orpc-query.ts` for hooks and examples.
- **Schema Generation**: Use `DocGenerator` and helpers in `src/schema/collection/doc.class.ts` for Zod schema and default extraction.

## Project-Specific Conventions
- **Type Safety**: All layers use TypeScript and Zod for validation.
- **State Management**: Zustand for global state, TanStack Query for async data.
- **Error Handling**: Use type-safe error handling (see examples in README). Handle ZodError, CollectionNotFoundError, etc.
- **Testing**: Tests live alongside code in `__tests__` folders. Focus on schema, DB ops, error handling, and collection logic.
- **Backup/Restore**: Use ORPC utils for backup/restore (`orpc.utils.backup.call()`, etc).
- **Contributions**: Follow established structure, use aliases, add tests for new features, prefer distributed DB pattern.

## Integration Points
- **LowDB**: All data is stored in JSON files per collection. Main DB file is metadata only.
- **ORPC**: All IPC and service calls use ORPC routers. No direct IPC.
- **UI Components**: Use ChadcnUI, Tailwind, Lucide for UI. Reusable components in `src/renderer/src/components/ui`.

## Example: Create Collection via ORPC
```typescript
await orpc.collection.create.call({
  name: 'students',
  label: 'Students',
  fields: [ ... ],
  timestamps: true,
  softDelete: false
})
```

## Example: DatabaseService CRUD
```typescript
const db = DatabaseService.getInstance()
await db.create('my-db', 'users', { name: 'John' })
```

---
For unclear patterns or missing details, ask the user for clarification or examples from their workflow.
