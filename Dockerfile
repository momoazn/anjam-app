### Build stage
FROM oven/bun:1.3.8 AS build

WORKDIR /app

COPY package.json bun.lock ./
RUN rm -rf /root/.bun/install/cache \
  && (bun install --frozen-lockfile \
    || bun install --frozen-lockfile \
    || bun install --frozen-lockfile)

COPY index.html vite.config.ts tsconfig*.json components.json ./
COPY public ./public
COPY src ./src
# Frontend consumes generated Convex client/types from this folder.
COPY convex/_generated ./convex/_generated

# Convex URL must be baked into the Vite build (import.meta.env.VITE_CONVEX_URL).
# Provide it as a build-arg (or via compose).
ARG VITE_CONVEX_URL
ENV VITE_CONVEX_URL=$VITE_CONVEX_URL

# Self-hosted Convex uses a separate HTTP actions origin (the "site" URL).
ARG VITE_CONVEX_SITE_URL
ENV VITE_CONVEX_SITE_URL=$VITE_CONVEX_SITE_URL

RUN test -n "$VITE_CONVEX_URL" && bun run build

### Runtime stage
FROM nginx:1.27-alpine AS runtime

COPY --from=build /app/dist /usr/share/nginx/html

# SPA routing (React Router): serve index.html for non-file routes.
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
