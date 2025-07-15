import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SyncIndicator from './SyncIndicator';

const Header = () => {
    const { isAuthenticated, user, logout } = useAuth();

    return (
        <header className="enhanced-header">
            <nav>
                <div className="header-left">
                    <Link to="/" className="logo-link">
                        <div className="logo">
                            <svg viewBox="0 0 24 24" className="logo-icon">
                                <path fill="currentColor" d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,5V19H5V5H19Z" />
                                <path fill="currentColor" d="M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9" />
                            </svg>
                            <h1>Todo App</h1>
                        </div>
                    </Link>

                    {isAuthenticated && (
                        <div className="header-nav">
                            <Link to="/dashboard" className="nav-link">Dashboard</Link>
                            <Link to="/add-task" className="nav-link">New Task</Link>
                            <Link to="/test" className="nav-link">Test Page</Link>
                        </div>
                    )}
                </div>
                
                <div className="header-right">
                    {isAuthenticated && <SyncIndicator />}
                    
                    <ul className="auth-controls">
                        {isAuthenticated ? (
                            <>
                                <li className="user-info">
                                    <span className="username">{user.name}</span>
                                    {user.avatar && <img src={user.avatar} alt={user.name} className="user-avatar" />}
                                </li>
                                <li>
                                    <button onClick={logout} className="logout-button">
                                        <svg viewBox="0 0 24 24" className="logout-icon">
                                            <path fill="currentColor" d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z" />
                                        </svg>
                                        <span>Logout</span>
                                    </button>
                                </li>
                            </>
                        ) : (
                            <li>
                                <Link to="/login" className="login-button">
                                    <svg viewBox="0 0 24 24" className="login-icon">
                                        <path fill="currentColor" d="M10,17V14H3V10H10V7L15,12L10,17M10,2H19A2,2 0 0,1 21,4V20A2,2 0 0,1 19,22H10A2,2 0 0,1 8,20V18H10V20H19V4H10V6H8V4A2,2 0 0,1 10,2Z" />
                                    </svg>
                                    <span>Login</span>
                                </Link>
                            </li>
                        )}
                    </ul>
                </div>
            </nav>
        </header>
    );
};

export default Header;