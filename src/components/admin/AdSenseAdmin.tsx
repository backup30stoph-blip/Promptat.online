import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase/client';
import { SiteSettings, AdSlot } from '../../types';
import { Save, Plus, Edit2, Trash2, CheckCircle2, AlertCircle, RefreshCw, X, Eye, Laptop, Tablet, Smartphone, Activity } from 'lucide-react';
import { AdSlot as AdSlotComponent } from '../AdSlot';

interface Props {
  settings: SiteSettings;
  setSettings: React.Dispatch<React.SetStateAction<SiteSettings>>;
}

const PLACEMENTS = [
  'header-banner',
  'in-feed-prompts',
  'in-feed-skills',
  'in-feed-videos',
  'sidebar-desktop',
  'prompt-detail-below-prompt',
  'skill-detail-below-content',
  'video-detail-mid-content',
  'blog-in-article',
  'blog-below-article',
  'footer-above'
];

export const AdSenseAdmin: React.FC<Props> = ({ settings, setSettings }) => {
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [adSlots, setAdSlots] = useState<AdSlot[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewWidth, setPreviewWidth] = useState<375 | 768 | 1280>(1280);
  const [editingSlot, setEditingSlot] = useState<Partial<AdSlot> | null>(null);
  const [debugMode, setDebugMode] = useState(() => localStorage.getItem('adsense_debug_mode') === 'true');

  useEffect(() => {
    fetchAdSlots();
  }, []);

  const fetchAdSlots = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ad_slots')
        .select('*')
        .order('position_index', { ascending: true });
      if (error) throw error;
      setAdSlots(data || []);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      localStorage.setItem('adsense_debug_mode', debugMode.toString());

      const payload = {
        adsense_enabled: settings.adsense_enabled || false,
        adsense_publisher_id: settings.adsense_publisher_id || '',
        adsense_auto_ads: settings.adsense_auto_ads || false,
        adsense_consent_required: settings.adsense_consent_required ?? true,
      };

      const { error } = await supabase
        .from('site_settings')
        .update(payload)
        .eq('id', settings.id);

      if (error) throw error;
      setSuccessMsg('AdSense settings saved successfully.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save AdSense settings.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSaveSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot) return;
    
    try {
      const isNew = !editingSlot.id;
      const payload = {
        ...editingSlot,
        page_types: editingSlot.page_types || ['all'],
        updated_at: new Date().toISOString()
      };
      
      let res;
      if (isNew) {
        res = await supabase.from('ad_slots').insert([payload]).select().single();
      } else {
        res = await supabase.from('ad_slots').update(payload).eq('id', editingSlot.id).select().single();
      }
      
      if (res.error) throw res.error;
      
      setSuccessMsg(isNew ? 'Ad slot created.' : 'Ad slot updated.');
      setIsModalOpen(false);
      fetchAdSlots();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleDeleteSlot = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this ad slot?')) return;
    try {
      const { error } = await supabase.from('ad_slots').delete().eq('id', id);
      if (error) throw error;
      fetchAdSlots();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const togglePageType = (type: string) => {
    if (!editingSlot) return;
    const current = editingSlot.page_types || [];
    if (current.includes(type)) {
      setEditingSlot({ ...editingSlot, page_types: current.filter(t => t !== type) });
    } else {
      setEditingSlot({ ...editingSlot, page_types: [...current, type] });
    }
  };

  const pageTypeOptions = ['all', 'home', 'prompt', 'skill', 'video', 'blog', 'category'];

  return (
    <div className="space-y-6 animate-slide-in">
      {errorMsg && (
        <div className="rounded-xl bg-red-50 border border-red-100 p-4 flex items-start gap-3 text-sm font-bold text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 flex items-start gap-3 text-sm font-bold text-emerald-700">
          <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Global Settings */}
      <form onSubmit={handleSaveSettings} className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4 flex justify-between items-center">
          <div>
            <h3 className="text-base font-black text-slate-800 uppercase tracking-wide">
              Global AdSense Settings
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Configure your publisher ID and network-level consent options.
            </p>
          </div>
          <button
            type="submit"
            disabled={saveLoading}
            className="rounded-lg bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saveLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Settings
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="adsense_enabled"
                checked={settings.adsense_enabled || false}
                onChange={(e) => setSettings({ ...settings, adsense_enabled: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              <label htmlFor="adsense_enabled" className="text-sm font-bold text-slate-700">
                Enable AdSense Site-wide
              </label>
            </div>

            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-1">
                Publisher ID
              </label>
              <input
                type="text"
                placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                value={settings.adsense_publisher_id || ''}
                onChange={(e) => setSettings({ ...settings, adsense_publisher_id: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-slate-900 outline-hidden"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="adsense_auto_ads"
                checked={settings.adsense_auto_ads || false}
                onChange={(e) => setSettings({ ...settings, adsense_auto_ads: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 mt-1"
              />
              <div>
                <label htmlFor="adsense_auto_ads" className="text-sm font-bold text-slate-700 block">
                  Enable Google Auto Ads
                </label>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Warning: Auto Ads may place units that conflict with manually configured slots below. 
                  Most sites get more predictable layout with Auto Ads off and manual slots on.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="adsense_consent_required"
                checked={settings.adsense_consent_required ?? true}
                onChange={(e) => setSettings({ ...settings, adsense_consent_required: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 mt-1"
              />
              <div>
                <label htmlFor="adsense_consent_required" className="text-sm font-bold text-slate-700 block">
                  Consent Required Before Loading Ads
                </label>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Requires GDPR/UK consent before loading ad scripts. Turn off only if you have a separate CMP handling the script blocking.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="adsense_debug_mode"
                checked={debugMode}
                onChange={(e) => setDebugMode(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 mt-1"
              />
              <div>
                <label htmlFor="adsense_debug_mode" className="text-sm font-bold text-slate-700 flex items-center gap-2 block">
                  <Activity className="h-4 w-4 text-indigo-500" /> Enable Developer Debug Overlays
                </label>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Shows status overlays (rendered, blocked) on ad slots.
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Slots CRUD */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-base font-black text-slate-800 uppercase tracking-wide">
              Ad Slots Configuration
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Manage manual ad placements and their responsive behaviors.
            </p>
          </div>
          <button
            onClick={() => {
              setEditingSlot({
                name: '',
                placement: PLACEMENTS[0],
                page_types: ['all'],
                ad_client: settings.adsense_publisher_id || '',
                ad_slot_id: '',
                format: 'auto',
                full_width_responsive: true,
                desktop_enabled: true,
                tablet_enabled: true,
                mobile_enabled: true,
                is_active: false,
                position_index: adSlots.length
              });
              setIsModalOpen(true);
            }}
            className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            New Ad Slot
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
              <tr>
                <th className="px-6 py-3">Name / Placement</th>
                <th className="px-6 py-3">Format</th>
                <th className="px-6 py-3 text-center">Devices</th>
                <th className="px-6 py-3 text-center">Performance</th>
                <th className="px-6 py-3 text-center">Active</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500 text-sm">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" />
                    Loading slots...
                  </td>
                </tr>
              ) : adSlots.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500 text-sm">
                    No ad slots configured. Click "New Ad Slot" to start.
                  </td>
                </tr>
              ) : (
                adSlots.map(slot => (
                  <tr key={slot.id} className={`hover:bg-slate-50/50 transition-colors ${!slot.is_active ? 'opacity-60 grayscale-[50%]' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{slot.name}</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">{slot.placement}</div>
                      <div className="flex gap-1 mt-1.5 flex-wrap">
                        {slot.page_types.map(pt => (
                          <span key={pt} className="px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-600 text-[9px] uppercase tracking-wider font-bold">
                            {pt}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 uppercase tracking-wider">
                        {slot.format}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2 text-slate-400">
                        <Laptop className={`h-4 w-4 ${slot.desktop_enabled ? 'text-emerald-600' : ''}`} />
                        <Tablet className={`h-4 w-4 ${slot.tablet_enabled ? 'text-emerald-600' : ''}`} />
                        <Smartphone className={`h-4 w-4 ${slot.mobile_enabled ? 'text-emerald-600' : ''}`} />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs font-bold text-slate-700">{slot.views || 0} views</span>
                        <span className="text-[10px] font-bold text-slate-400">{slot.clicks || 0} clicks</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-bold uppercase tracking-wider ring-1 ring-inset ${
                        slot.is_active 
                          ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' 
                          : 'bg-slate-100 text-slate-600 ring-slate-500/10'
                      }`}>
                        {slot.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setEditingSlot(slot); setIsModalOpen(true); }}
                          className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            const duplicate = { ...slot };
                            delete duplicate.id;
                            delete duplicate.created_at;
                            delete duplicate.updated_at;
                            duplicate.name = `${duplicate.name} (Copy)`;
                            duplicate.is_active = false;
                            setEditingSlot(duplicate);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                          title="Duplicate"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="p-1.5 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {isModalOpen && editingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl flex flex-col md:flex-row min-h-[600px] max-h-[90vh]">
            
            {/* Form Side */}
            <div className="flex-1 border-r border-slate-100 flex flex-col overflow-y-auto">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 sticky top-0 z-10">
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-wide">
                  {editingSlot.id ? 'Edit Ad Slot' : 'New Ad Slot'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form id="slotForm" onSubmit={handleSaveSlot} className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-1">Slot Name</label>
                    <input 
                      required type="text" 
                      value={editingSlot.name || ''} 
                      onChange={e => setEditingSlot({...editingSlot, name: e.target.value})}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-slate-900 outline-hidden"
                      placeholder="e.g. Prompt Detail Header"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-1">Placement</label>
                    <select 
                      value={editingSlot.placement}
                      onChange={e => setEditingSlot({...editingSlot, placement: e.target.value})}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-slate-900 outline-hidden bg-white"
                    >
                      {PLACEMENTS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-1">Format</label>
                    <select 
                      value={editingSlot.format}
                      onChange={e => setEditingSlot({...editingSlot, format: e.target.value as any})}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-slate-900 outline-hidden bg-white"
                    >
                      <option value="auto">Auto (Responsive)</option>
                      <option value="fluid">Fluid</option>
                      <option value="in-article">In-Article</option>
                      <option value="in-feed">In-Feed</option>
                      <option value="fixed">Fixed Size</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-1">Ad Client</label>
                    <input 
                      required type="text" 
                      value={editingSlot.ad_client || ''} 
                      onChange={e => setEditingSlot({...editingSlot, ad_client: e.target.value})}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-slate-900 outline-hidden font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-1">Ad Slot ID</label>
                    <input 
                      required type="text" 
                      value={editingSlot.ad_slot_id || ''} 
                      onChange={e => setEditingSlot({...editingSlot, ad_slot_id: e.target.value})}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-slate-900 outline-hidden font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-2">Target Page Types</label>
                  <div className="flex flex-wrap gap-2">
                    {pageTypeOptions.map(pt => (
                      <button
                        key={pt}
                        type="button"
                        onClick={() => togglePageType(pt)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors border ${
                          (editingSlot.page_types || []).includes(pt)
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {pt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                  <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">Device Targeting</h4>
                  <div className="flex flex-wrap gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={editingSlot.desktop_enabled} 
                        onChange={e => setEditingSlot({...editingSlot, desktop_enabled: e.target.checked})}
                        className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                      />
                      <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><Laptop className="h-4 w-4"/> Desktop</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={editingSlot.tablet_enabled} 
                        onChange={e => setEditingSlot({...editingSlot, tablet_enabled: e.target.checked})}
                        className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                      />
                      <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><Tablet className="h-4 w-4"/> Tablet</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={editingSlot.mobile_enabled} 
                        onChange={e => setEditingSlot({...editingSlot, mobile_enabled: e.target.checked})}
                        className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                      />
                      <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><Smartphone className="h-4 w-4"/> Mobile</span>
                    </label>
                  </div>
                </div>

                {editingSlot.format === 'fixed' && (
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-4">
                    <h4 className="text-xs font-black text-blue-800 uppercase tracking-wider">Fixed Dimensions (Width x Height)</h4>
                    <div className="grid grid-cols-3 gap-4">
                      {['mobile', 'tablet', 'desktop'].map((device) => {
                        const sizes = editingSlot.fixed_sizes || {};
                        const ds = sizes[device as keyof typeof sizes] || { width: 300, height: 250 };
                        return (
                          <div key={device}>
                            <label className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block mb-1 capitalize">{device}</label>
                            <div className="flex items-center gap-1">
                              <input 
                                type="number" 
                                value={ds.width}
                                onChange={e => {
                                  const newSizes = { ...sizes, [device]: { ...ds, width: Number(e.target.value) } };
                                  setEditingSlot({ ...editingSlot, fixed_sizes: newSizes });
                                }}
                                className="w-full rounded-md border border-blue-200 px-2 py-1 text-xs" 
                              />
                              <span className="text-blue-400 font-black">×</span>
                              <input 
                                type="number" 
                                value={ds.height}
                                onChange={e => {
                                  const newSizes = { ...sizes, [device]: { ...ds, height: Number(e.target.value) } };
                                  setEditingSlot({ ...editingSlot, fixed_sizes: newSizes });
                                }}
                                className="w-full rounded-md border border-blue-200 px-2 py-1 text-xs" 
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-1">Raw Snippet Override (Optional)</label>
                  <textarea 
                    rows={3}
                    value={editingSlot.raw_snippet || ''}
                    onChange={e => setEditingSlot({...editingSlot, raw_snippet: e.target.value})}
                    placeholder="<ins ...></ins><script>...</script>"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-slate-900 outline-hidden font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">If provided, this exact HTML will be injected instead of the standard tag.</p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between sticky bottom-0 bg-white pb-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={editingSlot.is_active} 
                      onChange={e => setEditingSlot({...editingSlot, is_active: e.target.checked})}
                      className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600"
                    />
                    <div>
                      <span className="text-sm font-black text-slate-800 uppercase tracking-wider block">Set Active</span>
                      <span className="text-[10px] text-slate-500">Will render on live site if enabled.</span>
                    </div>
                  </label>

                  <button
                    type="submit"
                    form="slotForm"
                    className="rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-slate-800 transition-colors"
                  >
                    Save Slot
                  </button>
                </div>
              </form>
            </div>

            {/* Preview Side */}
            <div className="w-full md:w-[400px] bg-slate-100 flex flex-col">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Eye className="h-4 w-4" /> Live Preview
                </h3>
                <div className="flex bg-slate-100 rounded-lg p-1">
                  <button onClick={() => setPreviewWidth(375)} className={`p-1.5 rounded-md transition-colors ${previewWidth === 375 ? 'bg-white shadow-xs' : 'text-slate-500 hover:bg-slate-200'}`}><Smartphone className="h-3.5 w-3.5"/></button>
                  <button onClick={() => setPreviewWidth(768)} className={`p-1.5 rounded-md transition-colors ${previewWidth === 768 ? 'bg-white shadow-xs' : 'text-slate-500 hover:bg-slate-200'}`}><Tablet className="h-3.5 w-3.5"/></button>
                  <button onClick={() => setPreviewWidth(1280)} className={`p-1.5 rounded-md transition-colors ${previewWidth === 1280 ? 'bg-white shadow-xs' : 'text-slate-500 hover:bg-slate-200'}`}><Laptop className="h-3.5 w-3.5"/></button>
                </div>
              </div>
              
              <div className="flex-1 p-6 overflow-y-auto flex flex-col items-center justify-start min-h-[400px]">
                <div 
                  className="bg-white shadow-xl transition-all duration-300 flex items-center justify-center overflow-hidden border border-slate-200"
                  style={{ width: previewWidth, minHeight: 300, transform: `scale(${400 / 1280})`, transformOrigin: 'top center' }}
                >
                  <div className="w-full p-4 space-y-4">
                    <div className="h-12 bg-slate-100 rounded-lg w-3/4 mx-auto opacity-50" />
                    
                    {/* Mock Ad Slot */}
                    <div className="border-2 border-dashed border-blue-300 bg-blue-50 flex items-center justify-center rounded-lg relative overflow-hidden" style={
                      editingSlot.format === 'fixed' && editingSlot.fixed_sizes
                        ? { 
                            width: editingSlot.fixed_sizes[previewWidth === 375 ? 'mobile' : previewWidth === 768 ? 'tablet' : 'desktop']?.width || '100%',
                            height: editingSlot.fixed_sizes[previewWidth === 375 ? 'mobile' : previewWidth === 768 ? 'tablet' : 'desktop']?.height || 250,
                            margin: '0 auto'
                          }
                        : { width: '100%', minHeight: 250 }
                    }>
                      <span className="text-blue-500 font-bold tracking-widest uppercase text-sm">Ad Placeholder</span>
                      <div className="absolute bottom-2 right-2 text-[10px] text-blue-400 font-mono">
                        {previewWidth === 375 ? 'Mobile' : previewWidth === 768 ? 'Tablet' : 'Desktop'}
                      </div>
                    </div>

                    <div className="space-y-2 opacity-50">
                      <div className="h-4 bg-slate-100 rounded w-full" />
                      <div className="h-4 bg-slate-100 rounded w-5/6" />
                      <div className="h-4 bg-slate-100 rounded w-4/6" />
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-4 text-center max-w-xs">
                  This is a mock representation. Ads will render differently based on actual content and Google's final delivery.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
