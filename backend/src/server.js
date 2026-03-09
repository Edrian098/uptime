require('dotenv').config();
const express = require('express');
const cors = require('cors');
const expressWs = require('express-ws');
const path = require('path');

const database = require('./utils/database');
const { startMonitoring } = require('./services/schedulerService');
const apiRoutes = require('./routes/api');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// Apply express-ws to app
expressWs(app);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../frontend/build')));

// API Routes
app.use('/api', apiRoutes);

// WebSocket endpoint for real-time updates
const MonitoringService = require('./services/monitoringService');
app.ws('/ws', (ws, req) => {
  console.log('WebSocket client connected');
  MonitoringService.clients.add(ws);
  
  ws.on('message', (msg) => {
    console.log('WS Message:', msg);
  });
  
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
    MonitoringService.clients.delete(ws);
  });
  
  ws.on('error', (err) => {
    console.error('WebSocket error:', err);
    MonitoringService.clients.delete(ws);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'UP', timestamp: new Date().toISOString() });
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/build/index.html'));
});

// Error handling middleware
app.use(errorHandler);

// Initialize database and start server
async function startServer() {
  try {
    await database.init();
    console.log('✓ Database initialized');
    
    const server = app.listen(PORT, process.env.HOST || '0.0.0.0', () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
    });
    
    // Start monitoring service
    startMonitoring(server);
    
    // Handle graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('SIGTERM received, shutting down gracefully');
      server.close(async () => {
        await database.close();
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('✗ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
