# Repository Guidelines

## Project Structure & Module Organization

- `main.go`: Go backend (PocketBase) serving API and embedded frontend.
- `src/`: React + TypeScript app; `components/`, `pages/`, `lib/`, `store/`.
- `public/` → static assets; `dist/` → Vite build output (embedded by Go).
- `data/`: SQLite DB files (`data.db`) for PocketBase.
- `scripts/`: Bun scripts for seed/reset; `docs/` and `mock-data/` for examples.
- `pb_schema.json`: Collection schema imported on server start.

## Build, Test, and Development Commands

- Local dev (web+api): `bun run dev` (Vite on 5173, API on 8090 via Air).
- Frontend only: `bun run web:dev` | Preview: `bun run web:preview`.
- Backend only: `bun run api:dev` (Air) | Serve once: `bun run api:serve`.
- Build: `bun run build:all` (or `build:ui`, `build:api`).
- Quality: `bun run web:check` (typecheck+lint+format check), `web:lint:fix`, `web:format`.
- Data utilities: `bun run seed:generate`, `seed:run`, `seed:reset`.
- Typegen: `bun run api:typegen` (ensure DB path points to `./data/data.db`).

Prereqs: Bun 1.x, Go 1.24+, Node tooling installed (via Bun).

## Coding Style & Naming Conventions

- TypeScript strict mode; prefer explicit types for public APIs.
- React components: PascalCase exports; files kebab-case (e.g., `task-list-item.tsx`).
- Use path alias `@/` (see `tsconfig` and `vite.config.ts`).
- Formatting: Prettier (+ Tailwind plugin). Linting: ESLint (TS + React Hooks).
- Indentation: 2 spaces; avoid default exports for shared utilities.

## Testing Guidelines

- No test runner configured yet. Use `bun run web:check` and manual smoke tests.
- If adding tests: prefer Vitest + React Testing Library; co-locate as `*.test.ts(x)`.
- Aim to cover business logic in `src/lib/*` and critical components.

## Commit & Pull Request Guidelines

- Use Conventional Commits: `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`.
  Example: `feat(tasks): add drag-and-drop reordering`.
- PRs: clear description, linked issues, test/QA steps, and screenshots/GIFs for UI.
- Run `bun run web:check` and `bun run build:all` before opening a PR.

## Security & Configuration Tips

- Development seeds create default admin users; change credentials before production.
- Do not commit real production data. Keep secrets out of VCS.
- Frontend proxies `/api` to `http://localhost:8090` (see `vite.config.ts`).
