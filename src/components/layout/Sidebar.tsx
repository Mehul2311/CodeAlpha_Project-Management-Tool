import React from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  Plus,
  FolderKanban,
  IndianRupee,
  Users,
  Sparkles,
} from 'lucide-react';
import { Project } from '../../types';
import { formatINR } from '../../utils/formatters';

interface SidebarProps {
  projects: Project[];
  onOpenNewProject: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  projects,
  onOpenNewProject,
  isOpen,
  onClose,
}) => {
  const { id: activeProjectId } = useParams<{ id: string }>();

  const totalBudget = projects.reduce((acc, p) => acc + (p.budget || 0), 0);

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-30 md:hidden"
        />
      )}

      <aside
        className={`fixed md:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-200 z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {/* Main Navigation */}
          <div className="space-y-1">
            <NavLink
              to="/dashboard"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Workspace Overview</span>
            </NavLink>

            <NavLink
              to="/my-tasks"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              <CheckSquare className="w-4 h-4" />
              <span>My Tasks</span>
            </NavLink>
          </div>

          {/* Projects Section */}
          <div>
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Projects ({projects.length})
              </span>
              <button
                onClick={() => {
                  onClose?.();
                  onOpenNewProject();
                }}
                className="p-1 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Create Project"
                aria-label="Create new project"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-0.5">
              {projects.length === 0 ? (
                <div className="px-3 py-3 text-center">
                  <p className="text-xs text-slate-400">No projects yet.</p>
                  <button
                    onClick={() => {
                      onClose?.();
                      onOpenNewProject();
                    }}
                    className="mt-2 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    + Create first project
                  </button>
                </div>
              ) : (
                projects.map((project) => {
                  const isActive = activeProjectId === project.id;
                  return (
                    <NavLink
                      key={project.id}
                      to={`/projects/${project.id}`}
                      onClick={onClose}
                      className={`group flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FolderKanban
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isActive ? 'text-amber-600' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                          }`}
                        />
                        <span className="truncate">{project.name}</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-mono text-slate-400 dark:text-slate-500 uppercase shrink-0">
                        {project.key}
                      </span>
                    </NavLink>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section: INR Budget Metric & Indian Touch */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span>Budget Tracked</span>
              <IndianRupee className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-base font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">
              {formatINR(totalBudget)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Made for Indian teams</span>
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
