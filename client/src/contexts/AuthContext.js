import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api';// Your centralized axios instance
// Create the context
const AuthContext = createContext();
// Custom hook to use the auth context
export const useAuth = () => {
    return useContext(AuthContext);
};

// Create the provider component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('AuthContext: Checking for stored token...');
        // Check for a token in localStorage when the app loads
        const token = localStorage.getItem('token');
        if (token) {
            console.log('AuthContext: Found token, verifying...');
            // If a token exists, set it on the API helper and try to fetch the user
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            api.get('/auth/me') // Corrected endpoint
                .then(res => {
                    console.log('AuthContext: User verified:', res.data);
                    setUser(res.data);
                })
                .catch((err) => {
                    console.log('AuthContext: Token invalid, removing...', err.message);
                    // If the token is invalid, remove it
                    localStorage.removeItem('token');
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            console.log('AuthContext: No token found');
            setLoading(false);
        }
    }, []);

    const login = async (token) => {
        if (!token) {
            localStorage.removeItem('token');
            delete api.defaults.headers.common['Authorization'];
            setUser(null);
            return Promise.reject(new Error('No token provided'));
        }
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
            const { data } = await api.get('/auth/me');
            setUser(data);
            return Promise.resolve();
        } catch (error) {
            localStorage.removeItem('token');
            delete api.defaults.headers.common['Authorization'];
            setUser(null);
            return Promise.reject(error);
        }
    };
    const logout = () => {
        // Clear user data and token from state and localStorage
        setUser(null);
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
    };

    const value = {
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        api, // Expose the API instance to components that use AuthContext
    };
     return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};