import { Router } from 'express';
import {
  getNotifications,
  markRead,
  markAllRead,
} from '../controllers/notificationController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getNotifications);
router.patch('/:id/read', markRead);
router.post('/read-all', markAllRead);

export default router;
