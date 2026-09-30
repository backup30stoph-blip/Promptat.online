import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PromptCard } from './cards/PromptCard';
import { SkillCard } from './cards/SkillCard';
import { VideoCard } from './cards/VideoCard';
import { BlogCard } from './cards/BlogCard';
import { Sparkles, Cpu, Film, BookOpen } from 'lucide-react';

interface RelatedContentProps {
  type: 'prompt' | 'skill' | 'video' | 'blog';
  currentId: string;
  categoryId?: string;
  model?: string;
  niche?: string;
  tags?: string[];
  category?: string;
}

// Helper to extract keywords/tags from title and description for automatic tag-based matching
const extractTags = (title: string, description: string): string[] => {
  const text = `${title} ${description}`.toLowerCase();
  const words = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’]/g, "").split(/\s+/);
  const stopwords = new Set([
    'the', 'and', 'for', 'with', 'your', 'this', 'that', 'from', 'about', 'how', 'to', 'in', 'on', 'at', 'an', 'a', 'of', 'or', 'is', 'are', 'was', 'be', 'by', 'you', 'can', 'with', 'more', 'best', 'free'
  ]);
  return Array.from(new Set(words.filter(w => w.length > 3 && !stopwords.has(w))));
};

export const RelatedContent: React.FC<RelatedContentProps> = ({
  type,
  currentId,
  categoryId,
  model,
  niche,
  tags,
  category,
}) => {
  const { prompts, skills, videos, blogs } = useApp();

  const relatedItems = useMemo(() => {
    switch (type) {
      case 'prompt': {
        const currentItem = prompts.find(p => p.id === currentId);
        const currentTags = extractTags(currentItem?.title || '', currentItem?.description || '');
        
        return prompts
          .filter((p) => p.id !== currentId)
          .map((p) => {
            let score = 0;
            if (categoryId && p.category_id === categoryId) score += 3;
            if (model && p.model === model) score += 2;
            
            // Calculate automatic tag match overlap
            const itemTags = extractTags(p.title, p.description);
            const matches = itemTags.filter(t => currentTags.includes(t)).length;
            score += matches * 1.5; // weight tag overlap
            
            return { item: p, score };
          })
          .filter((x) => x.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
          .map((x) => x.item);
      }
      case 'skill': {
        const currentItem = skills.find(s => s.id === currentId);
        const currentTags = extractTags(currentItem?.title || '', currentItem?.description || '');

        return skills
          .filter((s) => s.id !== currentId)
          .map((s) => {
            let score = 0;
            if (categoryId && s.category_id === categoryId) score += 3;
            
            // Calculate automatic tag match overlap
            const itemTags = extractTags(s.title, s.description);
            const matches = itemTags.filter(t => currentTags.includes(t)).length;
            score += matches * 1.5;

            return { item: s, score };
          })
          .filter((x) => x.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
          .map((x) => x.item);
      }
      case 'video': {
        const currentItem = videos.find(v => v.id === currentId);
        const videoTags = tags || currentItem?.tags || extractTags(currentItem?.title || '', currentItem?.description || '');

        return videos
          .filter((v) => v.id !== currentId)
          .map((v) => {
            let score = 0;
            if (niche && v.niche === niche) score += 3;
            
            // Match with video's specific tags or extracted tags
            const itemTags = v.tags || extractTags(v.title, v.description);
            const matches = itemTags.filter((t) => videoTags.includes(t)).length;
            score += matches * 2; // high weight for actual tags
            
            return { item: v, score };
          })
          .filter((x) => x.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 2) // Video cards are large, 2 are perfect for layout
          .map((x) => x.item);
      }
      case 'blog': {
        const currentItem = blogs.find(b => b.id === currentId);
        const currentTags = extractTags(currentItem?.title || '', currentItem?.excerpt || '');

        return blogs
          .filter((b) => b.id !== currentId)
          .map((b) => {
            let score = 0;
            if (category && b.category === category) score += 3;
            
            // Calculate automatic tag match overlap
            const itemTags = extractTags(b.title, b.excerpt || b.content || '');
            const matches = itemTags.filter(t => currentTags.includes(t)).length;
            score += matches * 1.5;

            return { item: b, score };
          })
          .filter((x) => x.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
          .map((x) => x.item);
      }
      default:
        return [];
    }
  }, [type, currentId, categoryId, model, niche, tags, category, prompts, skills, videos, blogs]);

  if (relatedItems.length === 0) return null;

  const getSectionTitle = () => {
    switch (type) {
      case 'prompt':
        return 'Related Prompt Blueprints';
      case 'skill':
        return 'Related Developer Skills';
      case 'video':
        return 'Related Video Architectures';
      case 'blog':
        return 'Related Creator Articles';
    }
  };

  const getSectionIcon = () => {
    switch (type) {
      case 'prompt':
        return <Sparkles className="h-5 w-5 text-amber-500" />;
      case 'skill':
        return <Cpu className="h-5 w-5 text-indigo-500" />;
      case 'video':
        return <Film className="h-5 w-5 text-red-500" />;
      case 'blog':
        return <BookOpen className="h-5 w-5 text-emerald-500" />;
    }
  };

  return (
    <div className="mt-16 pt-12 border-t border-slate-100 space-y-6">
      <div className="flex items-center space-x-2">
        {getSectionIcon()}
        <h3 className="font-display text-lg font-black text-slate-900 tracking-tight">
          {getSectionTitle()}
        </h3>
      </div>

      <div className={`grid grid-cols-1 gap-6 sm:grid-cols-2 ${type === 'video' ? 'lg:grid-cols-2' : 'lg:grid-cols-3'}`}>
        {relatedItems.map((item) => {
          if (type === 'prompt') return <PromptCard key={item.id} prompt={item as any} />;
          if (type === 'skill') return <SkillCard key={item.id} skill={item as any} />;
          if (type === 'video') return <VideoCard key={item.id} video={item as any} />;
          if (type === 'blog') return <BlogCard key={item.id} article={item as any} />;
          return null;
        })}
      </div>
    </div>
  );
};
