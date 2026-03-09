const sqlite3 = require('sqlite3').verbose();
const { Client } = require('pg');
const path = require('path');
const fs = require('fs');

let db = null;

class Database {
  static async init() {
    const dbType = process.env.DB_TYPE || 'sqlite';
    
    if (dbType === 'sqlite') {
      return this.initSqlite();
    } else if (dbType === 'postgresql') {
      return this.initPostgres();
    }
  }
  
  static initSqlite() {
    return new Promise((resolve, reject) => {
      const dbPath = process.env.DB_PATH || './data/uptime.db';
      const dir = path.dirname(dbPath);
      
      // Create data directory if it doesn't exist
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      db = new sqlite3.Database(dbPath, async (err) => {
        if (err) {
          reject(err);
        } else {
          await this.createTables();
          resolve();
        }
      });
    });
  }
  
  static async initPostgres() {
    db = new Client({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });
    
    await db.connect();
    await this.createTables();
  }
  
  static async createTables() {
    const tables = [
      `CREATE TABLE IF NOT EXISTS services (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        type TEXT NOT NULL,
        group_name TEXT,
        status TEXT DEFAULT 'UNKNOWN',
        response_time INTEGER DEFAULT 0,
        last_check DATETIME,
        last_status_change DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        enabled BOOLEAN DEFAULT 1,
        check_interval INTEGER DEFAULT 10,
        timeout INTEGER DEFAULT 30,
        max_retries INTEGER DEFAULT 3,
        port INTEGER,
        method TEXT DEFAULT 'GET',
        body TEXT,
        headers TEXT,
        certificate_expiry_days INTEGER
      )`,
      
      `CREATE TABLE IF NOT EXISTS service_history (
        id TEXT PRIMARY KEY,
        service_id TEXT NOT NULL,
        status TEXT NOT NULL,
        response_time INTEGER,
        error_message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (service_id) REFERENCES services(id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS alerts (
        id TEXT PRIMARY KEY,
        service_id TEXT NOT NULL,
        type TEXT NOT NULL,
        target TEXT NOT NULL,
        enabled BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (service_id) REFERENCES services(id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS alert_logs (
        id TEXT PRIMARY KEY,
        alert_id TEXT NOT NULL,
        service_id TEXT NOT NULL,
        status TEXT NOT NULL,
        message TEXT,
        sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        success BOOLEAN DEFAULT 0,
        response TEXT,
        FOREIGN KEY (alert_id) REFERENCES alerts(id),
        FOREIGN KEY (service_id) REFERENCES services(id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS uptime_stats (
        id TEXT PRIMARY KEY,
        service_id TEXT NOT NULL,
        period TEXT NOT NULL,
        uptime_percentage REAL DEFAULT 0,
        downtime_minutes INTEGER DEFAULT 0,
        incidents INTEGER DEFAULT 0,
        avg_response_time INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (service_id, period),
        FOREIGN KEY (service_id) REFERENCES services(id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ];
    
    for (const table of tables) {
      await this.run(table);
    }
  }
  
  static run(sql, params = []) {
    return new Promise((resolve, reject) => {
      if (process.env.DB_TYPE === 'sqlite') {
        db.run(sql, params, (err) => {
          if (err) reject(err);
          else resolve();
        });
      } else {
        db.query(sql, params)
          .then(() => resolve())
          .catch(reject);
      }
    });
  }
  
  static get(sql, params = []) {
    return new Promise((resolve, reject) => {
      if (process.env.DB_TYPE === 'sqlite') {
        db.get(sql, params, (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      } else {
        db.query(sql, params)
          .then(result => resolve(result.rows[0]))
          .catch(reject);
      }
    });
  }
  
  static all(sql, params = []) {
    return new Promise((resolve, reject) => {
      if (process.env.DB_TYPE === 'sqlite') {
        db.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      } else {
        db.query(sql, params)
          .then(result => resolve(result.rows))
          .catch(reject);
      }
    });
  }
  
  static async close() {
    return new Promise((resolve, reject) => {
      if (process.env.DB_TYPE === 'sqlite') {
        db.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      } else {
        db.end()
          .then(resolve)
          .catch(reject);
      }
    });
  }
}

module.exports = Database;
