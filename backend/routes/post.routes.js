import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { createComment, createPost, deletePost, getFollowingPosts, getLikedPost, getPosts, getUserPosts, likeUnlikePost, updatePost } from "../controllers/post.controller.js";

const router = express.Router();

router.delete("/:id", protectRoute, deletePost)
router.post("/create", protectRoute, createPost)
router.post("/comment/:id", protectRoute, createComment)
router.post("/like/:id", protectRoute, likeUnlikePost)
router.get("/all", protectRoute, getPosts)
router.get("/likes/:id", protectRoute, getLikedPost)
router.get("/following", protectRoute, getFollowingPosts)
router.get("/user/:username", protectRoute, getUserPosts)
router.post("/update/:postId", protectRoute, updatePost);
export default router;