import express from 'express';
import { followUnfollowUser, getAllUsers, getSuggestedUsers, getUserProfile,updateUser } from '../controllers/user.controller.js';
import { protectRoute } from '../middleware/protectRoute.js';

const router = express.Router();

router.get('/profile/:username', protectRoute, getUserProfile);
router.get('/suggested', protectRoute, getSuggestedUsers);
router.post('/follow/:id', protectRoute, followUnfollowUser);
router.post('/update', protectRoute, updateUser);
router.get('/allusers', protectRoute, getAllUsers);


export default router;