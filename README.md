# Uptime Monitor - Self-Hosted Monitoring Platform

A production-ready, self-hosted uptime monitoring platform similar to Uptime Kuma, built with Node.js/Express backend and React frontend.

## Features

✅ **Multi-Protocol Monitoring**
- HTTP/HTTPS monitoring with custom headers and body support
- TCP port monitoring
- ICMP Ping monitoring
- Response time tracking

✅ **Real-Time Dashboard**
- Live service status updates via WebSocket
- Auto-refresh every 10 seconds
- Service grouping (Branches, Warehouses, Data Centers)
- Status color indicators (Green=Up, Red=Down, Amber=Degraded)
- Summary cards showing KPIs

✅ **Uptime Management**
- Uptime percentage tracking (24h, 7d, 30d)
- Historical logs with response times
- Uptime statistics and analytics
- Support for 100+ services

✅ **Alerts & Notifications**
- Email notifications (SMTP support)
- Telegram bot alerts
- Webhook integration
- Alert logs and delivery tracking
- Per-service alert configuration

✅ **Database & Storage**
- SQLite (default, zero-config)
- PostgreSQL (for production/scale)
- Service history tracking
- Alert logs and statistics

✅ **API & Integration**
- RESTful API for service management
- Programmatic service creation/updates
- WebSocket for real-time updates
- JWT authentication support

✅ **Deployment**
- Docker & Docker Compose ready
- Production-optimized
- Health checks included
- Scalable architecture

## Architecture

```
┌─────────────────────────────────────────┐
│       React Frontend (Port 3000)        │
│  - Dashboard with auto-refresh          │
│  - Service cards with status            │
│  - Group filtering                      │
│  - WebSocket real-time updates          │
└────────────┬────────────────────────────┘
             │ REST API + WebSocket
┌────────────▼────────────────────────────┐
│      Node.js/Express Backend            │
│  - Service monitoring scheduler         │
│  - Alert system                         │
│  - Data aggregation                     │
│  - API endpoints                        │
└────────────┬────────────────────────────┘
             │ SQL Queries
┌────────────▼────────────────────────────┐
│    Database (SQLite/PostgreSQL)         │
│  - Services & status history            │
│  - Alerts & logs                        │
│  - Uptime statistics                    │
└─────────────────────────────────────────┘
```

## Quick Start

### Prerequisites

- Node.js 16+ (or Docker)
- npm/yarn or Docker & Docker Compose

### Option 1: Quick Start with Docker (Recommended)

```bash
# Clone the repository
git clone <repo-url>
cd uptime

# Build and start with Docker Compose
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001/api
```

### Option 2: Manual Installation

#### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
nano .env

# Start the server
npm run dev   # Development
npm start     # Production
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env (optional)
echo "REACT_APP_API_URL=http://localhost:3001/api" > .env

# Start development server
npm start

# For production build
npm run build
```

## Configuration

### Backend Environment Variables

```env
# Server
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# Database
DB_TYPE=sqlite          # or postgresql
DB_PATH=./data/uptime.db

# PostgreSQL (if DB_TYPE=postgresql)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=uptime_monitor
DB_USER=uptime
DB_PASSWORD=password

# Authentication
JWT_SECRET=your-secret-key
API_KEY_REQUIRED=false  # require auth for POST/PUT/DELETE

# Email Alerts
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=app-password
SMTP_FROM=noreply@uptimemonitor.com

# Telegram Alerts
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id

# Monitoring
MONITORING_INTERVAL=10000   # 10 seconds
MAX_RESPONSE_TIME=30000     # 30 seconds

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Frontend Environment Variables

```env
REACT_APP_API_URL=http://localhost:3001/api
```

## API Documentation

### Services

#### Create Service
```bash
POST /api/services
Content-Type: application/json

{
  "name": "API Server",
  "url": "https://api.example.com",
  "type": "HTTPS",
  "groupName": "Production",
  "method": "GET",
  "timeout": 30,
  "checkInterval": 10
}
```

#### List Services
```bash
GET /api/services
GET /api/services?group=Production
```

#### Update Service
```bash
PUT /api/services/{id}
Content-Type: application/json

{
  "name": "Updated Name",
  "enabled": true
}
```

#### Delete Service
```bash
DELETE /api/services/{id}
```

#### Service History
```bash
GET /api/services/{id}/history?limit=100
```

#### Uptime Statistics
```bash
GET /api/services/{id}/stats
```

### Alerts

#### Create Alert
```bash
POST /api/alerts
Content-Type: application/json

{
  "serviceId": "svc_xxx",
  "type": "EMAIL",
  "target": "admin@example.com"
}
```

#### Types of Alerts
- `EMAIL`: Send email notifications
- `TELEGRAM`: Send Telegram messages
- `WEBHOOK`: POST to webhook URL

#### List Alerts
```bash
GET /api/services/{serviceId}/alerts
```

#### Update Alert
```bash
PUT /api/alerts/{id}
{
  "enabled": true
}
```

#### Alert Logs
```bash
GET /api/alerts/{id}/logs?limit=50
```

### Dashboard

