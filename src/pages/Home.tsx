import React from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORIES, getColorClasses } from '../data/categories';
import { getLocalizedCategoryTitle } from '../lib/i18n';
import { Hero } from '../components/sections/Hero';
import { PromptCard } from '../components/cards/PromptCard';
import { SkillCard } from '../components/cards/SkillCard';
import { VideoCard } from '../components/cards/VideoCard';
import { BlogCard } from '../components/cards/BlogCard';
import { NewsletterSubscription } from '../components/sections/NewsletterSubscription';
import { 
  Sparkles, Cpu, Video, BookOpen, ArrowRight, Compass,
  Home as HomeIcon, Code, Search, Ghost, Zap
} from 'lucide-react';
import { AdSlot } from '../components/AdSlot';
import { useSeoMetadata } from '../hooks/useSeoMetadata';

const iconMap: Record<string, React.ComponentType<any>> = {
  Home: HomeIcon,
  Sparkles: Sparkles,
  Code: Code,
  Search: Search,
  Ghost: Ghost,
  Zap: Zap
};

export const Home: React.FC = () => {
  const { prompts, skills, videos, blogs, navigateTo, setSearchQuery, currentLang, t, isRtl } = useApp();

  useSeoMetadata({
    title: t('heroBadge', 'برومبتات أونلاين | Promptat Online - أحدث أوامر ومخططات الذكاء الاصطناعي'),
    description: t('heroSubtitle', 'المكتبة الشاملة لأوامر ومخططات الذكاء الاصطناعي، نماذج صور Midjourney، ومهارات التطوير والتسويق الرقمي.'),
    robots: 'index, follow'
  });

  // Get subset of featured and latest data to avoid clutter
  const featuredPrompts = prompts.slice(0, 3);
  const featuredSkills = skills.slice(0, 3);
  const featuredVideos = videos.slice(0, 2);
  const latestBlogs = blogs.slice(0, 2);

  // Group popular categories for display
  const popularCategories = CATEGORIES.filter(c => 
    ['architecture', 'fantasy', 'coding', 'seo', 'faceless', 'prompt-engineering'].includes(c.slug)
  );

  const handleCategoryClick = (category: typeof CATEGORIES[0]) => {
    setSearchQuery(category.title);
    if (category.type === 'Prompt') navigateTo('prompts');
    else if (category.type === 'Skill') navigateTo('skills');
    else if (category.type === 'Video') navigateTo('videos');
    else if (category.type === 'Blog') navigateTo('blog');
  };

  return (
    <div className="space-y-16 pb-16 bg-[#fafafa]">
      
      {/* Home Header Banner Ad */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
        <AdSlot placement="header-banner" pageType="home" />
      </div>

      {/* Hero Header */}
      <Hero />

      {/* Popular Categories Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-sans text-xl sm:text-2xl font-black text-slate-900">
              {t('exploreCategories', 'Explore Popular Categories')}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {t('exploreCategoriesDesc', 'Select an AI sector to view pre-configured prompt architectures and templates.')}
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {popularCategories.map((cat) => {
            const colorClasses = getColorClasses(cat.color);
            const IconComponent = iconMap[cat.icon] || Compass;
            const localizedTitle = getLocalizedCategoryTitle(cat.slug, currentLang);
            return (
              <div
                key={cat.id}
                onClick={() => handleCategoryClick(cat)}
                className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-6 text-center transition-all hover:-translate-y-1 hover:border-red-200 hover:shadow-sm"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg border shadow-sm transition-transform group-hover:scale-105 ${colorClasses.bg} ${colorClasses.text} ${colorClasses.border}`}>
                  <IconComponent className={`h-6 w-6 ${colorClasses.text}`} />
                </div>
                <h3 className="mt-4 font-sans text-sm font-bold text-slate-800 group-hover:text-[#e21833]">
                  {localizedTitle}
                </h3>
                <span className="mt-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  {cat.type}s
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Latest Image Prompts */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center">
          <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-[#e21833]">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="font-sans text-xl sm:text-2xl font-black text-slate-900">
                {t('latestPrompts', 'Latest Premium Prompts')}
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {t('latestPromptsDesc', 'Copy-pasteable photorealistic prompts complete with seeds, camera parameters, and lighting styles.')}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigateTo('prompts')}
            className="flex items-center space-x-1 rtl:space-x-reverse text-xs font-bold text-[#e21833] hover:text-[#c21124] cursor-pointer"
          >
            <span>{t('seePromptLibrary', 'See prompt library')}</span>
            <ArrowRight className={`h-3.5 w-3.5 ${isRtl ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredPrompts.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>
      </section>

      {/* Popular Skills Banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center">
          <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-[#e21833]">
              <Cpu className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="font-sans text-xl sm:text-2xl font-black text-slate-900">
                {t('devSkills', 'Developer & Writer Skills')}
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {t('devSkillsDesc', 'Downloadable .cursorrules files, multi-step SEO prompts, and full-stack DB architecture schema tools.')}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigateTo('skills')}
            className="flex items-center space-x-1 rtl:space-x-reverse text-xs font-bold text-[#e21833] hover:text-[#c21124] cursor-pointer"
          >
            <span>{t('seeDevSkills', 'See developer skills')}</span>
            <ArrowRight className={`h-3.5 w-3.5 ${isRtl ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredSkills.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      </section>

      {/* Trending Viral Video Concepts (Highlight Feature) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-red-100 bg-red-50/20 p-8">
          <div className="flex flex-col items-start justify-between gap-4 border-b border-red-100/50 pb-5 sm:flex-row sm:items-center">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e21833] text-white shadow-sm shadow-red-100">
                <Video className="h-5.5 w-5.5" />
              </div>
              <div>
                <h2 className="font-sans text-xl sm:text-2xl font-black text-slate-900">
                  {t('trendingVideos', 'Trending Viral Video Blueprints')}
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  {t('trendingVideosDesc', 'The absolute highest-retention concepts, full voice scripts, thumbnail plans, and downloadable resource zip packs.')}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigateTo('videos')}
              className="flex items-center space-x-1 rtl:space-x-reverse text-xs font-bold text-[#e21833] hover:text-[#c21124] cursor-pointer"
            >
              <span>{t('seeVideoPlans', 'See video plans')}</span>
              <ArrowRight className={`h-3.5 w-3.5 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {featuredVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </div>
      </section>

      {/* Newest Blog Posts */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center">
          <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-[#e21833]">
              <BookOpen className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="font-sans text-xl sm:text-2xl font-black text-slate-900">
                {t('guidesTutorials', 'Guides & Tutorials')}
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {t('guidesTutorialsDesc', 'Actionable strategies explaining prompt logic, SEOMultiplier formulas, and short-form channel execution.')}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigateTo('blog')}
            className="flex items-center space-x-1 rtl:space-x-reverse text-xs font-bold text-[#e21833] hover:text-[#c21124] cursor-pointer"
          >
            <span>{t('seeBlogGuidebooks', 'See blog guidebooks')}</span>
            <ArrowRight className={`h-3.5 w-3.5 ${isRtl ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {latestBlogs.map((article) => (
            <BlogCard key={article.id} article={article} />
          ))}
        </div>
      </section>

      {/* High-converting Newsletter Subscription */}
      <NewsletterSubscription />

    </div>
  );
};
