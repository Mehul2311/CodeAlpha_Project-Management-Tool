import { Response } from 'express';
import { z } from 'zod';
import { db } from '../db.js';
import { AuthRequest } from '../middleware/auth.js';
import { broadcastToProject, sendNotificationToUser } from '../sockets/index.js';

const commentSchema = z.object({
  taskId: z.string(),
  projectId: z.string(),
  content: z.string().min(1, 'Comment text is required'),
});

export async function getComments(req: AuthRequest, res: Response) {
  try {
    const { taskId } = req.query;
    if (!taskId || typeof taskId !== 'string') {
      return res.status(400).json({ message: 'Task ID is required.' });
    }

    const comments = await db.comments.find((c) => c.taskId === taskId);

    const enriched = await Promise.all(
      comments.map(async (c) => {
        const u = await db.users.findById(c.userId);
        return {
          ...c,
          user: u ? { id: u.id, name: u.name, email: u.email, avatarColor: u.avatarColor } : undefined,
        };
      })
    );

    enriched.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return res.json({ comments: enriched });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Error fetching comments.' });
  }
}

export async function addComment(req: AuthRequest, res: Response) {
  try {
    const validated = commentSchema.parse(req.body);
    const userId = req.user!.id;

    const task = await db.tasks.findById(validated.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    const comment = await db.comments.create({
      taskId: validated.taskId,
      projectId: validated.projectId,
      userId,
      content: validated.content,
    });

    const enriched = {
      ...comment,
      user: {
        id: req.user!.id,
        name: req.user!.name,
        email: req.user!.email,
        avatarColor: req.user!.avatarColor,
      },
    };

    // Notify task assignee or creator if they are not the comment author
    const notifyTargets = new Set<string>();
    if (task.assigneeId && task.assigneeId !== userId) {
      notifyTargets.add(task.assigneeId);
    }
    if (task.createdBy && task.createdBy !== userId) {
      notifyTargets.add(task.createdBy);
    }

    for (const targetId of notifyTargets) {
      const notif = await db.notifications.create({
        userId: targetId,
        type: 'comment_added',
        title: `Comment from ${req.user!.name}`,
        message: `${req.user!.name} commented on "${task.title}": "${validated.content.slice(0, 50)}..."`,
        link: `/projects/${task.projectId}?task=${task.id}`,
        read: false,
      });
      sendNotificationToUser(targetId, notif);
    }

    broadcastToProject(validated.projectId, 'comment:added', enriched);

    return res.status(201).json({ comment: enriched });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: err.issues[0]?.message || 'Validation error' });
    }
    return res.status(500).json({ message: err.message || 'Error adding comment.' });
  }
}

export async function updateComment(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Comment content cannot be empty.' });
    }

    const comment = await db.comments.findById(id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found.' });
    }

    if (comment.userId !== req.user!.id) {
      return res.status(403).json({ message: 'You can only edit your own comments.' });
    }

    const updated = await db.comments.findByIdAndUpdate(id, { content });
    const u = await db.users.findById(updated!.userId);
    const enriched = {
      ...updated,
      user: u ? { id: u.id, name: u.name, email: u.email, avatarColor: u.avatarColor } : undefined,
    };

    broadcastToProject(comment.projectId, 'comment:updated', enriched);

    return res.json({ comment: enriched });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Error updating comment.' });
  }
}

export async function deleteComment(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const comment = await db.comments.findById(id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found.' });
    }

    const project = await db.projects.findById(comment.projectId);
    const isOwner = project?.ownerId === req.user!.id;
    const isAuthor = comment.userId === req.user!.id;

    if (!isAuthor && !isOwner) {
      return res.status(403).json({ message: 'You do not have permission to delete this comment.' });
    }

    await db.comments.findByIdAndDelete(id);

    broadcastToProject(comment.projectId, 'comment:deleted', { id, taskId: comment.taskId });

    return res.json({ message: 'Comment deleted successfully.' });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Error deleting comment.' });
  }
}
