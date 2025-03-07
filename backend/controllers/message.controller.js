import { getRecieverId, io } from "../lib/utils/socket.js";
import Message from "../models/message.model.js";
import Notification from "../models/notification.model.js";
import { v2 as cloudinary } from "cloudinary";

export const getMessages = async (req, res) => {
   try {
     const { id: userToChatId } = req.params;
     const myId = req.user._id;
 
     const messages = await Message.find({
       $or: [
         { senderId: myId, receiverId: userToChatId },
         { senderId: userToChatId, receiverId: myId },
       ],
     }).sort({ createdAt: 1 });
 
     res.status(200).json(messages);
   } catch (error) {
     console.log("Error in getMessages controller: ", error.message);
     res.status(500).json({ error: "Internal server error" });
   }
 };

export const sendMessage = async (req, res) => {
 try {
    const {text, image} = req.body;
    const senderId = req.user._id;
    const {id: receiverId} = req.params;

    let imageUrl
    if(image) {
      const uploadedResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadedResponse.secure_url;
    }

    const message = new Message({
       text,
       image: imageUrl,
        senderId,
        receiverId
    })
    await message.save();

    const recieverSocketId = getRecieverId(receiverId)
    if(recieverSocketId) {
      io.to(receiverId).emit('Newmessage', message)
    }

    const newNotification = new Notification({
       sender: senderId,
       receiver: receiverId,
       type: 'message',
       message: `You have a new message from ${req.user.username}`
    })
    await newNotification.save();
    res.status(201).json(message);
 } catch (error) {
    console.log('Error', error);
    res.status(500).json({ error: error.message });
 }
}