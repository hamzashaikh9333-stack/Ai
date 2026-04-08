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
app.use(cors({
  origin: [
    "https://wiggle-ai.netlify.app"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(morgan("dev"));

app.use("/api/auth", authRouter);
app.use("/api/chats", chatRouter);

export default app;
