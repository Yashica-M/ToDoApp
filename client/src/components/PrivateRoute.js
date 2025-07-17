import React from 'react';
// ...existing code...
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>; // Or a spinner component
    }

    if (!isAuthenticated) {
        window.location.href = '/login';
        return null;
    }
    if (isAuthenticated && window.location.pathname !== '/dashboard') {
        window.location.href = '/dashboard';
        return null;
    }
    return children;
};

export default PrivateRoute;