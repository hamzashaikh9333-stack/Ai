import { io } from "socket.io-client";
import { store } from "../../../app/app.store";
import { addNewMessage } from "../chat.slice.js";

let socket = null;

export function initializeSocketConnection() {
  // 🔥 1. Prevent multiple connections
  if (socket) return socket;

  socket = io(import.meta.env.VITE_API_URL, {
    withCredentials: true,
  });

  // ✅ Connected
  socket.on("connect", () => {
    console.log("✅ Connected to Socket.IO server");
  });

  // 🔥 2. REMOVE old listener before adding new one (VERY IMPORTANT)
  socket.off("messageReceived");

  // ✅ 3. Listen for messages (ONLY ONCE)
  socket.on("messageReceived", (data) => {
    const { chatId, content, role } = data;

    store.dispatch(
      addNewMessage({
        chatId,
        content,
        role,
      }),
    );
  });

  // ✅ Disconnect log
  socket.on("disconnect", () => {
    console.log("❌ Disconnected from Socket.IO server");
  });

  // ✅ Error log
  socket.on("connect_error", (error) => {
    console.error("❌ Socket error:", error);
  });

  return socket;
}

// Optional helper
export function getSocket() {
  return socket;
}
