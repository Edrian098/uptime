const axios = require('axios');
const net = require('net');
const { v4: uuidv4 } = require('uuid');
const Database = require('../utils/database');
const Helpers = require('../utils/helpers');

class MonitoringService {
  static clients = new Set();
  
  static broadcastUpdate(data) {
    this.clients.forEach(ws => {
      if (ws.readyState === 1) { // WebSocket.OPEN
        ws.send(JSON.stringify(data));
      }
    });
  }
  
  static async checkHttpService(service) {
    const startTime = Date.now();
    try {
      const headers = Helpers.parseHeaders(service.headers);
      const config = {
        method: service.method || 'GET',
        url: service.url,
        timeout: (service.timeout || 30) * 1000,
        validateStatus: () => true,
        headers
      };
      
      if (service.body) {
        config.data = service.body;
      }
      
      const response = await axios(config);
      const responseTime = Date.now() - startTime;
      
      const isUp = response.status >= 200 && response.status < 400;
      
      return {
        status: isUp ? 'UP' : 'DOWN',
        responseTime,
        statusCode: response.status,
        error: !isUp ? `HTTP ${response.status}` : null
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        status: 'DOWN',
        responseTime,
        error: error.message || 'Request failed'
      };
    }
  }
  
  static async checkTcpService(service) {
    const startTime = Date.now();
    return new Promise((resolve) => {
      const port = service.port || 443;
      const timeout = (service.timeout || 30) * 1000;
      const socket = new net.Socket();
      let connected = false;
      
      socket.setTimeout(timeout);
      
      socket.on('connect', () => {
        connected = true;
        socket.destroy();
        resolve({
          status: 'UP',
          responseTime: Date.now() - startTime,
          error: null
        });
      });
      
      socket.on('error', (err) => {
        if (!connected) {
          resolve({
            status: 'DOWN',
            responseTime: Date.now() - startTime,
            error: err.message
          });
        }
      });
      
      socket.on('timeout', () => {
        socket.destroy();
        resolve({
          status: 'DOWN',
          responseTime: Date.now() - startTime,
          error: 'Connection timeout'
        });
      });
      
      const host = new URL(service.url).hostname;
      socket.connect(port, host);
    });
  }
  
  static async checkIcmpService(service) {
    const startTime = Date.now();
    try {
      // Using simple TCP connection as fallback for ICMP (requires elevated permissions)
      const host = new URL(service.url).hostname;
      
      return await this.checkTcpService({
        ...service,
        port: 80,
        url: `http://${host}`
      });
    } catch (error) {
      return {
        status: 'DOWN',
        responseTime: Date.now() - startTime,
        error: error.message
      };
    }
  }
  
  static async checkService(service) {
    let result = {};
    
    try {
      if (service.type === 'HTTP' || service.type === 'HTTPS') {
        result = await this.checkHttpService(service);
      } else if (service.type === 'TCP') {
        result = await this.checkTcpService(service);
      } else if (service.type === 'ICMP') {
        result = await this.checkIcmpService(service);
      }
    } catch (error) {
      result = {
        status: 'DOWN',
        responseTime: 0,
        error: error.message
      };
    }
    
    return result;
  }
  
  static async updateServiceStatus(service, result) {
    const historyId = Helpers.generateId('hist');
    const now = new Date().toISOString();
    
    // Save to history
    await Database.run(
      `INSERT INTO service_history (id, service_id, status, response_time, error_message, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [historyId, service.id, result.status, result.responseTime, result.error || null, now]
    );
    
    // Update service status
    const statusChanged = service.status !== result.status;
    const updateTime = statusChanged ? now : service.last_status_change;
    
    await Database.run(
      `UPDATE services 
       SET status = ?, response_time = ?, last_check = ?, last_status_change = ?
       WHERE id = ?`,
      [result.status, result.responseTime, now, updateTime, service.id]
    );
    
    // Send alert if status changed
    if (statusChanged) {
      await this.sendAlerts(service, result.status, result.error);
    }
    
    return {
      ...service,
      status: result.status,
      responseTime: result.responseTime,
      lastCheck: now,
      lastStatusChange: updateTime
    };
  }
  
  static async sendAlerts(service, newStatus, error) {
    const alerts = await Database.all(
      `SELECT * FROM alerts WHERE service_id = ? AND enabled = 1`,
      [service.id]
    );
    
    for (const alert of alerts) {
      const logId = Helpers.generateId('alog');
      const now = new Date().toISOString();
      const message = `Service "${service.name}" is now ${newStatus}. Error: ${error || 'N/A'}`;
      
      let success = false;
      let response = '';
      
      try {
        if (alert.type === 'EMAIL') {
          success = await this.sendEmailAlert(alert.target, service.name, message);
        } else if (alert.type === 'TELEGRAM') {
          success = await this.sendTelegramAlert(alert.target, message);
        } else if (alert.type === 'WEBHOOK') {
          success = await this.sendWebhookAlert(alert.target, {
            service: service.name,
            status: newStatus,
            message,
            timestamp: now
          });
        }
      } catch (err) {
        response = err.message;
      }
      
      await Database.run(
        `INSERT INTO alert_logs (id, alert_id, service_id, status, message, sent_at, success, response)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [logId, alert.id, service.id, newStatus, message, now, success ? 1 : 0, response]
      );
    }
  }
  
  static async sendEmailAlert(email, serviceName, message) {
    try {
      // Implementation would use nodemailer
      console.log(`Email alert to ${email}: ${message}`);
      return true;
    } catch (error) {
      console.error('Email alert failed:', error);
      return false;
    }
  }
  
  static async sendTelegramAlert(chatId, message) {
    try {
      // Telegram alert would use node-telegram-bot-api package
      // For now, logging the alert (requires botToken setup)
      console.log(`Telegram alert to ${chatId}: ${message}`);
      return true;
    } catch (error) {
      console.error('Telegram alert failed:', error);
      return false;
    }
  }
  
  static async sendWebhookAlert(webhookUrl, payload) {
    try {
      await axios.post(webhookUrl, payload, {
        timeout: process.env.WEBHOOK_TIMEOUT || 5000
      });
      return true;
    } catch (error) {
      console.error('Webhook alert failed:', error.message);
      return false;
    }
  }
}

module.exports = MonitoringService;
