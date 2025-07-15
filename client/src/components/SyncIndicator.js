import React, { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';

// Styles for the SyncIndicator
const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    marginLeft: 'auto',
    fontSize: '0.85rem',
    color: '#555',
  },
  indicator: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    marginRight: '8px',
  },
  connected: {
    backgroundColor: '#4CAF50',
  },
  disconnected: {
    backgroundColor: '#F44336',
  },
  syncing: {
    backgroundColor: '#2196F3',
    animation: 'pulse 1.5s infinite',
  },
  syncText: {
    marginLeft: '4px',
  },
};

const SyncIndicator = () => {
  const { isConnected, isSyncing, lastSync } = useSocket();
  const [syncTime, setSyncTime] = useState('');

  // Format the last sync time
  useEffect(() => {
    if (lastSync) {
      const updateSyncTime = () => {
        const now = new Date();
        const diff = now - lastSync;
        
        if (diff < 60000) {
          setSyncTime('just now');
        } else if (diff < 3600000) {
          const minutes = Math.floor(diff / 60000);
          setSyncTime(`${minutes} ${minutes === 1 ? 'min' : 'mins'} ago`);
        } else if (diff < 86400000) {
          const hours = Math.floor(diff / 3600000);
          setSyncTime(`${hours} ${hours === 1 ? 'hour' : 'hours'} ago`);
        } else {
          const formattedTime = lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          setSyncTime(`at ${formattedTime}`);
        }
      };
      
      updateSyncTime();
      const timer = setInterval(updateSyncTime, 60000); // Update every minute
      
      return () => clearInterval(timer);
    }
  }, [lastSync]);

  const getIndicatorStyle = () => {
    if (isSyncing) return { ...styles.indicator, ...styles.syncing };
    return { ...styles.indicator, ...(isConnected ? styles.connected : styles.disconnected) };
  };

  return (
    <div className="sync-indicator" style={styles.container}>
      <div style={getIndicatorStyle()}></div>
      {isSyncing ? (
        <span>Syncing...</span>
      ) : (
        <span>
          {isConnected ? 'Connected' : 'Offline'}
          {lastSync && (
            <span style={styles.syncText}>
              • Last synced {syncTime}
            </span>
          )}
        </span>
      )}
      
      <style jsx="true">{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default SyncIndicator;
