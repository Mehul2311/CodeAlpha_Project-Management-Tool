import React, { useState, useEffect } from 'react';
import { Send, Trash2, Edit2, Check, X, MessageSquare } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Comment } from '../../types';
import { getInitials, timeAgo } from '../../utils/formatters';

interface CommentsSectionProps {
  taskId: string;
  projectId: string;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({
  taskId,
  projectId,
}) => {
  const { user } = useAuth();
  const toast = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newContent, setNewContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const fetchComments = async () => {
    try {
      const res = await api.get(`/comments?taskId=${taskId}`);
      setComments(res.data.comments || []);
    } catch {
      // Suppress comment fetch errors
    }
  };

  useEffect(() => {
    fetchComments();
  }, [taskId]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await api.post('/comments', {
        taskId,
        projectId,
        content: newContent.trim(),
      });
      setComments((prev) => [...prev, res.data.comment]);
      setNewContent('');
      toast.success('Comment posted!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to post comment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (c: Comment) => {
    setEditingId(c.id);
    setEditContent(c.content);
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editContent.trim()) return;
    try {
      const res = await api.patch(`/comments/${commentId}`, {
        content: editContent.trim(),
      });
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? res.data.comment : c))
      );
      setEditingId(null);
      toast.success('Comment updated!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update comment.');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await api.delete(`/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      toast.success('Comment removed.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete comment.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
        <MessageSquare className="w-4 h-4 text-amber-600" />
        <span>Discussion ({comments.length})</span>
      </div>

      {/* Comment Input */}
      <form onSubmit={handleAddComment} className="flex gap-2.5">
        <div
          className={`w-7 h-7 rounded-full text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-1 ${
            user?.avatarColor || 'bg-amber-600'
          }`}
        >
          {getInitials(user?.name)}
        </div>
        <div className="flex-1">
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Add a remark, update, or question..."
            rows={2}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none transition-colors"
          />
          <div className="flex justify-end mt-1.5">
            <button
              type="submit"
              disabled={isSubmitting || !newContent.trim()}
              className="px-3 py-1 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 disabled:opacity-50 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Send className="w-3 h-3" />
              <span>Post</span>
            </button>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-3 pt-2">
        {comments.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-2 text-center">
            No remarks yet. Start the conversation!
          </p>
        ) : (
          comments.map((comment) => {
            const isAuthor = comment.userId === user?.id;
            const isEditing = editingId === comment.id;

            return (
              <div
                key={comment.id}
                className="group flex gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 transition-colors"
              >
                <div
                  className={`w-6 h-6 rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                    comment.user?.avatarColor || 'bg-amber-600'
                  }`}
                >
                  {getInitials(comment.user?.name)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {comment.user?.name || 'Teammate'}
                      </span>
                      <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
                      <span className="text-[11px] text-slate-400 tabular-nums">
                        {timeAgo(comment.createdAt)}
                      </span>
                    </div>

                    {isAuthor && !isEditing && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleStartEdit(comment)}
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          title="Edit"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-1.5 mt-1">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
                        rows={2}
                      />
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-2 py-0.5 text-[11px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveEdit(comment.id)}
                          className="px-2.5 py-0.5 text-[11px] font-medium text-white bg-amber-600 hover:bg-amber-500 rounded"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
