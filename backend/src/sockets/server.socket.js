import { Server } from "socket.io";

let io;

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: ["https://wiggle-ai.netlify.app"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("disconnect", () => {
      // User disconnected
    });

    socket.on("error", (error) => {
      // Socket error occurred
    });
  });
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
}
