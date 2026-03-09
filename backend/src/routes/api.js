const express = require('express');
const router = express.Router();
const ServiceModel = require('../models/Service');
const AlertModel = require('../models/Alert');
const Database = require('../utils/database');
const Helpers = require('../utils/helpers');
const { optionalAuth } = require('../middleware/auth');

// Services CRUD
router.post('/services', optionalAuth, async (req, res) => {
  try {
    const { name, url, type, groupName, port, method, body, headers, checkInterval, timeout } = req.body;
    
    if (!name || !url || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const service = await ServiceModel.create({
      name, url, type, groupName, port, method, body, headers, checkInterval, timeout
    });
    
    res.status(201).json(service);
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/services', async (req, res) => {
  try {
    const { group } = req.query;
    const services = await ServiceModel.findAll(group);
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/services/:id', async (req, res) => {
  try {
    const service = await ServiceModel.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/services/:id', optionalAuth, async (req, res) => {
  try {
    const service = await ServiceModel.update(req.params.id, req.body);
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/services/:id', optionalAuth, async (req, res) => {
  try {
    await ServiceModel.delete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Service History
router.get('/services/:id/history', async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    const history = await ServiceModel.getHistory(req.params.id, parseInt(limit));
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Service Uptime Stats
router.get('/services/:id/stats', async (req, res) => {
  try {
    const stats = await ServiceModel.getUptimeStats(req.params.id);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Alerts
router.post('/alerts', optionalAuth, async (req, res) => {
  try {
    const { serviceId, type, target } = req.body;
    
    if (!serviceId || !type || !target) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const alert = await AlertModel.create({ serviceId, type, target });
    res.status(201).json(alert);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/services/:id/alerts', async (req, res) => {
  try {
    const alerts = await AlertModel.findByService(req.params.id);
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/alerts/:id', optionalAuth, async (req, res) => {
  try {
    const alert = await AlertModel.update(req.params.id, req.body);
    res.json(alert);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/alerts/:id', optionalAuth, async (req, res) => {
  try {
    await AlertModel.delete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/alerts/:id/logs', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const logs = await AlertModel.getLogs(req.params.id, parseInt(limit));
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dashboard Stats
router.get('/dashboard/summary', async (req, res) => {
  try {
    const services = await Database.all(`SELECT * FROM services`);
    const upCount = services.filter(s => s.status === 'UP').length;
    const downCount = services.filter(s => s.status === 'DOWN').length;
    
    const lastChecks = services.map(s => s.last_check);
    const avgResponseTime = Math.round(
      services.reduce((sum, s) => sum + (s.response_time || 0), 0) / services.length || 0
    );
    
    res.json({
      total: services.length,
      up: upCount,
      down: downCount,
      avgResponseTime,
      services
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Service Groups
router.get('/groups', async (req, res) => {
  try {
    const groups = await Database.all(
      `SELECT DISTINCT group_name FROM services WHERE group_name IS NOT NULL ORDER BY group_name`
    );
    res.json(groups.map(g => g.group_name));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
