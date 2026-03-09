const Database = require('../utils/database');
const Helpers = require('../utils/helpers');
const { v4: uuidv4 } = require('uuid');

class ServiceModel {
  static async create(data) {
    const id = Helpers.generateId('svc');
    const now = new Date().toISOString();
    
    await Database.run(
      `INSERT INTO services (id, name, url, type, group_name, status, created_at, updated_at, check_interval, timeout, max_retries, method, port)
       VALUES (?, ?, ?, ?, ?, 'UNKNOWN', ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, data.name, data.url, data.type, data.groupName || null, now, now,
        data.checkInterval || 10, data.timeout || 30, data.maxRetries || 3,
        data.method || 'GET', data.port || null
      ]
    );
    
    return this.findById(id);
  }
  
  static async findById(id) {
    return Database.get(`SELECT * FROM services WHERE id = ?`, [id]);
  }
  
  static async findAll(groupName = null) {
    if (groupName) {
      return Database.all(
        `SELECT * FROM services WHERE group_name = ? ORDER BY name ASC`,
        [groupName]
      );
    }
    return Database.all(`SELECT * FROM services ORDER BY group_name, name ASC`);
  }
  
  static async update(id, data) {
    const now = new Date().toISOString();
    const updates = [];
    const values = [];
    
    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.url !== undefined) {
      updates.push('url = ?');
      values.push(data.url);
    }
    if (data.type !== undefined) {
      updates.push('type = ?');
      values.push(data.type);
    }
    if (data.groupName !== undefined) {
      updates.push('group_name = ?');
      values.push(data.groupName || null);
    }
    if (data.enabled !== undefined) {
      updates.push('enabled = ?');
      values.push(data.enabled ? 1 : 0);
    }
    if (data.checkInterval !== undefined) {
      updates.push('check_interval = ?');
      values.push(data.checkInterval);
    }
    if (data.timeout !== undefined) {
      updates.push('timeout = ?');
      values.push(data.timeout);
    }
    if (data.port !== undefined) {
      updates.push('port = ?');
      values.push(data.port);
    }
    if (data.method !== undefined) {
      updates.push('method = ?');
      values.push(data.method);
    }
    if (data.body !== undefined) {
      updates.push('body = ?');
      values.push(data.body);
    }
    if (data.headers !== undefined) {
      updates.push('headers = ?');
      values.push(Helpers.stringifyHeaders(data.headers));
    }
    
    updates.push('updated_at = ?');
    values.push(now);
    values.push(id);
    
    await Database.run(
      `UPDATE services SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    
    return this.findById(id);
  }
  
  static async delete(id) {
    await Database.run(`DELETE FROM services WHERE id = ?`, [id]);
    await Database.run(`DELETE FROM service_history WHERE service_id = ?`, [id]);
    await Database.run(`DELETE FROM alerts WHERE service_id = ?`, [id]);
    await Database.run(`DELETE FROM uptime_stats WHERE service_id = ?`, [id]);
  }
  
  static async getHistory(serviceId, limit = 100) {
    return Database.all(
      `SELECT * FROM service_history WHERE service_id = ? ORDER BY created_at DESC LIMIT ?`,
      [serviceId, limit]
    );
  }
  
  static async getUptimeStats(serviceId) {
    return Database.all(
      `SELECT * FROM uptime_stats WHERE service_id = ? ORDER BY period DESC`,
      [serviceId]
    );
  }
}

module.exports = ServiceModel;
