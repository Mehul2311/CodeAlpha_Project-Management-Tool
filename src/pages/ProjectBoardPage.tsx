import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Project } from '../types';
import { KanbanBoard } from '../components/board/KanbanBoard';
import { useToast } from '../context/ToastContext';

export const ProjectBoardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchProject = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await api.get(`/projects/${id}`);
        if (isMounted) {
          setProject(res.data.project);
        }
      } catch (err: any) {
        toast.error(err.message || 'Project not found or access denied.');
        navigate('/dashboard');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProject();
    return () => {
      isMounted = false;
    };
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Loading project board...</p>
        </div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <KanbanBoard
      project={project}
      onProjectUpdate={(updated) => {
        setProject((prev) => (prev ? { ...prev, ...updated } : null));
      }}
    />
  );
};
