import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
// models 
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

export const getUserProfile = async (req, res) => {
 const { username } = req.params;
 try {
    const user = await User.findOne({ username }).select("-password");
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
 } catch (error) {
   console.log('Error', error);
    res.status(500).json({ error: error.message });
 }
}

export const followUnfollowUser = async (req, res) => {
    const {id} = req.params
    console.log('This', id);  
    try {
        const userToModify = await User.findById(id);
        const currentUser = await User.findById(req.user._id);

          // Prevent users from following/unfollowing themselves
        if(id === req.user._id.toString()) {
            return res.status(403).json({ error: 'You cannot follow/unfollow yourself' });
        }
            // Check if either the target user or the current user does not exist
        if(!userToModify || !currentUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isFollowing = currentUser.following.includes(id);

        if(isFollowing) {
            // unfllow user 
            await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
            await User.findByIdAndUpdate(req.user._id , { $pull: { following: id } });
            
            return res.status(200).json({ message: 'user unfollowed successfully' });
        } else {
            // follow user npm run de
           await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
           await User.findByIdAndUpdate(req.user._id , { $push: { following: id } });

           const newNotification = new Notification({
              type: 'follow',
              sender: req.user._id,
              receiver: id,
           })

           await newNotification.save();
           return res.status(200).json({ message: 'user followed successfully' });
        }
    } catch (error) {
        console.log('Error', error);
        res.status(500).json({ error: error.message }); 
    }
}

export const getSuggestedUsers = async (req, res) => {
    try {
      const userId = req.user._id; // Get the ID of the currently logged-in user from the request object
  
      // Fetch the list of users that the current user is following
      const userFollowedByMe = await User.findById(userId).select('following');
  
      // Use MongoDB's aggregation framework to find users
      const users = await User.aggregate([
        {
          $match: {
            _id: { $ne: userId }, // Exclude the current user from the results
          },
        },
        { $sample: { size: 10 } }, // Randomly select 10 users
      ]);
  
      // Filter out users who are already followed by the current user
      const filteredUsers = users.filter((user) => {
        return !userFollowedByMe.following.includes(user._id); // Check if the user's ID is not in the following list
      });
  
      // Select up to 4 users from the filtered list as suggestions
      const suggestedUsers = filteredUsers.slice(0, 6);
  
      // Remove the password field from the suggested users for security
      suggestedUsers.forEach((user) => (user.password = null));
  
      // Send the suggested users as a response
      res.status(200).json(suggestedUsers);
    } catch (error) {
      console.log('Error', error);
      res.status(500).json({ error: error.message });
    }
};

  export const updateUser = async (req, res) => {
     const {fullname, email, username, bio, link, currentPassword, newPassword } = req.body;
     let { profileImg, coverImg } = req.body;
     const userId = req.user._id;

     try {
       let user = await User.findById(userId);
       if(!user) {
        return res.status(404).json({ error: 'User not found' });
       }
       
       if((!newPassword && currentPassword) || (newPassword && !currentPassword))  {
         return res.status(400).json({ error: ' Please provide both current and new passwords' });
       }

       if(newPassword && currentPassword) {
         const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
         if(!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid current password' });
         }

         if(newPassword.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
         }

         const salt = await bcrypt.genSalt(10);
         user.password =  await bcrypt.hash(newPassword, salt);
       }

       if(profileImg) {
        if(user.profileImg) {
            const publicId = user.profileImg.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(publicId);
        }
        const uploadedResponse = await cloudinary.uploader.upload(profileImg)
        profileImg = uploadedResponse.secure_url;
       }

       if(coverImg) {
        if(user.coverImg) {
            const publicId = user.coverImg.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(publicId);
        }
        const uploadedResponse = await cloudinary.uploader.upload(coverImg)
        coverImg = uploadedResponse.secure_url;
       }

      //  update user details in the database
       user.fullname = fullname || user.fullname;
       user.email = email || user.email;
       user.username = username || user.username;
       user.bio = bio || user.bio;
       user.link = link || user.link;
       user.profileImg = profileImg || user.profileImg;
       user.coverImg = coverImg || user.coverImg;
       
      user =  await user.save();
      user.password = null
      res.status(200).json({ message: 'User updated successfully', user });
     } catch (error) {
       console.log('Error', error);
        res.status(500).json({ error: error.message });
     }
  }
  
  export const getAllUsers = async (req, res) => {
    try {
      const loggedInUserId = req.user._id;
      const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select('-password');
  
      res.status(200).json(filteredUsers);
    } catch (error) {
      console.log('Error', error);
      res.status(500).json({ error: error.message });
    }
  };
  
  