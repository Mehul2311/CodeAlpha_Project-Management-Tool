import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  X,
  Trash2,
  Calendar,
  CheckSquare,
  Plus,
  Tag,
  AlertCircle,
  User as UserIcon,
  Columns3,
  Check,
} from 'lucide-react';
import { Task, ProjectMember, Column, Priority, ChecklistItem } from '../../types';
import { CommentsSection } from './CommentsSection';
import { ConfirmDialog } from '../modals/ConfirmDialog';
import { getInitials } from '../../utils/formatters';

interface TaskDrawerProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
  members: ProjectMember[];
  columns: Column[];
}

export const TaskDrawer: React.FC<TaskDrawerProps> = ({
  task,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  members,
  columns,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [columnId, setColumnId] = useState('');
  const [assigneeId, setAssigneeId] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState<string>('');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [labels, setLabels] = useState<string[]>([]);
  const [newLabel, setNewLabel] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setPriority(task.priority || 'medium');
      setColumnId(task.columnId || '');
      setAssigneeId(task.assigneeId || null);
      setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
      setChecklist(task.checklist || []);
      setLabels(task.labels || []);
    }
  }, [task]);

  if (!task) return null;

  const handleTitleBlur = () => {
    if (title.trim() && title !== task.title) {
      onUpdate(task.id, { title: title.trim() });
    }
  };

  const handleDescriptionBlur = () => {
    if (description !== task.description) {
      onUpdate(task.id, { description });
    }
  };

  const handlePriorityChange = (newP: Priority) => {
    setPriority(newP);
    onUpdate(task.id, { priority: newP });
  };

  const handleColumnChange = (newColId: string) => {
    setColumnId(newColId);
    onUpdate(task.id, { columnId: newColId });
  };

  const handleAssigneeChange = (newAssigneeId: string) => {
    const val = newAssigneeId === 'unassigned' ? null : newAssigneeId;
    setAssigneeId(val);
    onUpdate(task.id, { assigneeId: val });
  };

  const handleDueDateChange = (val: string) => {
    setDueDate(val);
    onUpdate(task.id, { dueDate: val || null });
  };

  const handleToggleChecklist = (itemId: string) => {
    const updated = checklist.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    setChecklist(updated);
    onUpdate(task.id, { checklist: updated });

    // Confetti celebration if all items are completed
    const allDone = updated.length > 0 && updated.every((item) => item.completed);
    if (allDone) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
  };

  const handleAddChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;

    const newItem: ChecklistItem = {
      id: `chk_${Date.now()}`,
      text: newChecklistText.trim(),
      completed: false,
    };
    const updated = [...checklist, newItem];
    setChecklist(updated);
    setNewChecklistText('');
    onUpdate(task.id, { checklist: updated });
  };

  const handleDeleteChecklistItem = (itemId: string) => {
    const updated = checklist.filter((item) => item.id !== itemId);
    setChecklist(updated);
    onUpdate(task.id, { checklist: updated });
  };

  const handleAddLabel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim() || labels.includes(newLabel.trim())) return;
    const updated = [...labels, newLabel.trim()];
    setLabels(updated);
    setNewLabel('');
    onUpdate(task.id, { labels: updated });
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    const updated = labels.filter((l) => l !== labelToRemove);
    setLabels(updated);
    onUpdate(task.id, { labels: updated });
  };

  const completedChecklist = checklist.filter((c) => c.completed).length;
  const progressPercent = checklist.length > 0 ? Math.round((completedChecklist / checklist.length) * 100) : 0;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            />

            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="w-screen max-w-xl bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between"
              >
                {/* Drawer Header */}
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 uppercase">
                      Task Details
                    </span>

                    {/* Quick Complete / Done toggle */}
                    {(() => {
                      const doneCol = columns.find((c) => c.title.toLowerCase().includes('done'));
                      const isDone = doneCol && columnId === doneCol.id;
                      return doneCol ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (isDone) {
                              const todoCol = columns.find((c) => !c.title.toLowerCase().includes('done')) || columns[0];
                              handleColumnChange(todoCol.id);
                            } else {
                              handleColumnChange(doneCol.id);
                              confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
                            }
                          }}
                          className={`ml-2 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 ${
                            isDone
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-750 hover:border-emerald-500'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{isDone ? 'Completed' : 'Mark Complete'}</span>
                        </button>
                      ) : null;
                    })()}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowConfirmDelete(true)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Delete Task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={onClose}
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Drawer Body */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                  {/* Task Title */}
                  <div>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      onBlur={handleTitleBlur}
                      placeholder="Task title..."
                      className="w-full text-lg font-bold text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-amber-500 focus:outline-none pb-1 transition-colors"
                    />
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
                    {/* Status / Column */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                        <Columns3 className="w-3 h-3" />
                        <span>Column Status</span>
                      </label>
                      <select
                        value={columnId}
                        onChange={(e) => handleColumnChange(e.target.value)}
                        className="w-full py-1.5 px-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
                      >
                        {columns.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Priority */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>Priority Level</span>
                      </label>
                      <select
                        value={priority}
                        onChange={(e) => handlePriorityChange(e.target.value as Priority)}
                        className="w-full py-1.5 px-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
                      >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                      </select>
                    </div>

                    {/* Assignee */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                        <UserIcon className="w-3 h-3" />
                        <span>Assignee</span>
                      </label>
                      <select
                        value={assigneeId || 'unassigned'}
                        onChange={(e) => handleAssigneeChange(e.target.value)}
                        className="w-full py-1.5 px-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
                      >
                        <option value="unassigned">Unassigned</option>
                        {members.map((m) => (
                          <option key={m.userId} value={m.userId}>
                            {m.user?.name || m.userId}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Due Date */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Due Date</span>
                      </label>
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => handleDueDateChange(e.target.value)}
                        className="w-full py-1.5 px-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-750 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium tabular-nums"
                      />
                      <div className="flex items-center gap-1 mt-1 text-[10px]">
                        <button
                          type="button"
                          onClick={() => {
                            const today = new Date().toISOString().split('T')[0];
                            handleDueDateChange(today);
                          }}
                          className="text-amber-600 dark:text-amber-400 hover:underline"
                        >
                          Today
                        </button>
                        <span className="text-slate-300 dark:text-slate-600">·</span>
                        <button
                          type="button"
                          onClick={() => {
                            const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
                            handleDueDateChange(nextWeek);
                          }}
                          className="text-amber-600 dark:text-amber-400 hover:underline"
                        >
                          +7 Days
                        </button>
                        {dueDate && (
                          <>
                            <span className="text-slate-300 dark:text-slate-600">·</span>
                            <button
                              type="button"
                              onClick={() => handleDueDateChange('')}
                              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                              Clear
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Labels */}
                  <div>
                    <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-amber-600" />
                      <span>Labels</span>
                    </label>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {labels.map((lbl) => (
                        <span
                          key={lbl}
                          className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-750 font-medium"
                        >
                          {lbl}
                          <button
                            type="button"
                            onClick={() => handleRemoveLabel(lbl)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}

                      <form onSubmit={handleAddLabel} className="inline-flex">
                        <input
                          type="text"
                          value={newLabel}
                          onChange={(e) => setNewLabel(e.target.value)}
                          placeholder="+ Add label"
                          className="text-xs px-2.5 py-1 rounded-md border border-dashed border-slate-300 dark:border-slate-750 bg-transparent text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 w-24 focus:w-32 transition-all"
                        />
                      </form>
                    </div>

                    {/* Quick suggested chips */}
                    <div className="flex flex-wrap items-center gap-1 mt-2">
                      <span className="text-[10px] text-slate-400 mr-1">Suggestions:</span>
                      {['UPI Payments', 'GST Tax', 'Backend', 'Frontend', 'Design', 'Bug', 'Urgent'].map((suggested) => {
                        if (labels.includes(suggested)) return null;
                        return (
                          <button
                            key={suggested}
                            type="button"
                            onClick={() => {
                              const updated = [...labels, suggested];
                              setLabels(updated);
                              onUpdate(task.id, { labels: updated });
                            }}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
                          >
                            + {suggested}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                      Description & Scope
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      onBlur={handleDescriptionBlur}
                      rows={4}
                      placeholder="Add detailed specifications, checklist notes, or criteria..."
                      className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none transition-colors"
                    />
                  </div>

                  {/* Checklist */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                        <CheckSquare className="w-4 h-4 text-amber-600" />
                        <span>Checklist ({completedChecklist}/{checklist.length})</span>
                      </div>
                      {checklist.length > 0 && (
                        <span className="text-xs font-semibold tabular-nums text-slate-500">
                          {progressPercent}%
                        </span>
                      )}
                    </div>

                    {checklist.length > 0 && (
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-amber-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercent}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    )}

                    <div className="space-y-2 pt-1">
                      {checklist.map((item) => (
                        <div
                          key={item.id}
                          className="group flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                        >
                          <button
                            type="button"
                            onClick={() => handleToggleChecklist(item.id)}
                            className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border transition-colors ${
                              item.completed
                                ? 'bg-amber-600 border-amber-600 text-white'
                                : 'border-slate-300 dark:border-slate-600 hover:border-amber-500'
                            }`}
                          >
                            {item.completed && <Check className="w-3 h-3 stroke-[3]" />}
                          </button>
                          <span
                            className={`flex-1 text-xs leading-relaxed transition-colors ${
                              item.completed
                                ? 'line-through text-slate-400 dark:text-slate-500'
                                : 'text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            {item.text}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteChecklistItem(item.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleAddChecklistItem} className="flex gap-2 pt-1">
                      <input
                        type="text"
                        value={newChecklistText}
                        onChange={(e) => setNewChecklistText(e.target.value)}
                        placeholder="Add an item to the checklist..."
                        className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                      <button
                        type="submit"
                        disabled={!newChecklistText.trim()}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 rounded-lg disabled:opacity-50 flex items-center gap-1 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </form>
                  </div>

                  {/* Threaded Comments Section */}
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                    <CommentsSection taskId={task.id} projectId={task.projectId} />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={async () => {
          await onDelete(task.id);
          onClose();
        }}
        title="Sab theek hai?"
        message={`Are you sure you want to permanently delete task "${task.title}"? This cannot be undone.`}
        confirmLabel="Delete Task"
      />
    </>
  );
};
