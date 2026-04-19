'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { REGIONS, type RegionKey, type CategoryKey } from '@/data/categories';
import { useRegionData } from '@/hooks/useRegionData';
import { useSuggestionsByRegion } from '@/hooks/useSuggestions';
import Navbar from '@/components/shared/Navbar';
import GeoPattern from '@/components/shared/GeoPattern';
import Dashboard from '@/components/region/Dashboard';
import FilterTabs from '@/components/region/FilterTabs';
import SuggestionGrid from '@/components/suggestion/SuggestionGrid';
import SuggestionModal from '@/components/suggestion/SuggestionModal';
import type { Suggestion } from '@/types/suggestion';

export default function RegionPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#F4F5F9] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-navy-100 border-t-navy rounded-full animate-spin" />
      </main>
    }>
      <RegionContent />
    </Suspense>
  );
}

function RegionContent() {
  const params = useParams();
  const router = useRouter();
  const regionId = params.id as RegionKey;
  const regionMeta = REGIONS[regionId];

  const { region } = useRegionData(regionId);
  const { suggestions, loading: suggestionsLoading } = useSuggestionsByRegion(regionId);
  const [activeFilter, setActiveFilter] = useState<CategoryKey | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);

  const categoryCounts = useMemo(() => {
    const counts: Partial<Record<CategoryKey, number>> = {};
    suggestions.forEach((s) => {
      const cat = s.category as CategoryKey;
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [suggestions]);

  useEffect(() => {
    const handlePopState = () => setSelectedSuggestion(null);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (!regionMeta || !region) {
    return (
      <main className="min-h-screen bg-[#F4F5F9] flex items-center justify-center">
        <p className="text-navy text-2xl font-bold">존재하지 않는 권역입니다.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F4F5F9] relative overflow-hidden">
      <Navbar />

      {/* ── 상단 프리미엄 히어로 ── */}
      <div className="relative pt-16">
        {/* 배경 */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(160deg, #0D1F4D 0%, ${regionMeta.color}30 40%, #F4F5F9 100%)`,
            }}
          />
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full border-[4px] border-white/[0.06]" />
          <div className="absolute top-10 -left-10 w-40 h-40 rounded-full border-[3px] border-white/[0.04]" />
          <div className="absolute bottom-0 right-1/4 w-24 h-24 rounded-full bg-orange/[0.04]" />
        </div>

        {/* 컬러 악센트 바 */}
        <div className="absolute top-16 left-0 right-0 h-1 flex">
          <div className="flex-1" style={{ backgroundColor: regionMeta.color }} />
          <div className="w-32 bg-orange" />
        </div>

        {/* 권역 헤더 */}
        <div className="relative z-10 px-4 md:px-8 max-w-[1600px] mx-auto pt-10 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-start gap-5">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl relative overflow-hidden shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${regionMeta.color} 0%, ${regionMeta.color}BB 100%)`,
                  boxShadow: `0 8px 32px ${regionMeta.color}40`,
                }}
              >
                <div className="absolute inset-0 bg-white/[0.08]" />
                <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full border-[2px] border-white/15" />
                <svg viewBox="0 0 40 40" className="w-9 h-9 relative z-[1]" fill="none">
                  <path d="M20 5C14.48 5 10 9.48 10 15c0 7.88 10 20 10 20s10-12.12 10-20c0-5.52-4.48-10-10-10z"
                    fill="white" opacity="0.95" />
                  <circle cx="20" cy="15" r="4" fill={regionMeta.color} />
                  <circle cx="20" cy="15" r="1.5" fill="white" />
                </svg>
              </div>
              <div>
                <h1 className="text-white text-3xl md:text-4xl font-black mb-1 drop-shadow-sm">{regionMeta.label}</h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 backdrop-blur-sm text-white/80 text-sm font-semibold">
                    {suggestions.length}개 시민제안
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 backdrop-blur-sm text-white/80 text-sm font-semibold">
                    인구 {(region.stats.population.total / 10000).toFixed(1)}만명
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 backdrop-blur-sm text-white/80 text-sm font-semibold">
                    사업체 {region.stats.economy.businesses.toLocaleString()}개
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── 콘텐츠 영역 ── */}
      <div className="relative z-10 px-4 md:px-8 max-w-[1600px] mx-auto pb-12">
        {/* 대시보드 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10"
        >
          <h2 className="text-navy/40 text-sm font-bold uppercase tracking-wider mb-4 ml-1 flex items-center gap-2">
            <span className="w-4 h-0.5 rounded-full bg-orange" />
            데이터 대시보드
          </h2>
          <Dashboard stats={region.stats} regionColor={regionMeta.color} />
        </motion.section>

        {/* 시민 정책제안 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
            <h2 className="text-navy/40 text-sm font-bold uppercase tracking-wider ml-1 flex items-center gap-2">
              <span className="w-4 h-0.5 rounded-full bg-orange" />
              시민 정책제안
            </h2>
            <div className="flex items-center gap-3">
              <FilterTabs activeFilter={activeFilter} onFilter={setActiveFilter} counts={categoryCounts} />
              <button
                onClick={() => router.push('/suggestions/new')}
                className="shrink-0 px-4 py-2 rounded-xl bg-orange text-white text-sm font-bold
                           hover:bg-orange-dark hover:shadow-lg transition-all flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                제안하기
              </button>
            </div>
          </div>

          {suggestionsLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-navy-100 border-t-navy rounded-full animate-spin" />
            </div>
          ) : (
            <SuggestionGrid
              suggestions={suggestions}
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
