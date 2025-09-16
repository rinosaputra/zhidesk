# Copilot Instructions for Zhidesk

## Project Overview

- **Zhidesk** is a low-code desktop platform built with Electron, React, TypeScript, Vite, LowDB, ORPC, and Zod.
- The architecture separates main (Electron), preload, and renderer (React) processes, with clear service boundaries and type-safe communication via ORPC.

## Key Architectural Patterns

- **Service Layer**: All business logic and database operations are in `src/service/`. Database operations use LowDB with one JSON file per collection for distributed storage.
- **Schema Generation**: Use `DocGenerator` and Zod for type-safe schema validation. See `src/schema/collection/doc.class.ts` for examples.
- **ORPC Communication**: All cross-process calls (main <-> renderer) use ORPC routers, defined in `src/service/orpc/router.ts`. Always use type-safe calls (e.g., `orpc.database.document.create.call({...})`).
- **State Management**: Use Zustand and TanStack Query for frontend state and async data.

## Developer Workflows

- **Development**: Start with `npm run dev` (Electron + Vite).
- **Build**: Use `npm run build` for production, or `npm run build:main` / `npm run build:renderer` for partial builds.
- **Testing**: Run `npm run test` (Vitest). For coverage: `npm run test:coverage`. For specific files: `npm run test -- <path-to-test>`.
- **Lint/Format**: Use `npm run lint` and `npm run format`.

## Project-Specific Conventions

- **TypeScript Aliases**: Use aliases for imports (`@service/*`, `@schema/*`, `_types/*`, `@/*` for renderer).
- **Database Structure**: Collections are stored in separate JSON files under `data/`. Metadata is centralized in `data/db.json`.
- **Optimized Data Access**: Prefer `findById()` for O(1) lookups. Avoid filtering by `_id` using `find()` (O(n)).
- **Validation**: Always validate data with Zod schemas before database operations.
- **Error Handling**: All service/database responses use `{ success: boolean, error?: string }`. Handle errors explicitly.
- **Backup/Restore**: Use ORPC utilities (`orpc.utils.backup.call()`, `orpc.utils.restore.call()`).

## Integration Points

- **TanStack Query**: Use custom hooks for data fetching and mutation, e.g., `useCollections`, `useCreateDocument`.
- **UI Components**: Reusable components are in `src/renderer/src/components/`. Use Tailwind CSS and ChadcnUI for styling.

## Examples

- **Database Operations**: See `src/service/database/service.ts` and `src/service/database/README.md`.
- **ORPC Usage**: See `src/service/orpc/router.ts` and frontend hooks in `src/renderer/src/lib/orpc-query.ts`.

## Testing

- Tests are in `__tests__` folders, covering schema generation, validation, error handling, and database operations.

## Best Practices

- Follow the distributed database pattern (one file per collection).
- Use ORPC for all cross-process communication.
- Maintain type safety and validation at every layer.
- Add tests for new features and database logic.

---

**If any section is unclear or missing important details, please provide feedback or specify which workflows or patterns need further documentation.**
