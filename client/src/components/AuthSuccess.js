import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/enhanced-ui.css';

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
          // If login is successful, redirect to dashboard
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

  return (
    <div className="auth-success-container">
      <div className="auth-loading">
        <div className="loading-spinner"></div>
        <h2>Signing you in...</h2>
        <p>You'll be redirected to your dashboard shortly</p>
      </div>
    </div>
  );
};

export default AuthSuccess;
