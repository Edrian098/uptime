# Production Deployment Guide

## Pre-Deployment Checklist

- [ ] Copy `.env.example` to `.env` and update all values
- [ ] Change `JWT_SECRET` to a random 32+ character string
- [ ] Set up database backups
- [ ] Configure SSL/TLS certificates
- [ ] Set up reverse proxy (nginx/Apache)
- [ ] Configure firewall rules
- [ ] Test all alert integrations
- [ ] Set up monitoring for the monitoring system
- [ ] Prepare disaster recovery plan

## Environment Configuration

### Generate Secure JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Production .env Template
```env
# Server
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# Database (PostgreSQL recommended)
DB_TYPE=postgresql
DB_HOST=db.example.com
DB_PORT=5432
DB_NAME=uptime_monitor
DB_USER=uptime
DB_PASSWORD=$(openssl rand -base64 32)

# Security
JWT_SECRET=$(openssl rand -hex 32)
API_KEY_REQUIRED=true
ENABLE_REGISTRATION=false

# Notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=alerts@example.com
SMTP_PASSWORD=generated-app-password

# Telegram (optional)
TELEGRAM_BOT_TOKEN=your-token
TELEGRAM_CHAT_ID=your-chat-id

# Frontend
FRONTEND_URL=https://uptime.example.com

# Monitoring
MONITORING_INTERVAL=10000
MAX_RESPONSE_TIME=30000
```

## Docker Compose Production Deployment

### Step 1: Prepare Environment
```bash
# Create production directory
mkdir -p /opt/uptime
cd /opt/uptime

# Clone repository
git clone <repo-url> .

# Create .env file
cp backend/.env.example .env
nano .env  # Edit with production values

# Create data directory
mkdir -p data
chmod 700 data
```

### Step 2: Configure Docker Compose for Production

Edit `docker-compose.yml`:

```yaml
# Add restart policies
services:
  backend:
    restart: always
    # ... other config

  frontend:
    restart: always
    # ... other config

  db:
    restart: always
    # ... other config
```

### Step 3: Start Services
```bash
# Build images
docker-compose build

# Start in detached mode
docker-compose up -d

# Verify all services started
docker-compose ps

# Check logs
docker-compose logs -f
```

### Step 4: Enable Health Checks
```bash
# Monitor container health
watch -n 10 'docker-compose ps'

# View health check details
docker inspect uptime-backend | grep -A 5 '"Health"'
```

## Nginx Reverse Proxy Configuration

### Setup Nginx
```bash
# Install nginx
sudo apt-get update && sudo apt-get install nginx -y

# Enable service
sudo systemctl enable nginx
sudo systemctl start nginx
```

### SSL Certificate with Let's Encrypt
```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx -y

# Get certificate (www.example.com and example.com)
sudo certbot certonly --standalone \
  -d uptime.example.com \
  -d www.uptime.example.com
```

### Nginx Configuration
Create `/etc/nginx/sites-available/uptime`:

```nginx
upstream backend {
    server localhost:3001;
}

upstream frontend {
    server localhost:3000;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name uptime.example.com www.uptime.example.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name uptime.example.com www.uptime.example.com;

    # SSL Certificates
    ssl_certificate /etc/letsencrypt/live/uptime.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/uptime.example.com/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Compression
    gzip on;
    gzip_types text/plain text/css text/javascript application/json application/javascript;

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # API
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket
    location /ws {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Enable Nginx Configuration
```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/uptime /etc/nginx/sites-enabled/

# Remove default
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

## Database Backups

### Manual Backup (SQLite)
```bash
# Backup SQLite database
cp ./backend/data/uptime.db ./backups/uptime-$(date +%Y%m%d-%H%M%S).db

# Compress
gzip ./backups/uptime-*.db
```

### Automated Backup (PostgreSQL)
Create `/opt/uptime/backup.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/opt/uptime/backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="$BACKUP_DIR/uptime-$TIMESTAMP.sql"

mkdir -p $BACKUP_DIR

# Backup database
docker-compose exec -T db pg_dump \
  -U uptime \
  uptime_monitor > "$BACKUP_FILE"

# Compress
gzip "$BACKUP_FILE"

# Keep only 30 days of backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE.gz"
```

### Schedule Backups with Cron
```bash
# Add to crontab (daily at 2 AM)
crontab -e

# Add line:
0 2 * * * /opt/uptime/backup.sh >> /var/log/uptime-backup.log 2>&1
```

## Monitoring the Monitor

### System Metrics
```bash
# Install monitoring tools
sudo apt-get install htop iotop -y

# Monitor Docker containers
docker stats --no-stream
```

### Log Aggregation
```bash
# View all logs
docker-compose logs

# Follow logs
docker-compose logs -f

# Filter by service
docker-compose logs -f backend
```

### Set up Alerts
Monitor these metrics:
- Container restart count
- Database connection errors
- Memory usage
- Disk space (esp. database)
- WebSocket connection count
- API response time

## Scaling

### Horizontal Scaling
For multiple instances:

1. **Load Balancer**: Route traffic across multiple backend instances
2. **Database**: Use shared PostgreSQL instance
3. **Redis Cache** (optional): For session storage

### Vertical Scaling
For single machine:

1. Increase Docker resource limits
2. Optimize database queries
3. Increase monitoring interval for better performance

## Maintenance

### Regular Tasks
- [ ] Check disk space: `df -h`
- [ ] Monitor logs for errors
- [ ] Test restore from backup monthly
- [ ] Update Docker images: `docker-compose pull`
- [ ] Review and rotate logs
- [ ] Check certificate expiry
- [ ] Update OS security patches

### Update Procedure
```bash
# Pull latest code
git pull origin main

# Rebuild images
docker-compose build

# Restart services (no downtime)
docker-compose up -d
```

## Disaster Recovery

### Recovery from Database Loss
1. Stop services: `docker-compose down`
2. Restore from backup: `docker-compose exec db psql < backup.sql`
3. Restart: `docker-compose up -d`

### Recovery from Complete Failure
1. Set up new server
2. Install Docker and Docker Compose
3. Clone repository
4. Restore `.env` configuration
5. Restore database from backup
6. Start with `docker-compose up -d`

## Monitoring URLs
- Dashboard: https://uptime.example.com
- API Health: https://uptime.example.com/api/dashboard/summary
- Backend Health: https://uptime.example.com:3001/health (if exposed to firewall)

## Security Hardening

```bash
# UFW Firewall Rules
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# File Permissions
chmod 700 /opt/uptime/data
chmod 600 /opt/uptime/.env

# Docker Security Updates
docker system prune -a
docker image prune
```

---

See [README.md](./README.md) for more information.
