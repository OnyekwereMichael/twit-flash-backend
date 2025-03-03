import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";

export const createPost = async (req, res) => {
    try {
        const { caption, tags } = req.body;
        let { img } = req.body;
        const userId = req.user._id;

        const user = await User.findById(userId)
         if(!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if(!caption && !img & !tags) {
            return res.status(400).json({ error: 'Text or image is required' });
        }

        if(img) {
            const uploadedResponse = await cloudinary.uploader.upload(img);
            img = uploadedResponse.secure_url;
        }

        const newPost = new Post({
           user:userId,
           caption,
            tags,
            img,
        });
   await newPost.save();
   res.status(201).json(newPost);
    } catch (error) {
         console.log('Error creating post', error);
        res.status(500).json({ error: error.message });
    }
}

export const deletePost = async (req, res) => {
     try {
        const { id } = req.params;
        const post = await Post.findById(id);
        if(!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if(post.user?.toString() !== req.user._id?.toString()) {
            return res.status(403).json({ error: 'You are not authorized to delete this post' });
            }

            if(post.img) {
                const publicId = post.img.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(publicId);
            }

            await Post.findByIdAndDelete(id);
            res.status(200).json({ message: 'Post deleted successfully' });
     } catch (error) {
         console.log('Error deleting post', error);
        res.status(500).json({ error: error.message });
     }
}

export const createComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if(!text) {
        return res.status(400).json({ error: 'Text is required' });
    }

    const post = await Post.findById(id);
    if(!post) {
        return res.status(404).json({ error: 'Post not found' });
    }

    const comment = {
        user: userId,
        text,
    };

    post.comments.push(comment);
    await post.save();
    res.status(201).json(comment);
  } catch (error) {
     console.log('Error creating comment', error);
    res.status(500).json({ error: error.message });
  }
}

export const likeUnlikePost = async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.user._id;
        const post = await Post.findById(id);
        if(!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const isLiked = post.likes.includes(userId);
        if(isLiked) {
            await post.updateOne({ $pull: { likes: userId } });
            await User.updateOne({$pull: { likedPosts: id } });
            return res.status(200).json({ message: 'Post unliked successfully' });
        } else {
            post.likes.push(userId);
            await User.updateOne({$push: { likedPosts: id } });
            await post.save();

            const newNotification = new Notification({
                type: 'like',
                sender: userId,
                receiver: post.user,
            });
            await newNotification.save();
            return res.status(200).json({ message: 'Post liked successfully' });
        }

    } catch (error) {
         console.log('Error liking/unliking post', error);
        res.status(500).json({ error: error.message });
    }
}

export const getPosts = async (req, res) => {
    try {
        const posts = await Post.find().sort({createdAt: -1}).populate({
            path: 'user',
            select: '-password',
        })
        .populate({
            path: 'comments.user',
            select: '-password',
        });
        if(!posts) {
            return res.status(404).json({ error: 'Posts not found' });
        }

        if(posts.length === 0) {
            return res.status(200).json([]);
        }
        res.status(200).json(posts);
    } catch (error) {
         console.log('Error getting posts', error);
        res.status(500).json({ error: error.message });
    }

}

export const getLikedPost = async (req, res) => {
    const {id} = req.params;
    try {
        const user = await User.findById(id)
        if(!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const likedPosts = await Post.find({
            _id: { $in: user.likedPosts },
        }).sort({ createdAt: -1 })
        .populate({
            path: 'user',
            select: '-password',
        })
        .populate({
            path: 'comments.user',
            select: '-password',
        });
        res.status(200).json(likedPosts);
    } catch (error) {
         console.log('Error getting liked posts', error);
        res.status(500).json({ error: error.message });
    }
}

export const getFollowingPosts = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        if(!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const following = user.following;
        const posts = await Post.find({ user: { $in: following } }).sort({ createdAt: -1 }).populate({
            path: 'user',
            select: '-password',
        })
        .populate({
            path: 'comments.user',
            select: '-password',
        });
        res.status(200).json(posts);
    } catch (error) {
         console.log('Error getting following posts', error);
        res.status(500).json({ error: error.message });
    }
}

export const getUserPosts = async (req, res) => {
 const { username } = req.params;
 try {
     const user = await User.findOne({ username });
    if(!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const posts = await Post.find({ user: user._id }).sort({ createdAt: -1 }).populate({
        path: 'user',
        select: '-password',
    })
    .populate({
        path: 'comments.user',
        select: '-password',
    });
    res.status(200).json(posts);
 } catch (error) {
     console.log('Error getting user posts', error);
    res.status(500).json({ error: error.message });
 }

}

export const updatePost = async (req, res) => {
    const { caption, tags } = req.body;
    let { img } = req.body;
    const { postId } = req.params; 

    try {
        let post = await Post.findById(postId)
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Handle Image Upload & Deletion
        if (img) {
            if (post.img) {
                const publicId = post.img.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(publicId);
            }
            const uploadedResponse = await cloudinary.uploader.upload(img);
            img = uploadedResponse.secure_url;
        }

        // Update fields
        post.caption = caption || post.caption;
        post.tags = tags || post.tags;
        post.img = img || post.img;

        post = await post.save();

        res.status(200).json({ message: 'Post updated successfully', post });
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ error: error.message });
    }
};
