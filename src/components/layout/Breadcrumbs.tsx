import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronRight, Home as HomeIcon } from 'lucide-react';
import { getLocalizedItem, getLocalizedCategoryTitle, buildLocalizedPath, LanguageCode } from '../../lib/i18n';
import { stripMarkdown } from '../../utils/textUtils';
import { CATEGORIES } from '../../data/categories';
import { AI_NEWS_ITEMS } from '../../data/news';

export interface BreadcrumbItem {
  id: string;
  label: string;
  href?: string;
  onClick?: () => void;
  isCurrent?: boolean;
}

export const BREADCRUMB_PAGE_LABELS: Record<LanguageCode, Record<string, string>> = {
  ar: {
    home: 'الرئيسية',
    prompts: 'أوامر الصور',
    skills: 'مهارات المبدعين',
    videos: 'برومبتات الفيديو',
    blog: 'مدونة الذكاء الاصطناعي',
    news: 'أخبار AI',
    search: 'البحث',
    'account-settings': 'إعدادات الحساب',
    'public-profile': 'الملف الشخصي',
    admin: 'لوحة الإدارة',
    'adminato-login': 'تسجيل دخول الإدارة',
  },
  en: {
    home: 'Home',
    prompts: 'Image Prompts',
    skills: 'Creator Skills',
    videos: 'AI Video Prompts',
    blog: 'AI Blog',
    news: 'AI News',
    search: 'Search',
    'account-settings': 'Account Settings',
    'public-profile': 'Public Profile',
    admin: 'Admin Console',
    'adminato-login': 'Admin Login',
  },
  es: {
    home: 'Inicio',
    prompts: 'Prompts de Imágenes',
    skills: 'Habilidades IA',
    videos: 'Prompts de Video IA',
    blog: 'Blog de IA',
    news: 'Noticias IA',
    search: 'Búsqueda',
    'account-settings': 'Configuración de Cuenta',
    'public-profile': 'Perfil Público',
    admin: 'Panel de Administración',
    'adminato-login': 'Acceso de Administrador',
  },
  id: {
    home: 'Beranda',
    prompts: 'Prompt Gambar',
    skills: 'Keahlian Kreator',
    videos: 'Prompt Video AI',
    blog: 'Blog AI',
    news: 'Berita AI',
    search: 'Pencarian',
    'account-settings': 'Pengaturan Akun',
    'public-profile': 'Profil Publik',
    admin: 'Panel Admin',
    'adminato-login': 'Masuk Admin',
  },
  fr: {
    home: 'Accueil',
    prompts: 'Prompts Images',
    skills: 'Compétences Créateurs',
    videos: 'Prompts Vidéo IA',
    blog: 'Blog IA',
    news: 'Actualités IA',
    search: 'Recherche',
    'account-settings': 'Paramètres du Compte',
    'public-profile': 'Profil Public',
    admin: 'Tableau de Bord',
    'adminato-login': 'Connexion Admin',
  },
};

