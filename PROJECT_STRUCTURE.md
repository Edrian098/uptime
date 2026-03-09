# Project Structure

## Directory Layout

```
uptime/
│
├── backend/                          # Node.js/Express Server
│   ├── src/
│   │   ├── routes/
│   │   │   └── api.js               # REST API routes
│   │   ├── models/
│   │   │   ├── Service.js           # Service CRUD operations
│   │   │   └── Alert.js             # Alert CRUD operations
│   │   ├── services/
│   │   │   ├── monitoringService.js # Health check logic
│   │   │   └── schedulerService.js  # Monitoring scheduler
│   │   ├── middleware/
│   │   │   ├── auth.js              # JWT authentication
│   │   │   └── errorHandler.js      # Error handling
│   │   ├── utils/
│   │   │   ├── database.js          # DB abstraction layer
│   │   │   └── helpers.js           # Helper utilities
│   │   └── server.js                # Express app setup
│   ├── migrations/                  # Database migrations
│   ├── data/                        # SQLite database file
│   ├── package.json                 # Dependencies
│   ├── .env.example                 # Environment template
│   ├── .env                         # Production config (git-ignored)
│   ├── .dockerignore
│   ├── .gitignore
│   └── Dockerfile
│
├── frontend/                        # React Dashboard
│   ├── src/
│   │   ├── components/
│   │   │   └── ServiceCard.js       # Service status card
│   │   ├── pages/
│   │   │   └── Dashboard.js         # Main dashboard
│   │   ├── hooks/
│   │   │   └── useData.js           # Custom React hooks
│   │   ├── services/
│   │   │   └── api.js               # API client service
│   │   ├── styles/
│   │   │   ├── index.css            # Global styles
│   │   │   ├── Dashboard.css        # Dashboard styles
│   │   │   ├── ServiceCard.css      # Card styles
│   │   │   └── App.css              # App styles
│   │   ├── App.js                   # Root component
│   │   └── index.js                 # React DOM render
│   ├── public/
│   │   └── index.html               # HTML template
│   ├── package.json                 # Dependencies
│   ├── .dockerignore
│   ├── .gitignore
│   └── Dockerfile
│
├── docs/                           # Documentation
│   ├── API.md                      # API references
│   └── k8s/                        # Kubernetes configs
│
├── docker-compose.yml              # Multi-container orchestration
├── .gitignore                       # Root git ignore
├── README.md                        # Project documentation
├── QUICKSTART.md                    # Quick start guide
├── PRODUCTION.md                    # Production deployment guide
└── PROJECT_STRUCTURE.md             # This file

```

## Key Files Overview

### Backend

#### `server.js` - Express Server Setup
- Initializes Express app
- Sets up middleware (CORS, JSON parsing)
- Mounts API routes
- Establishes WebSocket connection
- Starts monitoring service

#### `api.js` - REST Routes
- `POST /api/services` - Create service
- `GET /api/services` - List services
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service
- `GET /api/services/:id/history` - Service history
- `GET /api/services/:id/stats` - Uptime statistics
- `POST /api/alerts` - Create alert
- `GET /api/services/:id/alerts` - Service alerts
- `GET /api/dashboard/summary` - Dashboard data
- `GET /api/groups` - Service groups

#### `monitoringService.js` - Core Monitoring Logic
- HTTP/HTTPS health checks
- TCP port checks
- ICMP ping (via TCP fallback)
- Service status updates
- Alert triggering
- WebSocket broadcasting

#### `schedulerService.js` - Monitoring Scheduler
- Executes health checks every 10 seconds
- Calculates uptime statistics
- Manages check history
- Triggers alerts on status change

#### `database.js` - Database Abstraction
- Supports SQLite and PostgreSQL
- CRUD operations
- Connection pooling
- Transaction management

### Frontend

#### `Dashboard.js` - Main Dashboard Page
- Real-time service status
- Service grouping filter
- Summary statistics
- Auto-refresh capability
- WebSocket integration

#### `ServiceCard.js` - Service Display Component
- Service status display
- Response time indicator
- Group assignment display
- Action buttons (edit, delete)
- Last check timestamp

#### `api.js` - API Client Service
- Axios instance configuration
- API endpoint wrappers
- WebSocket connection utility
- Request/response handling

