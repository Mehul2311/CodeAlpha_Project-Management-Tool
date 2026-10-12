import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectBoardPage } from './pages/ProjectBoardPage';
import { MyTasksPage } from './pages/MyTasksPage';
import { ProfilePage } from './pages/ProfilePage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { NewProjectModal } from './components/modals/NewProjectModal';
import { api } from './services/api';
import { Project } from './types';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Checking session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);

  // Load user projects for sidebar
  React.useEffect(() => {
    if (user) {
      api.get('/projects').then((res) => {
        setProjects(res.data.projects || []);
      }).catch(() => {});
    }
  }, [user]);

  const handleCreateProject = async (data: {
    name: string;
    key: string;
    description: string;
    budget?: number;
  }) => {
    const res = await api.post('/projects', data);
    setProjects((prev) => [...prev, res.data.project]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar
        onMobileMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isMobileMenuOpen={isSidebarOpen}
      />

      <div className="flex-1 flex">
        {user && (
          <Sidebar
            projects={projects}
            onOpenNewProject={() => setIsNewProjectModalOpen(true)}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        )}
        <main className="flex-1 min-w-0 overflow-y-auto">
          {children}
        </main>
      </div>

      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onSubmit={handleCreateProject}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route
                path="/"
                element={
                  <AppLayout>
                    <LandingPage />
                  </AppLayout>
                }
              />
              <Route
                path="/login"
                element={
                  <AppLayout>
                    <LoginPage />
                  </AppLayout>
                }
              />
              <Route
                path="/signup"
                element={
                  <AppLayout>
                    <SignupPage />
                  </AppLayout>
                }
              />

              {/* Protected Workspace Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <DashboardPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects/:id"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <ProjectBoardPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-tasks"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <MyTasksPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <ProfilePage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
