# Production Runbook - Anjam (انجام) v1

This runbook provides step-by-step procedures for deploying, configuring, and maintaining Anjam in production.

## Prerequisites

- Go 1.24+ (for building from source)
- Docker (if using containerized deployment)
- SQLite 3+ (database engine, included with PocketBase)
- Reverse proxy (nginx, Caddy, or similar) for TLS termination
- System administration access to the production server

## Part 1: Deployment

### 1.1 Deploy the Binary

**From Release Archive:**

1. Download the appropriate binary from the release directory:
   - Linux: `anjam-linux`
   - Windows: `anjam-windows.exe`
   - macOS: `anjam-macos`

2. Create application directory:

   ```bash
   mkdir -p /opt/anjam
   mkdir -p /opt/anjam/data
   chmod 700 /opt/anjam
   ```

3. Copy binary and set permissions:

   ```bash
   cp anjam-linux /opt/anjam/anjam
   chmod 755 /opt/anjam/anjam
   ```

4. Verify binary signature (if signed):
   ```bash
   # Check file integrity
   sha256sum /opt/anjam/anjam
   ```

**From Docker Container (Recommended):**

1. Copy and configure environment file:

   ```bash
   cp .env.example .env
   # Edit .env with your production values

   # Generate encryption key:
   openssl rand -hex 16
   # Add the generated key to ANJAM_ENCRYPTION_KEY in .env
   ```

2. Build and start with docker compose:

   ```bash
   docker compose up -d --build
   ```

3. Or build and run manually:

   ```bash
   docker build -f Dockerfile -t anjam:latest .
   docker run -d \
     --name anjam \
     -p 8090:8090 \
     -v anjam-data:/app/data \
     -e TM_ALLOW_DEFAULT_ACCOUNTS=false \
     -e ANJAM_ENCRYPTION_KEY="<your-32-char-key>" \
     -e GOMEMLIMIT=512MiB \
     --memory=1g \
     --ulimit nofile=4096:4096 \
     anjam:latest
   ```

4. Verify deployment:
   ```bash
   docker logs anjam
   curl http://localhost:8090/api/health
   ```

### 1.2 Configure TLS Termination

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

    # Proxy configuration
    location / {
        proxy_pass http://127.0.0.1:8090;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
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
    reverse_proxy 127.0.0.1:8090
    encode gzip
}
```

### 1.3 Systemd Service Setup (Linux)

Create `/etc/systemd/system/anjam.service`:

```ini
[Unit]
Description=Anjam (انجام)
After=network.target

[Service]
Type=simple
User=anjam
WorkingDirectory=/opt/anjam
ExecStart=/opt/anjam/anjam --http=0.0.0.0:8090 --encryptionEnv=ANJAM_ENCRYPTION_KEY
Restart=on-failure
RestartSec=10s

# Security settings
Environment="TM_ALLOW_DEFAULT_ACCOUNTS=false"

# Settings encryption (generate with: openssl rand -hex 16)
Environment="ANJAM_ENCRYPTION_KEY=<32-character-random-string>"

# Memory management (adjust based on available RAM)
# Recommended: 50-75% of available memory
Environment="GOMEMLIMIT=512MiB"

# Increase file descriptors for realtime connections
LimitNOFILE=4096

[Install]
WantedBy=multi-user.target
```

**Generate encryption key:**

```bash
openssl rand -hex 16
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable anjam
sudo systemctl start anjam
sudo systemctl status anjam
```

## Part 2: Configuration

### 2.1 Environment Variables

Set these before starting the application:

```bash
# Security settings
export TM_ALLOW_DEFAULT_ACCOUNTS=false
# Add any PocketBase flags in the service command if needed.
```

### 2.2 PocketBase Dashboard Configuration

Access PocketBase admin UI at `https://ianjam.ir/_/`:

1. **Default Credentials:**
   - Email: `admin@example.com`
   - Password: `admin12345`
   - **Change immediately after first login**

