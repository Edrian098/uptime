# Uptime Monitor API Documentation

## Base URL

```
http://localhost:3001/api
https://uptime.example.com/api  (production)
```

## Authentication

Most endpoints support optional JWT authentication via Bearer token:

```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3001/api/services
```

## Services

### List All Services

```http
GET /services
GET /services?group=Production
```

**Query Parameters:**
- `group` (optional): Filter by group name

**Response:**
```json
[
  {
    "id": "svc_abc123",
    "name": "Production API",
    "url": "https://api.example.com",
    "type": "HTTPS",
    "status": "UP",
    "response_time": 145,
    "group_name": "Production",
    "last_check": "2024-03-09T10:30:00Z",
    "enabled": true,
    "check_interval": 10,
    "timeout": 30,
    "port": null,
    "method": "GET",
    "created_at": "2024-03-01T00:00:00Z"
  }
]
```

### Get Service Details

```http
GET /services/{id}
```

**Response:** Single service object

### Create Service

```http
POST /services
Content-Type: application/json

{
  "name": "Production API",
  "url": "https://api.example.com",
  "type": "HTTPS",
  "groupName": "Production",
  "method": "GET",
  "timeout": 30,
  "checkInterval": 10,
  "port": null,
  "body": null,
  "headers": {
    "Authorization": "Bearer token",
    "User-Agent": "Uptime-Monitor"
  }
}
```

**Required Fields:**
- `name`: Service name
- `url`: Service URL
- `type`: HTTP, HTTPS, TCP, or ICMP

**Optional Fields:**
- `groupName`: Service group
- `method`: HTTP method (default: GET)
- `timeout`: Timeout in seconds (default: 30)
- `checkInterval`: Check frequency in seconds (default: 10)
- `port`: Port number (for TCP)
- `body`: Request body
- `headers`: Custom headers object

**Response:**
```json
{
  "id": "svc_abc123",
  "name": "Production API",
  "url": "https://api.example.com",
  "type": "HTTPS",
  "status": "UNKNOWN",
  "response_time": 0,
  "group_name": "Production",
  "enabled": true,
  "check_interval": 10,
  "timeout": 30,
  "created_at": "2024-03-09T10:30:00Z"
}
```

### Update Service

```http
PUT /services/{id}
Content-Type: application/json

{
  "name": "Updated Name",
  "enabled": false,
  "timeout": 60
}
```

**Updateable Fields:**
- `name`
- `url`
- `type`
- `groupName`
- `enabled`
- `checkInterval`
- `timeout`
- `port`
- `method`
- `body`
- `headers`

### Delete Service

```http
DELETE /services/{id}
```

**Response:**
```json
{
  "success": true
}
```

### Service History

```http
GET /services/{id}/history?limit=100
```

**Query Parameters:**
- `limit`: Number of records (default: 100, max: 1000)

**Response:**
```json
[
  {
    "id": "hist_xyz789",
    "service_id": "svc_abc123",
    "status": "UP",
    "response_time": 145,
    "error_message": null,
    "created_at": "2024-03-09T10:30:00Z"
  }
]
```

### Service Statistics

```http
GET /services/{id}/stats
```

**Response:**
```json
[
  {
    "id": "stat_123",
    "service_id": "svc_abc123",
    "period": "24h",
    "uptime_percentage": 99.5,
    "downtime_minutes": 7,
    "incidents": 1,
    "avg_response_time": 142,
    "created_at": "2024-03-09T00:00:00Z"
  }
]
```

## Alerts

### Create Alert

```http
POST /alerts
Content-Type: application/json

{
  "serviceId": "svc_abc123",
  "type": "EMAIL",
  "target": "admin@example.com"
}
```

**Alert Types:**
- `EMAIL`: Email notification
- `TELEGRAM`: Telegram bot message
- `WEBHOOK`: HTTP POST webhook

### List Service Alerts

```http
GET /services/{id}/alerts
```

**Response:**
```json
[
  {
    "id": "alrt_456",
    "service_id": "svc_abc123",
    "type": "EMAIL",
    "target": "admin@example.com",
    "enabled": true,
    "created_at": "2024-03-01T00:00:00Z"
  }
]
```

