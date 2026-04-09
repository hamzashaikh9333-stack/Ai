import cookieParser from "cookie-parser";
import express from "express";
import authRouter from "./router/auth.routes.js";
import chatRouter from "./router/chat.routes.js";
import cors from "cors";
import morgan from "morgan";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const allowedOrigins = [
  "http://localhost:5173", // Vite frontend
  "http://localhost:3000", // agar frontend yaha hai
  "https://your-netlify-site.netlify.app", // production frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // 🔥 VERY IMPORTANT (cookies ke liye)
  }),
);
app.use(morgan("dev"));

app.use("/api/auth", authRouter);
app.use("/api/chats", chatRouter);

export default app;
