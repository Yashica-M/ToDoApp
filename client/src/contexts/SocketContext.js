import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSync, setLastSync] = useState(null);
    const { user, isAuthenticated } = useAuth();

    useEffect(() => {
        console.log('SocketContext: Initializing socket connection...');
        const newSocket = io('https://your-deployed-backend-url', {
            transports: ['websocket', 'polling'],
            autoConnect: true,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5,
            forceNew: true
        });
    
        // Set up socket event handlers
        newSocket.on('connect', () => {
            setIsConnected(true);
            console.log('Socket connected successfully, ID:', newSocket.id);
            
            // Join user room if authenticated
            if (user && user.id) {
                newSocket.emit('join', user.id);
                console.log('Joined user room:', user.id);
            }
        });
        
        newSocket.on('disconnect', (reason) => {
            setIsConnected(false);
            console.log('Socket disconnected, reason:', reason);
        });
        
        newSocket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            setIsConnected(false);
        });
        
        newSocket.on('sync_start', () => {
            setIsSyncing(true);
            console.log('Sync started');
        });
        
        newSocket.on('sync_complete', () => {
            setIsSyncing(false);
            setLastSync(new Date());
            console.log('Sync completed');
        });
        
        setSocket(newSocket);
        
        return () => {
            newSocket.off('connect');
            newSocket.off('disconnect');
            newSocket.off('sync_start');
            newSocket.off('sync_complete');
            newSocket.close();
        };
    }, []); // Empty dependency array to run only once

    useEffect(() => {
        if (socket && socket.emit && isAuthenticated && user) {
            socket.emit('join', user.id);
        }
    }, [socket, isAuthenticated, user]);

    const socketContextValue = {
        socket,
        isConnected,
        isSyncing,
        lastSync,
        // Helper function to trigger a sync manually
        triggerSync: () => {
            if (socket && socket.emit && isAuthenticated) {
                setIsSyncing(true);
                socket.emit('request_sync', user?.id);
            }
        }
    };

    return (
        <SocketContext.Provider value={socketContextValue}>
            {children}
        </SocketContext.Provider>
    );
};