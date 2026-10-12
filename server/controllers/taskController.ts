import { Response } from 'express';
import { z } from 'zod';
import { db, TaskDoc } from '../db.js';
import { AuthRequest } from '../middleware/auth.js';
import { broadcastToProject, sendNotificationToUser } from '../sockets/index.js';

const taskSchema = z.object({
  projectId: z.string(),
  columnId: z.string(),
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  assigneeId: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  labels: z.array(z.string()).optional(),
  checklist: z
    .array(
      z.object({
        id: z.string(),
        text: z.string(),
        completed: z.boolean(),
      })
    )
    .optional(),
});

export async function getTasks(req: AuthRequest, res: Response) {
  try {
    const { projectId } = req.query;
    if (!projectId || typeof projectId !== 'string') {
      return res.status(400).json({ message: 'Project ID is required.' });
    }

    const tasks = await db.tasks.find((t) => t.projectId === projectId);

    const enriched = await Promise.all(
      tasks.map(async (task) => {
        const assignee = task.assigneeId ? await db.users.findById(task.assigneeId) : null;
        const creator = await db.users.findById(task.createdBy);
        return {
          ...task,
          assignee: assignee
            ? { id: assignee.id, name: assignee.name, email: assignee.email, avatarColor: assignee.avatarColor }
            : null,
          creator: creator
            ? { id: creator.id, name: creator.name, email: creator.email, avatarColor: creator.avatarColor }
            : null,
        };
      })
    );

    // Sort by order ascending
    enriched.sort((a, b) => a.order - b.order);

    return res.json({ tasks: enriched });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Error fetching tasks.' });
  }
}

export async function getMyTasks(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    // Find all projects where user is member
    const userProjects = await db.projects.find((p) =>
      p.members.some((m) => m.userId === userId)
    );
    const projectIds = new Set(userProjects.map((p) => p.id));

    const tasks = await db.tasks.find(
      (t) => t.assigneeId === userId && projectIds.has(t.projectId)
    );

    const enriched = await Promise.all(
      tasks.map(async (task) => {
        const project = userProjects.find((p) => p.id === task.projectId);
        const column = project?.columns.find((c) => c.id === task.columnId);
        const creator = await db.users.findById(task.createdBy);
        return {
          ...task,
          projectName: project?.name || 'Unknown Project',
          projectKey: project?.key || 'PRJ',
          columnTitle: column?.title || 'Unknown Column',
          assignee: {
            id: req.user!.id,
            name: req.user!.name,
            email: req.user!.email,
            avatarColor: req.user!.avatarColor,
          },
          creator: creator
            ? { id: creator.id, name: creator.name, email: creator.email, avatarColor: creator.avatarColor }
            : null,
        };
      })
    );

    return res.json({ tasks: enriched });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Error fetching my tasks.' });
  }
}

export async function createTask(req: AuthRequest, res: Response) {
  try {
    const validated = taskSchema.parse(req.body);
    const userId = req.user!.id;

    // Get current tasks in this column to compute order
    const columnTasks = await db.tasks.find(
      (t) => t.projectId === validated.projectId && t.columnId === validated.columnId
    );
    const nextOrder = columnTasks.length;

    const task = await db.tasks.create({
      projectId: validated.projectId,
      columnId: validated.columnId,
      title: validated.title,
      description: validated.description || '',
      priority: validated.priority,
      order: nextOrder,
      assigneeId: validated.assigneeId || null,
      dueDate: validated.dueDate || null,
      labels: validated.labels || [],
      checklist: validated.checklist || [],
      createdBy: userId,
    });

    const assignee = task.assigneeId ? await db.users.findById(task.assigneeId) : null;
    const enriched = {
      ...task,
      assignee: assignee
        ? { id: assignee.id, name: assignee.name, email: assignee.email, avatarColor: assignee.avatarColor }
        : null,
      creator: {
        id: req.user!.id,
        name: req.user!.name,
        email: req.user!.email,
        avatarColor: req.user!.avatarColor,
      },
    };

    // If assigned to someone other than creator, send notification
    if (task.assigneeId && task.assigneeId !== userId) {
      const project = await db.projects.findById(task.projectId);
      const notif = await db.notifications.create({
        userId: task.assigneeId,
        type: 'task_assigned',
        title: 'New Task Assigned',
        message: `${req.user!.name} assigned you to "${task.title}" in ${project?.name || 'Project'}.`,
        link: `/projects/${task.projectId}?task=${task.id}`,
        read: false,
      });
      sendNotificationToUser(task.assigneeId, notif);
    }

    broadcastToProject(task.projectId, 'task:created', enriched);

    return res.status(201).json({ task: enriched });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: err.issues[0]?.message || 'Validation error' });
    }
    return res.status(500).json({ message: err.message || 'Error creating task.' });
  }
}

