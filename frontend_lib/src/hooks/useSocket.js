// Custom React Hook for Socket.IO Integration
import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export const useSocket = () => {
    const socketRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [activeUsersCount, setActiveUsersCount] = useState(0);

    useEffect(() => {
        // Get auth token
        const token = localStorage.getItem('smartlib_token');
        if (!token) {
            console.warn('No auth token found, socket connection postponed');
            return;
        }

        // Create socket connection
        socketRef.current = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        const socket = socketRef.current;

        // Connection handlers
        socket.on('connect', () => {
            console.log('✅ Socket connected:', socket.id);
            setIsConnected(true);

            // Authenticate the socket connection
            socket.emit('authenticate', token);
        });

        socket.on('authenticated', (data) => {
            if (data.success) {
                console.log('✅ Socket authenticated');
            } else {
                console.error('❌ Socket authentication failed:', data.error);
            }
        });

        socket.on('disconnect', () => {
            console.log('❌ Socket disconnected');
            setIsConnected(false);
        });

        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            setIsConnected(false);
        });

        // Real-time event listeners
        socket.on('notification', (notification) => {
            console.log('📬 New notification:', notification);
            setNotifications(prev => [notification, ...prev].slice(0, 50)); // Keep last 50
        });

        socket.on('book:added', (data) => {
            console.log('📚 Book added:', data);
            const notification = {
                id: Date.now(),
                type: 'book_added',
                message: `New book added: ${data.book.title} by ${data.book.author}`,
                data: data.book,
                timestamp: new Date(),
                unread: true
            };
            setNotifications(prev => [notification, ...prev].slice(0, 50));
        });

        socket.on('book:deleted', (data) => {
            console.log('🗑️ Book deleted:', data);
            const notification = {
                id: Date.now(),
                type: 'book_deleted',
                message: `Book removed from library`,
                data,
                timestamp: new Date(),
                unread: true
            };
            setNotifications(prev => [notification, ...prev].slice(0, 50));
        });

        socket.on('borrow:requested', (data) => {
            console.log('📖 Borrow request:', data);
            const notification = {
                id: Date.now(),
                type: 'borrow_request',
                message: `New borrow request for ${data.book?.title || 'a book'}`,
                data,
                timestamp: new Date(),
                unread: true
            };
            setNotifications(prev => [notification, ...prev].slice(0, 50));
        });

        socket.on('borrow:approved', (data) => {
            console.log('✅ Borrow approved:', data);
            const notification = {
                id: Date.now(),
                type: 'borrow_approved',
                message: `Your request for ${data.book?.title || 'a book'} was approved`,
                data,
                timestamp: new Date(),
                unread: true
            };
            setNotifications(prev => [notification, ...prev].slice(0, 50));
        });

        socket.on('activeUsers:updated', (data) => {
            setActiveUsersCount(data.total);
        });

        // Activity heartbeat every 30 seconds
        const activityInterval = setInterval(() => {
            if (socket.connected) {
                socket.emit('activity');
            }
        }, 30000);

        // Cleanup
        return () => {
            clearInterval(activityInterval);
            if (socket) {
                socket.disconnect();
            }
        };
    }, []);

    // Helper methods
    const emit = (event, data) => {
        if (socketRef.current && isConnected) {
            socketRef.current.emit(event, data);
        }
    };

    const on = (event, callback) => {
        if (socketRef.current) {
            socketRef.current.on(event, callback);
        }
    };

    const off = (event, callback) => {
        if (socketRef.current) {
            socketRef.current.off(event, callback);
        }
    };

    const markNotificationAsRead = (notificationId) => {
        setNotifications(prev =>
            prev.map(n => n.id === notificationId ? { ...n, unread: false } : n)
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    };

    const clearNotifications = () => {
        setNotifications([]);
    };

    return {
        socket: socketRef.current,
        isConnected,
        notifications,
        activeUsersCount,
        emit,
        on,
        off,
        markNotificationAsRead,
        markAllAsRead,
        clearNotifications
    };
};

export default useSocket;
