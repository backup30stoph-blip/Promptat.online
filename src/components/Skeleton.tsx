import React from 'react';

interface SkeletonProps {
  variant?: 'card' | 'blog-card' | 'text' | 'image' | 'skill-card';
  className?: string;
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ variant = 'text', className = '', count = 1 }) => {
  const renderSkeletonItem = (index: number) => {
    switch (variant) {
      case 'card': // Prompts / Videos Card style
        return (
          <div key={index} className="animate-pulse rounded-2xl border border-slate-200/80 bg-white p-4 space-y-4 shadow-sm">
            {/* Image block */}
            <div className="aspect-[4/3] w-full rounded-xl bg-slate-200" />
            <div className="space-y-2">
              {/* Category tag */}
              <div className="h-3 w-16 rounded bg-slate-200" />
              {/* Title */}
              <div className="h-5 w-5/6 rounded bg-slate-200" />
              {/* Description line 1 */}
              <div className="h-3.5 w-full rounded bg-slate-200" />
              {/* Description line 2 */}
              <div className="h-3.5 w-2/3 rounded bg-slate-200" />
            </div>
            {/* Footer row */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <div className="h-4 w-12 rounded bg-slate-200" />
              <div className="flex space-x-2">
                <div className="h-4 w-8 rounded bg-slate-200" />
                <div className="h-4 w-8 rounded bg-slate-200" />
              </div>
            </div>
          </div>
        );
      case 'skill-card': // Skills Card style
        return (
          <div key={index} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-5 w-20 rounded bg-slate-200" />
                <div className="h-5 w-12 rounded bg-slate-200" />
              </div>
              <div className="h-5 w-4/5 rounded bg-slate-200" />
              <div className="h-3.5 w-full rounded bg-slate-200" />
              <div className="h-3.5 w-2/3 rounded bg-slate-200" />
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
              <div className="h-4 w-16 rounded bg-slate-200" />
              <div className="h-4 w-20 rounded bg-slate-200" />
            </div>
          </div>
        );
      case 'blog-card': // Vertical BlogCard style
        return (
          <div key={index} className="animate-pulse rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
            {/* Top image block */}
            <div className="w-full aspect-video bg-slate-200 shrink-0" />
            {/* Content block */}
            <div className="flex-1 p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-16 rounded bg-slate-200" />
                  <div className="h-3 w-4 rounded bg-slate-200" />
                  <div className="h-3 w-16 rounded bg-slate-200" />
                </div>
                <div className="h-5 w-5/6 rounded bg-slate-200" />
                <div className="h-3.5 w-full rounded bg-slate-200" />
                <div className="h-3.5 w-2/3 rounded bg-slate-200" />
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
                <div className="flex items-center space-x-2">
                  <div className="h-7 w-7 rounded-full bg-slate-200" />
                  <div className="space-y-1">
                    <div className="h-3 w-16 rounded bg-slate-200" />
                    <div className="h-2 w-10 rounded bg-slate-200" />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <div className="h-4 w-8 rounded bg-slate-200" />
                  <div className="h-4 w-8 rounded bg-slate-200" />
                </div>
              </div>
            </div>
          </div>
        );
      case 'image':
        return <div key={index} className={`animate-pulse rounded-2xl bg-slate-200 ${className}`} />;
      case 'text':
      default:
        return (
          <div key={index} className={`animate-pulse space-y-2 ${className}`}>
            <div className="h-4 w-full rounded bg-slate-200" />
            <div className="h-4 w-5/6 rounded bg-slate-200" />
            <div className="h-4 w-2/3 rounded bg-slate-200" />
          </div>
        );
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, idx) => renderSkeletonItem(idx))}
    </>
  );
};
export default Skeleton;
