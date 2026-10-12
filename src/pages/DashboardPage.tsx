import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  FolderKanban,
  Plus,
  CheckCircle2,
  Clock,
  IndianRupee,
  Users,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import { Project } from '../types';
import { useAuth } from '../context/AuthContext';
import { formatINR, getInitials } from '../utils/formatters';
import { NewProjectModal } from '../components/modals/NewProjectModal';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.get('/projects');
      setProjects(res.data.projects || []);
    } catch {
      // Suppress fetch errors
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (data: {
    name: string;
    key: string;
    description: string;
    budget?: number;
  }) => {
    const res = await api.post('/projects', data);
    setProjects((prev) => [...prev, res.data.project]);
  };

  const totalTasks = projects.reduce((acc, p) => acc + (p.taskCount || 0), 0);
  const totalBudget = projects.reduce((acc, p) => acc + (p.budget || 0), 0);
  const totalMembers = new Set(
    projects.flatMap((p) => p.members.map((m) => m.userId))
  ).size;

  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = projects.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.key.toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Namaste, {user?.name.split(' ')[0]}!
            </h1>
            <span className="text-lg">🙏</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Chalo, check your ongoing sprints and collaborative project boards.
          </p>
        </div>

        <button
          onClick={() => setIsNewProjectOpen(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* KPI Stat Cards (4 metrics strip) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Active Projects</span>
            <FolderKanban className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {projects.length}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Sprint Tasks</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {totalTasks}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Tracked Budget</span>
            <IndianRupee className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {formatINR(totalBudget)}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Collaborators</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {totalMembers}
          </p>
        </div>
      </div>

      {/* Projects Grid Header + Search */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Your Project Boards
            </h2>
            <p className="text-xs text-slate-400">
              {filteredProjects.length} of {projects.length} boards available
            </p>
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search boards by name or key..."
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-48 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse"
              />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <FolderKanban className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No projects started yet
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Create your first project board to start assigning cards, tracking checklists and collaborating in real-time.
            </p>
            <button
              onClick={() => setIsNewProjectOpen(true)}
              className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-xl"
            >
              + Create First Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="group flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-amber-500/50 dark:hover:border-amber-500/50 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 uppercase">
                      {project.key}
                    </span>
                    {project.budget !== undefined && project.budget > 0 && (
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                        {formatINR(project.budget)}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {project.name}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {project.description || 'Sprint board for agile execution.'}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  {/* Member avatars */}
                  <div className="flex items-center -space-x-1.5">
                    {project.members.slice(0, 4).map((m) => (
                      <div
                        key={m.userId}
                        title={m.user?.name}
                        className={`w-6 h-6 rounded-full text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900 ${
                          m.user?.avatarColor || 'bg-amber-600'
                        }`}
                      >
                        {getInitials(m.user?.name)}
                      </div>
                    ))}
                    {project.members.length > 4 && (
                      <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-[9px] font-semibold flex items-center justify-center text-slate-500 ring-2 ring-white dark:ring-slate-900">
                        +{project.members.length - 4}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform">
                    <span>Open Board</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <NewProjectModal
        isOpen={isNewProjectOpen}
        onClose={() => setIsNewProjectOpen(false)}
        onSubmit={handleCreateProject}
      />
    </div>
  );
};
