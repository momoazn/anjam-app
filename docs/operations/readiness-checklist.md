# Production Readiness Checklist (v3 - Convex + Vite)

## Build & Deploy

- [ ] `bun run build` succeeds (frontend production build).
- [ ] `bunx convex deploy` succeeds (backend functions + schema).
- [ ] Hosting target configured for SPA routing (all routes serve `index.html`).

## Environment Configuration

- [ ] `VITE_CONVEX_URL` set to production deployment URL.
- [ ] Optional: `RESEND_API_KEY` + `AUTH_RESEND_FROM` configured if email auth is enabled.
- [ ] Optional: `VITE_PUBLIC_POSTHOG_KEY` + `VITE_PUBLIC_POSTHOG_HOST` configured if analytics enabled.
- [ ] `TZ=Asia/Tehran` set in production runtime (required for Jalali calendar).

## Auth & Access Control

- [ ] Manual auth test checklist completed. See `docs/qa/auth-manual-checklist.md`.
- [ ] Password policy validated (min length, mismatch, invalid email).
- [ ] Role-based access verified (owner/member).

## Observability & Ops

- [ ] Convex dashboard access configured for operators.
- [ ] Error tracking configured (if applicable).
- [ ] Basic uptime monitoring configured for frontend host.

## Data & Continuity

- [ ] No production seed scripts required (initial admin created via UI).
- [ ] Data retention/export plan documented (Convex managed storage).

## Release & Rollback

- [ ] Release artifact/version recorded.
- [ ] Rollback steps documented (previous frontend build + Convex deploy rollback strategy).
- [ ] Post-deploy smoke test checklist prepared.
