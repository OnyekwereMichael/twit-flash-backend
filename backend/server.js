import express from 'express';
import path from 'path'
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import postRoutes from './routes/post.routes.js';
import messageRoutes from './routes/message.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import dotenv from 'dotenv'
import { connectDB } from './db/connectMongoDb.js';
import cookieParser from 'cookie-parser';
import { v2 as cloudinary } from 'cloudinary';
import cors from 'cors';
import { server, app } from './lib/utils/socket.js';

dotenv.config()
// const app = express();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
// this is used to parse incoming JSON data in the request body.
app.use(express.json({limit: '5mb'}));
app.use(express.urlencoded({ extended: true }));
// this is used to parse cookies from the request headers in the req.cookies.
app.use(cookieParser())

// CORS Configuration
const corsOptions = {
    origin:['https://twit-flash-q7bo.vercel.app', "http://localhost:3000" ], 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    // credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  };
  
// Apply CORS middleware
app.use(cors(corsOptions));


const PORT = process.env.PORT || 5000;
const __dirname = path.resolve()

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/post', postRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/api/message', messageRoutes)

if(process.env.NODE_ENV === 'production') {
 app.use(express.static(path.join(__dirname, 'frontend/.next')))
 app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'frontend', '.next', 'server/app'))
 }) 
}

// console.log(process.env.MONGO_URL);
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB()
})