/**
 * Internationalization (i18n) & International SEO Infrastructure
 * Primary Language: Arabic (AR) with support for EN, ES, FR, and ID (Indonesian).
 * Supports directory-based URL structure, translated slugs, hreflang sync, canonical tags, and hreflang validation.
 */

export type LanguageCode = 'ar' | 'en' | 'es' | 'fr' | 'id';

export interface LanguageConfig {
  code: LanguageCode;
  name: string;
  nativeName: string;
  dir: 'ltr' | 'rtl';
  flag: string;
  isDefault?: boolean;
}

export const SUPPORTED_LANGUAGES: Record<LanguageCode, LanguageConfig> = {
  ar: { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl', flag: '🇸🇦', isDefault: true },
  en: { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr', flag: '🇺🇸' },
  es: { code: 'es', name: 'Spanish', nativeName: 'Español', dir: 'ltr', flag: '🇪🇸' },
  fr: { code: 'fr', name: 'French', nativeName: 'Français', dir: 'ltr', flag: '🇫🇷' },
  id: { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', dir: 'ltr', flag: '🇮🇩' },
};

export interface HreflangEntry {
  lang: string;
  url: string;
}

export interface ContentTranslation {
  entityId: string;
  entityType: 'prompt' | 'skill' | 'video' | 'blog';
  lang: LanguageCode;
  title: string;
  slug: string;
  description: string;
  content?: string;
  status: 'missing' | 'draft' | 'reviewed' | 'published';
  seoTitle?: string;
  seoDescription?: string;
}

// Accent stripping helper for ES / FR
export function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Generate language-specific slug according to rules
export function generateLanguageSlug(text: string, lang: LanguageCode): string {
  if (!text) return '';
  let cleaned = text.trim();
  
  if (lang === 'es' || lang === 'fr') {
    cleaned = removeAccents(cleaned);
  }
  
  return cleaned
    .toLowerCase()
    .replace(/[^\w\s\u0600-\u06FF-]/g, '') // Keep Arabic characters for AR if present
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Extract language and clean base path from window.location.pathname
export function parseLanguagePath(pathname: string): {
  lang: LanguageCode;
  basePath: string;
  hasLangPrefix: boolean;
} {
  const cleanPath = pathname.replace(/\/+$/, '') || '/';
  const parts = cleanPath.split('/').filter(Boolean);

  if (parts.length > 0) {
    const firstPart = parts[0].toLowerCase() as LanguageCode;
    if (SUPPORTED_LANGUAGES[firstPart]) {
      const remainingParts = parts.slice(1);
      const basePath = '/' + remainingParts.join('/');
      return {
        lang: firstPart,
        basePath: basePath === '/' ? '/' : basePath,
        hasLangPrefix: true
      };
    }
  }

  return {
    lang: 'ar',
    basePath: cleanPath,
    hasLangPrefix: false
  };
}

// Build localized URL path (Arabic is primary root, others get /en/, /es/, /fr/, /id/)
export function buildLocalizedPath(basePath: string, lang: LanguageCode): string {
  const cleanBase = basePath.startsWith('/') ? basePath : '/' + basePath;
  if (lang === 'ar') {
    return cleanBase;
  }
  if (cleanBase === '/') {
    return `/${lang}`;
  }
  return `/${lang}${cleanBase}`;
}

export interface NavItemConfig {
  id: string;
  namespace: string;
  label: string;
  href: string;
  iconName: 'Home' | 'Sparkles' | 'Cpu' | 'Film' | 'BookOpen' | 'Zap' | 'Newspaper';
}

/**
 * Architecture v2 dynamic navigation builder based on active locale
 */
export function getNavigation(locale: LanguageCode): NavItemConfig[] {
  const prefix = locale === 'ar' ? '' : `/${locale}`;

  const navLabels: Record<string, Record<LanguageCode, string>> = {
    home: { ar: 'الرئيسية', en: 'Home', es: 'Inicio', fr: 'Accueil', id: 'Beranda' },
    prompts: { ar: 'أوامر الصور', en: 'Image Prompts', es: 'Prompts de Imágenes', fr: 'Prompts Images', id: 'Prompt Gambar' },
    videos: { ar: 'برومبتات الفيديو', en: 'AI Video Prompts', es: 'Prompts de Video IA', fr: 'Prompts Vidéo IA', id: 'Prompt Video AI' },
    skills: { ar: 'مهارات المبدعين', en: 'Creator Skills', es: 'Habilidades IA', fr: 'Compétences Créateurs', id: 'Keahlian Kreator' },
    news: { ar: 'أخبار AI', en: 'AI News', es: 'Noticias IA', fr: 'Actualités IA', id: 'Berita AI' },
    blog: { ar: 'مدونة الذكاء الاصطناعي', en: 'AI Blog', es: 'Blog de IA', fr: 'Blog IA', id: 'Blog AI' },
  };

  return [
    { id: 'home', namespace: 'pages', label: navLabels.home[locale] || navLabels.home.en, href: locale === 'ar' ? '/' : `/${locale}`, iconName: 'Home' },
    { id: 'prompts', namespace: 'prompts', label: navLabels.prompts[locale] || navLabels.prompts.en, href: `${prefix}/prompts`, iconName: 'Sparkles' },
    { id: 'videos', namespace: 'videos', label: navLabels.videos[locale] || navLabels.videos.en, href: `${prefix}/videos`, iconName: 'Film' },
    { id: 'skills', namespace: 'skills', label: navLabels.skills[locale] || navLabels.skills.en, href: `${prefix}/skills`, iconName: 'Cpu' },
    { id: 'news', namespace: 'news', label: navLabels.news[locale] || navLabels.news.en, href: `${prefix}/news`, iconName: 'Newspaper' },
    { id: 'blog', namespace: 'blog', label: navLabels.blog[locale] || navLabels.blog.en, href: `${prefix}/blog`, iconName: 'BookOpen' },
  ];
}


// Hreflang generator that syncs page tags and XML sitemaps
export function generateHreflangs(
  basePath: string,
  domain: string = 'https://promptat.online',
  publishedLangs: LanguageCode[] = ['ar', 'en', 'es', 'fr', 'id'],
  translatedSlugs?: Partial<Record<LanguageCode, string>>
): HreflangEntry[] {
  const entries: HreflangEntry[] = [];
  
  publishedLangs.forEach(lang => {
    let targetPath = basePath;
    if (translatedSlugs && translatedSlugs[lang]) {
      // Replace last path segment with translated slug if provided
      const segments = basePath.split('/').filter(Boolean);
      if (segments.length >= 2) {
        segments[segments.length - 1] = translatedSlugs[lang]!;
        targetPath = '/' + segments.join('/');
      }
    }

    const fullUrl = `${domain}${buildLocalizedPath(targetPath, lang)}`;
    entries.push({
      lang: lang === 'id' ? 'id' : lang, // Enforce ISO 'id' code for Indonesian
      url: fullUrl
    });
  });

  // Always include x-default pointing to primary Arabic version (or English if missing)
  const defaultEntry = entries.find(e => e.lang === 'ar') || entries.find(e => e.lang === 'en');
  if (defaultEntry) {
    entries.push({
      lang: 'x-default',
      url: defaultEntry.url
    });
  }

  return entries;
}

// Sync HTML document attributes, title, meta description, canonical URL, and hreflang tags
export function updateDocumentLanguageAndSeo(
  lang: LanguageCode,
  basePath: string,
  title: string,
  description: string,
  isIndexable: boolean = true,
  translatedSlugs?: Partial<Record<LanguageCode, string>>
) {
  if (typeof document === 'undefined') return;

  const langConfig = SUPPORTED_LANGUAGES[lang] || SUPPORTED_LANGUAGES.ar;
  const direction = langConfig.dir || (lang === 'ar' ? 'rtl' : 'ltr');

  // 1. Set <html lang="..." dir="..."> and <body dir="...">
  document.documentElement.lang = langConfig.code;
  document.documentElement.dir = direction;
  document.documentElement.setAttribute('dir', direction);

  if (document.body) {
    document.body.dir = direction;
    document.body.setAttribute('dir', direction);
  }

  // 2. Set document title
  if (title) {
    document.title = title;
  }

  // 3. Canonical tag (points to current language version URL)
  const domain = typeof window !== 'undefined' ? window.location.origin : 'https://promptat.online';
  const canonicalUrl = `${domain}${buildLocalizedPath(basePath, lang)}`;

  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', canonicalUrl);

  // Helper to set or create meta tags
  const setMetaTag = (selector: string, attrName: string, attrVal: string, content: string) => {
    let element = document.querySelector(selector);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attrName, attrVal);
      document.head.appendChild(element);
    }
    element.setAttribute('content', content);
  };

  // 4. Meta Description & Robots tags
  if (description) {
    setMetaTag('meta[name="description"]', 'name', 'description', description);
  }
  setMetaTag('meta[name="robots"]', 'name', 'robots', isIndexable ? 'index, follow' : 'noindex, follow');

  // 5. OpenGraph Social Meta Tags
  if (title) {
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', title);
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', title);
  }
  if (description) {
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);
  }
  setMetaTag('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);

  const ogLocales: Record<LanguageCode, string> = {
    ar: 'ar_AR',
    en: 'en_US',
    es: 'es_ES',
    fr: 'fr_FR',
    id: 'id_ID'
  };
  setMetaTag('meta[property="og:locale"]', 'property', 'og:locale', ogLocales[lang] || 'ar_AR');

  // 6. Inject or update Hreflang tags
  document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove());

  const hreflangs = generateHreflangs(basePath, domain, ['ar', 'en', 'es', 'fr', 'id'], translatedSlugs);
  hreflangs.forEach(entry => {
    const link = document.createElement('link');
    link.setAttribute('rel', 'alternate');
    link.setAttribute('hreflang', entry.lang);
    link.setAttribute('href', entry.url);
    document.head.appendChild(link);
  });
}

export interface PageSeoItem {
  title: string;
  description: string;
}

export const PAGE_SEO_MAP: Record<LanguageCode, Record<string, PageSeoItem>> = {
  ar: {
    home: {
      title: 'برومبتات أونلاين | Promptat Online - منصة النماذج والتعليمات الذكية',
      description: 'المكتبة الشاملة لأوامر ومخططات الذكاء الاصطناعي العربية والعالمية، أوامر صور Midjourney وGemini، ومهارات التطوير والتسويق.'
    },
    prompts: {
      title: 'أوامر صور الذكاء الاصطناعي | برومبتات أونلاين',
      description: 'تصفح وحمل أفضل أوامر التصوير الواقعي والفني للذكاء الاصطناعي مع إعدادات الكاميرا والإضاءة والبذور.'
    },
    videos: {
      title: 'برومبتات الفيديو بالذكاء الاصطناعي وأوامر سينمائية | برومبتات أونلاين',
      description: 'أوامر ومخططات فيديو احترافية لتوليد مشاهد سينمائية عبر Runway Gen-3 و Sora و Kling AI و Luma Dream Machine.'
    },
    skills: {
      title: 'مهارات المطورين والكتّاب | برومبتات أونلاين',
      description: 'ملفات .cursorrules وتعليمات السيو البرمجية المتقدمة لتعزيز الإنتاجية عبر نماذج الذكاء الاصطناعي.'
    },
    news: {
      title: 'أخبار الذكاء الاصطناعي والتحديثات اليومية | برومبتات أونلاين',
      description: 'تغطية حية لأحدث إطلاقات نماذج الذكاء الاصطناعي، أدوات الفيديو وتوليد الصور، وتطورات التقنية لحظة بلحظة.'
    },
    blog: {
      title: 'مدونة وأدلة الذكاء الاصطناعي | برومبتات أونلاين',
      description: 'مقالات استراتيجية وأدلة تعليمية مفصلة حول هندسة الأوامر وتنمية قنوات المحتوى وتحسين محركات البحث.'
    },
    search: {
      title: 'بحث شامل في موارد الذكاء الاصطناعي | برومبتات أونلاين',
      description: 'ابحث في آلاف الأوامر والمهارات والمخططات المتاحة على منصة برومبتات أونلاين.'
    },
    login: {
      title: 'تسجيل الدخول | برومبتات أونلاين',
      description: 'سجل الدخول للوصول إلى مجموعتك المحفوظة وأوامرك المفضلة وتحميل المخططات الحصرية.'
    },
    admin: {
      title: 'لوحة الإدارة | برومبتات أونلاين',
      description: 'إدارة محتوى ومخططات منصة برومبتات أونلاين.'
    }
  },
  en: {
    home: {
      title: 'Promptat Online | AI Prompts, Video Generation & Developer Skills',
      description: 'The premier repository of curated AI image prompts, cinematic video prompts, developer skills, and AI engineering tutorials.'
    },
    prompts: {
      title: 'Curated AI Image Prompts Library | Promptat Online',
      description: 'Explore photorealistic AI image prompts for Midjourney, FLUX, and Gemini with lighting setups, seeds, and camera parameters.'
    },
    videos: {
      title: 'Cinematic AI Video Prompts & Motion Blueprints | Promptat Online',
      description: 'Engineered video prompts and camera motions for Runway Gen-3, OpenAI Sora, Kling AI, and Luma Dream Machine.'
    },
    skills: {
      title: 'Developer & Creator AI Skills Library | Promptat Online',
      description: 'Downloadable .cursorrules, multi-step SEO skills, and prompt engineering workflows for AI-powered creators.'
    },
    news: {
      title: 'Breaking AI News, Model Releases & Tech Intelligence | Promptat Online',
      description: 'Stay ahead with real-time AI news, frontier model releases (GPT, Claude, Sora, Runway, Flux), and industry developments.'
    },
    blog: {
      title: 'AI Insights, Guides & Tutorials Blog | Promptat Online',
      description: 'Deep-dive guides on AI prompt engineering, SEO multiplication techniques, and viral content production.'
    },
    search: {
      title: 'Search AI Prompts, Skills & Blueprints | Promptat Online',
      description: 'Find prompt templates, developer skills, and video prompts across the entire Promptat Online library.'
    },
    login: {
      title: 'Sign In | Promptat Online',
      description: 'Log in to access your saved collections, bookmark prompts, and manage your AI creation workflow.'
    },
    admin: {
      title: 'Admin Console | Promptat Online',
      description: 'Promptat Online administration and content management console.'
    }
  },
  es: {
    home: {
      title: 'Promptat Online | Prompts de IA, Video y Habilidades para Creadores',
      description: 'La plataforma líder de prompts para generación de imágenes y videos IA, habilidades de desarrollo y noticias de IA.'
    },
    prompts: {
      title: 'Biblioteca de Prompts de Imágenes IA | Promptat Online',
      description: 'Descubre prompts fotorrealistas para Midjourney y Gemini con parámetros de cámara, iluminación y semillas optimizadas.'
    },
    videos: {
      title: 'Prompts de Video IA y Movimientos Cinematográficos | Promptat Online',
      description: 'Prompts avanzados para generadores de video Runway Gen-3, Sora, Kling AI y Luma Dream Machine.'
    },
    skills: {
      title: 'Habilidades de IA para Desarrolladores y Creadores | Promptat Online',
      description: 'Archivos .cursorrules y flujos de trabajo de ingeniería de prompts para acelerar tu desarrollo con IA.'
    },
    news: {
      title: 'Noticias y Actualizaciones de Inteligencia Artificial | Promptat Online',
      description: 'Últimas noticias de IA, lanzamientos de modelos de lenguaje y herramientas de video e imagen en tiempo real.'
    },
    blog: {
      title: 'Blog de Guías y Tutoriales de Inteligencia Artificial | Promptat Online',
      description: 'Estrategias prácticas de ingeniería de prompts, posicionamiento SEO y creación de contenido automatizado.'
    },
    search: {
      title: 'Buscar Prompts, Habilidades y Guías de IA | Promptat Online',
      description: 'Explora miles de recursos de IA organizados por nicho y categoría en Promptat Online.'
    },
    login: {
      title: 'Iniciar Sesión | Promptat Online',
      description: 'Inicia sesión para guardar tus prompts favoritos y acceder a tus colecciones personalizadas.'
    },
    admin: {
      title: 'Panel de Administración | Promptat Online',
      description: 'Panel de administración y gestión de contenidos de Promptat Online.'
    }
  },
  fr: {
    home: {
      title: 'Promptat Online | Prompts IA, Vidéo IA et Compétences Créateurs',
      description: 'La plateforme de référence pour les prompts d\'images IA, prompts vidéo cinématiques et actualités technologiques.'
    },
    prompts: {
      title: 'Bibliothèque de Prompts d\'Images IA | Promptat Online',
      description: 'Explorez des prompts photoréalistes pour Midjourney et Gemini avec réglages de caméra, éclairage et graines.'
    },
    videos: {
      title: 'Prompts Vidéo IA et Mouvements de Caméra | Promptat Online',
      description: 'Prompts et vecteurs de mouvement cinématique pour Runway Gen-3, OpenAI Sora, Kling AI et Luma.'
    },
    skills: {
      title: 'Compétences IA pour Développeurs et Créateurs | Promptat Online',
      description: 'Fichiers .cursorrules et workflows d\'ingénierie de prompts pour booster votre productivité de développement.'
    },
    news: {
      title: 'Actualités et Nouveautés sur l\'Intelligence Artificielle | Promptat Online',
      description: 'Suivez les dernières actualités IA, sorties de modèles (GPT, Claude, Sora, Runway, Flux) et innovations.'
    },
    blog: {
      title: 'Blog d\'Actualités et Tutoriels sur l\'IA | Promptat Online',
      description: 'Guides approfondis sur l\'ingénierie des prompts, l\'optimisation SEO et les flux de travail assistés par IA.'
    },
    search: {
      title: 'Rechercher des Prompts et Guides IA | Promptat Online',
      description: 'Trouvez des prompts d\'images, compétences de code et scripts vidéo sur Promptat Online.'
    },
    login: {
      title: 'Connexion | Promptat Online',
      description: 'Connectez-vous pour retrouver vos prompts favoris et vos collections de création IA.'
    },
    admin: {
      title: 'Panneau d\'Administration | Promptat Online',
      description: 'Console d\'administration et de gestion des ressources de Promptat Online.'
    }
  },
  id: {
    home: {
      title: 'Promptat Online | Prompt AI, Video AI & Keahlian Pengembang',
      description: 'Platform kurasi prompt gambar AI, prompt video AI sinematik, keahlian pengembang .cursorrules, dan berita AI.'
    },
    prompts: {
      title: 'Pustaka Prompt Gambar AI Pilihan | Promptat Online',
      description: 'Jelajahi prompt fotorealistis untuk Midjourney dan Gemini dengan pengaturan pencahayaan, kamera, dan seed.'
    },
    videos: {
      title: 'Prompt Video AI & Gerakan Kamera Sinematik | Promptat Online',
      description: 'Prompt video berkualitas tinggi untuk Runway Gen-3, OpenAI Sora, Kling AI, dan Luma Dream Machine.'
    },
    skills: {
      title: 'Pustaka Keahlian Pengembang AI | Promptat Online',
      description: 'Unduh berkas .cursorrules dan alur kerja rekayasa prompt untuk mempercepat produktivitas koding dengan AI.'
    },
    news: {
      title: 'Berita AI Terkini & Peluncuran Model | Promptat Online',
      description: 'Ikuti perkembangan dan berita kecerdasan buatan, rilis model bahasa, dan alat AI terbaru.'
    },
    blog: {
      title: 'Blog Panduan & Tutorial Kecerdasan Buatan | Promptat Online',
      description: 'Panduan mendalam tentang rekayasa prompt, optimasi SEO, dan strategi produksi konten bertenaga AI.'
    },
    search: {
      title: 'Cari Prompt, Keahlian, dan Blueprint AI | Promptat Online',
      description: 'Cari ribuan prompt, keahlian coding, dan skrip video viral di Promptat Online.'
    },
    login: {
      title: 'Masuk Akun | Promptat Online',
      description: 'Masuk untuk menyimpan koleksi prompt favorit dan mengelola alur kerja kreatif AI Anda.'
    },
    admin: {
      title: 'Panel Admin | Promptat Online',
      description: 'Konsol administrasi dan pengelolaan konten Promptat Online.'
    }
  }
};

export function getPageSeoMetadata(tab: string, lang: LanguageCode): PageSeoItem {
  const langMap = PAGE_SEO_MAP[lang] || PAGE_SEO_MAP.ar;
  return langMap[tab] || langMap.home;
}

// Interface Dictionary for Common UI Strings across 5 languages (AR, EN, ES, FR, ID)
export const UI_DICTIONARY: Record<LanguageCode, Record<string, string>> = {
  ar: {
    // Navigation & Header
    navHome: 'الرئيسية',
    navPrompts: 'أوامر الصور',
    navVideos: 'برومبتات الفيديو',
    navSkills: 'مهارات المبدعين',
    navNews: 'أخبار AI',
    navNewsBadge: 'مباشر',
    navBlog: 'مدونة الذكاء الاصطناعي',
    navSearch: 'بحث',
    navLatest: 'الأحدث',
    navPopular: 'الأكثر شعبية',
    navSavedCollection: 'المجموعة المحفوظة',
    navAdminPanel: 'لوحة التحكم',
    navSignOut: 'تسجيل الخروج',
    navSignIn: 'تسجيل الدخول',
    selectLanguage: 'اختر اللغة',
    navOpenMenu: 'فتح القائمة',
    navCloseMenu: 'إغلاق القائمة',
    navPrimary: 'الأقسام الرئيسية',
    navSections: 'الأقسام الرئيسية',
    navBrowseGroup: 'التصفح والتصفية',
    searchPlaceholder: 'ابحث في أكثر من 500 مخطط وأمر ذكاء اصطناعي...',
    searchPromptSkillGuide: 'ابحث عن أمر، مهارة، دليل...',
    searchEverything: 'بحث شامل',
    adminConsole: 'لوحة الإدارة',

    // Hero Section
    heroBadge: 'المنصة الرائدة لمبدعي الذكاء الاصطناعي | Promptat Online',
    heroTitlePre: 'أوامر صور جيميني، ',
    heroTitleGemini: 'أوامر صور جيميني',
    heroTitleClaude: 'مهارات كلود لتحسين السيو',
    heroTitleVideos: 'مفاهيم الفيديو الفيروسي',
    heroTitleAnd: ' و ',
    heroSubtitle: 'من أوامر صور جيميني ونانو بنانا إلى مهارات كلود لكتابة المحتوى وأفكار الفيديوهات الفيروسية — كل مورد مصحوب بتعليمات احترافية ونصوص وسكربتات جاهزة للنسخ والاستخدام فوراً.',
    heroSearchPlaceholder: 'ما الذي تريد بناءه؟ جرب "أوامر نانو بنانا"، "مهارات سيو كلود"، "أفكار فيديو فيروسي"...',
    heroSearchButton: 'بحث في كل شيء',
    trending: 'الشائع:',
    browsePrompts: 'تصفح أوامر صور جيميني',
    downloadSkills: 'تحميل مهارات كلود للسيو',
    exploreVideos: 'استكشاف مفاهيم الفيديو الفيروسي',

    // Home Sections
    exploreCategories: 'استكشاف الأقسام الشائعة',
    exploreCategoriesDesc: 'اختر قطاع الذكاء الاصطناعي لعرض قوالب ومخططات الأوامر المجهزة مسبقاً.',
    latestPrompts: 'أحدث أوامر الصور المميزة',
    latestPromptsDesc: 'أوامر تصوير واقعي قابلة للنسخ المباشر مع البذور وإعدادات الكاميرا والإضاءة.',
    seePromptLibrary: 'عرض مكتبة الأوامر',
    devSkills: 'مهارات المطورين والكتّاب',
    devSkillsDesc: 'ملفات .cursorrules قابلة للتنزيل، أوامر سيو متعددة الخطوات، وأدوات هندسة البيانات.',
    seeDevSkills: 'عرض مهارات المطورين',
    trendingVideos: 'مخططات الفيديوهات الفيروسية',
    trendingVideosDesc: 'أعلى المفاهيم احتفاظاً بالمشاهدين، نصوص صوتية كاملة، وخطط الصور المصغرة مع ملفات التنزيل.',
    seeVideoPlans: 'عرض خطط الفيديو',
    guidesTutorials: 'الأدلة والدروس التعليمية',
    guidesTutorialsDesc: 'استراتيجيات عملية تشرح منطق الأوامر وصيغ مضاعفة السيو وإنشاء قنوات ناجحة.',
    seeBlogGuidebooks: 'عرض مدونة الأدلة',

    // Common Buttons & Actions
    copyPrompt: 'نسخ الأمر',
    promptCopied: 'تم نسخ الأمر بنجاح!',
    downloadBlueprint: 'تحميل المخطط',
    downloadTxt: 'تحميل كملف TXT',
    downloadZip: 'تحميل ملف ZIP',
    downloadPdf: 'تحميل كملف PDF',
    downloadJson: 'تحميل كملف JSON',
    viewDetails: 'عرض التفاصيل',
    saveToCollection: 'حفظ في مجموعتي',
    savedToCollection: 'تم الحفظ في مجموعتك',
    removeFromCollection: 'إزالة من المجموعة',
    share: 'مشاركة',
    shareTwitter: 'تويتر / X',
    shareLinkedin: 'لينكد إن',
    shareCopyLink: 'نسخ الرابط',
    linkCopied: 'تم نسخ الرابط!',
    comments: 'التعليقات',
    writeComment: 'أضف تعليقاً أو رأياً...',
    postComment: 'نشر التعليق',
    backToPrompts: 'العودة لمكتبة الأوامر',
    backToSkills: 'العودة لمهارات الذكاء الاصطناعي',
    backToVideos: 'العودة لمخططات الفيديو',
    backToVideoPrompts: 'العودة إلى برومبتات الفيديو',
    backToBlog: 'العودة للمدونة',
    primaryVideoPrompt: 'برومبت الفيديو الأساسي',
    copiedPromptSuccess: 'تم نسخ البرومبت بنجاح!',
    copiedShareLink: 'تم نسخ رابط الخبر!',
    copied: 'تم النسخ!',
    copyFullPrompt: 'نسخ البرومبت بالكامل',
    motionIntensity: 'قوة حركة الفيديو (Motion)',
    motionHint: '1 = حركة بطيئة ناعمة • 10 = حركة سريعة وسينمائية',
    cameraMovement: 'حركة الكاميرا (Camera Motion)',
    supportedGenerators: 'محركات التوليد المدعومة',
    shotDetails: 'مواصفات المشهد',
    resolution: 'الدقة',
    saved: 'محفوظ',
    save: 'حفظ',
    allModels: 'جميع النماذج',
    searchVideoPromptsPlaceholder: 'ابحث في برومبتات الفيديو...',
    noVideoPromptsFound: 'لم يتم العثور على برومبتات فيديو',
    noVideoPromptsFoundDesc: 'جرب البحث بكلمات مختلفة أو إزالة الفلاتر.',
    relatedContent: 'محتوى ذو صلة قد يهمك',
    loading: 'جاري التحميل...',
    noResultsFound: 'لم يتم العثور على نتائج مطابقة',
    noResultsDesc: 'جرب استخدام كلمات بحث مختلفة أو إعادة تعيين الفلاتر المحددة.',
    resetFilters: 'إعادة ضبط الفلاتر',
    filterAll: 'الكل',
    filterCategory: 'القسم',
    filterModel: 'النموذج',
    filterDifficulty: 'المستوى',
    sortBy: 'ترتيب حسب',
    sortLikes: 'الأكثر إعجاباً',
    sortViews: 'الأكثر مشاهدة',
    sortDownloads: 'الأكثر تحميلاً',
    sortDate: 'الأحدث تاريخاً',

    // Difficulty Levels
    beginner: 'مبتدئ',
    intermediate: 'متوسط',
    expert: 'متقدم',

    // Details Specs
    model: 'النموذج',
    style: 'النمط الفني',
    camera: 'الكاميرا والعدسة',
    lighting: 'نمط الإضاءة',
    aspectRatio: 'نسبة الأبعاد',
    seed: 'قيمة البذرة (Seed)',
    negativePrompt: 'الأمر السلبي (Negative Prompt)',
    parameters: 'المعلمات الموصى بها',
    hook: 'الخطاف الفيروسي (Hook)',
    niche: 'المجال (Niche)',
    rpmEstimate: 'العائد المتوقع لكل ألف (RPM)',
    competition: 'المنافسة',
    viralityScore: 'مؤشر الانتشار الفيروسي',
    channelBlueprint: 'مخطط القناة الاستراتيجي',
    videoStructure: 'هيكل الفيديو الموصى به',
    voicePrompt: 'أمر التعليق الصوتي',
    editingPrompt: 'تعليمات المونتاج والتعديل',
    thumbnailPrompt: 'أمر تصميم الصورة المصغرة',
    animationPrompt: 'أمر التحريك البصري',
    monetization: 'استراتيجيات الربح والتحويل',
    affiliateIdeas: 'أفكار التسويق بالعمولة',
    resources: 'الموارد والأدوات المرفقة',
    supportedAi: 'أنظمة الذكاء الاصطناعي المدعومة',
    installation: 'طريقة التثبيت',
    howToUse: 'كيفية الاستخدام الفعال',
    readTime: 'وقت القراءة',
    publishedOn: 'تاريخ النشر',
    byAuthor: 'بواسطة',

    // Newsletter
    newsletterTitle: 'انضم إلى أكثر من 25,000 مبدع ذكاء اصطناعي',
    newsletterDesc: 'احصل أسبوعياً على مخططات أوامر حصرية، ملفات .cursorrules جديدة، وأسرار الفيديوهات الفيروسية مباشرة إلى بريدك الإلكتروني.',
    newsletterInputPlaceholder: 'أدخل بريدك الإلكتروني...',
    subscribeButton: 'اشترك مجاناً',
    subscribeSuccess: 'تم الاشتراك بنجاح! تفقد بريدك لتأكيد الاشتراك.',
    newsletterPrivacy: 'نحترم خصوصيتك بالكامل. يمكنك إلغاء الاشتراك في أي وقت بنقرة واحدة.',

    // Footer
    footerTagline: 'المنصة الرائدة لمبدعي الذكاء الاصطناعي. نعيد ابتكار مكتبات الأوامر كنظم متكاملة تربط أوامر الصور فائقة الدقة بمهارات المطورين ومخططات الفيديوهات الفيروسية وأدلة السيو.',
    footerDirectories: 'أقسام المنصة',
    footerPopularNiches: 'المجالات الشائعة',
    footerCreatorPerks: 'مزايا المبدعين',
    footerStayUpdated: 'ابقَ على اطلاع',
    footerNewsletterDesc: 'أحدث إضافات الأوامر والمخططات في بريدك.',
    footerCopyright: 'برومبتات أونلاين — جميع الحقوق محفوظة.',
    footerPrivacy: 'سياسة الخصوصية',
    footerTerms: 'الشروط والأحكام',
    footerSitemap: 'خريطة الموقع',
    footerRss: 'خلاصة RSS',

    // Banner & Switcher
    translationAvailable: 'هذه الصفحة متوفرة باللغة',
    translationAvailableIn: 'هذه الصفحة متوفرة أيضاً باللغة',
    switchTo: 'الانتقال إلى',
    switchToLanguage: 'الانتقال إلى',
    dismiss: 'إغلاق',
    languageSwitcher: 'اللغة',

    // Auth & Modals
    loginTitle: 'تسجيل الدخول إلى حسابك',
    loginSubtitle: 'احفظ قوالبك المفضلة وشارك أوامرك وتنزيلاتك بسهولة',
    emailLabel: 'البريد الإلكتروني',
    passwordLabel: 'كلمة المرور',
    continueGoogle: 'المتابعة باستخدام Google',
    continueGithub: 'المتابعة باستخدام GitHub',
    myCollectionTitle: 'مجموعتي المحفوظة',
    emptyCollectionDesc: 'لم تقم بحفظ أي قوالب أو أوامر بعد. اضغط على أيقونة الحفظ في أي بطاقة لإضافتها هنا.',
    accountSettingsTitle: 'إعدادات الحساب',
    accountSettings: 'إعدادات الحساب',

    // Admin
    adminTitle: 'لوحة إدارة الموقع',
    internationalSeoTitle: 'السيو الدولي وتوافق Hreflang',
    translationManagerTitle: 'مدير الترجمات والمحتوى متعدد اللغات',
    statusPublished: 'منشور',
    statusDraft: 'مسودة',
    statusMissing: 'مفقود',
    statusReviewed: 'تمت المراجعة',
  },

  en: {
    // Navigation & Header
    navHome: 'Home',
    navPrompts: 'AI Prompts',
    navVideos: 'AI Video Prompts',
    navSkills: 'Skills Library',
    navNews: 'AI News',
    navNewsBadge: 'LIVE',
    navBlog: 'Blogs & Guides',
    navSearch: 'Search',
    navLatest: 'Latest',
    navPopular: 'Popular',
    navSavedCollection: 'Saved Collection',
    navAdminPanel: 'Admin Panel',
    navSignOut: 'Sign Out',
    navSignIn: 'Sign In',
    selectLanguage: 'Select Language',
    navOpenMenu: 'Open navigation menu',
    navCloseMenu: 'Close navigation menu',
    navPrimary: 'Main Navigation',
    navSections: 'Main Sections',
    navBrowseGroup: 'Browse & Filters',
    searchPlaceholder: 'Search 500+ AI prompt blueprints & skills...',
    searchPromptSkillGuide: 'Find a prompt, skill, guide...',
    searchEverything: 'Search everything',
    adminConsole: 'Admin Console',

    // Hero Section
    heroBadge: 'The Premier Promptat Online Hub',
    heroTitlePre: 'Gemini Image Prompts, ',
    heroTitleGemini: 'Gemini Image Prompts',
    heroTitleClaude: 'Claude SEO Skills',
    heroTitleVideos: 'Viral Video Concepts',
    heroTitleAnd: ' & ',
    heroSubtitle: 'From Gemini image prompts and Nano Banana prompts to Claude SEO skills for writing content and full viral video concepts — every asset is paired with professional instructions, scripts, and automation pipelines, ready to copy and build with today.',
    heroSearchPlaceholder: 'What are you building? Try \'Nano Banana prompts\', \'Claude SEO skills\', \'Viral video concepts\'...',
    heroSearchButton: 'Search everything',
    trending: 'Trending:',
    browsePrompts: 'Browse Gemini Image Prompts',
    downloadSkills: 'Download Claude SEO Skills',
    exploreVideos: 'Explore Viral Video Concepts',

    // Home Sections
    exploreCategories: 'Explore Popular Categories',
    exploreCategoriesDesc: 'Select an AI sector to view pre-configured prompt architectures and templates.',
    latestPrompts: 'Latest Premium Prompts',
    latestPromptsDesc: 'Copy-pasteable photorealistic prompts complete with seeds, camera parameters, and lighting styles.',
    seePromptLibrary: 'See prompt library',
    devSkills: 'Developer & Writer Skills',
    devSkillsDesc: 'Downloadable .cursorrules files, multi-step SEO prompts, and full-stack DB architecture schema tools.',
    seeDevSkills: 'See developer skills',
    trendingVideos: 'Trending Viral Video Blueprints',
    trendingVideosDesc: 'The absolute highest-retention concepts, full voice scripts, thumbnail plans, and downloadable resource zip packs.',
    seeVideoPlans: 'See video plans',
    guidesTutorials: 'Guides & Tutorials',
    guidesTutorialsDesc: 'Actionable strategies explaining prompt logic, SEOMultiplier formulas, and short-form channel execution.',
    seeBlogGuidebooks: 'See blog guidebooks',

    // Common Buttons & Actions
    copyPrompt: 'Copy Prompt',
    promptCopied: 'Prompt copied to clipboard!',
    downloadBlueprint: 'Download Blueprint',
    downloadTxt: 'Download as TXT',
    downloadZip: 'Download ZIP file',
    downloadPdf: 'Download as PDF',
    downloadJson: 'Download as JSON',
    viewDetails: 'View Details',
    saveToCollection: 'Save to Collection',
    savedToCollection: 'Saved to your collection',
    removeFromCollection: 'Removed from collection',
    share: 'Share',
    shareTwitter: 'Twitter / X',
    shareLinkedin: 'LinkedIn',
    shareCopyLink: 'Copy Link',
    linkCopied: 'Link copied!',
    comments: 'Comments',
    writeComment: 'Leave a comment or feedback...',
    postComment: 'Post Comment',
    backToPrompts: 'Back to Prompts',
    backToSkills: 'Back to Skills',
    backToVideos: 'Back to Videos',
    backToVideoPrompts: 'Back to AI Video Prompts',
    backToBlog: 'Back to Blog',
    primaryVideoPrompt: 'Primary Video Prompt',
    copiedPromptSuccess: 'Prompt copied successfully!',
    copiedShareLink: 'News link copied!',
    copied: 'Copied!',
    copyFullPrompt: 'Copy Full Prompt',
    motionIntensity: 'Video Motion Intensity',
    motionHint: '1 = Smooth slow motion • 10 = Fast cinematic action',
    cameraMovement: 'Camera Movement',
    supportedGenerators: 'Supported AI Video Engines',
    shotDetails: 'Shot Specifications',
    resolution: 'Resolution',
    saved: 'Saved',
    save: 'Save',
    allModels: 'All Models',
    searchVideoPromptsPlaceholder: 'Search video prompts...',
    noVideoPromptsFound: 'No video prompts found',
    noVideoPromptsFoundDesc: 'Try adjusting your search terms or selecting a different model filter.',
    relatedContent: 'Related Content You Might Like',
    loading: 'Loading...',
    noResultsFound: 'No matching results found',
    noResultsDesc: 'Try adjusting your search keywords or resetting the selected filters.',
    resetFilters: 'Reset Filters',
    filterAll: 'All',
    filterCategory: 'Category',
    filterModel: 'Model',
    filterDifficulty: 'Difficulty',
    sortBy: 'Sort by',
    sortLikes: 'Most Liked',
    sortViews: 'Most Viewed',
    sortDownloads: 'Most Downloaded',
    sortDate: 'Newest First',

    // Difficulty Levels
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    expert: 'Expert',

    // Details Specs
    model: 'Model',
    style: 'Art Style',
    camera: 'Camera & Lens',
    lighting: 'Lighting Style',
    aspectRatio: 'Aspect Ratio',
    seed: 'Seed Value',
    negativePrompt: 'Negative Prompt',
    parameters: 'Recommended Parameters',
    hook: 'Viral Hook',
    niche: 'Niche',
    rpmEstimate: 'Expected RPM',
    competition: 'Competition',
    viralityScore: 'Virality Score',
    channelBlueprint: 'Strategic Channel Blueprint',
    videoStructure: 'Recommended Video Structure',
    voicePrompt: 'Voiceover Prompt',
    editingPrompt: 'Video Editing Prompt',
    thumbnailPrompt: 'Thumbnail Prompt',
    animationPrompt: 'Animation Prompt',
    monetization: 'Monetization & Conversion',
    affiliateIdeas: 'Affiliate Marketing Ideas',
    resources: 'Attached Resources & Tools',
    supportedAi: 'Supported AI Systems',
    installation: 'Installation Instructions',
    howToUse: 'How to Use Effectively',
    readTime: 'Read Time',
    publishedOn: 'Published On',
    byAuthor: 'By',

    // Newsletter
    newsletterTitle: 'Join 25,000+ AI Creators & Builders',
    newsletterDesc: 'Get weekly exclusive prompt blueprints, new .cursorrules templates, and viral video secrets delivered straight to your inbox.',
    newsletterInputPlaceholder: 'Enter your email address...',
    subscribeButton: 'Subscribe Free',
    subscribeSuccess: 'Successfully subscribed! Please check your inbox.',
    newsletterPrivacy: 'We respect your privacy completely. Unsubscribe anytime with a single click.',

    // Footer
    footerTagline: 'The premier AI Creator Hub. Reimagining prompt libraries as integrated systems: linking high-fidelity image prompts, downloadable developer skills, viral video blueprints, and complete SEO frameworks.',
    footerDirectories: 'HUB DIRECTORIES',
    footerPopularNiches: 'POPULAR NICHES',
    footerCreatorPerks: 'CREATOR PERKS',
    footerStayUpdated: 'STAY UPDATED',
    footerNewsletterDesc: 'Fresh prompt blueprints delivered to your inbox.',
    footerCopyright: 'Promptat Online — All rights reserved.',
    footerPrivacy: 'Privacy Policy',
    footerTerms: 'Terms & Conditions',
    footerSitemap: 'Sitemap Feed',
    footerRss: 'RSS Blog Feed',

    // Banner & Switcher
    translationAvailable: 'This page is available in',
    translationAvailableIn: 'This page is also available in',
    switchTo: 'Switch to',
    switchToLanguage: 'Switch to',
    dismiss: 'Dismiss',
    languageSwitcher: 'Language',

    // Auth & Modals
    loginTitle: 'Sign In to Your Account',
    loginSubtitle: 'Save your favorite blueprints and submit your own prompts',
    emailLabel: 'Email Address',
    passwordLabel: 'Password',
    continueGoogle: 'Continue with Google',
    continueGithub: 'Continue with GitHub',
    myCollectionTitle: 'My Saved Collection',
    emptyCollectionDesc: 'No items saved yet. Click the bookmark icon on any card to save it here.',
    accountSettingsTitle: 'Account Settings',
    accountSettings: 'Account Settings',

    // Admin
    adminTitle: 'Admin Management Console',
    internationalSeoTitle: 'International SEO & Hreflang Validation',
    translationManagerTitle: 'Translation Manager & Multilingual Content',
    statusPublished: 'Published',
    statusDraft: 'Draft',
    statusMissing: 'Missing',
    statusReviewed: 'Reviewed',
  },

  es: {
    // Navigation & Header
    navHome: 'Inicio',
    navPrompts: 'Prompts IA',
    navVideos: 'Prompts de Video IA',
    navSkills: 'Habilidades',
    navNews: 'Noticias IA',
    navNewsBadge: 'EN VIVO',
    navBlog: 'Blog y Guías',
    navSearch: 'Buscar',
    navLatest: 'Recientes',
    navPopular: 'Populares',
    navSavedCollection: 'Colección Guardada',
    navAdminPanel: 'Panel de Control',
    navSignOut: 'Cerrar Sesión',
    navSignIn: 'Iniciar Sesión',
    selectLanguage: 'Seleccionar Idioma',
    navOpenMenu: 'Abrir menú de navegación',
    navCloseMenu: 'Cerrar menú de navegación',
    navPrimary: 'Navegación Principal',
    navSections: 'Secciones Principales',
    navBrowseGroup: 'Exploración y Filtros',
    searchPlaceholder: 'Buscar en más de 500 plantillas y prompts de IA...',
    searchPromptSkillGuide: 'Buscar prompt, habilidad, tutorial...',
    searchEverything: 'Buscar todo',
    adminConsole: 'Consola de Admin',

    // Hero Section
    heroBadge: 'El Centro Líder para Creadores de IA | Promptat Online',
    heroTitlePre: 'Prompts de Imagen Gemini, ',
    heroTitleGemini: 'Prompts de Imagen Gemini',
    heroTitleClaude: 'Habilidades SEO para Claude',
    heroTitleVideos: 'Conceptos de Video Viral',
    heroTitleAnd: ' y ',
    heroSubtitle: 'Desde prompts fotográficos de Gemini y Nano Banana hasta habilidades de SEO para Claude y conceptos completos de video viral: cada recurso incluye instrucciones profesionales listas para copiar y crear hoy.',
    heroSearchPlaceholder: '¿Qué estás creando? Prueba \'prompts Nano Banana\', \'habilidades SEO Claude\', \'videos virales\'...',
    heroSearchButton: 'Buscar en todo',
    trending: 'Tendencia:',
    browsePrompts: 'Explorar Prompts de Gemini',
    downloadSkills: 'Descargar Habilidades Claude',
    exploreVideos: 'Explorar Videos Virales',

    // Home Sections
    exploreCategories: 'Explorar Categorías Populares',
    exploreCategoriesDesc: 'Selecciona un sector de IA para ver arquitecturas de prompts y plantillas prediseñadas.',
    latestPrompts: 'Últimos Prompts Premium',
    latestPromptsDesc: 'Prompts fotorrealistas listos para copiar con semillas, parámetros de cámara e iluminación.',
    seePromptLibrary: 'Ver biblioteca de prompts',
    devSkills: 'Habilidades para Desarrolladores y Redactores',
    devSkillsDesc: 'Archivos .cursorrules descargables, prompts de SEO avanzado y esquemas de base de datos.',
    seeDevSkills: 'Ver habilidades dev',
    trendingVideos: 'Guías de Video Viral en Tendencia',
    trendingVideosDesc: 'Conceptos con máxima retención, guiones de voz completos, planes de miniaturas y recursos descargables.',
    seeVideoPlans: 'Ver planes de video',
    guidesTutorials: 'Guías y Tutoriales',
    guidesTutorialsDesc: 'Estrategias prácticas que explican la lógica de prompts, fórmulas de SEO y canales virales.',
    seeBlogGuidebooks: 'Ver guías del blog',

    // Common Buttons & Actions
    copyPrompt: 'Copiar Prompt',
    promptCopied: '¡Prompt copiado al portapapeles!',
    downloadBlueprint: 'Descargar Guía',
    downloadTxt: 'Descargar en TXT',
    downloadZip: 'Descargar archivo ZIP',
    downloadPdf: 'Descargar en PDF',
    downloadJson: 'Descargar en JSON',
    viewDetails: 'Ver Detalles',
    saveToCollection: 'Guardar en Colección',
    savedToCollection: 'Guardado en tu colección',
    removeFromCollection: 'Eliminado de la colección',
    share: 'Compartir',
    shareTwitter: 'Twitter / X',
    shareLinkedin: 'LinkedIn',
    shareCopyLink: 'Copiar Enlace',
    linkCopied: '¡Enlace copiado!',
    comments: 'Comentarios',
    writeComment: 'Escribe un comentario u opinión...',
    postComment: 'Publicar Comentario',
    backToPrompts: 'Volver a Prompts',
    backToSkills: 'Volver a Habilidades',
    backToVideos: 'Volver a Videos',
    backToVideoPrompts: 'Volver a Prompts de Video IA',
    backToBlog: 'Volver al Blog',
    primaryVideoPrompt: 'Prompt de Video Principal',
    copiedPromptSuccess: '¡Prompt copiado con éxito!',
    copiedShareLink: '¡Enlace de noticia copiado!',
    copied: '¡Copiado!',
    copyFullPrompt: 'Copiar Prompt Completo',
    motionIntensity: 'Intensidad de Movimiento de Video',
    motionHint: '1 = Movimiento suave y lento • 10 = Acción cinematográfica rápida',
    cameraMovement: 'Movimiento de Cámara',
    supportedGenerators: 'Motores de Video IA Compatibles',
    shotDetails: 'Especificaciones de la Toma',
    resolution: 'Resolución',
    saved: 'Guardado',
    save: 'Guardar',
    allModels: 'Todos los Modelos',
    searchVideoPromptsPlaceholder: 'Buscar prompts de video...',
    noVideoPromptsFound: 'No se encontraron prompts de video',
    noVideoPromptsFoundDesc: 'Intenta ajustar tus términos de búsqueda o cambiar el filtro de modelo.',
    relatedContent: 'Contenido Relacionado',
    loading: 'Cargando...',
    noResultsFound: 'No se encontraron resultados',
    noResultsDesc: 'Intenta ajustar tus términos de búsqueda o restablecer los filtros seleccionados.',
    resetFilters: 'Restablecer Filtros',
    filterAll: 'Todos',
    filterCategory: 'Categoría',
    filterModel: 'Modelo',
    filterDifficulty: 'Dificultad',
    sortBy: 'Ordenar por',
    sortLikes: 'Más Me Gusta',
    sortViews: 'Más Vistos',
    sortDownloads: 'Más Descargados',
    sortDate: 'Más Recientes',

    // Difficulty Levels
    beginner: 'Principiante',
    intermediate: 'Intermedio',
    expert: 'Experto',

    // Details Specs
    model: 'Modelo',
    style: 'Estilo Artístico',
    camera: 'Cámara y Lente',
    lighting: 'Estilo de Iluminación',
    aspectRatio: 'Relación de Aspecto',
    seed: 'Valor de Semilla (Seed)',
    negativePrompt: 'Prompt Negativo',
    parameters: 'Parámetros Recomendados',
    hook: 'Gancho Viral (Hook)',
    niche: 'Nicho',
    rpmEstimate: 'RPM Estimado',
    competition: 'Competencia',
    viralityScore: 'Puntuación de Viralidad',
    channelBlueprint: 'Estrategia del Canal',
    videoStructure: 'Estructura Recomendada del Video',
    voicePrompt: 'Prompt de Voz en Off',
    editingPrompt: 'Instrucciones de Edición',
    thumbnailPrompt: 'Prompt de Miniatura',
    animationPrompt: 'Prompt de Animación',
    monetization: 'Monetización y Conversión',
    affiliateIdeas: 'Ideas de Afiliados',
    resources: 'Recursos Adjuntos',
    supportedAi: 'Sistemas de IA Compatibles',
    installation: 'Instrucciones de Instalación',
    howToUse: 'Cómo Utilizarlo Eficazmente',
    readTime: 'Tiempo de lectura',
    publishedOn: 'Publicado el',
    byAuthor: 'Por',

    // Newsletter
    newsletterTitle: 'Únete a más de 25,000 creadores de IA',
    newsletterDesc: 'Recibe semanalmente prompts exclusivos, plantillas de .cursorrules y secretos de videos virales directamente en tu correo.',
    newsletterInputPlaceholder: 'Ingresa tu correo electrónico...',
    subscribeButton: 'Suscribirse Gratis',
    subscribeSuccess: '¡Suscripción exitosa! Por favor revisa tu bandeja de entrada.',
    newsletterPrivacy: 'Respetamos tu privacidad. Puedes darte de baja en cualquier momento con un clic.',

    // Footer
    footerTagline: 'El centro líder para creadores de IA. Reimaginando bibliotecas de prompts como sistemas integrados: uniendo prompts de alta fidelidad, habilidades para desarrolladores y guías de video viral.',
    footerDirectories: 'DIRECTORIOS',
    footerPopularNiches: 'NICHOS POPULARES',
    footerCreatorPerks: 'VENTAJAS PARA CREADORES',
    footerStayUpdated: 'MANTENTE AL DÍA',
    footerNewsletterDesc: 'Prompts y guías frescas en tu bandeja de entrada.',
    footerCopyright: 'Promptat Online — Todos los derechos reservados.',
    footerPrivacy: 'Política de Privacidad',
    footerTerms: 'Términos y Condiciones',
    footerSitemap: 'Mapa del Sitio',
    footerRss: 'Feed RSS',

    // Banner & Switcher
    translationAvailable: 'Esta página está disponible en',
    translationAvailableIn: 'Esta página también está disponible en',
    switchTo: 'Cambiar a',
    switchToLanguage: 'Cambiar a',
    dismiss: 'Cerrar',
    languageSwitcher: 'Idioma',

    // Auth & Modals
    loginTitle: 'Inicia Sesión en tu Cuenta',
    loginSubtitle: 'Guarda tus plantillas favoritas y envía tus propios prompts',
    emailLabel: 'Correo Electrónico',
    passwordLabel: 'Contraseña',
    continueGoogle: 'Continuar con Google',
    continueGithub: 'Continuar con GitHub',
    myCollectionTitle: 'Mi Colección Guardada',
    emptyCollectionDesc: 'No hay elementos guardados aún. Haz clic en el icono de guardar en cualquier tarjeta.',
    accountSettingsTitle: 'Configuración de Cuenta',
    accountSettings: 'Configuración de Cuenta',

    // Admin
    adminTitle: 'Consola de Administración',
    internationalSeoTitle: 'SEO Internacional y Validación Hreflang',
    translationManagerTitle: 'Gestor de Traducciones y Contenido Multilingüe',
    statusPublished: 'Publicado',
    statusDraft: 'Borrador',
    statusMissing: 'Faltante',
    statusReviewed: 'Revisado',
  },

  fr: {
    // Navigation & Header
    navHome: 'Accueil',
    navPrompts: 'Prompts IA',
    navVideos: 'Prompts Vidéo IA',
    navSkills: 'Compétences',
    navNews: 'Actualités IA',
    navNewsBadge: 'EN DIRECT',
    navBlog: 'Blog & Guides',
    navSearch: 'Rechercher',
    navLatest: 'Récents',
    navPopular: 'Populaires',
    navSavedCollection: 'Collection Enregistrée',
    navAdminPanel: 'Panneau Admin',
    navSignOut: 'Déconnexion',
    navSignIn: 'Connexion',
    selectLanguage: 'Choisir la langue',
    navOpenMenu: 'Ouvrir le menu de navigation',
    navCloseMenu: 'Fermer le menu de navigation',
    navPrimary: 'Navigation Principale',
    navSections: 'Sections Principales',
    navBrowseGroup: 'Parcourir et Filtres',
    searchPlaceholder: 'Rechercher parmi 500+ modèles de prompts et compétences IA...',
    searchPromptSkillGuide: 'Trouver un prompt, compétence, guide...',
    searchEverything: 'Tout rechercher',
    adminConsole: 'Console Admin',

    // Hero Section
    heroBadge: 'Le Hub d\'Élite pour Créateurs IA | Promptat Online',
    heroTitlePre: 'Prompts d\'Image Gemini, ',
    heroTitleGemini: 'Prompts d\'Image Gemini',
    heroTitleClaude: 'Compétences SEO Claude',
    heroTitleVideos: 'Concepts de Vidéos Virales',
    heroTitleAnd: ' et ',
    heroSubtitle: 'Des prompts d\'images Gemini et Nano Banana aux compétences SEO Claude pour la rédaction de contenu et aux concepts vidéo complets : chaque ressource est accompagnée d\'instructions professionnelles prêtes à l\'emploi.',
    heroSearchPlaceholder: 'Que construisez-vous ? Essayez \'prompts Nano Banana\', \'compétences SEO Claude\', \'vidéos virales\'...',
    heroSearchButton: 'Tout rechercher',
    trending: 'Tendances :',
    browsePrompts: 'Parcourir les Prompts Gemini',
    downloadSkills: 'Télécharger les Compétences Claude',
    exploreVideos: 'Explorer les Vidéos Virales',

    // Home Sections
    exploreCategories: 'Explorer les Catégories Populaires',
    exploreCategoriesDesc: 'Sélectionnez un secteur IA pour consulter des architectures de prompts et modèles préconfigurés.',
    latestPrompts: 'Derniers Prompts Premium',
    latestPromptsDesc: 'Prompts photoréalistes prêts à copier avec graines, réglages de caméra et éclairage.',
    seePromptLibrary: 'Voir la bibliothèque',
    devSkills: 'Compétences Développeurs & Rédacteurs',
    devSkillsDesc: 'Fichiers .cursorrules téléchargeables, prompts SEO avancés et schémas de base de données.',
    seeDevSkills: 'Voir compétences dev',
    trendingVideos: 'Modèles de Vidéos Virales Populaires',
    trendingVideosDesc: 'Concepts à très forte rétention, scripts voix complets, plans de miniatures et packs téléchargeables.',
    seeVideoPlans: 'Voir les plans vidéo',
    guidesTutorials: 'Guides & Tutoriels',
    guidesTutorialsDesc: 'Stratégies concrètes détaillant la logique des prompts, formules SEO et chaînes courtes performantes.',
    seeBlogGuidebooks: 'Voir les playbooks',

    // Common Buttons & Actions
    copyPrompt: 'Copier le Prompt',
    promptCopied: 'Prompt copié dans le presse-papiers !',
    downloadBlueprint: 'Télécharger le Modèle',
    downloadTxt: 'Télécharger en TXT',
    downloadZip: 'Télécharger le fichier ZIP',
    downloadPdf: 'Télécharger en PDF',
    downloadJson: 'Télécharger en JSON',
    viewDetails: 'Voir les Détails',
    saveToCollection: 'Enregistrer dans ma collection',
    savedToCollection: 'Enregistré dans votre collection',
    removeFromCollection: 'Retiré de la collection',
    share: 'Partager',
    shareTwitter: 'Twitter / X',
    shareLinkedin: 'LinkedIn',
    shareCopyLink: 'Copier le Lien',
    linkCopied: 'Lien copié !',
    comments: 'Commentaires',
    writeComment: 'Laisser un commentaire ou avis...',
    postComment: 'Publier le Commentaire',
    backToPrompts: 'Retour aux Prompts',
    backToSkills: 'Retour aux Compétences',
    backToVideos: 'Retour aux Vidéos',
    backToVideoPrompts: 'Retour aux Prompts Vidéo IA',
    backToBlog: 'Retour au Blog',
    primaryVideoPrompt: 'Prompt Vidéo Principal',
    copiedPromptSuccess: 'Prompt copié avec succès !',
    copiedShareLink: 'Lien de l\'actualité copié !',
    copied: 'Copié !',
    copyFullPrompt: 'Copier le Prompt Complet',
    motionIntensity: 'Intensité du Mouvement Vidéo',
    motionHint: '1 = Mouvement fluide et lent • 10 = Action cinématique rapide',
    cameraMovement: 'Mouvement de Caméra',
    supportedGenerators: 'Moteurs Vidéo IA Pris en Charge',
    shotDetails: 'Spécifications du Plan',
    resolution: 'Résolution',
    saved: 'Enregistré',
    save: 'Enregistrer',
    allModels: 'Tous les Modèles',
    searchVideoPromptsPlaceholder: 'Rechercher des prompts vidéo...',
    noVideoPromptsFound: 'Aucun prompt vidéo trouvé',
    noVideoPromptsFoundDesc: 'Essayez de modifier votre recherche ou de changer de filtre.',
    relatedContent: 'Contenu Recommandé',
    loading: 'Chargement...',
    noResultsFound: 'Aucun résultat trouvé',
    noResultsDesc: 'Modifiez vos mots-clés ou réinitialisez les filtres sélectionnés.',
    resetFilters: 'Réinitialiser les Filtres',
    filterAll: 'Tous',
    filterCategory: 'Catégorie',
    filterModel: 'Modèle',
    filterDifficulty: 'Difficulté',
    sortBy: 'Trier par',
    sortLikes: 'Plus Aimés',
    sortViews: 'Plus Vus',
    sortDownloads: 'Plus Téléchargés',
    sortDate: 'Plus Récents',

    // Difficulty Levels
    beginner: 'Débutant',
    intermediate: 'Intermédiaire',
    expert: 'Expert',

    // Details Specs
    model: 'Modèle',
    style: 'Style Artistique',
    camera: 'Caméra & Objectif',
    lighting: 'Style d\'Éclairage',
    aspectRatio: 'Format d\'Image',
    seed: 'Valeur de Graine (Seed)',
    negativePrompt: 'Prompt Négatif',
    parameters: 'Paramètres Recommandés',
    hook: 'Accroche Virale (Hook)',
    niche: 'Niche',
    rpmEstimate: 'RPM Estimé',
    competition: 'Concurrence',
    viralityScore: 'Score de Viralité',
    channelBlueprint: 'Stratégie de Chaîne',
    videoStructure: 'Structure Recommandée de la Vidéo',
    voicePrompt: 'Prompt Voix Off',
    editingPrompt: 'Instructions de Montage',
    thumbnailPrompt: 'Prompt de Miniature',
    animationPrompt: 'Prompt d\'Animation',
    monetization: 'Monétisation & Conversion',
    affiliateIdeas: 'Idées d\'Affiliation',
    resources: 'Ressources & Outils Inclus',
    supportedAi: 'Systèmes IA Pris en Charge',
    installation: 'Instructions d\'Installation',
    howToUse: 'Mode d\'Emploi Efficace',
    readTime: 'Temps de lecture',
    publishedOn: 'Publié le',
    byAuthor: 'Par',

    // Newsletter
    newsletterTitle: 'Rejoignez plus de 25 000 créateurs IA',
    newsletterDesc: 'Recevez chaque semaine des blueprints exclusifs, de nouveaux modèles .cursorrules et des astuces vidéo virales directement dans votre boîte mail.',
    newsletterInputPlaceholder: 'Entrez votre adresse email...',
    subscribeButton: 'S\'abonner Gratuitement',
    subscribeSuccess: 'Inscription réussie ! Veuillez vérifier votre boîte de réception.',
    newsletterPrivacy: 'Nous respectons votre vie privée. Désabonnez-vous à tout moment en un clic.',

    // Footer
    footerTagline: 'Le hub de référence pour créateurs IA. Réinventer les bibliothèques de prompts en écosystèmes complets : reliant prompts d\'images haute fidélité, compétences développeurs et vidéos virales.',
    footerDirectories: 'RÉPERTOIRES',
    footerPopularNiches: 'NICHES POPULAIRES',
    footerCreatorPerks: 'AVANTAGES CRÉATEURS',
    footerStayUpdated: 'RESTEZ INFORMÉ',
    footerNewsletterDesc: 'Nouveaux prompts livrés dans votre boîte mail.',
    footerCopyright: 'Promptat Online — Tous droits réservés.',
    footerPrivacy: 'Politique de Confidentialité',
    footerTerms: 'Conditions Générales',
    footerSitemap: 'Plan du Site',
    footerRss: 'Flux RSS',

    // Banner & Switcher
    translationAvailable: 'Cette page est disponible en',
    translationAvailableIn: 'Cette page est également disponible en',
    switchTo: 'Passer en',
    switchToLanguage: 'Passer en',
    dismiss: 'Fermer',
    languageSwitcher: 'Langue',

    // Auth & Modals
    loginTitle: 'Connexion à votre Compte',
    loginSubtitle: 'Enregistrez vos blueprints favoris et partagez vos prompts',
    emailLabel: 'Adresse Email',
    passwordLabel: 'Mot de Passe',
    continueGoogle: 'Continuer avec Google',
    continueGithub: 'Continuer avec GitHub',
    myCollectionTitle: 'Ma Collection Enregistrée',
    emptyCollectionDesc: 'Aucun élément enregistré pour l\'instant. Cliquez sur l\'icône de favori sur une carte.',
    accountSettingsTitle: 'Paramètres du Compte',
    accountSettings: 'Paramètres du Compte',

    // Admin
    adminTitle: 'Console d\'Administration',
    internationalSeoTitle: 'SEO International et Validation Hreflang',
    translationManagerTitle: 'Gestionnaire de Traductions Multilingues',
    statusPublished: 'Publié',
    statusDraft: 'Brouillon',
    statusMissing: 'Manquant',
    statusReviewed: 'Révisé',
  },

  id: {
    // Navigation & Header
    navHome: 'Beranda',
    navPrompts: 'Prompt AI',
    navVideos: 'Prompt Video AI',
    navSkills: 'Pustaka Keahlian',
    navNews: 'Berita AI',
    navNewsBadge: 'LANGSUNG',
    navBlog: 'Blog & Panduan',
    navSearch: 'Cari',
    navLatest: 'Terbaru',
    navPopular: 'Populer',
    navSavedCollection: 'Koleksi Tersimpan',
    navAdminPanel: 'Panel Admin',
    navSignOut: 'Keluar',
    navSignIn: 'Masuk',
    selectLanguage: 'Pilih Bahasa',
    navOpenMenu: 'Buka menu navigasi',
    navCloseMenu: 'Tutup menu navigasi',
    navPrimary: 'Navigasi Utama',
    navSections: 'Bagian Utama',
    navBrowseGroup: 'Jelajah & Filter',
    searchPlaceholder: 'Cari 500+ blueprint prompt & keahlian AI...',
    searchPromptSkillGuide: 'Temukan prompt, keahlian, panduan...',
    searchEverything: 'Cari semua',
    adminConsole: 'Konsol Admin',

    // Hero Section
    heroBadge: 'Pusat Kreator AI Terkemuka | Promptat Online',
    heroTitlePre: 'Prompt Gambar Gemini, ',
    heroTitleGemini: 'Prompt Gambar Gemini',
    heroTitleClaude: 'Keahlian SEO Claude',
    heroTitleVideos: 'Konsep Video Viral',
    heroTitleAnd: ' & ',
    heroSubtitle: 'Mulai dari prompt gambar Gemini dan Nano Banana hingga keahlian SEO Claude untuk penulisan konten serta konsep video viral lengkap — setiap aset dilengkapi instruksi profesional siap pakai hari ini.',
    heroSearchPlaceholder: 'Apa yang sedang Anda bangun? Coba \'prompt Nano Banana\', \'keahlian SEO Claude\', \'video viral\'...',
    heroSearchButton: 'Cari semuanya',
    trending: 'Sedang Tren:',
    browsePrompts: 'Jelajahi Prompt Gemini',
    downloadSkills: 'Unduh Keahlian Claude',
    exploreVideos: 'Jelajahi Video Viral',

    // Home Sections
    exploreCategories: 'Jelajahi Kategori Populer',
    exploreCategoriesDesc: 'Pilih sektor AI untuk melihat arsitektur prompt dan template yang siap digunakan.',
    latestPrompts: 'Prompt Premium Terbaru',
    latestPromptsDesc: 'Prompt fotorealistik siap salin lengkap dengan seed, pengaturan kamera, dan gaya pencahayaan.',
    seePromptLibrary: 'Lihat pustaka prompt',
    devSkills: 'Keahlian Pengembang & Penulis',
    devSkillsDesc: 'File .cursorrules yang dapat diunduh, prompt SEO bertahap, dan skema database lengkap.',
    seeDevSkills: 'Lihat keahlian dev',
    trendingVideos: 'Blueprint Video Viral Populer',
    trendingVideosDesc: 'Konsep dengan retensi penonton tertinggi, naskah audio lengkap, rencana thumbnail, dan paket file unduhan.',
    seeVideoPlans: 'Lihat rencana video',
    guidesTutorials: 'Panduan & Tutorial',
    guidesTutorialsDesc: 'Strategi praktis yang menjelaskan logika prompt, formula pelipatgandaan SEO, dan pembuatan kanal video sukses.',
    seeBlogGuidebooks: 'Lihat panduan blog',

    // Common Buttons & Actions
    copyPrompt: 'Salin Prompt',
    promptCopied: 'Prompt berhasil disalin ke papan klip!',
    downloadBlueprint: 'Unduh Blueprint',
    downloadTxt: 'Unduh sebagai TXT',
    downloadZip: 'Unduh file ZIP',
    downloadPdf: 'Unduh sebagai PDF',
    downloadJson: 'Unduh sebagai JSON',
    viewDetails: 'Lihat Detail',
    saveToCollection: 'Simpan ke Koleksi',
    savedToCollection: 'Tersimpan di koleksi Anda',
    removeFromCollection: 'Dihapus dari koleksi',
    share: 'Bagikan',
    shareTwitter: 'Twitter / X',
    shareLinkedin: 'LinkedIn',
    shareCopyLink: 'Salin Tautan',
    linkCopied: 'Tautan disalin!',
    comments: 'Komentar',
    writeComment: 'Tulis komentar atau tanggapan...',
    postComment: 'Kirim Komentar',
    backToPrompts: 'Kembali ke Prompt',
    backToSkills: 'Kembali ke Keahlian',
    backToVideos: 'Kembali ke Video',
    backToVideoPrompts: 'Kembali ke Prompt Video AI',
    backToBlog: 'Kembali ke Blog',
    primaryVideoPrompt: 'Prompt Video Utama',
    copiedPromptSuccess: 'Prompt berhasil disalin!',
    copiedShareLink: 'Tautan berita disalin!',
    copied: 'Tersalin!',
    copyFullPrompt: 'Salin Seluruh Prompt',
    motionIntensity: 'Intensitas Gerakan Video',
    motionHint: '1 = Gerakan lambat halus • 10 = Aksi sinematik cepat',
    cameraMovement: 'Gerakan Kamera',
    supportedGenerators: 'Mesin Video AI yang Didukung',
    shotDetails: 'Spesifikasi Pengambilan Gambar',
    resolution: 'Resolusi',
    saved: 'Tersimpan',
    save: 'Simpan',
    allModels: 'Semua Model',
    searchVideoPromptsPlaceholder: 'Cari prompt video...',
    noVideoPromptsFound: 'Tidak ada prompt video ditemukan',
    noVideoPromptsFoundDesc: 'Coba sesuaikan kata kunci pencarian atau ubah filter model.',
    relatedContent: 'Konten Terkait',
    loading: 'Memuat...',
    noResultsFound: 'Hasil tidak ditemukan',
    noResultsDesc: 'Coba sesuaikan kata kunci pencarian Anda atau atur ulang filter yang dipilih.',
    resetFilters: 'Atur Ulang Filter',
    filterAll: 'Semua',
    filterCategory: 'Kategori',
    filterModel: 'Model',
    filterDifficulty: 'Tingkat Kesulitan',
    sortBy: 'Urutkan berdasarkan',
    sortLikes: 'Paling Disukai',
    sortViews: 'Paling Banyak Dilihat',
    sortDownloads: 'Paling Banyak Diunduh',
    sortDate: 'Terbaru',

    // Difficulty Levels
    beginner: 'Pemula',
    intermediate: 'Menengah',
    expert: 'Ahli',

    // Details Specs
    model: 'Model AI',
    style: 'Gaya Artistik',
    camera: 'Kamera & Lensa',
    lighting: 'Gaya Pencahayaan',
    aspectRatio: 'Rasio Aspek',
    seed: 'Nilai Seed',
    negativePrompt: 'Prompt Negatif',
    parameters: 'Parameter yang Disarankan',
    hook: 'Hook Viral',
    niche: 'Niche',
    rpmEstimate: 'Estimasi RPM',
    competition: 'Tingkat Persaingan',
    viralityScore: 'Skor Viralitas',
    channelBlueprint: 'Strategi Kanal',
    videoStructure: 'Struktur Video yang Disarankan',
    voicePrompt: 'Prompt Pengisi Suara',
    editingPrompt: 'Instruksi Pengeditan Video',
    thumbnailPrompt: 'Prompt Thumbnail',
    animationPrompt: 'Prompt Animasi',
    monetization: 'Monetisasi & Konversi',
    affiliateIdeas: 'Ide Pemasaran Afiliasi',
    resources: 'Sumber Daya & Alat Terlampir',
    supportedAi: 'Sistem AI yang Didukung',
    installation: 'Petunjuk Instalasi',
    howToUse: 'Cara Penggunaan yang Efektif',
    readTime: 'Waktu baca',
    publishedOn: 'Diterbitkan pada',
    byAuthor: 'Oleh',

    // Newsletter
    newsletterTitle: 'Bergabunglah dengan 25.000+ Kreator AI',
    newsletterDesc: 'Dapatkan blueprint prompt eksklusif setiap minggu, template .cursorrules baru, dan rahasia video viral langsung di kotak masuk Anda.',
    newsletterInputPlaceholder: 'Masukkan alamat email Anda...',
    subscribeButton: 'Berlangganan Gratis',
    subscribeSuccess: 'Berhasil berlangganan! Silakan periksa kotak masuk Anda.',
    newsletterPrivacy: 'Kami sangat menghormati privasi Anda. Berhenti berlangganan kapan saja dengan satu klik.',

    // Footer
    footerTagline: 'Pusat kreator AI terdepan. Mengubah pustaka prompt menjadi ekosistem terpadu: menghubungkan prompt gambar beresolusi tinggi, keahlian pengembang, dan blueprint video viral.',
    footerDirectories: 'DIREKTORI UTAMA',
    footerPopularNiches: 'NICHE POPULER',
    footerCreatorPerks: 'KEUNTUNGAN KREATOR',
    footerStayUpdated: 'TETAP TERUPDATE',
    footerNewsletterDesc: 'Blueprint prompt terbaru dikirim ke email Anda.',
    footerCopyright: 'Promptat Online — Hak cipta dilindungi.',
    footerPrivacy: 'Kebijakan Privasi',
    footerTerms: 'Syarat & Ketentuan',
    footerSitemap: 'Peta Situs',
    footerRss: 'Feed RSS',

    // Banner & Switcher
    translationAvailable: 'Halaman ini tersedia dalam',
    translationAvailableIn: 'Halaman ini juga tersedia dalam',
    switchTo: 'Beralih ke',
    switchToLanguage: 'Beralih ke',
    dismiss: 'Tutup',
    languageSwitcher: 'Bahasa',

    // Auth & Modals
    loginTitle: 'Masuk ke Akun Anda',
    loginSubtitle: 'Simpan blueprint favorit Anda dan kirimkan prompt Anda sendiri',
    emailLabel: 'Alamat Email',
    passwordLabel: 'Kata Sandi',
    continueGoogle: 'Lanjutkan dengan Google',
    continueGithub: 'Lanjutkan dengan GitHub',
    myCollectionTitle: 'Koleksi Tersimpan Saya',
    emptyCollectionDesc: 'Belum ada item tersimpan. Klik ikon simpan pada kartu mana pun untuk menambahkannya di sini.',
    accountSettingsTitle: 'Pengaturan Akun',
    accountSettings: 'Pengaturan Akun',

    // Admin
    adminTitle: 'Konsol Manajemen Admin',
    internationalSeoTitle: 'SEO Internasional & Validasi Hreflang',
    translationManagerTitle: 'Manajer Penerjemahan & Konten Multibahasa',
    statusPublished: 'Dipublikasikan',
    statusDraft: 'Draf',
    statusMissing: 'Hilang',
    statusReviewed: 'Ditinjau',
  }
};

/**
 * Strict Translation function:
 * Direct dictionary lookup for the requested target language.
 * Never defaults to Arabic or another language when another locale is active.
 * Falls back to explicit fallback parameter, or English dictionary as last resort.
 */
export function t(key: string, lang: LanguageCode, fallback?: string): string {
  // 1. Strict dictionary lookup for the requested target language
  const targetDict = UI_DICTIONARY[lang];
  if (targetDict && targetDict[key]) {
    return targetDict[key];
  }

  // 2. Explicit fallback if provided by the component
  if (fallback !== undefined) {
    return fallback;
  }

  // 3. Unified neutral English fallback as last resort (never cross-contaminate with Arabic or another random language)
  if (UI_DICTIONARY.en && UI_DICTIONARY.en[key]) {
    return UI_DICTIONARY.en[key];
  }

  return key;
}

// Multilingual Category Translations
export const CATEGORY_TRANSLATIONS: Record<string, Record<LanguageCode, string>> = {
  'architecture': { ar: 'العمارة والتصميم', en: 'Architecture', es: 'Arquitectura', fr: 'Architecture', id: 'Arsitektur' },
  'fantasy': { ar: 'الفانتازيا والخيال', en: 'Fantasy', es: 'Fantasía', fr: 'Fantaisie', id: 'Fantasi' },
  'animals': { ar: 'الحيوانات والطبيعة', en: 'Animals', es: 'Animales', fr: 'Animaux', id: 'Hewan' },
  'vehicles': { ar: 'المركبات والسيارات', en: 'Vehicles', es: 'Vehículos', fr: 'Véhicules', id: 'Kendaraan' },
  'luxury': { ar: 'الفخامة والأناقة', en: 'Luxury', es: 'Lujo', fr: 'Luxe', id: 'Kemewahan' },
  'travel': { ar: 'السفر والرحلات', en: 'Travel', es: 'Viajes', fr: 'Voyages', id: 'Wisata' },
  'nature': { ar: 'الطبيعة والمناظر', en: 'Nature', es: 'Naturaleza', fr: 'Nature', id: 'Alam' },
  'products': { ar: 'المنتجات والإعلانات', en: 'Products', es: 'Productos', fr: 'Produits', id: 'Produk' },
  'food': { ar: 'المأكولات والمطاعم', en: 'Food', es: 'Comida', fr: 'Nourriture', id: 'Makanan' },
  'portrait': { ar: 'البورتريه والأشخاص', en: 'Portrait', es: 'Retrato', fr: 'Portrait', id: 'Potret' },
  'logo': { ar: 'الشعارات والهويات', en: 'Logo', es: 'Logotipos', fr: 'Logos', id: 'Logo' },
  'icons': { ar: 'الأيقونات والرموز', en: 'Icons', es: 'Iconos', fr: 'Icônes', id: 'Ikon' },
  'thumbnails': { ar: 'الصور المصغرة', en: 'Thumbnails', es: 'Miniaturas', fr: 'Miniatures', id: 'Thumbnail' },
  'ui-design': { ar: 'تصميم الواجهات UI', en: 'UI Design', es: 'Diseño UI', fr: 'Design UI', id: 'Desain UI' },
  'characters': { ar: 'الشخصيات والرسوم', en: 'Characters', es: 'Personajes', fr: 'Personnages', id: 'Karakter' },
  'anime': { ar: 'الأنمي والمانغا', en: 'Anime', es: 'Anime', fr: 'Anime', id: 'Anime' },
  '3d-models': { ar: 'ثلاثي الأبعاد 3D', en: '3D', es: '3D y Renders', fr: '3D & Rendu', id: '3D & Render' },
  'photography': { ar: 'التصوير الفوتوغرافي', en: 'Photography', es: 'Fotografía', fr: 'Photographie', id: 'Fotografi' },
  'cinematic': { ar: 'المشاهد السينمائية', en: 'Cinematic', es: 'Cinematográfico', fr: 'Cinématographique', id: 'Sinematik' },
  'advertising': { ar: 'الإعلانات التجارية', en: 'Advertising', es: 'Publicidad', fr: 'Publicité', id: 'Periklanan' },
  'developer-tools': { ar: 'أدوات المطورين', en: 'Developer Tools', es: 'Herramientas Dev', fr: 'Outils Dév', id: 'Alat Pengembang' },
  'marketing': { ar: 'التسويق الرقمي', en: 'Marketing', es: 'Marketing', fr: 'Marketing', id: 'Pemasaran' },
  'writing': { ar: 'الكتابة والمحتوى', en: 'Writing', es: 'Redacción', fr: 'Rédaction', id: 'Penulisan' },
  'coding': { ar: 'البرمجة والأكواد', en: 'Coding', es: 'Programación', fr: 'Programmation', id: 'Pemrograman' },
  'seo': { ar: 'تحسين السيو SEO', en: 'SEO', es: 'Estrategia SEO', fr: 'Optimisation SEO', id: 'Strategi SEO' },
  'automation': { ar: 'الأتمتة والسكربتات', en: 'Automation', es: 'Automatización', fr: 'Automatisation', id: 'Otomasi' },
  'agents': { ar: 'وكلاء الذكاء الاصطناعي', en: 'Agents', es: 'Agentes IA', fr: 'Agents IA', id: 'Agen AI' },
  'business': { ar: 'الأعمال والشركات', en: 'Business', es: 'Negocios', fr: 'Business & Affaires', id: 'Bisnis' },
  'ecommerce': { ar: 'التجارة الإلكترونية', en: 'Ecommerce', es: 'Comercio Electrónico', fr: 'E-commerce', id: 'E-commerce' },
  'database': { ar: 'قواعد البيانات', en: 'Database', es: 'Bases de Datos', fr: 'Bases de Données', id: 'Basis Data' },
  'react': { ar: 'رياكت والواجهات', en: 'React', es: 'React y Frontend', fr: 'React & Frontend', id: 'React & Frontend' },
  'python': { ar: 'بايثون والذكاء الاصطناعي', en: 'Python', es: 'Python e IA', fr: 'Python & IA', id: 'Python & AI' },
  'youtube': { ar: 'مخططات يوتيوب', en: 'YouTube Blueprints', es: 'Guías de YouTube', fr: 'Guides YouTube', id: 'Panduan YouTube' },
  'tiktok': { ar: 'تريندات تيك توك', en: 'TikTok Trends', es: 'Tendencias TikTok', fr: 'Tendances TikTok', id: 'Tren TikTok' },
  'faceless': { ar: 'قنوات بدون وجه', en: 'Faceless Channels', es: 'Canales Sin Rostro', fr: 'Chaînes Sans Visage', id: 'Saluran Tanpa Wajah' },
  'educational': { ar: 'المحتوى التعليمي', en: 'Educational', es: 'Educativo', fr: 'Éducatif', id: 'Edukasi' },
  'entertainment': { ar: 'الترفيه والقصص', en: 'Entertainment', es: 'Entretenimiento', fr: 'Divertissement', id: 'Hiburan' },
  'finance-tech': { ar: 'المال والتقنية', en: 'Finance & Tech', es: 'Finanzas y Tecnología', fr: 'Finance & Tech', id: 'Keuangan & Teknologi' },
  'prompt-engineering': { ar: 'هندسة الأوامر', en: 'Prompt Engineering', es: 'Ingeniería de Prompts', fr: 'Ingénierie de Prompts', id: 'Rekayasa Prompt' },
  'ai-tools': { ar: 'أدوات الذكاء الاصطناعي', en: 'AI Tools', es: 'Herramientas IA', fr: 'Outils IA', id: 'Alat AI' },
  'seo-strategy': { ar: 'استراتيجيات السيو', en: 'SEO Strategy', es: 'Estrategia SEO', fr: 'Stratégie SEO', id: 'Strategi SEO' },
  'tutorials': { ar: 'شروحات تطبيقية', en: 'Tutorials', es: 'Tutoriales', fr: 'Tutoriels', id: 'Tutorial' },
  'ai-news': { ar: 'أخبار الذكاء الاصطناعي', en: 'AI News', es: 'Noticias de IA', fr: 'Actualités IA', id: 'Berita AI' }
};

export function getLocalizedCategoryTitle(slugOrId: string, lang: LanguageCode): string {
  // Normalize slug
  const cleanSlug = slugOrId.replace(/^[psvb]-/, '').toLowerCase();
  const directMatch = CATEGORY_TRANSLATIONS[cleanSlug] || CATEGORY_TRANSLATIONS[slugOrId];
  if (directMatch && directMatch[lang]) {
    return directMatch[lang];
  }
  return slugOrId;
}

// Multilingual Content Titles and Descriptions for Prompts, Skills, Videos, Blogs
export const LOCALIZED_CONTENT: Record<string, Partial<Record<LanguageCode, { title: string; description: string }>>> = {
  // Prompts
  'p-1': {
    ar: { title: 'فيلا فاخرة بتصميم طبيعي متكامل (Biophilic)', description: 'تصيير معماري فائق الواقعية لفيلا معاصرة مدمجة مع الطبيعة الاستوائية، الشلالات، وإطلالات بانورامية على المحيط.' },
    en: { title: 'Biophilic Luxury Modern Villa', description: 'A breathtaking architectural rendering of a multi-level luxury villa integrated with lush nature, waterfalls, and cliffside ocean views.' },
    es: { title: 'Villa Moderna de Lujo Biofílica', description: 'Impresionante renderizado arquitectónico de una villa de lujo integrada con la naturaleza tropical, cascadas y vistas al océano.' },
    fr: { title: 'Villa Moderne de Luxe Biophilique', description: 'Rendu architectural époustouflant d\'une villa contemporaine intégrée à la nature tropicale, cascades et vue sur l\'océan.' },
    id: { title: 'Vila Mewah Modern Biofilik', description: 'Rendering arsitektur spektakuler vila mewah bertingkat yang menyatu dengan alam tropis, air terjun, dan pemandangan laut tebing.' }
  },
  'p-2': {
    ar: { title: 'كشك طعام شوارع نيون سايبربانك', description: 'كشك طعام مستقبلي شديد التفاصيل في طوكيو الجديدة الممطرة عام 2099، مفعم بأضواء النيون والإعلانات المجسمة والبخار.' },
    en: { title: 'Cyberpunk Neon Street Food Stall', description: 'A highly detailed futuristic street food stall in a rainy Neo-Tokyo, packed with neon lights, holographic advertisements, and steam rising from broth.' },
    es: { title: 'Puesto de Comida Callejera Cyberpunk Neón', description: 'Puesto de comida callejera futurista hiperdetallado en un Neo-Tokyo lluvioso, lleno de luces de neón y hologramas.' },
    fr: { title: 'Stand de Street Food Cyberpunk Néon', description: 'Stand de cuisine de rue futuriste ultra-détaillé dans un Néo-Tokyo pluvieux, baigné de néons et d\'hologrammes.' },
    id: { title: 'Kios Makanan Jalanan Cyberpunk Neon', description: 'Kios makanan jalanan futuristik yang sangat detail di Neo-Tokyo yang hujan, dipenuhi lampu neon dan iklan hologram.' }
  },
  'p-3': {
    ar: { title: 'سفينة شراعية أسطورية سحرية في بحر الضباب', description: 'لوحة خيالية ملحمية لسفينة خشبية عتيقة تبحر عبر مياه متوهجة بضياء حيوي محاطة بضباب سحري وأبراج بلورية.' },
    en: { title: 'Mythic Astral Galleon in Sea of Mist', description: 'An epic high-fantasy digital painting of an ancient wooden vessel sailing through bioluminescent waters surrounded by ethereal mist.' },
    es: { title: 'Galeón Astral Mítico en Mar de Niebla', description: 'Pintura digital épica de fantasía de un galeón antiguo navegando por aguas bioluminiscentes rodeado de niebla mística.' },
    fr: { title: 'Galion Astral Mythique dans la Mer de Brume', description: 'Peinture numérique de haute fantaisie représentant un galion ancien naviguant sur des eaux bioluminescentes.' },
    id: { title: 'Galeon Astral Mitos di Lautan Kabut', description: 'Lukisan digital fantasi epik kapal kayu kuno yang berlayar melintasi perairan bercahaya dikelilingi kabut magis.' }
  },
  // Skills
  's-1': {
    ar: { title: 'قواعد كرسور المتقدمة React 19 + Supabase', description: 'حزمة التعليمات الشاملة (.cursorrules) لتوجيه وكلاء الذكاء الاصطناعي لبناء تطبيقات آمنة وسريعة باستخدام React 19 وSupabase وTailwind.' },
    en: { title: 'Extreme Full-Stack React + Supabase Cursorrules', description: 'The ultimate instruction set (.cursorrules) to guide AI agents in building secure, clean React 19, TypeScript, Tailwind CSS v4, and Supabase apps.' },
    es: { title: 'Cursorrules Full-Stack Extremo React + Supabase', description: 'Conjunto definitivo de instrucciones (.cursorrules) para guiar agentes de IA en la creación de apps seguras con React 19 y Supabase.' },
    fr: { title: 'Cursorrules Full-Stack Extrême React + Supabase', description: 'Le jeu d\'instructions ultime (.cursorrules) pour guider les agents IA dans la création d\'applications React 19 et Supabase robustes.' },
    id: { title: 'Cursorrules Full-Stack Ekstrem React + Supabase', description: 'Kumpulan instruksi lengkap (.cursorrules) untuk memandu agen AI membangun aplikasi React 19 dan Supabase yang aman dan cepat.' }
  },
  's-2': {
    ar: { title: 'مولد مقالات السيو متجاوز كواشف الذكاء الاصطناعي 100%', description: 'مهارة أوامر متقدمة متعددة المراحل لكلود وجيميني للبحث والصياغة والتحسين لتصدر نتائج البحث وجلب آلاف الزيارات.' },
    en: { title: '100% SEO-Optimized Article Generator', description: 'An advanced multi-stage prompting skill for Claude and Gemini to outline, research, write, and optimize articles that easily bypass AI detectors and rank #1.' },
    es: { title: 'Generador de Artículos 100% Optimizado para SEO', description: 'Habilidad avanzada de prompts multietapa para Claude y Gemini para investigar, redactar y posicionar artículos #1 en Google.' },
    fr: { title: 'Générateur d\'Articles 100% Optimisé SEO', description: 'Compétence de prompting avancée en plusieurs étapes pour Claude et Gemini afin de rédiger des articles qui se classent #1.' },
    id: { title: 'Generator Artikel 100% Teroptimasi SEO', description: 'Keahlian prompt multi-tahap canggih untuk Claude dan Gemini untuk meriset, menulis, dan mengoptimalkan artikel hingga peringkat #1.' }
  },
  // Videos
  'v-1': {
    ar: { title: 'قناة وثائقيات تاريخية مظلمة بدون وجه', description: 'مخطط إنتاج متكامل لقناة يوتيوب تحقق أكثر من 12 دولار لكل ألف مشاهدة حول أسرار التاريخ والحضارات القديمة.' },
    en: { title: 'Dark History Documentary Faceless Channel', description: 'Complete automated channel production system generating $12+ RPM covering forgotten civilizations, historical mysteries, and royal conspiracies.' },
    es: { title: 'Canal Sin Rostro de Documentales de Historia Oscura', description: 'Sistema completo de canal automatizado con $12+ RPM cubriendo misterios históricos, civilizaciones perdidas y conspiraciones.' },
    fr: { title: 'Chaîne Documentaire Histoire Sombre Sans Visage', description: 'Système complet de chaîne automatisée générant 12$+ de RPM traitant des mystères historiques et civilisations oubliées.' },
    id: { title: 'Saluran Dokumenter Sejarah Kelam Tanpa Wajah', description: 'Sistem produksi kanal otomatis lengkap yang menghasilkan RPM $12+ membahas misteri sejarah dan peradaban yang hilang.' }
  },
  'v-2': {
    ar: { title: 'فيديوهات قصيرة لغرائب الحيوانات والخوارق الطبيعية', description: 'صيغة فيروسية سريعة لفيديوهات تيك توك وريلز ويوتيوب شورتس تحقق ملايين المشاهدات مع نصوص هوك جاهزة.' },
    en: { title: 'Bizarre Animal Facts High-Retention Shorts', description: 'Viral short-form formula for TikTok, Reels, and Shorts designed for 85%+ retention rate with audio hooks and pacing scripts.' },
    es: { title: 'Shorts de Datos Curiosos de Animales de Alta Retención', description: 'Fórmula viral para TikTok, Reels y Shorts con retención superior al 85% con ganchos auditivos y ritmo dinámico.' },
    fr: { title: 'Shorts de Faits Insolites sur les Animaux à Forte Rétention', description: 'Formule virale pour TikTok, Reels et Shorts avec un taux de rétention de 85%+ et scripts dynamiques.' },
    id: { title: 'Shorts Fakta Hewan Aneh dengan Retensi Tinggi', description: 'Formula video pendek viral untuk TikTok, Reels, dan Shorts dengan tingkat retensi 85%+ dan naskah hook instan.' }
  },
  // Blogs
  'b-1': {
    ar: { title: 'الدليل الشامل لهندسة الأوامر في 2026: كيف تبني أنظمة ذكاء متطورة', description: 'استكشف الاستراتيجيات الحقيقية لتوجيه نماذج الذكاء الاصطناعي، واستخدام تقنيات التفكير العميق والتسلسل المنطقي.' },
    en: { title: 'The Complete Prompt Engineering Playbook: Building Production AI Workflows', description: 'Master actionable strategies for prompt architecture, chain-of-thought orchestration, and agentic workflows in production environments.' },
    es: { title: 'Guía Completa de Ingeniería de Prompts: Construyendo Flujos de IA Profesionales', description: 'Domina estrategias prácticas de arquitectura de prompts, orquestación de pensamiento y flujos de trabajo con agentes.' },
    fr: { title: 'Le Playbook Complet d\'Ingénierie de Prompts : Créer des Systèmes IA Efficaces', description: 'Maîtrisez les stratégies concrètes d\'architecture de prompts et d\'orchestration d\'agents en environnement de production.' },
    id: { title: 'Buku Panduan Lengkap Rekayasa Prompt: Membangun Alur Kerja AI Produksi', description: 'Kuasai strategi praktis untuk arsitektur prompt, orkestrasi pemikiran bertingkat, dan agen AI di lingkungan produksi.' }
  },
  'p-4': {
    ar: { title: 'جلسة تصوير كلاسيكية لسيارة رياضية إيطالية', description: 'جماليات مجلات السبعينيات مع سيارة فيراري حمراء تسير على طريق ساحل أمالفي الإيطالي الخلاب.' },
    en: { title: 'Vintage Editorial Sports Car Shoot', description: '1970s magazine aesthetic featuring a sleek red retro sports car speeding through a scenic Italian coastal highway.' },
    es: { title: 'Sesión Editorial Vintage de Coche Deportivo', description: 'Estética de revista de los años 70 con un deportivo retro rojo circulando por la costa de Amalfi.' },
    fr: { title: 'Shooting Éditorial Vintage Voiture de Sport', description: 'Esthétique magazine des années 70 avec une voiture de sport rouge sur la côte amalfitaine.' },
    id: { title: 'Pemotretan Editorial Mobil Sport Klasik', description: 'Estetika majalah 1970-an menampilkan mobil sport retro merah melaju di pesisir Amalfi Italia.' }
  },
  'p-5': {
    ar: { title: 'قرية منازل الأشجار الإلفية السحرية', description: 'مظلة ساحرة من منازل الشجر المنسوجة في أشجار الخشب الأحمر العملاقة المتوهجة بضياء حيوي ذهبي.' },
    en: { title: 'Mystical Elven Treehouse Village', description: 'A magical canopy of treehouse dwellings woven into massive ancient redwood trees, shining with golden bioluminescence.' },
    es: { title: 'Pueblo Élfico Místico en Casas de Árbol', description: 'Un dosel mágico de casas en árboles gigantes de secuoyas milenarias con bioluminiscencia dorada.' },
    fr: { title: 'Village Féerique Élfique dans les Arbres', description: 'Canopée magique de cabanes nichées dans d\'immenses séquoias anciens scintillants de bioluminescence.' },
    id: { title: 'Desa Rumah Pohon Elf Mistik', description: 'Kanopi magis rumah pohon yang dijalin ke dalam pohon redwood kuno raksasa dengan bioluminesensi keemasan.' }
  },
  'p-6': {
    ar: { title: 'تصوير إعلاني لمنتجات تجميل طبيعية مينيماليست', description: 'أسلوب إعلاني تجاري راقٍ يعرض عبوات العناية بالبشرة غير اللامعة على أحجار الترافرتين الطبيعية والرمال.' },
    en: { title: 'Minimalist Matte Cosmetics Product Shot', description: 'High-end commercial advertisement style showcasing organic skincare bottles on natural beige stones.' },
    es: { title: 'Fotografía Minimalista de Cosméticos Mate', description: 'Estilo publicitario comercial de alta gama con envases cosméticos sobre piedras naturales beige.' },
    fr: { title: 'Photo Produit Cosmétique Mat Minimaliste', description: 'Photographie publicitaire haut de gamme mettant en valeur des flacons de cosmétiques sur pierre beige.' },
    id: { title: 'Foto Produk Kosmetik Matte Minimalis', description: 'Gaya fotografi iklan komersial kelas atas menampilkan botol perawatan kulit organik di atas batu travertine alami.' }
  },
  'p-7': {
    ar: { title: 'أشكال هندسية ثلاثية الأبعاد سريالية بألوان الباستيل', description: 'أشكال مجردة ثلاثية الأبعاد متدفقة مع تدرجات لونية ناعمة وخامات قزحية فائقة النقاء للواجهات والخلفيات.' },
    en: { title: 'Surreal Pastel Abstract 3D Shapes', description: 'Dynamic flowing 3D geometric shapes with soft gradients and iridescent materials, perfect for wallpapers and UI headers.' },
    es: { title: 'Formas 3D Abstractas y Surrealistas en Tonos Pastel', description: 'Formas geométricas 3D fluidas con degradados suaves y texturas iridiscentes para fondos y UI.' },
    fr: { title: 'Formes 3D Abstraites Surréalistes aux Tons Pastel', description: 'Formes géométriques 3D fluides avec dégradés doux et matériaux irisés parfaits pour fonds d\'écran.' },
    id: { title: 'Bentuk 3D Abstrak Surealis Warna Pastel', description: 'Bentuk geometris 3D dinamis yang mengalir dengan gradien lembut dan material warna-warni.' }
  },
  'p-8': {
    ar: { title: 'تصوير مقرب لبيتزا نابولية طازجة من الفرن', description: 'لقطة ماكرو شهية لبيتزا العجين المخمر مع جبنة الموزاريلا الذائبة وصلصة الطماطم وأوراق الريحان الطازجة.' },
    en: { title: 'Authentic Sourdough Pizza Close-Up', description: 'A steaming hot, fresh gourmet Neapolitan pizza on a rustic wooden board with melting mozzarella and fresh basil leaves.' },
    es: { title: 'Primer Plano de Auténtica Pizza Napolitana', description: 'Pizza napolitana gourmet recién horneada sobre tabla de madera con mozzarella fundida y albahaca.' },
    fr: { title: 'Gros Plan sur une Authentique Pizza Napolitaine', description: 'Pizza napolitaine gourmande fumante sur planche en bois rustique avec mozzarella fondante et basilic.' },
    id: { title: 'Close-Up Pizza Sourdough Neapolitan Otentik', description: 'Pizza Neapolitan gourmet panas mengepul di atas papan kayu pedesaan dengan lelehan keju mozzarella dan daun kemangi segar.' }
  },
  's-3': {
    ar: { title: 'سير عمل البرمجة الذاتية عبر وكيل AntiGravity', description: 'بروتوكول تفويض المهام متعدد الحلقات لتوجيه وكلاء الذكاء الاصطناعي لكتابة واختبار وتصحيح الكود ذاتياً.' },
    en: { title: 'AntiGravity Autonomous Coding Workflow', description: 'Multi-agent self-correcting blueprint enabling autonomous feature generation, test writing, and bug fixing.' },
    es: { title: 'Flujo de Programación Autónoma con AntiGravity', description: 'Protocolo de agentes autónomos para generar código, escribir pruebas y corregir errores automáticamente.' },
    fr: { title: 'Workflow de Codage Autonome AntiGravity', description: 'Protocole multi-agents auto-correcteur permettant la génération autonome de code et la résolution de bugs.' },
    id: { title: 'Alur Kerja Pemrograman Otonom AntiGravity', description: 'Cetak biru multi-agen yang mengoreksi diri untuk pembuatan fitur mandiri, pengujian kode, dan perbaikan bug.' }
  },
  's-4': {
    ar: { title: 'محرك البحث العميق واستخراج المعرفة الأكاديمية', description: 'مهارة أوامر متقدمة لتحليل مئات المصادر وتلخيص الأوراق العلمية وصياغة تقارير استراتيجية شاملة.' },
    en: { title: 'Deep Research & Knowledge Extraction Engine', description: 'Advanced multi-model prompting skill to synthesize complex research papers, extract data, and compile executive briefs.' },
    es: { title: 'Motor de Investigación Profunda y Extracción de Conocimiento', description: 'Habilidad de prompts para sintetizar investigaciones complejas, extraer datos y redactar informes ejecutivos.' },
    fr: { title: 'Moteur de Recherche Approfondie et Synthèse', description: 'Compétence de prompting avancée pour synthétiser des articles de recherche et compiler des synthèses exécutives.' },
    id: { title: 'Mesin Riset Mendalam & Ekstraksi Pengetahuan', description: 'Keahlian prompt tingkat lanjut untuk mensintesis dokumen riset kompleks dan menyusun laporan eksekutif.' }
  },
  'v-3': {
    ar: { title: 'سلسلة المسافر عبر الزمن والألغاز التاريخية', description: 'صيغة سينمائية لفيديوهات يوتيوب شورتس تستعرض أحداثاً غامضة من الماضي بصور Runway وMidjourney.' },
    en: { title: 'AI Time Traveler Historical Mysteries', description: 'High-RPM storytelling blueprint using Runway Gen-3 and Midjourney to create immersive first-person time travel videos.' },
    es: { title: 'Misterios Históricos del Viajero del Tiempo con IA', description: 'Guía de video de alta retención usando Runway y Midjourney para narrar misterios del pasado en primera persona.' },
    fr: { title: 'Mystères Historiques du Voyageur Temporel IA', description: 'Blueprint de narration immersif utilisant Runway Gen-3 et Midjourney pour explorer des énigmes historiques.' },
    id: { title: 'Misteri Sejarah Penjelajah Waktu AI', description: 'Cetak biru video berpendapatan tinggi menggunakan Runway Gen-3 dan Midjourney untuk membuat video perjalanan waktu yang imersif.' }
  },
  'v-4': {
    ar: { title: 'مشاريع المليارديرات العملاقة واليخوت الفاخرة', description: 'مخطط فيديو فيروسي عالي الأرباح يستهدف جمهور المال والأعمال بمرئيات مذهلة ونصوص مشوقة.' },
    en: { title: 'Luxury Billionaire Megaprojects & Superyachts', description: 'High-ticket viral finance and luxury blueprint exploring conceptual yachts and futuristic architectural megaprojects.' },
    es: { title: 'Megaproyectos de Lujo de Multimillonarios y Superyates', description: 'Guía viral para nicho de alto RPM sobre yates conceptuales y arquitectura futurista de hiperlujo.' },
    fr: { title: 'Mégaprojets et Superyachts des Milliardaires', description: 'Blueprint viral à fort RPM explorant les yachts d\'exception et les mégaprojets architecturaux futuristes.' },
    id: { title: 'Megaproyek Mewah Miliarder & Kapal Pesiar Super', description: 'Cetak biru video viral niche kemewahan dengan RPM tinggi membahas kapal pesiar dan megaproyek arsitektur futuristik.' }
  },
  'b-2': {
    ar: { title: 'كيف تبني وتخصص ملفات .cursorrules للبرمجة الذكية', description: 'توقف عن تكرار تفضيلاتك البرمجية. تعلم كيف تصيغ ملف تعليمات يجعل Cursor وWindsurf يكتبان كوداً مثالياً.' },
    en: { title: 'How to Build and Optimize Custom .cursorrules for AI Assisted Coding', description: 'Stop explaining your coding preferences repeatedly. Learn how to draft a powerful system instruction file that makes Cursor and Windsurf code flawlessly.' },
    es: { title: 'Cómo Crear y Optimizar Archivos .cursorrules para Programar con IA', description: 'Aprende a redactar un archivo de instrucciones de sistema para que Cursor y Windsurf generen código limpio y seguro.' },
    fr: { title: 'Comment Créer et Optimiser des Fichiers .cursorrules pour Coder avec l\'IA', description: 'Apprenez à rédiger un fichier d\'instructions système puissant pour que Cursor et Windsurf codent à la perfection.' },
    id: { title: 'Cara Membuat dan Mengoptimalkan File .cursorrules untuk Coding dengan AI', description: 'Pelajari cara menyusun berkas instruksi sistem yang kuat agar Cursor dan Windsurf dapat menulis kode tanpa cela.' }
  },
  'b-3': {
    ar: { title: 'احتراف Runway Gen-3: التحكم بحركة الكاميرا وفيزياء المشاهد', description: 'دليل عملي لفهم أوامر التحريك وزوايا التصوير لتوليد مقاطع فيديو سينمائية بدون تشوهات بصرية.' },
    en: { title: 'Mastering Runway Gen-3 Alpha: Cinematic Camera Controls and Motion Physics', description: 'A hands-on breakdown of prompt structures, camera angles, and motion physics for defect-free generative video.' },
    es: { title: 'Dominando Runway Gen-3 Alpha: Controles de Cámara y Física de Movimiento', description: 'Guía práctica para entender la estructura de prompts de video, movimientos de cámara y física visual.' },
    fr: { title: 'Maîtriser Runway Gen-3 Alpha : Contrôles de Caméra et Physique du Mouvement', description: 'Guide pratique pour maîtriser les angles de caméra, le mouvement et la génération vidéo sans défaut.' },
    id: { title: 'Menguasai Runway Gen-3 Alpha: Kontrol Kamera Sinematik & Fisika Gerak', description: 'Panduan praktis struktur prompt video, sudut kamera, dan fisika gerakan untuk hasil video bebas cacat.' }
  },
  'b-4': {
    ar: { title: 'السيو البرمجي بالذكاء الاصطناعي: من الصفر إلى 100 ألف زائر شهرياً', description: 'استراتيجيات بناء صفحات هبوط ديناميكية وتوليد محتوى عالي القيمة متوافق مع خوارزميات محركات البحث.' },
    en: { title: 'Programmatic SEO with AI: Scaling from Zero to 100k Monthly Visitors', description: 'Actionable strategies for building dynamic landing page engines, structured data feeds, and search-ranking content at scale.' },
    es: { title: 'SEO Programático con IA: Escalando de Cero a 100k Visitas Mensuales', description: 'Estrategias prácticas para construir páginas de aterrizaje dinámicas y contenido de alto valor posicionado en Google.' },
    fr: { title: 'SEO Programmatique avec l\'IA : Passer de 0 à 100k Visiteurs Mensuels', description: 'Stratégies concrètes pour créer des moteurs de pages d\'atterrissage dynamiques et se positionner sur Google.' },
    id: { title: 'SEO Terprogram dengan AI: Meningkatkan Skala dari Nol ke 100rb Pengunjung Bulanan', description: 'Strategi praktis membangun halaman arahan dinamis dan konten berkualitas tinggi yang menduduki peringkat atas mesin pencari.' }
  }
};

export function getLocalizedItem<T extends { id: string; title: string; description?: string }>(item: T, lang: LanguageCode): T {
  if (!item) return item;
  const anyItem = item as any;

  // 1. Dynamic DB fields matching current locale (e.g. title_en, title_ar, title_es, title_id, title_fr)
  const dbTitle = anyItem[`title_${lang}`];
  const dbDesc = anyItem[`description_${lang}`] ?? anyItem[`desc_${lang}`];
  if (dbTitle) {
    return {
      ...item,
      title: dbTitle,
      description: dbDesc !== undefined ? dbDesc : item.description
    };
  }

  // 2. Dynamic JSON translations object from Supabase (e.g. item.translations.es)
  if (anyItem.translations && anyItem.translations[lang]) {
    const tLoc = anyItem.translations[lang];
    return {
      ...item,
      title: tLoc.title || item.title,
      description: tLoc.description !== undefined ? tLoc.description : item.description
    };
  }

  // 3. Static LOCALIZED_CONTENT map for current locale
  const translations = LOCALIZED_CONTENT[item.id];
  if (translations && translations[lang]) {
    const loc = translations[lang]!;
    return {
      ...item,
      title: loc.title || item.title,
      description: loc.description !== undefined ? loc.description : item.description
    };
  }

  // 4. Fallback to English (if item has English localized content) to prevent raw default DB language leaks
  if (lang !== 'en' && translations && translations.en) {
    const loc = translations.en!;
    return {
      ...item,
      title: loc.title || item.title,
      description: loc.description !== undefined ? loc.description : item.description
    };
  }

  return item;
}

// Hreflang Validator Tool Types & Logic
export interface HreflangIssue {
  id: string;
  type: 'missing_return_link' | 'canonical_mismatch' | 'noindex_target' | 'invalid_lang_code' | 'redirect_target';
  severity: 'error' | 'warning';
  pageUrl: string;
  targetUrl: string;
  description: string;
}

export function validateHreflangs(pages: Array<{
  url: string;
  lang: LanguageCode;
  canonicalUrl: string;
  hreflangs: HreflangEntry[];
  isIndexable: boolean;
}>): HreflangIssue[] {
  const issues: HreflangIssue[] = [];

  pages.forEach(page => {
    // 1. Canonical check (must point to self)
    if (page.canonicalUrl !== page.url) {
      issues.push({
        id: `canonical-${page.url}`,
        type: 'canonical_mismatch',
        severity: 'error',
        pageUrl: page.url,
        targetUrl: page.canonicalUrl,
        description: `Canonical URL (${page.canonicalUrl}) does not match page URL (${page.url}). Each language version must point to itself.`
      });
    }

    // 2. Language code format check
    page.hreflangs.forEach(entry => {
      if (entry.lang !== 'x-default' && !SUPPORTED_LANGUAGES[entry.lang as LanguageCode]) {
        issues.push({
          id: `langcode-${page.url}-${entry.lang}`,
          type: 'invalid_lang_code',
          severity: 'error',
          pageUrl: page.url,
          targetUrl: entry.url,
          description: `Invalid ISO language code '${entry.lang}'. Expected 'ar', 'en', 'es', 'fr', or 'id'.`
        });
      }

      // 3. Check reciprocal return links
      if (entry.lang !== 'x-default') {
        const targetPage = pages.find(p => p.url === entry.url);
        if (targetPage) {
          const hasReturnLink = targetPage.hreflangs.some(h => h.url === page.url);
          if (!hasReturnLink) {
            issues.push({
              id: `return-${page.url}-${entry.url}`,
              type: 'missing_return_link',
              severity: 'error',
              pageUrl: page.url,
              targetUrl: entry.url,
              description: `Missing reciprocal return link from target page (${entry.url}) back to original page (${page.url}).`
            });
          }

          if (!targetPage.isIndexable) {
            issues.push({
              id: `noindex-${page.url}-${entry.url}`,
              type: 'noindex_target',
              severity: 'warning',
              pageUrl: page.url,
              targetUrl: entry.url,
              description: `Hreflang targets page with noindex header (${entry.url}). Search engines skip noindex targets.`
            });
          }
        }
      }
    });
  });

  return issues;
}

export { useI18n } from '../hooks/useI18n';
export { useActiveLanguage } from '../hooks/useActiveLanguage';
export { useCanonicalSync } from '../hooks/useCanonicalSync';


