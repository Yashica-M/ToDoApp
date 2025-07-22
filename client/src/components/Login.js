import React, { useState, useEffect } from 'react';
import '../styles/login.css';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showWelcomeText, setShowWelcomeText] = useState(false);

  useEffect(() => {
    // Show welcome text with delay for animation
    const timer = setTimeout(() => setShowWelcomeText(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };
const handleGoogleLogin = () => {
  setIsLoading(true);
  setTimeout(() => {
    // Use the deployed backend URL or fallback to environment variable
    const backendUrl = 'https://todoapp-rmqk.onrender.com';
    window.location.href = `${backendUrl}/api/auth/google`;
  }, 800);
};

  return (
    <div className="login-container" onMouseMove={handleMouseMove}>
      {/* Animated background particles */}
      <div className="background-particles">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Interactive mouse follower */}
      <div 
        className="mouse-follower"
        style={{
          left: `${mousePosition.x}%`,
          top: `${mousePosition.y}%`,
        }}
      />

      <div className="login-card animated-card">
        <div className="login-logo">
          <div className="logo-container">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="#10B981" 
              width="80" 
              height="80"
              className="logo-svg"
            >
              <circle 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="#3B82F6" 
                strokeWidth="2" 
                fill="#EFF6FF"
                className="logo-circle"
              />
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M5 13l4 4L19 7"
                className="logo-checkmark"
              />
            </svg>
            <div className="logo-glow"></div>
          </div>
          <h1 className={`app-title ${showWelcomeText ? 'show' : ''}`}>TaskSphere</h1>
          <div className="title-underline"></div>
        </div>
        
        <div className={`login-subtitle ${showWelcomeText ? 'show' : ''}`}>
          <p className="subtitle-text">
            <span className="highlight">Organize</span> your tasks efficiently with our 
            <span className="highlight"> powerful</span> todo application
          </p>
          <div className="feature-pills">
            <span className="pill">✨ Smart Organization</span>
            <span className="pill">🚀 Real-time Sync</span>
            <span className="pill">🎯 Goal Tracking</span>
          </div>
        </div>
        
        <div className="login-buttons">
          <button 
            onClick={handleGoogleLogin} 
            className="login-button google-button"
            disabled={isLoading}
          >
            <div className="button-content">
              <svg className="login-icon" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Continue with Google</span>
              <div className="button-shine"></div>
            </div>
          </button>

          <div className="divider">
            <span>or explore features</span>
          </div>

          <div className="feature-showcase">
            <div className="feature-item" onClick={() => alert('Create tasks instantly!')}>
              <div className="feature-icon">📝</div>
              <div className="feature-text">
                <h4>Quick Tasks</h4>
                <p>Create and organize instantly</p>
              </div>
            </div>
            <div className="feature-item" onClick={() => alert('Share with your team!')}>
              <div className="feature-icon">👥</div>
              <div className="feature-text">
                <h4>Team Collaboration</h4>
                <p>Work together seamlessly</p>
              </div>
            </div>
            <div className="feature-item" onClick={() => alert('Never miss a deadline!')}>
              <div className="feature-icon">⏰</div>
              <div className="feature-text">
                <h4>Smart Reminders</h4>
                <p>Stay on top of deadlines</p>
              </div>
            </div>
          </div>
        </div>

        <div className="login-footer">
          <p>Join thousands of productive users worldwide 🌍</p>
          <div className="trust-indicators">
            <span>🔒 Secure</span>
            <span>⚡ Fast</span>
            <span>🎨 Beautiful</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
