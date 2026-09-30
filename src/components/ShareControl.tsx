import React, { useState, useRef, useEffect } from 'react';
import { Share2, Twitter, Facebook, Linkedin, MessageCircle, Copy, Check, Smartphone, ExternalLink } from 'lucide-react';
import { cmsService } from '../services/cmsService';
import { useApp } from '../context/AppContext';

interface ShareControlProps {
  contentType: 'prompt' | 'skill' | 'video' | 'blog';
  contentId: string;
  slug: string;
  title: string;
  thumbnail: string;
  label?: string;
  className?: string;
  inline?: boolean;
}

export const ShareControl: React.FC<ShareControlProps> = ({
  contentType,
  contentId,
  slug,
  title,
  thumbnail,
  label = 'Share',
  className = '',
  inline = false,
}) => {
  const { user, showNotification } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Construct clean canonical URL
  const getCanonicalUrl = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    let pathPrefix = contentType as string;
    if (contentType === 'prompt') pathPrefix = 'prompts';
    else if (contentType === 'skill') pathPrefix = 'skills';
    else if (contentType === 'video') pathPrefix = 'videos';
    else if (contentType === 'blog') pathPrefix = 'blog';
    return `${origin}/${pathPrefix}/${slug}`;
  };

  const handleCopyLink = () => {
    const url = getCanonicalUrl();
    navigator.clipboard.writeText(url);
    setCopied(true);
    showNotification('Direct link copied to clipboard!', 'success');
    cmsService.logShareEvent(contentType, contentId, 'copy_link', user?.id || null);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareClick = async (platform: string) => {
    cmsService.logShareEvent(contentType, contentId, platform, user?.id || null);
    const url = getCanonicalUrl();
    const shareTitle = `${title} — Promptat Online`;

    if (platform === 'native') {
      if (navigator.share) {
        try {
          await navigator.share({
            title: shareTitle,
            text: `${title} - Promptat Online`,
            url,
          });
          showNotification('Shared successfully!', 'success');
        } catch (err) {
          // User cancelled native share or not allowed
          console.warn('Native share dismissed', err);
        }
      } else {
        handleCopyLink();
      }
      setIsOpen(false);
      return;
    }

    let shareUrl = '';
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(shareTitle);
    const encodedImg = encodeURIComponent(thumbnail);

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}&via=PromptatOnline`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'pinterest':
        shareUrl = `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodedImg}&description=${encodedTitle}`;
        break;
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`;
        break;
      case 'copy_link':
        handleCopyLink();
        setIsOpen(false);
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=450');
    }
    setIsOpen(false);
  };

  const isNativeSupported = typeof navigator !== 'undefined' && !!navigator.share;
  const canonicalUrl = getCanonicalUrl();

  if (inline) {
    return (
      <div className={`flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 border border-slate-150 p-3 w-full sm:w-auto ${className}`}>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1 sm:mr-2">
          Social Share:
        </span>
        <button
          onClick={handleCopyLink}
          className="flex items-center space-x-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-xs"
          title="Copy direct link"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-indigo-500" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
        <button
          onClick={() => handleShareClick('twitter')}
          className="flex items-center space-x-1 rounded-lg border border-sky-100 bg-white px-2.5 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-50 transition-all cursor-pointer shadow-xs"
          title="Post on Twitter"
        >
          <Twitter className="h-3.5 w-3.5 text-sky-500 fill-sky-500" />
          <span>Twitter</span>
        </button>
        <button
          onClick={() => handleShareClick('linkedin')}
          className="flex items-center space-x-1 rounded-lg border border-blue-100 bg-white px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50 transition-all cursor-pointer shadow-xs"
          title="Post on LinkedIn"
        >
          <Linkedin className="h-3.5 w-3.5 text-blue-600 fill-blue-600" />
          <span>LinkedIn</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`relative inline-block ${className}`} ref={popoverRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer"
        aria-label="Share content"
      >
        <Share2 className="h-4 w-4 text-indigo-500" />
        <span>{label}</span>
      </button>

      {/* Share Popover Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 z-50 w-72 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xl animate-fade-in origin-top-right">
          
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Share Direct Link
            </span>
            <span className="text-[10px] font-extrabold uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              {contentType}
            </span>
          </div>

          {/* Copy Direct Link Box */}
          <div className="mb-3 space-y-1.5">
            <label className="text-[10px] font-semibold text-slate-500 block">
              Direct Link
            </label>
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
              <input
                type="text"
                readOnly
                value={canonicalUrl}
                className="w-full bg-transparent px-2 text-xs text-slate-600 font-mono focus:outline-none truncate"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                onClick={handleCopyLink}
                className="flex items-center space-x-1 shrink-0 rounded-lg bg-indigo-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-1 pt-1 border-t border-slate-100">
            {/* Native Share Option if supported */}
            {isNativeSupported && (
              <button
                onClick={() => handleShareClick('native')}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-bold text-slate-800 hover:bg-indigo-50 hover:text-indigo-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <Smartphone className="h-4 w-4 text-indigo-600" />
                  <span>Share via Device Apps</span>
                </div>
                <ExternalLink className="h-3 w-3 text-slate-400" />
              </button>
            )}

            {/* Platform links */}
            <button
              onClick={() => handleShareClick('twitter')}
              className="flex w-full items-center space-x-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <Twitter className="h-4 w-4 text-sky-500 fill-sky-500" />
              <span>Share on X (Twitter)</span>
            </button>

            <button
              onClick={() => handleShareClick('facebook')}
              className="flex w-full items-center space-x-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <Facebook className="h-4 w-4 text-blue-600 fill-blue-600" />
              <span>Share on Facebook</span>
            </button>

            <button
              onClick={() => handleShareClick('linkedin')}
              className="flex w-full items-center space-x-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <Linkedin className="h-4 w-4 text-sky-700 fill-sky-700" />
              <span>Share on LinkedIn</span>
            </button>

            <button
              onClick={() => handleShareClick('whatsapp')}
              className="flex w-full items-center space-x-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <MessageCircle className="h-4 w-4 text-emerald-500 fill-emerald-500" />
              <span>Send via WhatsApp</span>
            </button>

            <button
              onClick={() => handleShareClick('pinterest')}
              className="flex w-full items-center space-x-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <div className="flex h-4 w-4 items-center justify-center rounded bg-red-600 text-[10px] font-black text-white italic shrink-0">
                P
              </div>
              <span>Pin on Pinterest</span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
