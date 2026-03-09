const Database = require('../utils/database');
const Helpers = require('../utils/helpers');

class AlertModel {
  static async create(data) {
    const id = Helpers.generateId('alrt');
    const now = new Date().toISOString();
    
    await Database.run(
      `INSERT INTO alerts (id, service_id, type, target, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [id, data.serviceId, data.type, data.target, now]
    );
    
    return this.findById(id);
  }
  
  static async findById(id) {
    return Database.get(`SELECT * FROM alerts WHERE id = ?`, [id]);
  }
  
  static async findByService(serviceId) {
    return Database.all(
      `SELECT * FROM alerts WHERE service_id = ? ORDER BY created_at DESC`,
      [serviceId]
    );
  }
  
  static async update(id, data) {
    const updates = [];
    const values = [];
    
    if (data.type !== undefined) {
      updates.push('type = ?');
      values.push(data.type);
    }
    if (data.target !== undefined) {
      updates.push('target = ?');
      values.push(data.target);
    }
    if (data.enabled !== undefined) {
      updates.push('enabled = ?');
      values.push(data.enabled ? 1 : 0);
    }
    
    values.push(id);
    
    if (updates.length > 0) {
      await Database.run(
        `UPDATE alerts SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    }
    
    return this.findById(id);
  }
  
  static async delete(id) {
    await Database.run(`DELETE FROM alerts WHERE id = ?`, [id]);
  }
  
  static async getLogs(alertId, limit = 50) {
    return Database.all(
      `SELECT * FROM alert_logs WHERE alert_id = ? ORDER BY sent_at DESC LIMIT ?`,
      [alertId, limit]
    );
  }
}

module.exports = AlertModel;
