import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, 
  Globe, 
  Search, 
  BarChart3, 
  Sliders, 
  Code, 
  FileText, 
  RefreshCw, 
  Check, 
  AlertCircle, 
  Layers, 
  Link2, 
  ShieldAlert, 
  Zap, 
  Key, 
  Plus, 
  Trash2, 
  Upload, 
  Copy, 
  Download, 
  ArrowRight,
  Eye,
  Activity,
  User,
  HeartCrack,
  Mail,
  Megaphone
} from 'lucide-react';
import { supabase } from '../../services/supabase/client';
import { EmailMarketingAdmin } from './EmailMarketingAdmin';
import { SeoMetadataManager } from './SeoMetadataManager';
import { AdSenseAdmin } from './AdSenseAdmin';

type SubTab = 
  | 'dashboard' 
  | 'general' 
  | 'seo' 
  | 'page-seo'
  | 'search-engines' 
  | 'analytics' 
  | 'tag-manager' 
  | 'indexing' 
  | 'robots' 
  | 'sitemap' 
  | 'redirects' 
  | 'security' 
  | 'performance' 
  | 'api-keys' 
  | 'logs-404'
  | 'email-marketing'
  | 'adsense';

interface SiteSettings {
  id: string;
  site_name: string;
  site_url: string;
  favicon?: string;
  logo?: string;
  default_title: string;
  default_description: string;
  default_image?: string;
  robots: string;
  head_code?: string;
  footer_code?: string;
  analytics_enabled: boolean;
  analytics_id?: string;
  gtm_enabled: boolean;
  gtm_id?: string;
  google_verification?: string;
  bing_verification?: string;
  yandex_verification?: string;
  pinterest_verification?: string;
  facebook_verification?: string;
  indexing_enabled: boolean;
  auto_sitemap: boolean;
  robots_content: string;
  adsense_enabled?: boolean;
  adsense_publisher_id?: string;
  adsense_auto_ads?: boolean;
  adsense_consent_required?: boolean;
}

interface Redirect {
  id: string;
  old_url: string;
  new_url: string;
  type: number;
  hits: number;
  enabled: boolean;
  notes?: string;
  created_at?: string;
}

interface Log404 {
  id: string;
  url: string;
  referer?: string;
  user_agent?: string;
  hits: number;
  first_seen?: string;
  last_seen: string;
  resolved?: boolean;
  redirect_to?: string;
  created_at?: string;
}

const SQL_SETUP_STRING = `-- 1. Create site_settings Table
create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  site_name text not null default 'GemiPrompts',
  site_url text not null default 'https://gemiprompts.store',
  favicon text,
  logo text,
  default_title text not null default 'GemiPrompts - Premium Prompt Engineering & Blueprints',
  default_description text not null default 'Discover premium prompt collections, Cursor configuration rules, and advanced playbooks built by leading creators.',
  default_image text,
  robots text default 'index, follow',
  head_code text,
  footer_code text,
  analytics_enabled boolean not null default false,
  analytics_id text,
  gtm_enabled boolean not null default false,
  gtm_id text,
  google_verification text,
  bing_verification text,
  yandex_verification text,
  pinterest_verification text,
  facebook_verification text,
  indexing_enabled boolean not null default true,
  auto_sitemap boolean not null default true,
  robots_content text not null default 'User-agent: *' || chr(10) || 'Allow: /' || chr(10) || chr(10) || 'Disallow: /admin/' || chr(10) || chr(10) || 'Sitemap: https://gemiprompts.store/sitemap.xml',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS Site Settings
alter table public.site_settings enable row level security;
create policy "Site settings are viewable by everyone" on public.site_settings for select using (true);
create policy "Only admin can modify Site settings" on public.site_settings for all using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin'));

-- Default Settings row (00000000-0000-0000-0000-000000000000)
insert into public.site_settings (id)
values ('00000000-0000-0000-0000-000000000000')
on conflict (id) do nothing;

-- 2. Create redirects Table (SEO URL rewrite rules engine)
create table if not exists public.redirects (
  id uuid primary key default gen_random_uuid(),
  old_url text unique not null,
  new_url text not null,
  type int not null default 301 check (type in (301, 302, 307, 308)),
  hits int not null default 0,
  enabled boolean not null default true,
  notes text,
  created_at timestamptz default now(),
  last_used timestamptz
);

-- RLS Redirects
alter table public.redirects enable row level security;
create policy "Redirects are viewable by everyone" on public.redirects for select using (true);
create policy "Only admin can modify Redirects" on public.redirects for all using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin'));
create index if not exists idx_redirects_old_url on public.redirects(old_url);

-- 3. Create 404 Logs Table (Broken Link Traffic telemetry tracker)
create table if not exists public."404_logs" (
    id uuid primary key default gen_random_uuid(),
    url text not null,
    referer text,
    user_agent text,
    hits integer default 1,
    first_seen timestamptz default now(),
    last_seen timestamptz default now(),
    resolved boolean default false,
    redirect_to text,
    created_at timestamptz default now()
);

-- RLS 404 Logs
alter table public.404_logs enable row level security;
create policy "Only admin can select 404 logs" on public.404_logs for select using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin'));
create policy "Anyone can insert 404 logs" on public.404_logs for insert with check (true);
create policy "Anyone can update 404 logs" on public.404_logs for update using (true);
create index if not exists idx_404_logs_url on public.404_logs(url);`;

