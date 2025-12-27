# Production Readiness Checklist (v2)

## Code & Build

- [ ] `bun run check` passes (typecheck + lint + format).
- [ ] `bun run build` succeeds.
- [ ] Docker image builds successfully (`docker compose build`).

## Environment Configuration

- [ ] `.env` file created from `.env.example`.
- [ ] `ANJAM_ENCRYPTION_KEY` generated and configured (`openssl rand -hex 16`).
- [ ] `TM_ALLOW_DEFAULT_ACCOUNTS=false` set (after initial admin created).
- [ ] `GOMEMLIMIT` set appropriately for deployment environment.

## PocketBase Dashboard Settings

- [ ] **Rate limiting enabled** in Dashboard (Settings > Application).
- [ ] **MFA/OTP enabled** for `_superusers` collection.
- [ ] Trusted proxy headers configured (`X-Real-IP` or `X-Forwarded-For`).
- [ ] Log level and retention configured in Dashboard.
- [ ] Mail settings configured (SMTP) for password resets and MFA codes.

## Security & Networking

- [ ] TLS termination in place (reverse proxy with Let's Encrypt or similar).
- [ ] Default superuser credentials changed (`admin@example.com`).
- [ ] Admin access strategy defined (who has superuser access and how).
- [ ] WebSocket headers configured in reverse proxy for realtime features.

## Data & Backups

- [ ] Data volume persisted (`anjam-data` Docker volume or bind mount).
- [ ] Automated backups configured (PocketBase built-in or file-based).
- [ ] Backup frequency and retention documented.
- [ ] Restore procedure tested at least once.

## Docker Deployment

- [ ] Container resource limits set (memory, file descriptors).
- [ ] Health check passing (`docker inspect --format='{{.State.Health.Status}}' anjam`).
- [ ] Restart policy configured (`unless-stopped` or `always`).
- [ ] Logs accessible (`docker logs anjam`).

## Monitoring & Ops

- [ ] Health check endpoint accessible (`/api/health`).
- [ ] Basic alerts configured (disk, memory, uptime).
- [ ] Database integrity check scheduled (`PRAGMA integrity_check`).

## Release & Rollback

- [ ] Release artifact versioned and stored.
- [ ] Rollback steps documented and rehearsed.
- [ ] Post-deploy smoke test checklist prepared.
