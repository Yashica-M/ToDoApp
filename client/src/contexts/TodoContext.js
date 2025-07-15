import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import { toast } from 'react-toastify';
import api from '../api';

const TodoContext = createContext();

export const useTodos = () => useContext(TodoContext);

export const TodoProvider = ({ children }) => {
    const [todos, setTodos] = useState([]);
    const [loading, setLoading] = useState(false);
    const { isAuthenticated } = useAuth();
    const socket = useSocket();

    useEffect(() => {
        console.log('TodoContext: isAuthenticated =', isAuthenticated);
        if (isAuthenticated) {
            console.log('TodoContext: Fetching todos...');
            fetchTodos();
        } else {
            console.log('TodoContext: User not authenticated, skipping fetch');
        }
    }, [isAuthenticated]);

    const fetchTodos = async () => {
        if (!isAuthenticated) {
            console.log('TodoContext: fetchTodos called but user not authenticated');
            return;
        }
        
        console.log('TodoContext: Starting fetchTodos...');
        setLoading(true);
        if (socket && socket.emit) socket.emit('sync-start');
        try {
            console.log('TodoContext: Making API call to /todos');
            const res = await api.get('/todos');
            console.log('TodoContext: Received todos:', res.data);
            setTodos(res.data);
            if (socket && socket.emit) socket.emit('sync-complete');
        } catch (err) {
            console.error('TodoContext: Failed to fetch todos:', err);
            console.error('Error details:', {
                message: err.message,
                status: err.response?.status,
                statusText: err.response?.statusText,
                url: err.config?.url
            });
            // Only show error if it's not a network/connection issue
            if (err.response && err.response.status !== 404) {
                toast.error('Failed to load tasks');
            }
            if (socket && socket.emit) socket.emit('sync-error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (socket && socket.on) {
            const handleNewTodo = (newTodo) => {
                if (socket && socket.emit) socket.emit('sync-start');
                setTodos(prevTodos => [newTodo, ...prevTodos]);
                toast.success('New task added!');
                if (socket && socket.emit) socket.emit('sync-complete');
            };
            
            const handleUpdateTodo = (updatedTodo) => {
                if (socket && socket.emit) socket.emit('sync-start');
                setTodos(prevTodos => 
                    prevTodos.map(todo => 
                        todo._id === updatedTodo._id ? updatedTodo : todo
                    )
                );
                if (socket && socket.emit) socket.emit('sync-complete');
            };
            
            const handleDeleteTodo = (todoId) => {
                if (socket && socket.emit) socket.emit('sync-start');
                setTodos(prevTodos => prevTodos.filter(todo => todo._id !== todoId));
                if (socket && socket.emit) socket.emit('sync-complete');
            };
            
            const handleSharedTodo = (sharedTodo) => {
                if (socket && socket.emit) socket.emit('sync-start');
                setTodos(prevTodos => [sharedTodo, ...prevTodos]);
                toast.info(`${sharedTodo.owner.name} shared a task with you!`);
                if (socket && socket.emit) socket.emit('sync-complete');
            };

            socket.on('new-todo', handleNewTodo);
            socket.on('update-todo', handleUpdateTodo);
            socket.on('delete-todo', handleDeleteTodo);
            socket.on('new-shared-todo', handleSharedTodo);
            
            return () => {
                socket.off('new-todo', handleNewTodo);
                socket.off('update-todo', handleUpdateTodo);
                socket.off('delete-todo', handleDeleteTodo);
                socket.off('new-shared-todo', handleSharedTodo);
            };

            return () => {
                socket.off('new-todo');
                socket.off('update-todo');
                socket.off('delete-todo');
                socket.off('new-shared-todo');
            };
        }
    }, [socket]);

    return (
        <TodoContext.Provider value={{ todos, setTodos, loading, fetchTodos }}>
            {children}
        </TodoContext.Provider>
    );
};