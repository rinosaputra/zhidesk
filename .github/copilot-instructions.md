# Copilot Instructions for Zhidesk

## Project Overview
Zhidesk is a low-code desktop platform for building business applications via JSON configuration. It uses Electron (main process), React (renderer), TypeScript, Vite, LowDB, Zustand, ORPC, Zod, and TanStack Query. The architecture is modular, with clear separation between UI, service, schema, and data layers.

## Key Architectural Patterns
- **Electron Main/Renderer Separation**: `src/main/` (Electron entry), `src/preload/` (ORPC client), `src/renderer/` (React UI)
- **Service Layer**: `src/service/database/` (LowDB operations, singleton pattern), `src/service/orpc/` (ORPC routers for IPC)
- **Schema System**: `src/schema/database/` (Zod-based schema, type safety, factories, generators)
- **UI Components**: `src/renderer/src/components/` (reusable UI, ChadcnUI conventions)
- **State Management**: Zustand stores in `src/renderer/src/stores/`, TanStack Query for async data

## Developer Workflows
- **Build**: Use Vite (`npm run build`) for renderer, Electron for desktop packaging
- **Test**: Vitest for unit tests (`npm test`), tests in `__tests__` folders
- **Debug**: Electron/Vite dev mode (`npm run dev`), inspect main/renderer separately
- **Database**: LowDB file-based, each collection is a separate file; schema validation via Zod
- **IPC/Communication**: Use ORPC routers (`src/service/orpc/router.ts`) for type-safe main-renderer calls

## Project-Specific Conventions
- **JSON-Driven UI**: Forms, CRUD, and PDF generation are configured via JSON, not hardcoded
- **Schema Generation**: Use Zod and factory functions (`src/schema/database/factories.ts`) for schema and validation
- **Singleton Services**: DatabaseService is a singleton (`getInstance()`)
- **File Structure**: Keep UI, service, schema, and types separate; use barrel files for exports
- **Testing**: Place tests in `__tests__` folders next to implementation

## Integration Points
- **External Libraries**: LowDB, Zod, Zustand, TanStack Query, ChadcnUI
- **ORPC**: For IPC between Electron main and renderer
- **PDF Generation**: Via JSON templates

## Examples
- **Database Initialization**:
  ```typescript
  import { DatabaseService } from './src/service/database'
  const db = DatabaseService.getInstance()
  await db.initializeDatabase('my-db', 'My Database', [...])
  ```
- **Schema Creation**:
  ```typescript
  import { createTable, createStringField } from './src/schema/database/factories'
  const userTable = createTable({ ... })
  ```
- **ORPC Router Usage**:
  ```typescript
  import { oRPCRouter } from './src/service/orpc/router'
  await oRPCRouter.database.initializeDatabase({ ... })
  ```

## Key Files/Directories
- `src/main/`, `src/preload/`, `src/renderer/`
- `src/service/database/`, `src/service/orpc/`
- `src/schema/database/`
- `src/renderer/src/components/`, `src/renderer/src/stores/`

---
For unclear or missing conventions, ask the user for clarification or examples from their workflow.
