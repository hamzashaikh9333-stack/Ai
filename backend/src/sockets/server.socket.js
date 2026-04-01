import { Server } from 'socket.io';

let io;

export function initSocket(httpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: "http://localhost:5173",
            credentials: true,
        },
    });

    console.log("✅ Socket.io server is Running");

    io.on('connection', (socket) => {
        console.log('👤 User connected: ' + socket.id);
        
        socket.on('disconnect', () => {
            console.log('👤 User disconnected: ' + socket.id);
        });
        
        socket.on('error', (error) => {
            console.error('❌ Socket error:', error);
        });
    });
}

export function getIO() {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
}

