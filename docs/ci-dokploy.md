# CircleCI checks + Dokploy build/deploy

This guide keeps Dokploy building/deploying from Git and uses CircleCI for checks.

## 1) CircleCI enablement checklist

- Add the repo in CircleCI (Projects → Set Up Project).
- Ensure the `main` branch is enabled in CircleCI.
- Push to `main` and verify the pipeline runs.

## 2) Resulting flow

Push to `main` → CircleCI runs `bun run check` and `bun run build` → Dokploy builds and deploys from Git.

## 3) Optional: move builds to CI later

If you later want CircleCI to build/push images and Dokploy to only pull, switch the app source to **Docker** and configure GHCR credentials + image tag. At that point you will also need Dokploy API credentials for CI-triggered deploys.
