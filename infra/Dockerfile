###########
# Stage 1 #
###########
# Frontend build (Bun image)
ARG BUN_IMAGE=oven/bun:1.3.4
FROM ${BUN_IMAGE} AS frontend-builder

ENV NODE_ENV=production

# Set working directory
WORKDIR /app

# Copy only files needed for dependency installation first (better layer caching)
COPY package.json bun.lock ./

# Install dependencies using the locked configuration
RUN bun install --frozen-lockfile

# Copy configuration and source/public assets
COPY index.html ./index.html
COPY vite.config.ts ./vite.config.ts
COPY tsconfig*.json ./
COPY src ./src
COPY public ./public

# Build the frontend (outputs to backend/dist per vite.config.ts)
RUN bun run build:client

###########
# Stage 2 #
###########
# Backend build (Go)
ARG GO_IMAGE=golang:1.24-alpine
FROM ${GO_IMAGE} AS backend-builder

# Install git (for module fetching) and CA certificates
RUN apk add --no-cache git ca-certificates

WORKDIR /app

# Copy Go module files for the backend and download dependencies
COPY backend/go.mod backend/go.sum ./backend/
RUN cd backend && go mod download

# Copy backend source (including embedded schema) and built frontend assets
COPY backend ./backend
COPY --from=frontend-builder /app/backend/dist ./backend/dist

# Build the Go application
WORKDIR /app/backend
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /app/anjam .

###########
# Stage 3 #
###########
# Runtime image (Alpine-based for smaller size)
ARG RUNTIME_IMAGE=alpine:3.21
FROM ${RUNTIME_IMAGE}

WORKDIR /app

# Install CA certificates and timezone data
RUN apk add --no-cache ca-certificates tzdata
ENV TZ=Etc/UTC

# Copy the built binary
COPY --from=backend-builder /app/anjam /app/anjam

# Create data directory and non-root user
RUN mkdir -p /app/data \
  && addgroup -S anjam \
  && adduser -S -G anjam anjam \
  && chown -R anjam:anjam /app
USER anjam

# Expose the default PocketBase port
EXPOSE 8090

# Run the application (backend binds to 0.0.0.0:8090 in production mode)
CMD ["/app/anjam", "--http=0.0.0.0:8090"]
