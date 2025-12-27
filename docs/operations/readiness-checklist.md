# Production Readiness Checklist (v1)

## Code & Build

- [ ] Custom rate limiter removed from `backend/main.go` and `backend/rate_limiter.go` deleted (if unused).
- [ ] `bun run check` passes.
- [ ] `bun run build` succeeds for all targets.

## PocketBase Settings

- [ ] Rate limiting enabled and configured in Dashboard (Settings > Application).
- [ ] Log level and retention configured in Dashboard.
- [ ] Mail settings configured (SMTP) OR email flows explicitly disabled.

## Security & Networking

- [ ] TLS termination in place (PocketBase HTTPS or reverse proxy).
- [ ] Admin access strategy defined (who has superuser access and how).
- [ ] Public admin UI exposure reviewed and approved.

## Data & Backups

- [ ] Data directory persisted on durable storage.
- [ ] Automated backups configured (frequency + retention documented).
- [ ] Restore procedure tested at least once.

## Runtime & Ops

- [ ] OS limits set (file descriptors, memory budget).
- [ ] Health check endpoint or process health monitoring in place.
- [ ] Basic alerts configured (disk, memory, uptime).

## Release & Rollback

- [ ] Release artifact versioned and stored.
- [ ] Rollback steps documented and rehearsed.
- [ ] Post-deploy smoke test checklist prepared.
