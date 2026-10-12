import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  CheckSquare,
  Search,
  Filter,
  Calendar,
  AlertCircle,
  FolderKanban,
  ExternalLink,
  Sparkles,
  Check,
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Task } from '../types';
import { formatDateIST } from '../utils/formatters';

interface EnrichedTask extends Task {
  projectName?: string;
  projectKey?: string;
  columnTitle?: string;
}

export const MyTasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<EnrichedTask[]>([]);
  const [loading, setLoading] = useState(true);

  const toast = useToast();

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleCompleteTask = async (task: EnrichedTask) => {
    try {
      const projRes = await api.get(`/projects/${task.projectId}`);
      const columns = projRes.data.project?.columns || [];
      const doneCol = columns.find((c: any) => c.title.toLowerCase().includes('done')) || columns[columns.length - 1];
      if (doneCol) {
        await api.post(`/tasks/${task.id}/move`, {
          targetColumnId: doneCol.id,
          newOrder: 999,
        });
        setTasks((prev) =>
          prev.map((t) => (t.id === task.id ? { ...t, columnId: doneCol.id, columnTitle: doneCol.title } : t))
        );
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        toast.success(`Badiya kaam! "${task.title}" marked as complete!`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to complete task.');
    }
  };

  useEffect(() => {
    const fetchMyTasks = async () => {
      try {
        setLoading(true);
        const res = await api.get('/tasks/my-tasks');
        setTasks(res.data.tasks || []);
      } catch {
        // Suppress fetch errors
      } finally {
        setLoading(false);
      }
    };
    fetchMyTasks();
  }, []);

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchProj = (t.projectName || '').toLowerCase().includes(q);
        if (!matchTitle && !matchProj) return false;
      }
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) {
        return false;
      }
      if (statusFilter !== 'all') {
        const colTitle = (t.columnTitle || '').toLowerCase();
        if (statusFilter === 'todo' && !colTitle.includes('to do') && !colTitle.includes('todo')) return false;
        if (statusFilter === 'inprog' && !colTitle.includes('progress')) return false;
        if (statusFilter === 'review' && !colTitle.includes('review')) return false;
        if (statusFilter === 'done' && !colTitle.includes('done')) return false;
      }
      return true;
    });
  }, [tasks, searchQuery, priorityFilter, statusFilter]);

  const priorityStyles = {
    high: 'text-rose-600 dark:text-rose-400 font-semibold',
    medium: 'text-amber-600 dark:text-amber-400 font-semibold',
    low: 'text-emerald-600 dark:text-emerald-400 font-semibold',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            My Tasks Queue
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            All tasks assigned to you across your active sprint boards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400">
            {filtered.length} of {tasks.length} tasks
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your assigned tasks..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* Status segmented controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            {[
              { id: 'all', label: 'All' },
              { id: 'todo', label: 'To Do' },
              { id: 'inprog', label: 'In Progress' },
              { id: 'review', label: 'Review' },
              { id: 'done', label: 'Done' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  statusFilter === st.id
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="py-1.5 px-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Task List Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Loading your tasks...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <CheckSquare className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No tasks found
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Either you are all caught up, or no tasks match your filter. Sab theek hai!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((task) => {
              const completedChecklist = task.checklist.filter((c) => c.completed).length;
              const totalChecklist = task.checklist.length;

              return (
                <div
                  key={task.id}
                  className="p-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 text-xs">
                      <span className="font-mono text-amber-600 dark:text-amber-400 font-bold uppercase text-[11px]">
                        {task.projectKey}
                      </span>
                      <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                      <span className="text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
                        {task.projectName}
                      </span>
                      <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                      <span className={priorityStyles[task.priority]}>
                        {task.priority.toUpperCase()}
                      </span>
                    </div>

                    <Link
                      to={`/projects/${task.projectId}?task=${task.id}`}
                      className="text-sm font-semibold text-slate-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition-colors block"
                    >
                      {task.title}
                    </Link>

                    {task.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {task.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs shrink-0">
                    {/* Column status & Complete toggle */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-600 dark:text-slate-300 font-medium px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">
                        {task.columnTitle || 'To Do'}
                      </span>

                      {!task.columnTitle?.toLowerCase().includes('done') && (
                        <button
                          type="button"
                          onClick={() => handleCompleteTask(task)}
                          className="px-2 py-0.5 rounded text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors flex items-center gap-1"
                          title="Mark this task as complete"
                        >
                          <Check className="w-3 h-3" />
                          <span>Done</span>
                        </button>
                      )}
                    </div>

                    {/* Checklist */}
                    {totalChecklist > 0 && (
                      <div className="flex items-center gap-1 text-slate-500 tabular-nums">
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>
                          {completedChecklist}/{totalChecklist}
                        </span>
                      </div>
                    )}

                    {/* Due Date */}
                    {task.dueDate && (
                      <div className="flex items-center gap-1 text-slate-500 tabular-nums">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDateIST(task.dueDate)}</span>
                      </div>
                    )}

                    {/* Open Link */}
                    <Link
                      to={`/projects/${task.projectId}?task=${task.id}`}
                      className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Open in Board"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
