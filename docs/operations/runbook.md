# Production Runbook - Anjam v2 (Convex Cloud)

This runbook provides step-by-step procedures for deploying, configuring, and maintaining Anjam with Convex Cloud backend in production.

## Prerequisites

- Node.js 18+ and Bun 1.x (for building frontend)
- Docker (for containerized deployment)
- Reverse proxy (nginx, Caddy, or similar) for TLS termination
- System administration access to the production server
- Convex account and project setup

## Part 1: Deployment

### 1.1 Convex Cloud Setup

**1. Create Convex Project:**

1. Visit [convex.dev](https://convex.dev) and create an account
2. Create a new project for production
3. Note your deployment URL: `https://<project-name>.convex.site`
4. Generate API keys for deployment

**2. Configure Convex Environment:**

```bash
# Set Convex deployment URL
export VITE_CONVEX_URL="https://<project-name>.convex.site"

# Set Convex deployment key (for CI/CD)
export CONVEX_DEPLOYMENT="<project-name>:<deployment-name>"
export CONVEX_DEPLOY_KEY="<deploy-key>"
```

**3. Deploy Convex Backend:**

```bash
# Install Convex CLI
bunx convex deploy

# Or use the deployment key
bunx convex deploy --cmd convex deploy --preview-name production
```

### 1.2 Frontend Deployment

**From Docker Container (Recommended):**

1. Copy and configure environment file:

   ```bash
   cp .env.example .env
   # Edit .env with your production values

   # Required Convex settings
   VITE_CONVEX_URL="https://<project-name>.convex.site"

   # Optional: Email configuration
   RESEND_API_KEY="<resend-api-key>"
   AUTH_RESEND_FROM="noreply@yourdomain.com"

   # Optional: Analytics
   VITE_PUBLIC_POSTHOG_KEY="<posthog-key>"
   VITE_PUBLIC_POSTHOG_HOST="https://app.posthog.com"
   ```

2. Build and start with docker compose:

   ```bash
   docker compose up -d --build
   ```

3. Or build and run manually:

   ```bash
   # Build frontend
   bun run build

   # Run with nginx
   docker run -d \
     --name anjam-frontend \
     -p 80:80 \
     -p 443:443 \
     -v $(pwd)/dist:/usr/share/nginx/html \
     -v /etc/nginx/conf.d:/etc/nginx/conf.d \
     nginx:alpine
   ```

4. Verify deployment:
   ```bash
   docker logs anjam-frontend
   curl http://localhost
   ```

### 1.3 Configure TLS Termination

**Using nginx:**

```nginx
server {
    listen 443 ssl http2;
    server_name ianjam.ir;

    ssl_certificate /etc/letsencrypt/live/ianjam.ir/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ianjam.ir/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Frontend serving
    location / {
        proxy_pass http://127.0.0.1:3000;  # Or serve static files directly
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Convex API proxy (optional - for custom domain)
    location /api/ {
        proxy_pass https://<project-name>.convex.site/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name ianjam.ir;
    return 301 https://$server_name$request_uri;
}
```

**Using Caddy:**

```caddy
ianjam.ir {
    reverse_proxy 127.0.0.1:3000
    encode gzip
}
```

### 1.4 Systemd Service Setup (Linux)

Create `/etc/systemd/system/anjam-frontend.service`:

```ini
[Unit]
Description=Anjam Frontend
After=network.target

[Service]
Type=simple
User=anjam
WorkingDirectory=/opt/anjam
ExecStart=/usr/bin/serve -s dist -l 3000
Restart=on-failure
RestartSec=10s

# Environment variables
Environment="NODE_ENV=production"
Environment="VITE_CONVEX_URL=https://<project-name>.convex.site"

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable anjam-frontend
sudo systemctl start anjam-frontend
sudo systemctl status anjam-frontend
```

## Part 2: Configuration

### 2.1 Environment Variables

Set these before starting the application:

```bash
# Required: Convex configuration
export VITE_CONVEX_URL="https://<project-name>.convex.site"

# Organization Mode (build-time configuration)
# Options: "operations" (default) or "product"
export VITE_ORG_MODE=operations

# Optional: Email configuration
export RESEND_API_KEY="your-resend-api-key"
export AUTH_RESEND_FROM="noreply@yourdomain.com"

# Optional: Analytics
export VITE_PUBLIC_POSTHOG_KEY="your-posthog-key"
export VITE_PUBLIC_POSTHOG_HOST="https://app.posthog.com"

# Optional: Security settings
export VITE_ALLOW_DEFAULT_ACCOUNTS=false
```

**Building for Different Modes:**

```bash
# Build for operations mode (default)
bun run build

# Build for product mode (Linear-like experience)
VITE_ORG_MODE=product bun run build
```

### 2.2 Better Auth Configuration

Better Auth is integrated with Convex and requires no separate configuration. The auth system:

- Uses Convex for user data storage
- Supports email/password authentication
- Includes session management
- Provides secure token handling

**Key Features:**

- Automatic user creation on signup
- Email verification (if SMTP configured)
- Password reset functionality
- Session persistence

### 2.3 Frontend Security Configuration

**Content Security Policy (CSP):**

Add to your nginx configuration:

```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.convex.cloud; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://<project-name>.convex.site;" always;
```

**CORS Configuration:**

Convex handles CORS automatically. For custom domains:

```nginx
add_header Access-Control-Allow-Origin "https://<project-name>.convex.site" always;
add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
```

## Part 3: Operational Procedures

### 3.1 Health Checks

Check application health:

```bash
# Frontend health check
curl -s https://ianjam.ir

# Convex API health check
curl -s https://<project-name>.convex.site/api/health

# Docker health check
docker inspect --format='{{.State.Health.Status}}' anjam-frontend

# Docker container logs
docker logs --tail 100 anjam-frontend

# System resource check (Docker)
docker stats anjam-frontend --no-stream

# System resource check (non-Docker)
ps aux | grep node
```

### 3.2 Monitoring and Alerting

Recommended metrics to monitor:

- **Frontend Health:**
  - Bundle size and load time
  - JavaScript errors in browser console
  - Core Web Vitals (LCP, FID, CLS)

- **Convex Health:**
  - API response times
  - Function execution duration
  - Error rates
  - Real-time connection status

- **System Resources:**
  - CPU usage (should be < 10% at rest)
  - Memory usage for frontend container
  - Disk usage for logs

**Monitoring Tools:**

- Convex Dashboard: Built-in metrics and logs
- Browser DevTools: Frontend performance
- External monitoring: Pingdom, UptimeRobot

### 3.3 Backup Procedures

**Convex Data Backup:**

Convex provides automatic data backup and recovery. However, you should:

1. **Export Data Regularly:**

   ```bash
   # Use Convex CLI to export data
   bunx convex export --path ./backups/convex-data-$(date +%Y%m%d)
   ```

2. **Backup Frontend Configuration:**

   ```bash
   # Backup environment files and configs
   tar -czf anjam-config-$(date +%Y%m%d).tar.gz \
     .env nginx.conf docker-compose.yml
   ```

3. **Store Backups Safely:**
   - Use cloud storage (S3, GCS, etc.)
   - Implement retention policies
   - Test restore procedures

**Frontend Asset Backup:**

```bash
# Backup built frontend assets
tar -czf anjam-frontend-$(date +%Y%m%d).tar.gz dist/
```

### 3.4 Frontend Optimization

**Bundle Size Monitoring:**

```bash
# Analyze bundle size
bun run build:analyze

# Check for large dependencies
bun run build --stats
```

**Performance Optimization:**

- Enable gzip compression in nginx
- Implement proper caching headers
- Use CDN for static assets
- Optimize images and fonts

## Part 4: Rollback Procedures

### 4.1 Rollback from Failed Deployment

If the new version has critical issues:

1. **Identify the previous working version:**

   ```bash
   ls -lt /opt/anjam/dist.* | head -5
   ```

2. **Stop the current service:**

   ```bash
   sudo systemctl stop anjam-frontend
   ```

3. **Restore previous build:**

   ```bash
   cp -r /opt/anjam/dist.previous /opt/anjam/dist
   ```

4. **Start the service:**

   ```bash
   sudo systemctl start anjam-frontend
   ```

5. **Verify health:**
   ```bash
   curl -s https://ianjam.ir
   ```

### 4.2 Rollback Convex Changes

If Convex backend changes cause issues:

1. **Revert to previous deployment:**

   ```bash
   bunx convex deploy --preview-name previous-stable
   ```

2. **Or rollback specific functions:**
   ```bash
   # Use Convex dashboard to rollback
   # Or deploy from previous git commit
   ```

## Part 5: Troubleshooting

### Common Issues

**Issue: Frontend not loading**

```bash
# Check if build completed successfully
ls -la dist/

# Check nginx logs
sudo tail -f /var/log/nginx/error.log

# Check if Convex is accessible
curl https://<project-name>.convex.site/api/health
```

**Issue: Authentication not working**

```bash
# Check Convex logs in dashboard
# Verify VITE_CONVEX_URL is correct
# Check browser network tab for auth requests
```

**Issue: Real-time updates not working**

```bash
# Check WebSocket connections in browser
# Verify Convex subscription limits
# Check network for proxy issues
```

**Issue: High memory usage**

```bash
# Check frontend bundle size
bun run build:analyze

# Check for memory leaks in browser
# Monitor JavaScript heap usage
```

### Log Analysis

View application logs:

```bash
# Frontend logs (if using serve)
sudo journalctl -u anjam-frontend -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Browser console logs (client-side)
# Open DevTools > Console in browser
```

## Part 6: Maintenance

### 6.1 Frontend Maintenance

**Monthly Tasks:**

```bash
# Update dependencies
bun update

# Security audit
bun audit

# Rebuild and test
bun run build
bun run test:run
```

**Dependency Updates:**

```bash
# Check for outdated packages
bun outdated

# Update packages
bun update

# Test after updates
bun run test:all
```

### 6.2 Convex Maintenance

**Monitor Convex Dashboard:**

- Function execution metrics
- Error rates and logs
- Database usage
- Real-time connection health

**Update Convex:**

```bash
# Update Convex CLI
bun update convex

# Update Convex functions
bunx convex dev  # Test locally first
bunx convex deploy  # Deploy to production
```

## Part 7: Security Considerations

### 7.1 Frontend Security

**Content Security Policy:**

```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.convex.cloud https://<project-name>.convex.site; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://<project-name>.convex.site wss://<project-name>.convex.site;" always;
```

**HTTPS Enforcement:**

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name ianjam.ir;
    return 301 https://$server_name$request_uri;
}
```

### 7.2 Authentication Security

- Better Auth handles secure token management
- Sessions are stored securely in Convex
- Password requirements enforced by Better Auth
- Email verification available if SMTP configured

## Checklist: Production Deployment

### Pre-Deployment

- [ ] Convex project created and configured
- [ ] VITE_CONVEX_URL set correctly
- [ ] Environment variables configured
- [ ] Frontend built successfully (`bun run build`)

### Frontend Deployment

- [ ] Docker container built and running
- [ ] Static files served correctly
- [ ] Health check endpoint responding
- [ ] No JavaScript errors in browser console

### TLS & Networking

- [ ] TLS certificates installed and configured
- [ ] Reverse proxy configured for HTTPS (nginx/Caddy)
- [ ] Content Security Policy headers set
- [ ] CORS configured for Convex API

### Convex Integration

- [ ] Convex deployment successful
- [ ] Real-time connections working
- [ ] Authentication functional
- [ ] Database functions executing correctly

### Monitoring & Operations

- [ ] Frontend health monitoring configured
- [ ] Convex dashboard accessible
- [ ] Log aggregation configured
- [ ] Alerting configured (uptime, performance)

### Security

- [ ] HTTPS enforced
- [ ] Content Security Policy configured
- [ ] No sensitive data in frontend code
- [ ] Authentication working securely

### Backup & Recovery

- [ ] Convex data export procedure documented
- [ ] Frontend configuration backed up
- [ ] Restore procedures tested
- [ ] Backup retention policy configured

## Support and Incident Response

### Incident Response Plan

1. **Detection:** Monitor health checks and alerts
2. **Assessment:** Check logs and system metrics
3. **Mitigation:** Rollback frontend or Convex deployment
4. **Resolution:** Fix root cause and redeploy
5. **Post-Mortem:** Document incident and improvements

### Emergency Contacts

- Convex Support: Via Convex dashboard
- On-call engineer: [to be configured]
- Infrastructure team: [to be configured]

---

**Version:** 2.0
**Last Updated:** 2026-01-08
**Maintained By:** DevOps Team
**Major Changes:** Complete rewrite for Convex Cloud architecture
