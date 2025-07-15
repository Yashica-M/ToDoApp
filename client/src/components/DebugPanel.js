import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTodos } from '../contexts/TodoContext';
import { useSocket } from '../contexts/SocketContext';
import api from '../api';

const DebugPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [testResults, setTestResults] = useState({});
  const { user, isAuthenticated } = useAuth();
  const { todos, loading } = useTodos();
  const socket = useSocket();

  const runTests = async () => {
    const results = {};
    
    // Test 1: Check server connectivity
    try {
      const response = await fetch('http://localhost:5000/');
      results.serverConnectivity = response.ok ? 'PASS' : 'FAIL';
    } catch (error) {
      results.serverConnectivity = 'FAIL - ' + error.message;
    }

    // Test 2: Check API base URL
    results.apiBaseUrl = api.defaults.baseURL || 'http://localhost:5000/api';

    // Test 3: Check authentication
    results.isAuthenticated = isAuthenticated ? 'PASS' : 'FAIL';
    results.hasUser = user ? 'PASS' : 'FAIL';
    results.hasToken = localStorage.getItem('token') ? 'PASS' : 'FAIL';

    // Test 4: Check socket connection
    results.socketConnected = socket && socket.connected ? 'PASS' : 'FAIL';
    results.socketId = socket ? socket.id || 'No ID' : 'No Socket';
    
    // Test 5: Test socket connection manually
    try {
      if (socket) {
        socket.emit('test', 'ping');
        results.socketEmit = 'PASS';
      } else {
        results.socketEmit = 'FAIL - No socket instance';
      }
    } catch (error) {
      results.socketEmit = 'FAIL - ' + error.message;
    }

    // Test 6: Try to fetch todos directly
    try {
      await api.get('/todos');
      results.todosAPI = 'PASS';
    } catch (error) {
      results.todosAPI = 'FAIL - ' + error.message;
    }

    setTestResults(results);
  };

  const reconnectSocket = () => {
    if (socket) {
      console.log('Attempting to reconnect socket...');
      try {
        socket.close();
        socket.open();
        console.log('Socket reconnection initiated');
      } catch (error) {
        console.error('Error reconnecting socket:', error);
        // If that fails, try to refresh the page as a fallback
        window.location.reload();
      }
    } else {
      console.log('No socket instance available, reloading page...');
      window.location.reload();
    }
  };

  const clearLocalStorage = () => {
    localStorage.clear();
    window.location.reload();
  };

  const forceReload = () => {
    window.location.reload();
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '80px',
          right: '20px',
          padding: '8px 12px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px',
          zIndex: 1000
        }}
      >
        Debug
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '400px',
      maxHeight: '500px',
      backgroundColor: 'white',
      border: '1px solid #ccc',
      borderRadius: '8px',
      padding: '16px',
      fontSize: '12px',
      fontFamily: 'monospace',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 1000,
      overflow: 'auto'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <h4 style={{ margin: 0 }}>Debug Panel</h4>
        <button onClick={() => setIsOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>✕</button>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <button onClick={runTests} style={{ marginRight: '8px', padding: '4px 8px', fontSize: '11px' }}>
          Run Tests
        </button>
        <button onClick={reconnectSocket} style={{ marginRight: '8px', padding: '4px 8px', fontSize: '11px', backgroundColor: '#17a2b8', color: 'white', border: 'none' }}>
          Fix Socket
        </button>
        <button onClick={forceReload} style={{ marginRight: '8px', padding: '4px 8px', fontSize: '11px', backgroundColor: '#28a745', color: 'white', border: 'none' }}>
          Reload App
        </button>
        <button onClick={clearLocalStorage} style={{ padding: '4px 8px', fontSize: '11px', backgroundColor: '#dc3545', color: 'white', border: 'none' }}>
          Clear Storage
        </button>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <strong>Current State:</strong><br/>
        • Authenticated: {isAuthenticated ? '✅' : '❌'}<br/>
        • User: {user ? `✅ ${user.name}` : '❌'}<br/>
        • Todos Count: {todos.length}<br/>
        • Loading: {loading ? '⏳' : '✅'}<br/>
        • Socket: {socket?.connected ? `✅ ${socket.id}` : '❌'}<br/>
      </div>

      {Object.keys(testResults).length > 0 && (
        <div>
          <strong>Test Results:</strong><br/>
          {Object.entries(testResults).map(([test, result]) => (
            <div key={test} style={{ marginBottom: '4px' }}>
              • {test}: <span style={{ color: result.includes('PASS') ? 'green' : 'red' }}>{result}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '12px', padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <strong>Quick Fixes:</strong><br/>
        1. Start server: <code>cd server && npm start</code><br/>
        2. Check MongoDB connection in server/.env<br/>
        3. Clear browser cache and localStorage<br/>
        4. Check if port 5000 is available
      </div>
    </div>
  );
};

export default DebugPanel;
