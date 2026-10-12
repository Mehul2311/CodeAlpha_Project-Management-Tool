export type Priority = 'low' | 'medium' | 'high';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
  phone?: string;
  role?: string;
  createdAt: string;
}

export interface ProjectMember {
  userId: string;
  role: 'owner' | 'member';
  joinedAt: string;
  user?: User;
}

export interface Column {
  id: string;
  title: string;
  order: number;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  projectId: string;
  columnId: string;
  title: string;
  description: string;
  priority: Priority;
  order: number;
  assigneeId?: string | null;
  assignee?: User;
  dueDate?: string | null;
  labels: string[];
  checklist: ChecklistItem[];
  createdBy: string;
  creator?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  taskId: string;
  projectId: string;
  userId: string;
  user?: User;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  key: string;
  description: string;
  budget?: number; // In INR
  ownerId: string;
  members: ProjectMember[];
  columns: Column[];
  createdAt: string;
  updatedAt: string;
  taskCount?: number;
}

export interface AppNotification {
  id: string;
  userId: string;
  type: 'task_assigned' | 'task_moved' | 'comment_added' | 'project_invite' | 'general';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}
