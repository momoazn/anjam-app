# CircleCI + Dokploy (GHCR) Deployment

This guide moves builds to CircleCI and keeps Dokploy for pull + deploy.

## 1) Dokploy app settings

- Source: **Docker**
- Docker Image: `ghcr.io/mohammadhmn/anjam:latest`
- Registry credentials: GitHub PAT with at least `read:packages`

## 2) CircleCI context (dokploy)

Create a CircleCI context named `dokploy` and add:

- `DOCKER_IMAGE=ghcr.io/mohammadhmn/anjam`
- `DOCKER_REGISTRY=ghcr.io`
- `DOCKER_USERNAME=mohammadhmn`
- `DOCKER_PASSWORD=<github_pat_with_write:packages>`
- `DOCKER_TAG=latest`
- `DOKPLOY_URL=https://redstitch.ir`
- `DOKPLOY_API_KEY=<dokploy-api-key>`
- `DOKPLOY_APP_ID=<dokploy-app-id>`

## 3) Get Dokploy API key

1. In Dokploy, go to **Profile Settings** (`/settings/profile`).
2. In the **API/CLI** section, generate a token.
3. Use that token as `DOKPLOY_API_KEY`.

## 4) Get Dokploy application ID

Use your API key to list projects and find your app's `applicationId`:

```bash
curl -X 'GET' \
  'https://<your-dokploy-domain>/api/project.all' \
  -H 'accept: application/json' \
  -H 'x-api-key: <YOUR_API_KEY>'
```

## 5) Resulting flow

Push to `main` → CircleCI builds + pushes `ghcr.io/mohammadhmn/anjam:latest` → CircleCI triggers Dokploy deploy → Dokploy pulls and deploys.

## 6) CircleCI enablement checklist

- Add the repo in CircleCI (Projects → Set Up Project).
- Confirm the `dokploy` context exists with all required env vars.
- Ensure the `main` branch is enabled in CircleCI.
- Push to `main` and verify the pipeline runs.
