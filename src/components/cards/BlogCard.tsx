import React from 'react';
import { BlogArticle } from '../../types';
import { useApp } from '../../context/AppContext';
import { getLocalizedItem, getLocalizedCategoryTitle } from '../../lib/i18n';
import { Eye, Heart, BookOpen, Calendar } from 'lucide-react';
import { calculateReadingTime } from '../../lib/readingTime';
import { ImageWithPlaceholder } from '../ImageWithPlaceholder';
import { FavoriteButton } from '../FavoriteButton';

interface BlogCardProps {
  article: BlogArticle;
}

export const BlogCard: React.FC<BlogCardProps> = ({ article }) => {
  const { user, navigateTo, currentLang } = useApp();

  const localizedArticle = getLocalizedItem(article, currentLang);

  const formattedDate = new Date(article.published_at).toLocaleDateString(
    currentLang === 'ar' ? 'ar-EG' : currentLang === 'es' ? 'es-ES' : currentLang === 'fr' ? 'fr-FR' : currentLang === 'id' ? 'id-ID' : 'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }
  );

  return (
    <div 
      onClick={() => navigateTo('blog', { type: 'blog', slug: article.slug })}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-red-200 hover:shadow-md cursor-pointer"
      id={`blog-card-${article.id}`}
    >
      {/* Cover Image */}
      <div className="relative aspect-video overflow-hidden bg-slate-50">
        <ImageWithPlaceholder
          src={article.cover || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'}
          alt={localizedArticle.title}
          aspectRatio="aspect-video"
          imgClassName="transition-transform duration-500 group-hover:scale-103"
        />
        
        {/* Category Overlay */}
        <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 z-10">
          <span className="inline-flex items-center rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#e21833] shadow-sm">
            {getLocalizedCategoryTitle(article.category, currentLang)}
          </span>
        </div>

        {/* Favorite Button Overlay */}
        <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3 z-10 opacity-0 transition-opacity group-hover:opacity-100 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-white">
          <FavoriteButton
            itemType="blog"
            itemId={article.id}
            userId={user?.id}
          />
        </div>
      </div>


      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        
        {/* Metadata Row */}
        <div className="flex items-center space-x-2.5 rtl:space-x-reverse text-[10px] text-slate-400 mb-2.5 font-bold uppercase tracking-wider">
          <span className="flex items-center">
            <Calendar className="mr-1 rtl:mr-0 rtl:ml-1 h-3.5 w-3.5 text-slate-400" />
            {formattedDate}
          </span>
          <span>•</span>
          <span className="flex items-center">
            <BookOpen className="mr-1 rtl:mr-0 rtl:ml-1 h-3.5 w-3.5 text-slate-400" />
            {calculateReadingTime(article.content)}
          </span>
        </div>

        <h3 className="font-sans text-sm font-bold text-slate-900 transition-colors group-hover:text-[#e21833] line-clamp-2">
          {localizedArticle.title}
        </h3>
        
        <p className="mt-1.5 line-clamp-3 flex-1 text-xs text-slate-500 leading-relaxed">
          {localizedArticle.description || article.excerpt}
        </p>

        {/* Author Details & Stats Row */}
        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="flex items-center space-x-2.5">
            <img 
              src={article.author.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'} 
              alt={article.author.name}
              referrerPolicy="no-referrer"
              className="h-7 w-7 rounded-full object-cover border border-slate-100"
            />
            <div>
              <p className="text-[11px] font-bold text-slate-800 leading-none">
                {article.author.name}
              </p>
              <p className="text-[9px] font-semibold text-slate-400 mt-0.5 leading-none">
                {article.author.role}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-[11px] text-slate-400 font-semibold">
            <span className="flex items-center space-x-1">
              <Eye className="h-3.5 w-3.5" />
              <span>{article.views}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Heart className="h-3.5 w-3.5" />
              <span>{article.likes}</span>
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
