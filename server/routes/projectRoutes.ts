import { Router } from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  inviteMember,
  removeMember,
} from '../controllers/projectController.js';
import { authMiddleware, requireProjectMember, requireProjectOwner } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getProjects);
router.post('/', createProject);
router.get('/:id', requireProjectMember, getProjectById);
router.patch('/:id', requireProjectMember, updateProject);
router.delete('/:id', requireProjectOwner, deleteProject);
router.post('/:id/members', requireProjectMember, inviteMember);
router.delete('/:id/members/:memberId', requireProjectMember, removeMember);

export default router;
