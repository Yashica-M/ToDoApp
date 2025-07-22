import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const token = new URLSearchParams(location.search).get('token');

  useEffect(() => {
    if (token) {
      login(token)
        .then(() => {
          navigate('/dashboard', { replace: true });
        })
        .catch((error) => {
          console.error('Authentication failed:', error);
          navigate('/login?error=auth_failed', { replace: true });
        });
    } else {
      navigate('/login?error=no_token', { replace: true });
    }
  }, [login, location, navigate, token]);

  return (
    <div>
      <h2>Authenticating...</h2>
      <p>Please wait while we log you in.</p>
    </div>
  );
};

export default AuthSuccess;