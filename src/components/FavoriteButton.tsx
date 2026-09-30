import React from 'react';
import { Bookmark } from 'lucide-react';
import { useFavorite } from '../hooks/useFavorite';
import { useProtectedAction } from '../hooks/useProtectedAction';

interface FavoriteButtonProps {
  itemType: 'prompt' | 'skill' | 'video' | 'blog';
  itemId: string;
  userId?: string | null;
  className?: string;
  showText?: boolean;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  itemType,
  itemId,
  userId,
  className = '',
  showText = false,
}) => {
  const { isFavorited, isLoading, toggleFavorite } = useFavorite({
    itemType,
    itemId,
    userId,
  });
  const { ensureAuth } = useProtectedAction();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    ensureAuth(() => {
      toggleFavorite();
    }, {
      message: `Please authenticate to save this ${itemType} to your favorites list.`,
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className={`group/fav flex items-center justify-center space-x-1.5 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 cursor-pointer ${
        showText ? 'px-3 py-1.5 rounded-xl border border-slate-200 bg-white shadow-sm hover:bg-slate-50' : 'p-2 hover:bg-slate-100/80'
      } ${className}`}
      aria-label={isFavorited ? 'Remove from favorites' : 'Save to favorites'}
      title={isFavorited ? 'Remove from favorites' : 'Save to favorites'}
    >
      <Bookmark
        className={`h-4 w-4 transition-transform active:scale-95 duration-200 ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        } ${
          isFavorited
            ? 'fill-[#e21833] stroke-[#e21833]'
            : 'stroke-slate-500 hover:stroke-slate-800'
        }`}
      />
      {showText && (
        <span className={`text-xs font-bold transition-colors ${isFavorited ? 'text-[#e21833]' : 'text-slate-700'}`}>
          {isFavorited ? 'Saved to Favorites' : 'Save to Favorites'}
        </span>
      )}
    </button>
  );
};
