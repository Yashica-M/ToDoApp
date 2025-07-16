import React from 'react';
// ...existing code...
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    window.location.href = '/login';
    return null;
  }
  
  return children;
};

export default ProtectedRoute;