2. **Enable Multi-Factor Authentication (MFA) - HIGHLY RECOMMENDED:**
   - Navigate to Collections > `_superusers`
   - Edit collection settings
   - Enable MFA/OTP requirement
   - This enforces email-based one-time passwords for admin access

3. **Enable Rate Limiting - HIGHLY RECOMMENDED:**
   - Navigate to Settings > Application
   - Enable the built-in rate limiter (available since PocketBase v0.23.0)
   - Recommended settings:
     - Auth endpoints: 10 requests/minute per IP
     - API endpoints: 100 requests/minute per IP
   - Prevents brute force attacks and API abuse

4. **Configure Logging:**
   - Navigate to Settings > Logs
   - Set log level to `info` (or `debug` for troubleshooting)
   - Configure retention policy (e.g., 30 days)

5. **Configure Email (Recommended):**
   - Navigate to Settings > Mail
   - Configure SMTP for password resets and notifications
   - Recommended services: MailerSend, SendGrid, Mailgun, or AWS SES
   - Test SMTP settings before deploying
   - **Note:** Without SMTP, MFA cannot send verification codes

6. **Configure User IP Proxy Headers:**
   - If behind a reverse proxy (nginx, Caddy, etc.)
   - Navigate to Settings > Application
   - Set "Trusted proxy headers" to: `X-Real-IP` or `X-Forwarded-For`
   - This ensures accurate IP logging and rate limiting

7. **User Management:**
   - Create admin users via the Users collection
   - Disable default accounts after setup:
     - Deactivate `admin@example.com` superuser
     - Ensure only application admins exist
     - Set `TM_ALLOW_DEFAULT_ACCOUNTS=false` in environment

### 2.3 Data Directory Persistence

Ensure data directory is properly configured:

```bash
# Check data directory
ls -la /opt/anjam/data/

# Expected structure
# data/
# ├── data.db           (SQLite database)
# └── files/            (Uploaded files, if enabled)
```

Mount data directory on a persistent volume:

```bash
# Example: Using bind mount
mount --bind /mnt/persistent-storage/anjam-data /opt/anjam/data

# For Docker: Use named volumes
docker volume create anjam-data
```

## Part 3: Operational Procedures

### 3.1 Health Checks

Check application health:

```bash
# HTTP health check
curl -s https://ianjam.ir/api/health

# Docker health check
docker inspect --format='{{.State.Health.Status}}' anjam

# Docker container logs
docker logs --tail 100 anjam

# System resource check (Docker)
docker stats anjam --no-stream

# System resource check (non-Docker)
ps aux | grep anjam
df -h /opt/anjam/data

# Database integrity check (run periodically)
# For Docker:
docker exec anjam sqlite3 /app/data/data.db "PRAGMA integrity_check;"
# For non-Docker:
sqlite3 /opt/anjam/data/data.db "PRAGMA integrity_check;"
```

### 3.2 Monitoring and Alerting

Recommended metrics to monitor:

- **Process Health:**
  - CPU usage (should be < 10% at rest)
  - Memory usage (should be < 500 MB)
  - File descriptor count

- **Disk Usage:**
  - Database file size: `/opt/anjam/data/data.db`
  - Alert when usage > 80% of available space

- **Response Time:**
  - API response time should be < 500 ms
  - Database query time < 100 ms

PocketBase does not expose a native Prometheus metrics endpoint. If you need metrics,
use system-level monitoring or add a dedicated exporter.

### 3.3 Backup Procedures

PocketBase v0.16+ includes built-in backup/restore APIs accessible via the Dashboard settings.
Backups are ZIP archives of the `pb_data` directory and can be stored locally or in S3-compatible storage.
The application enters read-only mode briefly during backup generation.

**Option 1: PocketBase Built-in Backups (Recommended)**

