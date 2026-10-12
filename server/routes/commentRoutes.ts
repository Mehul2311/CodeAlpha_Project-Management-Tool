import { Router } from 'express';
import {
  getComments,
  addComment,
  updateComment,
  deleteComment,
} from '../controllers/commentController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getComments);
router.post('/', addComment);
router.patch('/:id', updateComment);
router.delete('/:id', deleteComment);

export default router;
