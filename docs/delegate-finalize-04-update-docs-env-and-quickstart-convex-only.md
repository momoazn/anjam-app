# Delegate Prompt: Update Docs + Env Templates for Convex-Only

## Context

After migration, the repo should be newcomer-friendly with Convex-only instructions. Existing docs likely still reference PocketBase/Go, port 8090, pb_schema, or operations mode.

Reference plans:

- `docs/pocketbase-go-removal-plan.md` (Phase 6 focus)
- `docs/operation-mode-removal-plan.md` (docs cleanup)

## Scope

### In scope

- Update repository docs to reflect Convex-only:
  - `README.md` (primary)
  - `.env.example` / `.env.local.example` templates
  - any “Development/Building” docs that mention PocketBase/Go.
- Remove references to:
  - PocketBase on 8090
  - embedded frontend in Go
  - `pb_schema.json` and PB type generation
  - Operations mode and mode switching

### Out of scope

- Do not implement Resend/email sending integration; but you can document it as “TBD” if needed.
- Do not change runtime code; if you find mismatches, record them and hand off to delegate 05.

## Required Deliverables

1. Updated docs: Convex-only dev/build instructions.
2. Updated env templates:
   - Remove PB vars
   - Keep only Convex-relevant vars and any still-used ones
3. Proof:
   - `rg -n ":8090|PocketBase|pb_schema|operations mode|dev:server" README.md docs .env*` returns no relevant results.

## Suggested Structure for README

- Prereqs: Bun, Node (if needed), Convex CLI
- Setup: `bun install`, `bunx convex dev` (or whatever current workflow is), `bun run dev`
- Testing/quality: `bun run check`
- Deployment notes (optional): Convex Cloud deploy basics

## Concurrency / Ownership Boundaries

- You own: docs + env templates only.
- You do not own: code removals in `src/`, `convex/`, `backend/`, scripts, or CI.
