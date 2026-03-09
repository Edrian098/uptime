import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000
});

// Services
export const getServices = () => apiClient.get('/services');
export const getServiceById = (id) => apiClient.get(`/services/${id}`);
export const createService = (data) => apiClient.post('/services', data);
export const updateService = (id, data) => apiClient.put(`/services/${id}`, data);
export const deleteService = (id) => apiClient.delete(`/services/${id}`);
export const getServiceHistory = (id, limit = 100) => 
  apiClient.get(`/services/${id}/history?limit=${limit}`);
export const getServiceStats = (id) => apiClient.get(`/services/${id}/stats`);

// Alerts
export const createAlert = (data) => apiClient.post('/alerts', data);
export const getAlertsForService = (serviceId) => apiClient.get(`/services/${serviceId}/alerts`);
export const updateAlert = (id, data) => apiClient.put(`/alerts/${id}`, data);
export const deleteAlert = (id) => apiClient.delete(`/alerts/${id}`);
export const getAlertLogs = (alertId, limit = 50) => 
  apiClient.get(`/alerts/${alertId}/logs?limit=${limit}`);

// Dashboard
export const getDashboardSummary = () => apiClient.get('/dashboard/summary');
export const getGroups = () => apiClient.get('/groups');

// WebSocket
export const connectWebSocket = (onMessage) => {
  const ws = new WebSocket(
    `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`
  );
  
  ws.onopen = () => {
    console.log('WebSocket connected');
  };
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data);
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  
  ws.onclose = () => {
    console.log('WebSocket disconnected');
  };
  
  return ws;
};
