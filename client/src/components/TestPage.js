import React, { useState, useEffect } from 'react';
import TodoItem from './TodoItem';
import TodoForm from './TodoForm';
import TodoFilters from './TodoFilters';
import SortControls from './SortControls';
import '../styles/enhanced-ui.css';

// Sample data for demonstration
const sampleTasks = [
  {
    _id: '1',
    title: 'Complete Project Documentation',
    description: 'Write comprehensive documentation for the Todo App project',
    status: 'in-progress',
    priority: 'high',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
    owner: { _id: 'user1', name: 'John Doe' },
    sharedWith: [
      { _id: 'user2', name: 'Jane Smith' },
      { _id: 'user3', name: 'Bob Johnson' }
    ],
    completed: false
  },
  {
    _id: '2',
    title: 'Fix Bug in Login Flow',
    description: 'Address authentication issues in the login process',
    status: 'pending',
    priority: 'medium',
    dueDate: new Date(Date.now() - 86400000).toISOString(), // 1 day ago (overdue)
    owner: { _id: 'user1', name: 'John Doe' },
    sharedWith: [],
    completed: false
  },
  {
    _id: '3',
    title: 'Update Dependencies',
    description: 'Update all npm packages to their latest versions',
    status: 'completed',
    priority: 'low',
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days from now
    owner: { _id: 'user1', name: 'John Doe' },
    sharedWith: [],
    completed: true
  }
];

const TestPage = () => {
  const [tasks, setTasks] = useState(sampleTasks);
  const [filters, setFilters] = useState({ status: 'all', priority: 'all' });
  const [sortOption, setSortOption] = useState('dueDate');
  const [showForm, setShowForm] = useState(false);
  
  // Filter and sort tasks
  const filteredTasks = tasks.filter(task => {
    if (filters.status !== 'all' && task.status !== filters.status) {
      return false;
    }
    if (filters.priority !== 'all' && task.priority !== filters.priority) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    switch (sortOption) {
      case 'dueDate':
        return new Date(a.dueDate) - new Date(b.dueDate);
      case 'priority':
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  return (
    <div className="test-page">
      <h1 className="page-title">Test Page - Enhanced UI Components</h1>
      
      <div className="test-section">
        <h2>Todo Item Component</h2>
        <div className="todo-items-container">
          {tasks.map(task => (
            <TodoItem 
              key={task._id} 
              todo={task}
            />
          ))}
        </div>
      </div>
      
      <div className="test-section">
        <h2>Todo Filters & Sorting</h2>
        <div className="controls-container">
          <TodoFilters 
            filters={filters}
            onChange={setFilters}
          />
          <SortControls
            sortOption={sortOption}
            onChange={setSortOption}
          />
        </div>
      </div>
      
      <div className="test-section">
        <h2>Todo Form</h2>
        <button 
          className="btn-primary toggle-form-button"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Hide Form' : 'Show Form'}
        </button>
        
        {showForm && (
          <TodoForm
            onSubmitSuccess={() => {
              setShowForm(false);
              // In a real app, this would refresh tasks
            }}
          />
        )}
      </div>
    </div>
  );
};

export default TestPage;
