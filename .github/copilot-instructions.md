# Copilot Instructions for Zhidesk

## Project Overview
Zhidesk is a desktop low-code platform for building business applications rapidly via JSON configuration. It uses Electron (main process), React (renderer), TypeScript, Vite, LowDB (local JSON DB), ORPC (type-safe IPC), Zod (validation), Zustand (state), and TanStack Query (async data).

## Architecture & Key Patterns
- **Electron Main Process**: Entry at `src/main/main.ts`. Handles app lifecycle and backend logic.
- **Preload Script**: `src/preload/index.ts` exposes ORPC client for secure IPC between renderer and main.
- **Renderer (Frontend)**: React app in `src/renderer/src/`. UI components in `components/ui/`, pages in `pages/`, state in `stores/`, hooks in `hooks/`, and utilities in `lib/`.
- **Service Layer**: `src/service/database/lowdb.ts` for LowDB operations. ORPC routers in `src/service/orpc/` (`router.ts`, `collection.router.ts`) define IPC endpoints.
- **Schema & Generators**: Zod schemas and document generators in `src/schema/collection/` and `src/schema/generator/`. Form, Zod, and PDF generators in `src/generators/`.
- **Data Storage**: JSON files in `/data` (e.g., `db.json`, `users.json`). Each collection is a separate file.

## Developer Workflows
- **Build**: Use Vite for renderer (`npm run build:web`) and Electron Builder for packaging (`npm run build:electron`).
- **Start**: `npm run dev` launches Electron with live reload.
- **Test**: Schema tests in `src/schema/collection/__tests__/`. Use `npm test` or run test files directly.
- **Debug**: Main process: debug via Electron; Renderer: use React/Vite dev tools.

## Conventions & Patterns
- **UI Components**: Use `components/ui/` for reusable UI, following ChadcnUI style.
- **State Management**: Use Zustand stores in `stores/`. TanStack Query for async data and caching.
- **IPC/ORPC**: All cross-process calls use ORPC routers. Define endpoints in `src/service/orpc/` and call via preload client.
- **Validation**: Zod schemas generated from JSON config. See `src/schema/generator/` and `src/schema/collection/doc.ts`.
- **Data Model**: Collections are defined by JSON schema and stored as separate files in `/data`.

## Integration Points
- **LowDB**: All DB operations go through `src/service/database/lowdb.ts`.
- **ORPC**: IPC endpoints in `src/service/orpc/`. Preload exposes client to renderer.
- **PDF Generation**: Use `src/generators/pdfGenerator.ts` for reports.

## Examples
- Add a new collection: Define schema in `src/schema/collection/`, add to `/data`, update ORPC router.
- Add a UI component: Place in `src/renderer/src/components/ui/`, export and use in pages.
- Add a validation: Update Zod schema generator in `src/schema/generator/`.

## References
- `README.md` for architecture and file layout
- `src/service/orpc/router.ts` for IPC endpoints
- `src/service/database/lowdb.ts` for DB logic
- `src/schema/collection/doc.class.ts` for document generation

---
For unclear or missing conventions, ask for clarification or check the README and service/router files.
