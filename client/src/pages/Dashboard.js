import React from 'react';
import '../styles/utilities.css';
import TodoForm from '../components/TodoForm';
import TodoList from '../components/TodoList';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
    const { user } = useAuth();

    return (
        <div className="dashboard">
            <h2>Welcome back, {user?.name}! 👋</h2>
            <TodoForm />
            <TodoList />
        </div>
    );
};

export default Dashboard;