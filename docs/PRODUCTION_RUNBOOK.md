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

**From Docker Container:**

Use the repo Dockerfile at `infra/Dockerfile`:

```bash
docker build -f infra/Dockerfile -t anjam:latest .
docker run -d \
  --name anjam \
  -p 8090:8090 \
  -v anjam-data:/app/data \
  -e TM_ALLOW_DEFAULT_ACCOUNTS=false \
  anjam:latest
```

If using docker compose, make sure the compose file points to `infra/Dockerfile`:

```bash
docker compose -f infra/docker-compose.yml up -d --build
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
ExecStart=/opt/anjam/anjam --http=0.0.0.0:8090
Restart=on-failure
RestartSec=10s
Environment="TM_ALLOW_DEFAULT_ACCOUNTS=false"

[Install]
WantedBy=multi-user.target
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

Access PocketBase admin UI at `https://ianjam.ir/admin`:

1. **Default Credentials:**
   - Email: `admin@example.com`
   - Password: `admin12345`
   - **Change immediately after first login**

2. **Enable Rate Limiting:**
   - Navigate to Settings > Application
   - Set rate limiting if needed (PocketBase built-in feature)

3. **Configure Logging:**
   - Navigate to Settings > Logs
   - Set log level to `info` (or `debug` for troubleshooting)
   - Configure retention policy (e.g., 30 days)

4. **Configure Email (Optional):**
   - Navigate to Settings > Mail
   - Configure SMTP if email notifications are needed
   - Test SMTP settings before deploying

5. **User Management:**
   - Create admin users via the Users collection
   - Disable default accounts after setup:
     - Deactivate `admin@example.com`
     - Or ensure only application admins exist and set `TM_ALLOW_DEFAULT_ACCOUNTS=false`

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

# System resource check
ps aux | grep anjam
df -h /opt/anjam/data

# Database integrity check (run periodically)
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

**Automated Daily Backup:**

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
# Backup database
cp /opt/anjam/data/data.db /mnt/backups/data.db.backup

# Verify backup integrity
sqlite3 /mnt/backups/data.db.backup "PRAGMA integrity_check;"
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

- [ ] Binary deployed and executable
- [ ] Data directory created and permissions set (700)
- [ ] TLS certificates installed and configured
- [ ] Reverse proxy configured for HTTPS
- [ ] Systemd service created and enabled
- [ ] Default credentials changed
- [ ] Rate limiting configured (if needed)
- [ ] Logging enabled and configured
- [ ] Email configuration tested (if needed)
- [ ] Daily backup script scheduled
- [ ] Monitoring and alerting configured
- [ ] OS limits configured
- [ ] Database integrity verified
- [ ] Health checks passing
- [ ] Documentation updated with deployment details

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
