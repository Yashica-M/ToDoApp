import React, { useState, useEffect } from 'react';
import api from '../api';

const ServerStatus = () => {
  const [serverStatus, setServerStatus] = useState('checking');
  const [lastCheck, setLastCheck] = useState(null);

  const checkServerStatus = async () => {
    setServerStatus('checking');
    try {
      const response = await fetch('http://localhost:5000/', { 
        method: 'GET',
        timeout: 5000 
      });
      if (response.ok) {
        setServerStatus('online');
      } else {
        setServerStatus('error');
      }
    } catch (error) {
      console.error('Server status check failed:', error);
      setServerStatus('offline');
    }
    setLastCheck(new Date().toLocaleTimeString());
  };

  useEffect(() => {
    checkServerStatus();
    const interval = setInterval(checkServerStatus, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (serverStatus) {
      case 'online': return '#28a745';
      case 'offline': return '#dc3545';
      case 'error': return '#ffc107';
      case 'checking': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const getStatusText = () => {
    switch (serverStatus) {
      case 'online': return 'Server Online';
      case 'offline': return 'Server Offline';
      case 'error': return 'Server Error';
      case 'checking': return 'Checking...';
      default: return 'Unknown';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      padding: '8px 16px',
      backgroundColor: 'white',
      border: `2px solid ${getStatusColor()}`,
      borderRadius: '20px',
      fontSize: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}>
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: getStatusColor()
      }}></div>
      <span>{getStatusText()}</span>
      {lastCheck && <span style={{ opacity: 0.7 }}>({lastCheck})</span>}
      <button 
        onClick={checkServerStatus}
        style={{
          marginLeft: '8px',
          padding: '2px 6px',
          border: 'none',
          borderRadius: '4px',
          background: '#f8f9fa',
          cursor: 'pointer'
        }}
      >
        ↻
      </button>
    </div>
  );
};

export default ServerStatus;
