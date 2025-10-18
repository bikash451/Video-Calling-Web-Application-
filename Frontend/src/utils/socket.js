import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

let socket = null;

export const initSocket = () => {
    if (!socket) {
        console.log('🔌 Initializing socket connection to:', SOCKET_URL);
        
        socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            upgrade: true,
            rememberUpgrade: true,
        });

        socket.on('connect', () => {
            console.log('✅ Socket connected successfully!');
            console.log('Socket ID:', socket.id);
            console.log('Connected:', socket.connected);
        });

        socket.on('disconnect', (reason) => {
            console.log('❌ Socket disconnected. Reason:', reason);
        });

        socket.on('connect_error', (error) => {
            console.error('❌ Socket connection error:', error.message);
            console.error('Full error:', error);
        });

        socket.on('error', (error) => {
            console.error('❌ Socket error:', error);
        });

        socket.on('reconnect_attempt', (attemptNumber) => {
            console.log('🔄 Reconnection attempt:', attemptNumber);
        });

        socket.on('reconnect', (attemptNumber) => {
            console.log('✅ Reconnected after', attemptNumber, 'attempts');
        });
    }
    return socket;
};

export const getSocket = () => {
    if (!socket) {
        return initSocket();
    }
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

export default { initSocket, getSocket, disconnectSocket };