1. Access PocketBase admin UI at `https://ianjam.ir/_/`
2. Navigate to Settings > Backups
3. Configure backup settings:
   - Enable scheduled backups
   - Set retention policy
   - Optionally configure S3-compatible storage (MinIO, AWS S3, etc.)
4. Test restore procedure in a staging environment

**Option 2: Automated File-based Backup**

Create `/opt/anjam/backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR=/mnt/backups/anjam
DATA_DIR=/opt/anjam/data
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
cp $DATA_DIR/data.db $BACKUP_DIR/data.db.$TIMESTAMP
gzip $BACKUP_DIR/data.db.$TIMESTAMP

# Backup files (if applicable)
if [ -d "$DATA_DIR/files" ]; then
    tar -czf $BACKUP_DIR/files.$TIMESTAMP.tar.gz $DATA_DIR/files
fi

# Keep only last 30 days of backups
find $BACKUP_DIR -name "data.db.*" -mtime +30 -delete
find $BACKUP_DIR -name "files.*.tar.gz" -mtime +30 -delete

echo "Backup completed: $TIMESTAMP"
```

Schedule with cron:

```bash
0 2 * * * /opt/anjam/backup.sh >> /var/log/anjam-backup.log 2>&1
```

**Manual Backup:**

```bash
# For Docker deployments:
docker exec anjam sqlite3 /app/data/data.db ".backup '/app/data/backup.db'"
docker cp anjam:/app/data/backup.db /mnt/backups/data.db.$(date +%Y%m%d)
docker exec anjam rm /app/data/backup.db

# For non-Docker deployments:
cp /opt/anjam/data/data.db /mnt/backups/data.db.backup

# Verify backup integrity
sqlite3 /mnt/backups/data.db.backup "PRAGMA integrity_check;"
```

**Docker Volume Backup:**

```bash
# Create backup of entire data volume
docker run --rm \
  -v anjam-data:/data \
  -v /mnt/backups:/backup \
  alpine tar czf /backup/anjam-data-$(date +%Y%m%d).tar.gz -C /data .
```

### 3.4 System Limits (Linux)

Configure OS limits for production workloads:

Edit `/etc/security/limits.d/anjam.conf`:

```
anjam soft nofile 65536
anjam hard nofile 65536
anjam soft nproc 32768
anjam hard nproc 32768
```

Check current limits:

```bash
ulimit -n   # File descriptors
ulimit -u   # Processes
```

## Part 4: Rollback Procedures

### 4.1 Rollback from Failed Deployment

If the new version has critical issues:

1. **Identify the previous working version:**

   ```bash
   ls -lt /opt/anjam/anjam.* | head -5
   ```

2. **Stop the current service:**

   ```bash
   sudo systemctl stop anjam
   ```

3. **Restore previous binary:**

   ```bash
   cp /opt/anjam/anjam.previous /opt/anjam/anjam
   chmod 755 /opt/anjam/anjam
   ```

4. **Restore previous database backup (if needed):**

   ```bash
   cp /mnt/backups/data.db.backup.previous /opt/anjam/data/data.db
   ```

5. **Start the service:**

   ```bash
   sudo systemctl start anjam
   ```

6. **Verify health:**
   ```bash
   curl -s https://ianjam.ir/api/health
   ```

### 4.2 Rollback from Database Corruption

If the database becomes corrupted:

1. **Stop the application:**

   ```bash
   sudo systemctl stop anjam
   ```

2. **Restore from backup:**

   ```bash
   gunzip /mnt/backups/data.db.YYYYMMDD_HHMMSS.gz
   cp /mnt/backups/data.db.YYYYMMDD_HHMMSS /opt/anjam/data/data.db
   ```

3. **Verify database integrity:**

   ```bash
   sqlite3 /opt/anjam/data/data.db "PRAGMA integrity_check;"
   ```

4. **Start the application:**
   ```bash
   sudo systemctl start anjam
   ```

## Part 5: Troubleshooting

### Common Issues