#### `useData.js` - Custom Hooks
- `useWebSocket()` - WebSocket connection control
- `useAsync()` - Async data fetching
- Auto-reconnection logic
- Error handling

## Database Tables

### services
```sql
id (PK)
name
url
type (HTTP, HTTPS, TCP, ICMP)
group_name
status (UP, DOWN, DEGRADED, UNKNOWN)
response_time (ms)
last_check
last_status_change
enabled (bool)
check_interval (seconds)
timeout (seconds)
max_retries
port
method (GET, POST, etc)
body
headers (JSON)
certificate_expiry_days
created_at
updated_at
```

### service_history
```sql
id (PK)
service_id (FK)
status
response_time (ms)
error_message
created_at
```

### alerts
```sql
id (PK)
service_id (FK)
type (EMAIL, TELEGRAM, WEBHOOK)
target (email, chat_id, or webhook_url)
enabled (bool)
created_at
```

### alert_logs
```sql
id (PK)
alert_id (FK)
service_id (FK)
status
message
sent_at
success (bool)
response
```

### uptime_stats
```sql
id (PK)
service_id (FK)
period (24h, 7d, 30d)
uptime_percentage
downtime_minutes
incidents
avg_response_time (ms)
created_at
UNIQUE(service_id, period)
```

### users
```sql
id (PK)
username (UNIQUE)
email (UNIQUE)
password (hashed)
role (admin, user)
created_at
updated_at
```

## Data Flow

```
1. CLIENT REQUEST
   ↓
2. NGINX REVERSE PROXY
   ↓
3. EXPRESS SERVER
   ├─ API Routes → Controller → Model → Database
   ├─ WebSocket → MonitoringService → Clients
   └─ Health Check → Monitoring Scheduler
   ↓
4. SCHEDULER (every 10s)
   ├─ Fetch enabled services
   ├─ Execute health checks
   ├─ Update service status
   ├─ Store history
   ├─ Trigger alerts
   └─ Broadcast via WebSocket
   ↓
5. DATABASE
   ├─ SQLite/PostgreSQL
   └─ Persistent storage
   ↓
6. ALERTS
   ├─ Email (SMTP)
   ├─ Telegram
   └─ Webhook
```

## Technology Stack

### Backend
- **Runtime**: Node.js 16+
- **Framework**: Express.js 4.x
- **Database**: SQLite 3 / PostgreSQL 13+
- **Task Scheduler**: node-cron
- **HTTP Client**: axios
- **WebSocket**: express-ws
- **Authentication**: jsonwebtoken
- **Crypto**: bcryptjs
- **Email**: nodemailer
- **Notifications**: telegram-bot-api

### Frontend
- **Framework**: React 18+
- **Routing**: react-router-dom
- **HTTP Client**: axios
- **Charts**: recharts (optional)
- **Icons**: react-icons
- **Date/Time**: moment
- **Styling**: CSS Modules / Tailwind

### Infrastructure
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Reverse Proxy**: Nginx
- **SSL/TLS**: Let's Encrypt
- **Monitoring**: Docker health checks

## Code Organization Principles

1. **Separation of Concerns**
   - Routes handle HTTP
   - Models handle database
   - Services handle business logic
   - Components handle UI

2. **DRY (Don't Repeat Yourself)**
   - Helper utilities in `utils/`
   - Shared middleware in `middleware/`
   - API client in `services/`

3. **Error Handling**
   - Try-catch blocks
   - Error response middleware
   - Graceful fallbacks

4. **Security**
   - Input validation
   - SQL injection prevention
   - CORS configuration
   - JWT authentication

5. **Performance**
   - Database query optimization
   - Connection pooling
   - Caching where applicable
   - Lazy loading in React

## Adding New Features

### Adding New Monitoring Type
1. Add type check in `monitoringService.js`:
   ```javascript
   async checkNewType(service) { ... }
   ```
2. Add parsing logic in `checkService()`
3. Update frontend type options

### Adding New Alert Type
1. Add send method in `monitoringService.js`:
   ```javascript
   async sendNewTypeAlert(target, message) { ... }
   ```
2. Update alert creation validation
3. Test alert delivery

### Adding New Dashboard Widget
1. Create component in `src/components/`
2. Import in `Dashboard.js`
3. Style with CSS module
4. Fetch data from API

---

See [README.md](../README.md) for full documentation.
