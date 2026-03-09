import React, { useState } from 'react';
import '../styles/ServiceCard.css';

const ServiceCard = ({ service, onEdit, onDelete }) => {
  const [showDetails, setShowDetails] = useState(false);
  
  const getStatusColor = (status) => {
    const colors = {
      'UP': '#22c55e',
      'DOWN': '#ef4444',
      'DEGRADED': '#f59e0b',
      'UNKNOWN': '#6b7280'
    };
    return colors[status] || colors['UNKNOWN'];
  };
  
  const getStatusText = (status) => {
    const texts = {
      'UP': 'Online',
      'DOWN': 'Offline',
      'DEGRADED': 'Degraded',
      'UNKNOWN': 'Unknown'
    };
    return texts[status] || 'Unknown';
  };
  
  return (
    <div className="service-card">
      <div className="service-header">
        <div className="service-info">
          <h3>{service.name}</h3>
          <p className="service-url">{service.url}</p>
        </div>
        <div className="service-status" style={{ backgroundColor: getStatusColor(service.status) }}>
          <span>{getStatusText(service.status)}</span>
        </div>
      </div>
      
      <div className="service-meta">
        <div className="meta-item">
          <label>Type</label>
          <span>{service.type}</span>
        </div>
        <div className="meta-item">
          <label>Response Time</label>
          <span>{service.response_time || 0}ms</span>
        </div>
        {service.group_name && (
          <div className="meta-item">
            <label>Group</label>
            <span>{service.group_name}</span>
          </div>
        )}
      </div>
      
      {service.last_check && (
        <div className="last-check">
          <small>Last check: {new Date(service.last_check).toLocaleTimeString()}</small>
        </div>
      )}
      
      <div className="service-actions">
        <button onClick={() => setShowDetails(!showDetails)} className="btn-toggle">
          {showDetails ? 'Hide' : 'Details'}
        </button>
        <button onClick={() => onEdit(service)} className="btn-edit">Edit</button>
        <button onClick={() => onDelete(service.id)} className="btn-delete">Delete</button>
      </div>
    </div>
  );
};

export default ServiceCard;
