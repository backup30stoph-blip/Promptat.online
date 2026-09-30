import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { supabase } from '../services/supabase/client';
import { MediaUploader } from '../components/admin/MediaUploader';
import { PromptCard } from '../components/cards/PromptCard';
import { BlogCard } from '../components/cards/BlogCard';
import { SkillCard } from '../components/cards/SkillCard';
import { 
  Loader2, ShieldAlert, CheckCircle, XCircle, Save, Trash2, Mail, User, Info, FileText,
  Bookmark, Compass, BookOpen, Terminal, ArrowRight
} from 'lucide-react';

export const AccountSettings: React.FC = () => {
  const { 
    user, 
    profile, 
    prompts, 
    blogs, 
    skills, 
    videos, 
    refreshData, 
    navigateTo, 
    showNotification, 
    setIsAuthModalOpen 
  } = useApp();
  
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameUnique, setIsUsernameUnique] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Section layout state (Profile vs Favorites)
  const [activeSection, setActiveSection] = useState<'profile' | 'favorites'>('profile');
  const [favorites, setFavorites] = useState<{ id: string; item_type: string; item_id: string }[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [favoriteTab, setFavoriteTab] = useState<'all' | 'prompt' | 'blog' | 'skill'>('all');

  // Delete Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Fetch Favorites directly from Supabase
  const fetchFavorites = async () => {
    if (!user) return;
    setLoadingFavorites(true);
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('*')
        .eq('user_id', user.id);
      
      if (!error && data) {
        setFavorites(data);
      }
    } catch (err) {
      console.error('[AccountSettings] Error fetching favorites:', err);
    } finally {
      setLoadingFavorites(false);
    }
  };

  // Sync favorites when user loads or when the activeSection changes to 'favorites'
  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user, activeSection]);

  // Load current values on profile change
  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '');
      setFullName(profile.full_name || '');
      setBio(profile.bio || '');
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile]);

  // Handle Username Uniqueness live validation
  useEffect(() => {
    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername || (profile && cleanUsername === profile.username)) {
      setIsUsernameUnique(true);
      setIsCheckingUsername(false);
      return;
    }

    setIsCheckingUsername(true);
    const debounceTimer = setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', cleanUsername)
          .maybeSingle();
        
        if (!error) {
          setIsUsernameUnique(!data); // Unique if no matching row found
        } else {
          setIsUsernameUnique(true);
        }
      } catch (err) {
        console.error('[AccountSettings] Error checking uniqueness:', err);
        setIsUsernameUnique(true);
      } finally {
        setIsCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [username, profile]);

  if (!user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
        <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
          <ShieldAlert className="mx-auto h-12 w-12 text-rose-500" />
          <h2 className="font-display text-xl font-bold text-slate-900 mt-4">Authorization Required</h2>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Please log in or register to access and modify your creator workspace.
          </p>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="w-full mt-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 text-xs shadow-md transition-all cursor-pointer"
          >
            Authenticate Session
          </button>
        </div>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      showNotification('Username cannot be empty', 'error');
      return;
    }
    if (!isUsernameUnique) {
      showNotification('Username is already taken', 'error');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: username.trim().toLowerCase(),
          full_name: fullName.trim(),
          bio: bio.trim(),
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      showNotification('Profile updated successfully!', 'success');
      await refreshData();
    } catch (err: any) {
      console.error('[AccountSettings] Save error:', err);
      showNotification(err.message || 'Could not update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmText !== 'DELETE') {
      showNotification('Confirmation text does not match', 'error');
      return;
    }

    setDeleting(true);
    try {
      // Delete user's profile and auth row using security definer rpc function
      const { error } = await supabase.rpc('delete_own_user_auth');
      if (error) throw error;

      // Force sign out on client side
      await supabase.auth.signOut();
      
      showNotification('Your account has been deleted permanently.', 'success');
      setShowDeleteModal(false);
      // Wait and navigate to home
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    } catch (err: any) {
      console.warn('[AccountSettings] RPC deletion failed, executing client-side fallback:', err.message);
      try {
        // Fallback: Delete profile directly and sign out
        await supabase.from('profiles').delete().eq('id', user.id);
        await supabase.auth.signOut();
        showNotification('Your profile was deleted successfully.', 'success');
        window.location.href = '/';
      } catch (fallbackErr: any) {
        showNotification(err.message || 'Failed to delete account', 'error');
      }
    } finally {
      setDeleting(false);
    }
  };

  // Extract linked identities
  const linkedIdentities = user.app_metadata?.providers || 
    user.identities?.map((identity: any) => identity.provider) || 
    ['email'];

  // Resolve actual records based on item IDs
  const favoritedPrompts = useMemo(() => {
    return prompts.filter(p => favorites.some(f => f.item_type === 'prompt' && f.item_id === p.id));
  }, [prompts, favorites]);

  const favoritedBlogs = useMemo(() => {
    return blogs.filter(b => favorites.some(f => f.item_type === 'blog' && f.item_id === b.id));
  }, [blogs, favorites]);

  const favoritedSkills = useMemo(() => {
    return skills.filter(s => favorites.some(f => f.item_type === 'skill' && f.item_id === s.id));
  }, [skills, favorites]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Title block */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-black text-slate-900 tracking-tight">Account Settings</h1>
        <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-extrabold text-indigo-500">
          Manage your creator profile and credentials
        </p>
      </div>

      {/* Sub-tabs for Account Settings */}
      <div className="flex space-x-1 border-b border-slate-200 mb-8">
        <button
          onClick={() => setActiveSection('profile')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeSection === 'profile'
              ? 'border-indigo-600 text-indigo-600 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="h-4 w-4" />
          <span>Edit Profile</span>
        </button>
        <button
          onClick={() => setActiveSection('favorites')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeSection === 'favorites'
              ? 'border-indigo-600 text-indigo-600 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bookmark className={`h-4 w-4 ${favorites.length > 0 ? 'fill-red-500 stroke-red-500' : ''}`} />
          <span>Saved Favorites ({favorites.length})</span>
        </button>
      </div>

      {activeSection === 'profile' ? (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Left column: Avatar modification */}
        <div className="md:col-span-1 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-center">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4">Creator Identity</h3>
            
            <div className="relative mx-auto h-24 w-24 rounded-full overflow-hidden border-2 border-indigo-500/10 mb-4 bg-slate-50 flex items-center justify-center">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={fullName || 'Avatar'}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User className="h-10 w-10 text-slate-400" />
              )}
            </div>

            <h4 className="text-sm font-bold text-slate-800 truncate">{fullName || 'Creator Guest'}</h4>
            <p className="text-[10px] text-slate-400 font-mono mt-1">@{username || 'username'}</p>

            <div className="mt-6">
              <MediaUploader
                bucketName="avatars"
                currentValue={avatarUrl}
                onUploadSuccess={(url) => {
                  setAvatarUrl(url);
                  showNotification('Avatar uploaded. Save changes to commit!', 'info');
                }}
              />
            </div>
          </div>

          {/* Read-Only metadata stats card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4">Credentials & Security</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Primary Email</label>
                <div className="mt-1 flex items-center space-x-2 text-xs font-semibold text-slate-700">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span>{user.email || 'Not provided'}</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Linked Identity Providers</label>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {linkedIdentities.map((provider: string) => {
                    let iconClass = 'fa-solid fa-envelope';
                    let bgColor = 'bg-slate-100 text-slate-700';
                    let label = provider;

                    if (provider === 'google') {
                      iconClass = 'fa-brands fa-google';
                      bgColor = 'bg-red-50 text-red-600 border border-red-100';
                      label = 'Google';
                    } else if (provider === 'facebook') {
                      iconClass = 'fa-brands fa-facebook-f';
                      bgColor = 'bg-blue-50 text-blue-600 border border-blue-100';
                      label = 'Facebook';
                    } else if (provider === 'github') {
                      iconClass = 'fa-brands fa-github';
                      bgColor = 'bg-slate-900 text-white border border-slate-950';
                      label = 'GitHub';
                    } else if (provider === 'email') {
                      iconClass = 'fa-solid fa-envelope';
                      bgColor = 'bg-indigo-50 text-indigo-600 border border-indigo-100';
                      label = 'Email Auth';
                    }

                    return (
                      <span
                        key={provider}
                        className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${bgColor}`}
                      >
                        <i className={iconClass}></i>
                        <span>{label}</span>
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-medium text-slate-400">
                <span>Account Created:</span>
                <span>{new Date(user.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Edit details form */}
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center space-x-2">
              <FileText className="h-4 w-4 text-indigo-500" />
              <span>Modify Workspace Profile</span>
            </h3>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Unique Username
                </label>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-xs text-slate-400 font-bold">@</span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. prompt_wizard"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                    className="w-full rounded-xl border border-slate-200 pl-8 pr-10 py-2.5 text-xs font-semibold focus:border-indigo-500 focus:outline-none"
                  />
                  
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    {isCheckingUsername ? (
                      <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                    ) : username && (
                      isUsernameUnique ? (
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-rose-500" />
                      )
                    )}
                  </div>
                </div>
                
                {username && !isCheckingUsername && (
                  <p className={`mt-1 text-[10px] font-semibold ${isUsernameUnique ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {isUsernameUnique ? 'Username is available' : 'Username is already taken'}
                  </p>
                )}
                <p className="mt-1 text-[9px] text-slate-400 leading-normal">
                  Alphanumeric and underscores only. This dictates your public profile url.
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Full Display Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jane Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                Short Creator Bio
              </label>
              <textarea
                rows={4}
                maxLength={250}
                placeholder="Share a brief overview of your background, specialties, or prompt curation preferences..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-xs font-semibold focus:border-indigo-500 focus:outline-none leading-relaxed"
              />
              <div className="mt-1 flex justify-between text-[9px] text-slate-400 font-bold">
                <span>Maximum 250 characters</span>
                <span>{bio.length}/250</span>
              </div>
            </div>

            <div className="flex items-center justify-end border-t border-slate-100 pt-5">
              <button
                type="submit"
                disabled={saving || isCheckingUsername || !isUsernameUnique}
                className="flex items-center justify-center space-x-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 text-xs shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Danger Zone */}
          <div className="rounded-2xl border border-red-200 bg-red-50/20 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-red-700 flex items-center space-x-2">
              <ShieldAlert className="h-4 w-4" />
              <span>Danger Zone</span>
            </h3>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="max-w-md">
                <h4 className="text-xs font-black uppercase text-red-800">Permanently Delete Account</h4>
                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                  Deletes your public profile, historical bookmarks, and auth details instantly. This operation is absolutely irreversible and cannot be recovered.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center justify-center space-x-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2.5 text-xs shadow-sm transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete Account</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    ) : (
        /* Favorites dashboard rendering block */
        <div className="space-y-6">
          {/* Sub-tab segment selection */}
          <div className="flex flex-wrap gap-1.5 items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex flex-wrap gap-1 bg-slate-100/70 p-1 rounded-xl border border-slate-200/60">
              <button
                onClick={() => setFavoriteTab('all')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  favoriteTab === 'all'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📂 All Items
              </button>
              <button
                onClick={() => setFavoriteTab('prompt')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  favoriteTab === 'prompt'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ⚡ Prompts ({favoritedPrompts.length})
              </button>
              <button
                onClick={() => setFavoriteTab('blog')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  favoriteTab === 'blog'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📰 Blog Articles ({favoritedBlogs.length})
              </button>
              <button
                onClick={() => setFavoriteTab('skill')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  favoriteTab === 'skill'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ⚙️ Skills ({favoritedSkills.length})
              </button>
            </div>
            
            <button
              onClick={fetchFavorites}
              className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer flex items-center gap-1 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100"
            >
              🔄 Refresh List
            </button>
          </div>

          {loadingFavorites ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400 mx-auto col-span-full" />
            </div>
          ) : (
            <div className="space-y-8">
              {/* SAVED PROMPTS GRID */}
              {(favoriteTab === 'all' || favoriteTab === 'prompt') && (
                <div className="space-y-4">
                  {(favoriteTab === 'all' && favoritedPrompts.length > 0) && (
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 pt-2">
                      <Bookmark className="h-3.5 w-3.5 text-indigo-500 fill-indigo-500" />
                      <span>Saved Prompt Blueprints</span>
                    </h3>
                  )}
                  {favoritedPrompts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {favoritedPrompts.map(prompt => (
                        <PromptCard key={prompt.id} prompt={prompt} />
                      ))}
                    </div>
                  ) : (
                    favoriteTab === 'prompt' && (
                      <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center bg-white">
                        <Bookmark className="mx-auto h-8 w-8 text-slate-300" />
                        <h4 className="mt-4 text-xs font-bold text-slate-800">No saved prompts yet</h4>
                        <p className="mt-1 text-[10px] text-slate-400 max-w-xs mx-auto leading-normal">
                          Bookmarks here make prompt blueprints readily accessible whenever you are compiling images.
                        </p>
                        <button
                          onClick={() => navigateTo('prompts')}
                          className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-[10px] font-bold text-white hover:bg-indigo-700 transition-all cursor-pointer flex items-center gap-1.5 mx-auto"
                        >
                          <Compass className="h-3.5 w-3.5" />
                          <span>Explore Prompts</span>
                        </button>
                      </div>
                    )
                  )}
                </div>
              )}

              {/* SAVED BLOG ARTICLES GRID */}
              {(favoriteTab === 'all' || favoriteTab === 'blog') && (
                <div className="space-y-4 pt-4">
                  {(favoriteTab === 'all' && favoritedBlogs.length > 0) && (
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 pt-2">
                      <BookOpen className="h-3.5 w-3.5 text-indigo-500" />
                      <span>Saved Blog Masterclasses</span>
                    </h3>
                  )}
                  {favoritedBlogs.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {favoritedBlogs.map(article => (
                        <BlogCard key={article.id} article={article} />
                      ))}
                    </div>
                  ) : (
                    favoriteTab === 'blog' && (
                      <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center bg-white">
                        <BookOpen className="mx-auto h-8 w-8 text-slate-300" />
                        <h4 className="mt-4 text-xs font-bold text-slate-800">No saved blog articles yet</h4>
                        <p className="mt-1 text-[10px] text-slate-400 max-w-xs mx-auto leading-normal">
                          Save industry secrets, prompt formulas, and visual style deep dives to refer back to them anytime.
                        </p>
                        <button
                          onClick={() => navigateTo('blog')}
                          className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-[10px] font-bold text-white hover:bg-indigo-700 transition-all cursor-pointer flex items-center gap-1.5 mx-auto"
                        >
                          <Compass className="h-3.5 w-3.5" />
                          <span>Browse Blog</span>
                        </button>
                      </div>
                    )
                  )}
                </div>
              )}

              {/* SAVED SKILLS GRID */}
              {(favoriteTab === 'all' || favoriteTab === 'skill') && (
                <div className="space-y-4 pt-4">
                  {(favoriteTab === 'all' && favoritedSkills.length > 0) && (
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 pt-2">
                      <Terminal className="h-3.5 w-3.5 text-indigo-500" />
                      <span>Saved Developer Skills</span>
                    </h3>
                  )}
                  {favoritedSkills.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {favoritedSkills.map(skill => (
                        <SkillCard key={skill.id} skill={skill} />
                      ))}
                    </div>
                  ) : (
                    favoriteTab === 'skill' && (
                      <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center bg-white">
                        <Terminal className="mx-auto h-8 w-8 text-slate-300" />
                        <h4 className="mt-4 text-xs font-bold text-slate-800">No saved skills yet</h4>
                        <p className="mt-1 text-[10px] text-slate-400 max-w-xs mx-auto leading-normal">
                          Save cursorrules configs, developer templates, and prompt workflows.
                        </p>
                        <button
                          onClick={() => navigateTo('skills')}
                          className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-[10px] font-bold text-white hover:bg-indigo-700 transition-all cursor-pointer flex items-center gap-1.5 mx-auto"
                        >
                          <Compass className="h-3.5 w-3.5" />
                          <span>Discover Skills</span>
                        </button>
                      </div>
                    )
                  )}
                </div>
              )}

              {/* GENERAL EMPTY STATE FOR ALL TAB */}
              {favoriteTab === 'all' && favorites.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 p-16 text-center bg-white shadow-xs">
                  <Bookmark className="mx-auto h-12 w-12 text-slate-300" />
                  <h3 className="mt-4 text-sm font-bold text-slate-900">Your saved library is empty</h3>
                  <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                    Compile a personal, highly customized reference kit of image prompt formulas, developer guides, and articles.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <button
                      onClick={() => navigateTo('prompts')}
                      className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Compass className="h-3.5 w-3.5" />
                      <span>Explore Prompts</span>
                    </button>
                    <button
                      onClick={() => navigateTo('blog')}
                      className="rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold px-4 py-2 text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5 bg-white"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>Browse Blog</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowDeleteModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
          
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-red-200 bg-white p-6 shadow-2xl">
            <h2 className="font-display text-lg font-black text-red-700 flex items-center space-x-2">
              <ShieldAlert className="h-5 w-5" />
              <span>Confirm Permanent Deletion</span>
            </h2>
            
            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              أنت على وشك حذف حسابك في منصة برومبتات أونلاين نهائياً.
              ستفقد جميع المحفوظات والمجموعات والسجلات الخاصة بحسابك.
            </p>

            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-[10px] font-semibold text-red-800 leading-normal">
                To confirm deletion, please type <strong className="font-black text-red-950">DELETE</strong> in the box below.
              </p>
              <input
                type="text"
                placeholder="Type 'DELETE'"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full mt-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold focus:border-red-500 focus:outline-none"
              />
            </div>

            <div className="mt-6 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setConfirmText('');
                }}
                disabled={deleting}
                className="rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting || confirmText !== 'DELETE'}
                className="flex items-center space-x-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete Permanently</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
