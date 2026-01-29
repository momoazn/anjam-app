### Build stage
FROM oven/bun:1.3.5 AS build

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY index.html vite.config.ts tsconfig*.json components.json ./
COPY public ./public
COPY src ./src
COPY convex ./convex

# Convex URL must be baked into the Vite build (import.meta.env.VITE_CONVEX_URL).
# Provide it as a build-arg (or via compose).
ARG VITE_CONVEX_URL
ENV VITE_CONVEX_URL=$VITE_CONVEX_URL

RUN test -n "$VITE_CONVEX_URL"
RUN bun run build

### Runtime stage
FROM nginx:1.27-alpine AS runtime

COPY --from=build /app/dist /usr/share/nginx/html

# SPA routing (React Router): serve index.html for non-file routes.
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
