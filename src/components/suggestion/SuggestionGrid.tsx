'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SuggestionCard from './SuggestionCard';
import type { CategoryKey } from '@/data/categories';
import type { Suggestion } from '@/types/suggestion';

interface SuggestionGridProps {
  suggestions: Suggestion[];
  activeFilter: CategoryKey | null;
  onCardClick: (suggestion: Suggestion) => void;
}

const PAGE_SIZE = 8;

export default function SuggestionGrid({ suggestions, activeFilter, onCardClick }: SuggestionGridProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    return activeFilter
      ? suggestions.filter((s) => s.category === activeFilter)
      : suggestions;
  }, [suggestions, activeFilter]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeFilter]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;
  const remaining = filtered.length - visibleCount;

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-navy-50 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-navy/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <p className="text-navy/40 text-base font-medium">아직 제안된 정책이 없습니다</p>
        <p className="text-navy/25 text-sm mt-1">첫 번째 정책을 제안해보세요!</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        <AnimatePresence mode="popLayout">
          {visible.map((suggestion, i) => (
            <motion.div
              key={suggestion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.35, delay: i < PAGE_SIZE ? i * 0.05 : 0 }}
              layout
            >
              <SuggestionCard suggestion={suggestion} onClick={() => onCardClick(suggestion)} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {hasMore && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex justify-center mt-8">
          <button
            onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
            className="group relative px-8 py-3.5 rounded-2xl font-bold text-base
                       bg-white border border-navy/10 text-navy
                       hover:bg-navy hover:text-white hover:border-navy
                       shadow-sm hover:shadow-lg hover:shadow-navy/10
                       transition-all duration-300"
          >
            <span className="flex items-center gap-2">
              더보기
              <span className="text-orange font-extrabold">+{Math.min(remaining, PAGE_SIZE)}</span>
            </span>
            <span className="block text-xs text-navy/30 group-hover:text-white/50 mt-0.5">
              전체 {filtered.length}개 중 {visibleCount}개 표시
            </span>
          </button>
        </motion.div>
      )}

      {!hasMore && filtered.length > PAGE_SIZE && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-navy/25 text-sm font-medium mt-8">
          전체 {filtered.length}개 제안을 모두 확인했습니다
        </motion.p>
      )}
    </div>
  );
}
