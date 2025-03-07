import { Server } from 'socket.io';
import http from 'http';
import express from 'express';
import cors from 'cors';

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: ["http://localhost:3000", "https://twit-flash-backend-1.onrender.com"], credentials: true }));

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3000", "https://twit-flash-backend-1.onrender.com"],
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization']
    },
});

// for getting real time messages
export function getRecieverId(userId) {
    return userSocketMap[userId]
}

// for online users 
const userSocketMap = {}; // Store online users

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
    const userId = socket.handshake.query.userId;

    if (userId) {
        userSocketMap[userId] = socket.id;
        console.log("User added to online list:", userSocketMap);
        io.emit("user-connected", Object.keys(userSocketMap)); // Notify all users
    }

    socket.on("disconnect", () => {
        console.log("A user disconnected:", socket.id);
        if (userId && userSocketMap[userId] === socket.id) {
            delete userSocketMap[userId];
            io.emit("user-disconnected", Object.keys(userSocketMap)); // Notify all users
        }
    });
});

// API to fetch online users
app.get("/online-users", (req, res) => {
    console.log("Fetching online users:", Object.keys(userSocketMap));
    res.json({ onlineUsers: Object.keys(userSocketMap) });
});

export { io, server, app };
