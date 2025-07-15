import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import TodoForm from './TodoForm';
import { toast } from 'react-toastify';
import '../styles/enhanced-form.css';

const AddTaskPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const { isAuthenticated } = useAuth();
  const [taskData, setTaskData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Fetch task data if in edit mode
  useEffect(() => {
    const fetchTaskData = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const response = await api.get(`/todos/${id}`);
        setTaskData(response.data);
      } catch (err) {
        console.error('Error fetching task data:', err);
        toast.error('Could not load task data');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    
    if (isEditing && id) {
      fetchTaskData();
    }
  }, [isEditing, id, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  const handleTaskSubmitSuccess = () => {
    navigate('/dashboard');
  };
  
  return (
    <div className="page-container">
      <div className="form-container">
        <div className="form-header">
          <button 
            className="back-button"
            onClick={() => navigate('/dashboard')}
          >
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z" />
            </svg>
            Back
          </button>
          <h1>{isEditing ? 'Edit Task' : 'Create New Task'}</h1>
        </div>
        
        {loading ? (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <p>Loading task data...</p>
          </div>
        ) : (
          <TodoForm 
            initialData={taskData} 
            onSubmitSuccess={handleTaskSubmitSuccess}
            isEdit={isEditing}
          />
        )}
      </div>
    </div>
  );
};

export default AddTaskPage;