export const SiteSettingsAdmin: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('dashboard');
  const [loading, setLoading] = useState<boolean>(true);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Core Data State
  const [settings, setSettings] = useState<SiteSettings>({
    id: '00000000-0000-0000-0000-000000000000',
    site_name: 'GemiPrompts',
    site_url: 'https://gemiprompts.store',
    favicon: '',
    logo: '',
    default_title: 'GemiPrompts - Premium Prompt Engineering & Blueprints',
    default_description: 'Discover premium prompt collections, Cursor configuration rules, and advanced playbooks built by leading creators.',
    default_image: '',
    robots: 'index, follow',
    head_code: '',
    footer_code: '',
    analytics_enabled: false,
    analytics_id: '',
    gtm_enabled: false,
    gtm_id: '',
    google_verification: '',
    bing_verification: '',
    yandex_verification: '',
    pinterest_verification: '',
    facebook_verification: '',
    indexing_enabled: true,
    auto_sitemap: true,
    robots_content: 'User-agent: *\nAllow: /\n\nDisallow: /admin/\n\nSitemap: https://gemiprompts.store/sitemap.xml'
  });

  // Redirect States
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [newRedirect, setNewRedirect] = useState({ old_url: '', new_url: '', type: 301, notes: '' });
  const [redirectSearch, setRedirectSearch] = useState('');
  const [pasteImport, setPasteImport] = useState('');
  const [isImportOpen, setIsImportOpen] = useState(false);

  // 404 States
  const [logs404, setLogs404] = useState<Log404[]>([]);
  const [selected404Ids, setSelected404Ids] = useState<string[]>([]);
  const [logsSearch, setLogsSearch] = useState<string>('');
  const [logsFilter, setLogsFilter] = useState<'all' | 'unresolved' | 'resolved'>('all');

  // Analytics Extras State
  const [analyticsOptions, setAnalyticsOptions] = useState({
    anonymizeIp: true,
    debugMode: false,
    consentMode: true,
    enhancedMeasurement: true,
    crossDomainTracking: ''
  });

  // GTM Extras State
  const [gtmOptions, setGtmOptions] = useState({
    previewMode: false,
    environment: 'Live'
  });

  // Indexing Matrix
  const [indexingMatrix, setIndexingMatrix] = useState<Record<string, { index: boolean, follow: boolean }>>({
    pages: { index: true, follow: true },
    prompts: { index: true, follow: true },
    blogs: { index: true, follow: true },
    skills: { index: true, follow: true },
    videos: { index: true, follow: true },
    categories: { index: true, follow: true },
    authors: { index: false, follow: true },
    collections: { index: true, follow: true }
  });

  // Sitemap Options
  const [sitemapOptions, setSitemapOptions] = useState({
    frequency: 'daily',
    priority: 0.8,
    includeImages: true,
    includeVideos: true,
    includeCategories: true,
    includeAuthors: false,
    includeTags: true,
    splitLarge: false
  });

  // Crawl Prefs
  const [crawlPrefs, setCrawlPrefs] = useState({
    preventDuplicate: true,
    trailingSlash: true,
    lowercaseUrls: true,
    httpsRedirect: true,
    wwwRedirect: false,
    removeIndexPhp: true,
    removeHtml: true
  });

  // Security Headers
  const [securityHeaders, setSecurityHeaders] = useState({
    csp: "default-src 'self' https: 'unsafe-inline' 'unsafe-eval'; img-src 'self' https: data:; frame-ancestors 'none';",
    hsts: "max-age=63072000; includeSubDomains; preload",
    xFrame: "DENY",
    xContentType: "nosniff",
    referrerPolicy: "strict-origin-when-cross-origin",
    permissionsPolicy: "geolocation=(), microphone=(), camera=()"
  });

  // Robots visual rules & validation states
  const [isVisualRobots, setIsVisualRobots] = useState<boolean>(true);
  const [robotsRules, setRobotsRules] = useState<Array<{ id: string; agent: string; allow: string; disallow: string; crawlDelay: string }>>([
    { id: '1', agent: '*', allow: '/', disallow: '/admin/', crawlDelay: '' }
  ]);
  const [robotsValidationErrors, setRobotsValidationErrors] = useState<string[]>([]);
  const [missingTables, setMissingTables] = useState<string[]>([]);
  const [copiedSchema, setCopiedSchema] = useState<boolean>(false);
  const [showSchemaDetails, setShowSchemaDetails] = useState<boolean>(false);
  const [sitemapGenerating, setSitemapGenerating] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Settings & Collections
  const loadSettingsData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const detectedMissing: string[] = [];

      // Fetch global settings
      const { data: settingsData, error: settingsErr } = await supabase
        .from('site_settings')
        .select('*')
        .single();

      if (settingsErr) {
        console.warn('Could not load site_settings row, inserting defaults:', settingsErr.message);
        if (settingsErr.code === '42P01' || settingsErr.message?.includes('schema cache') || settingsErr.message?.includes('relation') || settingsErr.message?.includes('not find')) {
          detectedMissing.push('site_settings');
        }
      } else if (settingsData) {
        setSettings(settingsData);
      }

      // Fetch redirects
      const { data: redirData, error: redirErr } = await supabase
        .from('redirects')
        .select('*')
        .order('hits', { ascending: false });

      if (redirErr) {
        console.warn('Could not load redirects table:', redirErr.message);
        if (redirErr.code === '42P01' || redirErr.message?.includes('schema cache') || redirErr.message?.includes('relation') || redirErr.message?.includes('not find')) {
          detectedMissing.push('redirects');
        }
      } else if (redirData) {
        setRedirects(redirData);
      }

      // Fetch 404 Logs
      const { data: logsData, error: logsErr } = await supabase
        .from('404_logs')
        .select('*')
        .order('hits', { ascending: false });

      if (logsErr) {
        console.warn('Could not load 404_logs table:', logsErr.message);
        if (logsErr.code === '42P01' || logsErr.message?.includes('schema cache') || logsErr.message?.includes('relation') || logsErr.message?.includes('not find')) {
          detectedMissing.push('404_logs');
        }
      } else if (logsData) {
        setLogs404(logsData);
      }

      setMissingTables(detectedMissing);

    } catch (err: any) {
      setErrorMsg(err.message || 'Fatal error fetching site settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettingsData();
  }, []);

  const triggerNotify = (text: string, type: 'success' | 'error' = 'success') => {
    if (type === 'success') {
      setSuccessMsg(text);
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setErrorMsg(text);
      setTimeout(() => setErrorMsg(null), 5000);
    }
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(SQL_SETUP_STRING);
    setCopiedSchema(true);
    triggerNotify('SQL Setup code copied to clipboard! Ready to paste into Supabase SQL Editor.');
    setTimeout(() => setCopiedSchema(false), 3000);
  };

  // Save Settings to Supabase
  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setSaveLoading(true);
      setErrorMsg(null);

      const { error } = await supabase
        .from('site_settings')
        .upsert(settings);

      if (error) throw error;
      triggerNotify('Master Site Settings successfully synchronized to database.');
    } catch (err: any) {
      triggerNotify(err.message || 'Failed to update site settings.', 'error');
    } finally {
      setSaveLoading(false);
    }
  };

  // Generate & Export Sitemaps dynamically via backend trigger
  const handleGenerateSitemaps = async () => {
    try {
      setSitemapGenerating(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const response = await fetch('/api/sitemap/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to trigger sitemap generation.');
      }

      triggerNotify('SEO Sitemaps successfully compiled, exported, and published to the public directory!');
    } catch (err: any) {
      triggerNotify(err.message || 'Sitemap compilation failed.', 'error');
    } finally {
      setSitemapGenerating(false);
    }
  };

  // Add Redirect
  const handleAddRedirect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRedirect.old_url || !newRedirect.new_url) {
      triggerNotify('Please supply both the old and new matching URLs.', 'error');
      return;
    }

    // Loop & Chain detection
    if (newRedirect.old_url.trim() === newRedirect.new_url.trim()) {
      triggerNotify('Infinite loop detected! Source URL matches destination URL.', 'error');
      return;
    }

    // Duplicate Check
    const exists = redirects.some(r => r.old_url.toLowerCase() === newRedirect.old_url.toLowerCase());
    if (exists) {
      triggerNotify(`Redirect conflict: Old URL "${newRedirect.old_url}" is already bound.`, 'error');
      return;
    }

    try {
      setSaveLoading(true);
      const { data, error } = await supabase
        .from('redirects')
        .insert({
          old_url: newRedirect.old_url.trim(),
          new_url: newRedirect.new_url.trim(),
          type: Number(newRedirect.type),
          notes: newRedirect.notes,
          hits: 0,
          enabled: true
        })
        .select()
        .single();

      if (error) throw error;

      // Automatically resolve any matching 404 logs in the DB
      try {
        await supabase
          .from('404_logs')
          .update({
            resolved: true,
            redirect_to: data.new_url
          })
          .eq('url', data.old_url);

        // Update local logs404 state to reflect resolution
        setLogs404(prevLogs => prevLogs.map(log => 
          log.url === data.old_url 
            ? { ...log, resolved: true, redirect_to: data.new_url } 
            : log
        ));
      } catch (logErr) {
        console.warn('Could not auto-resolve matching 404 logs:', logErr);
      }

      setRedirects([data, ...redirects]);
      setNewRedirect({ old_url: '', new_url: '', type: 301, notes: '' });
      triggerNotify(`Redirect rule created successfully for "${data.old_url}"`);
    } catch (err: any) {
      triggerNotify(err.message || 'Failed to insert redirect.', 'error');
    } finally {
      setSaveLoading(false);
    }
  };

  // Delete Redirect
  const handleDeleteRedirect = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this redirect rule?')) return;
    try {
      const { error } = await supabase
        .from('redirects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setRedirects(redirects.filter(r => r.id !== id));
      triggerNotify('Redirection rule removed.');
    } catch (err: any) {
      triggerNotify(err.message || 'Failed to delete redirect rule.', 'error');
    }
  };

  // Parse Bulk Redirect Paste
  const handleBulkImport = async () => {
    if (!pasteImport.trim()) {
      triggerNotify('Please paste comma or tab-separated redirect rule formats.', 'error');
      return;
    }

    const lines = pasteImport.split('\n');
    const recordsToInsert: any[] = [];
    let duplicateSkips = 0;
    let loopSkips = 0;

    lines.forEach(line => {
      const parts = line.split(/[,\t]+/);
      if (parts.length >= 2) {
        const old_url = parts[0].trim();
        const new_url = parts[1].trim();
        const type = Number(parts[2]) || 301;
        const notes = parts[3]?.trim() || 'Imported via dashboard';

        if (!old_url || !new_url) return;

        if (old_url === new_url) {
          loopSkips++;
          return;
        }

        const isDuplicate = redirects.some(r => r.old_url.toLowerCase() === old_url.toLowerCase());
        if (isDuplicate) {
          duplicateSkips++;
          return;
        }

        recordsToInsert.push({ old_url, new_url, type, notes, hits: 0, enabled: true });
      }
    });

    if (recordsToInsert.length === 0) {
      triggerNotify(`No valid unique redirections parsed (Skipped ${duplicateSkips} duplicates, ${loopSkips} loops).`, 'error');
      return;
    }

    try {
      setSaveLoading(true);
      const { data, error } = await supabase
        .from('redirects')
        .insert(recordsToInsert)
        .select();

      if (error) throw error;

      // Automatically resolve matching 404 logs for all imported records
      try {
        if (data && data.length > 0) {
          for (const item of data) {
            await supabase
              .from('404_logs')
              .update({ resolved: true, redirect_to: item.new_url })
              .eq('url', item.old_url);
          }

          // Update local logs404 state
          setLogs404(prevLogs => prevLogs.map(log => {
            const match = data.find(item => item.old_url === log.url);
            return match ? { ...log, resolved: true, redirect_to: match.new_url } : log;
          }));
        }
      } catch (logErr) {
        console.warn('Could not bulk auto-resolve matching 404 logs:', logErr);
      }

      setRedirects([...(data || []), ...redirects]);
      setPasteImport('');
      setIsImportOpen(false);
      triggerNotify(`Successfully bulk-imported ${data?.length} redirection pairs! (Skipped ${duplicateSkips} dupes, ${loopSkips} loops)`);
    } catch (err: any) {
      triggerNotify(err.message || 'Failed bulk import query.', 'error');
    } finally {
      setSaveLoading(false);
    }
  };

  // Quick setup of redirect from a 404 log
  const handleAddRedirectFrom404 = (url404: string) => {
    setNewRedirect({
      old_url: url404,
      new_url: '/',
      type: 301,
      notes: `Fixing 404 for ${url404}`
    });
    setActiveSubTab('redirects');
    triggerNotify(`Loaded old URL: "${url404}". Please define the new destination path.`);
  };

  // Toggle 404 resolve status
  const handleToggleResolve404 = async (id: string, currentStatus: boolean, redirectTo?: string) => {
    try {
      const nextStatus = !currentStatus;
      const { error } = await supabase
        .from('404_logs')
        .update({
          resolved: nextStatus,
          redirect_to: nextStatus ? (redirectTo || '/') : null
        })
        .eq('id', id);

      if (error) throw error;

      setLogs404(logs404.map(log => 
        log.id === id 
          ? { ...log, resolved: nextStatus, redirect_to: nextStatus ? (redirectTo || '/') : undefined } 
          : log
      ));
      triggerNotify(nextStatus ? '404 error marked as resolved.' : '404 error marked as unresolved.');
    } catch (err: any) {
      triggerNotify(err.message || 'Failed to update 404 log status.', 'error');
    }
  };

  // Bulk resolve selected 404 logs
  const handleBulkResolve404 = async () => {
    if (selected404Ids.length === 0) return;
    try {
      setSaveLoading(true);
      const { error } = await supabase
        .from('404_logs')
        .update({
          resolved: true,
          redirect_to: '/'
        })
        .in('id', selected404Ids);

      if (error) throw error;

      setLogs404(logs404.map(log => 
        selected404Ids.includes(log.id) 
          ? { ...log, resolved: true, redirect_to: '/' } 
          : log
      ));
      setSelected404Ids([]);
      triggerNotify(`Successfully marked ${selected404Ids.length} 404 error logs as resolved.`);
    } catch (err: any) {
      triggerNotify(err.message || 'Failed to bulk-resolve 404 logs.', 'error');
    } finally {
      setSaveLoading(false);
    }
  };

  // 404 individual deletion
  const handleDelete404 = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this 404 error log?')) return;
    try {
      const { error } = await supabase
        .from('404_logs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setLogs404(logs404.filter(log => log.id !== id));
      setSelected404Ids(selected404Ids.filter(i => i !== id));
      triggerNotify('404 error log deleted.');
    } catch (err: any) {
      triggerNotify(err.message || 'Failed to delete 404 log.', 'error');
    }
  };

  // 404 bulk deletion
  const handleBulkDelete404 = async () => {
    if (selected404Ids.length === 0) return;
    if (!window.confirm(`Are you sure you want to permanently delete the ${selected404Ids.length} selected 404 error logs?`)) return;
    try {
      setSaveLoading(true);
      const { error } = await supabase
        .from('404_logs')
        .delete()
        .in('id', selected404Ids);

      if (error) throw error;
      setLogs404(logs404.filter(log => !selected404Ids.includes(log.id)));
      setSelected404Ids([]);
      triggerNotify(`Successfully bulk deleted ${selected404Ids.length} log entries.`);
    } catch (err: any) {
      triggerNotify(err.message || 'Failed to bulk delete 404 logs.', 'error');
    } finally {
      setSaveLoading(false);
    }
  };

  // 404 export to CSV
  const handleExport404 = () => {
    if (logs404.length === 0) {
      triggerNotify('No 404 logs available to export.', 'error');
      return;
    }
    try {
      const headers = ['URL', 'Hits', 'Referer', 'User Agent', 'Last Seen'];
      const rows = logs404.map(log => [
        `"${log.url.replace(/"/g, '""')}"`,
        log.hits,
        `"${(log.referer || '').replace(/"/g, '""')}"`,
        `"${(log.user_agent || '').replace(/"/g, '""')}"`,
        log.last_seen
      ]);
      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', downloadUrl);
      link.setAttribute('download', `gemiprompts_404_logs_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      triggerNotify('Successfully exported 404 logs to CSV file.');
    } catch (err: any) {
      triggerNotify(err.message || 'Failed to export 404 logs.', 'error');
    }
  };

  // Robots.txt Syntax Validator
  const validateRobotsTextSyntax = (text: string) => {
    const errors: string[] = [];
    const lines = text.split('\n');
    let hasUserAgent = false;

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;

      const colonIndex = trimmed.indexOf(':');
      if (colonIndex === -1) {
        errors.push(`Line ${idx + 1}: Missing colon separator in rule "${trimmed}"`);
        return;
      }

      const key = trimmed.substring(0, colonIndex).trim().toLowerCase();
      const val = trimmed.substring(colonIndex + 1).trim();

      if (key === 'user-agent') {
        hasUserAgent = true;
      } else if (key === 'sitemap') {
        if (!val.startsWith('http://') && !val.startsWith('https://')) {
          errors.push(`Line ${idx + 1}: Sitemap must be an absolute URL starting with http:// or https://`);
        }
      } else if (key === 'crawl-delay') {
        if (isNaN(Number(val))) {
          errors.push(`Line ${idx + 1}: Crawl-delay must be an integer or numeric value (received "${val}")`);
        }
      } else if (!['allow', 'disallow'].includes(key)) {
        errors.push(`Line ${idx + 1}: Unknown crawler directive "${key}"`);
      }
    });

    if (!hasUserAgent && lines.some(l => l.trim().length > 0)) {
      errors.push('No active "User-agent" rule specified. Crawlers need a designated user agent context.');
    }

    setRobotsValidationErrors(errors);
    return errors.length === 0;
  };

  // Sync visual builder settings to raw content string
  const syncVisualRobotsToRaw = (rulesList: typeof robotsRules) => {
    let text = '# Custom directives built with GemiPrompts Robots Visual Editor\n';
    rulesList.forEach((rule) => {
      if (!rule.agent) return;
      text += `User-agent: ${rule.agent.trim()}\n`;
      if (rule.allow) {
        const allows = rule.allow.split(',').map(s => s.trim()).filter(Boolean);
        allows.forEach(a => {
          text += `Allow: ${a}\n`;
        });
      }
      if (rule.disallow) {
        const disallows = rule.disallow.split(',').map(s => s.trim()).filter(Boolean);
        disallows.forEach(d => {
          text += `Disallow: ${d}\n`;
        });
      }
      if (rule.crawlDelay) {
        text += `Crawl-delay: ${rule.crawlDelay.trim()}\n`;
      }
      text += '\n';
    });

    if (settings.site_url) {
      text += `Sitemap: ${settings.site_url}/sitemap.xml\n`;
    }

    setSettings(prev => ({ ...prev, robots_content: text }));
    validateRobotsTextSyntax(text);
  };

  const handleAddRobotsRule = () => {
    const newId = (robotsRules.length + 1).toString();
    const updated = [...robotsRules, { id: newId, agent: '*', allow: '/', disallow: '/admin/', crawlDelay: '' }];
    setRobotsRules(updated);
    syncVisualRobotsToRaw(updated);
  };

  const handleDeleteRobotsRule = (id: string) => {
    const updated = robotsRules.filter(r => r.id !== id);
    setRobotsRules(updated);
    syncVisualRobotsToRaw(updated);
  };

  const handleUpdateRobotsRule = (id: string, fields: Partial<typeof robotsRules[0]>) => {
    const updated = robotsRules.map(r => r.id === id ? { ...r, ...fields } : r);
    setRobotsRules(updated);
    syncVisualRobotsToRaw(updated);
  };

  // Format date helper
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Restore Default Robots.txt
  const handleRestoreDefaultRobots = () => {
    const defaultText = `User-agent: *\nAllow: /\n\nDisallow: /admin/\nDisallow: /private/\n\nSitemap: ${settings.site_url || 'https://gemiprompts.store'}/sitemap.xml`;
    setSettings({
      ...settings,
      robots_content: defaultText
    });
    validateRobotsTextSyntax(defaultText);
    setRobotsRules([{ id: '1', agent: '*', allow: '/', disallow: '/admin/,/private/', crawlDelay: '' }]);
    triggerNotify('Restored default search crawler directives in working state.');
  };

  // Filter redirects
  const filteredRedirects = redirects.filter(r => {
    const query = redirectSearch.toLowerCase();
    return (
      r.old_url.toLowerCase().includes(query) ||
      r.new_url.toLowerCase().includes(query) ||
      (r.notes && r.notes.toLowerCase().includes(query))
    );
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      
      {/* Sub tabs Menu Panel (3 cols) */}
      <div className="lg:col-span-3 space-y-1">
        <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 space-y-1">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-3 block mb-1">
            SEO & Admin Modules
          </span>

          {[
            { id: 'dashboard', title: 'SEO Dashboard', icon: Activity },
            { id: 'general', title: 'General Identity', icon: Globe },
            { id: 'seo', title: 'Global Metadata', icon: Sliders },
            { id: 'page-seo', title: 'Page-Specific SEO', icon: Layers },
            { id: 'search-engines', title: 'Search Consoles', icon: Search },
            { id: 'analytics', title: 'Google Analytics', icon: BarChart3 },
            { id: 'tag-manager', title: 'Google Tag Manager', icon: Layers },
            { id: 'indexing', title: 'Crawler Indexing', icon: Eye },
            { id: 'robots', title: 'Robots.txt Editor', icon: FileText },
            { id: 'sitemap', title: 'Sitemap Configs', icon: Code },
            { id: 'redirects', title: 'Redirects Rulebook', icon: Link2 },
            { id: 'security', title: 'Security Headers', icon: ShieldAlert },
            { id: 'performance', title: 'Crawler Performance', icon: Zap },
            { id: 'api-keys', title: 'Webmaster API Keys', icon: Key },
            { id: 'logs-404', title: '404 Error Log', icon: HeartCrack },
            { id: 'email-marketing', title: 'Email & Resend Hub', icon: Mail },
            { id: 'adsense', title: 'Google AdSense', icon: Megaphone }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeSubTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSubTab(item.id as SubTab);
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-bold transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-red-600 text-white shadow-xs' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workspace Frame (9 cols) */}
      <div className="lg:col-span-9 space-y-6">

        {/* FEEDBACK STATUS BAR */}
        {errorMsg && (
          <div className="rounded-xl bg-red-50 border border-red-100 p-3.5 flex items-start gap-2.5 text-xs font-bold text-red-700 animate-fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3.5 flex items-start gap-2.5 text-xs font-bold text-emerald-700 animate-fade-in">
            <Check className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* PROVISIONING / MIGRATION WARNING BANNER */}
        {missingTables.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-5 space-y-4 animate-fade-in text-left">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 text-amber-700 rounded-lg shrink-0 mt-0.5">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-black text-amber-800 uppercase tracking-wider">
                  Supabase DB Schema Not Fully Provisioned
                </h4>
                <p className="text-[11px] text-amber-700 leading-relaxed font-semibold">
                  We detected that required tables are missing from your database schema cache:{' '}
                  <code className="bg-amber-100 px-1.5 py-0.5 rounded text-amber-800 font-mono text-[10px]">
                    {missingTables.join(', ')}
                  </code>
                  . This occurs because the database setup scripts have not been executed on your new Supabase workspace yet.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-amber-200/60 p-4 text-[11px] font-semibold text-slate-700 space-y-3 shadow-xs">
              <span className="font-black text-slate-800 uppercase tracking-wider text-[10px] block border-b border-slate-100 pb-1.5">
                How to Provision in 4 Steps:
              </span>
              <ol className="list-decimal pl-5 space-y-2 text-slate-600 font-medium leading-relaxed">
                <li>
                  Click <strong className="text-amber-800">Copy Setup SQL Code</strong> below to copy the tables, indexes, and RLS policies creation scripts.
                </li>
                <li>
                  Go to your <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-red-600 hover:underline font-bold">Supabase Dashboard</a>, select your project, and open the <strong className="text-slate-800">SQL Editor</strong>.
                </li>
                <li>
                  Click <strong className="text-slate-800">New query</strong>, paste the copied SQL code, and click <strong className="text-slate-800">Run</strong>.
                </li>
                <li>
                  Return here and click <strong className="text-amber-800">Verify & Recheck Tables</strong> to synchronize!
                </li>
              </ol>

              <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCopySchema}
                  className="rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 text-[10px] uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                >
                  <Copy className="h-3 w-3" />
                  <span>Copy Setup SQL Code</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowSchemaDetails(!showSchemaDetails)}
                  className="rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1"
                >
                  <FileText className="h-3 w-3" />
                  <span>{showSchemaDetails ? 'Hide' : 'View'} SQL Code</span>
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={loadSettingsData}
                  className="rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold px-3 py-1.5 text-[10px] uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                  <span>Verify & Recheck Tables</span>
                </button>
              </div>

              {showSchemaDetails && (
                <div className="mt-3.5 rounded-lg border border-slate-200 bg-slate-950 p-3 max-h-64 overflow-y-auto">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800 mb-2">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">
                      Setup Schema Script
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">
                      {SQL_SETUP_STRING.split('\n').length} lines
                    </span>
                  </div>
                  <pre className="text-[10px] font-mono text-slate-300 leading-relaxed overflow-x-auto select-all whitespace-pre-wrap">
                    {SQL_SETUP_STRING}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 1. DASHBOARD OVERVIEW SUB-TAB */}
        {activeSubTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                Search Engine Engine Optimization Dashboard
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                A bird's eye view of indexing coverage, redirects, and Webmaster metrics.
              </p>
            </div>

            {/* Metric widgets */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-left">
                <span className="text-[9px] font-black text-slate-400 uppercase block">Registered Redirects</span>
                <span className="text-2xl font-black text-slate-800 mt-1 block">{redirects.length}</span>
                <span className="text-[9px] text-emerald-600 font-bold mt-1 block">Active 301/302 Rules</span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-left">
                <span className="text-[9px] font-black text-slate-400 uppercase block">Active 404 Crawl Triggers</span>
                <span className="text-2xl font-black text-slate-800 mt-1 block">
                  {logs404.reduce((sum, log) => sum + log.hits, 0)}
                </span>
                <span className={`text-[9px] font-bold mt-1 block ${logs404.length > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {logs404.length} Unique Broken Links
                </span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-left col-span-2 md:col-span-1">
                <span className="text-[9px] font-black text-slate-400 uppercase block">Google Site Status</span>
                <span className="text-sm font-bold text-slate-800 mt-2.5 block truncate flex items-center gap-1">
                  <span className={`h-2.5 w-2.5 rounded-full inline-block ${settings.google_verification ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  {settings.google_verification ? 'Verified GSC' : 'Unverified'}
                </span>
                <span className="text-[9px] text-slate-400 font-medium block mt-1">Header injection active</span>
              </div>
            </div>

            {/* SEO Health Audit Check List */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
              <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <Activity className="h-4 w-4 text-red-500" />
                <span>Search Health Checklist</span>
              </h4>
              <div className="divide-y divide-slate-100 text-xs">
                <div className="py-2.5 flex justify-between items-center">
                  <span className="font-bold text-slate-600">Sitemap Status & Auto updates</span>
                  <span className="rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 text-[9px] font-black text-emerald-700 uppercase">
                    Auto-Built (Active)
                  </span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="font-bold text-slate-600">Robots.txt Presence validation</span>
                  <span className="rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 text-[9px] font-black text-emerald-700 uppercase">
                    Valid (Dynamic)
                  </span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="font-bold text-slate-600">Google Analytics Integration</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase border ${
                    settings.analytics_enabled 
                      ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                      : 'bg-slate-50 border-slate-100 text-slate-400'
                  }`}>
                    {settings.analytics_enabled ? 'Active Integration' : 'Disabled'}
                  </span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="font-bold text-slate-600">Google Tag Manager Snippet</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase border ${
                    settings.gtm_enabled 
                      ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                      : 'bg-slate-50 border-slate-100 text-slate-400'
                  }`}>
                    {settings.gtm_enabled ? 'Injected' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Top 404 logs & Redirects sorted by hits */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 404 logs widget */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
                <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4 text-amber-500 animate-pulse-once" />
                    <span>Top 404 Errors (Missing Redirects)</span>
                  </span>
                  <button 
                    type="button"
                    onClick={() => setActiveSubTab('logs-404')}
                    className="text-[10px] text-[#e21833] hover:text-[#c21124] font-bold uppercase tracking-wider cursor-pointer"
                  >
                    View All
                  </button>
                </h4>
                {logs404.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No missing redirects detected (0 logs).</p>
                ) : (
                  <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto pr-1">
                    {logs404.slice(0, 5).map((log) => (
                      <div key={log.id} className="py-2 flex justify-between items-center text-xs">
                        <div className="min-w-0 flex-1 pr-3">
                          <span className="font-mono text-[11px] text-slate-700 block truncate" title={log.url}>{log.url}</span>
                          {log.referer && (
                            <span className="text-[10px] text-slate-400 block truncate">via {log.referer}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                            {log.hits || 0} hits
                          </span>
                          {!log.resolved && (
                            <button
                              type="button"
                              onClick={() => handleAddRedirectFrom404(log.url)}
                              className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                            >
                              Redirect
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Redirect decay widget */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
                <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="flex items-center gap-1.5">
                    <Link2 className="h-4 w-4 text-emerald-500" />
                    <span>Top Redirects (Traffic Decay)</span>
                  </span>
                  <button 
                    type="button"
                    onClick={() => setActiveSubTab('redirects')}
                    className="text-[10px] text-[#e21833] hover:text-[#c21124] font-bold uppercase tracking-wider cursor-pointer"
                  >
                    View All
                  </button>
                </h4>
                {redirects.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No active redirects configured.</p>
                ) : (
                  <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto pr-1">
                    {redirects.slice(0, 5).map((redir) => (
                      <div key={redir.id} className="py-2.5 flex justify-between items-center text-xs">
                        <div className="min-w-0 flex-1 pr-3">
                          <span className="font-mono text-[11px] text-slate-600 block truncate" title={redir.old_url}>
                            From: {redir.old_url}
                          </span>
                          <span className="font-mono text-[11px] text-emerald-600 block truncate" title={redir.new_url}>
                            To: {redir.new_url}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                            {redir.hits || 0} hits
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. GENERAL TAB */}
        {activeSubTab === 'general' && (
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                Site General Identity
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Define the fundamental branding variables used in footer generation and layout.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase">Website Name</label>
                <input 
                  required
                  type="text" 
                  value={settings.site_name}
                  onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:ring-1 focus:ring-red-500 outline-hidden"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase">Root Canonical Url</label>
                <input 
                  required
                  type="text" 
                  value={settings.site_url}
                  onChange={(e) => setSettings({ ...settings, site_url: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:ring-1 focus:ring-red-500 outline-hidden"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase">Favicon Icon Url</label>
                <input 
                  type="text" 
                  placeholder="https://gemiprompts.store/favicon.ico"
                  value={settings.favicon || ''}
                  onChange={(e) => setSettings({ ...settings, favicon: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:ring-1 focus:ring-red-500 outline-hidden"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase">Main Branding Logo Url</label>
                <input 
                  type="text" 
                  placeholder="https://gemiprompts.store/logo.png"
                  value={settings.logo || ''}
                  onChange={(e) => setSettings({ ...settings, logo: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:ring-1 focus:ring-red-500 outline-hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saveLoading}
              className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {saveLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              <span>Save Identity Settings</span>
            </button>
          </form>
        )}

        {/* 3. GLOBAL SEO TAB */}
        {activeSubTab === 'seo' && (
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                Global Metadata Defaults
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Customize default values to display when pages lack explicit custom metadata.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase">Default Title (Max 60 Chars)</label>
                <input 
                  required
                  type="text" 
                  maxLength={60}
                  value={settings.default_title}
                  onChange={(e) => setSettings({ ...settings, default_title: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:ring-1 focus:ring-red-500 outline-hidden"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase">Default Meta Description (Max 160 Chars)</label>
                <textarea 
                  required
                  rows={3}
                  maxLength={160}
                  value={settings.default_description}
                  onChange={(e) => setSettings({ ...settings, default_description: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:ring-1 focus:ring-red-500 outline-hidden leading-relaxed"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase">Default Social Share cover Image</label>
                <input 
                  type="text" 
                  placeholder="https://images.unsplash.com/..."
                  value={settings.default_image || ''}
                  onChange={(e) => setSettings({ ...settings, default_image: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:ring-1 focus:ring-red-500 outline-hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saveLoading}
              className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {saveLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              <span>Save Default Metadata</span>
            </button>
          </form>
        )}

        {/* PAGE-SPECIFIC SEO METADATA SUB-TAB */}
        {activeSubTab === 'page-seo' && (
          <SeoMetadataManager />
        )}

        {/* 4. SEARCH ENGINES SUB-TAB */}
        {activeSubTab === 'search-engines' && (
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                Search Engine Verification Consoles
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Verify site ownership across all major platforms. Injected dynamically inside the {"<head>"} wrapper.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block">Google Site Verification Code</label>
                <input 
                  type="text" 
                  placeholder="google-site-verification=XXXXXXXX"
                  value={settings.google_verification || ''}
                  onChange={(e) => setSettings({ ...settings, google_verification: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:ring-1 focus:ring-red-500 outline-hidden font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block">Bing Webmaster (msvalidate.01)</label>
                <input 
                  type="text" 
                  placeholder="msvalidate.01=XXXXXXXX"
                  value={settings.bing_verification || ''}
                  onChange={(e) => setSettings({ ...settings, bing_verification: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:ring-1 focus:ring-red-500 outline-hidden font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block">Yandex Verification Code</label>
                <input 
                  type="text" 
                  placeholder="yandex-verification=XXXXXXXX"
                  value={settings.yandex_verification || ''}
                  onChange={(e) => setSettings({ ...settings, yandex_verification: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:ring-1 focus:ring-red-500 outline-hidden font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block">Baidu Verification ID</label>
                <input 
                  type="text" 
                  placeholder="baidu-site-verification=XXXXXXXX"
                  value={settings.facebook_verification || ''} // Reused fb or general
                  onChange={(e) => setSettings({ ...settings, facebook_verification: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:ring-1 focus:ring-red-500 outline-hidden font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block">Pinterest Domain Verify Key</label>
                <input 
                  type="text" 
                  placeholder="p:domain_verify=XXXXXXXX"
                  value={settings.pinterest_verification || ''}
                  onChange={(e) => setSettings({ ...settings, pinterest_verification: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:ring-1 focus:ring-red-500 outline-hidden font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block">Facebook Domain Verification Key</label>
                <input 
                  type="text" 
                  placeholder="facebook-domain-verification=XXXXXXXX"
                  value={settings.facebook_verification || ''}
                  onChange={(e) => setSettings({ ...settings, facebook_verification: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:ring-1 focus:ring-red-500 outline-hidden font-mono"
                />
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 p-4 border border-slate-100 space-y-2">
              <span className="text-[10px] font-black text-slate-500 uppercase">Head Meta Injection Preview</span>
              <pre className="text-[10px] font-mono bg-slate-900 text-slate-300 p-3 rounded-lg overflow-x-auto leading-normal">
{`<!-- Google Search Console -->
<meta name="google-site-verification" content="${settings.google_verification || 'XXXXXXXX'}" />

<!-- Bing Webmaster -->
<meta name="msvalidate.01" content="${settings.bing_verification || 'XXXXXXXX'}" />`}
              </pre>
            </div>

            <button
              type="submit"
              disabled={saveLoading}
              className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {saveLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              <span>Save Verification Codes</span>
            </button>
          </form>
        )}

        {/* 5. GOOGLE ANALYTICS TAB */}
        {activeSubTab === 'analytics' && (
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                Google Analytics 4 Setup
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Activate real-time visitor event telemetry tracking via safe script integration.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-700 block">Enable Google Analytics 4</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Toggle tracking script block injection.</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.analytics_enabled}
                  onChange={(e) => setSettings({ ...settings, analytics_enabled: e.target.checked })}
                  className="h-4 w-4 text-red-600 border-slate-300 rounded-md focus:ring-red-500 cursor-pointer"
                />
              </div>

              {settings.analytics_enabled && (
                <div className="space-y-4 pt-3 border-t border-slate-100 animate-fade-in">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase">Measurement ID (e.g. G-XXXXXXXXXX)</label>
                    <input 
                      required
                      type="text" 
                      placeholder="G-K4L3M2N1OP"
                      value={settings.analytics_id || ''}
                      onChange={(e) => setSettings({ ...settings, analytics_id: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:ring-1 focus:ring-red-500 outline-hidden font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-600 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={analyticsOptions.anonymizeIp}
                        onChange={(e) => setAnalyticsOptions({ ...analyticsOptions, anonymizeIp: e.target.checked })}
                        className="h-3.5 w-3.5 text-red-600 rounded-md"
                      />
                      <span>Anonymize IP Adresses (GDPR compliance)</span>
                    </label>

                    <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-600 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={analyticsOptions.debugMode}
                        onChange={(e) => setAnalyticsOptions({ ...analyticsOptions, debugMode: e.target.checked })}
                        className="h-3.5 w-3.5 text-red-600 rounded-md"
                      />
                      <span>Debug Live Mode</span>
                    </label>

                    <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-600 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={analyticsOptions.consentMode}
                        onChange={(e) => setAnalyticsOptions({ ...analyticsOptions, consentMode: e.target.checked })}
                        className="h-3.5 w-3.5 text-red-600 rounded-md"
                      />
                      <span>Consent Mode Integration</span>
                    </label>

                    <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-600 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={analyticsOptions.enhancedMeasurement}
                        onChange={(e) => setAnalyticsOptions({ ...analyticsOptions, enhancedMeasurement: e.target.checked })}
                        className="h-3.5 w-3.5 text-red-600 rounded-md"
                      />
                      <span>Enhanced Custom Measurement</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={saveLoading}
              className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {saveLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              <span>Save Analytics Options</span>
            </button>
          </form>
        )}

        {/* 6. GOOGLE TAG MANAGER TAB */}
        {activeSubTab === 'tag-manager' && (
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                Google Tag Manager Panel
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Configure container execution wrappers. Generates full Header/Body noscript integrations.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-700 block">Enable Google Tag Manager</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Automates header script triggers.</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.gtm_enabled}
                  onChange={(e) => setSettings({ ...settings, gtm_enabled: e.target.checked })}
                  className="h-4 w-4 text-red-600 border-slate-300 rounded-md focus:ring-red-500 cursor-pointer"
                />
              </div>

              {settings.gtm_enabled && (
                <div className="space-y-4 pt-3 border-t border-slate-100 animate-fade-in">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase">Container ID (e.g. GTM-XXXXXXX)</label>
                    <input 
                      required
                      type="text" 
                      placeholder="GTM-N9P8Q7R"
                      value={settings.gtm_id || ''}
                      onChange={(e) => setSettings({ ...settings, gtm_id: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:ring-1 focus:ring-red-500 outline-hidden font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase">Environment</label>
                      <select 
                        value={gtmOptions.environment}
                        onChange={(e) => setGtmOptions({ ...gtmOptions, environment: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs bg-white cursor-pointer"
                      >
                        <option>Live</option>
                        <option>Staging</option>
                        <option>Dev Sandbox</option>
                      </select>
                    </div>

                    <div className="flex items-center pt-5">
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={gtmOptions.previewMode}
                          onChange={(e) => setGtmOptions({ ...gtmOptions, previewMode: e.target.checked })}
                          className="h-3.5 w-3.5 text-red-600 rounded-md"
                        />
                        <span>Enable Preview Mode</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={saveLoading}
              className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {saveLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              <span>Save GTM Integration</span>
            </button>
          </form>
        )}

        {/* 7. INDEXING MATRIX SUB-TAB */}
        {activeSubTab === 'indexing' && (
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                Search Engine Indexing Control Panel
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Configure metadata tags (Index/NoIndex, Follow/NoFollow) across pages, prompts, blogs, and creator skills.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-xs font-bold text-slate-700 block">Allow Search Engine Indexing (Global)</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Toggle site wide crawlers.</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.indexing_enabled}
                  onChange={(e) => setSettings({ ...settings, indexing_enabled: e.target.checked })}
                  className="h-4 w-4 text-red-600 border-slate-300 rounded-md focus:ring-red-500 cursor-pointer"
                />
              </div>

              {settings.indexing_enabled && (
                <div className="space-y-3 pt-1 animate-fade-in text-xs">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Content Matrix Directive Toggles</span>
                  
                  <div className="border border-slate-100 rounded-lg overflow-hidden divide-y divide-slate-100 font-bold">
                    <div className="grid grid-cols-12 gap-2 bg-slate-50 p-2.5 text-slate-500 text-[10px] uppercase">
                      <span className="col-span-6">Content Type</span>
                      <span className="col-span-3 text-center">Index Status</span>
                      <span className="col-span-3 text-center">Follow Links</span>
                    </div>

                     {(Object.keys(indexingMatrix) as Array<keyof typeof indexingMatrix>).map((key) => {
                       const value = indexingMatrix[key];
                       return (
                         <div key={key} className="grid grid-cols-12 gap-2 p-2.5 items-center">
                           <span className="col-span-6 capitalize text-slate-700">{key}</span>
                           <div className="col-span-3 text-center">
                             <button
                               type="button"
                               onClick={() => setIndexingMatrix({
                                 ...indexingMatrix,
                                 [key]: { ...value, index: !value.index }
                               })}
                               className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase cursor-pointer border ${
                                 value.index 
                                   ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                                   : 'bg-red-50 border-red-100 text-red-700'
                               }`}
                             >
                               {value.index ? 'Index' : 'NoIndex'}
                             </button>
                           </div>
                           <div className="col-span-3 text-center">
                             <button
                               type="button"
                               onClick={() => setIndexingMatrix({
                                 ...indexingMatrix,
                                 [key]: { ...value, follow: !value.follow }
                               })}
                               className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase cursor-pointer border ${
                                 value.follow 
                                   ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                                   : 'bg-red-50 border-red-100 text-red-700'
                               }`}
                             >
                               {value.follow ? 'Follow' : 'NoFollow'}
                             </button>
                           </div>
                         </div>
                       );
                     })}
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={saveLoading}
              className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {saveLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              <span>Save Indexing Schema</span>
            </button>
          </form>
        )}

        {/* 8. ROBOTS.TXT SUB-TAB */}
        {activeSubTab === 'robots' && (
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                  Robots.txt Crawler Directives
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  Configure search engine spider routing. Changes are dynamically served from your database root.
                </p>
              </div>

              {/* Mode Toggle Switch */}
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-bold font-sans shrink-0">
                <button
                  type="button"
                  onClick={() => setIsVisualRobots(true)}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    isVisualRobots 
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200/50' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Visual Builder
                </button>
                <button
                  type="button"
                  onClick={() => setIsVisualRobots(false)}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    !isVisualRobots 
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200/50' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Raw Text
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-600">Crawler Instructions Setup:</span>
              <button
                type="button"
                onClick={handleRestoreDefaultRobots}
                className="text-[10px] font-black text-red-600 hover:underline cursor-pointer"
              >
                Restore Standard Template Defaults
              </button>
            </div>

            {/* Visual Editor Mode */}
            {isVisualRobots ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50/30 p-4 space-y-4">
                  {robotsRules.map((rule, idx) => (
                    <div key={rule.id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3 relative">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                          Directive Block #{idx + 1}
                        </span>
                        {robotsRules.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteRobotsRule(rule.id)}
                            className="text-slate-400 hover:text-red-600 p-1 rounded-lg transition-colors cursor-pointer"
                            title="Remove directive block"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
                        <div className="md:col-span-4">
                          <label className="text-[9px] font-black text-slate-400 uppercase">Target User-Agent *</label>
                          <input
                            required
                            type="text"
                            placeholder="*"
                            value={rule.agent}
                            onChange={(e) => handleUpdateRobotsRule(rule.id, { agent: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs bg-white text-slate-700"
                          />
                        </div>

                        <div className="md:col-span-3">
                          <label className="text-[9px] font-black text-slate-400 uppercase">Crawl-Delay (seconds)</label>
                          <input
                            type="text"
                            placeholder="e.g. 5"
                            value={rule.crawlDelay}
                            onChange={(e) => handleUpdateRobotsRule(rule.id, { crawlDelay: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs bg-white text-slate-700"
                          />
                        </div>

                        <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[9px] font-black text-slate-400 uppercase">Allow Paths (comma-separated)</label>
                            <input
                              type="text"
                              placeholder="/assets/, /images/"
                              value={rule.allow}
                              onChange={(e) => handleUpdateRobotsRule(rule.id, { allow: e.target.value })}
                              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs bg-white text-slate-700 font-mono"
                            />
                          </div>

                          <div>
                            <label className="text-[9px] font-black text-slate-400 uppercase">Disallow Directories (comma-separated)</label>
                            <input
                              type="text"
                              placeholder="/admin/, /private/, /temp/"
                              value={rule.disallow}
                              onChange={(e) => handleUpdateRobotsRule(rule.id, { disallow: e.target.value })}
                              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs bg-white text-slate-700 font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddRobotsRule}
                    className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 bg-white text-slate-600 hover:text-red-600 hover:border-red-500 hover:bg-red-50/20 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Crawl Directive Block</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Raw Code Editor Mode */
              <div className="space-y-3">
                <textarea 
                  rows={9}
                  value={settings.robots_content}
                  onChange={(e) => {
                    setSettings({ ...settings, robots_content: e.target.value });
                    validateRobotsTextSyntax(e.target.value);
                  }}
                  className="w-full rounded-lg border border-slate-300 p-4 text-xs font-mono bg-slate-950 text-slate-200 leading-relaxed focus:ring-1 focus:ring-red-500"
                />
              </div>
            )}

            {/* Syntax Validation Alerts box */}
            {robotsValidationErrors.length > 0 ? (
              <div className="p-4 rounded-xl border border-red-100 bg-red-50/50 text-[11px] font-semibold text-red-800 space-y-1.5">
                <div className="flex items-center gap-1.5 text-red-700 font-bold uppercase tracking-wider text-[10px]">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                  <span>Validation Warning: {robotsValidationErrors.length} Issue(s) Found</span>
                </div>
                <ul className="list-disc pl-5 space-y-0.5 text-red-700 font-medium">
                  {robotsValidationErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="p-3.5 rounded-lg border border-emerald-100 bg-emerald-50/50 text-[11px] font-bold text-emerald-800 flex items-start gap-2">
                <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Standard syntax verified! Visual configurations compiled dynamically and stored with clean directive hierarchies.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={saveLoading}
              className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {saveLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              <span>Save Robots.txt Data</span>
            </button>
          </form>
        )}

        {/* 9. SITEMAP CONFIGS SUB-TAB */}
        {activeSubTab === 'sitemap' && (
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                Sitemap Index Configuration
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Configure auto-generation parameters for search-engine indexing directories.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-700 block">Auto-generate Sitemap Index XML</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Recalculate lists on content save.</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.auto_sitemap}
                  onChange={(e) => setSettings({ ...settings, auto_sitemap: e.target.checked })}
                  className="h-4 w-4 text-red-600 border-slate-300 rounded-md focus:ring-red-500 cursor-pointer"
                />
              </div>

              {settings.auto_sitemap && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100 text-xs animate-fade-in">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase">Change Frequency</label>
                    <select 
                      value={sitemapOptions.frequency}
                      onChange={(e) => setSitemapOptions({ ...sitemapOptions, frequency: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 bg-white cursor-pointer"
                    >
                      <option value="always">Always (Real-time)</option>
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily (Recommended)</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase">Default URL priority (0.1 - 1.0)</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      min="0.1" 
                      max="1.0"
                      value={sitemapOptions.priority}
                      onChange={(e) => setSitemapOptions({ ...sitemapOptions, priority: Number(e.target.value) })}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:ring-1 focus:ring-red-500"
                    />
                  </div>

                  <div className="sm:col-span-2 grid grid-cols-2 gap-3 pt-2 font-semibold text-slate-600">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={sitemapOptions.includeImages}
                        onChange={(e) => setSitemapOptions({ ...sitemapOptions, includeImages: e.target.checked })}
                        className="h-3.5 w-3.5 text-red-600 rounded-md"
                      />
                      <span>Include Image attachments</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={sitemapOptions.includeVideos}
                        onChange={(e) => setSitemapOptions({ ...sitemapOptions, includeVideos: e.target.checked })}
                        className="h-3.5 w-3.5 text-red-600 rounded-md"
                      />
                      <span>Include Video Concepts</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={sitemapOptions.includeCategories}
                        onChange={(e) => setSitemapOptions({ ...sitemapOptions, includeCategories: e.target.checked })}
                        className="h-3.5 w-3.5 text-red-600 rounded-md"
                      />
                      <span>Include Categories</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={sitemapOptions.includeTags}
                        onChange={(e) => setSitemapOptions({ ...sitemapOptions, includeTags: e.target.checked })}
                        className="h-3.5 w-3.5 text-red-600 rounded-md"
                      />
                      <span>Include Keyword Tags</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Sitemap index URLs list */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
                <span className="text-[10px] font-black text-slate-500 uppercase block">Available Sitemap XML Files</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono font-semibold">
                  {[
                    'sitemap.xml',
                    'pages.xml',
                    'blogs.xml',
                    'prompts.xml',
                    'skills.xml',
                    'videos.xml',
                    'categories.xml',
                    'images.xml'
                  ].map((file) => (
                    <a 
                      key={file}
                      href={`${settings.site_url || 'https://gemiprompts.store'}/${file}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="p-2 rounded-lg bg-white border border-slate-200 hover:border-red-600 transition-colors flex items-center justify-between text-slate-600 hover:text-red-600 cursor-pointer"
                    >
                      <span className="truncate">{file}</span>
                      <ArrowRight className="h-3 w-3 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={saveLoading}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {saveLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                <span>Save Sitemap Configuration</span>
              </button>

              <button
                type="button"
                onClick={handleGenerateSitemaps}
                disabled={sitemapGenerating}
                className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {sitemapGenerating ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                <span>Generate & Export Sitemaps Now</span>
              </button>
            </div>
          </form>
        )}

        {/* 10. REDIRECTS MANAGER SUB-TAB */}
        {activeSubTab === 'redirects' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                  Enterprise Redirection Suite
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  Manage redirects, catch loop chains, and audit crawler hits live.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsImportOpen(!isImportOpen)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer flex items-center gap-1.5"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Bulk Import</span>
                </button>
              </div>
            </div>

            {/* Bulk Import Area */}
            {isImportOpen && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-4 animate-fade-in">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-500 uppercase">Paste redirects (One per line: old,new,code,notes)</span>
                  <button 
                    onClick={() => setIsImportOpen(false)} 
                    className="text-xs text-slate-400 hover:text-slate-600 font-bold"
                  >
                    Close
                  </button>
                </div>
                <textarea
                  rows={4}
                  placeholder={`/old-about-us\t/about\t301\tOld about page redirect\n/docs/concept\t/skills/concepts\t301\tMoved slug`}
                  value={pasteImport}
                  onChange={(e) => setPasteImport(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-3 text-xs font-mono bg-white focus:outline-hidden focus:ring-1 focus:ring-red-500 leading-normal"
                />
                <button
                  onClick={handleBulkImport}
                  disabled={saveLoading}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 cursor-pointer disabled:opacity-50"
                >
                  Parse & Import Redirect Pairs
                </button>
              </div>
            )}

            {/* Create redirect form */}
            <form onSubmit={handleAddRedirect} className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block border-b border-slate-100 pb-2">
                Create Permanent or Temporary Redirect Rule
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-5">
                  <label className="text-[9px] font-black text-slate-400 uppercase">Source Path *</label>
                  <input 
                    required
                    type="text" 
                    placeholder="/old-slug"
                    value={newRedirect.old_url}
                    onChange={(e) => setNewRedirect({ ...newRedirect, old_url: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <div className="sm:col-span-5">
                  <label className="text-[9px] font-black text-slate-400 uppercase">Destination Path *</label>
                  <input 
                    required
                    type="text" 
                    placeholder="/prompts/new-slug"
                    value={newRedirect.new_url}
                    onChange={(e) => setNewRedirect({ ...newRedirect, new_url: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase">Type</label>
                  <select
                    value={newRedirect.type}
                    onChange={(e) => setNewRedirect({ ...newRedirect, type: Number(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs bg-white cursor-pointer"
                  >
                    <option value={301}>301 Perm</option>
                    <option value={302}>302 Temp</option>
                    <option value={307}>307 Temp</option>
                    <option value={308}>308 Perm</option>
                  </select>
                </div>
                <div className="sm:col-span-10">
                  <input 
                    type="text" 
                    placeholder="Optional administrative annotation notes..."
                    value={newRedirect.notes}
                    onChange={(e) => setNewRedirect({ ...newRedirect, notes: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <div className="sm:col-span-2 flex items-end">
                  <button
                    type="submit"
                    disabled={saveLoading}
                    className="w-full rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold py-1.5 text-xs cursor-pointer flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Create</span>
                  </button>
                </div>
              </div>
            </form>

            {/* List Table */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden text-xs">
              
              <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center gap-3 justify-between bg-slate-50/50">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search redirection rules..."
                    value={redirectSearch}
                    onChange={(e) => setRedirectSearch(e.target.value)}
                    className="pl-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs"
                  />
                </div>
                <span className="text-[10px] font-black text-slate-500 font-mono shrink-0">
                  {filteredRedirects.length} Active Redirection Rules
                </span>
              </div>

              {filteredRedirects.length === 0 ? (
                <div className="py-12 text-center text-slate-400 font-bold">
                  <Link2 className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <span>No redirects registered yet</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full divide-y divide-slate-100 text-left">
                    <thead className="bg-slate-50 text-[10px] text-slate-400 uppercase font-black">
                      <tr>
                        <th className="px-4 py-3">Source URL</th>
                        <th className="px-4 py-3">Destination</th>
                        <th className="px-4 py-3 text-center">Type</th>
                        <th className="px-4 py-3 text-center">Hits</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-bold">
                      {filteredRedirects.map((redir) => (
                        <tr key={redir.id} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-mono text-[11px] text-slate-700 max-w-[200px] truncate" title={redir.old_url}>
                            {redir.old_url}
                          </td>
                          <td className="px-4 py-3 font-mono text-[11px] text-red-600 max-w-[200px] truncate" title={redir.new_url}>
                            {redir.new_url}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] text-slate-600 font-bold">
                              {redir.type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-slate-500 font-mono">
                            {redir.hits}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleDeleteRedirect(redir.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                              title="Delete rule"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          </div>
        )}

        {/* 11. SECURITY HEADERS SUB-TAB */}
        {activeSubTab === 'security' && (
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                HTTP Security & Integrity Headers
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Establish high-end security rules. Minimizes threat matrix profiles across index pages.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block">Content Security Policy (CSP)</label>
                <textarea 
                  rows={3}
                  value={securityHeaders.csp}
                  onChange={(e) => setSecurityHeaders({ ...securityHeaders, csp: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-mono bg-slate-50 leading-relaxed focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase">HSTS Protocol Policy</label>
                  <input 
                    type="text" 
                    value={securityHeaders.hsts}
                    onChange={(e) => setSecurityHeaders({ ...securityHeaders, hsts: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-mono bg-slate-50"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase">X-Frame-Options Wrapper</label>
                  <select 
                    value={securityHeaders.xFrame}
                    onChange={(e) => setSecurityHeaders({ ...securityHeaders, xFrame: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs bg-white cursor-pointer"
                  >
                    <option>DENY</option>
                    <option>SAMEORIGIN</option>
                    <option>ALLOW-FROM https://google.com</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saveLoading}
              className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {saveLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              <span>Save Security Protocol</span>
            </button>
          </form>
        )}

        {/* 12. PERFORMANCE OPTIMIZATION SUB-TAB */}
        {activeSubTab === 'performance' && (
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                Search Crawler & Media Performance
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Leverage DNS preconnect, lowercase enforces, and compression controls to capture optimum load metrics.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block border-b border-slate-100 pb-1.5">
                Crawl Domain Sanitization Toggles
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-600">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={crawlPrefs.preventDuplicate}
                    onChange={(e) => setCrawlPrefs({ ...crawlPrefs, preventDuplicate: e.target.checked })}
                    className="h-3.5 w-3.5 text-red-600 rounded-md"
                  />
                  <span>Prevent Duplicate query URLs parameters</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={crawlPrefs.trailingSlash}
                    onChange={(e) => setCrawlPrefs({ ...crawlPrefs, trailingSlash: e.target.checked })}
                    className="h-3.5 w-3.5 text-red-600 rounded-md"
                  />
                  <span>Enforce trailing slash on directories</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={crawlPrefs.lowercaseUrls}
                    onChange={(e) => setCrawlPrefs({ ...crawlPrefs, lowercaseUrls: e.target.checked })}
                    className="h-3.5 w-3.5 text-red-600 rounded-md"
                  />
                  <span>Force lowercase URL structure</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={crawlPrefs.httpsRedirect}
                    onChange={(e) => setCrawlPrefs({ ...crawlPrefs, httpsRedirect: e.target.checked })}
                    className="h-3.5 w-3.5 text-red-600 rounded-md"
                  />
                  <span>Force HTTPS Strict Redirect</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">DNS Prefetch Hints Configuration</span>
                <textarea 
                  rows={2}
                  placeholder="//fonts.googleapis.com&#10;//images.unsplash.com"
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-xs font-mono bg-slate-50 leading-relaxed focus:outline-hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saveLoading}
              className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {saveLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              <span>Save Performance Presets</span>
            </button>
          </form>
        )}

        {/* 13. API KEYS SUB-TAB */}
        {activeSubTab === 'api-keys' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                Search Console & Indexing API Keys
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Link to verification endpoints to ping Google/Bing crawlers or request instant URL inspections.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
              <span className="text-xs font-bold text-slate-700 block">External Webmaster APIs Connected</span>
              
              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div>
                    <span className="font-bold text-slate-700 block">Google Indexing API Client</span>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5">google_indexing_key: ************************</span>
                  </div>
                  <span className="rounded bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-[9px] font-black text-emerald-700 uppercase">Active</span>
                </div>

                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div>
                    <span className="font-bold text-slate-700 block">Bing Webmaster Api Key (IndexNow)</span>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5">bing_indexnow_key: ************************</span>
                  </div>
                  <span className="rounded bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-[9px] font-black text-emerald-700 uppercase">Active</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 14. 404 CRAWL LOGS SUB-TAB */}
        {activeSubTab === 'logs-404' && (() => {
          const filteredLogs = logs404.filter(log => {
            const q = logsSearch.toLowerCase();
            const matchesSearch = (
              log.url.toLowerCase().includes(q) ||
              (log.referer && log.referer.toLowerCase().includes(q)) ||
              (log.user_agent && log.user_agent.toLowerCase().includes(q))
            );

            if (!matchesSearch) return false;

            if (logsFilter === 'unresolved') {
              return !log.resolved;
            }
            if (logsFilter === 'resolved') {
              return !!log.resolved;
            }
            return true;
          });

          const totalHits = logs404.reduce((sum, item) => sum + (item.hits || 0), 0);
          const isAllSelected = filteredLogs.length > 0 && filteredLogs.every(log => selected404Ids.includes(log.id));

          const handleToggleSelectAll = () => {
            if (isAllSelected) {
              setSelected404Ids([]);
            } else {
              setSelected404Ids(filteredLogs.map(log => log.id));
            }
          };

          const handleToggleSelectOne = (id: string) => {
            if (selected404Ids.includes(id)) {
              setSelected404Ids(selected404Ids.filter(i => i !== id));
            } else {
              setSelected404Ids([...selected404Ids, id]);
            }
          };

          return (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                    404 Broken URL Crawl Telemetry Log
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Audit missing pages. Create quick redirections immediately to recover valuable SEO search link rank.
                  </p>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleExport404}
                    disabled={logs404.length === 0}
                    className="rounded-lg border border-slate-200 hover:bg-slate-50 font-bold px-3 py-1.5 text-[10px] uppercase transition-colors cursor-pointer flex items-center gap-1 text-slate-600 disabled:opacity-50"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* 404 Logs Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200/60 bg-slate-50/50 p-4 flex items-center gap-4">
                  <div className="p-3 bg-red-100 text-red-600 rounded-lg">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-black block">Total Unique Missing URLs</span>
                    <strong className="text-lg font-extrabold text-slate-800 font-mono">{logs404.length}</strong>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200/60 bg-slate-50/50 p-4 flex items-center gap-4">
                  <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
                    <Search className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-black block">Total Accumulated Hits</span>
                    <strong className="text-lg font-extrabold text-slate-800 font-mono">{totalHits}</strong>
                  </div>
                </div>
              </div>

              {/* Filtering and Actions Bar */}
              <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
                {/* Status Tabs */}
                <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 self-start">
                  <button
                    type="button"
                    onClick={() => { setLogsFilter('all'); setSelected404Ids([]); }}
                    className={`rounded-md px-3 py-1 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${logsFilter === 'all' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    All ({logs404.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLogsFilter('unresolved'); setSelected404Ids([]); }}
                    className={`rounded-md px-3 py-1 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${logsFilter === 'unresolved' ? 'bg-white text-red-600 shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    Unresolved ({logs404.filter(l => !l.resolved).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLogsFilter('resolved'); setSelected404Ids([]); }}
                    className={`rounded-md px-3 py-1 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${logsFilter === 'resolved' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    Resolved ({logs404.filter(l => l.resolved).length})
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                    <Search className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search 404 URL, Referer, User Agent..."
                    value={logsSearch}
                    onChange={(e) => setLogsSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white"
                  />
                </div>

                {/* Bulk Actions Block */}
                {selected404Ids.length > 0 && (
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg self-start">
                    <span className="text-[10px] font-bold text-slate-500 font-mono">
                      {selected404Ids.length} Selected
                    </span>
                    <button
                      type="button"
                      onClick={handleBulkResolve404}
                      className="rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 text-[9px] uppercase tracking-wide cursor-pointer flex items-center gap-1 shadow-xs"
                    >
                      <Check className="h-3 w-3" />
                      <span>Mark Resolved</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleBulkDelete404}
                      className="rounded bg-red-600 hover:bg-red-700 text-white font-bold px-2.5 py-1 text-[9px] uppercase tracking-wide cursor-pointer flex items-center gap-1 shadow-xs"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Data Table */}
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden text-xs">
                {filteredLogs.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 font-bold">
                    <Check className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                    <span>{logsSearch ? 'No logs match your search filter' : 'No 404 crawl errors recorded under this filter!'}</span>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full divide-y divide-slate-100 text-left">
                      <thead className="bg-slate-50 text-[10px] text-slate-400 uppercase font-black">
                        <tr>
                          <th className="px-4 py-3 w-10">
                            <input
                              type="checkbox"
                              checked={isAllSelected}
                              onChange={handleToggleSelectAll}
                              className="h-3.5 w-3.5 text-red-600 rounded-md cursor-pointer"
                            />
                          </th>
                          <th className="px-4 py-3">Missing URL</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-center">Hits</th>
                          <th className="px-4 py-3">Referer</th>
                          <th className="px-4 py-3">Last Seen</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                        {filteredLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3 text-center">
                              <input
                                type="checkbox"
                                checked={selected404Ids.includes(log.id)}
                                onChange={() => handleToggleSelectOne(log.id)}
                                className="h-3.5 w-3.5 text-red-600 rounded-md cursor-pointer"
                              />
                            </td>
                            <td className="px-4 py-3 font-mono text-[11px] text-slate-800 break-all max-w-[280px]">
                              <div>{log.url}</div>
                              {log.resolved && log.redirect_to && (
                                <div className="text-[10px] text-emerald-600 font-sans flex items-center gap-1 mt-0.5">
                                  <ArrowRight className="h-3 w-3 inline shrink-0 text-emerald-500" />
                                  <span>Redirects to: <strong className="font-mono bg-emerald-50 px-1 py-0.5 rounded border border-emerald-100/60">{log.redirect_to}</strong></span>
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {log.resolved ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-[9px] font-black text-emerald-700 uppercase tracking-wider">
                                  <Check className="h-2.5 w-2.5 shrink-0" />
                                  <span>Resolved</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-100 px-2 py-0.5 text-[9px] font-black text-red-600 uppercase tracking-wider">
                                  <AlertCircle className="h-2.5 w-2.5 shrink-0" />
                                  <span>Unresolved</span>
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center font-mono text-slate-500 text-xs">
                              {log.hits}
                            </td>
                            <td className="px-4 py-3 font-medium text-slate-400 max-w-[150px] truncate" title={log.referer}>
                              {log.referer || 'Direct traffic'}
                            </td>
                            <td className="px-4 py-3 font-medium text-slate-500 text-[11px]">
                              {formatDate(log.last_seen)}
                            </td>
                            <td className="px-4 py-3 text-right flex items-center justify-end gap-1.5 h-full pt-3.5">
                              {!log.resolved ? (
                                <>
                                  <button
                                    onClick={() => handleAddRedirectFrom404(log.url)}
                                    className="rounded bg-red-50 hover:bg-red-100 text-red-600 font-bold px-2 py-1 text-[9px] uppercase transition-colors cursor-pointer"
                                  >
                                    Redirect
                                  </button>
                                  <button
                                    onClick={() => handleToggleResolve404(log.id, !!log.resolved)}
                                    className="rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold px-2 py-1 text-[9px] uppercase transition-colors cursor-pointer"
                                    title="Mark as Resolved"
                                  >
                                    Resolve
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => handleToggleResolve404(log.id, !!log.resolved)}
                                  className="rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-2 py-1 text-[9px] uppercase transition-colors cursor-pointer"
                                  title="Mark as Unresolved (Reopen)"
                                >
                                  Reopen
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete404(log.id)}
                                className="rounded bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 font-bold p-1 transition-colors cursor-pointer"
                                title="Delete Log Entry"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {activeSubTab === 'email-marketing' && (
          <EmailMarketingAdmin />
        )}

        {activeSubTab === 'adsense' && (
          <AdSenseAdmin settings={settings} setSettings={setSettings} />
        )}

      </div>

    </div>
  );
};
