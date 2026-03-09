const crypto = require('crypto');
const jwt = require('jsonwebtoken');

class Helpers {
  static generateId(prefix = '') {
    const id = crypto.randomBytes(16).toString('hex');
    return prefix ? `${prefix}_${id}` : id;
  }
  
  static generateToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION || '7d'
    });
  }
  
  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return null;
    }
  }
  
  static parseHeaders(headerString) {
    if (!headerString) return {};
    try {
      return JSON.parse(headerString);
    } catch {
      return {};
    }
  }
  
  static stringifyHeaders(headers) {
    if (typeof headers === 'string') return headers;
    return JSON.stringify(headers || {});
  }
  
  static calculateUptime(totalChecks, failedChecks) {
    if (totalChecks === 0) return 100;
    return ((totalChecks - failedChecks) / totalChecks) * 100;
  }
  
  static getStatusColor(status) {
    const colors = {
      'UP': '#22c55e',      // green
      'DOWN': '#ef4444',     // red
      'DEGRADED': '#f59e0b', // amber
      'UNKNOWN': '#6b7280'   // gray
    };
    return colors[status] || colors['UNKNOWN'];
  }
  
  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = Helpers;
