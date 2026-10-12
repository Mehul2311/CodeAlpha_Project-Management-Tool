import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Plus,
  Search,
  Filter,
  UserPlus,
  Users,
  IndianRupee,
  Share2,
  Sparkles,
  Settings,
  Download,
  ArrowUpDown,
  SlidersHorizontal,
} from 'lucide-react';
import { Project, Task, Column, Priority } from '../../types';
import { KanbanColumn } from './KanbanColumn';
import { TaskDrawer } from './TaskDrawer';
import { InviteMemberModal } from '../modals/InviteMemberModal';
import { ConfirmDialog } from '../modals/ConfirmDialog';
import { ProjectSettingsModal } from '../modals/ProjectSettingsModal';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatINR, getInitials } from '../../utils/formatters';
import { getSocket, joinProjectRoom, leaveProjectRoom } from '../../services/socket';

interface KanbanBoardProps {
  project: Project;
  onProjectUpdate: (updated: Partial<Project>) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  project,
  onProjectUpdate,
}) => {
  const { user } = useAuth();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeUsers, setActiveUsers] = useState<{ id: string; name: string }[]>([]);

  // Filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');
  const [selectedLabel, setSelectedLabel] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'default' | 'dueDate' | 'priority' | 'title'>('default');

  // New column state
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');

  // Column delete confirmation
  const [columnToDelete, setColumnToDelete] = useState<string | null>(null);

  // Dragging tracking
  const [draggingTask, setDraggingTask] = useState<Task | null>(null);

  // Fetch initial tasks
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/tasks?projectId=${project.id}`);
      setTasks(res.data.tasks || []);
    } catch (err: any) {
      toast.error(err.message || 'Error fetching tasks');
    } finally {
      setLoading(false);
    }
  }, [project.id]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Open task if url query parameter ?task=tsk_xxx exists
  useEffect(() => {
    const taskIdParam = searchParams.get('task');
    if (taskIdParam && tasks.length > 0) {
      const match = tasks.find((t) => t.id === taskIdParam);
      if (match) setSelectedTask(match);
    }
  }, [searchParams, tasks]);

  // WebSockets Real-Time Sync & Presence
  useEffect(() => {
    if (!user) return;

    joinProjectRoom(project.id, { id: user.id, name: user.name });

    const socket = getSocket();

    const handleTaskCreated = (newTask: Task) => {
      setTasks((prev) => {
        if (prev.some((t) => t.id === newTask.id)) return prev;
        return [...prev, newTask];
      });
    };

    const handleTaskUpdated = (updatedTask: Task) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
      );
      setSelectedTask((curr) =>
        curr && curr.id === updatedTask.id ? updatedTask : curr
      );
    };

    const handleTaskMoved = (data: {
      taskId: string;
      targetColumnId: string;
      newOrder: number;
      task?: Task;
    }) => {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === data.taskId) {
            return {
              ...t,
              columnId: data.targetColumnId,
              order: data.newOrder,
              ...(data.task || {}),
            };
          }
          return t;
        })
      );
    };

    const handleTaskDeleted = (data: { taskId: string }) => {
      setTasks((prev) => prev.filter((t) => t.id !== data.taskId));
      setSelectedTask((curr) => (curr && curr.id === data.taskId ? null : curr));
    };

    const handlePresence = (data: { activeUsers: { id: string; name: string }[] }) => {
      setActiveUsers(data.activeUsers || []);
    };

    socket.on('task:created', handleTaskCreated);
    socket.on('task:updated', handleTaskUpdated);
    socket.on('task:moved', handleTaskMoved);
    socket.on('task:deleted', handleTaskDeleted);
    socket.on('presence:update', handlePresence);

    return () => {
      socket.off('task:created', handleTaskCreated);
      socket.off('task:updated', handleTaskUpdated);
      socket.off('task:moved', handleTaskMoved);
      socket.off('task:deleted', handleTaskDeleted);
      socket.off('presence:update', handlePresence);
      leaveProjectRoom(project.id, { id: user.id, name: user.name });
    };
  }, [project.id, user]);

  // Add Task handler
  const handleAddTask = async (columnId: string, title: string) => {
    try {
      const res = await api.post('/tasks', {
        projectId: project.id,
        columnId,
        title,
        priority: 'medium',
      });
      setTasks((prev) => [...prev, res.data.task]);
      toast.success('Task created! Chalo shuru karte hain.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create task.');
    }
  };

  // Update Task handler
  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const res = await api.patch(`/tasks/${taskId}`, updates);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? res.data.task : t))
      );
      if (selectedTask?.id === taskId) {
        setSelectedTask(res.data.task);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update task.');
    }
  };

  // Delete Task handler
  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      toast.success('Task removed.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete task.');
    }
  };

  // Columns Management
  const handleAddColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColumnTitle.trim()) return;

    const newCol: Column = {
      id: `col_${Date.now()}`,
      title: newColumnTitle.trim(),
      order: project.columns.length,
    };

    const updatedCols = [...project.columns, newCol];
    try {
      await api.patch(`/projects/${project.id}`, { columns: updatedCols });
      onProjectUpdate({ columns: updatedCols });
      setNewColumnTitle('');
      setIsAddingColumn(false);
      toast.success(`Column "${newCol.title}" added.`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to add column.');
    }
  };

  const handleRenameColumn = async (columnId: string, newTitle: string) => {
    const updatedCols = project.columns.map((c) =>
      c.id === columnId ? { ...c, title: newTitle } : c
    );
    try {
      await api.patch(`/projects/${project.id}`, { columns: updatedCols });
      onProjectUpdate({ columns: updatedCols });
      toast.success('Column renamed.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to rename column.');
    }
  };

  const handleDeleteColumnConfirm = async () => {
    if (!columnToDelete) return;
    const updatedCols = project.columns.filter((c) => c.id !== columnToDelete);
    try {
      await api.patch(`/projects/${project.id}`, { columns: updatedCols });
      onProjectUpdate({ columns: updatedCols });
      // Remove any tasks in that column
      setTasks((prev) => prev.filter((t) => t.columnId !== columnToDelete));
      toast.success('Column deleted.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete column.');
    } finally {
      setColumnToDelete(null);
    }
  };

  // Invite member
  const handleInviteMember = async (email: string, role: 'owner' | 'member') => {
    const res = await api.post(`/projects/${project.id}/members`, { email, role });
    const newMembers = [...project.members, res.data.member];
    onProjectUpdate({ members: newMembers });
    toast.success(res.data.message || 'Member invited successfully!');
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggingTask(task);
    e.dataTransfer.setData('text/plain', task.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    if (!draggingTask) return;

    if (draggingTask.columnId === targetColumnId) {
      setDraggingTask(null);
      return;
    }

    const taskId = draggingTask.id;
    const prevColId = draggingTask.columnId;

    // Check if moving to "Done" column for celebratory confetti!
    const targetCol = project.columns.find((c) => c.id === targetColumnId);
    if (targetCol && targetCol.title.toLowerCase().includes('done')) {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });
      toast.success('Badiya kaam! Task marked as Done!');
    }

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, columnId: targetColumnId } : t
      )
    );
    setDraggingTask(null);

    try {
      await api.post(`/tasks/${taskId}/move`, {
        targetColumnId,
        newOrder: 999,
      });
    } catch {
      // Revert if failed
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, columnId: prevColId } : t
        )
      );
      toast.error('Failed to move task. Reverted.');
    }
  };

  const handleQuickMove = async (taskId: string, targetColumnId: string) => {
    const targetCol = project.columns.find((c) => c.id === targetColumnId);
    if (targetCol && targetCol.title.toLowerCase().includes('done')) {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      toast.success('Badiya kaam! Task moved to Done!');
    }

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, columnId: targetColumnId } : t))
    );

    try {
      await api.post(`/tasks/${taskId}/move`, {
        targetColumnId,
        newOrder: 999,
      });
    } catch {
      fetchTasks();
      toast.error('Failed to move task.');
    }
  };

  const handleUpdateProjectDetails = async (updates: Partial<Project>) => {
    try {
      const res = await api.patch(`/projects/${project.id}`, updates);
      onProjectUpdate(res.data.project);
      toast.success('Project details updated!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update project.');
    }
  };

  const handleDeleteProjectConfirm = async () => {
    try {
      await api.delete(`/projects/${project.id}`);
      toast.success('Project deleted.');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete project.');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      await api.delete(`/projects/${project.id}/members/${memberId}`);
      const updatedMembers = project.members.filter((m) => m.userId !== memberId);
      onProjectUpdate({ members: updatedMembers });
      toast.success('Member removed from project.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove member.');
    }
  };

  const handleExportBoard = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify({ project, tasks }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${project.key}_board_export.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success('Board exported to JSON file!');
  };

  // Dynamic labels present on this board
  const allLabels = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => t.labels?.forEach((l) => set.add(l)));
    return Array.from(set);
  }, [tasks]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Search title and description
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesDesc = (task.description || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc) return false;
      }
      // Priority filter
      if (selectedPriority !== 'all' && task.priority !== selectedPriority) {
        return false;
      }
      // Assignee filter
      if (selectedAssignee !== 'all') {
        if (selectedAssignee === 'unassigned' && task.assigneeId) return false;
        if (selectedAssignee !== 'unassigned' && task.assigneeId !== selectedAssignee) return false;
      }
      // Label filter
      if (selectedLabel !== 'all' && (!task.labels || !task.labels.includes(selectedLabel))) {
        return false;
      }
      return true;
    });
  }, [tasks, searchQuery, selectedPriority, selectedAssignee, selectedLabel]);

  // Sorted tasks
  const sortedTasks = useMemo(() => {
    const list = [...filteredTasks];
    if (sortBy === 'dueDate') {
      list.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
    } else if (sortBy === 'priority') {
      const pWeights = { high: 3, medium: 2, low: 1 };
      list.sort((a, b) => pWeights[b.priority] - pWeights[a.priority]);
    } else if (sortBy === 'title') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    }
    return list;
  }, [filteredTasks, sortBy]);

  // Tasks grouped by column
  const tasksByColumn = useMemo(() => {
    const map: Record<string, Task[]> = {};
    for (const col of project.columns) {
      map[col.id] = [];
    }
    for (const t of sortedTasks) {
      if (map[t.columnId]) {
        map[t.columnId].push(t);
      }
    }
    return map;
  }, [project.columns, sortedTasks]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Top Board Toolbar */}
      <div className="px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Project Title & Metadata */}
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                {project.name}
              </h1>
              <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 uppercase">
                {project.key}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
              {project.budget !== undefined && project.budget > 0 && (
                <>
                  <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                    <IndianRupee className="w-3.5 h-3.5 text-amber-600" />
                    <span>Budget: {formatINR(project.budget)}</span>
                  </div>
                  <span aria-hidden="true">·</span>
                </>
              )}
              <span>{tasks.length} tasks</span>
              <span aria-hidden="true">·</span>
              <span>{project.members.length} members</span>

              {/* Real-time Presence Indicator */}
              {activeUsers.length > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>
                      {activeUsers.map((u) => u.name.split(' ')[0]).join(', ')} active
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Team Members Avatars */}
            <div className="flex items-center -space-x-2 mr-1">
              {project.members.slice(0, 5).map((m) => (
                <div
                  key={m.userId}
                  title={`${m.user?.name || 'Teammate'} (${m.role})`}
                  className={`w-7 h-7 rounded-full text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-xs ${
                    m.user?.avatarColor || 'bg-amber-600'
                  }`}
                >
                  {getInitials(m.user?.name)}
                </div>
              ))}
              {project.members.length > 5 && (
                <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                  +{project.members.length - 5}
                </div>
              )}
            </div>

            {/* Export Board */}
            <button
              onClick={handleExportBoard}
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg flex items-center gap-1.5 transition-colors"
              title="Export Board to JSON"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {/* Settings */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg flex items-center gap-1.5 transition-colors"
              title="Project Settings"
            >
              <Settings className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Settings</span>
            </button>

            {/* Invite Button */}
            <button
              onClick={() => setIsInviteOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Invite</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Left: Search Input & Label Filter Chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative w-48 sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cards..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {/* Label Chips */}
            {allLabels.length > 0 && (
              <div className="flex items-center gap-1 overflow-x-auto max-w-xs sm:max-w-md py-0.5">
                <button
                  type="button"
                  onClick={() => setSelectedLabel('all')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors shrink-0 ${
                    selectedLabel === 'all'
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  All Labels
                </button>
                {allLabels.map((lbl) => (
                  <button
                    key={lbl}
                    type="button"
                    onClick={() => setSelectedLabel(selectedLabel === lbl ? 'all' : lbl)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors shrink-0 ${
                      selectedLabel === lbl
                        ? 'bg-amber-500 text-white font-semibold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-amber-600'
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Priority, Assignee & Sort Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              {['all', 'high', 'medium', 'low'].map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedPriority(p)}
                  className={`px-2 py-1 text-xs font-medium rounded-md capitalize transition-colors ${
                    selectedPriority === p
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Assignee Filter */}
            <select
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              className="py-1 px-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-transparent text-slate-700 dark:text-slate-300 text-xs font-medium focus:outline-none"
            >
              <option value="all">All Assignees</option>
              <option value="unassigned">Unassigned</option>
              {project.members.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.user?.name || m.userId}
                </option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="py-1 px-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-transparent text-slate-700 dark:text-slate-300 text-xs font-medium focus:outline-none"
            >
              <option value="default">Default Order</option>
              <option value="priority">Priority (High first)</option>
              <option value="dueDate">Due Date (Earliest)</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Board Canvas */}
      <div className="flex-1 overflow-x-auto p-6 flex gap-5 items-start">
        {project.columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={tasksByColumn[column.id] || []}
            onTaskClick={(t) => {
              setSelectedTask(t);
              setSearchParams({ task: t.id });
            }}
            onAddTask={handleAddTask}
            onRenameColumn={handleRenameColumn}
            onDeleteColumn={(colId) => setColumnToDelete(colId)}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            draggingTaskId={draggingTask?.id || null}
            allColumns={project.columns}
            onQuickMove={handleQuickMove}
          />
        ))}

        {/* Add Column Button or Inline Form */}
        <div className="w-72 shrink-0">
          {isAddingColumn ? (
            <form
              onSubmit={handleAddColumn}
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
            >
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                New Column
              </h4>
              <input
                type="text"
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                placeholder="e.g. Blocked, QA Test, Staging"
                autoFocus
                className="w-full p-2 text-xs rounded-lg border border-amber-500 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingColumn(false)}
                  className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newColumnTitle.trim()}
                  className="px-3 py-1 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 disabled:opacity-50 rounded-lg shadow-xs"
                >
                  Add Column
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsAddingColumn(true)}
              className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 text-xs font-semibold flex items-center justify-center gap-2 transition-colors bg-white/40 dark:bg-slate-900/40"
            >
              <Plus className="w-4 h-4" />
              <span>Add Column</span>
            </button>
          )}
        </div>
      </div>

      {/* Task Drawer */}
      <TaskDrawer
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => {
          setSelectedTask(null);
          setSearchParams({});
        }}
        onUpdate={handleUpdateTask}
        onDelete={handleDeleteTask}
        members={project.members}
        columns={project.columns}
      />

      {/* Invite Member Modal */}
      <InviteMemberModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onInvite={handleInviteMember}
        existingMembers={project.members}
      />

      {/* Project Settings Modal */}
      <ProjectSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        project={project}
        onUpdateProject={handleUpdateProjectDetails}
        onDeleteProject={handleDeleteProjectConfirm}
        onRemoveMember={handleRemoveMember}
      />

      {/* Delete Column Confirmation */}
      <ConfirmDialog
        isOpen={!!columnToDelete}
        onClose={() => setColumnToDelete(null)}
        onConfirm={handleDeleteColumnConfirm}
        title="Sab theek hai?"
        message="Are you sure you want to delete this column and all its task cards? This action cannot be undone."
        confirmLabel="Delete Column"
      />
    </div>
  );
};
