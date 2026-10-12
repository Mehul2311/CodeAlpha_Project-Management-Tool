import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, UserPlus, Mail, Shield, Check } from 'lucide-react';
import { ProjectMember } from '../../types';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (email: string, role: 'owner' | 'member') => Promise<void>;
  existingMembers: ProjectMember[];
}

const DEMO_COLLABORATORS = [
  { name: 'Priya Nair', email: 'priya.nair@bengaluru-devs.in', role: 'Full Stack' },
  { name: 'Rohan Verma', email: 'rohan.verma@delhi-design.in', role: 'UI/UX' },
  { name: 'Ananya Iyer', email: 'ananya.iyer@chennai-coders.in', role: 'Backend' },
  { name: 'Kabir Singh', email: 'kabir.singh@pune-ventures.in', role: 'DevOps' },
  { name: 'Sneha Reddy', email: 'sneha.reddy@hyderabad-ai.in', role: 'Product Manager' },
  { name: 'Aarav Mehta', email: 'aarav.mehta@mumbai-tech.in', role: 'Tech Lead' },
];

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  isOpen,
  onClose,
  onInvite,
  existingMembers,
}) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'member' | 'owner'>('member');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const existingEmailSet = new Set(
    existingMembers.map((m) => m.user?.email?.toLowerCase()).filter(Boolean)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please provide an email address.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onInvite(email.trim().toLowerCase(), role);
      setEmail('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to invite member.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickAdd = async (demoEmail: string) => {
    try {
      setIsSubmitting(true);
      setError('');
      await onInvite(demoEmail, 'member');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add member.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 z-10"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Invite Teammate
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Add collaborators to this board
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

            {error && (
              <div className="mt-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. colleague@startup.in"
                    className="w-full pl-9 pr-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Project Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('member')}
                    className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                      role === 'member'
                        ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Check className={`w-3.5 h-3.5 ${role === 'member' ? 'opacity-100' : 'opacity-0'}`} />
                    Member
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('owner')}
                    className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                      role === 'owner'
                        ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5 text-amber-600" />
                    Co-Owner
                  </button>
                </div>
              </div>

              {/* Quick Invite Seed Members */}
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Quick Add Teammates
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {DEMO_COLLABORATORS.map((collab) => {
                    const alreadyIn = existingEmailSet.has(collab.email.toLowerCase());
                    return (
                      <button
                        key={collab.email}
                        type="button"
                        disabled={alreadyIn || isSubmitting}
                        onClick={() => handleQuickAdd(collab.email)}
                        className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                          alreadyIn
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-transparent cursor-default'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-amber-500 hover:text-amber-600'
                        }`}
                      >
                        {collab.name} {alreadyIn ? '(Joined)' : '+'}
                      </button>
                    );
                  })}
                </div>
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
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-medium text-white bg-amber-600 hover:bg-amber-500 disabled:opacity-50 rounded-lg transition-colors shadow-sm"
                >
                  {isSubmitting ? 'Inviting...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