export const Breadcrumbs: React.FC = () => {
  const { 
    activeTab, 
    activeDetail, 
    prompts, 
    skills, 
    videos, 
    blogs, 
    navigateTo, 
    currentLang, 
    isRtl,
    searchQuery
  } = useApp();

  const pageLabels = BREADCRUMB_PAGE_LABELS[currentLang] || BREADCRUMB_PAGE_LABELS.en;
  const homeLabel = pageLabels.home || 'Home';

  // Construct items array based on active route and hierarchy
  const breadcrumbItems = useMemo<BreadcrumbItem[]>(() => {
    // Return empty array on home tab
    if (activeTab === 'home') return [];

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://promptat.online';
    const items: BreadcrumbItem[] = [];

    // 1. Root Home Step
    const homeHref = buildLocalizedPath('/', currentLang);
    items.push({
      id: 'home',
      label: homeLabel,
      href: homeHref,
      onClick: () => navigateTo('home')
    });

    // 2. Main Section / Tab Step
    const tabLabel = pageLabels[activeTab] || activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
    const tabHref = buildLocalizedPath(`/${activeTab}`, currentLang);

    // If there is no nested detail, the tab is the current page leaf
    if (!activeDetail) {
      if (activeTab === 'search' && searchQuery && searchQuery.trim()) {
        items.push({
          id: 'tab',
          label: tabLabel,
          href: tabHref,
          onClick: () => navigateTo(activeTab)
        });
        items.push({
          id: 'search-query',
          label: `"${searchQuery.trim()}"`,
          isCurrent: true
        });
      } else {
        items.push({
          id: 'tab',
          label: tabLabel,
          isCurrent: true
        });
      }
      return items;
    }

    // Detail is present: tab is a parent link
    items.push({
      id: 'tab',
      label: tabLabel,
      href: tabHref,
      onClick: () => navigateTo(activeTab)
    });

    const { type, slug } = activeDetail;

    // 3. Optional Category step & 4. Item Detail step
    if (type === 'prompt') {
      const raw = prompts.find(p => p.slug === slug);
      if (raw) {
        const localized = getLocalizedItem(raw, currentLang);
        const catObj = CATEGORIES.find(c => c.id === localized.category_id);
        if (catObj) {
          const categoryTitle = getLocalizedCategoryTitle(catObj.slug, currentLang);
          if (categoryTitle) {
            items.push({
              id: 'category',
              label: categoryTitle,
              href: tabHref,
              onClick: () => navigateTo('prompts')
            });
          }
        }
        items.push({
          id: 'detail',
          label: stripMarkdown(localized.title) || 'Prompt',
          isCurrent: true
        });
      }
    } else if (type === 'skill') {
      const raw = skills.find(s => s.slug === slug);
      if (raw) {
        const localized = getLocalizedItem(raw, currentLang);
        const catObj = CATEGORIES.find(c => c.id === localized.category_id);
        if (catObj) {
          const categoryTitle = getLocalizedCategoryTitle(catObj.slug, currentLang);
          if (categoryTitle) {
            items.push({
              id: 'category',
              label: categoryTitle,
              href: tabHref,
              onClick: () => navigateTo('skills')
            });
          }
        }
        items.push({
          id: 'detail',
          label: stripMarkdown(localized.title) || 'Skill',
          isCurrent: true
        });
      }
    } else if (type === 'video') {
      const raw = videos.find(v => v.slug === slug);
      if (raw) {
        const localized = getLocalizedItem(raw, currentLang);
        if (localized.niche) {
          const catTitle = getLocalizedCategoryTitle(localized.niche, currentLang);
          if (catTitle) {
            items.push({
              id: 'category',
              label: catTitle,
              href: tabHref,
              onClick: () => navigateTo('videos')
            });
          }
        }
        items.push({
          id: 'detail',
          label: stripMarkdown(localized.title) || 'Video',
          isCurrent: true
        });
      }
    } else if (type === 'blog') {
      const raw = blogs.find(b => b.slug === slug);
      if (raw) {
        const localized = getLocalizedItem(raw, currentLang);
        if (localized.category) {
          const catTitle = getLocalizedCategoryTitle(localized.category, currentLang);
          if (catTitle) {
            items.push({
              id: 'category',
              label: catTitle,
              href: tabHref,
              onClick: () => navigateTo('blog')
            });
          }
        }
        items.push({
          id: 'detail',
          label: stripMarkdown(localized.title) || 'Article',
          isCurrent: true
        });
      }
    } else if (type === 'profile') {
      items.push({
        id: 'detail',
        label: `@${slug}`,
        isCurrent: true
      });
    }

    return items;
  }, [activeTab, activeDetail, currentLang, pageLabels, homeLabel, prompts, skills, videos, blogs, searchQuery, navigateTo]);

  // Schema.org JSON-LD BreadcrumbList for rich Google Search Snippets
  const breadcrumbSchema = useMemo(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://promptat.online';
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbItems.map((item, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: item.label,
        item: item.href ? `${origin}${item.href}` : `${origin}${window.location.pathname}`
      }))
    };
  }, [breadcrumbItems]);

  if (activeTab === 'home' || breadcrumbItems.length === 0) {
    return null;
  }

  return (
    <div className="bg-white/95 backdrop-blur-xs border-b border-slate-200/70 shadow-2xs">
      {/* Schema.org Injection */}
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>

      <nav 
        aria-label="Breadcrumb"
        className={`mx-auto w-full max-w-7xl px-4 py-2.5 sm:px-6 lg:px-8 flex items-center overflow-x-auto scrollbar-none text-xs font-semibold text-slate-500 ${
          currentLang === 'ar' ? 'font-tajawal' : 'font-sans'
        }`}
      >
        <ol className="flex items-center space-x-2 rtl:space-x-reverse min-w-0">
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1;
            const isHome = index === 0;

            return (
              <li key={item.id} className="flex items-center space-x-2 rtl:space-x-reverse shrink-0">
                {item.isCurrent || isLast ? (
                  <span 
                    aria-current="page"
                    className="text-slate-900 font-bold max-w-[200px] sm:max-w-xs md:max-w-md truncate"
                    title={item.label}
                  >
                    {item.label}
                  </span>
                ) : (
                  <a
                    href={item.href || '#'}
                    onClick={(e) => {
                      if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                        e.preventDefault();
                        if (item.onClick) item.onClick();
                      }
                    }}
                    className="flex items-center space-x-1 rtl:space-x-reverse text-slate-500 hover:text-[#e21833] transition-colors cursor-pointer"
                  >
                    {isHome && <HomeIcon className="h-3.5 w-3.5 shrink-0" />}
                    <span>{item.label}</span>
                  </a>
                )}

                {!isLast && (
                  <ChevronRight 
                    className={`h-3.5 w-3.5 text-slate-300 shrink-0 ${isRtl ? 'rotate-180' : ''}`} 
                    aria-hidden="true" 
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
};
