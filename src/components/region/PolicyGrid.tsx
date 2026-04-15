'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PolicyCard from './PolicyCard';
import type { CategoryKey } from '@/data/categories';

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

interface PolicyGridProps {
  policies: Policy[];
  activeFilter: CategoryKey | null;
  onCardClick: (policy: Policy) => void;
}

const PAGE_SIZE = 8;

export default function PolicyGrid({ policies, activeFilter, onCardClick }: PolicyGridProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    return activeFilter
      ? policies.filter((p) => p.category === activeFilter)
      : policies;
  }, [policies, activeFilter]);

  // 필터 변경 시 리셋
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-navy/40 text-base font-medium">해당 분야의 공약이 없습니다</p>
      </div>
    );
  }

  return (
    <div>
      {/* 그리드 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        <AnimatePresence mode="popLayout">
          {visible.map((policy, i) => (
            <motion.div
              key={policy.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.35, delay: i < PAGE_SIZE ? i * 0.05 : 0 }}
              layout
            >
              <PolicyCard policy={policy} onClick={() => onCardClick(policy)} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 더보기 버튼 */}
      {hasMore && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center mt-8"
        >
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
              <svg className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
            <span className="block text-xs text-navy/30 group-hover:text-white/50 mt-0.5">
              전체 {filtered.length}개 중 {visibleCount}개 표시
            </span>
          </button>
        </motion.div>
      )}

      {/* 전체 표시됨 표시 */}
      {!hasMore && filtered.length > PAGE_SIZE && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-navy/25 text-sm font-medium mt-8"
        >
          전체 {filtered.length}개 공약을 모두 확인했습니다
        </motion.p>
      )}
    </div>
  );
}
