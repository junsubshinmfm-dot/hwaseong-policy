'use client';

import { motion } from 'framer-motion';
import CategoryTag from '@/components/shared/CategoryTag';
import LikeButton from '@/components/shared/LikeButton';
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
  environment: '🌳', safety: '🛡️', culture: '🎭', admin: '🏛️',
};

const categoryColors: Record<string, string> = {
  traffic: '#2B6FD4', welfare: '#E88544', education: '#38A169', economy: '#8B5FBF',
  environment: '#2F9E60', safety: '#2B55B2', culture: '#F58220', admin: '#7B8BA2',
};

export default function PolicyCard({ policy, onClick }: PolicyCardProps) {
  const catColor = categoryColors[policy.category] || '#1A3B8F';

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
      <div className="relative h-44 overflow-hidden">
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
        <div className="absolute top-4 left-4">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shadow-lg text-white"
            style={{ background: `linear-gradient(135deg, ${catColor} 0%, ${catColor}CC 100%)` }}
          >
            {policy.id}
          </div>
        </div>

        {/* 카테고리: 우상단 */}
        <div className="absolute top-4 right-4">
          <CategoryTag category={policy.category as CategoryKey} size="sm" />
        </div>

        {/* 하단 페이드 */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
      </div>

      {/* 본문 */}
      <div className="px-5 pb-5 -mt-3 relative flex flex-col flex-1">
        <h4 className="text-navy font-extrabold text-base mb-2 line-clamp-2 group-hover:text-orange transition-colors duration-300 leading-snug">
          {policy.title}
        </h4>
        <p className="text-navy/40 text-sm line-clamp-2 mb-4 flex-1 leading-relaxed">
          {policy.summary}
        </p>

        {/* 하단: 구분선 + 좋아요 */}
        <div className="pt-3 border-t border-navy/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: catColor }} />
            <span className="text-navy/25 text-xs font-bold uppercase tracking-wider">
              {policy.category}
            </span>
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <LikeButton policyId={policy.id} size="sm" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
