import React, { useState } from 'react';
import * as api from '../services/api';
import '../styles/AddServiceForm.css';

const AddServiceForm = ({ onServiceAdded, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    type: 'HTTPS',
    groupName: '',
    method: 'GET',
    timeout: 30,
    checkInterval: 10,
    port: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.name || !formData.url || !formData.type) {
        throw new Error('Name, URL, and Type are required');
      }

      const payload = { ...formData };
      if (formData.port) {
        payload.port = parseInt(formData.port);
      }

      const response = await api.createService(payload);
      onServiceAdded(response.data);
      setFormData({
        name: '',
        url: '',
        type: 'HTTPS',
        groupName: '',
        method: 'GET',
        timeout: 30,
        checkInterval: 10,
        port: ''
      });
    } catch (err) {
      setError(err.message || 'Failed to create service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="form-container">
        <h2>Add New Service</h2>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Service Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Production API"
              required
            />
          </div>

          <div className="form-group">
            <label>URL/Host *</label>
            <input
              type="text"
              name="url"
              value={formData.url}
              onChange={handleInputChange}
              placeholder="e.g., https://api.example.com"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Type *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
              >
                <option value="HTTPS">HTTPS</option>
                <option value="HTTP">HTTP</option>
                <option value="TCP">TCP</option>
                <option value="ICMP">ICMP Ping</option>
              </select>
            </div>

            <div className="form-group">
              <label>Group</label>
              <input
                type="text"
                name="groupName"
                value={formData.groupName}
                onChange={handleInputChange}
                placeholder="e.g., Production"
              />
            </div>
          </div>

          {(formData.type === 'HTTP' || formData.type === 'HTTPS') && (
            <div className="form-group">
              <label>HTTP Method</label>
              <select
                name="method"
                value={formData.method}
                onChange={handleInputChange}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
          )}

          {formData.type === 'TCP' && (
            <div className="form-group">
              <label>Port</label>
              <input
                type="number"
                name="port"
                value={formData.port}
                onChange={handleInputChange}
                placeholder="e.g., 443"
                min="1"
                max="65535"
              />
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Timeout (seconds)</label>
              <input
                type="number"
                name="timeout"
                value={formData.timeout}
                onChange={handleInputChange}
                min="5"
                max="120"
              />
            </div>

            <div className="form-group">
              <label>Check Interval (seconds)</label>
              <input
                type="number"
                name="checkInterval"
                value={formData.checkInterval}
                onChange={handleInputChange}
                min="5"
                max="3600"
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onCancel}
              className="btn-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-submit"
            >
              {loading ? 'Creating...' : 'Create Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddServiceForm;
