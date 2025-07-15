import React from 'react';
import '../styles/utilities.css';

const SortControls = ({ currentSort, onSortChange }) => {
  const sortOptions = [
    { id: 'dueDate', label: 'Due Date', icon: 'M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z' },
    { id: 'priority', label: 'Priority', icon: 'M3,3H21V5H3V3M9,7H21V9H9V7M3,11H21V13H3V11M9,15H21V17H9V15M3,19H21V21H3V19Z' },
    { id: 'title', label: 'Title', icon: 'M3,7H21V9H3V7M3,3H21V5H3V3M3,11H21V13H3V11M3,15H21V17H3V15M3,19H21V21H3V19Z' },
    { id: 'status', label: 'Status', icon: 'M9,7V9H13V7H9M9,11V13H17V11H9M9,15V17H13V15H9M3,5H21V19H3V5M5,7V17H19V7H5Z' },
  ];

  return (
    <div className="sort-container">
      <h3 className="sort-title">Sort By</h3>
      <div className="sort-options">
        {sortOptions.map(option => (
          <button
            key={option.id}
            className={`sort-button ${currentSort === option.id ? 'active' : ''}`}
            onClick={() => onSortChange(option.id)}
          >
            <svg viewBox="0 0 24 24" className="sort-icon">
              <path fill="currentColor" d={option.icon} />
            </svg>
            <span>{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SortControls;
