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
  "http://localhost:5173",
  "https://your-frontend.vercel.app", // (abhi placeholder hai)
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"));
      }
    },
    credentials: true,
  })
);
app.use(morgan("dev"));

app.use("/api/auth", authRouter);
app.use("/api/chats", chatRouter);

export default app;
