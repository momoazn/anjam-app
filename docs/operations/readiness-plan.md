# Production Readiness Plan (v2 - Convex Cloud)

Goal: Ship the first production version safely with Convex Cloud backend, Better Auth authentication, and modern frontend deployment.

## Scope Assumptions

- Use Convex Cloud managed backend with automatic scaling
- Use Better Auth for authentication with secure token management
- Separate frontend deployment (Vite-built SPA) from backend
- Frontend served via nginx/CDN, backend hosted on Convex Cloud

## Plan

### 1) Convex Cloud Setup

- Create production Convex project and configure deployment settings
- Set up Better Auth integration with Convex backend
- Configure environment variables for production deployment
- Deploy backend functions to Convex Cloud

### 2) Frontend Configuration

- Configure production build with correct Convex URL
- Set up nginx/CDN for static file serving
- Configure Content Security Policy for Convex integration
- Set up TLS termination and HTTPS enforcement

### 3) Authentication Configuration

- Configure Better Auth with production settings
- Set up email/SMTP configuration if email auth enabled
- Verify authentication flows work correctly
- Test role-based access control

### 4) Release Validation

- Run `bun run check` (typecheck + lint + format)
- Run `bun run build` (production frontend build)
- Run `bunx convex deploy` (deploy backend functions)
- Run production smoke tests (E2E tests)

### 5) Operational Readiness

- Set up Convex dashboard monitoring
- Configure frontend uptime monitoring
- Document rollback steps (previous frontend build + Convex rollback)
- Set up error tracking and alerting

## Deliverables

- Convex Cloud project configured and deployed
- Frontend build and deployment pipeline established
- Authentication system validated with Better Auth
- Production runbook updated with Convex deployment procedures
- Monitoring and alerting configured for frontend and backend
