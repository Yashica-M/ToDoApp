import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Always redirect to dashboard after Google login
    navigate('/dashboard', { replace: true });
  }, [navigate]);

  return (
    <div>
      <h2>Redirecting...</h2>
      <p>You are being redirected to your dashboard.</p>
    </div>
  );
};

export default AuthSuccess;