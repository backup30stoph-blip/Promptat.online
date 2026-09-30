import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useI18n } from '../hooks/useI18n';
import { AI_NEWS_ITEMS, AINewsItem } from '../data/news';
import { 
  Newspaper, Sparkles, Flame, Clock, Eye, Heart, Share2, 
  Search, ArrowRight, ExternalLink, Filter, Check, Tag, Zap
} from 'lucide-react';
import { useSeoMetadata } from '../hooks/useSeoMetadata';
import { AdSlot } from '../components/AdSlot';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { stripMarkdown } from '../utils/textUtils';

export const News: React.FC = () => {
  const { showNotification, searchQuery, setSearchQuery } = useApp();
  const { lang, t, isRtl } = useI18n();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedNews, setSelectedNews] = useState<AINewsItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const seoContent = {
    ar: {
      title: 'أخبار الذكاء الاصطناعي والتحديثات اليومية | Promptat Online',
      desc: 'تابع أحدث أخبار الذكاء الاصطناعي، إطلاقات النماذج اللغوية، أدوات الفيديو وتوليد الصور، وتطورات التقنية لحظة بلحظة.'
    },
    en: {
      title: 'AI News, Frontier Model Releases & Intelligence | Promptat Online',
      desc: 'Stay informed with real-time AI news, LLM updates, video generation tools, image models, and cutting-edge tech breakthroughs.'
    },
    es: {
      title: 'Noticias y Actualizaciones de Inteligencia Artificial | Promptat Online',
      desc: 'Últimas noticias de IA, lanzamientos de modelos de lenguaje, herramientas de video e imagen en tiempo real.'
    },
    id: {
      title: 'Berita AI Terkini & Peluncuran Model | Promptat Online',
      desc: 'Ikuti berita terkini kecerdasan buatan, rilis model bahasa, alat video dan pembuatan gambar AI real-time.'
    },
    fr: {
      title: 'Actualités et Nouveautés sur l\'Intelligence Artificielle | Promptat Online',
      desc: 'Suivez les dernières actualités IA, sorties de modèles (GPT, Claude, Sora, Runway, Flux) et innovations en direct.'
    }
  };

  const seoData = seoContent[lang] || seoContent.ar;

  useSeoMetadata({
    title: seoData.title,
    description: seoData.desc,
    robots: 'index, follow'
  });

  const categories = useMemo(() => {
    const labelsMap: Record<string, Record<string, string>> = {
      all: { ar: 'الكل', en: 'All Updates', es: 'Todas', id: 'Semua', fr: 'Tout' },
      video: { ar: 'ذكاء الفيديو', en: 'Video AI', es: 'Video IA', id: 'Video AI', fr: 'Vidéo IA' },
      models: { ar: 'النماذج اللغوية', en: 'LLMs & Reasoning', es: 'Modelos LLM', id: 'Model LLM', fr: 'Modèles LLM' },
      image: { ar: 'توليد الصور', en: 'Image Gen', es: 'Generación de Imágenes', id: 'Generasi Gambar', fr: 'Génération d\'Images' },
      opensource: { ar: 'المصادر المفتوحة', en: 'Open Source', es: 'Código Abierto', id: 'Sumber Terbuka', fr: 'Open Source' }
    };
    return [
      { id: 'all', label: labelsMap.all[lang] || labelsMap.all.en },
      { id: 'video', label: labelsMap.video[lang] || labelsMap.video.en },
      { id: 'models', label: labelsMap.models[lang] || labelsMap.models.en },
      { id: 'image', label: labelsMap.image[lang] || labelsMap.image.en },
      { id: 'opensource', label: labelsMap.opensource[lang] || labelsMap.opensource.en },
    ];
  }, [lang]);

  const heroContent = useMemo(() => {
    const map = {
      ar: {
        badge: 'تغطية حية وشاملة',
        title: 'أخبار الذكاء الاصطناعي',
        desc: 'آخر التحديثات، إطلاقات النماذج الثورية (GPT, Claude, Sora, Runway, Flux)، وتغطية شاملة لأحدث أدوات وتقنيات الذكاء الاصطناعي.'
      },
      en: {
        badge: 'Live AI Intelligence Feed',
        title: 'AI News & Insights',
        desc: 'Real-time updates, frontier model releases (GPT, Claude, Sora, Runway, Flux), and in-depth analysis on breakthroughs shaping creator workflows.'
      },
      es: {
        badge: 'Noticias de IA en Vivo',
        title: 'Noticias y Tendencias de IA',
        desc: 'Actualizaciones en tiempo real, lanzamientos de modelos pioneros (GPT, Claude, Sora, Runway, Flux) y análisis sobre avances en IA.'
      },
      id: {
        badge: 'Pembaruan AI Langsung',
        title: 'Berita & Wawasan AI',
        desc: 'Pembaruan terkini secara real-time, rilis model terdepan (GPT, Claude, Sora, Runway, Flux), dan analisis mendalam tentang inovasi AI.'
      },
      fr: {
        badge: 'Flux d\'Actualités IA en Direct',
        title: 'Actualités & Tendances IA',
        desc: 'Mises à jour en direct, sorties de modèles de pointe (GPT, Claude, Sora, Runway, Flux) et analyses complètes sur l\'intelligence artificielle.'
      }
    };
    return map[lang] || map.ar;
  }, [lang]);

  const filteredNews = useMemo(() => {
    return AI_NEWS_ITEMS.filter((item) => {
      const titleText = lang === 'ar' ? item.title_ar : item.title;
      const excerptText = lang === 'ar' ? item.excerpt_ar : item.excerpt;

      const matchesSearch = searchQuery.trim()
        ? titleText.toLowerCase().includes(searchQuery.toLowerCase()) ||
          excerptText.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        : true;

      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, lang]);

  const handleShare = (item: AINewsItem) => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedId(item.id);
      showNotification(t('copiedShareLink', lang, 'تم نسخ رابط الخبر!'), 'success');
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-[#e21833] p-6 sm:p-10 text-white shadow-xl mb-8">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-red-200 border border-white/15 backdrop-blur-xs mb-4">
              <Flame className="h-4 w-4 text-amber-400 animate-pulse" />
              <span>{heroContent.badge}</span>
            </div>
            <h1 className="font-display text-2xl sm:text-4xl font-black tracking-tight text-white mb-3">
              {heroContent.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-2xl">
              {heroContent.desc}
            </p>
          </div>

          {/* Decorative Glow */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-red-500/20 blur-3xl pointer-events-none" />
        </div>

        {/* Search & Category Filter Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#e21833] text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'ar' ? 'ابحث في الأخبار والتحديثات...' : 'Search news & updates...'}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 ps-10 pe-4 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-[#e21833] focus:ring-1 focus:ring-[#e21833] focus:outline-none shadow-xs"
            />
            <Search className="absolute start-3.5 top-3 h-4 w-4 text-slate-400" />
          </div>
        </div>

        {/* News Grid */}
        {filteredNews.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs">
            <Newspaper className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-800 mb-1">
              {lang === 'ar' ? 'لم يتم العثور على أخبار' : 'No news found'}
            </h3>
            <p className="text-xs text-slate-500">
              {lang === 'ar' ? 'جرب البحث بكلمات أخرى أو اختر تصنيفاً مختلفاً.' : 'Try adjusting your search query or selecting a different category.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNews.map((item) => {
              const title = lang === 'ar' ? item.title_ar : item.title;
              const excerpt = lang === 'ar' ? item.excerpt_ar : item.excerpt;
              const catLabel = lang === 'ar' ? item.category_label_ar : item.category_label;

              return (
                <article
                  key={item.id}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Image Cover */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                    <img
                      src={item.cover}
                      alt={title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute top-3 start-3 flex items-center gap-1.5">
                      <span className="rounded-lg bg-black/60 px-2.5 py-1 text-[10px] font-black text-white backdrop-blur-md">
                        {catLabel}
                      </span>
                      {item.is_breaking && (
                        <span className="rounded-lg bg-[#e21833] px-2.5 py-1 text-[10px] font-black text-white shadow-xs animate-pulse">
                          {lang === 'ar' ? 'عاجل' : 'Breaking'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center gap-3 text-[11px] font-medium text-slate-400 mb-2">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {item.read_time}
                      </span>
                      <span>•</span>
                      <span>{item.source}</span>
                    </div>

                    <h2 
                      onClick={() => setSelectedNews(item)}
                      className="text-base font-bold text-slate-900 group-hover:text-[#e21833] transition-colors line-clamp-2 cursor-pointer mb-2"
                    >
                      {stripMarkdown(title)}
                    </h2>

                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4 flex-1">
                      {stripMarkdown(excerpt)}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {item.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-auto">
                      <button
                        type="button"
                        onClick={() => setSelectedNews(item)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#e21833] hover:underline cursor-pointer"
                      >
                        <span>{t('viewDetails', lang, lang === 'ar' ? 'قراءة التفاصيل' : lang === 'es' ? 'Leer Noticia' : lang === 'id' ? 'Baca Selengkapnya' : lang === 'fr' ? 'Lire la Suite' : 'Read Full Story')}</span>
                        <ArrowRight className={`h-3.5 w-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleShare(item)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                        title={t('share', lang, lang === 'ar' ? 'مشاركة' : lang === 'es' ? 'Compartir' : lang === 'id' ? 'Bagikan' : lang === 'fr' ? 'Partager' : 'Share')}
                      >
                        {copiedId === item.id ? (
                          <Check className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <Share2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* In-Feed Advertisement */}
        <div className="mt-12">
          <AdSlot placement="news_bottom" className="my-4" />
        </div>
      </div>

      {/* Article Detail Modal */}
      {selectedNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl bg-white shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95">
            {/* Modal Image Header */}
            <div className="relative h-56 sm:h-64 w-full shrink-0 bg-slate-900">
              <img
                src={selectedNews.cover}
                alt={lang === 'ar' ? selectedNews.title_ar : selectedNews.title}
                className="h-full w-full object-cover opacity-90"
              />
              <button
                type="button"
                onClick={() => setSelectedNews(null)}
                className="absolute top-4 end-4 rounded-full bg-black/60 p-2 text-white hover:bg-black/80 transition-colors cursor-pointer"
              >
                ✕
              </button>
              <div className="absolute bottom-4 start-4 flex items-center gap-2">
                <span className="rounded-lg bg-[#e21833] px-3 py-1 text-xs font-bold text-white shadow-sm">
                  {lang === 'ar' ? selectedNews.category_label_ar : selectedNews.category_label}
                </span>
                <span className="rounded-lg bg-black/60 px-3 py-1 text-xs font-semibold text-slate-200 backdrop-blur-md">
                  {selectedNews.source}
                </span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-6 space-y-4">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                {stripMarkdown(lang === 'ar' ? selectedNews.title_ar : selectedNews.title)}
              </h2>

              <MarkdownRenderer 
                content={lang === 'ar' ? selectedNews.content_ar : selectedNews.content}
                className="text-xs sm:text-sm"
              />

              <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
                {selectedNews.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="rounded-lg bg-red-50 text-[#e21833] px-2.5 py-1 text-xs font-bold"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
