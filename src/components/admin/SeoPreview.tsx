import React, { useState } from 'react';
import { Globe, Share2, AlertCircle, CheckCircle2, Monitor, Smartphone, MessageSquare } from 'lucide-react';
import { SocialPreview } from './SocialPreview';

interface SeoPreviewProps {
  title: string;
  description: string;
  slug: string;
  type: 'prompt' | 'blog' | 'skill' | 'video' | 'category' | 'page';
  image?: string;
  keywords?: string;
}

export const SeoPreview: React.FC<SeoPreviewProps> = ({
  title,
  description,
  slug,
  type,
  image = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
  keywords = ''
}) => {
  const [previewTab, setPreviewTab] = useState<'google-desktop' | 'google-mobile' | 'social'>('google-desktop');

  // Compute SEO Score and Warnings
  const displayTitle = title || 'Untitled Asset';
  const displayDesc = description || 'Please write a compelling meta description to improve click-through-rates in search engines...';
  const displaySlug = slug || 'untitled-slug';

  const titleLength = displayTitle.length;
  const descLength = displayDesc.length;

  const warnings: string[] = [];
  const achievements: string[] = [];
  let score = 100;

  // Title validation
  if (titleLength === 0 || displayTitle === 'Untitled Asset') {
    score -= 25;
    warnings.push('Title is missing.');
  } else if (titleLength < 15) {
    score -= 10;
    warnings.push(`Title is too short (${titleLength} chars). Ideal length is 30–60.`);
  } else if (titleLength > 60) {
    score -= 10;
    warnings.push(`Title is too long (${titleLength} chars). Search engines will truncate it above 60.`);
  } else {
    achievements.push('Title length is optimized (15–60 characters).');
  }

  // Description validation
  if (descLength === 0 || displayDesc.startsWith('Please write')) {
    score -= 25;
    warnings.push('Meta description is missing.');
  } else if (descLength < 110) {
    score -= 10;
    warnings.push(`Meta description is too short (${descLength} chars). Ideal length is 110–160.`);
  } else if (descLength > 160) {
    score -= 10;
    warnings.push(`Meta description is too long (${descLength} chars). It will truncate in search results above 160.`);
  } else {
    achievements.push('Meta description is perfectly optimized (110–160 characters).');
  }

  // Slug check
  if (!slug) {
    score -= 10;
    warnings.push('Slug is not generated.');
  } else if (/[^a-z0-9-]/.test(slug)) {
    score -= 15;
    warnings.push('Slug contains invalid characters. Use lowercase letters, numbers, and hyphens only.');
  } else {
    achievements.push('Slug is valid and URL-friendly.');
  }

  // Focus keywords check
  const keywordList = keywords ? keywords.split(',').map(k => k.trim()).filter(Boolean) : [];
  if (keywordList.length === 0) {
    score -= 10;
    warnings.push('No SEO keywords declared.');
  } else {
    // Check if primary keyword is in title or description
    const primary = keywordList[0].toLowerCase();
    const inTitle = displayTitle.toLowerCase().includes(primary);
    const inDesc = displayDesc.toLowerCase().includes(primary);
    
    if (inTitle && inDesc) {
      achievements.push(`Primary keyword "${keywordList[0]}" integrated into Title and Description.`);
    } else {
      if (!inTitle) {
        score -= 5;
        warnings.push(`Primary keyword "${keywordList[0]}" not found in the Title.`);
      }
      if (!inDesc) {
        score -= 5;
        warnings.push(`Primary keyword "${keywordList[0]}" not found in the Meta Description.`);
      }
    }
  }

  // Cap score range
  const finalScore = Math.max(10, Math.min(100, score));

  // Determine score colors
  const getScoreColor = (s: number) => {
    if (s >= 85) return { text: 'text-emerald-600', border: 'border-emerald-200', bg: 'bg-emerald-50' };
    if (s >= 60) return { text: 'text-amber-600', border: 'border-amber-200', bg: 'bg-amber-50' };
    return { text: 'text-red-600', border: 'border-red-200', bg: 'bg-red-50' };
  };

  const scoreTheme = getScoreColor(finalScore);

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 mt-6 space-y-5">
      
      {/* Header with SEO Score */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-4">
        <div>
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
            <Globe className="h-4 w-4 text-slate-500" />
            <span>Master SEO Engine & Visual Preview</span>
          </h4>
          <p className="text-[10px] text-slate-500 font-medium mt-1">
            Validates character lengths, URL guidelines, and previews page presentation on search engines.
          </p>
        </div>

        {/* Score Ring / Pill */}
        <div className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 ${scoreTheme.bg} ${scoreTheme.border}`}>
          <div className="text-right">
            <p className="text-[9px] font-bold text-slate-500 uppercase leading-none">SEO Rating</p>
            <p className={`text-sm font-black mt-0.5 leading-none ${scoreTheme.text}`}>{finalScore}%</p>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div className="text-left">
            <span className={`text-[10px] font-black uppercase ${scoreTheme.text}`}>
              {finalScore >= 85 ? 'Optimized' : finalScore >= 60 ? 'Warning' : 'Critical'}
            </span>
          </div>
        </div>
      </div>

      {/* Warning/Achievement List */}
      {(warnings.length > 0 || achievements.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-36 overflow-y-auto pr-1 text-[10px] font-semibold border-b border-slate-200/60 pb-4">
          {/* Achievements */}
          {achievements.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[9px] font-black text-emerald-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Optimizations Passed
              </p>
              {achievements.map((item, idx) => (
                <div key={idx} className="flex items-start gap-1 text-slate-700">
                  <span className="text-emerald-500 text-xs leading-none">✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          )}

          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[9px] font-black text-red-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> Recommended Fixes
              </p>
              {warnings.map((item, idx) => (
                <div key={idx} className="flex items-start gap-1 text-slate-700">
                  <span className="text-red-500 text-xs leading-none">!</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Simulator Interface Toggle */}
      <div className="flex gap-1.5 border-b border-slate-200 pb-px">
        <button
          type="button"
          onClick={() => setPreviewTab('google-desktop')}
          className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all rounded-t-lg -mb-px border-t border-x ${
            previewTab === 'google-desktop'
              ? 'bg-white border-slate-200 text-slate-900 border-b-2 border-b-white z-10'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Monitor className="h-3 w-3" />
          <span>Google Desktop</span>
        </button>
        <button
          type="button"
          onClick={() => setPreviewTab('google-mobile')}
          className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all rounded-t-lg -mb-px border-t border-x ${
            previewTab === 'google-mobile'
              ? 'bg-white border-slate-200 text-slate-900 border-b-2 border-b-white z-10'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Smartphone className="h-3 w-3" />
          <span>Google Mobile</span>
        </button>
        <button
          type="button"
          onClick={() => setPreviewTab('social')}
          className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all rounded-t-lg -mb-px border-t border-x ${
            previewTab === 'social'
              ? 'bg-white border-slate-200 text-slate-900 border-b-2 border-b-white z-10'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Share2 className="h-3 w-3" />
          <span>Social Share Preview</span>
        </button>
      </div>

      {/* Simulated Preview Rendering */}
      {previewTab !== 'social' ? (
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-inner min-h-32 flex items-center animate-fade-in">
          
          {/* GOOGLE DESKTOP SIMULATION */}
          {previewTab === 'google-desktop' && (
            <div className="w-full text-left space-y-1">
              {/* Breadcrumb line */}
              <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono truncate">
                <span>https://gemiprompts.store</span>
                <span>›</span>
                <span>{type}s</span>
                <span>›</span>
                <span className="text-slate-400 font-bold">{displaySlug}</span>
              </div>
              {/* SERP Title */}
              <h5 className="text-[17px] leading-tight font-medium text-blue-800 hover:underline cursor-pointer font-sans truncate">
                {displayTitle.slice(0, 60)}
                {titleLength > 60 && '...'}
              </h5>
              {/* Snippet Meta Description */}
              <p className="text-[12px] text-slate-600 font-sans leading-relaxed break-words line-clamp-2">
                {displayDesc}
              </p>
            </div>
          )}

          {/* GOOGLE MOBILE SIMULATION */}
          {previewTab === 'google-mobile' && (
            <div className="w-full text-left space-y-1.5 font-sans">
              {/* Favicon & Site Name */}
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-slate-900 text-white font-black text-[9px] flex items-center justify-center border border-slate-100 shadow-sm shrink-0">
                  GP
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-800 leading-none">GemiPrompts.store</p>
                  <p className="text-[9px] text-slate-400 leading-none mt-0.5">https://gemiprompts.store › {type}s › {displaySlug}</p>
                </div>
              </div>
              {/* SERP Title */}
              <h5 className="text-[18px] leading-snug font-bold text-indigo-900 hover:underline cursor-pointer">
                {displayTitle}
              </h5>
              {/* Snippet Meta Description */}
              <p className="text-[11px] text-slate-600 leading-relaxed font-normal line-clamp-3">
                {displayDesc}
              </p>
            </div>
          )}

        </div>
      ) : (
        <SocialPreview
          title={displayTitle}
          description={displayDesc}
          image={image}
          slug={displaySlug}
          type={type}
        />
      )}

    </div>
  );
};
