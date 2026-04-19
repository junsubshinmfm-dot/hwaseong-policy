'use client';

import { useState, useEffect, useCallback } from 'react';
import { toggleSuggestionLike, isSuggestionLiked } from '@/lib/suggestions';

export function useSuggestionLike(suggestionId: string) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    setLiked(isSuggestionLiked(suggestionId));
  }, [suggestionId]);

  const toggleLike = useCallback(async () => {
    const result = await toggleSuggestionLike(suggestionId);
    setLiked(result.liked);
    setCount(result.count);
    if (result.liked) {
      setAnimating(true);
      setTimeout(() => setAnimating(false), 600);
    }
  }, [suggestionId]);

  return { liked, count, animating, toggleLike };
}
