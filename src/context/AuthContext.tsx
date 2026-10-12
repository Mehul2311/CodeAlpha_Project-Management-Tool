import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { getSocket, joinUserRoom } from '../services/socket';
import { User, AppNotification } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signup: (data: { name: string; email: string; password: string; phone?: string; role?: string }) => Promise<void>;
  demoLogin: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updated: Partial<User>) => void;
  notifications: AppNotification[];
  unreadCount: number;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
    } catch {
      setUser(null);
      localStorage.removeItem('kaam_token');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
    } catch {
      // Notifications fetch error suppressed
    }
  }, [user]);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  useEffect(() => {
    if (user) {
      joinUserRoom(user.id);
      fetchNotifications();

      const socket = getSocket();
      const handleNewNotification = (notification: AppNotification) => {
        setNotifications((prev) => [notification, ...prev]);
      };

      socket.on('notification:new', handleNewNotification);
      return () => {
        socket.off('notification:new', handleNewNotification);
      };
    }
  }, [user, fetchNotifications]);

  const login = async (email: string, password: string, rememberMe = true) => {
    const res = await api.post('/auth/login', { email, password, rememberMe });
    setUser(res.data.user);
    if (res.data.token) {
      localStorage.setItem('kaam_token', res.data.token);
    }
  };

  const signup = async (data: { name: string; email: string; password: string; phone?: string; role?: string }) => {
    const res = await api.post('/auth/signup', data);
    setUser(res.data.user);
    if (res.data.token) {
      localStorage.setItem('kaam_token', res.data.token);
    }
  };

  const demoLogin = async (email: string) => {
    const res = await api.post('/auth/demo-login', { email });
    setUser(res.data.user);
    if (res.data.token) {
      localStorage.setItem('kaam_token', res.data.token);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Best effort logout
    }
    setUser(null);
    setNotifications([]);
    localStorage.removeItem('kaam_token');
  };

  const updateUser = (updated: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updated } : null));
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch {
      // Ignore
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // Ignore
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        demoLogin,
        logout,
        updateUser,
        notifications,
        unreadCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        fetchNotifications,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
