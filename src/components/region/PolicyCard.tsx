'use client';

import { motion } from 'framer-motion';
import CategoryTag from '@/components/shared/CategoryTag';
import LikeButton from '@/components/shared/LikeButton';
import { usePolicyViewCount } from '@/hooks/usePolicyView';
import type { CategoryKey } from '@/data/categories';

interface Policy {
  id: number;
  title: string;
  summary: string;
  category: string;
  thumbnail: string;
  priority: number;
}

interface PolicyCardProps {
  policy: Policy;
  onClick: () => void;
}

const categoryIcons: Record<string, string> = {
  traffic: '🚇', welfare: '🏥', education: '📚', economy: '💰',
  environment: '🌳', safety: '🛡️', culture: '🎭', housing: '🏠', admin: '🏛️',
};

const categoryColors: Record<string, string> = {
  traffic: '#2B6FD4', welfare: '#E88544', education: '#38A169', economy: '#8B5FBF',
  environment: '#2F9E60', safety: '#2B55B2', culture: '#F58220', housing: '#D94B7B', admin: '#7B8BA2',
};

export default function PolicyCard({ policy, onClick }: PolicyCardProps) {
  const catColor = categoryColors[policy.category] || '#1A3B8F';
  const viewCount = usePolicyViewCount(policy.id);

  return (
    <motion.div
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.98 }}
      className="relative rounded-2xl overflow-hidden cursor-pointer group h-full flex flex-col bg-white
                 border border-navy/[0.06] shadow-[0_2px_16px_rgba(26,59,143,0.05)]
                 hover:shadow-[0_12px_40px_rgba(26,59,143,0.12)] transition-all duration-300"
      onClick={onClick}
    >
      {/* 상단 비주얼 영역 */}
      <div className="relative h-24 sm:h-32 overflow-hidden">
        {/* 그라데이션 배경 */}
        <div
          className="absolute inset-0 transition-all duration-500"
          style={{
            background: `linear-gradient(160deg, ${catColor}12 0%, ${catColor}25 50%, ${catColor}08 100%)`,
          }}
        />

        {/* 장식: 큰 원호 */}
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full border-[4px] opacity-[0.07] group-hover:opacity-[0.15] transition-opacity duration-500"
          style={{ borderColor: catColor }} />
        <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full opacity-[0.05] group-hover:opacity-[0.10] transition-opacity duration-500"
          style={{ backgroundColor: catColor }} />

        {/* 아이콘 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="text-6xl opacity-15 group-hover:opacity-30 group-hover:scale-110 transition-all duration-500"
          >
            {categoryIcons[policy.category] || '📋'}
          </div>
        </div>

        {/* 번호: 좌상단 */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
          <div
            className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-[10px] sm:text-sm font-black shadow-lg text-white"
            style={{ background: `linear-gradient(135deg, ${catColor} 0%, ${catColor}CC 100%)` }}
          >
            {policy.id}
          </div>
        </div>

        {/* 카테고리: 우상단 */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 hidden sm:block">
          <CategoryTag category={policy.category as CategoryKey} size="sm" />
        </div>

        {/* 하단 페이드 */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
      </div>

      {/* 본문 */}
      <div className="px-3 sm:px-4 pb-3 sm:pb-4 -mt-2 relative flex flex-col flex-1">
        <h4 className="text-navy font-extrabold text-xs sm:text-sm mb-1 line-clamp-2 group-hover:text-orange transition-colors duration-300 leading-snug">
          {policy.title}
        </h4>
        <p className="text-navy/40 text-[10px] sm:text-xs line-clamp-2 mb-2 flex-1 leading-relaxed">
          {policy.summary}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-navy/35 text-[10px] font-semibold">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="tabular-nums">{viewCount.toLocaleString()}</span>
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <LikeButton policyId={policy.id} size="sm" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
