# Runbook

Procedures to deploy, configure, and maintain Anjam. The backend runs on Convex. The frontend is a static single-page app (SPA) built by Vite.

## Architecture in brief

- **Backend**: Convex deployment (database, functions, Better Auth HTTP routes).
- **Frontend**: static files in `dist/`, served by nginx (see `Dockerfile` and `nginx.conf`) or any static host with SPA fallback.
- **Two Convex origins**: `https://<deployment>.convex.cloud` (client API, `VITE_CONVEX_URL`) and `https://<deployment>.convex.site` (HTTP actions and auth, `VITE_CONVEX_SITE_URL`).

## Prerequisites

- [Bun](https://bun.sh) 1.x
- A Convex account and a production project
- Docker (optional, for the container build)
- A reverse proxy or host that terminates TLS

## 1. Environment variables

### Convex deployment (set with `bunx convex env set`)

| Variable                                                                                                                                                                                              | Required | Purpose                                                                       |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------- |
| `SITE_URL`                                                                                                                                                                                            | Yes      | Public URL of the frontend. Used by Better Auth for the base URL and origins. |
| `BETTER_AUTH_SECRET`                                                                                                                                                                                  | Yes      | Session signing secret. Generate with `openssl rand -base64 32`.              |
| `AUTH_REQUIRE_EMAIL_VERIFICATION`                                                                                                                                                                     | No       | `true` to require verified email. Off by default. No email sender is wired.   |
| `AUTH_RATE_LIMIT_ENABLED`                                                                                                                                                                             | No       | Defaults to on in production.                                                 |
| `AUTH_RATE_LIMIT_WINDOW_SECONDS`, `AUTH_RATE_LIMIT_MAX`, `AUTH_SIGNIN_RATE_LIMIT_WINDOW_SECONDS`, `AUTH_SIGNIN_RATE_LIMIT_MAX`, `AUTH_SIGNUP_RATE_LIMIT_WINDOW_SECONDS`, `AUTH_SIGNUP_RATE_LIMIT_MAX` | No       | Rate-limit tuning. Defaults are in `convex/auth.ts`.                          |

`convex/auth.ts` throws at load time if `SITE_URL` or `BETTER_AUTH_SECRET` is missing.

### Frontend build (baked into the bundle)

| Variable                                              | Required | Purpose                                                       |
| ----------------------------------------------------- | -------- | ------------------------------------------------------------- |
| `VITE_CONVEX_URL`                                     | Yes      | Convex client origin (`.convex.cloud`).                       |
| `VITE_CONVEX_SITE_URL`                                | Yes      | Convex HTTP origin (`.convex.site`), used by the auth client. |
| `VITE_PUBLIC_POSTHOG_KEY`, `VITE_PUBLIC_POSTHOG_HOST` | No       | PostHog analytics. Leave empty to disable.                    |

`.env.example` lists all of these.

## 2. Deployment

### 2.1 Convex backend

```bash
# Production deploy key from the Convex dashboard (Settings > Deploy Keys)
export CONVEX_DEPLOY_KEY="<deploy-key>"

bunx convex env set SITE_URL https://anjam.example.com --prod
bunx convex env set BETTER_AUTH_SECRET "$(openssl rand -base64 32)" --prod

bunx convex deploy
```

### 2.2 Frontend, one command with Convex

`build:deploy` deploys Convex functions and then runs the Vite build with `VITE_CONVEX_URL` set from the new deployment:

```bash
bun run build:deploy
```

Set `VITE_CONVEX_SITE_URL` in the build environment first. The output is in `dist/`.

### 2.3 Frontend, Docker

The `Dockerfile` builds the app and serves it with nginx (SPA fallback and long cache for `/assets/`).

```bash
export VITE_CONVEX_URL="https://<deployment>.convex.cloud"
export VITE_CONVEX_SITE_URL="https://<deployment>.convex.site"

docker compose up -d --build   # serves on ${WEB_PORT:-4112}
```

The compose file defines a health check that requests `/` inside the container.

### 2.4 TLS and reverse proxy

The container serves plain HTTP. Terminate TLS in front of it.

**nginx**

```nginx
server {
    listen 443 ssl;
    http2 on;
    server_name anjam.example.com;

    ssl_certificate /etc/letsencrypt/live/anjam.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/anjam.example.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:4112;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name anjam.example.com;
    return 301 https://$host$request_uri;
}
```

**Caddy**

```caddy
anjam.example.com {
    reverse_proxy 127.0.0.1:4112
    encode gzip
}
```

The browser talks to Convex directly, so no proxy rule is needed for the API. `SITE_URL` must equal the public frontend URL, or Better Auth rejects the origin.

### 2.5 Content Security Policy (optional)

The Convex client uses HTTPS and WebSocket connections to your deployment. A policy must allow both origins:

```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://<deployment>.convex.cloud wss://<deployment>.convex.cloud https://<deployment>.convex.site;" always;
```

Add the PostHog host to `connect-src` if analytics is on. Test the policy in a browser before you enforce it.

## 3. Operations

### 3.1 Health checks

```bash
# Frontend
curl -sI https://anjam.example.com

# Better Auth on the Convex HTTP origin
curl -s https://<deployment>.convex.site/api/auth/ok

# Container
docker inspect --format='{{.State.Health.Status}}' <container>
docker logs --tail 100 <container>
```

Use the Convex dashboard for function logs, error rates, and database usage.

### 3.2 Backups

Convex stores the data. Export it on a schedule:

```bash
bunx convex export --path ./backups/convex-$(date +%Y%m%d).zip
```

Store exports off-site and test a restore (`bunx convex import`) on a non-production deployment.

### 3.3 Bundle analysis

```bash
bun run build:analyze
```

## 4. Rollback

**Frontend**: redeploy the previous image or the previous `dist/` build. Keep the last known-good build.

**Convex**: check out the previous git commit and run `bunx convex deploy` again. Schema changes that removed fields may need a data fix first, so review the diff before you roll back.

## 5. Troubleshooting

| Symptom                          | Check                                                                                             |
| -------------------------------- | ------------------------------------------------------------------------------------------------- |
| Blank page                       | Browser console. Confirm `VITE_CONVEX_URL` was set at build time (it is baked into the bundle).   |
| Login fails or origin error      | `SITE_URL` on the Convex deployment must match the public frontend URL exactly.                   |
| Auth requests return 404 or fail | `VITE_CONVEX_SITE_URL` must be the `.convex.site` origin.                                         |
| Convex functions fail to load    | Convex dashboard logs. Missing `SITE_URL` or `BETTER_AUTH_SECRET` makes `convex/auth.ts` throw.   |
| Too many sign-in attempts        | Auth rate limits (sign-in default: 5 per 15 minutes). Tune the `AUTH_*` variables.                |
| Live updates do not arrive       | Browser network tab. Confirm WebSocket connections to `.convex.cloud` are not blocked by a proxy. |

## 6. Maintenance

```bash
bun outdated            # check for updates
bun update              # update dependencies
bun run check           # type check, lint, format check
bun run test:all        # unit and E2E tests
bunx convex deploy      # deploy backend changes
```

Test Convex changes against a dev deployment (`bun run dev:convex`) before you deploy to production.

## Pre-deployment checklist

- [ ] Convex production project created
- [ ] `SITE_URL` and `BETTER_AUTH_SECRET` set on the Convex deployment
- [ ] `VITE_CONVEX_URL` and `VITE_CONVEX_SITE_URL` set for the frontend build
- [ ] `bun run check` and `bun run test:run` pass
- [ ] `bunx convex deploy` succeeds
- [ ] Frontend built and served with SPA fallback
- [ ] TLS in place
- [ ] Sign-up, login, and organization creation tested (see [auth checklist](../qa/auth-manual-checklist.md))
- [ ] Convex export schedule set
