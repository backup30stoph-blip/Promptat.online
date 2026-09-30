import React, { useState } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Send, 
  Bookmark, 
  MoreHorizontal, 
  ThumbsUp, 
  Share2, 
  MessageSquare,
  Globe,
  Twitter,
  Facebook,
  Instagram
} from 'lucide-react';

interface SocialPreviewProps {
  title: string;
  description: string;
  image?: string;
  slug?: string;
  type?: string;
  authorName?: string;
  authorAvatar?: string;
}

export const SocialPreview: React.FC<SocialPreviewProps> = ({
  title,
  description,
  image = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
  slug = 'untitled-asset',
  type = 'Blueprint',
  authorName = 'GemiPrompts Creator',
  authorAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
}) => {
  const [platform, setPlatform] = useState<'instagram' | 'twitter' | 'facebook'>('twitter');

  const displayTitle = title || 'Untitled Asset';
  const displayDesc = description || 'A masterpiece of prompt engineering and structured blueprints, now available on GemiPrompts...';
  const displayImage = image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';
  const shareUrl = `gemiprompts.store/${type.toLowerCase()}s/${slug}`;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      {/* Tab Selectors */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
            <Share2 className="h-4 w-4 text-indigo-500" />
            <span>Social Media Live Preview</span>
          </h4>
          <p className="text-[10px] text-slate-500 mt-1">
            See how your generated SEO content renders when shared organically across major networks.
          </p>
        </div>

        {/* Platform Pill Toggle */}
        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setPlatform('twitter')}
            className={`p-1.5 rounded-md flex items-center justify-center transition-all ${
              platform === 'twitter' 
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Preview on X (Twitter)"
          >
            <Twitter className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setPlatform('facebook')}
            className={`p-1.5 rounded-md flex items-center justify-center transition-all ${
              platform === 'facebook' 
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Preview on Facebook"
          >
            <Facebook className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setPlatform('instagram')}
            className={`p-1.5 rounded-md flex items-center justify-center transition-all ${
              platform === 'instagram' 
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Preview on Instagram"
          >
            <Instagram className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Realistic Mockup Shell */}
      <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 flex items-center justify-center min-h-[350px]">
        
        {/* X / TWITTER CARD PREVIEW */}
        {platform === 'twitter' && (
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-4 font-sans text-[14px] text-slate-900 text-left shadow-sm">
            {/* Header User Row */}
            <div className="flex items-start gap-2.5">
              <img 
                src={authorAvatar} 
                alt={authorName} 
                className="h-10 w-10 rounded-full object-cover shrink-0 border border-slate-100"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 font-bold leading-none text-slate-900">
                  <span className="truncate">{authorName}</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1 py-0.5 rounded-sm font-normal">PRO</span>
                </div>
                <p className="text-[12px] text-slate-500 mt-0.5">@gemiprompts_store · 2h</p>
              </div>
              <button className="text-slate-400 hover:text-slate-600">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>

            {/* Post Caption */}
            <div className="mt-2 text-[14px] leading-relaxed text-slate-800">
              ⚡ Just released a brand new {type.toLowerCase()}! Optimized meta layouts, deep keyword injection, and pre-seeded architectures ready for action. Check out the blueprint below! #GemiPrompts #AI
            </div>

            {/* Twitter Large Summary Card */}
            <div className="mt-3 rounded-2xl border border-slate-200/80 overflow-hidden hover:bg-slate-50/50 cursor-pointer transition-colors duration-200">
              <div className="aspect-[1.91/1] w-full relative bg-slate-100 overflow-hidden">
                <img 
                  src={displayImage} 
                  alt="SEO Social Share Card" 
                  className="w-full h-full object-cover object-center"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';
                  }}
                />
              </div>
              <div className="p-3 border-t border-slate-100 space-y-0.5">
                <p className="text-[11px] text-slate-500 uppercase tracking-tight font-medium">{shareUrl}</p>
                <h5 className="text-[13.5px] font-bold text-slate-900 leading-snug line-clamp-1">{displayTitle}</h5>
                <p className="text-[12px] text-slate-500 leading-snug line-clamp-2">{displayDesc}</p>
              </div>
            </div>

            {/* Engagement Icons Row */}
            <div className="mt-3 flex items-center justify-between text-slate-500 text-[12px] max-w-sm pt-1.5 border-t border-slate-100">
              <div className="flex items-center gap-1.5 hover:text-blue-500 cursor-pointer transition-colors">
                <MessageSquare className="h-4 w-4" />
                <span>12</span>
              </div>
              <div className="flex items-center gap-1.5 hover:text-green-500 cursor-pointer transition-colors">
                <Share2 className="h-4 w-4" />
                <span>8</span>
              </div>
              <div className="flex items-center gap-1.5 hover:text-rose-500 cursor-pointer transition-colors">
                <Heart className="h-4 w-4" />
                <span>48</span>
              </div>
              <div className="flex items-center gap-1.5 hover:text-blue-500 cursor-pointer transition-colors">
                <Bookmark className="h-4 w-4" />
                <span>15</span>
              </div>
            </div>
          </div>
        )}

        {/* FACEBOOK NEWS FEED PREVIEW */}
        {platform === 'facebook' && (
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-xl p-4 font-sans text-left shadow-sm">
            {/* Header row */}
            <div className="flex items-center gap-2.5">
              <img 
                src={authorAvatar} 
                alt={authorName} 
                className="h-10 w-10 rounded-full object-cover shrink-0 border"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 min-w-0">
                <h5 className="text-[14px] font-bold text-slate-900 leading-none">GemiPrompts.store</h5>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                  <span>Sponsored</span>
                  <span>·</span>
                  <Globe className="h-3 w-3" />
                </div>
              </div>
              <button className="text-slate-400 hover:text-slate-600">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>

            {/* Post text */}
            <p className="mt-2.5 text-[13.5px] leading-relaxed text-slate-800">
              Discover premium prompt collections, Cursor configuration rules, and advanced playbooks built by leading creators. Enhance your pipeline with high-fidelity outputs instantly. 🌟🚀
            </p>

            {/* Large link preview card */}
            <div className="mt-3 rounded-md border border-slate-200 overflow-hidden cursor-pointer bg-slate-50">
              <div className="aspect-[1.91/1] w-full relative overflow-hidden bg-slate-200">
                <img 
                  src={displayImage} 
                  alt="SEO Metadata Share" 
                  className="w-full h-full object-cover object-center"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';
                  }}
                />
              </div>
              <div className="p-3 bg-[#f2f3f5] border-t border-slate-150">
                <p className="text-[11px] text-slate-500 uppercase tracking-tight">GEMIPROMPTS.STORE</p>
                <h5 className="text-[14px] font-bold text-slate-950 leading-snug mt-1 line-clamp-1">{displayTitle}</h5>
                <p className="text-[12px] text-slate-600 leading-snug mt-0.5 line-clamp-2">{displayDesc}</p>
              </div>
            </div>

            {/* Post Reactions bar */}
            <div className="mt-3 flex items-center justify-between text-[12px] text-slate-500 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className="flex items-center justify-center bg-blue-500 text-white rounded-full h-4.5 w-4.5 text-[9px] font-bold shadow-xs">👍</span>
                <span className="flex items-center justify-center bg-rose-500 text-white rounded-full h-4.5 w-4.5 text-[9px] font-bold -ml-1.5 shadow-xs">❤️</span>
                <span>132 Likes</span>
              </div>
              <div className="flex gap-2">
                <span>18 Comments</span>
                <span>·</span>
                <span>4 Shares</span>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="mt-2 grid grid-cols-3 gap-1 text-[12.5px] text-slate-600 font-semibold pt-0.5">
              <button className="flex items-center justify-center gap-1.5 py-1.5 rounded-md hover:bg-slate-50 active:bg-slate-100 cursor-pointer">
                <ThumbsUp className="h-4 w-4 text-slate-500" />
                <span>Like</span>
              </button>
              <button className="flex items-center justify-center gap-1.5 py-1.5 rounded-md hover:bg-slate-50 active:bg-slate-100 cursor-pointer">
                <MessageCommentIcon className="h-4 w-4 text-slate-500" />
                <span>Comment</span>
              </button>
              <button className="flex items-center justify-center gap-1.5 py-1.5 rounded-md hover:bg-slate-50 active:bg-slate-100 cursor-pointer">
                <ShareArrowIcon className="h-4 w-4 text-slate-500" />
                <span>Share</span>
              </button>
            </div>
          </div>
        )}

        {/* INSTAGRAM POST FEED PREVIEW */}
        {platform === 'instagram' && (
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-xl overflow-hidden font-sans text-left shadow-sm">
            {/* Insta Header */}
            <div className="flex items-center justify-between p-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <img 
                  src={authorAvatar} 
                  alt={authorName} 
                  className="h-8 w-8 rounded-full object-cover p-0.5 border border-pink-500 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h5 className="text-[12.5px] font-bold text-slate-900 leading-none flex items-center gap-1">
                    <span>gemiprompts_official</span>
                    <span className="text-blue-500 text-[10px]">●</span>
                  </h5>
                  <p className="text-[10px] text-slate-500 leading-none mt-0.5">GemiPrompts Studio</p>
                </div>
              </div>
              <button className="text-slate-700">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>

            {/* Visual Feed Post Image */}
            <div className="aspect-square bg-slate-50 relative overflow-hidden">
              <img 
                src={displayImage} 
                alt="Instagram Feed Image" 
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';
                }}
              />
            </div>

            {/* Engagement Panel */}
            <div className="p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-slate-800">
                  <button className="hover:text-red-500 transition-colors cursor-pointer">
                    <Heart className="h-5 w-5" />
                  </button>
                  <button className="hover:text-slate-500 transition-colors cursor-pointer">
                    <MessageCircle className="h-5 w-5" />
                  </button>
                  <button className="hover:text-slate-500 transition-colors cursor-pointer">
                    <Send className="h-5 w-5" />
                  </button>
                </div>
                <button className="hover:text-slate-500 text-slate-800 transition-colors cursor-pointer">
                  <Bookmark className="h-5 w-5" />
                </button>
              </div>

              {/* Likes counter */}
              <p className="text-[12.5px] font-extrabold text-slate-950">254 likes</p>

              {/* Caption markup with author */}
              <div className="text-[12px] leading-relaxed text-slate-800 space-y-1">
                <p>
                  <span className="font-extrabold text-slate-950 mr-1.5">gemiprompts_official</span>
                  🌟 <span className="font-extrabold text-slate-900">{displayTitle}</span> is now officially live! {displayDesc}
                </p>
                <p className="text-[11px] text-slate-500 font-mono mt-1">{shareUrl}</p>
              </div>

              {/* Date tag */}
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider mt-1.5">2 HOURS AGO</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

// Simple visual fallback helpers for lucide-react missing items
const MessageCommentIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const ShareArrowIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);
