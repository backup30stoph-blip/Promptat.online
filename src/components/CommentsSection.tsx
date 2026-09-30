import React, { useState, useEffect, useMemo } from 'react';
import { MessageSquare, Heart, CornerDownRight, Flag, Trash2, ArrowUpDown, Loader2, Send } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { cmsService } from '../services/cmsService';
import { useProtectedAction } from '../hooks/useProtectedAction';

interface Comment {
  id: string;
  content_type: 'prompt' | 'skill' | 'video' | 'blog';
  content_id: string;
  user_id: string;
  parent_id: string | null;
  body: string;
  likes: number;
  is_flagged: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  profiles?: {
    username: string | null;
    avatar_url: string | null;
  } | null;
}

interface CommentsSectionProps {
  contentType: 'prompt' | 'skill' | 'video' | 'blog';
  contentId: string;
  onCommentsCountChange?: (count: number) => void;
}

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch (e) {
    return 'Recently';
  }
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({
  contentType,
  contentId,
  onCommentsCountChange,
}) => {
  const { user, profile, isAdmin, showNotification } = useApp();
  
  // App States
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newCommentBody, setNewCommentBody] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'likes'>('newest');
  
  // Thread expanded states (id -> boolean)
  const [expandedThreads, setExpandedThreads] = useState<Record<string, boolean>>({});
  
  const { ensureAuth: protectedAction } = useProtectedAction();

  // Load comments
  const loadComments = async () => {
    setLoading(true);
    const { data, error } = await cmsService.getComments(contentType, contentId);
    if (!error && data) {
      setComments(data);
      if (onCommentsCountChange) {
        onCommentsCountChange(data.filter(c => !c.is_deleted).length);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadComments();
  }, [contentType, contentId]);

  // Auth Protection Guard
  const ensureAuth = (): boolean => {
    return protectedAction(() => {}, {
      message: 'Please authenticate to interact with the community.',
    });
  };

  // Submit comment
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ensureAuth()) return;
    
    const bodyText = newCommentBody.trim();
    if (!bodyText) return;
    if (bodyText.length > 2000) {
      showNotification('Comments cannot exceed 2000 characters.', 'error');
      return;
    }

    setSubmitting(true);
    const { data, error } = await cmsService.createComment(
      contentType,
      contentId,
      user.id,
      bodyText,
      null, // parent_id
      profile ? { username: profile.username || 'Creator', avatar_url: profile.avatar_url || '' } : undefined
    );

    if (!error && data) {
      setComments(prev => [...prev, data]);
      setNewCommentBody('');
      showNotification('Comment submitted successfully!', 'success');
      if (onCommentsCountChange) {
        onCommentsCountChange(comments.length + 1);
      }
    } else {
      showNotification('Could not submit comment.', 'error');
    }
    setSubmitting(false);
  };

  // Submit Reply
  const handleReplySubmit = async (parentId: string) => {
    if (!ensureAuth()) return;

    const bodyText = replyBody.trim();
    if (!bodyText) return;
    if (bodyText.length > 2000) {
      showNotification('Replies cannot exceed 2000 characters.', 'error');
      return;
    }

    setSubmitting(true);
    // Enforce one-level of reply nesting: reply-to-a-reply gets attached to top-level parent
    const parentComment = comments.find(c => c.id === parentId);
    const actualParentId = parentComment?.parent_id || parentId;

    const { data, error } = await cmsService.createComment(
      contentType,
      contentId,
      user.id,
      bodyText,
      actualParentId,
      profile ? { username: profile.username || 'Creator', avatar_url: profile.avatar_url || '' } : undefined
    );

    if (!error && data) {
      setComments(prev => [...prev, data]);
      setReplyBody('');
      setReplyingToId(null);
      showNotification('Reply submitted!', 'success');
      
      // Auto-expand thread
      setExpandedThreads(prev => ({ ...prev, [actualParentId]: true }));
      
      if (onCommentsCountChange) {
        onCommentsCountChange(comments.length + 1);
      }
    } else {
      showNotification('Could not submit reply.', 'error');
    }
    setSubmitting(false);
  };

  // Like comment
  const handleLikeClick = async (commentId: string) => {
    if (!ensureAuth()) return;

    const { data, error } = await cmsService.toggleLikeComment(
      commentId,
      user.id,
      contentType,
      contentId
    );

    if (!error && data) {
      setComments(prev => prev.map(c => 
        c.id === commentId ? { ...c, likes: data.likesCount } : c
      ));
      // Save local like state visually
      localStorage.setItem(`liked_comment_${user.id}_${commentId}`, data.liked ? 'true' : 'false');
    }
  };

  const isLikedLocally = (commentId: string) => {
    if (!user) return false;
    return localStorage.getItem(`liked_comment_${user.id}_${commentId}`) === 'true';
  };

  // Flag comment
  const handleFlagClick = async (commentId: string) => {
    const confirmed = window.confirm('Flag this comment as inappropriate or spam for admin review?');
    if (!confirmed) return;

    const { error } = await cmsService.flagComment(commentId, contentType, contentId);
    if (!error) {
      setComments(prev => prev.map(c => 
        c.id === commentId ? { ...c, is_flagged: true } : c
      ));
      showNotification('Comment flagged. Admin has been notified.', 'success');
    }
  };

  // Soft delete comment
  const handleDeleteClick = async (commentId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete your comment? This cannot be undone.');
    if (!confirmed) return;

    const { error } = await cmsService.softDeleteComment(commentId, contentType, contentId);
    if (!error) {
      setComments(prev => prev.map(c => 
        c.id === commentId ? { ...c, is_deleted: true, body: '[deleted]' } : c
      ));
      showNotification('Comment deleted successfully.', 'success');
    }
  };

  // Organise top-level comments and replies
  const threadedComments = useMemo(() => {
    const topLevel = comments.filter(c => c.parent_id === null);
    const repliesMap: Record<string, Comment[]> = {};
    
    comments.forEach(c => {
      if (c.parent_id) {
        if (!repliesMap[c.parent_id]) {
          repliesMap[c.parent_id] = [];
        }
        repliesMap[c.parent_id].push(c);
      }
    });

    // Sort replies always chronologically
    Object.keys(repliesMap).forEach(parentId => {
      repliesMap[parentId].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    });

    // Sort top-level comments per user toggle
    const sortedTopLevel = [...topLevel].sort((a, b) => {
      if (sortBy === 'likes') {
        return b.likes - a.likes;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return sortedTopLevel.map(c => ({
      ...c,
      replies: repliesMap[c.id] || []
    }));
  }, [comments, sortBy]);

  const totalCount = useMemo(() => {
    return comments.filter(c => !c.is_deleted).length;
  }, [comments]);

  return (
    <div className="space-y-6">
      {/* Header & Sort Control */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5 text-indigo-500" />
          <h3 className="font-display text-md sm:text-lg font-bold text-slate-900">
            Discussion ({totalCount})
          </h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
            Sort by:
          </span>
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5">
            <button
              onClick={() => setSortBy('newest')}
              className={`rounded-md px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide cursor-pointer transition-colors ${
                sortBy === 'newest' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Newest
            </button>
            <button
              onClick={() => setSortBy('likes')}
              className={`rounded-md px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide cursor-pointer transition-colors ${
                sortBy === 'likes' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Popular
            </button>
          </div>
        </div>
      </div>

      {/* Main Form Box */}
      <form onSubmit={handleCommentSubmit} className="space-y-2.5">
        <div className="relative rounded-xl border border-slate-200 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 bg-white transition-all overflow-hidden">
          <textarea
            rows={3}
            value={newCommentBody}
            onChange={(e) => setNewCommentBody(e.target.value.slice(0, 2000))}
            onFocus={() => { if (!user) ensureAuth(); }}
            placeholder={user ? "Join the discussion... share tips, results, or questions" : "Click to sign in and share your insights..."}
            className="w-full resize-none border-0 p-4 text-xs bg-transparent outline-none focus:ring-0 text-slate-800 leading-relaxed placeholder-slate-400"
          />
          
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-4 py-2.5">
            <span className={`text-[10px] font-semibold ${newCommentBody.length > 1900 ? 'text-amber-500 font-bold' : 'text-slate-400'}`}>
              {newCommentBody.length} / 2000 chars
            </span>
            <button
              type="submit"
              disabled={submitting || !newCommentBody.trim()}
              className="inline-flex items-center justify-center space-x-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:bg-slate-200 disabled:cursor-not-allowed text-white text-xs font-bold px-4 py-1.5 shadow-sm transition-all cursor-pointer"
            >
              {submitting ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Send className="h-3 w-3" />
              )}
              <span>Comment</span>
            </button>
          </div>
        </div>
      </form>

      {/* Comments List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
          <p className="text-xs text-slate-500 font-semibold">Retrieving thread conversations...</p>
        </div>
      ) : threadedComments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center">
          <p className="text-xs font-semibold text-slate-400">No comments yet. Be the first to start the conversation!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {threadedComments.map(comment => {
            const hasReplies = comment.replies.length > 0;
            const isThreadExpanded = expandedThreads[comment.id] !== false; // expanded by default or if collapsed thread
            const visibleReplies = isThreadExpanded ? comment.replies : comment.replies.slice(0, 3);
            const needsCollapse = comment.replies.length > 3;

            return (
              <div key={comment.id} className="group space-y-4 border-b border-slate-100/60 pb-5 last:border-0 last:pb-0">
                {/* Top Level Comment Row */}
                <div className="flex items-start space-x-3.5">
                  {/* Avatar */}
                  <img
                    src={comment.profiles?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                    alt="User profile"
                    referrerPolicy="no-referrer"
                    className="h-8 w-8 rounded-full border border-slate-100 object-cover shrink-0"
                  />
                  
                  {/* Body Content */}
                  <div className="flex-1 space-y-1 bg-white rounded-xl border border-slate-100 p-3.5 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-bold text-slate-800">
                          {comment.profiles?.username || 'GemiCreator'}
                        </span>
                        {comment.user_id === 'u-admin' && (
                          <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-indigo-600">
                            Admin
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {formatRelativeTime(comment.created_at)}
                      </span>
                    </div>

                    <p className={`text-xs text-slate-700 leading-relaxed whitespace-pre-wrap ${comment.is_deleted ? 'italic text-slate-400' : ''}`}>
                      {comment.is_deleted ? '[deleted]' : comment.body}
                    </p>

                    {/* Actions Panel */}
                    {!comment.is_deleted && (
                      <div className="flex items-center space-x-4 pt-2.5 text-[10px] text-slate-400 font-bold select-none">
                        {/* Like Button */}
                        <button
                          onClick={() => handleLikeClick(comment.id)}
                          className={`flex items-center space-x-1 hover:text-rose-500 transition-colors cursor-pointer ${
                            isLikedLocally(comment.id) ? 'text-rose-500 font-extrabold' : ''
                          }`}
                        >
                          <Heart className={`h-3 w-3 ${isLikedLocally(comment.id) ? 'fill-rose-500' : ''}`} />
                          <span>{comment.likes}</span>
                        </button>

                        {/* Reply Button */}
                        <button
                          onClick={() => {
                            if (ensureAuth()) {
                              setReplyingToId(comment.id);
                              setReplyBody('');
                            }
                          }}
                          className="hover:text-slate-800 transition-colors cursor-pointer"
                        >
                          Reply
                        </button>

                        {/* Flag Action */}
                        {!comment.is_flagged && (
                          <button
                            onClick={() => handleFlagClick(comment.id)}
                            className="hover:text-rose-500 hover:opacity-100 transition-colors opacity-60 cursor-pointer flex items-center space-x-0.5"
                          >
                            <Flag className="h-2.5 w-2.5" />
                            <span>Flag</span>
                          </button>
                        )}

                        {/* Flagged Status */}
                        {comment.is_flagged && (
                          <span className="text-amber-500 italic font-semibold">
                            Pending review
                          </span>
                        )}

                        {/* Owner/Admin Delete */}
                        {(user?.id === comment.user_id || isAdmin) && (
                          <button
                            onClick={() => handleDeleteClick(comment.id)}
                            className="hover:text-red-600 hover:opacity-100 transition-colors opacity-60 ml-auto cursor-pointer flex items-center space-x-0.5 font-semibold text-slate-500"
                          >
                            <Trash2 className="h-2.5 w-2.5" />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Inline nested reply textarea */}
                {replyingToId === comment.id && (
                  <div className="pl-12 space-y-2">
                    <div className="relative rounded-xl border border-slate-200 focus-within:border-indigo-500 bg-white overflow-hidden">
                      <textarea
                        rows={2}
                        value={replyBody}
                        onChange={(e) => setReplyBody(e.target.value.slice(0, 2000))}
                        placeholder={`Replying to @${comment.profiles?.username || 'GemiCreator'}...`}
                        className="w-full resize-none border-0 p-3 text-xs bg-transparent outline-none focus:ring-0 text-slate-800"
                      />
                      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-3 py-1.5">
                        <span className="text-[9px] text-slate-400">
                          {replyBody.length} / 2000 chars
                        </span>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => setReplyingToId(null)}
                            className="rounded-lg px-2.5 py-1 text-[10px] font-bold text-slate-400 hover:bg-slate-100 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReplySubmit(comment.id)}
                            disabled={submitting || !replyBody.trim()}
                            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-[10px] font-bold px-3 py-1 shadow-sm cursor-pointer"
                          >
                            {submitting ? 'Sending...' : 'Reply'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Nested Indented Replies Block */}
                {hasReplies && (
                  <div className="pl-12 space-y-3">
                    {visibleReplies.map(reply => (
                      <div key={reply.id} className="flex items-start space-x-3 border-l-2 border-slate-100 pl-4.5 py-1">
                        {/* Avatar */}
                        <img
                          src={reply.profiles?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                          alt="Reply user profile"
                          referrerPolicy="no-referrer"
                          className="h-6 w-6 rounded-full border border-slate-100 object-cover shrink-0 mt-0.5"
                        />
                        
                        {/* Reply Body Content */}
                        <div className="flex-1 space-y-1 bg-slate-50/60 rounded-xl border border-slate-100/80 p-3">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-0.5">
                            <div className="flex items-center space-x-1.5">
                              <span className="text-xs font-bold text-slate-800">
                                {reply.profiles?.username || 'GemiCreator'}
                              </span>
                              {reply.user_id === 'u-admin' && (
                                <span className="rounded bg-indigo-50 px-1 py-0.5 text-[7px] font-black uppercase tracking-wider text-indigo-600">
                                  Admin
                                </span>
                              )}
                            </div>
                            <span className="text-[9px] text-slate-400 font-medium">
                              {formatRelativeTime(reply.created_at)}
                            </span>
                          </div>

                          <p className={`text-xs text-slate-600 leading-relaxed whitespace-pre-wrap ${reply.is_deleted ? 'italic text-slate-400' : ''}`}>
                            {reply.is_deleted ? '[deleted]' : reply.body}
                          </p>

                          {/* Reply Actions */}
                          {!reply.is_deleted && (
                            <div className="flex items-center space-x-4 pt-1.5 text-[9px] text-slate-400 font-bold select-none">
                              {/* Like reply */}
                              <button
                                onClick={() => handleLikeClick(reply.id)}
                                className={`flex items-center space-x-0.5 hover:text-rose-500 transition-colors cursor-pointer ${
                                  isLikedLocally(reply.id) ? 'text-rose-500' : ''
                                }`}
                              >
                                <Heart className={`h-2.5 w-2.5 ${isLikedLocally(reply.id) ? 'fill-rose-500' : ''}`} />
                                <span>{reply.likes}</span>
                              </button>

                              {/* Flag action */}
                              {!reply.is_flagged && (
                                <button
                                  onClick={() => handleFlagClick(reply.id)}
                                  className="hover:text-rose-500 opacity-60 hover:opacity-100 transition-colors cursor-pointer"
                                >
                                  Flag
                                </button>
                              )}

                              {reply.is_flagged && (
                                <span className="text-amber-500 italic">
                                  Pending review
                                </span>
                              )}

                              {/* Owner Delete */}
                              {(user?.id === reply.user_id || isAdmin) && (
                                <button
                                  onClick={() => handleDeleteClick(reply.id)}
                                  className="hover:text-red-600 opacity-60 hover:opacity-100 transition-colors ml-auto cursor-pointer flex items-center space-x-0.5"
                                >
                                  <Trash2 className="h-2.5 w-2.5" />
                                  <span>Delete</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Expand/Collapse Trigger */}
                    {needsCollapse && (
                      <button
                        onClick={() => setExpandedThreads(prev => ({ ...prev, [comment.id]: !isThreadExpanded }))}
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 hover:underline pl-10 pt-1 cursor-pointer flex items-center space-x-1"
                      >
                        <CornerDownRight className="h-3 w-3 shrink-0" />
                        <span>
                          {isThreadExpanded 
                            ? 'Collapse thread' 
                            : `Show ${comment.replies.length - 3} more replies`
                          }
                        </span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
