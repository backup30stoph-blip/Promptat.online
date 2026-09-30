import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { supabase } from '../services/supabase/client';
import { PromptCard } from '../components/cards/PromptCard';
import { SkillCard } from '../components/cards/SkillCard';
import { VideoCard } from '../components/cards/VideoCard';
import { Loader2, User, Calendar, FolderHeart, ShieldCheck, Heart, Sparkles, AlertCircle, Info, ExternalLink, Globe, Lock, Plus } from 'lucide-react';
import { UserCollection } from '../types';

export const PublicProfile: React.FC = () => {
  const { activeDetail, user, state, prompts, skills, videos, navigateTo, toggleCollectionVisibility, createCollection, showNotification } = useApp();
  const username = activeDetail?.slug;

  const [targetProfile, setTargetProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);

  // States for creating a collection
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [newColTitle, setNewColTitle] = useState('');
  const [newColDesc, setNewColDesc] = useState('');

  // Load public profile
  useEffect(() => {
    if (!username) return;
    
    const fetchProfileData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchErr } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url, bio, created_at, role')
          .eq('username', username.trim().toLowerCase())
          .maybeSingle();

        if (fetchErr) throw fetchErr;

        if (!data) {
          setError('Creator profile not found. The username might be incorrect or has been modified.');
        } else {
          setTargetProfile(data);
        }
      } catch (err: any) {
        console.error('[PublicProfile] Load error:', err);
        setError(err.message || 'An error occurred while loading this creator profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [username]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <p className="text-xs text-slate-500 mt-3 font-semibold uppercase tracking-wider">
          Resolving Creator Profile...
        </p>
      </div>
    );
  }

  if (error || !targetProfile) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-md">
          <AlertCircle className="mx-auto h-12 w-12 text-rose-500" />
          <h2 className="font-display text-xl font-black text-slate-900 mt-4">Creator Not Found</h2>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            {error || 'This creator profile is unavailable or the link is stale.'}
          </p>
          <button
            onClick={() => navigateTo('home')}
            className="mt-6 inline-flex items-center space-x-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 text-xs shadow transition-all cursor-pointer"
          >
            Return to Feed
          </button>
        </div>
      </div>
    );
  }

  const isOwnProfile = user?.id === targetProfile.id;

  const [dbCollections, setDbCollections] = useState<UserCollection[]>([]);
  const [isLoadingCollections, setIsLoadingCollections] = useState(false);

  // Load public collections for other profiles
  useEffect(() => {
    if (!targetProfile?.id) return;
    
    const loadPublicCollections = async () => {
      setIsLoadingCollections(true);
      try {
        const { data, error } = await supabase
          .from('user_collections')
          .select('*')
          .eq('user_id', targetProfile.id)
          .eq('is_public', true);
        
        if (!error && data) {
          const formatted: UserCollection[] = data.map((col: any) => ({
            id: col.id,
            title: col.title,
            description: col.description || '',
            itemIds: col.item_ids || { prompts: [], skills: [], videos: [] },
            created_at: col.created_at,
            is_custom: true,
            is_public: col.is_public
          }));
          setDbCollections(formatted);
        }
      } catch (err) {
        console.error('Error fetching public collections:', err);
      } finally {
        setIsLoadingCollections(false);
      }
    };
    
    if (!isOwnProfile) {
      loadPublicCollections();
    }
  }, [targetProfile?.id, isOwnProfile]);

  const userCollections = isOwnProfile ? state.collections : dbCollections;
  const selectedCollection = userCollections.find(c => c.id === selectedCollectionId);

  // Resolve collection items
  const getCollectionItems = (col: UserCollection) => {
    const resolvedPrompts = (col.itemIds?.prompts || []).map(id => prompts.find(p => p.id === id)).filter(Boolean);
    const resolvedSkills = (col.itemIds?.skills || []).map(id => skills.find(s => s.id === id)).filter(Boolean);
    const resolvedVideos = (col.itemIds?.videos || []).map(id => videos.find(v => v.id === id)).filter(Boolean);

    return [
      ...resolvedPrompts.map(p => ({ type: 'prompt' as const, data: p! })),
      ...resolvedSkills.map(s => ({ type: 'skill' as const, data: s! })),
      ...resolvedVideos.map(v => ({ type: 'video' as const, data: v! }))
    ];
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Profile Header Banner */}
      <div className="relative rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm p-6 sm:p-8 mb-8">
        <div className="absolute top-0 right-0 h-40 w-40 bg-gradient-to-br from-indigo-500/10 via-pink-500/5 to-transparent rounded-full blur-2xl" />
        
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <div className="h-20 w-20 rounded-2xl border border-slate-200 p-0.5 shadow-inner bg-slate-50 flex items-center justify-center shrink-0 overflow-hidden">
              {targetProfile.avatar_url ? (
                <img
                  src={targetProfile.avatar_url}
                  alt={targetProfile.full_name}
                  className="h-full w-full object-cover rounded-xl"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User className="h-9 w-9 text-slate-400" />
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="font-display text-2xl font-black text-slate-900 tracking-tight">
                  {targetProfile.full_name || 'Creator Guest'}
                </h1>
                {targetProfile.role === 'admin' && (
                  <span className="inline-flex items-center space-x-1 rounded-md bg-amber-400/20 border border-amber-300/40 px-2 py-0.5 text-[10px] font-black text-amber-600 uppercase tracking-wider">
                    <ShieldCheck className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span>Admin</span>
                  </span>
                )}
              </div>
              <p className="text-xs font-mono text-slate-500">@{targetProfile.username}</p>
              
              <div className="flex items-center justify-center sm:justify-start space-x-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <Calendar className="h-3.5 w-3.5" />
                <span>Joined {new Date(targetProfile.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}</span>
              </div>
            </div>
          </div>

          {isOwnProfile && (
            <button
              onClick={() => navigateTo('account')}
              className="w-full sm:w-auto rounded-xl bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 font-bold px-5 py-2.5 text-xs shadow-sm transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              Edit Account Settings
            </button>
          )}
        </div>

        {targetProfile.bio && (
          <div className="mt-6 pt-6 border-t border-slate-100 max-w-3xl">
            <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Creator Bio</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {targetProfile.bio}
            </p>
          </div>
        )}
      </div>

      {/* Profile Collections Section */}
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-lg font-black text-slate-900 flex items-center space-x-2.5">
            <FolderHeart className="h-5 w-5 text-rose-500" />
            <span>Curated Collections</span>
          </h2>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold mt-1">
            Personal custom-made mixes of prompts, skills, and viral video blueprints
          </p>
        </div>

        {isLoadingCollections ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          </div>
        ) : userCollections.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center max-w-xl mx-auto">
            <FolderHeart className="mx-auto h-10 w-10 text-slate-300" />
            <h3 className="text-sm font-bold text-slate-800 mt-4">
              {isOwnProfile ? "No Curated Boards Yet" : "No Curated Collections"}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
              {isOwnProfile 
                ? 'يمكنك تنظيم وجمع أوامر الذكاء الاصطناعي، مخططات الفيديو، والمهارات في مجموعات خاصة. اضغط على "حفظ في المجموعة" من أي بطاقة في برومبتات أونلاين البدء!'
                : `${targetProfile.full_name || 'This creator'} hasn't made any curated collections public on their profile yet.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Left Side: Collections List */}
            <div className="md:col-span-1 space-y-3">
              {isCreatingCollection ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 mb-2">
                  <h4 className="font-bold text-slate-800 text-xs">New Collection</h4>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Title (e.g. Midjourney Styles)"
                      value={newColTitle}
                      onChange={(e) => setNewColTitle(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white focus:outline-indigo-500"
                    />
                    <textarea
                      placeholder="Description (optional)"
                      value={newColDesc}
                      onChange={(e) => setNewColDesc(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white focus:outline-indigo-500 min-h-[60px]"
                    />
                  </div>
                  <div className="flex items-center space-x-2 justify-end">
                    <button
                      onClick={() => {
                        setIsCreatingCollection(false);
                        setNewColTitle('');
                        setNewColDesc('');
                      }}
                      className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 font-bold text-[10px]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (!newColTitle.trim()) {
                          showNotification('Please enter a collection title', 'error');
                          return;
                        }
                        createCollection(newColTitle.trim(), newColDesc.trim());
                        setIsCreatingCollection(false);
                        setNewColTitle('');
                        setNewColDesc('');
                      }}
                      className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px]"
                    >
                      Create
                    </button>
                  </div>
                </div>
              ) : (
                isOwnProfile && (
                  <button
                    onClick={() => setIsCreatingCollection(true)}
                    className="w-full flex items-center justify-center space-x-1.5 p-3 rounded-xl border border-dashed border-indigo-300 hover:border-indigo-400 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 font-bold text-xs transition-colors cursor-pointer mb-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create New Collection</span>
                  </button>
                )
              )}

              {userCollections.map((col) => {
                const itemCount = (col.itemIds?.prompts?.length || 0) + 
                                  (col.itemIds?.skills?.length || 0) + 
                                  (col.itemIds?.videos?.length || 0);

                const isActive = selectedCollectionId === col.id;

                return (
                  <button
                    key={col.id}
                    onClick={() => setSelectedCollectionId(isActive ? null : col.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all text-xs cursor-pointer block ${
                      isActive 
                        ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm' 
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <h4 className="font-bold truncate">{col.title}</h4>
                    <p className={`text-[10px] mt-1 ${isActive ? 'text-indigo-200' : 'text-slate-400'}`}>
                      {itemCount} Curated {itemCount === 1 ? 'item' : 'items'}
                    </p>

                    {isOwnProfile && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100/20 flex items-center justify-between gap-1">
                        <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                          col.is_public
                            ? isActive ? 'bg-indigo-500 text-white' : 'bg-emerald-100 text-emerald-800'
                            : isActive ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {col.is_public ? (
                            <>
                              <Globe className="h-2.5 w-2.5 mr-0.5" />
                              <span>Public</span>
                            </>
                          ) : (
                            <>
                              <Lock className="h-2.5 w-2.5 mr-0.5" />
                              <span>Private</span>
                            </>
                          )}
                        </span>

                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCollectionVisibility(col.id);
                          }}
                          className={`px-2 py-0.5 rounded text-[9px] font-bold border cursor-pointer select-none transition-colors ${
                            isActive
                              ? 'bg-white text-indigo-700 hover:bg-indigo-50 border-white'
                              : col.is_public
                                ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {col.is_public ? 'Make Private' : 'Make Public'}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right Side: Active Collection Details */}
            <div className="md:col-span-3">
              {selectedCollection ? (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="font-display text-base font-black text-slate-900">{selectedCollection.title}</h3>
                      {isOwnProfile && (
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          selectedCollection.is_public
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-50 text-slate-600 border border-slate-200'
                        }`}>
                          {selectedCollection.is_public ? (
                            <>
                              <Globe className="h-3 w-3 mr-1" />
                              <span>Public (Visible on Profile)</span>
                            </>
                          ) : (
                            <>
                              <Lock className="h-3 w-3 mr-1" />
                              <span>Private (Only you can see)</span>
                            </>
                          )}
                        </span>
                      )}
                    </div>
                    {selectedCollection.description && (
                      <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed font-medium">
                        {selectedCollection.description}
                      </p>
                    )}
                  </div>

                  {getCollectionItems(selectedCollection).length === 0 ? (
                    <div className="flex flex-col items-center justify-center border border-dashed border-slate-200 bg-white rounded-2xl p-12 text-center">
                      <Sparkles className="h-8 w-8 text-indigo-400" />
                      <p className="text-xs text-slate-500 font-bold mt-3">This collection is empty.</p>
                      {isOwnProfile && (
                        <p className="text-[10px] text-slate-400 mt-1">Start saving prompts, skills, or videos to this collection to populate it.</p>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {getCollectionItems(selectedCollection).map((item, idx) => {
                        const key = `${item.type}-${item.data.id}-${idx}`;
                        if (item.type === 'prompt') {
                          return <PromptCard key={key} prompt={item.data as any} />;
                        } else if (item.type === 'skill') {
                          return <SkillCard key={key} skill={item.data as any} />;
                        } else if (item.type === 'video') {
                          return <VideoCard key={key} video={item.data as any} />;
                        }
                        return null;
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center border border-dashed border-slate-200 bg-white rounded-2xl p-12 text-center h-full min-h-[250px]">
                  <FolderHeart className="h-8 w-8 text-indigo-500/40" />
                  <p className="text-xs text-slate-500 font-bold mt-3">Select a collection on the left to browse curated blueprints.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
