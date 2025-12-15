# Root Structure

This repository keeps the most-used code and configs at the top level while grouping everything else so the root stays easy to scan. Here's how the pieces fit together:

## Core code

- `backend/` contains the Go backend module, `pb_schema.json`, and the built `dist/` assets that PocketBase embeds.
- `src/`, `public/`, `index.html`, and the Vite/TypeScript config files power the React front end.
- `package.json` / `bun.lock` describe the JS tooling and scripts that glue both halves together.

## Supporting directories

- `docs/` hosts architecture notes, guides, and the new **Root Structure** overview itself.
- `e2e/` keeps Playwright tests; `scripts/` holds data helpers that are not needed on every run.
- `release/` stores release binaries/packages for Linux, Windows, and macOS builds (into `release/linux`, `release/windows`, `release/macos`); like `tmp/`, it stays ignored via `.gitignore`.

## Infrastructure and helpers

- `infra/` contains `Dockerfile` and `docker-compose.yml` so you can find container tooling without hunting through unrelated files (run it with `docker compose -f infra/docker-compose.yml up`).
- `scripts/dev/` now houses `run.sh`, `run.bat`, and `run-with-env.bat` for quick local startups, keeping the root free of utility wrappers.

## Other items you may see

- `AGENTS.md`, `CLAUDE.md`, and `components.json` are metadata used by automation or configuration tooling and can stay at the root without long-term maintenance cost.
- `dist/`, `node_modules/`, and `data/` are build or dependency outputs; the repo keeps them ignored but accessible for local reviews.
