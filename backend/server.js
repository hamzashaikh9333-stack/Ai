import "dotenv/config";
import app from "./src/app.js";
import connectDB from "./src/database/database.js";
import http from "http";
import { initSocket } from "./src/sockets/server.socket.js";



const httpServer = http.createServer(app);

initSocket(httpServer);


connectDB().then(() => {
  httpServer.listen(5000);
});
