import { Response } from 'express';
import { db } from '../db.js';
import { AuthRequest } from '../middleware/auth.js';

export async function getNotifications(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const notifs = await db.notifications.find((n) => n.userId === userId);
    notifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return res.json({ notifications: notifs });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Error fetching notifications.' });
  }
}

export async function markRead(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const notif = await db.notifications.findById(id);

    if (!notif) {
      return res.status(404).json({ message: 'Notification not found.' });
    }

    if (notif.userId !== req.user!.id) {
      return res.status(403).json({ message: 'Forbidden.' });
    }

    const updated = await db.notifications.findByIdAndUpdate(id, { read: true });
    return res.json({ notification: updated });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Error updating notification.' });
  }
}

export async function markAllRead(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    await db.notifications.markAllReadForUser(userId);
    return res.json({ message: 'All notifications marked as read.' });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Error updating notifications.' });
  }
}