#### Dashboard Summary
```bash
GET /api/dashboard/summary

Response:
{
  "total": 25,
  "up": 23,
  "down": 2,
  "avgResponseTime": 145,
  "services": [...]
}
```

#### Service Groups
```bash
GET /api/groups

Response:
["Production", "Staging", "Development"]
```

### Real-Time Updates

Connect WebSocket to `/ws` endpoint:

```javascript
const ws = new WebSocket('ws://localhost:3001/ws');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'SERVICE_STATUS_UPDATE') {
    console.log('Service updated:', data.data);
  }
};
```

## Monitoring Types

### HTTP/HTTPS
- Custom method (GET, POST, etc.)
- Custom headers
- Request body for POST/PUT
- Status code validation
- Response time tracking

### TCP Port
- Port connectivity check
- Connection timeout handling
- No data transmission required

### ICMP Ping
- Basic connectivity check
- Response time measurement
- Fallback to TCP if ICMP unavailable

## Alert System

### Email Alerts
1. Configure SMTP settings in `.env`
2. Create alert with type `EMAIL`
3. Provide email address as target

### Telegram Alerts
1. Create Telegram bot via BotFather
2. Set `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`
3. Create alert with type `TELEGRAM`

### Webhook Alerts
1. Create alert with type `WEBHOOK`
2. Provide webhook URL
3. Receives POST request with service status update:
```json
{
  "service": "Service Name",
  "status": "DOWN",
  "message": "Service is now DOWN",
  "timestamp": "2024-03-09T10:30:00Z"
}
```

## Database Schema

### services
- id: Primary key
- name: Service name
- url: Service URL
- type: HTTP, HTTPS, TCP, ICMP
- status: UP, DOWN, DEGRADED, UNKNOWN
- response_time: Last response time in ms
- group_name: Service group
- check_interval: Check frequency in seconds
- enabled: Active/inactive status

### service_history
- id: Primary key
- service_id: Foreign key to services
- status: Status at time of check
- response_time: Response time in ms
- error_message: Error description if any
- created_at: Timestamp

### alerts
- id: Primary key
- service_id: Foreign key to services
- type: EMAIL, TELEGRAM, WEBHOOK
- target: Email, chat ID, or webhook URL
- enabled: Active/inactive status

### uptime_stats
- id: Primary key
- service_id: Foreign key to services
- period: 24h, 7d, 30d
- uptime_percentage: Percentage uptime
- avg_response_time: Average response in ms

## Deployment

### Docker Compose (Recommended)

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop
docker-compose down

# Restart
docker-compose restart
```

### Environment Setup for Production

1. **Create `.env` file** with production values
2. **Change JWT_SECRET** to a strong random string
3. **Configure database** (PostgreSQL recommended)
4. **Set up SSL/TLS** via reverse proxy (nginx)
5. **Configure backups** for database
6. **Monitor container health** with your orchestration platform

### Reverse Proxy (nginx)

```nginx
server {
    listen 80;
    server_name uptime.example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3001/api;
    }

    location /ws {
        proxy_pass http://localhost:3001/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### Kubernetes Deployment

See [k8s-deploy.yaml](./docs/k8s-deploy.yaml) for example Kubernetes manifests.

## Performance

- Supports 100+ services
- 10-second monitoring interval
- Real-time WebSocket updates
- Database query optimization
- In-memory status caching
- Batch operations support

## Security

- JWT token authentication
- SQL injection prevention
- CORS configuration
- Rate limiting ready
- HTTPS support
- Secrets management via environment variables

## Troubleshooting

### Services not updating
- Check monitoring service is running: `docker-compose logs backend`
- Verify database connection
- Check service URLs are accessible

### WebSocket disconnections
- Check firewall allows WebSocket connections
- Verify CORS configuration
- Check browser console for errors

### Alerts not sending
- Verify SMTP/Telegram credentials
- Check alert logs: `/api/alerts/{id}/logs`
- Test webhook with curl

### Database issues
- For SQLite: Check file permissions on `./data/`
- For PostgreSQL: Verify connection string and credentials
- Check migrations ran successfully

## Development

### Project Structure
```
uptime/
├── backend/
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── models/        # Database models
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Express middleware
│   │   ├── utils/         # Helper functions
│   │   └── server.js      # Express server
│   ├── migrations/        # Database migrations
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API service
│   │   ├── styles/        # CSS modules
│   │   └── App.js         # Main component
│   └── package.json
├── docker-compose.yml
└── README.md
```

### Running Tests
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

### Code Style
- Follow Node.js best practices
- Use meaningful variable names
- Add comments for complex logic
- Format with standard conventions

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](./LICENSE) file

## Support

- 📖 [Documentation](./docs/)
- 🐛 [Issue Tracker](./issues)
- 💬 [Discussions](./discussions)

## Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics and reporting
- [ ] Scheduled maintenance windows
- [ ] SSL certificate monitoring
- [ ] Multi-user authentication
- [ ] Data export (CSV, JSON)
- [ ] Custom dashboards
- [ ] Status page generation (public)
- [ ] Incident management
- [ ] Slack integration

---

**Built with ❤️ for DevOps and Operations teams**
