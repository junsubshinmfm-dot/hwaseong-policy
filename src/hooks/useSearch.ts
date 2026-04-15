import { useState, useMemo } from 'react';
import type { CategoryKey, RegionKey } from '@/data/categories';

interface Policy {
  id: number;
  title: string;
  summary: string;
  detail: string;
  region: RegionKey;
  category: CategoryKey;
  videoUrl: string;
  thumbnail: string;
  priority: number;
}

interface SearchFilters {
  query: string;
  category: CategoryKey | null;
  region: RegionKey | null;
}

export function useSearch(policies: Policy[]) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: null,
    region: null,
  });

  const results = useMemo(() => {
    return policies.filter((p) => {
      const matchQuery =
        !filters.query ||
        p.title.includes(filters.query) ||
        p.summary.includes(filters.query) ||
        p.detail.includes(filters.query);

      const matchCategory = !filters.category || p.category === filters.category;
      const matchRegion = !filters.region || p.region === filters.region;

      return matchQuery && matchCategory && matchRegion;
    });
  }, [policies, filters]);

  return { filters, setFilters, results };
}
