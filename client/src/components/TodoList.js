import React, { useState } from 'react';
import { useTodos } from '../contexts/TodoContext';
import TodoItem from './TodoItem';
import Pagination from './Pagination';

const TodoList = ({ todos }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    // If todos is not provided as a prop, get them from the context
    const { todos: contextTodos } = useTodos();
    const todoItems = todos || contextTodos;
    
    // Calculate pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentTodos = todoItems.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(todoItems.length / itemsPerPage);

    return (
        <div className="todo-list">
            {currentTodos.length > 0 ? (
                <>
                    <div className="todo-items">
                        {currentTodos.map(todo => (
                            <TodoItem key={todo._id} todo={todo} />
                        ))}
                    </div>
                    
                    {totalPages > 1 && (
                        <Pagination 
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    )}
                </>
            ) : (
                <div className="todo-list-empty">
                    <div className="empty-state">
                        <svg viewBox="0 0 24 24" width="64" height="64">
                            <path fill="#ddd" d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,5V19H5V5H19Z" />
                            <path fill="#ddd" d="M12,14.58C11.37,14.58 10.86,14.07 10.86,13.44C10.86,12.81 11.37,12.3 12,12.3A1.14,1.14 0 0,1 13.14,13.44C13.14,14.07 12.63,14.58 12,14.58M10.66,9.61L11.08,11.97C11.15,12.27 11.5,12.58 11.83,12.58H12.17C12.5,12.58 12.85,12.27 12.92,11.97L13.34,9.61H10.66Z" />
                        </svg>
                        <h3>No tasks found</h3>
                        <p>You don't have any tasks matching the current filters</p>
                        <button 
                            className="btn btn-primary"
                            onClick={() => window.location.href = '/add-task'}
                        >
                            Create a New Task
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TodoList;