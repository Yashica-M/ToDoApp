import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TodoList from './TodoList';
import TodoFilters from './TodoFilters';
import SortControls from './SortControls';
import { useTodos } from '../contexts/TodoContext';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import '../styles/dashboard.css';

import axios from 'axios';
import Modal from './ShareModal';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  const { todos, loading } = useTodos();
  const socket = useSocket();
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [syncStatus, setSyncStatus] = useState('saved'); // 'saved', 'syncing', 'error'
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showConfetti, setShowConfetti] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [statsAnimated, setStatsAnimated] = useState(false);
  // Animate stats on load
  useEffect(() => {
    const timer = setTimeout(() => setStatsAnimated(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Show confetti when task is completed
  useEffect(() => {
    const completedCount = todos.filter(t => t.completed === true || t.status === 'completed').length;
    if (completedCount > 0 && todos.length > 0) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [todos]);

  const handleMouseMove = (e) => {
    setMousePosition({
      x: e.clientX,
      y: e.clientY,
    });
  };
  
  // Listen for socket events to update sync status
  React.useEffect(() => {
    if (socket && socket.on) {
      const handleSyncStart = () => setSyncStatus('syncing');
      const handleSyncComplete = () => setSyncStatus('saved');
      const handleSyncError = () => {
        setSyncStatus('error');
        setTimeout(() => setSyncStatus('saved'), 3000);
      };
      const handleConnect = () => setSyncStatus('saved');
      const handleDisconnect = () => setSyncStatus('error');
      
      socket.on('sync-start', handleSyncStart);
      socket.on('sync-complete', handleSyncComplete);
      socket.on('sync-error', handleSyncError);
      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);
      
      return () => {
        socket.off('sync-start', handleSyncStart);
        socket.off('sync-complete', handleSyncComplete);
        socket.off('sync-error', handleSyncError);
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
      };
    }
  }, [socket]);

  // Handle adding a new task
  const handleAddTask = () => {
    // Add bounce animation before navigation
    const button = document.querySelector('.add-task-button');
    if (button) {
      button.style.transform = 'scale(0.95)';
      setTimeout(() => {
        button.style.transform = 'scale(1)';
        navigate('/add-task');
      }, 150);
    } else {
      navigate('/add-task');
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    // Add typing animation effect
    const searchWrapper = document.querySelector('.search-input-wrapper');
    if (searchWrapper) {
      searchWrapper.classList.add('typing');
      setTimeout(() => searchWrapper.classList.remove('typing'), 300);
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    // Add filter change animation
    const content = document.querySelector('.dashboard-content');
    if (content) {
      content.style.opacity = '0.7';
      content.style.transform = 'translateY(10px)';
      setTimeout(() => {
        content.style.opacity = '1';
        content.style.transform = 'translateY(0)';
      }, 200);
    }
  };

  // Filter todos based on selected filter
  const filteredTodos = todos.filter(todo => {
    // Apply text search first
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const titleMatch = todo.title.toLowerCase().includes(query);
      const descriptionMatch = todo.description && todo.description.toLowerCase().includes(query);
      if (!titleMatch && !descriptionMatch) {
        return false;
      }
    }
    
    // Get today's date for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Parse due date if it exists
    const dueDate = todo.dueDate ? new Date(todo.dueDate) : null;
    if (dueDate) dueDate.setHours(0, 0, 0, 0);
    
    // Check if task is completed (handle both completed field and status)
    const isCompleted = todo.completed === true || todo.status === 'completed';
    
    // Apply filter logic
    switch (filter) {
      case 'all':
        return true;
      case 'today':
        if (!dueDate) return false;
        return dueDate.getTime() === today.getTime();
      case 'overdue':
        if (!dueDate || isCompleted) return false;
        return dueDate.getTime() < today.getTime();
      case 'completed':
        return isCompleted;
      default:
        return true;
    }
  });
  
  // Sort todos based on selected sort option
  const sortedTodos = [...filteredTodos].sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority || 'low'] - priorityOrder[b.priority || 'low'];
      case 'dueDate':
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      case 'title':
        return a.title.localeCompare(b.title);
      case 'status':
        return a.completed === b.completed ? 0 : a.completed ? 1 : -1;
      default:
        return 0;
    }
  });

return (
    <>
      <div className="dashboard-container" onMouseMove={handleMouseMove}>
        {/* Interactive background elements */}
        <div className="dashboard-bg-effects">
          <div className="floating-shapes">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="floating-shape"
                style={{
                  left: `${10 + i * 12}%`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: `${4 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
          {/* Mouse trail effect */}
          <div 
            className="mouse-trail"
            style={{
              left: mousePosition.x - 10,
              top: mousePosition.y - 10,
            }}
          />
        </div>

        {/* Confetti celebration */}
        {showConfetti && (
          <div className="confetti-container">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="confetti-piece"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][Math.floor(Math.random() * 5)]
                }}
              />
            ))}
          </div>
        )}

        {/* Header/Navigation Bar */}
        <header className="dashboard-header animated-header">
        <div className="header-left">
          <div className="app-logo interactive-logo">
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
          <button 
            className="menu-toggle interactive-button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Toggle menu"
          >
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z" />
            </svg>
            <div className="button-ripple"></div>
          </button>
          <h1 className="app-title gradient-text">TaskSphere</h1>
        </div>
        
        <div className="header-search">
          <div className={`search-input-wrapper ${searchFocused ? 'focused' : ''}`}>
            {/* Search icon removed as requested */}
            <input 
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className={`search-input ${searchFocused ? 'focused' : ''} ${searchQuery ? 'typing' : ''}`}
            />
            <div className="search-glow"></div>
          </div>
        </div>
        
        <div className="header-right">
          {user && (
            <div className="user-profile">
              <div className="user-avatar">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} />
                ) : (
                  <div className="avatar-placeholder">
                    {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                  </div>
                )}
              </div>
              <span className="user-name">{user.name}</span>
              <button onClick={handleLogout} className="logout-button">
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path fill="currentColor" d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z" />
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>

        </header>

        {/* Share Modal (inline) */}

        <div className="dashboard-main">
        {/* Sidebar */}
        <aside className={`dashboard-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
          <div className="sidebar-content">
            <TodoFilters currentFilter={filter} onFilterChange={setFilter} />
            <hr className="sidebar-divider" />
            <SortControls currentSort={sortBy} onSortChange={setSortBy} />
          </div>
        </aside>

        {/* Main Content */}
        <main className="dashboard-content">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading your tasks...</p>
            </div>
          ) : todos.length === 0 ? (
            <div className="no-tasks-container">
              <div className="empty-state animated-empty-state">
                <div className="animated-icon-container">
                  <svg viewBox="0 0 24 24" width="80" height="80" className="empty-icon pulsing-icon">
                    <path fill="url(#empty-gradient)" d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,5V19H5V5H19Z" />
                    <path fill="url(#empty-gradient)" d="M12,14.58C11.37,14.58 10.86,14.07 10.86,13.44C10.86,12.81 11.37,12.3 12,12.3A1.14,1.14 0 0,1 13.14,13.44C13.14,14.07 12.63,14.58 12,14.58M10.66,9.61L11.08,11.97C11.15,12.27 11.5,12.58 11.83,12.58H12.17C12.5,12.58 12.85,12.27 12.92,11.97L13.34,9.61H10.66Z" />
                    <defs>
                      <linearGradient id="empty-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#4d90fe" />
                        <stop offset="100%" stopColor="#667eea" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="icon-shadow"></div>
                  <div className="icon-particles">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className={`icon-particle particle-${i}`}></div>
                    ))}
                  </div>
                </div>
                <h3 className="empty-title">No tasks found</h3>
                <p className="empty-description">Get started by creating your first task!</p>
                <button 
                  className="btn btn-primary animated-button"
                  onClick={handleAddTask}
                >
                  <span className="btn-text">Create Your First Task</span>
                  <span className="btn-icon">+</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className={`todo-stats ${statsAnimated ? 'animated' : ''}`}>
                <div className="stat-card interactive-stat" onClick={() => handleFilterChange('all')}>
                  <div className="stat-icon">📝</div>
                  <span className="stat-value counter">
                    {todos.filter(t => !t.completed && t.status !== 'completed').length}
                  </span>
                  <span className="stat-label">Open Tasks</span>
                  <div className="stat-glow"></div>
                </div>
                <div className="stat-card interactive-stat" onClick={() => handleFilterChange('completed')}>
                  <div className="stat-icon">✅</div>
                  <span className="stat-value counter">
                    {todos.filter(t => t.completed === true || t.status === 'completed').length}
                  </span>
                  <span className="stat-label">Completed</span>
                  <div className="stat-glow"></div>
                </div>
                <div className="stat-card interactive-stat" onClick={() => handleFilterChange('today')}>
                  <div className="stat-icon">🎯</div>
                  <span className="stat-value counter">
                    {todos.filter(t => {
                      if (!t.dueDate) return false;
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const dueDate = new Date(t.dueDate);
                      dueDate.setHours(0, 0, 0, 0);
                      return dueDate.getTime() === today.getTime();
                    }).length}
                  </span>
                  <span className="stat-label">Due Today</span>
                  <div className="stat-glow"></div>
                </div>
              </div>
              
              <h2 className="section-title">
                {filter === 'all' ? 'All Tasks' : 
                 filter === 'today' ? 'Due Today' :
                 filter === 'overdue' ? 'Overdue Tasks' :
                 filter === 'completed' ? 'Completed Tasks' : 'Tasks'}
                <span className="task-count">({sortedTodos.length})</span>
              </h2>
              
              <TodoList todos={sortedTodos} />
              
              <button 
                className="add-task-button interactive-button"
                onClick={handleAddTask}
                aria-label="Add new task"
              >
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
                </svg>
              </button>
            </>
          )}
        </main>
      </div>
      
      {/* Sync Indicator */}
        <div className={`sync-indicator ${syncStatus}`}>
        {syncStatus === 'syncing' ? (
          <>
            <svg className="sync-icon" viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z">
                <animateTransform 
                  attributeName="transform" 
                  type="rotate" 
                  from="0 12 12" 
                  to="360 12 12" 
                  dur="1s" 
                  repeatCount="indefinite"
                />
              </path>
            </svg>
            <span className="sync-text">Syncing changes...</span>
          </>
        ) : syncStatus === 'error' ? (
          <>
            <svg className="sync-icon error" viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
            </svg>
            <span className="sync-text error">Sync error</span>
          </>
        ) : (
          <>
            <svg className="sync-icon" viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
            </svg>
            <span className="sync-text">All changes saved</span>
          </>
        )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
