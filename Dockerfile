# Stage 1: Build Frontend (Bun + Node)
FROM node:22-bullseye AS frontend-builder

# Install bun
RUN npm install -g bun@1.2.9

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./
COPY vite.config.ts ./
COPY tsconfig.json ./
COPY tsconfig.app.json ./
COPY tsconfig.node.json ./
COPY tailwind.config.js ./
COPY postcss.config.js ./

# Install dependencies
RUN bun install

# Copy source code
COPY src ./src
COPY public ./public

# Build the frontend
RUN bun run build:client

# Stage 2: Build Go Backend
FROM golang:1.24-alpine AS backend-builder

# Install git (required for go get)
RUN apk add --no-cache git

# Set working directory
WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code and built frontend
COPY main.go ./
COPY pb_schema.json ./
COPY --from=frontend-builder /app/dist ./dist

# Build the Go application
# CGO_ENABLED=0 for static binary, suitable for distroless images
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o task-manager main.go

# Stage 3: Runtime Image
FROM debian:12-slim

# Set working directory
WORKDIR /app

# Install ca-certificates for HTTPS support
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

# Copy the built binary
COPY --from=backend-builder /app/task-manager /app/task-manager

# Create data directory for PocketBase
RUN mkdir -p /app/data

# Create non-root user
RUN useradd -r -s /bin/false taskmanager
RUN chown -R taskmanager:taskmanager /app
USER taskmanager

# Expose the default PocketBase port
EXPOSE 8090

# Run the application
CMD ["/app/task-manager", "--http=0.0.0.0:8090"]
