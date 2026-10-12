import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  CheckSquare,
  Sparkles,
  ArrowRight,
  MoreVertical,
  Check,
} from 'lucide-react';
import { Task, Column } from '../../types';
import { formatDateIST, getInitials } from '../../utils/formatters';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  isDragging?: boolean;
  columns?: Column[];
  onQuickMove?: (taskId: string, targetColumnId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onClick,
  onDragStart,
  isDragging,
  columns = [],
  onQuickMove,
}) => {
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  const completedChecklist = task.checklist.filter((c) => c.completed).length;
  const totalChecklist = task.checklist.length;

  const priorityBadgeStyles = {
    high: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200/80 dark:border-rose-900/60',
    medium: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200/80 dark:border-amber-900/60',
    low: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-900/60',
  };

  const priorityDotStyles = {
    high: 'bg-rose-500',
    medium: 'bg-amber-500',
    low: 'bg-emerald-500',
  };

  const priorityLabels = {
    high: 'High',
    medium: 'Medium',
    low: 'Low',
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className={`relative select-none cursor-pointer transition-opacity ${
        isDragging ? 'opacity-30 scale-95' : ''
      }`}
    >
      <motion.div
        layout
        whileHover={{ y: -2, transition: { duration: 0.15 } }}
        whileTap={{ scale: 0.99 }}
        onClick={onClick}
        className="group bg-white dark:bg-slate-850 rounded-xl p-3.5 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-amber-500/40 dark:hover:border-amber-500/40 transition-all"
      >
        {/* Top Header: Priority Badge + Quick Move Action */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                priorityBadgeStyles[task.priority]
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${priorityDotStyles[task.priority]}`}
              />
              <span>{priorityLabels[task.priority]}</span>
            </span>

            {task.labels && task.labels.length > 0 && (
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                {task.labels[0]}
                {task.labels.length > 1 && ` +${task.labels.length - 1}`}
              </span>
            )}
          </div>

          {/* Quick Move button */}
          {columns.length > 1 && onQuickMove && (
            <div
              className="relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setShowMoveMenu(!showMoveMenu)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors opacity-70 group-hover:opacity-100"
                title="Quick Move"
                aria-label="Quick Move Card"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>

              <AnimatePresence>
                {showMoveMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 mt-1 w-44 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-40 text-xs"
                  >
                    <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Move To Column
                    </div>
                    {columns.map((col) => {
                      const isCurrent = col.id === task.columnId;
                      return (
                        <button
                          key={col.id}
                          type="button"
                          disabled={isCurrent}
                          onClick={() => {
                            setShowMoveMenu(false);
                            onQuickMove(task.id, col.id);
                          }}
                          className={`w-full text-left px-3 py-1.5 flex items-center justify-between text-xs transition-colors ${
                            isCurrent
                              ? 'text-amber-600 dark:text-amber-400 font-semibold bg-amber-50/50 dark:bg-amber-950/20'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <span className="truncate">{col.title}</span>
                          {isCurrent ? (
                            <Check className="w-3 h-3 text-amber-600" />
                          ) : (
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                          )}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Task Title */}
        <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white leading-snug line-clamp-2 mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
          {task.title}
        </h4>

        {/* Checklist Progress Bar */}
        {totalChecklist > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
              <div className="flex items-center gap-1">
                <CheckSquare className="w-3 h-3 text-slate-400" />
                <span>
                  {completedChecklist}/{totalChecklist}
                </span>
              </div>
              <span className="tabular-nums font-mono text-[10px] font-semibold">
                {Math.round((completedChecklist / totalChecklist) * 100)}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  completedChecklist === totalChecklist
                    ? 'bg-emerald-500'
                    : 'bg-amber-500'
                }`}
                style={{
                  width: `${(completedChecklist / totalChecklist) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Footer: Due date & Assignee */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          {task.dueDate ? (
            <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>{formatDateIST(task.dueDate)}</span>
            </div>
          ) : (
            <span className="text-[11px] text-slate-400 italic">No deadline</span>
          )}

          <div className="flex items-center gap-1.5">
            {totalChecklist > 0 && completedChecklist === totalChecklist && (
              <span title="All checklist items complete!">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              </span>
            )}

            {task.assignee ? (
              <div
                title={`Assigned to ${task.assignee.name}`}
                className={`w-6 h-6 rounded-full text-white text-[10px] font-bold flex items-center justify-center shadow-xs ring-1 ring-white dark:ring-slate-900 ${
                  task.assignee.avatarColor || 'bg-amber-600'
                }`}
              >
                {getInitials(task.assignee.name)}
              </div>
            ) : (
              <span className="text-[10px] text-slate-400 italic">Unassigned</span>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
