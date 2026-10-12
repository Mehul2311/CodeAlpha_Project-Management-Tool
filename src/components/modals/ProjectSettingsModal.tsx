import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Settings,
  Trash2,
  Users,
  IndianRupee,
  Shield,
  UserX,
  Save,
  AlertTriangle,
} from 'lucide-react';
import { Project } from '../../types';
import { formatINR, getInitials } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { ConfirmDialog } from './ConfirmDialog';

interface ProjectSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onUpdateProject: (updates: Partial<Project>) => Promise<void>;
  onDeleteProject: () => Promise<void>;
  onRemoveMember: (memberId: string) => Promise<void>;
}

export const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({
  isOpen,
  onClose,
  project,
  onUpdateProject,
  onDeleteProject,
  onRemoveMember,
}) => {
  const { user } = useAuth();
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || '');
  const [budget, setBudget] = useState(project.budget?.toString() || '0');
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'members' | 'danger'>('general');

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description || '');
      setBudget(project.budget?.toString() || '0');
    }
  }, [project]);

  const isOwner = project.ownerId === user?.id;

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await onUpdateProject({
        name: name.trim(),
        description: description.trim(),
        budget: budget ? parseFloat(budget) : 0,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 z-10 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Project Settings
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Manage {project.name} ({project.key})
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-2 mt-4 pb-2 border-b border-slate-100 dark:border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('general')}
                  className={`px-3 py-1.5 font-semibold rounded-lg transition-colors ${
                    activeTab === 'general'
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  General Details
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('members')}
                  className={`px-3 py-1.5 font-semibold rounded-lg transition-colors ${
                    activeTab === 'members'
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  Team Members ({project.members.length})
                </button>
                {isOwner && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('danger')}
                    className={`px-3 py-1.5 font-semibold rounded-lg transition-colors ${
                      activeTab === 'danger'
                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    Danger Zone
                  </button>
                )}
              </div>

              {/* Tab 1: General Details */}
              {activeTab === 'general' && (
                <form onSubmit={handleSaveGeneral} className="mt-5 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Project Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Budget in ₹ (INR)
                    </label>
                    <div className="relative">
                      <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="number"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        placeholder="e.g. 500000"
                        className="w-full pl-9 pr-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 tabular-nums"
                      />
                    </div>
                    {budget && (
                      <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1 inline-block">
                        Formatted: {formatINR(parseFloat(budget))}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Project Description & Goal
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 disabled:opacity-50 rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Tab 2: Members Management */}
              {activeTab === 'members' && (
                <div className="mt-5 space-y-4 max-h-80 overflow-y-auto">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Review and manage collaborators with access to this board:
                  </p>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {project.members.map((member) => (
                      <div
                        key={member.userId}
                        className="py-3 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0 ${
                              member.user?.avatarColor || 'bg-amber-600'
                            }`}
                          >
                            {getInitials(member.user?.name)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {member.user?.name || member.userId}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {member.user?.email || ''}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              member.role === 'owner'
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {member.role}
                          </span>

                          {isOwner && member.userId !== project.ownerId && (
                            <button
                              type="button"
                              onClick={() => onRemoveMember(member.userId)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Remove member from project"
                            >
                              <UserX className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Danger Zone */}
              {activeTab === 'danger' && isOwner && (
                <div className="mt-5 p-4 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-rose-900 dark:text-rose-200">
                        Permanently Delete Project
                      </h4>
                      <p className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed mt-1">
                        Once deleted, this project, all columns, tasks, checklists, and discussions will be permanently erased.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowConfirmDelete(true)}
                    className="mt-2 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete "{project.name}"</span>
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={async () => {
          await onDeleteProject();
          onClose();
        }}
        title="Sab theek hai?"
        message={`Are you absolutely sure you want to delete "${project.name}"? This action cannot be undone.`}
        confirmLabel="Delete Project"
      />
    </>
  );
};
