import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../data/categories';
import { PromptCard } from '../components/cards/PromptCard';
import { MinimalPromptCard } from '../components/cards/MinimalPromptCard';
import { FavoriteButton } from '../components/FavoriteButton';
import { Skeleton } from '../components/Skeleton';
import { AIPrompt } from '../types';
import { PageNotFound } from './PageNotFound';
import { 
  Search, SlidersHorizontal, ArrowLeft, Copy, Check, Download, 
  Eye, Heart, Bookmark, Layers 
} from 'lucide-react';
import { useSeoMetadata } from '../hooks/useSeoMetadata';
import { ShareControl } from '../components/ShareControl';
import { CommentsSection } from '../components/CommentsSection';
import { RelatedContent } from '../components/RelatedContent';
import { ScrollProgressBar } from '../components/ScrollProgressBar';
import { AdSlot } from '../components/AdSlot';
import { getLocalizedCategoryTitle, getLocalizedItem } from '../lib/i18n';

export const Prompts: React.FC = () => {
  const { 
    user,
    prompts, 
    activeDetail, 
    navigateTo, 
    state, 
    toggleLike, 
    toggleBookmark, 
    registerDownload, 
    showNotification,
    searchQuery,
    setSearchQuery,
    currentLang,
    t,
    isRtl
  } = useApp();

  // Filter and Search States
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedModel, setSelectedModel] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('likes');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [commentsCount, setCommentsCount] = useState(0);
  const [isLoading, useStateIsLoading] = useState(true);

  // Define unique landing page combinations with dedicated supporting content
  const activeLandingPage = useMemo(() => {
    if (selectedCategory === 'architecture' && selectedModel === 'midjourney') {
      return {
        title: 'Modern Architecture Formulas for Midjourney',
        subtitle: 'Achieve photorealistic architectural visualization, volumetric sunbeams, and structural fidelity using precise camera seeds and material cues.',
        keyword: 'architecture midjourney',
        desc: 'Master photorealistic and biophilic architectural renderings with custom Midjourney prompt seeds. Perfect for luxury villas and interior design blueprinting.',
        formula: '{structural style} villa by {architect}, structural glass, raw concrete, biophilic lush landscaping, shot on 35mm lens, morning golden hour light, --ar 16:9 --v 6.0',
        focus: ['Neoclassical columns', 'Structural concrete textures', 'Panoramic glazing', 'Volumetric shafts of light']
      };
    }
    if (selectedCategory === 'fantasy' && selectedModel === 'flux') {
      return {
        title: 'High-Fidelity Fantasy Illustration Formulas for Flux.1',
        subtitle: 'Unlocking cinematic depth of field, dramatic armor metal specular highlights, and mythical beast rendering with incredible prompt obedience.',
        keyword: 'fantasy flux',
        desc: 'Explore stunning high-fantasy prompt blueprints for Flux.1. Generate mythical dragons, ethereal elven warriors, and runic spellcasters with exact text coherence.',
        formula: 'epic high-fantasy illustration of {subject}, detailed runic armor, glowing mystical runes, dynamic combat pose, dramatic backlight, volumetric smoke, high contrast, 8k resolution',
        focus: ['Text coherence on magic scrolls', 'Intricate plate-mail metalwork', 'High-contrast lighting', 'Legendary beast scale textures']
      };
    }
    if (selectedCategory === 'cinematic' && selectedModel === 'midjourney') {
      return {
        title: 'Cinematic Film Still Blueprints for Midjourney v6',
        subtitle: 'Mastering anamorphic lenses, film grain emulation, teal-and-orange split-toning, and dramatic chiaroscuro key lighting.',
        keyword: 'cinematic midjourney',
        desc: 'Create breathtaking movie-still aesthetics with advanced cinematic Midjourney prompt codes. Formulate perfect anamorphic flares and dramatic character closeups.',
        formula: 'cinematic film still of {character action}, anamorphic lens flare, Kodak Vision3 500T 35mm, shot at t/1.8, cinematic key light, dramatic split-toning, movie grading --ar 2.39:1 --style raw',
        focus: ['Anamorphic lens distortion', 'Volumetric night-rain mist', 'Perfect focal separation', 'Dramatic Rembrandt key lighting']
      };
    }
    return null;
  }, [selectedCategory, selectedModel]);

  // Determine single-prompt vs list-view dynamic SEO metadata
  const currentPromptForSeo = useMemo(() => {
    if (activeDetail && activeDetail.type === 'prompt') {
      return prompts.find(p => p.slug === activeDetail.slug);
    }
    return null;
  }, [activeDetail, prompts]);

  const dynamicSeoOptions = useMemo(() => {
    if (currentPromptForSeo) {
      return {
        entityType: 'prompt' as const,
        entityId: currentPromptForSeo.id,
        title: `${currentPromptForSeo.title} — ${currentPromptForSeo.model} AI Prompt | Promptat Online`,
        description: currentPromptForSeo.description,
        robots: 'index, follow'
      };
    }

    // List view SEO configurations
    let title = 'أوامر الذكاء الاصطناعي | Promptat Online - المكتبة الشاملة للأوامر';
    let robots = 'index, follow';
    const isCombo = selectedCategory !== 'all' && selectedModel !== 'all';
    
    if (isCombo) {
      if (activeLandingPage) {
        title = `${activeLandingPage.title} | Promptat Online`;
        robots = 'index, follow';
      } else {
        // Bare filtered query-string view -> DO NOT INDEX to prevent keyword cannibalization
        title = `${selectedCategory.toUpperCase()} Prompts filtered by ${selectedModel.toUpperCase()} | Promptat Online`;
        robots = 'noindex, nofollow';
      }
    } else if (selectedCategory !== 'all') {
      title = `${selectedCategory.toUpperCase()} Blueprints & Prompts | Promptat Online`;
      robots = 'index, follow';
    } else if (selectedModel !== 'all') {
      title = `Best Prompts for ${selectedModel.toUpperCase()} Engine | Promptat Online`;
      robots = 'index, follow';
    }

    return {
      title,
      description: activeLandingPage?.desc || 'Explore curated high-fidelity image generator blueprints and precise prompt formulas.',
      robots
    };
  }, [currentPromptForSeo, selectedCategory, selectedModel, activeLandingPage]);

  // Execute automated dynamic SEO tag injects & canonical URL sync
  useSeoMetadata(dynamicSeoOptions);

  useEffect(() => {
    useStateIsLoading(true);
    const timer = setTimeout(() => {
      useStateIsLoading(false);
    }, 550);
    return () => clearTimeout(timer);
  }, [selectedCategory, selectedDifficulty, selectedModel, sortBy, searchQuery, activeDetail]);

  const promptCategories = useMemo(() => CATEGORIES.filter(c => c.type === 'Prompt'), []);

  // Filtered List
  const filteredPrompts = useMemo(() => {
    return prompts.filter(p => {
      const matchSearch = searchQuery ? (
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      ) : true;

      const catObj = CATEGORIES.find(c => c.id === p.category_id);
      const matchCat = selectedCategory === 'all' ? true : catObj?.slug === selectedCategory;
      const matchDiff = selectedDifficulty === 'all' ? true : p.difficulty === selectedDifficulty;
      
      const matchModel = selectedModel === 'all' ? true : (
        selectedModel === 'midjourney' ? p.model.toLowerCase().includes('midjourney') :
        selectedModel === 'flux' ? p.model.toLowerCase().includes('flux') :
        selectedModel === 'dalle' ? p.model.toLowerCase().includes('dall') :
        p.model.toLowerCase().includes('stable')
      );

      return matchSearch && matchCat && matchDiff && matchModel;
    }).sort((a, b) => {
      if (sortBy === 'likes' || sortBy === 'popularity') return b.likes - a.likes;
      if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'most_discussed') return (b.views + b.likes * 2) - (a.views + a.likes * 2);
      if (sortBy === 'downloads') return b.downloads - a.downloads;
      if (sortBy === 'views') return b.views - a.views;
      return b.likes - a.likes;
    });
  }, [prompts, searchQuery, selectedCategory, selectedDifficulty, sortBy, selectedModel]);

  // Handle Prompt Copier
  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showNotification('Copied successfully!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // TXT and Markdown downloaders
  const downloadFile = (prompt: AIPrompt, format: 'txt' | 'md') => {
    let content = '';
    let fileName = `${prompt.slug}.${format}`;

    if (format === 'txt') {
      content = `Title: ${prompt.title}\n\nModel: ${prompt.model}\n\nPrompt:\n${prompt.prompt}\n\nNegative Prompt:\n${prompt.negative_prompt || 'None'}\n\nParameters:\nAspect Ratio: ${prompt.aspect_ratio || '1:1'}\nStyle: ${prompt.style || 'None'}\nCamera: ${prompt.camera || 'None'}\nLighting: ${prompt.lighting || 'None'}\nSeed: ${prompt.seed || 'None'}`;
    } else {
      content = `# ${prompt.title}\n\n**Model:** ${prompt.model} | **Category:** ${CATEGORIES.find(c => c.id === prompt.category_id)?.title}\n\n### Main Prompt\n\`\`\`text\n${prompt.prompt}\n\`\`\`\n\n### Negative Prompt\n\`\`\`text\n${prompt.negative_prompt || 'N/A'}\n\`\`\`\n\n### Metadata Parameters\n* **Aspect Ratio:** ${prompt.aspect_ratio || '1:1'}\n* **Style Theme:** ${prompt.style || 'N/A'}\n* **Camera Profile:** ${prompt.camera || 'N/A'}\n* **Lighting Design:** ${prompt.lighting || 'N/A'}\n* **Generation Seed:** \`${prompt.seed || 'N/A'}\`\n\n---\n*Downloaded from Promptat.online*`;
    }

    const element = document.createElement("a");
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    registerDownload('prompts', prompt.id);
  };

  // Render DETAIL VIEW
  if (activeDetail && activeDetail.type === 'prompt') {
    const rawPrompt = prompts.find(p => p.slug === activeDetail.slug);
    if (!rawPrompt) {
      return <PageNotFound type="prompt" slug={activeDetail.slug} />;
    }
    const currentPrompt = getLocalizedItem(rawPrompt, currentLang);

    const categoryObj = CATEGORIES.find(c => c.id === currentPrompt.category_id);
    
    // Score based on matching category (score +3) and matching model (score +2)
    const relatedList = prompts
      .filter(p => p.id !== currentPrompt.id)
      .map(p => {
        let score = 0;
        if (p.category_id === currentPrompt.category_id) score += 3;
        if (p.model && currentPrompt.model && p.model.toLowerCase().trim() === currentPrompt.model.toLowerCase().trim()) score += 2;
        return { prompt: p, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.prompt)
      .slice(0, 3);

    const isLiked = state.likes.prompts.includes(currentPrompt.id);

    // Dynamic model grouping logic
    const getModelType = (modelName: string): 'midjourney' | 'gemini' | 'flux_sdxl' | 'generic' => {
      const m = modelName.toLowerCase();
      if (m.includes('midjourney') || m.includes('mj')) return 'midjourney';
      if (m.includes('gemini') || m.includes('banana') || m.includes('nano')) return 'gemini';
      if (m.includes('flux') || m.includes('sdxl') || m.includes('stable diffusion')) return 'flux_sdxl';
      return 'generic';
    };

    const modelType = getModelType(currentPrompt.model);

    // Schema Markups
    const creativeWorkSchema = {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      "name": currentPrompt.title,
      "description": currentPrompt.description,
      "image": currentPrompt.thumbnail,
      "creator": {
        "@type": "Organization",
        "name": "Promptat Online",
        "url": "https://promptat.online"
      },
      "commentCount": commentsCount,
      "interactionStatistic": [
        {
          "@type": "InteractionCounter",
          "interactionType": "https://schema.org/LikeAction",
          "userInteractionCount": currentPrompt.likes
        },
        {
          "@type": "InteractionCounter",
          "interactionType": "https://schema.org/DownloadAction",
          "userInteractionCount": currentPrompt.downloads
        },
        {
          "@type": "InteractionCounter",
          "interactionType": "https://schema.org/ViewAction",
          "userInteractionCount": currentPrompt.views
        }
      ]
    };

    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
        <ScrollProgressBar />
        {/* Schema Injection */}
        <script type="application/ld+json">
          {JSON.stringify(creativeWorkSchema)}
        </script>

        {/* Top Navigation Row */}
        <div>
          <button 
            onClick={() => navigateTo('prompts')}
            className="group flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 mb-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            <span>{t('backToPrompts', 'Back to Prompt Library')}</span>
          </button>
        </div>

        {/* Detailed Grid Board */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Visual Showcase (7 columns) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
              <img 
                src={currentPrompt.thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'} 
                alt={currentPrompt.title}
                referrerPolicy="no-referrer"
                className="w-full aspect-[4/5] sm:aspect-[3/4] object-cover object-center"
              />
            </div>
            
            {/* Gallery Thumbnail roll */}
            {currentPrompt.gallery.length > 1 && (
              <div className="grid grid-cols-3 gap-3">
                {currentPrompt.gallery.map((imgUrl, idx) => (
                  <div key={idx} className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-xs hover:border-slate-300 transition-all">
                    <img 
                      src={imgUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'} 
                      alt={`Gallery view ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full aspect-video object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Prompt specifications Right (5 columns) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Headers, Category Badges & Title */}
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {categoryObj && (
                  <span className="rounded-lg bg-red-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#e21833]">
                    {getLocalizedCategoryTitle(categoryObj.slug, currentLang)}
                  </span>
                )}
                <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-700">
                  {currentPrompt.difficulty === 'Beginner' ? t('beginner') : currentPrompt.difficulty === 'Intermediate' ? t('intermediate') : t('expert')}
                </span>
                {currentPrompt.premium && (
                  <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-amber-700">
                    PRO blueprint
                  </span>
                )}
              </div>

              <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                {currentPrompt.title}
              </h1>

              {/* Stats row under title */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-bold text-slate-400 border-b border-slate-100 pb-3 mt-1 select-none">
                <span className="flex items-center space-x-1 shrink-0">
                  <Download className="h-3.5 w-3.5 text-indigo-500" />
                  <span>{currentPrompt.downloads} {t('sortDownloads', 'downloads')}</span>
                </span>
                <span className="flex items-center space-x-1 shrink-0">
                  <Eye className="h-3.5 w-3.5 text-indigo-500" />
                  <span>{currentPrompt.views} {t('sortViews', 'views')}</span>
                </span>
                <span className="flex items-center space-x-1 shrink-0">
                  <Heart className="h-3.5 w-3.5 text-indigo-500" />
                  <span>{currentPrompt.likes} {t('sortLikes', 'likes')}</span>
                </span>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed pt-1">
                {currentPrompt.description}
              </p>
            </div>

            {/* DOMINANT PRIMARY CTA COPY BOX */}
            <div className="rounded-2xl border-2 border-indigo-600 bg-indigo-50/20 p-5 space-y-3.5 shadow-sm animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600">
                  {t('parameters', 'Master AI Prompt Formula')}
                </span>
                <span className="rounded bg-indigo-100 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-indigo-700">
                  {currentPrompt.model}
                </span>
              </div>
              
              <div className="relative group">
                <div className="rounded-xl border border-indigo-100 bg-white p-4 font-mono text-xs text-slate-800 leading-relaxed select-all shadow-inner pr-10">
                  {currentPrompt.prompt}
                </div>
                <button
                  onClick={() => handleCopyText(currentPrompt.prompt, 'p-main')}
                  className="absolute top-2.5 right-2.5 rounded-lg border border-slate-200 bg-white hover:bg-indigo-50 p-1.5 text-slate-500 hover:text-indigo-600 transition-all cursor-pointer shadow-xs"
                  title="Quick Copy Prompt Code"
                >
                  {copiedId === 'p-main' ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>

              <button
                onClick={() => handleCopyText(currentPrompt.prompt, 'p-main')}
                className="w-full flex items-center justify-center space-x-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 text-xs shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                {copiedId === 'p-main' ? (
                  <>
                    <Check className="h-4 w-4 text-white shrink-0" />
                    <span>{t('promptCopied', 'PROMPT COPIED TO CLIPBOARD')}</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 text-white shrink-0" />
                    <span>{t('copyPrompt', 'COPY MASTER PROMPT FORMULA')}</span>
                  </>
                )}
              </button>
              
              <p className="text-[10px] text-indigo-500/90 font-bold mt-1 text-center leading-relaxed">
                {modelType === 'midjourney' && "How to use with Midjourney: Paste this formula into your Discord chat after the /imagine prompt command."}
                {modelType === 'gemini' && "How to use with Gemini: Copy and input directly into the Gemini Pro interface or use via the AI Studio system instructions."}
                {modelType === 'flux_sdxl' && "How to use with Flux: Enter this description inside the primary generation field of your Flux webUI or client."}
                {modelType === 'generic' && "How to use: Paste this prompt directly into your preferred AI image generator."}
              </p>
              
              {/* Mid-content Ad Slot */}
              <AdSlot placement="prompt-detail-below-prompt" pageType="prompt" />
            </div>

            {/* Interactive Likes, Saves, and Share Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => toggleLike('prompts', currentPrompt.id)}
                className={`flex items-center justify-center space-x-1.5 rounded-xl border px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                  isLiked 
                    ? 'border-rose-100 bg-rose-50 text-rose-600' 
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <Heart className={`h-4 w-4 shrink-0 ${isLiked ? 'fill-rose-600 text-rose-600' : ''}`} />
                <span>{isLiked ? 'Liked Blueprint' : 'Like'}</span>
              </button>

              <div className="relative inline-block">
                <FavoriteButton
                  itemType="prompt"
                  itemId={currentPrompt.id}
                  userId={user?.id}
                  showText={true}
                  className="px-4 py-2.5 border border-slate-200 bg-white shadow-sm hover:bg-slate-50 hover:text-slate-800 text-slate-600 font-bold rounded-xl"
                />
              </div>

              <ShareControl
                contentType="prompt"
                contentId={currentPrompt.id}
                slug={currentPrompt.slug}
                title={currentPrompt.title}
                thumbnail={currentPrompt.thumbnail}
                inline={true}
              />
            </div>

            {/* Negative Prompt field */}
            {currentPrompt.negative_prompt && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    {t('negativePrompt', 'Negative Prompt parameters')}
                  </span>
                  <button
                    onClick={() => handleCopyText(currentPrompt.negative_prompt!, 'p-neg')}
                    className="text-xs font-bold text-slate-500 hover:text-[#e21833] transition-colors cursor-pointer"
                  >
                    {copiedId === 'p-neg' ? t('promptCopied', 'Copied') : t('copyPrompt', 'Copy')}
                  </button>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 shadow-inner">
                  <p className="font-mono text-[11px] text-slate-500 leading-relaxed select-all">
                    {currentPrompt.negative_prompt}
                  </p>
                </div>
              </div>
            )}

            {/* Metadata Parameters Block depending on model engine */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-extrabold uppercase tracking-widest text-slate-900">
                  {t('parameters', 'Parameters Configuration')}
                </span>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-wider text-slate-600">
                  {modelType === 'midjourney' ? 'Discord CLI Format' : modelType === 'flux_sdxl' ? 'JSON Key:Value' : 'Plain Metadata Table'}
                </span>
              </div>

              {/* Midjourney engine */}
              {modelType === 'midjourney' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 text-xs">
                    {currentPrompt.camera && (
                      <div>
                        <span className="text-slate-400 block font-semibold text-[10px] uppercase">{t('camera', 'Camera Lens')}</span>
                        <span className="font-bold text-slate-800">{currentPrompt.camera}</span>
                      </div>
                    )}
                    {currentPrompt.lighting && (
                      <div>
                        <span className="text-slate-400 block font-semibold text-[10px] uppercase">{t('lighting', 'Lighting Style')}</span>
                        <span className="font-bold text-slate-800">{currentPrompt.lighting}</span>
                      </div>
                    )}
                    {currentPrompt.style && (
                      <div>
                        <span className="text-slate-400 block font-semibold text-[10px] uppercase">{t('style', 'Creative Theme')}</span>
                        <span className="font-bold text-slate-800">{currentPrompt.style}</span>
                      </div>
                    )}
                    {currentPrompt.aspect_ratio && (
                      <div>
                        <span className="text-slate-400 block font-semibold text-[10px] uppercase">{t('aspectRatio', 'Aspect Ratio')}</span>
                        <span className="font-bold text-[#e21833] font-mono select-all">--ar {currentPrompt.aspect_ratio}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-slate-400 block font-semibold text-[10px] uppercase">{t('model', 'Model Version')}</span>
                      <span className="font-bold text-slate-800">{currentPrompt.model}</span>
                    </div>
                    {currentPrompt.seed && (
                      <div>
                        <span className="text-slate-400 block font-semibold text-[10px] uppercase">{t('seed', 'Generation Seed')}</span>
                        <span className="font-bold text-[#e21833] font-mono select-all">--seed {currentPrompt.seed}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 bg-amber-50/50 border border-amber-100/70 rounded-lg p-2.5">
                    <p className="text-[10px] font-medium text-amber-800 leading-normal">
                      <strong>CLI Format active:</strong> These parameters are formatted to be used as CLI flags trailing behind your Midjourney prompt box.
                    </p>
                  </div>
                </div>
              )}

              {/* Gemini / Nano-banana engine */}
              {modelType === 'gemini' && (
                <div className="space-y-3">
                  <div className="divide-y divide-slate-100 text-xs">
                    {currentPrompt.camera && (
                      <div className="flex justify-between py-2.5">
                        <span className="text-slate-400 font-semibold text-[10px] uppercase">{t('camera', 'Camera Lens')}</span>
                        <span className="font-bold text-slate-800">{currentPrompt.camera}</span>
                      </div>
                    )}
                    {currentPrompt.lighting && (
                      <div className="flex justify-between py-2.5">
                        <span className="text-slate-400 font-semibold text-[10px] uppercase">{t('lighting', 'Lighting Style')}</span>
                        <span className="font-bold text-slate-800">{currentPrompt.lighting}</span>
                      </div>
                    )}
                    {currentPrompt.style && (
                      <div className="flex justify-between py-2.5">
                        <span className="text-slate-400 font-semibold text-[10px] uppercase">{t('style', 'Creative Theme')}</span>
                        <span className="font-bold text-slate-800">{currentPrompt.style}</span>
                      </div>
                    )}
                    {currentPrompt.aspect_ratio && (
                      <div className="flex justify-between py-2.5">
                        <span className="text-slate-400 font-semibold text-[10px] uppercase">{t('aspectRatio', 'Aspect Ratio')}</span>
                        <span className="font-mono font-bold text-slate-800">{currentPrompt.aspect_ratio}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-2.5">
                      <span className="text-slate-400 font-semibold text-[10px] uppercase">{t('model', 'Model Version')}</span>
                      <span className="font-bold text-slate-800">{currentPrompt.model}</span>
                    </div>
                    <div className="flex justify-between py-2.5">
                      <span className="text-slate-400 font-semibold text-[10px] uppercase">{t('seed', 'Generation Seed')}</span>
                      <span className="text-slate-400 font-medium italic">Not supported</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Flux / SDXL engine */}
              {modelType === 'flux_sdxl' && (
                <div className="space-y-3">
                  <div className="rounded-xl border border-slate-150 bg-slate-50 p-4 font-mono text-[11px] leading-relaxed text-slate-700 select-all shadow-inner">
                    <div className="space-y-0.5">
                      <div>aspect_ratio: "{currentPrompt.aspect_ratio || '16:9'}",</div>
                      <div>seed: {currentPrompt.seed || '128475949'},</div>
                      <div>camera: "{currentPrompt.camera || 'N/A'}",</div>
                      <div>style_preset: "{currentPrompt.style || 'Cinematic'}",</div>
                      <div>lighting_atmosphere: "{currentPrompt.lighting || 'Volumetric'}",</div>
                      <div>model_engine: "{currentPrompt.model}"</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Other Engines */}
              {modelType === 'generic' && (
                <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 text-xs">
                  {currentPrompt.camera && (
                    <div>
                      <span className="text-slate-400 block font-semibold text-[10px] uppercase">{t('camera', 'Camera Lens')}</span>
                      <span className="font-bold text-slate-800">{currentPrompt.camera}</span>
                    </div>
                  )}
                  {currentPrompt.lighting && (
                    <div>
                      <span className="text-slate-400 block font-semibold text-[10px] uppercase">{t('lighting', 'Lighting Style')}</span>
                      <span className="font-bold text-slate-800">{currentPrompt.lighting}</span>
                    </div>
                  )}
                  {currentPrompt.style && (
                    <div>
                      <span className="text-slate-400 block font-semibold text-[10px] uppercase">{t('style', 'Creative Theme')}</span>
                      <span className="font-bold text-slate-800">{currentPrompt.style}</span>
                    </div>
                  )}
                  {currentPrompt.aspect_ratio && (
                    <div>
                      <span className="text-slate-400 block font-semibold text-[10px] uppercase">{t('aspectRatio', 'Aspect Ratio')}</span>
                      <span className="font-bold text-slate-800 font-mono">{currentPrompt.aspect_ratio}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-400 block font-semibold text-[10px] uppercase">{t('model', 'Model Version')}</span>
                    <span className="font-bold text-slate-800">{currentPrompt.model}</span>
                  </div>
                  {currentPrompt.seed && (
                    <div>
                      <span className="text-slate-400 block font-semibold text-[10px] uppercase">{t('seed', 'Generation Seed')}</span>
                      <span className="font-bold text-slate-800 font-mono">{currentPrompt.seed}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Download Files Panel */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                {t('downloadBlueprint', 'Download Resource Files')}
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => downloadFile(currentPrompt, 'txt')}
                  className="flex items-center justify-center space-x-1.5 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 cursor-pointer"
                >
                  <Download className="h-4 w-4 shrink-0 text-indigo-500" />
                  <span>{t('downloadTxt', 'Download .TXT')}</span>
                </button>
                <button
                  onClick={() => downloadFile(currentPrompt, 'md')}
                  className="flex items-center justify-center space-x-1.5 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 cursor-pointer"
                >
                  <Layers className="h-4 w-4 shrink-0 text-indigo-500" />
                  <span>Download .MD</span>
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Related Content Widget */}
        <RelatedContent
          type="prompt"
          currentId={currentPrompt.id}
          categoryId={currentPrompt.category_id}
          model={currentPrompt.model}
        />

        {/* Polymorphic Discussion Board Board */}
        <div className="mt-12 pt-10 border-t border-slate-150 max-w-4xl">
          <CommentsSection
            contentType="prompt"
            contentId={currentPrompt.id}
            onCommentsCountChange={setCommentsCount}
          />
        </div>

      </div>
    );
  }

  // Render CATALOG
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      
      {/* Title & Stats or SEO Landing Page */}
      {activeLandingPage ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 md:p-8 space-y-6 animate-fade-in">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 text-[10px] font-black text-emerald-700 uppercase flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  Indexed SEO Landing Page
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 uppercase">
                  SEO Keyword: {activeLandingPage.keyword}
                </span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                {activeLandingPage.title}
              </h1>
              <p className="text-sm text-slate-500 max-w-3xl leading-relaxed">
                {activeLandingPage.desc}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-[#e21833]">
              Showing {filteredPrompts.length} of {prompts.length} Blueprints
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4 border-t border-slate-200/60">
            <div className="md:col-span-8 space-y-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Core Prompt Formula</span>
              <div className="rounded-xl border border-slate-200/80 bg-white p-4 font-mono text-xs text-slate-800 leading-relaxed shadow-xs">
                {activeLandingPage.formula}
              </div>
            </div>
            <div className="md:col-span-4 space-y-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Structural Focus Areas</span>
              <div className="flex flex-wrap gap-1.5">
                {activeLandingPage.focus.map((item, idx) => (
                  <span key={idx} className="rounded-lg bg-slate-100 border border-slate-200/50 px-2.5 py-1 text-xs text-slate-700 font-medium">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-start justify-between gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-900">
              {t('navPrompts', 'AI Image Prompts Library')}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {t('latestPromptsDesc', 'Discover optimized prompts mapping textures, structures, cameras, and atmospheric parameters.')}
            </p>
          </div>

          {/* Stat badge */}
          <span className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-[#e21833]">
            {filteredPrompts.length} / {prompts.length} {t('navPrompts', 'Prompts')}
          </span>
        </div>
      )}

      {/* CATALOG GRID LAYOUT */}
      <div className="w-full space-y-6">
        
        {/* Top Search and Stats Row */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full sm:max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder', 'Search prompt, model or style...')}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs outline-none transition-all focus:border-[#e21833] focus:ring-2 focus:ring-red-100"
            />
          </div>

          {/* Quick Sort Tabs */}
          <div className="flex items-center space-x-1 shrink-0 bg-slate-100/70 p-1 rounded-xl border border-slate-200/60 self-end sm:self-auto">
            <button
              onClick={() => setSortBy('likes')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                sortBy === 'likes' || sortBy === 'popularity'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🔥 {t('sortLikes', 'Popular')}
            </button>
            <button
              onClick={() => setSortBy('newest')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                sortBy === 'newest'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ✨ {t('sortDate', 'Newest')}
            </button>
            <button
              onClick={() => setSortBy('most_discussed')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                sortBy === 'most_discussed'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              💬 {t('comments', 'Discussed')}
            </button>
          </div>
        </div>

        {/* Active category banner notice */}
        {selectedCategory !== 'all' && (
          <div className="flex items-center justify-between rounded-xl bg-indigo-50 border border-indigo-100/70 px-4 py-3 text-xs text-indigo-800">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{t('filterCategory', 'Selected Segment')}:</span>
              <span className="font-bold bg-white px-2.5 py-0.5 rounded-lg border border-indigo-200 text-indigo-700 uppercase tracking-wider text-[10px]">
                {getLocalizedCategoryTitle(selectedCategory, currentLang)}
              </span>
            </div>
            <button
              onClick={() => setSelectedCategory('all')}
              className="font-bold hover:underline cursor-pointer text-indigo-600"
            >
              {t('resetFilters', 'Clear Filter')}
            </button>
          </div>
        )}

        {/* Prompts Catalog Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            <Skeleton variant="card" count={8} />
          </div>
        ) : filteredPrompts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredPrompts.map((p, index) => (
              <React.Fragment key={p.id}>
                <PromptCard prompt={p} />
                {index > 0 && (index + 1) % 8 === 0 && (
                  <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4">
                    <AdSlot placement="in-feed-prompts" pageType="prompt" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 p-16 text-center bg-white shadow-xs">
            <SlidersHorizontal className="mx-auto h-10 w-10 text-slate-400" />
            <h3 className="mt-4 text-sm font-bold text-slate-900">{t('noResultsFound', 'No prompt blueprints found')}</h3>
            <p className="mt-1 text-xs text-slate-500">
              {t('noResultsDesc', "We couldn't find any resources matching your exact combination of search terms and filter categories.")}
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedDifficulty('all');
                setSelectedModel('all');
                setSearchQuery('');
              }}
              className="mt-4 rounded-xl bg-[#e21833] px-4 py-2 text-xs font-semibold text-white cursor-pointer hover:bg-red-700 transition-all"
            >
              {t('resetFilters', 'Reset Filters')}
            </button>
          </div>
        )}

      </div>

    </div>
  );
};
