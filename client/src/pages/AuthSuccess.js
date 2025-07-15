import React, { useEffect } from 'react';
import '../styles/utilities.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import 'components/Dashboard'

const AuthSuccess = () => {
    const { login } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (token) {
            // We have a token, so we'll attempt to log in.
            login(token)
                .then(() => {
                    // If login is successful, redirect to the main dashboard.
                    // Using { replace: true } means the user can't press "back" to get to this loading page.
                    navigate('/dashboard', { replace: true });
                })
                .catch(error => {
                    // If the login function fails, it means the token was bad or the server is down.
                    // Redirect to the login page with an error message.
                    console.error("Authentication failed:", error);
                    navigate('/login?error=auth_failed', { replace: true });
                });
        } else {
            // If there's no token in the URL, something went wrong.
            // Redirect to the login page.
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