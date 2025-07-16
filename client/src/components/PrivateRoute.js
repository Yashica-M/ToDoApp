import React from 'react';
// ...existing code...
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>; // Or a spinner component
    }

    if (isAuthenticated) {
      if (window.location.pathname !== '/dashboard') {
        window.location.href = '/dashboard';
        return null;
      }
      return children;
    } else {
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return null;
    }
};

export default PrivateRoute;