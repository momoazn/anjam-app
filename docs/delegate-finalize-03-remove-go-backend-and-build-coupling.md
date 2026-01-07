# Delegate Prompt: Remove Go Backend + Build/Dev Coupling (PocketBase Server)

## Context

We want the repo to be Convex-only for the main product. The Go/PocketBase backend must be removed from the codebase and from all build/dev scripts.

Reference plan: `docs/pocketbase-go-removal-plan.md` (Phases 2 and 4 focus).

## Scope

### In scope

- Remove `backend/` directory and any Go-related tooling/config from the repo root:
  - `.air.toml`, Go build scripts, ports (8090), embed-dist logic, etc.
- Update `package.json` scripts:
  - Remove `dev:server`, `build:server`, any combined scripts that start PocketBase.
  - Ensure `dev` and `build` are accurate for Convex-only development.
- Update Vite config if it proxies to PocketBase.
- Update CI config files that mention Go or PocketBase.

### Out of scope

- Do not remove PocketBase frontend client/types in `src/` (handled by delegate 02).
- Do not remove “mode” or operations-only UI (handled by delegate 01).
- Do not modify Convex backend logic (`convex/`) unless required to remove a hard dependency.
- Do not implement Resend/email sending.

## Required Deliverables

1. `backend/` removed from repo.
2. `package.json` and dev/build scripts no longer reference Go/PocketBase.
3. No proxy to PocketBase remains in `vite.config.ts` (if it existed).
4. `bun run check` passes.
5. Grep proof:
   - `rg -n "backend/|:8090|pocketbase|air\\b|go test|go build" .` returns no relevant matches.

## Execution Checklist

1. Inventory:
   - `rg -n "backend/|:8090|pocketbase|air\\b|go test|go build" .`
2. Remove `backend/` and Go configs.
3. Update `package.json` scripts and any docs referenced by scripts.
4. Verify:
   - `bun run check`

## Notes

- If removing `backend/` breaks non-product documentation, update or archive the docs as needed.

## Concurrency / Ownership Boundaries

- You own: repo-level removal of `backend/` and build/dev/CI coupling to Go/PocketBase.
- You do not own: documentation/env refresh beyond minimal fixes needed to keep scripts coherent (handled by delegate 04).
