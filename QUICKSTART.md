# Quick Start Guide

## 5-Minute Setup with Docker

### Step 1: Clone & Navigate
```bash
git clone <repo-url>
cd uptime
```

### Step 2: Start with Docker Compose
```bash
docker-compose up -d
```

### Step 3: Verify Services
```bash
# Check all containers are running
docker-compose ps

# Check backend logs
docker-compose logs backend

# Check frontend logs
docker-compose logs frontend
```

### Step 4: Access Application
- **Dashboard**: http://localhost:3000
- **API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/health

---

## Adding Your First Service

### Via Dashboard UI
1. Open http://localhost:3000
2. Click "Add Service"
3. Fill in:
   - **Name**: Service name (e.g., "Google DNS")
   - **URL**: Service URL (e.g., "https://8.8.8.8")
   - **Type**: HTTP, HTTPS, TCP, or ICMP
   - **Group**: Optional grouping (e.g., "External")
4. Click "Create"

### Via API
```bash
curl -X POST http://localhost:3001/api/services \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Production API",
    "url": "https://api.example.com",
    "type": "HTTPS",
    "groupName": "Production",
    "timeout": 30,
    "checkInterval": 10
  }'
```

---

## Setting Up Alerts

### Email Alerts
1. Configure SMTP in `.env`:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=app-password
   ```

2. Restart backend:
   ```bash
   docker-compose restart backend
   ```

3. Create alert via API:
   ```bash
   curl -X POST http://localhost:3001/api/alerts \
     -H "Content-Type: application/json" \
     -d '{
       "serviceId": "svc_xxx",
       "type": "EMAIL",
       "target": "admin@example.com"
     }'
   ```

### Telegram Alerts
1. Create bot with BotFather on Telegram
2. Set in `.env`:
   ```env
   TELEGRAM_BOT_TOKEN=123456:ABCDefg
   TELEGRAM_CHAT_ID=987654321
   ```

3. Create alert:
   ```bash
   curl -X POST http://localhost:3001/api/alerts \
     -H "Content-Type: application/json" \
     -d '{
       "serviceId": "svc_xxx",
       "type": "TELEGRAM",
       "target": "987654321"
     }'
   ```

### Webhook Alerts
```bash
curl -X POST http://localhost:3001/api/alerts \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": "svc_xxx",
    "type": "WEBHOOK",
    "target": "https://your-webhook.com/notify"
  }'
```

---

## Database Setup

### SQLite (Default)
- Zero configuration needed
- Data stored in `./backend/data/uptime.db`
- Good for up to 100+ services

### PostgreSQL (Production)

1. Uncomment PostgreSQL in `docker-compose.yml`
2. Set in `.env`:
   ```env
   DB_TYPE=postgresql
   DB_HOST=db
   DB_PORT=5432
   DB_NAME=uptime_monitor
   DB_USER=uptime
   DB_PASSWORD=secure_password
   ```

3. Restart:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

---

## Viewing Monitoring Data

### Dashboard Summary
```bash
curl http://localhost:3001/api/dashboard/summary
```

### Service History
```bash
curl http://localhost:3001/api/services/{service-id}/history?limit=100
```

### Uptime Stats
```bash
curl http://localhost:3001/api/services/{service-id}/stats
```

---

## Stopping & Restarting

```bash
# Stop all services
docker-compose down

# Restart (preserves data)
docker-compose up -d

# View logs in real-time
docker-compose logs -f

# Specific container logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

---

## Troubleshooting

### Services not showing status
```bash
# Check backend is running
docker-compose logs backend

# Verify database
docker-compose exec backend ls -la data/
```

### Frontend not loading
```bash
# Check frontend container
docker-compose logs frontend

# Verify port 3000 is accessible
curl http://localhost:3000
```

### Database connection error
```bash
# Check database container
docker-compose logs db

# Verify PostgreSQL credentials if using PG
docker-compose exec db psql -U uptime -d uptime_monitor
```

---

## Next Steps

- Configure more monitoring types (TCP, ICMP)
- Set up alert notifications
- Add service groups for organization
- Configure reverse proxy (nginx)
- Set up automated backups
- Deploy to production

See [README.md](./README.md) for detailed documentation.
