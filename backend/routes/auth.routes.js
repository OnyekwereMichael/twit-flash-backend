import express from 'express';
import { getMe, logout, signIn, signUp } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/protectRoute.js';

const router = express.Router();
router.get('/me', protectRoute,  getMe)
router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/logout', logout);

export default router;