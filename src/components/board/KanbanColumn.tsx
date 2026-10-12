import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, MoreHorizontal, Trash2, Edit2, Check, X } from 'lucide-react';
import { Column, Task } from '../../types';
import { TaskCard } from './TaskCard';

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask: (columnId: string, title: string) => Promise<void>;
  onRenameColumn: (columnId: string, newTitle: string) => Promise<void>;
  onDeleteColumn: (columnId: string) => void;
  onDragStart: (e: React.DragEvent, task: Task) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetColumnId: string) => void;
  draggingTaskId: string | null;
  allColumns?: Column[];
  onQuickMove?: (taskId: string, targetColumnId: string) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  tasks,
  onTaskClick,
  onAddTask,
  onRenameColumn,
  onDeleteColumn,
  onDragStart,
  onDragOver,
  onDrop,
  draggingTaskId,
  allColumns = [],
  onQuickMove,
}) => {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(column.title);
  const [showMenu, setShowMenu] = useState(false);
  const [isDragOverCol, setIsDragOverCol] = useState(false);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    await onAddTask(column.id, newTaskTitle.trim());
    setNewTaskTitle('');
    setIsAddingTask(false);
  };

  const handleSaveRename = async () => {
    if (editTitle.trim() && editTitle !== column.title) {
      await onRenameColumn(column.id, editTitle.trim());
    }
    setIsEditingTitle(false);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver(e);
        setIsDragOverCol(true);
      }}
      onDragLeave={() => setIsDragOverCol(false)}
      onDrop={(e) => {
        setIsDragOverCol(false);
        onDrop(e, column.id);
      }}
      className={`w-72 sm:w-80 shrink-0 flex flex-col max-h-full rounded-2xl bg-slate-100/70 dark:bg-slate-900/70 border transition-all duration-200 ${
        isDragOverCol
          ? 'border-amber-500 bg-amber-50/20 dark:bg-amber-950/20 shadow-md ring-2 ring-amber-500/20'
          : 'border-slate-200/80 dark:border-slate-800'
      }`}
    >
      {/* Column Header */}
      <div className="p-3.5 flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/60">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isEditingTitle ? (
            <div className="flex items-center gap-1 flex-1">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveRename();
                  if (e.key === 'Escape') setIsEditingTitle(false);
                }}
                className="w-full text-xs font-bold px-2 py-1 bg-white dark:bg-slate-800 rounded border border-amber-500 text-slate-900 dark:text-white focus:outline-none"
              />
              <button
                onClick={handleSaveRename}
                className="p-1 text-emerald-600 hover:text-emerald-700"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsEditingTitle(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 truncate">
                {column.title}
              </h3>
              <span className="text-[11px] font-mono tabular-nums text-slate-400 dark:text-slate-500 font-semibold px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800">
                {tasks.length}
              </span>
            </>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            aria-label="Column actions"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-30 text-xs">
              <button
                onClick={() => {
                  setShowMenu(false);
                  setIsEditingTitle(true);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                <Edit2 className="w-3 h-3 text-slate-400" />
                <span>Rename</span>
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  onDeleteColumn(column.id);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete Column</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-[140px]">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={() => onTaskClick(task)}
            onDragStart={(e) => onDragStart(e, task)}
            isDragging={draggingTaskId === task.id}
            columns={allColumns}
            onQuickMove={onQuickMove}
          />
        ))}

        {tasks.length === 0 && !isAddingTask && (
          <div className="h-24 border-2 border-dashed border-slate-200 dark:border-slate-800/80 rounded-xl flex items-center justify-center text-xs text-slate-400 select-none">
            Drop cards here
          </div>
        )}
      </div>

      {/* Add Task Button or Form */}
      <div className="p-3 border-t border-slate-200/50 dark:border-slate-800/60">
        {isAddingTask ? (
          <form onSubmit={handleCreateTask} className="space-y-2">
            <textarea
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="What needs to be done?"
              autoFocus
              rows={2}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleCreateTask(e);
                }
              }}
              className="w-full p-2.5 text-xs rounded-xl border border-amber-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none resize-none shadow-xs"
            />
            <div className="flex items-center justify-end gap-1.5">
              <button
                type="button"
                onClick={() => setIsAddingTask(false)}
                className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newTaskTitle.trim()}
                className="px-3 py-1 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 disabled:opacity-50 rounded-lg shadow-xs"
              >
                Add Card
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAddingTask(true)}
            className="w-full py-2 px-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-white dark:hover:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-750 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Card</span>
          </button>
        )}
      </div>
    </div>
  );
};