**Issue: Port 8090 already in use**

```bash
sudo lsof -i :8090
kill -9 <PID>
```

**Issue: Database locked**

```bash
# Check for stale connections
sqlite3 /opt/anjam/data/data.db ".databases"

# Restart the service
sudo systemctl restart anjam
```

**Issue: High memory usage**

```bash
# Check process memory
ps aux | grep anjam

# Restart with memory monitoring
watch -n 1 'ps aux | grep anjam'
```

**Issue: Slow API responses**

```bash
# Check database size
ls -lh /opt/anjam/data/data.db

# Run VACUUM to optimize
sqlite3 /opt/anjam/data/data.db "VACUUM;"
```

### Log Analysis

View application logs:

PocketBase emits logs to stdout/stderr; use your service manager or container logs.

```bash
# Systemd logs
sudo journalctl -u anjam -f

# Docker logs (if running in a container)
docker logs -f anjam
```

## Part 6: Maintenance

### 6.1 Database Maintenance

Run monthly database optimization:

```bash
# Analyze query performance
sqlite3 /opt/anjam/data/data.db "ANALYZE;"

# Defragment database
sqlite3 /opt/anjam/data/data.db "VACUUM;"

# Rebuild indexes
sqlite3 /opt/anjam/data/data.db "REINDEX;"
```

### 6.2 Security Updates

Monitor for security updates:

```bash
# Check binary version
/opt/anjam/anjam --version

# Subscribe to security announcements
# https://github.com/pocketbase/pocketbase/releases
```

## Checklist: Production Deployment

### Pre-Deployment

- [ ] `.env` file created from `.env.example`
- [ ] Encryption key generated (`openssl rand -hex 16`) and added to `.env`
- [ ] `TM_ALLOW_DEFAULT_ACCOUNTS=false` set (after first admin created)

### Docker Deployment

- [ ] `docker compose up -d --build` successful
- [ ] Container health check passing (`docker inspect --format='{{.State.Health.Status}}' anjam`)
- [ ] Logs show no errors (`docker logs anjam`)
- [ ] Data volume created and mounted (`anjam-data`)

### TLS & Networking

- [ ] TLS certificates installed and configured
- [ ] Reverse proxy configured for HTTPS (nginx/Caddy)
- [ ] WebSocket upgrade headers configured for realtime features

### PocketBase Dashboard Configuration

- [ ] Default superuser credentials changed (admin@example.com)
- [ ] **MFA enabled for `_superusers` collection** (highly recommended)
- [ ] **Rate limiting enabled** (highly recommended)
- [ ] Trusted proxy headers configured (`X-Real-IP` or `X-Forwarded-For`)
- [ ] SMTP configured for password resets and MFA codes
- [ ] Logging level and retention configured

### Data & Backups

- [ ] Backup strategy configured (PocketBase built-in or file-based)
- [ ] Backup schedule tested
- [ ] Restore procedure documented and tested

### Monitoring & Operations

- [ ] Health check endpoint accessible (`/api/health`)
- [ ] Log aggregation configured (if needed)
- [ ] Alerting configured (disk, memory, uptime)
- [ ] Database integrity verified (`PRAGMA integrity_check`)

### Security

- [ ] No sensitive data in environment variables or logs
- [ ] Default accounts disabled/removed
- [ ] Admin UI access restricted (if needed)

## Support and Incident Response

### Incident Response Plan

1. **Detection:** Monitor health checks and alerts
2. **Assessment:** Check logs and system metrics
3. **Mitigation:** Scale, restart, or rollback as needed
4. **Resolution:** Fix root cause and redeploy
5. **Post-Mortem:** Document incident and improvements

### Emergency Contacts

- On-call engineer: [to be configured]
- Database administrator: [to be configured]
- Infrastructure team: [to be configured]

---

**Version:** 1.0
**Last Updated:** 2025-12-26
**Maintained By:** DevOps Team
