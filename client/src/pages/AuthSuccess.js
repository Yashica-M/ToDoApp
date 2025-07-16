
import React, { useEffect } from 'react';
import '../styles/utilities.css';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthSuccess = () => {
    const { login } = useAuth();
    const location = useLocation();
    // ...existing code...

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (token) {
            login(token)
                .then(() => {
                    window.location.href = '/dashboard';
                })
                .catch(error => {
                    console.error("Authentication failed:", error);
                    window.location.href = '/login?error=auth_failed';
                });
        } else {
            window.location.href = '/login?error=no_token';
        }
    }, [login, location, navigate]);

    // Show a simple loading message to the user while we process the token.
    return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <h2>Authenticating...</h2>
            <p>Please wait while we log you in.</p>
        </div>
    );
};

export default AuthSuccess;