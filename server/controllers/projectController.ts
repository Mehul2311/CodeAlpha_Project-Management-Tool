import { Response } from 'express';
import { z } from 'zod';
import { db, ProjectDoc } from '../db.js';
import { AuthRequest } from '../middleware/auth.js';
import { broadcastToProject, sendNotificationToUser } from '../sockets/index.js';

const projectSchema = z.object({
  name: z.string().min(2, 'Project name is required'),
  key: z.string().min(2).max(10).toUpperCase(),
  description: z.string().optional(),
  budget: z.number().nonnegative().optional(),
});

export async function getProjects(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const all = await db.projects.find((p) =>
      p.members.some((m) => m.userId === userId)
    );

    // Populate members and task count
    const enriched = await Promise.all(
      all.map(async (project) => {
        const tasks = await db.tasks.find((t) => t.projectId === project.id);
        const membersWithUser = await Promise.all(
          project.members.map(async (m) => {
            const u = await db.users.findById(m.userId);
            return {
              ...m,
              user: u ? { id: u.id, name: u.name, email: u.email, avatarColor: u.avatarColor, role: u.role } : undefined,
            };
          })
        );
        return {
          ...project,
          members: membersWithUser,
          taskCount: tasks.length,
        };
      })
    );

    return res.json({ projects: enriched });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Error fetching projects.' });
  }
}

export async function getProjectById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const project = await db.projects.findById(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    // Populate members
    const membersWithUser = await Promise.all(
      project.members.map(async (m) => {
        const u = await db.users.findById(m.userId);
        return {
          ...m,
          user: u ? { id: u.id, name: u.name, email: u.email, avatarColor: u.avatarColor, role: u.role } : undefined,
        };
      })
    );

    return res.json({ project: { ...project, members: membersWithUser } });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Error fetching project.' });
  }
}

export async function createProject(req: AuthRequest, res: Response) {
  try {
    const validated = projectSchema.parse(req.body);
    const userId = req.user!.id;

    const defaultColumns = [
      { id: 'col_todo', title: 'To Do', order: 0 },
      { id: 'col_inprog', title: 'In Progress', order: 1 },
      { id: 'col_review', title: 'In Review', order: 2 },
      { id: 'col_done', title: 'Done', order: 3 },
    ];

    const project = await db.projects.create({
      name: validated.name,
      key: validated.key,
      description: validated.description || '',
      budget: validated.budget || 0,
      ownerId: userId,
      members: [
        {
          userId,
          role: 'owner',
          joinedAt: new Date().toISOString(),
        },
      ],
      columns: defaultColumns,
    });

    const membersWithUser = [
      {
        userId,
        role: 'owner' as const,
        joinedAt: new Date().toISOString(),
        user: {
          id: req.user!.id,
          name: req.user!.name,
          email: req.user!.email,
          avatarColor: req.user!.avatarColor,
          role: req.user!.role,
        },
      },
    ];

    return res.status(201).json({ project: { ...project, members: membersWithUser, taskCount: 0 } });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: err.issues[0]?.message || 'Validation error' });
    }
    return res.status(500).json({ message: err.message || 'Error creating project.' });
  }
}

export async function updateProject(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { name, description, budget, columns } = req.body;

    const updateData: Partial<ProjectDoc> = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (budget !== undefined) updateData.budget = Number(budget);
    if (columns) updateData.columns = columns;

    const updated = await db.projects.findByIdAndUpdate(id, updateData);
    if (!updated) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    broadcastToProject(id, 'project:updated', updated);

    return res.json({ project: updated });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Error updating project.' });
  }
}

export async function deleteProject(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const deleted = await db.projects.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    broadcastToProject(id, 'project:deleted', { id });
    return res.json({ message: 'Project deleted successfully.' });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Error deleting project.' });
  }
}

export async function inviteMember(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { email, role = 'member' } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required to invite a member.' });
    }

    const project = await db.projects.findById(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    let targetUser = await db.users.findOne((u) => u.email.toLowerCase() === email.toLowerCase());

    // If user doesn't exist yet, auto-create a member account so they can log in
    if (!targetUser) {
      const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
      const colors = ['bg-amber-600', 'bg-emerald-600', 'bg-blue-600', 'bg-indigo-600', 'bg-rose-600', 'bg-teal-600'];
      targetUser = await db.users.create({
        name,
        email: email.toLowerCase(),
        passwordHash: '$2a$10$wKxH7jZ5r0qMpsaFmJ7L1OMkE9J5d64EwW3m9Oa2N1M2X4w3V.0m.', // placeholder hash
        avatarColor: colors[Math.floor(Math.random() * colors.length)],
        role: 'Team Member',
      });
    }

    const alreadyMember = project.members.some((m) => m.userId === targetUser!.id);
    if (alreadyMember) {
      return res.status(400).json({ message: `${targetUser.name} is already a member of this project.` });
    }

    const newMemberEntry = {
      userId: targetUser.id,
      role: role as 'owner' | 'member',
      joinedAt: new Date().toISOString(),
    };

    project.members.push(newMemberEntry);
    await db.projects.findByIdAndUpdate(id, { members: project.members });

    // Send real-time notification to invited user
    const notification = await db.notifications.create({
      userId: targetUser.id,
      type: 'project_invite',
      title: 'Added to Project',
      message: `${req.user!.name} added you to the project "${project.name}".`,
      link: `/projects/${project.id}`,
      read: false,
    });

    sendNotificationToUser(targetUser.id, notification);
    broadcastToProject(id, 'member:joined', {
      member: {
        ...newMemberEntry,
        user: {
          id: targetUser.id,
          name: targetUser.name,
          email: targetUser.email,
          avatarColor: targetUser.avatarColor,
          role: targetUser.role,
        },
      },
    });

    return res.json({
      message: `${targetUser.name} added to project!`,
      member: {
        ...newMemberEntry,
        user: {
          id: targetUser.id,
          name: targetUser.name,
          email: targetUser.email,
          avatarColor: targetUser.avatarColor,
          role: targetUser.role,
        },
      },
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Error inviting member.' });
  }
}

export async function removeMember(req: AuthRequest, res: Response) {
  try {
    const { id, memberId } = req.params;
    const project = await db.projects.findById(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    if (memberId === project.ownerId) {
      return res.status(400).json({ message: 'The project owner cannot be removed.' });
    }

    const currentUserId = req.user!.id;
    if (currentUserId !== project.ownerId && currentUserId !== memberId) {
      return res.status(403).json({ message: 'You do not have permission to remove this member.' });
    }

    const updatedMembers = project.members.filter((m) => m.userId !== memberId);
    await db.projects.findByIdAndUpdate(id, { members: updatedMembers });

    broadcastToProject(id, 'member:removed', { memberId });
    return res.json({ message: 'Member removed from project.' });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Error removing member.' });
  }
}
