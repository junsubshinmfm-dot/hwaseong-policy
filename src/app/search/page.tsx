'use client';

import { useState, useMemo, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { type CategoryKey, type RegionKey } from '@/data/categories';
import { useSuggestions } from '@/hooks/useSuggestions';
import Navbar from '@/components/shared/Navbar';
import GeoPattern from '@/components/shared/GeoPattern';
import SearchBar from '@/components/search/SearchBar';
import FilterBar from '@/components/search/FilterBar';
import SuggestionGrid from '@/components/suggestion/SuggestionGrid';
import SuggestionModal from '@/components/suggestion/SuggestionModal';
import type { Suggestion } from '@/types/suggestion';

type SortMode = 'relevance' | 'category' | 'region';

function SearchContent() {
  const searchParams = useSearchParams();
  const { suggestions, loading } = useSuggestions();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [selectedCategories, setSelectedCategories] = useState<CategoryKey[]>(() => {
    const c = searchParams.get('category');
    return c ? (c.split(',') as CategoryKey[]) : [];
  });
  const [selectedRegions, setSelectedRegions] = useState<RegionKey[]>(() => {
    const r = searchParams.get('region');
    return r ? (r.split(',') as RegionKey[]) : [];
  });
  const [sortMode, setSortMode] = useState<SortMode>('relevance');
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);

  const toggleCategory = useCallback((key: CategoryKey) => {
    setSelectedCategories((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }, []);

  const toggleRegion = useCallback((key: RegionKey) => {
    setSelectedRegions((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedCategories([]);
    setSelectedRegions([]);
  }, []);

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();

    const filtered = suggestions.filter((s) => {
      const matchQuery =
        !q ||
        s.title.toLowerCase().includes(q) ||
        s.content.toLowerCase().includes(q);

      const matchCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(s.category as CategoryKey);

      const matchRegion =
        selectedRegions.length === 0 ||
        selectedRegions.includes(s.region as RegionKey);

      return matchQuery && matchCategory && matchRegion;
    });

    if (sortMode === 'category') {
      filtered.sort((a, b) => a.category.localeCompare(b.category));
    } else if (sortMode === 'region') {
      filtered.sort((a, b) => a.region.localeCompare(b.region));
    }

    return filtered;
  }, [query, selectedCategories, selectedRegions, sortMode, suggestions]);

  const hasActiveFilters = query || selectedCategories.length > 0 || selectedRegions.length > 0;

  return (
    <main className="min-h-screen bg-[#F4F5F9] relative overflow-hidden">
      <Navbar />

      <div className="absolute top-16 left-0 right-0 h-[140px] z-0">
        <GeoPattern variant="header" className="w-full h-full opacity-50" />
      </div>
      <GeoPattern variant="corner-br" className="w-[200px] h-[200px] z-0 opacity-50" />

      <div className="relative z-10 pt-20 pb-12 px-4 md:px-8 max-w-6xl mx-auto">
        <div className="mb-6">
          <SearchBar value={query} onChange={setQuery} />
        </div>

        <div className="mb-6">
          <FilterBar
            selectedCategories={selectedCategories}
            selectedRegions={selectedRegions}
            onToggleCategory={toggleCategory}
            onToggleRegion={toggleRegion}
            onClearAll={clearFilters}
          />
        </div>

        <div className="flex items-center justify-between mb-5">
          <p className="text-navy/60 text-base font-medium">
            {hasActiveFilters ? (
              <>
                <span className="text-orange font-extrabold">{results.length}</span>개 결과
              </>
            ) : (
              <>전체 시민제안 <span className="text-orange font-extrabold">{suggestions.length}</span>개</>
            )}
          </p>

          <div className="flex items-center gap-1">
            {(['relevance', 'category', 'region'] as SortMode[]).map((mode) => {
              const labels: Record<SortMode, string> = {
                relevance: '관련도',
                category: '분야순',
                region: '권역순',
              };
              return (
                <button
                  key={mode}
                  onClick={() => setSortMode(mode)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                    sortMode === mode
                      ? 'bg-navy text-white'
                      : 'text-navy/30 hover:text-navy hover:bg-navy-50'
                  }`}
                >
                  {labels[mode]}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-navy-100 border-t-navy rounded-full animate-spin" />
          </div>
        ) : (
          <SuggestionGrid
            suggestions={results}
            activeFilter={null}
            onCardClick={setSelectedSuggestion}
          />
        )}
      </div>

      <AnimatePresence>
        {selectedSuggestion && (
          <SuggestionModal
            key={selectedSuggestion.id}
            suggestion={selectedSuggestion}
            onClose={() => setSelectedSuggestion(null)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#F0F2F8] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin" />
      </main>
    }>
      <SearchContent />
    </Suspense>
  );
}
