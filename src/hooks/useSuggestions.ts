'use client';

import { useState, useEffect } from 'react';
import { subscribeSuggestions, subscribeSuggestionsByRegion } from '@/lib/suggestions';
import type { Suggestion } from '@/types/suggestion';

export function useSuggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeSuggestions((data) => {
      setSuggestions(data);
      setLoading(false);
    });

    if (!unsubscribe) {
      setLoading(false);
    }

    return () => {
      unsubscribe?.();
    };
  }, []);

  return { suggestions, loading };
}

export function useSuggestionsByRegion(regionId: string) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeSuggestionsByRegion(regionId, (data) => {
      setSuggestions(data);
      setLoading(false);
    });

    if (!unsubscribe) {
      setLoading(false);
    }

    return () => {
      unsubscribe?.();
    };
  }, [regionId]);

  return { suggestions, loading };
}
