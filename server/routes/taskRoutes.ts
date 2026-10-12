import { Router } from 'express';
import {
  getTasks,
  getMyTasks,
  createTask,
  updateTask,
  moveTask,
  deleteTask,
} from '../controllers/taskController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getTasks);
router.get('/my-tasks', getMyTasks);
router.post('/', createTask);
router.patch('/:id', updateTask);
router.post('/:id/move', moveTask);
router.delete('/:id', deleteTask);

export default router;
