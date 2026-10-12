import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, LogIn, ArrowRight, Sparkles, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getInitials } from '../utils/formatters';

const DEMO_ACCOUNTS = [
  {
    name: 'Aarav Mehta',
    email: 'aarav.mehta@mumbai-tech.in',
    role: 'Founder & Tech Lead',
    avatarColor: 'bg-amber-600',
  },
  {
    name: 'Priya Nair',
    email: 'priya.nair@bengaluru-devs.in',
    role: 'Senior Full Stack Engineer',
    avatarColor: 'bg-emerald-600',
  },
  {
    name: 'Rohan Verma',
    email: 'rohan.verma@delhi-design.in',
    role: 'Lead UI/UX Designer',
    avatarColor: 'bg-blue-600',
  },
  {
    name: 'Sneha Reddy',
    email: 'sneha.reddy@hyderabad-ai.in',
    role: 'Product Manager',
    avatarColor: 'bg-teal-600',
  },
];

export const LoginPage: React.FC = () => {
  const { login, demoLogin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError('');
      await login(email.trim(), password, rememberMe);
      toast.success('Namaste! Welcome back.');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, name: string) => {
    try {
      setIsSubmitting(true);
      setError('');
      await demoLogin(demoEmail);
      toast.success(`Logged in as ${name}!`);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-md mb-3">
            क
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Log in to KaamBoard
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Sprint management made for Indian teams
          </p>
        </div>

        {/* 1-Click Demo Login Box */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400 mb-2">
            <Sparkles className="w-4 h-4" />
            <span>Instant 1-Click Demo Logins</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-3">
            Switch between Indian team members to test real-time board sync & task assignments:
          </p>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                disabled={isSubmitting}
                onClick={() => handleDemoLogin(acc.email, acc.name)}
                className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 text-left transition-colors flex items-center gap-2 shadow-xs group"
              >
                <div
                  className={`w-6 h-6 rounded-full text-white text-[9px] font-bold flex items-center justify-center shrink-0 ${acc.avatarColor}`}
                >
                  {getInitials(acc.name)}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white truncate group-hover:text-amber-600">
                    {acc.name.split(' ')[0]}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">{acc.role.split(' ')[0]}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Traditional Login Form */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@startup.in"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your account password"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                <span>Remember me</span>
              </label>
              <span className="text-slate-400 text-[11px]">
                Demo password: <strong className="font-mono">kaam1234</strong>
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 disabled:opacity-50 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5"
            >
              <LogIn className="w-4 h-4" />
              <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
            </button>
          </form>

          <div className="pt-4 text-center border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
            <span>New to KaamBoard? </span>
            <Link to="/signup" className="text-amber-600 dark:text-amber-400 font-semibold hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
