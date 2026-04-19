'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { REGIONS, type CategoryKey, type RegionKey } from '@/data/categories';
import { useSuggestions } from '@/hooks/useSuggestions';
import Navbar from '@/components/shared/Navbar';
import GeoPattern from '@/components/shared/GeoPattern';
import FilterTabs from '@/components/region/FilterTabs';
import SuggestionGrid from '@/components/suggestion/SuggestionGrid';
import SuggestionModal from '@/components/suggestion/SuggestionModal';
import type { Suggestion } from '@/types/suggestion';

const regionEntries = Object.entries(REGIONS) as [RegionKey, (typeof REGIONS)[RegionKey]][];

export default function SuggestionsPage() {
  const router = useRouter();
  const { suggestions, loading } = useSuggestions();
  const [activeFilter, setActiveFilter] = useState<CategoryKey | null>(null);
  const [activeRegion, setActiveRegion] = useState<RegionKey | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');

  const filteredByRegion = useMemo(() => {
    return activeRegion
      ? suggestions.filter((s) => s.region === activeRegion)
      : suggestions;
  }, [suggestions, activeRegion]);

  const sorted = useMemo(() => {
    if (sortBy === 'popular') {
      return [...filteredByRegion].sort((a, b) => b.likes - a.likes);
    }
    return filteredByRegion;
  }, [filteredByRegion, sortBy]);

  const categoryCounts = useMemo(() => {
    const counts: Partial<Record<CategoryKey, number>> = {};
    filteredByRegion.forEach((s) => {
      counts[s.category] = (counts[s.category] || 0) + 1;
    });
    return counts;
  }, [filteredByRegion]);

  return (
    <main className="min-h-screen bg-[#F4F5F9] relative overflow-hidden">
      <Navbar />

      {/* 히어로 */}
      <div className="relative pt-16">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(160deg, #0D1F4D 0%, #F5822030 40%, #F4F5F9 100%)',
          }} />
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full border-[4px] border-white/[0.06]" />
          <div className="absolute top-10 -left-10 w-40 h-40 rounded-full border-[3px] border-white/[0.04]" />
        </div>

        <div className="absolute top-16 left-0 right-0 h-1 flex">
          <div className="flex-1 bg-navy" />
          <div className="w-32 bg-orange" />
        </div>

        <div className="relative z-10 px-4 md:px-8 max-w-[1600px] mx-auto pt-10 pb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl relative overflow-hidden shrink-0"
                style={{ background: 'linear-gradient(135deg, #F58220 0%, #F58220BB 100%)', boxShadow: '0 8px 32px #F5822040' }}>
                <div className="absolute inset-0 bg-white/[0.08]" />
                <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full border-[2px] border-white/15" />
                <svg className="w-8 h-8 relative z-[1]" fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <div>
                <h1 className="text-white text-3xl md:text-4xl font-black mb-1 drop-shadow-sm">시민 정책제안</h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 backdrop-blur-sm text-white/80 text-sm font-semibold">
                    {suggestions.length}개 제안
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="relative z-10 px-4 md:px-8 max-w-[1600px] mx-auto pb-12">
        {/* 지역 탭 + 정렬 + 제안하기 버튼 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <button
                onClick={() => setActiveRegion(null)}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  !activeRegion ? 'bg-navy text-white shadow-md' : 'bg-white text-navy/50 border border-navy/10 hover:bg-navy-50'
                }`}
              >
                전체 지역
              </button>
              {regionEntries.map(([key, r]) => (
                <button
                  key={key}
                  onClick={() => setActiveRegion(activeRegion === key ? null : key)}
                  className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    activeRegion === key ? 'text-white shadow-md' : 'bg-white text-navy/50 border border-navy/10 hover:bg-navy-50'
                  }`}
                  style={activeRegion === key ? { backgroundColor: r.color } : {}}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="flex rounded-xl overflow-hidden border border-navy/10">
                <button
                  onClick={() => setSortBy('latest')}
                  className={`px-3 py-1.5 text-xs font-bold transition-all ${
                    sortBy === 'latest' ? 'bg-navy text-white' : 'bg-white text-navy/50 hover:bg-navy-50'
                  }`}
                >
                  최신순
                </button>
                <button
                  onClick={() => setSortBy('popular')}
                  className={`px-3 py-1.5 text-xs font-bold transition-all ${
                    sortBy === 'popular' ? 'bg-navy text-white' : 'bg-white text-navy/50 hover:bg-navy-50'
                  }`}
                >
                  인기순
                </button>
              </div>

              <button
                onClick={() => router.push('/suggestions/new')}
                className="px-4 py-2 rounded-xl bg-orange text-white text-sm font-bold
                           hover:bg-orange-dark hover:shadow-lg transition-all flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                제안하기
              </button>
            </div>
          </div>

          {/* 카테고리 필터 */}
          <FilterTabs activeFilter={activeFilter} onFilter={setActiveFilter} counts={categoryCounts} />
        </motion.div>

        {/* 그리드 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-navy-100 border-t-navy rounded-full animate-spin" />
            </div>
          ) : (
            <SuggestionGrid
              suggestions={sorted}
              activeFilter={activeFilter}
              onCardClick={setSelectedSuggestion}
            />
          )}
        </motion.section>
      </div>

      {/* 플로팅 제안 버튼 (모바일) */}
      <button
        onClick={() => router.push('/suggestions/new')}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-orange text-white shadow-xl
                   hover:bg-orange-dark hover:scale-105 transition-all z-40
                   flex items-center justify-center sm:hidden"
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      <GeoPattern variant="strip" className="w-full h-12" />
      <GeoPattern variant="corner-br" className="w-[250px] h-[250px] z-0 opacity-60" />

      {/* 모달 */}
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
