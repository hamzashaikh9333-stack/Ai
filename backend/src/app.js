import cookieParser from 'cookie-parser';
import express from 'express';
import authRouter from './router/auth.routes.js';
import chatRouter from './router/chat.routes.js';
import cors from 'cors';
import morgan from 'morgan';

const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173', // Update with your frontend URL
    credentials: true, // Allow cookies to be sent
}));
app.use(morgan('dev'));

app.use("/api/auth", authRouter);
app.use("/api/chats", chatRouter);




export default app;