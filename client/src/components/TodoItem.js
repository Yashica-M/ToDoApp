import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTodos } from '../contexts/TodoContext';
import api from '../api';
import { toast } from 'react-toastify';
import ShareModal from './ShareModal';
import EditTaskModal from './EditTaskModal';
import '../styles/enhanced-todo-item.css';

const TodoItem = ({ todo }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { fetchTodos } = useTodos();
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(todo.title);
    const [editDescription, setEditDescription] = useState(todo.description || '');
    const [editDueDate, setEditDueDate] = useState(todo.dueDate ? todo.dueDate.slice(0,10) : '');
    const [editPriority, setEditPriority] = useState(todo.priority || 'low');

    // Handle edit button click (toggle form)
    const handleEdit = (e) => {
        e.stopPropagation();
        setIsEditing(true);
    };

    // Handle save edit
    const handleSaveEdit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/todos/${todo._id}`, {
                title: editTitle,
                description: editDescription,
                dueDate: editDueDate,
                priority: editPriority
            });
            await fetchTodos();
            toast.success('Task updated successfully');
            setIsEditing(false);
        } catch (err) {
            toast.error('Failed to update task');
        }
    };

    // Handle cancel edit
    const handleCancelEdit = (e) => {
        e.preventDefault();
        setIsEditing(false);
        setEditTitle(todo.title);
        setEditDescription(todo.description || '');
        setEditDueDate(todo.dueDate ? todo.dueDate.slice(0,10) : '');
        setEditPriority(todo.priority || 'low');
    };




    // Format due date
    const formatDueDate = (dateString) => {
        if (!dateString) return 'No due date';
        
        const dueDate = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        
        if (dueDate.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (dueDate.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow';
        } else {
            return dueDate.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: dueDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
            });
        }
    };

    // Get priority badge class
    const getPriorityClass = (priority) => {
        switch(priority) {
            case 'high': return 'priority-high';
            case 'medium': return 'priority-medium';
            default: return 'priority-low';
        }
    };
    
    // Get status badge class
    const getStatusClass = (status) => {
        if (todo.completed || todo.status === 'completed') return 'status-completed';
        
        if (!todo.dueDate) return 'status-ongoing';
        
        const dueDate = new Date(todo.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return dueDate < today ? 'status-overdue' : 'status-upcoming';
    };

    // Handle toggle completion
    const handleToggleComplete = async (e) => {
        e.stopPropagation();
        if (isCompleting) return;
        setIsCompleting(true);
        try {
            await api.put(`/todos/${todo._id}`, {
                completed: !todo.completed,
                status: !todo.completed ? 'completed' : 'ongoing'
            });
            await fetchTodos();
        } catch (err) {
            console.error('Error toggling completion:', err);
        } finally {
            setIsCompleting(false);
        }
    };

    // Handle delete
    const handleDelete = async (e) => {
        e.stopPropagation();
        if (isDeleting) return;

        const confirmed = window.confirm('Are you sure you want to delete this task?');
        if (!confirmed) return;

        setIsDeleting(true);
        try {
            await api.delete(`/todos/${todo._id}`);
            await fetchTodos();
            toast.success('Task deleted successfully');
        } catch (err) {
            // Log error details
            console.error('Error deleting task:', err);
            if (err.response && err.response.data && err.response.data.message) {
                toast.error(`Failed to delete task: ${err.response.data.message}`);
            } else {
                toast.error('Failed to delete task');
            }
        } finally {
            setIsDeleting(false);
        }
    };

    // Handle share
    const handleShare = (e) => {
        e.stopPropagation();
        setIsShareModalOpen(true);
    };

    // No longer used - removed to fix linting error
    // const handleQuickStatusChange = async (newStatus) => {...};
    
    // No longer used - using formatDueDate instead
    // const formatDate = (date) => {...};

    // Check if task is overdue
    const isOverdue = () => {
        if (!todo.dueDate || todo.completed || todo.status === 'completed') return false;
        const dueDate = new Date(todo.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return dueDate < today;
    };

    return (
        <>
          <div className={`todo-item ${(todo.completed || todo.status === 'completed') ? 'completed' : ''} ${isOverdue() ? 'overdue' : ''}`} style={{ position: 'relative' }}>
            {/* Checkbox for completion */}
            <div className="todo-checkbox-container">
              <button 
                className={`todo-checkbox ${(todo.completed || todo.status === 'completed') ? 'checked' : ''}`} 
                onClick={handleToggleComplete}
                disabled={isCompleting}
                aria-label={(todo.completed || todo.status === 'completed') ? "Mark as incomplete" : "Mark as complete"}
              >
                {(todo.completed || todo.status === 'completed') && (
                  <svg viewBox="0 0 24 24" className="check-icon">
                    <path fill="currentColor" d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z" />
                  </svg>
                )}
                {isCompleting && (
                  <div className="checkbox-spinner"></div>
                )}
              </button>
            </div>

            {/* Task content or edit form */}
            <div className="todo-content">
              {!isEditing && (
                <>
                  <div className="todo-header">
                    <h3 className="todo-title">{todo.title}</h3>
                    <div className="todo-badges">
                      {todo.priority && (
                        <span className={`badge priority-badge ${getPriorityClass(todo.priority)}`}>
                          {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
                        </span>
                      )}
                      <span className={`badge status-badge ${getStatusClass()}`}>
                        {(todo.completed || todo.status === 'completed') ? 'Completed' : 
                          isOverdue() ? 'Overdue' : 
                          !todo.dueDate ? 'Ongoing' : 'Upcoming'}
                      </span>
                    </div>
                  </div>
                  {todo.description && (
                    <p className="todo-description">{todo.description}</p>
                  )}
                  <div className="todo-footer">
                    {todo.dueDate && (
                      <div className="todo-due-date">
                        <svg viewBox="0 0 24 24" className="due-date-icon">
                          <path fill="currentColor" d="M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z" />
                        </svg>
                        <span className={isOverdue() ? 'text-danger' : ''}>
                          {formatDueDate(todo.dueDate)}
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Task actions - moved to bottom right, styled as soft badges */}
            {((!todo.sharedWith || todo.sharedWith.length === 0) || (user && todo.owner && user._id === todo.owner._id)) && (
              <div className="todo-actions" style={{
                position: 'absolute',
                right: '18px',
                bottom: '18px',
                display: 'flex',
                gap: '10px',
                zIndex: 2
              }}>
                <button 
                  className="action-button edit-button soft-badge" 
                  style={{
                    padding: '0.5em 1.5em',
                    borderRadius: '999px',
                    background: 'rgba(67,160,71,0.12)',
                    color: '#388e3c',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '15px',
                    boxShadow: 'none',
                    cursor: isEditing ? 'not-allowed' : 'pointer',
                    opacity: isEditing ? 0.6 : 1,
                    transition: 'background 0.2s',
                    minWidth: '80px',
                    textAlign: 'center'
                  }}
                  onClick={handleEdit}
                  aria-label="Edit task"
                  disabled={isEditing}
                >
                  Edit
                </button>
                <button 
                  className="action-button delete-button soft-badge" 
                  style={{
                    padding: '0.5em 1.5em',
                    borderRadius: '999px',
                    background: 'rgba(97,97,97,0.12)',
                    color: '#616161',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '15px',
                    boxShadow: 'none',
                    cursor: isDeleting ? 'not-allowed' : 'pointer',
                    opacity: isDeleting ? 0.6 : 1,
                    transition: 'background 0.2s',
                    minWidth: '80px',
                    textAlign: 'center'
                  }}
                  onClick={handleDelete}
                  disabled={isDeleting}
                  aria-label="Delete task"
                >
                  Delete
                </button>
                <button 
                  className="action-button share-button soft-badge" 
                  style={{
                    padding: '0.5em 1.5em',
                    borderRadius: '999px',
                    background: 'rgba(33,150,243,0.12)',
                    color: '#1976d2',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '15px',
                    boxShadow: 'none',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    minWidth: '80px',
                    textAlign: 'center'
                  }}
                  onClick={handleShare}
                  aria-label="Share task"
                >
                  Share
                </button>
              </div>
            )}
          </div>
          {isShareModalOpen && (
            <ShareModal 
              todo={todo} 
              onClose={() => setIsShareModalOpen(false)}
              onShareComplete={fetchTodos}
            />
          )}
          {isEditing && (
            <EditTaskModal
              isOpen={isEditing}
              onClose={handleCancelEdit}
              onSave={handleSaveEdit}
              editTitle={editTitle}
              setEditTitle={setEditTitle}
              editDescription={editDescription}
              setEditDescription={setEditDescription}
              editDueDate={editDueDate}
              setEditDueDate={setEditDueDate}
              editPriority={editPriority}
              setEditPriority={setEditPriority}
              handleSaveEdit={handleSaveEdit}
              handleCancelEdit={handleCancelEdit}
            />
          )}
        </>
      );
};

export default TodoItem;