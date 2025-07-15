import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import api from '../api';
import '../styles/enhanced-form.css';

const TodoForm = ({ initialData, onSubmitSuccess, isEdit = false }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        dueDate: ''
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const { user } = useAuth();
    // Use the api import directly instead of from auth context
    // as it's already imported at the top level in the file

    // Initialize with initialData if in edit mode
    useEffect(() => {
        if (initialData && isEdit) {
            setFormData({
                title: initialData.title || '',
                description: initialData.description || '',
                status: initialData.status || 'pending',
                priority: initialData.priority || 'medium',
                dueDate: initialData.dueDate ? initialData.dueDate.split('T')[0] : ''
            });
        }
    }, [initialData, isEdit]);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));

        // Mark field as touched
        if (!touched[name]) {
            setTouched(prev => ({ ...prev, [name]: true }));
        }

        // Validate on change
        validateField(name, value);
    };

    // Handle field blur for validation
    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        validateField(name, value);
    };

    // Validate a single field
    const validateField = (name, value) => {
        let fieldErrors = {};

        switch (name) {
            case 'title':
                if (!value.trim()) {
                    fieldErrors.title = 'Task title is required';
                } else if (value.length < 3) {
                    fieldErrors.title = 'Title must be at least 3 characters';
                } else if (value.length > 100) {
                    fieldErrors.title = 'Title must be less than 100 characters';
                }
                break;
            
            case 'description':
                if (value.length > 500) {
                    fieldErrors.description = 'Description must be less than 500 characters';
                }
                break;
                
            case 'dueDate':
                if (value) {
                    const dueDate = new Date(value);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    
                    if (dueDate < today) {
                        fieldErrors.dueDate = 'Due date cannot be in the past';
                    }
                }
                break;
                
            default:
                break;
        }

        setErrors(prev => ({
            ...prev,
            [name]: fieldErrors[name] || null
        }));

        return !fieldErrors[name];
    };

    // Validate all fields
    const validateForm = () => {
        const titleValid = validateField('title', formData.title);
        const descriptionValid = validateField('description', formData.description);
        const dueDateValid = validateField('dueDate', formData.dueDate);
        
        return titleValid && descriptionValid && dueDateValid;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Mark all fields as touched
        const allTouched = Object.keys(formData).reduce((acc, key) => {
            acc[key] = true;
            return acc;
        }, {});
        setTouched(allTouched);
        
        // Validate all fields
        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }
        
        setLoading(true);
        try {
            if (isEdit && initialData?._id) {
                await api.put(`/todos/${initialData._id}`, formData);
                toast.success('Task updated successfully!');
            } else {
                await api.post('/todos', formData);
                toast.success('Task created successfully!');
                
                // Reset form after successful creation
                if (!isEdit) {
                    setFormData({
                        title: '',
                        description: '',
                        status: 'pending',
                        priority: 'medium',
                        dueDate: ''
                    });
                    setTouched({});
                }
            }
            
            // Call the success callback if provided
            if (onSubmitSuccess) {
                onSubmitSuccess();
            }
        } catch (err) {
            console.error('Error submitting task:', err);
            toast.error(err.response?.data?.message || 'Failed to save task');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="enhanced-todo-form">
            <h3>{isEdit ? 'Edit Task' : 'Create a New Task'}</h3>
            <form onSubmit={handleSubmit} className="animated fadeIn">
                <div className="form-group">
                    <label htmlFor="title" className={touched.title && errors.title ? 'error' : ''}>
                        Task Title *
                    </label>
                    <div className="input-container">
                        <input
                            id="title"
                            type="text"
                            name="title"
                            placeholder="What needs to be done?"
                            value={formData.title}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={touched.title && errors.title ? 'error' : ''}
                        />
                        {touched.title && errors.title && (
                            <div className="error-message">{errors.title}</div>
                        )}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="dueDate">Due Date</label>
                        <div className="input-container date-container">
                            <input
                                id="dueDate"
                                type="date"
                                name="dueDate"
                                value={formData.dueDate}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={touched.dueDate && errors.dueDate ? 'error' : ''}
                            />
                            <svg className="calendar-icon" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z" />
                            </svg>
                            {touched.dueDate && errors.dueDate && (
                                <div className="error-message">{errors.dueDate}</div>
                            )}
                        </div>
                    </div>
                </div>
                
                <div className="form-row">
                    <div className="form-group priority-group">
                        <label>Priority Level</label>
                        <div className="priority-selector">
                            <label className={`priority-option low ${formData.priority === 'low' ? 'selected' : ''}`}>
                                <input 
                                    type="radio" 
                                    name="priority" 
                                    value="low" 
                                    checked={formData.priority === 'low'}
                                    onChange={handleChange} 
                                />
                                <span className="priority-label">Low</span>
                            </label>
                            <label className={`priority-option medium ${formData.priority === 'medium' ? 'selected' : ''}`}>
                                <input 
                                    type="radio" 
                                    name="priority" 
                                    value="medium" 
                                    checked={formData.priority === 'medium'}
                                    onChange={handleChange} 
                                />
                                <span className="priority-label">Medium</span>
                            </label>
                            <label className={`priority-option high ${formData.priority === 'high' ? 'selected' : ''}`}>
                                <input 
                                    type="radio" 
                                    name="priority" 
                                    value="high" 
                                    checked={formData.priority === 'high'}
                                    onChange={handleChange} 
                                />
                                <span className="priority-label">High</span>
                            </label>
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="status">Status</label>
                        <select 
                            id="status" 
                            name="status" 
                            value={formData.status} 
                            onChange={handleChange}
                            className={`status-select ${formData.status}`}
                        >
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                </div>
                
                <div className="form-group">
                    <label htmlFor="description" className={touched.description && errors.description ? 'error' : ''}>
                        Description
                    </label>
                    <div className="input-container">
                        <textarea
                            id="description"
                            name="description"
                            placeholder="Add details about this task (optional)"
                            value={formData.description}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            rows="4"
                            className={touched.description && errors.description ? 'error' : ''}
                        />
                        {touched.description && errors.description && (
                            <div className="error-message">{errors.description}</div>
                        )}
                        <div className="char-counter">
                            {formData.description.length}/500
                        </div>
                    </div>
                </div>
                
                <div className="form-actions">
                    {isEdit && (
                        <button type="button" className="btn-secondary" onClick={onSubmitSuccess}>
                            Cancel
                        </button>
                    )}
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? (
                            <span className="loading-text">
                                <span className="loading-spinner"></span>
                                {isEdit ? 'Updating...' : 'Creating...'}
                            </span>
                        ) : isEdit ? 'Update Task' : 'Create Task'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TodoForm;