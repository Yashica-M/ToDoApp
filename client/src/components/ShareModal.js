import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../api';
import '../styles/enhanced-ui.css';

const ShareModal = ({ todo, onClose, onShareComplete }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sharedUsers, setSharedUsers] = useState(todo.sharedWith || []);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await api.post(`/todos/${todo._id}/share`, { email: email.trim() });
      toast.success('Task shared successfully!');
      setSharedUsers([...sharedUsers, response.data.user]);
      setEmail('');
      if (onShareComplete) onShareComplete();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to share task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleRemoveShare = async (userId) => {
    try {
      await api.delete(`/todos/${todo._id}/share/${userId}`);
      setSharedUsers(sharedUsers.filter(user => user._id !== userId));
      toast.success('Sharing permission removed');
      if (onShareComplete) onShareComplete();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove user. Please try again.');
    }
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Share Task</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
            </svg>
          </button>
        </div>
        
        <div className="modal-body">
          <h4 className="share-title">"{todo.title}"</h4>
          
          <form onSubmit={handleSubmit} className="share-form">
            <div className="form-group">
              <label htmlFor="share-email">Share with (email address)</label>
              <div className="input-with-button">
                <input 
                  id="share-email"
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  disabled={isSubmitting}
                />
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sharing...' : 'Share'}
                </button>
              </div>
            </div>
          </form>
          
          <div className="shared-users-list">
            <h4>People with access</h4>
            {sharedUsers.length > 0 ? (
              <ul className="user-list">
                {sharedUsers.map(user => (
                  <li key={user._id} className="user-item">
                    <div className="user-info">
                      <div className="user-avatar">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name || user.email} />
                        ) : (
                          <div className="avatar-placeholder">
                            {(user.name || user.email).charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="user-details">
                        <div className="user-name">{user.name || 'No name'}</div>
                        <div className="user-email">{user.email}</div>
                      </div>
                    </div>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => handleRemoveShare(user._id)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-shared-users">This task is not shared with anyone yet.</p>
            )}
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
