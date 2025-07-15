import React from 'react';
import '../styles/utilities.css';

const TodoFilters = ({ currentFilter, onFilterChange }) => {
  const filters = [
    { id: 'all', label: 'All Tasks', icon: 'M3,5H9V11H3V5M5,7V9H7V7H5M11,7H21V9H11V7M11,15H21V17H11V15M5,13V15H7V13H5M3,13H9V19H3V13Z' },
    { id: 'today', label: 'Due Today', icon: 'M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z' },
    { id: 'overdue', label: 'Overdue', icon: 'M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M11,8H13V13.4L16.2,16.6L14.8,18L11,14.2V8Z' },
    { id: 'completed', label: 'Completed', icon: 'M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z' },
  ];

  return (
    <div className="filters-container">
      <h3 className="filters-title">Filters</h3>
      <nav className="filter-nav">
        {filters.map(filter => (
          <button
            key={filter.id}
            className={`filter-button ${currentFilter === filter.id ? 'active' : ''}`}
            onClick={() => onFilterChange(filter.id)}
          >
            <svg viewBox="0 0 24 24" className="filter-icon">
              <path fill="currentColor" d={filter.icon} />
            </svg>
            <span>{filter.label}</span>
            
            {currentFilter === filter.id && (
              <span className="active-indicator"></span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default TodoFilters;
