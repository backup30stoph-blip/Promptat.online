import React, { useState, useEffect, useCallback } from 'react';
import { X, Bookmark, Sparkles, Cpu, Layout, BookOpen, Trash2, ExternalLink, Copy, Check, User, ShieldCheck, LogIn, Heart } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../services/supabase/client';
import { CATEGORIES } from '../data/categories';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: () => void;
}

interface SavedItem {
  id: string;
  item_type: 'prompt' | 'skill' | 'video' | 'blog';
  item_id: string;
  created_at: string;
  // Resolved object
  data?: any;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  onOpenAuth,
}) => {
  const { user, profile, isAdmin, prompts, skills, videos, blogs, navigateTo, state, toggleBookmark, showNotification } = useApp();
  const [activeTab, setActiveTab] = useState<'all' | 'prompt' | 'skill' | 'video' | 'blog'>('all');
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch favorited items from Supabase or AppContext state
  const loadSavedItems = useCallback(async () => {
    setLoading(true);
    let rawFavorites: Array<{ id: string; item_type: 'prompt' | 'skill' | 'video' | 'blog'; item_id: string; created_at: string }> = [];

    if (user?.id) {
      try {
        const { data, error } = await supabase
          .from('user_favorites')
          .select('id, item_type, item_id, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (!error && data) {
          rawFavorites = data as any;
        }
      } catch (err) {
        console.warn('Could not fetch user_favorites from DB, falling back to local state:', err);
      }
    }

    // Merge/Fallback with local bookmarks in AppContext state
    const localItems: typeof rawFavorites = [];
    state.bookmarks.prompts.forEach(id => {
      if (!rawFavorites.some(f => f.item_type === 'prompt' && f.item_id === id)) {
        localItems.push({ id: `local-p-${id}`, item_type: 'prompt', item_id: id, created_at: new Date().toISOString() });
      }
    });
    state.bookmarks.skills.forEach(id => {
      if (!rawFavorites.some(f => f.item_type === 'skill' && f.item_id === id)) {
        localItems.push({ id: `local-s-${id}`, item_type: 'skill', item_id: id, created_at: new Date().toISOString() });
      }
    });
    state.bookmarks.videos.forEach(id => {
      if (!rawFavorites.some(f => f.item_type === 'video' && f.item_id === id)) {
        localItems.push({ id: `local-v-${id}`, item_type: 'video', item_id: id, created_at: new Date().toISOString() });
      }
    });

    const combined = [...rawFavorites, ...localItems];

    // Resolve details for each saved item
    const resolved = combined.map(item => {
      let resolvedData = null;
      if (item.item_type === 'prompt') {
        resolvedData = prompts.find(p => p.id === item.item_id || p.slug === item.item_id);
      } else if (item.item_type === 'skill') {
        resolvedData = skills.find(s => s.id === item.item_id || s.slug === item.item_id);
      } else if (item.item_type === 'video') {
        resolvedData = videos.find(v => v.id === item.item_id || v.slug === item.item_id);
      } else if (item.item_type === 'blog') {
        resolvedData = blogs.find(b => b.id === item.item_id || b.slug === item.item_id);
      }
      return {
        ...item,
        data: resolvedData
      };
    }).filter(i => i.data !== null);

    setSavedItems(resolved as SavedItem[]);
    setLoading(false);
  }, [user, prompts, skills, videos, blogs, state.bookmarks]);

  useEffect(() => {
    if (isOpen) {
      loadSavedItems();
    }
  }, [isOpen, loadSavedItems]);

  if (!isOpen) return null;

  const filteredList = savedItems.filter(item => {
    if (activeTab === 'all') return true;
    return item.item_type === activeTab;
  });

  const handleRemove = async (item: SavedItem) => {
    if (user?.id) {
      try {
        await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('item_type', item.item_type)
          .eq('item_id', item.item_id);
      } catch (err) {
        console.warn('Error deleting favorite from DB:', err);
      }
    }
    
    // Also update local state
    if (item.item_type === 'prompt' || item.item_type === 'skill' || item.item_type === 'video') {
      const typeKey = item.item_type === 'prompt' ? 'prompts' : item.item_type === 'skill' ? 'skills' : 'videos';
      toggleBookmark(typeKey, item.item_id);
    }
    
    setSavedItems(prev => prev.filter(i => !(i.item_type === item.item_type && i.item_id === item.item_id)));
    showNotification('Removed from collection', 'info');
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showNotification('Copied to clipboard!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleItemClick = (item: SavedItem) => {
    onClose();
    if (item.item_type === 'prompt') navigateTo('prompts', item.data.slug);
    else if (item.item_type === 'skill') navigateTo('skills', item.data.slug);
    else if (item.item_type === 'video') navigateTo('videos', item.data.slug);
    else if (item.item_type === 'blog') navigateTo('blog', item.data.slug);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Profile Banner */}
        <div className="relative bg-gradient-to-r from-slate-900 via-indigo-950 to-[#e21833] p-6 text-white shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white/80 hover:bg-white/20 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="relative h-14 w-14 rounded-2xl bg-white/10 border border-white/20 p-0.5 overflow-hidden shrink-0 shadow-inner flex items-center justify-center">
                {user?.user_metadata?.avatar_url || profile?.avatar_url ? (
                  <img
                    src={user?.user_metadata?.avatar_url || profile?.avatar_url}
                    alt="User Avatar"
                    className="h-full w-full object-cover rounded-xl"
                  />
                ) : (
                  <User className="h-7 w-7 text-white/80" />
                )}
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="font-display text-xl font-black text-white tracking-tight">
                    {profile?.full_name || user?.email?.split('@')[0] || 'Guest Creator'}
                  </h2>
                  {isAdmin && (
                    <span className="inline-flex items-center space-x-1 rounded-md bg-amber-400/20 border border-amber-300/40 px-2 py-0.5 text-[10px] font-black text-amber-300 uppercase">
                      <ShieldCheck className="h-3 w-3" />
                      <span>Admin</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 mt-0.5 font-medium">
                  {user?.email || 'Save items to access them across all your sessions'}
                </p>
              </div>
            </div>

            {!user && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="flex items-center space-x-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-slate-900 shadow-md hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <LogIn className="h-4 w-4 text-[#e21833]" />
                <span>Sign In to Sync</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Filter Navigation */}
        <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-3 flex items-center justify-between shrink-0 overflow-x-auto">
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setActiveTab('all')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Saved ({savedItems.length})
            </button>
            <button
              onClick={() => setActiveTab('prompt')}
              className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'prompt'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Prompts</span>
            </button>
            <button
              onClick={() => setActiveTab('skill')}
              className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'skill'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Cpu className="h-3.5 w-3.5" />
              <span>Skills</span>
            </button>
            <button
              onClick={() => setActiveTab('video')}
              className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'video'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Layout className="h-3.5 w-3.5" />
              <span>Videos</span>
            </button>
            <button
              onClick={() => setActiveTab('blog')}
              className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'blog'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Blogs</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs font-semibold">
              Loading your personal collection...
            </div>
          ) : filteredList.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <Bookmark className="h-6 w-6" />
              </div>
              <h3 className="font-display text-base font-bold text-slate-800">
                No saved items in this collection
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Explore the prompt blueprints, skills, and guides across the platform and click the bookmark icon to save items to your personal library.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredList.map((item) => {
                const itemData = item.data;
                const catObj = CATEGORIES.find(c => c.id === itemData.category_id);
                const isPrompt = item.item_type === 'prompt';
                const isSkill = item.item_type === 'skill';

                return (
                  <div
                    key={`${item.item_type}-${item.item_id}`}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-center space-x-3.5 min-w-0">
                      {/* Thumbnail or Icon */}
                      <div className="h-14 w-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                        {itemData.thumbnail || itemData.cover ? (
                          <img
                            src={itemData.thumbnail || itemData.cover}
                            alt={itemData.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-slate-400">
                            {isPrompt ? <Sparkles className="h-6 w-6" /> : isSkill ? <Cpu className="h-6 w-6" /> : <BookOpen className="h-6 w-6" />}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-black uppercase text-indigo-700">
                            {item.item_type}
                          </span>
                          {catObj && (
                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                              {catObj.title}
                            </span>
                          )}
                        </div>

                        <h4
                          onClick={() => handleItemClick(item)}
                          className="font-display text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors truncate cursor-pointer"
                        >
                          {itemData.title}
                        </h4>

                        <p className="text-xs text-slate-500 line-clamp-1">
                          {itemData.description || itemData.prompt || 'Saved resource'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      {(isPrompt && itemData.prompt) && (
                        <button
                          onClick={() => handleCopyText(itemData.prompt, item.id)}
                          className="flex items-center space-x-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 text-xs font-bold transition-colors cursor-pointer"
                        >
                          {copiedId === item.id ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                              <span className="text-emerald-700">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span>Copy Prompt</span>
                            </>
                          )}
                        </button>
                      )}

                      <button
                        onClick={() => handleItemClick(item)}
                        className="flex items-center space-x-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 text-xs font-bold transition-colors cursor-pointer"
                      >
                        <span>View</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => handleRemove(item)}
                        className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Remove from collection"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 bg-slate-50 p-4 px-6 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Total Saved: <strong>{savedItems.length} items</strong></span>
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
