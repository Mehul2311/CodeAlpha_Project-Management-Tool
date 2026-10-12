import { Router } from 'express';
import { signup, login, demoLogin, me, logout, updateProfile, getAllUsers } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/demo-login', demoLogin);
router.post('/logout', logout);
router.get('/me', authMiddleware, me);
router.patch('/profile', authMiddleware, updateProfile);
router.get('/users', authMiddleware, getAllUsers);

export default router;
