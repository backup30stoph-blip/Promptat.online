import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Code, Video, BookOpen, Compass, Settings, User, FileSignature, 
  Image as ImageIcon, RefreshCw, ExternalLink, ShieldCheck, Menu, X, Globe, Languages,
  ChevronLeft, ChevronRight, Eye, EyeOff
} from 'lucide-react';
import { useActiveLanguage } from '../../hooks/useActiveLanguage';

export type AdminTab = 'prompts' | 'categories' | 'skills' | 'videos' | 'blogs' | 'pages' | 'media' | 'seo' | 'profile' | 'translations' | 'intl-seo';

interface AdminLayoutProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onSync: () => void;
  onExit: () => void;
  adminName: string;
  adminRole: string;
  syncLoading?: boolean;
  children: React.ReactNode;
}

const ADMIN_TRANSLATIONS = {
  ar: {
    console: 'لوحة الإدارة',
    management: 'الإدارة',
    sync: 'مزامنة البيانات',
    exit: 'العودة للموقع',
    secure: 'Secure Corridor',
    panel: 'لوحة التحكم بالنظام',
    logged_as: 'تم تسجيل الدخول بصفتك:',
    customize_menu: 'تخصيص القائمة',
    // Menu items
    prompts: 'أوامر الصور',
    categories: 'التصنيفات',
    skills: 'المهارات والسكربتات',
    videos: 'أوامر الفيديو AI',
    blogs: 'المدونات والمقالات',
    pages: 'الصفحات الثابتة',
    media: 'مدير الوسائط والصور',
    translations: 'مصفوفة الترجمة',
    intlSeo: 'السيو الدولي',
    seo: 'سيو الموقع العام',
    profile: 'ملفي الشخصي'
  },
  en: {
    console: 'Admin Console',
    management: 'Management',
    sync: 'Sync Database',
    exit: 'Exit Panel',
    secure: 'Secure Corridor',
    panel: 'System Manager Panel',
    logged_as: 'Logged in as:',
    customize_menu: 'Customize Menu',
    // Menu items
    prompts: 'Image Prompts',
    categories: 'Categories / Tax',
    skills: 'Creator Skills',
    videos: 'AI Video Prompts',
    blogs: 'Blog Playbooks',
    pages: 'Static Core Pages',
    media: 'Media Manager',
    translations: 'Translation Matrix',
    intlSeo: 'International SEO',
    seo: 'Global Site SEO',
    profile: 'My Admin Profile'
  },
  es: {
    console: 'Consola de Admin',
    management: 'Gestión',
    sync: 'Sincronizar Base',
    exit: 'Salir del Panel',
    secure: 'Pasillo Seguro',
    panel: 'Panel del Administrador',
    logged_as: 'Sesión iniciada como:',
    customize_menu: 'Personalizar Menú',
    // Menu items
    prompts: 'Prompts de Imágenes',
    categories: 'Categorías / Tax',
    skills: 'Habilidades Creador',
    videos: 'Prompts de Video IA',
    blogs: 'Guías de Blog',
    pages: 'Páginas Estáticas',
    media: 'Gestor de Medios',
    translations: 'Matriz de Traducción',
    intlSeo: 'SEO Internacional',
    seo: 'SEO Global del Sitio',
    profile: 'Mi Perfil de Admin'
  },
  fr: {
    console: 'Console Admin',
    management: 'Gestion',
    sync: 'Synchroniser Base',
    exit: 'Quitter le Panel',
    secure: 'Couloir Sécurisé',
    panel: 'Panneau de Gestion',
    logged_as: 'Connecté en tant que :',
    customize_menu: 'Personnaliser le Menu',
    // Menu items
    prompts: 'Prompts Images',
    categories: 'Catégories / Tax',
    skills: 'Compétences Créateur',
    videos: 'Prompts Vidéo IA',
    blogs: 'Guides de Blog',
    pages: 'Pages Statiques',
    media: 'Gestionnaire Médias',
    translations: 'Matrice de Traduction',
    intlSeo: 'SEO International',
    seo: 'SEO Global du Site',
    profile: 'Mon Profil Admin'
  },
  id: {
    console: 'Konsol Admin',
    management: 'Manajemen',
    sync: 'Sinkronisasi Basis Data',
    exit: 'Keluar Panel',
    secure: 'Koridor Aman',
    panel: 'Panel Pengelola Sistem',
    logged_as: 'Masuk sebagai:',
    customize_menu: 'Sesuaikan Menu',
    // Menu items
    prompts: 'Prompt Gambar',
    categories: 'Kategori / Tax',
    skills: 'Keahlian Kreator',
    videos: 'Prompt Video AI',
    blogs: 'Panduan Blog',
    pages: 'Halaman Statis',
    media: 'Pengelola Media',
    translations: 'Matriks Penerjemahan',
    intlSeo: 'SEO Internasional',
    seo: 'SEO Situs Global',
    profile: 'Profil Admin Saya'
  }
};

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  activeTab,
  onTabChange,
  onSync,
  onExit,
  adminName,
  adminRole,
  syncLoading = false,
  children
}) => {
  const [isLargeScreen, setIsLargeScreen] = useState(typeof window !== 'undefined' ? window.innerWidth > 840 : true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(isLargeScreen);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('promptat_admin_sidebar_collapsed');
      return saved === 'true';
    }
    return false;
  });

  const [visibleTabs, setVisibleTabs] = useState<Record<AdminTab, boolean>>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('promptat_admin_visible_tabs');
        if (saved) return JSON.parse(saved);
      }
    } catch {}
    return {
      prompts: true,
      categories: true,
      skills: true,
      videos: true,
      blogs: true,
      pages: true,
      media: true,
      translations: true,
      'intl-seo': true,
      seo: true,
      profile: true
    };
  });

  const [showCustomizer, setShowCustomizer] = useState(false);

  const lang = useActiveLanguage();
  const tAdmin = ADMIN_TRANSLATIONS[lang] || ADMIN_TRANSLATIONS.en;
  const isRtl = lang === 'ar';

  useEffect(() => {
    localStorage.setItem('promptat_admin_sidebar_collapsed', isCollapsed ? 'true' : 'false');
  }, [isCollapsed]);

  useEffect(() => {
    localStorage.setItem('promptat_admin_visible_tabs', JSON.stringify(visibleTabs));
  }, [visibleTabs]);

  useEffect(() => {
    const handleResize = () => {
      const large = window.innerWidth > 840;
      setIsLargeScreen(large);
      if (large) {
        setIsDrawerOpen(true);
      } else {
        setIsDrawerOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleTabClick = (id: AdminTab) => {
    onTabChange(id);
    if (!isLargeScreen) {
      setIsDrawerOpen(false);
    }
  };

  const menuItems = [
    { id: 'prompts' as AdminTab, title: tAdmin.prompts, icon: Sparkles, color: 'text-slate-500', bg: 'hover:bg-slate-100/60' },
    { id: 'categories' as AdminTab, title: tAdmin.categories, icon: Compass, color: 'text-slate-500', bg: 'hover:bg-slate-100/60' },
    { id: 'skills' as AdminTab, title: tAdmin.skills, icon: Code, color: 'text-slate-500', bg: 'hover:bg-slate-100/60' },
    { id: 'videos' as AdminTab, title: tAdmin.videos, icon: Video, color: 'text-slate-500', bg: 'hover:bg-slate-100/60' },
    { id: 'blogs' as AdminTab, title: tAdmin.blogs, icon: BookOpen, color: 'text-slate-500', bg: 'hover:bg-slate-100/60' },
    { id: 'pages' as AdminTab, title: tAdmin.pages, icon: FileSignature, color: 'text-slate-500', bg: 'hover:bg-slate-100/60' },
    { id: 'media' as AdminTab, title: tAdmin.media, icon: ImageIcon, color: 'text-slate-500', bg: 'hover:bg-slate-100/60' },
    { id: 'translations' as AdminTab, title: tAdmin.translations, icon: Languages, color: 'text-slate-500', bg: 'hover:bg-slate-100/60' },
    { id: 'intl-seo' as AdminTab, title: tAdmin.intlSeo, icon: Globe, color: 'text-slate-500', bg: 'hover:bg-slate-100/60' },
    { id: 'seo' as AdminTab, title: tAdmin.seo, icon: Settings, color: 'text-slate-500', bg: 'hover:bg-slate-100/60' },
    { id: 'profile' as AdminTab, title: tAdmin.profile, icon: User, color: 'text-slate-500', bg: 'hover:bg-slate-100/60' }
  ];

  const spacingClass = isRtl ? 'ml-2' : 'mr-2';

  return (
    <div className="flex w-full h-full min-h-screen bg-[#fafafa]">
      
      {/* SCRIM BACKDROP (For Modal Mode) */}
      <div 
        id="md-scrim" 
        className={`fixed inset-0 bg-black/32 z-40 transition-opacity duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${!isLargeScreen && isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsDrawerOpen(false)}
        aria-hidden={!(!isLargeScreen && isDrawerOpen)}
      ></div>

      {/* NAVIGATION DRAWER CONTAINER */}
      <aside 
        id="admin-drawer" 
        role="navigation" 
        aria-label="Admin Dashboard Navigation"
        dir={isRtl ? "rtl" : "ltr"}
        className={`
          flex flex-col shrink-0 p-3
          transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]
          ${isLargeScreen 
            ? `${isCollapsed ? 'w-[78px]' : 'w-[280px]'} h-screen bg-[#F7F2FA] ${isRtl ? 'border-l' : 'border-r'} border-[#CAC4D0] sticky top-0` 
            : `fixed top-0 ${isRtl ? 'right-0' : 'left-0'} z-50 w-[300px] h-screen bg-[#ECE6F0] ${isRtl ? 'rounded-l-2xl' : 'rounded-r-2xl'} shadow-lg`
          }
          ${!isLargeScreen && !isDrawerOpen ? (isRtl ? 'translate-x-[100%]' : 'translate-x-[-100%]') : 'translate-x-0'}
        `}
      >
        {/* Header */}
        {isCollapsed && isLargeScreen ? (
          <div className="flex flex-col items-center gap-4 p-2 py-4 border-b border-[#CAC4D0]/30 shrink-0">
            <ShieldCheck className="h-6 w-6 text-emerald-600 shrink-0" />
            <button 
              onClick={() => setIsCollapsed(false)} 
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#49454F] transition-all cursor-pointer shrink-0 shadow-xs"
              title={isRtl ? "توسيع القائمة" : "Expand Menu"}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-4 border-b border-[#CAC4D0]/30 shrink-0 select-none">
            <ShieldCheck className="h-6 w-6 text-emerald-600 shrink-0" />
            <h1 className={`text-[#1D192B] text-sm font-black truncate flex-1 tracking-tight ${isRtl ? 'text-right' : 'text-left'}`}>{tAdmin.console}</h1>
            {isLargeScreen ? (
              <button 
                onClick={() => setIsCollapsed(true)} 
                className="p-1.5 rounded-lg hover:bg-black/5 text-[#49454F] transition-colors cursor-pointer shrink-0"
                title={isRtl ? "تصغير القائمة" : "Collapse Menu"}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            ) : (
              <button onClick={() => setIsDrawerOpen(false)} className={`${isRtl ? 'mr-auto' : 'ml-auto'} text-[#49454F] hover:text-[#1D192B]`}>
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        {/* Scrollable Nav Section */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-[2px] mt-3">
          {menuItems
            .filter(item => visibleTabs[item.id] !== false)
            .map(item => {
              const Icon = item.icon;
              const isTabActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`flex items-center h-[48px] rounded-xl font-semibold transition-all duration-150 w-full ${
                    isCollapsed && isLargeScreen ? 'justify-center px-0' : 'px-4'
                  } ${
                    isTabActive
                      ? 'bg-[#E8DEF8] text-[#1D192B]'
                      : `text-slate-600 font-medium ${item.bg}`
                  }`}
                  title={item.title}
                >
                  <Icon className={`h-5 w-5 ${isCollapsed && isLargeScreen ? '' : spacingClass} ${isTabActive ? 'text-[#1D192B]' : item.color} shrink-0`} />
                  {(!isCollapsed || !isLargeScreen) && (
                    <span className={`flex-1 whitespace-nowrap overflow-hidden text-ellipsis ${isRtl ? 'text-right' : 'text-left'} text-xs`}>{item.title}</span>
                  )}
                </button>
              );
            })}

          {(!isCollapsed || !isLargeScreen) ? (
            <>
              <div className="h-[1px] bg-[#CAC4D0]/60 my-2 mx-4 shrink-0"></div>
              <div className={`px-4 pt-1 pb-1 text-[10px] font-black uppercase tracking-wider text-[#49454F] ${isRtl ? 'text-right' : 'text-left'}`}>{tAdmin.management}</div>
            </>
          ) : (
            <div className="h-[1px] bg-[#CAC4D0]/60 my-3 mx-2 shrink-0"></div>
          )}

          <button
            onClick={onSync}
            disabled={syncLoading}
            className={`flex items-center h-[48px] rounded-xl font-medium text-slate-600 hover:bg-black/5 active:bg-black/10 transition-all duration-150 w-full ${
              isCollapsed && isLargeScreen ? 'justify-center px-0' : 'px-4'
            } disabled:opacity-50`}
            title={tAdmin.sync}
          >
            <RefreshCw className={`h-5 w-5 ${isCollapsed && isLargeScreen ? '' : spacingClass} text-slate-600 shrink-0 ${syncLoading ? 'animate-spin' : ''}`} />
            {(!isCollapsed || !isLargeScreen) && (
              <span className={`flex-1 whitespace-nowrap overflow-hidden text-ellipsis ${isRtl ? 'text-right' : 'text-left'} text-xs`}>{tAdmin.sync}</span>
            )}
          </button>
          
          <button
            onClick={onExit}
            className={`flex items-center h-[48px] rounded-xl font-medium text-slate-600 hover:bg-black/5 active:bg-black/10 transition-all duration-150 w-full ${
              isCollapsed && isLargeScreen ? 'justify-center px-0' : 'px-4'
            }`}
            title={tAdmin.exit}
          >
            <ExternalLink className={`h-5 w-5 ${isCollapsed && isLargeScreen ? '' : spacingClass} text-slate-600 shrink-0`} />
            {(!isCollapsed || !isLargeScreen) && (
              <span className={`flex-1 whitespace-nowrap overflow-hidden text-ellipsis ${isRtl ? 'text-right' : 'text-left'} text-xs`}>{tAdmin.exit}</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowCustomizer(!showCustomizer)}
            className={`flex items-center h-[48px] rounded-xl font-medium text-slate-600 hover:bg-black/5 active:bg-black/10 transition-all duration-150 w-full shrink-0 ${
              isCollapsed && isLargeScreen ? 'justify-center px-0' : 'px-4'
            }`}
            title={tAdmin.customize_menu || 'Customize Menu'}
          >
            <Settings className={`h-5 w-5 ${isCollapsed && isLargeScreen ? '' : spacingClass} text-slate-600 shrink-0 ${showCustomizer ? 'rotate-45' : ''} transition-transform`} />
            {(!isCollapsed || !isLargeScreen) && (
              <span className={`flex-1 whitespace-nowrap overflow-hidden text-ellipsis ${isRtl ? 'text-right' : 'text-left'} text-xs`}>{tAdmin.customize_menu || 'Customize Menu'}</span>
            )}
          </button>

          {showCustomizer && (!isCollapsed || !isLargeScreen) && (
            <div className="mx-2 my-1 p-3 bg-purple-50/70 rounded-xl border border-purple-100 space-y-2 animate-fade-in shrink-0">
              <p className={`text-[10px] font-bold text-purple-700 uppercase tracking-wider ${isRtl ? 'text-right' : 'text-left'}`}>
                {isRtl ? 'إظهار/إخفاء العناصر:' : 'Show/Hide Items:'}
              </p>
              <div className="grid grid-cols-1 gap-1 max-h-[160px] overflow-y-auto pr-1">
                {menuItems.map(item => (
                  <label key={item.id} className="flex items-center gap-2 cursor-pointer select-none py-0.5 hover:bg-black/5 rounded-md px-1 transition-colors">
                    <input 
                      type="checkbox"
                      checked={visibleTabs[item.id] !== false}
                      onChange={(e) => {
                        setVisibleTabs(prev => ({
                          ...prev,
                          [item.id]: e.target.checked
                        }));
                      }}
                      className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 h-3.5 w-3.5 cursor-pointer"
                    />
                    <span className={`text-[10px] font-semibold text-slate-700 truncate ${isRtl ? 'text-right' : 'text-left'}`}>{item.title}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto">
        
        {/* Top App Bar for mobile */}
        {!isLargeScreen && (
          <header className="sticky top-0 z-30 flex items-center h-16 px-4 bg-white border-b border-slate-200">
            <button onClick={() => setIsDrawerOpen(true)} className="p-2 -ml-2 text-slate-600 hover:text-slate-900" aria-expanded={isDrawerOpen}>
              <Menu className="h-6 w-6" />
            </button>
            <h2 className="ml-2 text-lg font-bold text-slate-900 truncate">{tAdmin.panel}</h2>
          </header>
        )}

        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full" dir={isRtl ? "rtl" : "ltr"}>
          {/* Top Admin Header Banner from old code (now adapted) */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-md bg-red-50 border border-red-100 px-2 py-1 text-[10px] font-bold text-red-700 uppercase tracking-wider">
                  <ShieldCheck className="h-3 w-3" /> {tAdmin.secure}
                </span>
                <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                  CMS Panel
                </span>
              </div>
              <h1 className="mt-2.5 font-display text-2xl font-black text-slate-900 leading-tight">
                {tAdmin.panel}
              </h1>
              <p className="mt-1 text-xs text-slate-500 font-medium">
                {tAdmin.logged_as} <span className="text-red-600 font-bold">{adminName}</span> ({adminRole})
              </p>
            </div>
            <div className="hidden md:flex flex-wrap gap-2">
              <button
                onClick={onSync}
                disabled={syncLoading}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-sm active:scale-98 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${syncLoading ? 'animate-spin' : ''}`} />
                <span>{tAdmin.sync}</span>
              </button>
              <button
                onClick={onExit}
                className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 cursor-pointer shadow-sm active:scale-98 transition-all"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>{tAdmin.exit}</span>
              </button>
            </div>
          </div>
          
          {/* Workspace */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 md:p-8 shadow-sm">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
