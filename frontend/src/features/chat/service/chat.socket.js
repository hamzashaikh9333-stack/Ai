import { io } from "socket.io-client";
import {store} from "../../../app/app.store";
import { addNewMessage } from "../chat.slice.js";

let socket = null;

export function initializeSocketConnection(){
    if (socket) return socket; // Prevent multiple connections
    
    socket = io("http://localhost:3000",{
        withCredentials: true,
    })

    socket.on("connect", () => {
        console.log("✅ Connected to Socket.IO server");
    });
    
    // Listen for incoming messages from backend
    socket.on("messageReceived", (data) => {
        const { chatId, content, role } = data;
        store.dispatch(addNewMessage({ chatId, content, role }));
        console.log("📨 Message received:", data);
    });
    
    socket.on("disconnect", () => {
        console.log("❌ Disconnected from Socket.IO server");
    });
    
    socket.on("error", (error) => {
        console.error("❌ Socket error:", error);
    });
    
    return socket;
}

export function getSocket() {
    return socket;
}