# Production Readiness Plan (v1)

Goal: Ship the first production version safely with PocketBase-native features, minimal custom infra, and repeatable release steps.

## Scope Assumptions

- Use PocketBase built-in rate limiting, logging, and email settings.
- Ignore auto-admin creation risk for v1 (per decision).
- Single binary deployment (embedded frontend).

## Plan

### 1) Backend changes (code)

- Remove custom rate limiting middleware wiring from `backend/main.go`.
- Delete `backend/rate_limiter.go` if no longer referenced.
- Verify no other code references the custom limiter.

### 2) PocketBase configuration (Dashboard)

- Enable and configure rate limiting (Settings > Application).
- Configure logs (level + retention) in Dashboard.
- Configure mail (SMTP) or disable email flows if not needed.

### 3) Runtime hardening

- Ensure TLS termination (PocketBase HTTPS or reverse proxy).
- Set data directory persistence and backups.
- Set OS limits (file descriptors, memory) appropriate for expected load.

### 4) Release validation

- Run `bun run check`.
- Run `bun run build`.
- Run a production-mode smoke test on the built binary.

### 5) Operational readiness

- Define monitoring/alerting (process health, disk usage, response time).
- Document rollback steps (previous binary + data backups).

## Deliverables

- Code changes merged for rate limiting removal.
- PocketBase dashboard configured (screenshots or written settings).
- Production runbook updated with deploy, backup, and rollback steps.
