import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db, UserDoc } from '../db.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'kaamboard_secret_key_india_2026';

export interface AuthRequest extends Request {
  user?: UserDoc;
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    let token = req.cookies?.kaam_token;

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Authentication required. Please log in.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await db.users.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'User account not found.' });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired session. Please log in again.' });
  }
}

export async function requireProjectMember(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const projectId = req.params.projectId || req.params.id || req.body.projectId;
    if (!projectId) {
      return res.status(400).json({ message: 'Project ID is required.' });
    }

    const project = await db.projects.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    const userId = req.user?.id;
    const isMember = project.members.some((m) => m.userId === userId);

    if (!isMember) {
      return res.status(403).json({ message: 'Access denied. You are not a member of this project.' });
    }

    next();
  } catch (error: any) {
    return res.status(500).json({ message: error.message || 'Error checking project access.' });
  }
}

export async function requireProjectOwner(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const projectId = req.params.projectId || req.params.id || req.body.projectId;
    const project = await db.projects.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    if (project.ownerId !== req.user?.id) {
      return res.status(403).json({ message: 'Only the project owner can perform this action.' });
    }

    next();
  } catch (error: any) {
    return res.status(500).json({ message: error.message || 'Error checking owner permission.' });
  }
}
