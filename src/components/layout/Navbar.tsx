import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  Sun,
  Moon,
  LogOut,
  User as UserIcon,
  CheckCircle2,
  ExternalLink,
  Kanban,
  CheckSquare,
  LayoutDashboard,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getInitials, timeAgo } from '../../utils/formatters';

interface NavbarProps {
  onMobileMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onMobileMenuToggle, isMobileMenuOpen }) => {
  const { user, logout, notifications, unreadCount, markNotificationAsRead, markAllNotificationsAsRead } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [bellShaking, setBellShaking] = useState(false);

  const prevUnreadCountRef = useRef(unreadCount);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Trigger bell shake when unread notifications increase
  useEffect(() => {
    if (unreadCount > prevUnreadCountRef.current) {
      setBellShaking(true);
      const timer = setTimeout(() => setBellShaking(false), 1000);
      return () => clearTimeout(timer);
    }
    prevUnreadCountRef.current = unreadCount;
  }, [unreadCount]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'My Tasks', path: '/my-tasks', icon: CheckSquare },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          {user && (
            <button
              onClick={onMobileMenuToggle}
              className="md:hidden p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          <Link
            to={user ? '/dashboard' : '/'}
            className="flex items-center gap-2.5 text-slate-900 dark:text-white font-bold text-xl tracking-tight whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-md"
          >
            <span className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white shadow-sm font-black text-base">
              क
            </span>
            <span>KaamBoard</span>
          </Link>
        </div>

        {/* Zone 2: 4-5 Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {user ? (
            navLinks.map((link) => {
              const active = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors ${
                    active
                      ? 'text-amber-600 dark:text-amber-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })
          ) : (
            <>
              <a href="#features" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white whitespace-nowrap shrink-0">
                Features
              </a>
              <a href="#workflow" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white whitespace-nowrap shrink-0">
                Sprint Flow
              </a>
              <a href="#pricing" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white whitespace-nowrap shrink-0">
                Pricing (₹)
              </a>
              <a href="#testimonials" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white whitespace-nowrap shrink-0">
                Stories
              </a>
            </>
          )}
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-500 dark:text-amber-400 hover:text-slate-800 dark:hover:text-amber-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 border border-slate-200/50 dark:border-slate-800"
            aria-label="Toggle color theme"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {user ? (
            <>
              {/* Notification Bell */}
              <div className="relative" ref={notifRef}>
                <motion.button
                  onClick={() => setShowNotifications(!showNotifications)}
                  animate={bellShaking ? { rotate: [-15, 15, -12, 12, -6, 6, 0] } : {}}
                  transition={{ duration: 0.6 }}
                  className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center tabular-nums leading-none">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </motion.button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 overflow-hidden"
                    >
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <span className="font-semibold text-sm text-slate-900 dark:text-white">
                          Notifications
                        </span>
                        {unreadCount > 0 && (
                          <button
                            onClick={() => markAllNotificationsAsRead()}
                            className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-medium"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center text-xs text-slate-400">
                            No notifications yet. Sab theek hai!
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => {
                                if (!n.read) markNotificationAsRead(n.id);
                                if (n.link) {
                                  setShowNotifications(false);
                                  navigate(n.link);
                                }
                              }}
                              className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors text-left flex gap-3 ${
                                !n.read ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''
                              }`}
                            >
                              <div className="mt-0.5 shrink-0">
                                <CheckCircle2 className={`w-4 h-4 ${!n.read ? 'text-amber-600' : 'text-slate-400'}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-0.5">
                                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                                    {n.title}
                                  </p>
                                  <span className="text-[11px] text-slate-400 tabular-nums shrink-0">
                                    {timeAgo(n.createdAt)}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug line-clamp-2">
                                  {n.message}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Dropdown */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                  aria-label="User profile menu"
                >
                  <div
                    className={`w-8 h-8 rounded-full text-white text-xs font-bold flex items-center justify-center shadow-sm ${
                      user.avatarColor || 'bg-amber-600'
                    }`}
                  >
                    {getInitials(user.name)}
                  </div>
                  <span className="hidden sm:inline text-xs font-semibold text-slate-700 dark:text-slate-200 max-w-[120px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50"
                    >
                      <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {user.name}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                        {user.role && (
                          <span className="mt-1 inline-block text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                            {user.role}
                          </span>
                        )}
                      </div>

                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                          <span>Profile Settings</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-amber-600 hover:bg-amber-500 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