### Update Alert

```http
PUT /alerts/{id}
Content-Type: application/json

{
  "enabled": false,
  "type": "TELEGRAM",
  "target": "987654321"
}
```

### Delete Alert

```http
DELETE /alerts/{id}
```

### Alert Logs

```http
GET /alerts/{id}/logs?limit=50
```

**Response:**
```json
[
  {
    "id": "alog_789",
    "alert_id": "alrt_456",
    "service_id": "svc_abc123",
    "status": "DOWN",
    "message": "Service is now DOWN",
    "sent_at": "2024-03-09T10:30:00Z",
    "success": true,
    "response": ""
  }
]
```

## Dashboard

### Summary Statistics

```http
GET /dashboard/summary
```

**Response:**
```json
{
  "total": 25,
  "up": 23,
  "down": 2,
  "avgResponseTime": 145,
  "services": [
    {
      "id": "svc_abc123",
      "name": "Production API",
      "status": "UP",
      "response_time": 145,
      "group_name": "Production",
      "last_check": "2024-03-09T10:30:00Z"
    }
  ]
}
```

### Service Groups

```http
GET /groups
```

**Response:**
```json
[
  "Production",
  "Staging",
  "External Services",
  "Internal Services"
]
```

## Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "UP",
  "timestamp": "2024-03-09T10:30:00Z"
}
```

## Error Responses

### 400 Bad Request

```json
{
  "error": "Missing required fields",
  "status": 400,
  "timestamp": "2024-03-09T10:30:00Z"
}
```

### 401 Unauthorized

```json
{
  "error": "Missing authentication token",
  "status": 401,
  "timestamp": "2024-03-09T10:30:00Z"
}
```

### 404 Not Found

```json
{
  "error": "Service not found",
  "status": 404,
  "timestamp": "2024-03-09T10:30:00Z"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal Server Error",
  "status": 500,
  "timestamp": "2024-03-09T10:30:00Z"
}
```

## Rate Limiting

Currently no rate limiting implemented. Recommended for production:
- 100 requests/minute per IP
- 10 requests/second per API key

## WebSocket

Connect to `/ws` endpoint for real-time updates:

```javascript
const ws = new WebSocket('ws://localhost:3001/ws');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'SERVICE_STATUS_UPDATE') {
    console.log('Service status updated:', data.data);
    // {
    //   id, name, url, type, status, response_time,
    //   lastCheck, lastStatusChange, ...
    // }
  }
};
```

## Pagination

Most list endpoints support cursor-based pagination via query parameters:
- `limit`: Items per page (default: 50, max: 500)
- `offset`: Number of items to skip

Example:
```http
GET /services/abc/history?limit=50&offset=100
```

## Rate Limit Headers

Response headers (expected in future):
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1678432200
```

## Examples

### Create and Monitor an HTTP Service

```bash
# 1. Create service
curl -X POST http://localhost:3001/api/services \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My API",
    "url": "https://api.example.com/health",
    "type": "HTTPS",
    "groupName": "Production"
  }'

# 2. Create email alert
curl -X POST http://localhost:3001/api/alerts \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": "svc_...",
    "type": "EMAIL",
    "target": "admin@example.com"
  }'

# 3. Monitor status
curl http://localhost:3001/api/services/svc_.../history

# 4. View stats
curl http://localhost:3001/api/services/svc_.../stats
```

### WebSocket Real-Time Monitoring

```javascript
const ws = new WebSocket('ws://localhost:3001/ws');

ws.onopen = () => {
  console.log('Connected to monitoring stream');
};

ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  
  if (update.type === 'SERVICE_STATUS_UPDATE') {
    const service = update.data;
    console.log(`${service.name}: ${service.status} (${service.response_time}ms)`);
    
    // Update UI, database, etc.
  }
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = () => {
  console.log('Disconnected from monitoring stream');
  // Reconnect after delay
  setTimeout(() => location.reload(), 3000);
};
```

---

For more information, see [README.md](./README.md)
