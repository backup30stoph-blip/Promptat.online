import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { BlogCard } from '../components/cards/BlogCard';
import { PromptCard } from '../components/cards/PromptCard';
import { SkillCard } from '../components/cards/SkillCard';
import { FavoriteButton } from '../components/FavoriteButton';
import { ShareControl } from '../components/ShareControl';
import { ScrollProgressBar } from '../components/ScrollProgressBar';
import { CommentsSection } from '../components/CommentsSection';
import { NewsletterSubscription } from '../components/sections/NewsletterSubscription';
import { Skeleton } from '../components/Skeleton';
import { RelatedContent } from '../components/RelatedContent';
import { BlogArticle } from '../types';
import { calculateReadingTime } from '../lib/readingTime';
import { PageNotFound } from './PageNotFound';
import { 
  ArrowLeft, Eye, Heart, BookOpen, Calendar, Share2, 
  ChevronRight, ArrowUpRight, Search
} from 'lucide-react';
import { useSeoMetadata } from '../hooks/useSeoMetadata';
import { AdSlot } from '../components/AdSlot';
import { getLocalizedItem, getLocalizedCategoryTitle } from '../lib/i18n';

export const Blog: React.FC = () => {
  const { 
    user,
    blogs, 
    prompts, 
    skills, 
    activeDetail, 
    navigateTo, 
    toggleLike,
    showNotification,
    currentLang,
    t,
    isRtl
  } = useApp();

  const [isLoading, setIsLoading] = useState(true);
  const [blogSearch, setBlogSearch] = useState('');

  // Memoized search filtering for blog posts
  const filteredBlogs = useMemo(() => {
    if (!blogSearch.trim()) return blogs;
    const query = blogSearch.toLowerCase().trim();
    return blogs.filter(b => 
      b.title.toLowerCase().includes(query) ||
      b.excerpt.toLowerCase().includes(query) ||
      (b.category && b.category.toLowerCase().includes(query))
    );
  }, [blogs, blogSearch]);

  // Determine active blog article for dynamic SEO metadata injection
  const currentBlogForSeo = useMemo(() => {
    if (activeDetail && activeDetail.type === 'blog') {
      return blogs.find(b => b.slug === activeDetail.slug);
    }
    return null;
  }, [activeDetail, blogs]);

  const seoOptions = useMemo(() => {
    if (currentBlogForSeo) {
      return {
        entityType: 'blog' as const,
        entityId: currentBlogForSeo.id,
        title: `${currentBlogForSeo.title} | Promptat Online Blog`,
        description: currentBlogForSeo.description,
        robots: 'index, follow'
      };
    }

    return {
      title: 'مدونة الذكاء الاصطناعي وهندسة الأوامر | Promptat Online',
      description: 'Educational guides, industry secrets, prompt engineering workflows, and advanced AI image generation analysis.',
      robots: 'index, follow'
    };
  }, [currentBlogForSeo]);

  useSeoMetadata(seoOptions);

  // Trigger loading skeleton states for smooth, high-perceived-performance transitions
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [activeDetail, blogSearch]);

  const handleShare = (title: string) => {
    navigator.clipboard.writeText(window.location.href);
    showNotification(`Copied article share link for: ${title}`, 'success');
  };

  // DETAIL ARTICLE VIEW
  if (activeDetail && activeDetail.type === 'blog') {
    const rawArticle = blogs.find(b => b.slug === activeDetail.slug);
    if (!rawArticle) {
      return <PageNotFound type="blog" slug={activeDetail.slug} />;
    }
    const article = getLocalizedItem(rawArticle, currentLang);

    const formattedDate = new Date(article.published_at).toLocaleDateString(currentLang === 'ar' ? 'ar-EG' : currentLang === 'es' ? 'es-ES' : currentLang === 'fr' ? 'fr-FR' : currentLang === 'id' ? 'id-ID' : 'en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    // Related prompts & skills resolved by ID matching
    const relatedPrompts = prompts.filter(p => article.related_prompts?.includes(p.id));
    const relatedSkills = skills.filter(s => article.related_skills?.includes(s.id));

    // Dynamic TOC parsing simple headers
    const tocItems = [
      { text: '1. The Camera and Lens Formula', target: 'formula' },
      { text: '2. Setting the Perfect Aspect Ratio', target: 'aspect' },
      { text: '3. Mastering Cinematic Lighting', target: 'lighting' },
      { text: '4. The Seed Parameter', target: 'seed' }
    ];

    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ScrollProgressBar />
        
        {/* Back Link */}
        <button 
          onClick={() => navigateTo('blog')}
          className="group flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 mb-6 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          <span>{t('backToBlog', 'Back to Blog & Guides')}</span>
        </button>

        {/* Article Container Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Article Main Content (8 columns) */}
          <article className="lg:col-span-8 space-y-6">
            
            {/* Header info */}
            <div className="space-y-4">
              <span className="rounded-lg bg-red-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-red-700">
                {article.category}
              </span>
              
              <h1 className="font-display text-2xl sm:text-4xl font-black text-slate-900 leading-tight">
                {article.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center">
                  <Calendar className="mr-1.5 h-4 w-4" />
                  {formattedDate}
                </span>
                <span>•</span>
                <span className="flex items-center">
                  <BookOpen className="mr-1.5 h-4 w-4" />
                  {calculateReadingTime(article.content)}
                </span>
              </div>
            </div>

            {/* Cover image */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              <img 
                src={article.cover || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'} 
                alt={article.title}
                referrerPolicy="no-referrer"
                className="w-full aspect-16/9 object-cover"
              />
            </div>

            {/* Article Content - rendered with elegant typographic layout */}
            <div className="prose max-w-none text-slate-700 space-y-6 text-sm leading-relaxed md:text-base">
              
              {/* Splitting content lines to display with rich JSX tags */}
              {article.content.split('\n\n').map((para, i, arr) => {
                if (para.startsWith('##')) {
                  return (
                    <h2 key={i} className="font-display text-xl sm:text-2xl font-bold text-slate-900 pt-4">
                      {para.replace('##', '').trim()}
                    </h2>
                  );
                }
                if (para.startsWith('* **')) {
                  // Bullet points
                  return (
                    <ul key={i} className="list-disc pl-5 space-y-2 text-sm sm:text-base">
                      {para.split('\n').map((bullet, idx) => (
                        <li key={idx} className="text-slate-600">
                          {bullet.replace('*', '').trim()}
                        </li>
                      ))}
                    </ul>
                  );
                }
                if (para.startsWith('1.') || para.startsWith('2.') || para.startsWith('3.')) {
                  // Number lists
                  return (
                    <div key={i} className="space-y-2 text-sm sm:text-base">
                      {para.split('\n').map((num, idx) => (
                        <p key={idx} className="text-slate-600">
                          {num.trim()}
                        </p>
                      ))}
                    </div>
                  );
                }
                const isMiddle = i === Math.floor(arr.length * 0.4);
                return (
                  <React.Fragment key={i}>
                    {isMiddle && (
                      <div className="my-6">
                        <AdSlot placement="blog-in-article" pageType="blog" />
                      </div>
                    )}
                    <p className="text-slate-600">
                      {para}
                    </p>
                  </React.Fragment>
                );
              })}

            </div>

            <div className="mt-8 mb-4">
              <AdSlot placement="blog-below-article" pageType="blog" />
            </div>

            {/* Shares and reactions */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-y border-slate-100 py-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => toggleLike('blogs', article.id)}
                  className="flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 cursor-pointer"
                >
                  <Heart className="h-4 w-4 text-rose-500" />
                  <span>Like Article</span>
                </button>
                <FavoriteButton
                  itemType="blog"
                  itemId={article.id}
                  userId={user?.id}
                  showText={true}
                  className="px-4 py-2.5 shadow-sm"
                />
                <ShareControl
                  contentType="blog"
                  contentId={article.id}
                  slug={article.slug}
                  title={article.title}
                  thumbnail={article.cover}
                  label="Share Article"
                  inline={true}
                />
              </div>

              <div className="flex items-center space-x-4 text-xs text-slate-400 font-medium">
                <span>{article.views} views</span>
              </div>
            </div>

            {/* Polymorphic Discussion Board for Blogs */}
            <div className="mt-12 pt-10 border-t border-slate-150">
              <CommentsSection
                contentType="blog"
                contentId={article.id}
              />
            </div>

          </article>

          {/* Sidebar (4 columns) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Table of Contents */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 space-y-4">
              <h3 className="font-display text-xs font-black uppercase tracking-wider text-slate-400">
                Table of Contents
              </h3>
              <nav className="space-y-2.5">
                {tocItems.map((item, idx) => (
                  <a 
                    key={idx} 
                    href="#active"
                    className="flex items-center text-xs font-bold text-slate-600 hover:text-indigo-600 group"
                  >
                    <ChevronRight className="mr-1 h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>{item.text}</span>
                  </a>
                ))}
              </nav>
            </div>

            {/* Author Profile Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                About the Writer
              </span>
              <div className="flex items-center space-x-3">
                <img 
                  src={article.author.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'} 
                  alt={article.author.name}
                  referrerPolicy="no-referrer"
                  className="h-10 w-10 rounded-full object-cover border"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 leading-none">
                    {article.author.name}
                  </h4>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 leading-none">
                    {article.author.role}
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Specializes in reverse-engineering neural networks, writing custom compiler rules, and building content-monetization frameworks.
              </p>
            </div>

            {/* Related Skills Sidebar List (Connected content architecture) */}
            {relatedSkills.length > 0 && (
              <div className="space-y-4">
                <span className="text-xs font-black uppercase tracking-widest text-emerald-500 block">
                  Related Developer Skills
                </span>
                {relatedSkills.map(s => (
                  <div 
                    key={s.id}
                    onClick={() => navigateTo('skills', { type: 'skill', slug: s.slug })}
                    className="group rounded-xl border border-slate-200 bg-white p-3.5 flex items-center justify-between cursor-pointer hover:border-red-200"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                        {s.title}
                      </h4>
                      <span className="text-[9px] font-semibold text-slate-400 block mt-0.5 uppercase">
                        Version {s.version}
                      </span>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-red-600 transition-colors" />
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

        {/* Related Prompts Footer Row (Connected content architecture) */}
        {relatedPrompts.length > 0 && (
          <div className="mt-16 border-t border-slate-100 pt-10">
            <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900 mb-6">
              Prompts Mentioned in This Article
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPrompts.map((prompt) => (
                <PromptCard key={prompt.id} prompt={prompt} />
              ))}
            </div>
          </div>
        )}

        {/* Related Blog Articles Widget */}
        <RelatedContent
          type="blog"
          currentId={article.id}
          category={article.category}
        />

      </div>
    );
  }

  // Render BLOG DIRECTORY
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <ScrollProgressBar />
      
      {/* Title */}
      <div className="border-b border-slate-100 pb-5">
        <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-900">
          {t('navBlog', 'AI Creator Blog & Playbook')}
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {t('guidesTutorialsDesc', 'Step-by-step masterclasses on neural prompting systems, short-form algorithm hacking, and workflow automations.')}
        </p>
      </div>

      {/* Search Filter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-2">
        <div className="relative w-full sm:max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={blogSearch}
            onChange={(e) => setBlogSearch(e.target.value)}
            placeholder={t('searchPlaceholder', 'Search masterclasses, guides, categories...')}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-xs outline-none transition-all focus:border-[#e21833] focus:ring-2 focus:ring-red-100"
          />
        </div>
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          {filteredBlogs.length} / {blogs.length} {t('navBlog', 'Articles')}
        </div>
      </div>

      {/* Blogs list */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton variant="blog-card" count={3} />
        </div>
      ) : filteredBlogs.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBlogs.map((article) => (
            <BlogCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 p-16 text-center bg-white shadow-xs">
          <Search className="mx-auto h-10 w-10 text-slate-400" />
          <h3 className="mt-4 text-sm font-bold text-slate-900">{t('noResultsFound', 'No blog articles found')}</h3>
          <p className="mt-1 text-xs text-slate-500">
            {t('noResultsDesc', "We couldn't find any guides or playbooks matching your query.")}
          </p>
          <button
            onClick={() => setBlogSearch('')}
            className="mt-4 rounded-xl bg-[#e21833] px-4 py-2 text-xs font-semibold text-white cursor-pointer hover:bg-red-700 transition-all"
          >
            {t('resetFilters', 'Clear Search')}
          </button>
        </div>
      )}

      {/* Newsletter Subscription Banner */}
      <div className="pt-6">
        <NewsletterSubscription />
      </div>

    </div>
  );
};