export async function updateTask(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const existing = await db.tasks.findById(id);

    if (!existing) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    const { title, description, priority, assigneeId, dueDate, labels, checklist, columnId, order } = req.body;
    const updateData: Partial<TaskDoc> = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (priority !== undefined) updateData.priority = priority;
    if (assigneeId !== undefined) updateData.assigneeId = assigneeId;
    if (dueDate !== undefined) updateData.dueDate = dueDate;
    if (labels !== undefined) updateData.labels = labels;
    if (checklist !== undefined) updateData.checklist = checklist;
    if (columnId !== undefined) updateData.columnId = columnId;
    if (order !== undefined) updateData.order = order;

    const updated = await db.tasks.findByIdAndUpdate(id, updateData);
    if (!updated) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    // Check if assignee changed
    if (assigneeId && assigneeId !== existing.assigneeId && assigneeId !== req.user!.id) {
      const project = await db.projects.findById(updated.projectId);
      const notif = await db.notifications.create({
        userId: assigneeId,
        type: 'task_assigned',
        title: 'Task Assigned to You',
        message: `${req.user!.name} assigned you to "${updated.title}" in ${project?.name || 'Project'}.`,
        link: `/projects/${updated.projectId}?task=${updated.id}`,
        read: false,
      });
      sendNotificationToUser(assigneeId, notif);
    }

    const assignee = updated.assigneeId ? await db.users.findById(updated.assigneeId) : null;
    const creator = await db.users.findById(updated.createdBy);

    const enriched = {
      ...updated,
      assignee: assignee
        ? { id: assignee.id, name: assignee.name, email: assignee.email, avatarColor: assignee.avatarColor }
        : null,
      creator: creator
        ? { id: creator.id, name: creator.name, email: creator.email, avatarColor: creator.avatarColor }
        : null,
    };

    broadcastToProject(updated.projectId, 'task:updated', enriched);

    return res.json({ task: enriched });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Error updating task.' });
  }
}

export async function moveTask(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { targetColumnId, newOrder, orderedTaskIds } = req.body;

    const task = await db.tasks.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    const prevColumnId = task.columnId;

    // Update target task column and order
    await db.tasks.findByIdAndUpdate(id, {
      columnId: targetColumnId,
      order: newOrder,
    });

    // If client provided new ordering for the target column, persist them
    if (Array.isArray(orderedTaskIds)) {
      await Promise.all(
        orderedTaskIds.map((taskId: string, index: number) =>
          db.tasks.findByIdAndUpdate(taskId, { columnId: targetColumnId, order: index })
        )
      );
    }

    const updated = await db.tasks.findById(id);
    const assignee = updated?.assigneeId ? await db.users.findById(updated.assigneeId) : null;

    const payload = {
      taskId: id,
      projectId: task.projectId,
      prevColumnId,
      targetColumnId,
      newOrder,
      orderedTaskIds: orderedTaskIds || [],
      task: updated
        ? {
            ...updated,
            assignee: assignee
              ? { id: assignee.id, name: assignee.name, email: assignee.email, avatarColor: assignee.avatarColor }
              : null,
          }
        : null,
    };

    broadcastToProject(task.projectId, 'task:moved', payload);

    return res.json(payload);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Error moving task.' });
  }
}

export async function deleteTask(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const task = await db.tasks.findById(id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    const projectId = task.projectId;
    await db.tasks.findByIdAndDelete(id);

    broadcastToProject(projectId, 'task:deleted', { taskId: id, projectId });

    return res.json({ message: 'Task deleted successfully.' });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Error deleting task.' });
  }
}
