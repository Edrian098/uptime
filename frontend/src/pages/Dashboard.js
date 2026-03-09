import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { useWebSocket, useAsync } from '../hooks/useData';
import ServiceCard from '../components/ServiceCard';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [services, setServices] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [summary, setSummary] = useState({});
  const [refreshInterval, setRefreshInterval] = useState(10);
  
  const { value: dashboardData } = useAsync(() => api.getDashboardSummary());
  const { isConnected } = useWebSocket(handleWebSocketMessage);
  
  useEffect(() => {
    if (dashboardData) {
      setSummary({
        total: dashboardData.total,
        up: dashboardData.up,
        down: dashboardData.down,
        avgResponseTime: dashboardData.avgResponseTime
      });
      setServices(dashboardData.services);
    }
  }, [dashboardData]);
  
  useEffect(() => {
    const loadGroups = async () => {
      try {
        const response = await api.getGroups();
        setGroups(response.data);
      } catch (error) {
        console.error('Failed to load groups', error);
      }
    };
    loadGroups();
  }, []);
  
  useEffect(() => {
    const interval = setInterval(() => {
      loadDashboard();
    }, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [refreshInterval]);
  
  function handleWebSocketMessage(data) {
    if (data.type === 'SERVICE_STATUS_UPDATE') {
      setServices(prev =>
        prev.map(s => s.id === data.data.id ? data.data : s)
      );
    }
  }
  
  const loadDashboard = async () => {
    try {
      const response = await api.getDashboardSummary();
      setSummary({
        total: response.data.total,
        up: response.data.up,
        down: response.data.down,
        avgResponseTime: response.data.avgResponseTime
      });
      setServices(response.data.services);
    } catch (error) {
      console.error('Failed to load dashboard', error);
    }
  };
  
  const filteredServices = selectedGroup
    ? services.filter(s => s.group_name === selectedGroup)
    : services;
  
  const upPercentage = summary.total ? Math.round((summary.up / summary.total) * 100) : 0;
  
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Uptime Monitor</h1>
        <div className="header-controls">
          <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '● Connected' : '● Disconnected'}
          </span>
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="refresh-select"
          >
            <option value={5}>Refresh: 5s</option>
            <option value={10}>Refresh: 10s</option>
            <option value={30}>Refresh: 30s</option>
            <option value={60}>Refresh: 60s</option>
          </select>
        </div>
      </header>
      
      <div className="summary-cards">
        <div className="summary-card">
          <h3>Total Services</h3>
          <p className="big-number">{summary.total || 0}</p>
        </div>
        <div className="summary-card online">
          <h3>Online</h3>
          <p className="big-number">{summary.up || 0}</p>
        </div>
        <div className="summary-card offline">
          <h3>Offline</h3>
          <p className="big-number">{summary.down || 0}</p>
        </div>
        <div className="summary-card">
          <h3>Uptime</h3>
          <p className="big-number">{upPercentage}%</p>
        </div>
        <div className="summary-card">
          <h3>Avg Response</h3>
          <p className="big-number">{summary.avgResponseTime || 0}ms</p>
        </div>
      </div>
      
      {groups.length > 0 && (
        <div className="groups-filter">
          <button
            onClick={() => setSelectedGroup(null)}
            className={!selectedGroup ? 'active' : ''}
          >
            All Services
          </button>
          {groups.map(group => (
            <button
              key={group}
              onClick={() => setSelectedGroup(group)}
              className={selectedGroup === group ? 'active' : ''}
            >
              {group}
            </button>
          ))}
        </div>
      )}
      
      <div className="services-grid">
        {filteredServices.map(service => (
          <ServiceCard
            key={service.id}
            service={service}
            onEdit={() => console.log('Edit:', service)}
            onDelete={() => console.log('Delete:', service.id)}
          />
        ))}
      </div>
      
      {filteredServices.length === 0 && (
        <div className="empty-state">
          <p>No services configured. Add a service to get started.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
