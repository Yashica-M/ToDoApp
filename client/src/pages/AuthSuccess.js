
import React, { useEffect } from 'react';
import '../styles/utilities.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthSuccess = () => {
    const { login } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (token) {
            login(token)
                .then(() => {
                    navigate('/dashboard', { replace: true });
                })
                .catch(error => {
                    console.error("Authentication failed:", error);
                    navigate('/login?error=auth_failed', { replace: true });
                });
        } else {
            navigate('/login?error=no_token', { replace: true });
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