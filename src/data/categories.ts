import { Category } from '../types';

export const CATEGORIES: Category[] = [
  // --- PROMPT CATEGORIES ---
  { id: 'p-arch', title: 'Architecture', slug: 'architecture', icon: 'Home', color: 'indigo', type: 'Prompt' },
  { id: 'p-fant', title: 'Fantasy', slug: 'fantasy', icon: 'Sparkles', color: 'purple', type: 'Prompt' },
  { id: 'p-anim', title: 'Animals', slug: 'animals', icon: 'PawPrint', color: 'emerald', type: 'Prompt' },
  { id: 'p-veh', title: 'Vehicles', slug: 'vehicles', icon: 'Car', color: 'cyan', type: 'Prompt' },
  { id: 'p-lux', title: 'Luxury', slug: 'luxury', icon: 'Crown', color: 'amber', type: 'Prompt' },
  { id: 'p-trav', title: 'Travel', slug: 'travel', icon: 'Compass', color: 'teal', type: 'Prompt' },
  { id: 'p-nat', title: 'Nature', slug: 'nature', icon: 'Trees', color: 'green', type: 'Prompt' },
  { id: 'p-prod', title: 'Products', slug: 'products', icon: 'ShoppingBag', color: 'rose', type: 'Prompt' },
  { id: 'p-food', title: 'Food', slug: 'food', icon: 'Utensils', color: 'red', type: 'Prompt' },
  { id: 'p-port', title: 'Portrait', slug: 'portrait', icon: 'User', color: 'blue', type: 'Prompt' },
  { id: 'p-logo', title: 'Logo', slug: 'logo', icon: 'Target', color: 'violet', type: 'Prompt' },
  { id: 'p-icon', title: 'Icons', slug: 'icons', icon: 'Grid', color: 'pink', type: 'Prompt' },
  { id: 'p-thum', title: 'Thumbnails', slug: 'thumbnails', icon: 'Image', color: 'red', type: 'Prompt' },
  { id: 'p-ui', title: 'UI Design', slug: 'ui-design', icon: 'Smartphone', color: 'fuchsia', type: 'Prompt' },
  { id: 'p-char', title: 'Characters', slug: 'characters', icon: 'UserCheck', color: 'sky', type: 'Prompt' },
  { id: 'p-anim-c', title: 'Anime', slug: 'anime', icon: 'Gamepad2', color: 'rose', type: 'Prompt' },
  { id: 'p-3d', title: '3D', slug: '3d-models', icon: 'Layers', color: 'indigo', type: 'Prompt' },
  { id: 'p-phot', title: 'Photography', slug: 'photography', icon: 'Camera', color: 'zinc', type: 'Prompt' },
  { id: 'p-cine', title: 'Cinematic', slug: 'cinematic', icon: 'Clapperboard', color: 'neutral', type: 'Prompt' },
  { id: 'p-adv', title: 'Advertising', slug: 'advertising', icon: 'Megaphone', color: 'blue', type: 'Prompt' },
  { id: 'p-dev', title: 'Developer Tools', slug: 'developer-tools', icon: 'Code', color: 'emerald', type: 'Prompt' },
  { id: 'p-mkt-p', title: 'Marketing', slug: 'marketing', icon: 'TrendingUp', color: 'purple', type: 'Prompt' },
  { id: 'p-wri-p', title: 'Writing', slug: 'writing', icon: 'PenTool', color: 'blue', type: 'Prompt' },

  // --- SKILL CATEGORIES ---
  { id: 's-cod', title: 'Coding', slug: 'coding', icon: 'Code', color: 'emerald', type: 'Skill' },
  { id: 's-seo', title: 'SEO', slug: 'seo', icon: 'Search', color: 'teal', type: 'Skill' },
  { id: 's-wri', title: 'Writing', slug: 'writing', icon: 'PenTool', color: 'blue', type: 'Skill' },
  { id: 's-mkt', title: 'Marketing', slug: 'marketing', icon: 'TrendingUp', color: 'purple', type: 'Skill' },
  { id: 's-vid', title: 'Video', slug: 'video', icon: 'Video', color: 'rose', type: 'Skill' },
  { id: 's-img', title: 'Image', slug: 'image', icon: 'Image', color: 'red', type: 'Skill' },
  { id: 's-aut', title: 'Automation', slug: 'automation', icon: 'Cpu', color: 'cyan', type: 'Skill' },
  { id: 's-age', title: 'Agents', slug: 'agents', icon: 'Bot', color: 'indigo', type: 'Skill' },
  { id: 's-bus', title: 'Business', slug: 'business', icon: 'Briefcase', color: 'amber', type: 'Skill' },
  { id: 's-eco', title: 'Ecommerce', slug: 'ecommerce', icon: 'ShoppingBag', color: 'red', type: 'Skill' },
  { id: 's-db', title: 'Database', slug: 'database', icon: 'Database', color: 'fuchsia', type: 'Skill' },
  { id: 's-rea', title: 'React', slug: 'react', icon: 'Atom', color: 'sky', type: 'Skill' },
  { id: 's-pyt', title: 'Python', slug: 'python', icon: 'FileCode', color: 'yellow', type: 'Skill' },

  // --- VIDEO CATEGORIES ---
  { id: 'v-yt', title: 'YouTube Blueprints', slug: 'youtube', icon: 'Youtube', color: 'red', type: 'Video' },
  { id: 'v-tt', title: 'TikTok Trends', slug: 'tiktok', icon: 'Music', color: 'zinc', type: 'Video' },
  { id: 'v-fl', title: 'Faceless Channels', slug: 'faceless', icon: 'Ghost', color: 'purple', type: 'Video' },
  { id: 'v-edu', title: 'Educational', slug: 'educational', icon: 'BookOpen', color: 'teal', type: 'Video' },
  { id: 'v-ent', title: 'Entertainment', slug: 'entertainment', icon: 'Smile', color: 'amber', type: 'Video' },
  { id: 'v-fin', title: 'Finance & Tech', slug: 'finance-tech', icon: 'DollarSign', color: 'emerald', type: 'Video' },

  // --- BLOG CATEGORIES ---
  { id: 'b-pe', title: 'Prompt Engineering', slug: 'prompt-engineering', icon: 'Zap', color: 'purple', type: 'Blog' },
  { id: 'b-tools', title: 'AI Tools', slug: 'ai-tools', icon: 'Laptop', color: 'blue', type: 'Blog' },
  { id: 'b-seo', title: 'SEO Strategy', slug: 'seo-strategy', icon: 'LineChart', color: 'teal', type: 'Blog' },
  { id: 'b-tuts', title: 'Tutorials', slug: 'tutorials', icon: 'GraduationCap', color: 'red', type: 'Blog' },
  { id: 'b-news', title: 'AI News', slug: 'ai-news', icon: 'Newspaper', color: 'emerald', type: 'Blog' }
];

export const getColorClasses = (color: string) => {
  const map: Record<string, { bg: string, text: string, border: string }> = {
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
    cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-100' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
    teal: { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-100' },
    green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' },
    orange: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
    violet: { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-100' },
    pink: { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-100' },
    red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100' },
    fuchsia: { bg: 'bg-fuchsia-50', text: 'text-fuchsia-600', border: 'border-fuchsia-100' },
    sky: { bg: 'bg-sky-50', text: 'text-sky-600', border: 'border-sky-100' },
    yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-100' },
    zinc: { bg: 'bg-zinc-100', text: 'text-zinc-700', border: 'border-zinc-200' },
    neutral: { bg: 'bg-neutral-100', text: 'text-neutral-700', border: 'border-neutral-200' }
  };
  return map[color] || { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-100' };
};
