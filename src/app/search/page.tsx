'use client';

import { useState, useMemo, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { type CategoryKey, type RegionKey } from '@/data/categories';
import policiesData from '@/data/policies.json';
import Navbar from '@/components/shared/Navbar';
import GeoPattern from '@/components/shared/GeoPattern';
import SearchBar from '@/components/search/SearchBar';
import FilterBar from '@/components/search/FilterBar';
import ResultGrid from '@/components/search/ResultGrid';
import PolicyModal from '@/components/modal/PolicyModal';

type SortMode = 'relevance' | 'category' | 'region';

interface Policy {
  id: number;
  title: string;
  summary: string;
  detail: string;
  region: string;
  category: string;
  videoUrl: string;
  thumbnail: string;
  priority: number;
}

function SearchContent() {
  const searchParams = useSearchParams();

  // URL 쿼리에서 초기값 읽기
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
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);

  // URL 쿼리 동기화
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (selectedCategories.length) params.set('category', selectedCategories.join(','));
    if (selectedRegions.length) params.set('region', selectedRegions.join(','));
    const qs = params.toString();
    const url = qs ? `/search?${qs}` : '/search';
    window.history.replaceState(null, '', url);
  }, [query, selectedCategories, selectedRegions]);

  // ?policy={id} 자동 오픈
  useEffect(() => {
    const pid = searchParams.get('policy');
    if (pid) {
      const found = policiesData.find((p) => p.id === Number(pid));
      if (found) setSelectedPolicy(found as Policy);
    }
  }, [searchParams]);

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

  // 검색 + 필터링 + 정렬
  const results = useMemo(() => {
    const q = query.toLowerCase().trim();

    const filtered = (policiesData as Policy[]).filter((p) => {
      const matchQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.detail.toLowerCase().includes(q);

      const matchCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(p.category as CategoryKey);

      const matchRegion =
        selectedRegions.length === 0 ||
        selectedRegions.includes(p.region as RegionKey);

      return matchQuery && matchCategory && matchRegion;
    });

    // 정렬
    if (sortMode === 'relevance' && q) {
      filtered.sort((a, b) => {
        const aTitle = a.title.toLowerCase().includes(q) ? 0 : 1;
        const bTitle = b.title.toLowerCase().includes(q) ? 0 : 1;
        if (aTitle !== bTitle) return aTitle - bTitle;
        return a.priority - b.priority;
      });
    } else if (sortMode === 'category') {
      filtered.sort((a, b) => a.category.localeCompare(b.category) || a.priority - b.priority);
    } else if (sortMode === 'region') {
      filtered.sort((a, b) => a.region.localeCompare(b.region) || a.priority - b.priority);
    } else {
      filtered.sort((a, b) => a.priority - b.priority);
    }

    return filtered;
  }, [query, selectedCategories, selectedRegions, sortMode]);

  const openModal = useCallback((policy: Policy) => {
    setSelectedPolicy(policy);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedPolicy(null);
  }, []);

  const hasActiveFilters = query || selectedCategories.length > 0 || selectedRegions.length > 0;

  return (
    <main className="min-h-screen bg-[#F4F5F9] relative overflow-hidden">
      <Navbar />

      {/* 기하학 배경 */}
      <div className="absolute top-16 left-0 right-0 h-[140px] z-0">
        <GeoPattern variant="header" className="w-full h-full opacity-50" />
      </div>
      <GeoPattern variant="corner-br" className="w-[200px] h-[200px] z-0 opacity-50" />

      <div className="relative z-10 pt-20 pb-12 px-4 md:px-8 max-w-6xl mx-auto">
        {/* 검색바 */}
        <div className="mb-6">
          <SearchBar value={query} onChange={setQuery} />
        </div>

        {/* 필터바 */}
        <div className="mb-6">
          <FilterBar
            selectedCategories={selectedCategories}
            selectedRegions={selectedRegions}
            onToggleCategory={toggleCategory}
            onToggleRegion={toggleRegion}
            onClearAll={clearFilters}
          />
        </div>

        {/* 결과 헤더: 개수 + 정렬 */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-navy/60 text-base font-medium">
            {hasActiveFilters ? (
              <>
                <span className="text-orange font-extrabold">{results.length}</span>개 결과
              </>
            ) : (
              <>전체 공약 <span className="text-orange font-extrabold">{policiesData.length}</span>개</>
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

        {/* 결과 그리드 */}
        <ResultGrid results={results} query={query} onCardClick={openModal} />
      </div>

      {/* 모달 */}
      <AnimatePresence>
        {selectedPolicy && (
          <PolicyModal
            key={selectedPolicy.id}
            policy={selectedPolicy}
            onClose={closeModal}
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
