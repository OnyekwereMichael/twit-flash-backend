import Notification from "../models/notification.model.js";

export const getNotifications = async (req, res) => {
 try {
    // This  USERID is used to identify which notifications belong to the user. 
     const userId = req.user._id;
     
    //  Find notifications where the receiver is the current user

     const notifications = await Notification.find({ receiver: userId }).populate({
         path: 'sender',
         select: 'username profileImg',
     });
     if (!notifications) {
         return res.status(404).json({ error: 'Notifications not found' });
     }

         // Mark all fetched notifications as read by updating the 'read' field to true for each notification
     await Notification.updateMany({ receiver: userId },{read: true});
     res.status(200).json({notifications});
 } catch (error) {
     console.log('Error getting notifications', error);
     res.status(500).json('error',{ error: error.message });
 }
}

export const deleteNotification = async (req, res) => {
    try {
         // This  USERID is used to identify which notifications belong to the user.
       const userId = req.user._id;
       await Notification.deleteMany({ receiver: userId });
       res.status(200).json({ message: 'Notifications deleted successfully' });
    } catch (error) {
      console.log('Error deleting notifications', error);
    res.status(500).json('Error oo',{ error: error.message });
    }
}
