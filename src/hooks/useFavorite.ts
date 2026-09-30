import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase/client';
import { useApp } from '../context/AppContext';

interface UseFavoriteProps {
  itemType: 'prompt' | 'skill' | 'video' | 'blog';
  itemId: string;
  userId?: string | null;
}

export function useFavorite({ itemType, itemId, userId }: UseFavoriteProps) {
  const { setIsAuthModalOpen, showNotification } = useApp();
  const [isFavorited, setIsFavorited] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch the initial favorited state from Supabase
  const fetchFavoriteState = useCallback(async () => {
    if (!userId) {
      setIsFavorited(false);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('item_type', itemType)
        .eq('item_id', itemId)
        .maybeSingle();

      if (error) throw error;
      setIsFavorited(!!data);
    } catch (err) {
      console.error('Error fetching favorite status:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, itemType, itemId]);

  useEffect(() => {
    fetchFavoriteState();
  }, [fetchFavoriteState]);

  // Toggle favorite state with optimistic updates
  const toggleFavorite = async () => {
    if (!userId) {
      showNotification('Please authenticate to save items to your favorites.', 'info');
      setIsAuthModalOpen(true);
      return;
    }

    // Save previous state for rollback in case of failure
    const previousState = isFavorited;
    setIsFavorited(!previousState);

    try {
      if (previousState) {
        // Remove favorite
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', userId)
          .eq('item_type', itemType)
          .eq('item_id', itemId);

        if (error) throw error;
      } else {
        // Add favorite
        const { error } = await supabase
          .from('user_favorites')
          .insert({
            user_id: userId,
            item_type: itemType,
            item_id: itemId,
          });

        if (error) throw error;
      }
    } catch (err) {
      console.error('Error updating favorite state:', err);
      // Rollback to previous state on error
      setIsFavorited(previousState);
    }
  };

  return { isFavorited, isLoading, toggleFavorite };
}
