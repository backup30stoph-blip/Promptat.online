import React from 'react';
import { AISkill } from '../../types';
import { useApp } from '../../context/AppContext';
import { CATEGORIES, getColorClasses } from '../../data/categories';
import { getLocalizedCategoryTitle, getLocalizedItem } from '../../lib/i18n';
import { Download, Eye, Heart, FileCode2, ArrowUpRight } from 'lucide-react';
import { ImageWithPlaceholder } from '../ImageWithPlaceholder';

interface SkillCardProps {
  skill: AISkill;
}

export const SkillCard: React.FC<SkillCardProps> = ({ skill }) => {
  const { state, toggleLike, navigateTo, currentLang, t, isRtl } = useApp();

  const localizedSkill = getLocalizedItem(skill, currentLang);
  const category = CATEGORIES.find(c => c.id === skill.category_id);
  const colorSchema = category ? getColorClasses(category.color) : getColorClasses('orange');

  const isLiked = state.likes.skills.includes(skill.id);

  return (
    <div 
      onClick={() => navigateTo('skills', { type: 'skill', slug: skill.slug })}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-red-200 hover:shadow-md cursor-pointer"
      id={`skill-card-${skill.id}`}
    >
      
      {/* Cover Image */}
      <div className="relative aspect-video overflow-hidden bg-slate-50">
        <ImageWithPlaceholder
          src={skill.cover || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'}
          alt={localizedSkill.title}
          aspectRatio="aspect-video"
          imgClassName="transition-transform duration-500 group-hover:scale-103"
        />
        
        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 flex flex-wrap gap-1.5 z-10">
          {category && (
            <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm border ${colorSchema.bg} ${colorSchema.text} ${colorSchema.border}`}>
              {getLocalizedCategoryTitle(category.slug, currentLang)}
            </span>
          )}
          {skill.premium && (
            <span className="inline-flex items-center rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#e21833] shadow-sm">
              PRO
            </span>
          )}
        </div>

        {/* System Version overlay */}
        <div className="absolute bottom-3 right-3 rtl:right-auto rtl:left-3 z-10">
          <span className="rounded bg-slate-950/75 px-2 py-0.5 text-[10px] font-mono text-red-400 backdrop-blur-xs">
            {skill.version}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        
        {/* Support Logos (Text) */}
        <div className="flex flex-wrap gap-1 mb-2.5">
          {skill.supported_ai.slice(0, 3).map((ai, index) => (
            <span 
              key={index} 
              className="inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-600"
            >
              {ai}
            </span>
          ))}
          {skill.supported_ai.length > 3 && (
            <span className="inline-flex items-center rounded bg-slate-100 px-1 py-0.5 text-[9px] font-bold text-slate-500">
              +{skill.supported_ai.length - 3}
            </span>
          )}
        </div>

        <h3 className="font-sans text-sm font-bold text-slate-900 transition-colors group-hover:text-[#e21833] line-clamp-1">
          {localizedSkill.title}
        </h3>
        
        <p className="mt-1.5 line-clamp-2 flex-1 text-xs text-slate-500">
          {localizedSkill.description}
        </p>

        {/* Integration Spec list */}
        <div className="mt-4 flex items-center space-x-3 rtl:space-x-reverse rounded-lg border border-slate-100 p-2.5">
          <FileCode2 className="h-4 w-4 text-[#e21833] shrink-0" />
          <div className="flex-1 text-[10px] text-slate-500 font-medium">
            <span>{t('resources', 'Includes')}: </span>
            <span className="font-bold text-slate-700">Markdown, Config files</span>
          </div>
        </div>

        {/* Footer Metrics */}
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
          <div className="flex items-center space-x-3 rtl:space-x-reverse text-[11px] text-slate-400 font-semibold">
            <span className="flex items-center space-x-1 rtl:space-x-reverse">
              <Download className="h-3.5 w-3.5" />
              <span>{skill.downloads}</span>
            </span>
            <span className="flex items-center space-x-1 rtl:space-x-reverse">
              <Eye className="h-3.5 w-3.5" />
              <span>{skill.views}</span>
            </span>
          </div>

          <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLike('skills', skill.id);
              }}
              className={`flex h-7 w-7 items-center justify-center rounded-md border text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 ${
                isLiked ? 'border-rose-100 bg-rose-50 text-rose-500' : 'border-slate-200'
              }`}
            >
              <Heart className={`h-3.5 w-3.5 ${isLiked ? 'fill-rose-500' : ''}`} />
            </button>

            <button
              className="flex h-7 items-center space-x-1 rtl:space-x-reverse rounded-md bg-[#e21833] px-2.5 text-[11px] font-bold text-white transition-colors hover:bg-[#c21124] cursor-pointer"
            >
              <span>{t('viewDetails', 'Get Skill')}</span>
              <ArrowUpRight className={`h-3 w-3 ${isRtl ? 'rotate-[-90deg]' : ''}`} />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
