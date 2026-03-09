const cron = require('node-cron');
const Database = require('../utils/database');
const MonitoringService = require('./monitoringService');

// Store active monitoring tasks
const activeTasks = new Map();

async function startMonitoring(server) {
  console.log('Starting monitoring service...');
  
  // Initial check every 10 seconds
  const mainTask = cron.schedule('*/10 * * * * *', async () => {
    await performHealthChecks();
  });
  
  // Calculate uptime stats hourly
  const statsTask = cron.schedule('0 * * * *', async () => {
    await calculateUptimeStats();
  });
  
  console.log('✓ Monitoring service started');
  
  // Perform initial check
  await performHealthChecks();
  
  return { mainTask, statsTask };
}

async function performHealthChecks() {
  try {
    const services = await Database.all(
      `SELECT * FROM services WHERE enabled = 1`
    );
    
    for (const service of services) {
      try {
        const result = await MonitoringService.checkService(service);
        const updatedService = await MonitoringService.updateServiceStatus(service, result);
        
        // Broadcast update to connected WebSocket clients
        MonitoringService.broadcastUpdate({
          type: 'SERVICE_STATUS_UPDATE',
          data: updatedService
        });
      } catch (error) {
        console.error(`Error checking service ${service.id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error performing health checks:', error);
  }
}

async function calculateUptimeStats() {
  try {
    const services = await Database.all(`SELECT id FROM services`);
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    for (const service of services) {
      // Calculate 24H uptime
      await calculatePeriodUptime(service.id, '24h', oneDayAgo);
      
      // Calculate 7D uptime
      await calculatePeriodUptime(service.id, '7d', sevenDaysAgo);
      
      // Calculate 30D uptime
      await calculatePeriodUptime(service.id, '30d', thirtyDaysAgo);
    }
  } catch (error) {
    console.error('Error calculating uptime stats:', error);
  }
}

async function calculatePeriodUptime(serviceId, period, since) {
  try {
    const history = await Database.all(
      `SELECT status, response_time FROM service_history 
       WHERE service_id = ? AND created_at >= ?
       ORDER BY created_at DESC`,
      [serviceId, since.toISOString()]
    );
    
    if (history.length === 0) return;
    
    const upCount = history.filter(h => h.status === 'UP').length;
    const totalCount = history.length;
    const uptime = (upCount / totalCount) * 100;
    const avgResponseTime = Math.round(
      history.reduce((sum, h) => sum + (h.response_time || 0), 0) / totalCount
    );
    
    // Upsert uptime stats
    const existing = await Database.get(
      `SELECT id FROM uptime_stats WHERE service_id = ? AND period = ?`,
      [serviceId, period]
    );
    
    if (existing) {
      await Database.run(
        `UPDATE uptime_stats SET uptime_percentage = ?, avg_response_time = ?
         WHERE service_id = ? AND period = ?`,
        [uptime, avgResponseTime, serviceId, period]
      );
    } else {
      const { v4: uuid } = require('uuid');
      await Database.run(
        `INSERT INTO uptime_stats (id, service_id, period, uptime_percentage, avg_response_time)
         VALUES (?, ?, ?, ?, ?)`,
        [uuid(), serviceId, period, uptime, avgResponseTime]
      );
    }
  } catch (error) {
    console.error(`Error calculating uptime for service ${serviceId}:`, error);
  }
}

module.exports = {
  startMonitoring,
  performHealthChecks,
  calculateUptimeStats
};
