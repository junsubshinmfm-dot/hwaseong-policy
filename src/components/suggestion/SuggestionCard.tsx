'use client';

import { motion } from 'framer-motion';
import CategoryTag from '@/components/shared/CategoryTag';
import SuggestionLikeButton from './SuggestionLikeButton';
import ReportButton from './ReportButton';
import { REGIONS, type CategoryKey } from '@/data/categories';
import type { Suggestion } from '@/types/suggestion';

const categoryIcons: Record<string, string> = {
  traffic: '🚇', welfare: '🏥', education: '📚', economy: '💰',
  environment: '🌳', safety: '🛡️', culture: '🎭', admin: '🏛️',
};

const categoryColors: Record<string, string> = {
  traffic: '#2B6FD4', welfare: '#E88544', education: '#38A169', economy: '#8B5FBF',
  environment: '#2F9E60', safety: '#2B55B2', culture: '#F58220', admin: '#7B8BA2',
};

interface SuggestionCardProps {
  suggestion: Suggestion;
  onClick: () => void;
}

export default function SuggestionCard({ suggestion, onClick }: SuggestionCardProps) {
  const catColor = categoryColors[suggestion.category] || '#1A3B8F';
  const regionMeta = REGIONS[suggestion.region];

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
        <div
          className="absolute inset-0 transition-all duration-500"
          style={{
            background: `linear-gradient(160deg, ${catColor}12 0%, ${catColor}25 50%, ${catColor}08 100%)`,
          }}
        />

        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full border-[4px] opacity-[0.07] group-hover:opacity-[0.15] transition-opacity duration-500"
          style={{ borderColor: catColor }} />
        <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full opacity-[0.05] group-hover:opacity-[0.10] transition-opacity duration-500"
          style={{ backgroundColor: catColor }} />

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-6xl opacity-15 group-hover:opacity-30 group-hover:scale-110 transition-all duration-500">
            {categoryIcons[suggestion.category] || '📋'}
          </div>
        </div>

        {/* 시민제안 배지 */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
          <div className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-bold text-white bg-orange shadow-lg">
            시민제안
          </div>
        </div>

        {/* 카테고리 */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 hidden sm:block">
          <CategoryTag category={suggestion.category as CategoryKey} size="sm" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
      </div>

      {/* 본문 */}
      <div className="px-3 sm:px-4 pb-3 sm:pb-4 -mt-2 relative flex flex-col flex-1">
        <h4 className="text-navy font-extrabold text-xs sm:text-sm mb-1 line-clamp-2 group-hover:text-orange transition-colors duration-300 leading-snug">
          {suggestion.title}
        </h4>
        <p className="text-navy/40 text-[10px] sm:text-xs line-clamp-2 mb-2 flex-1 leading-relaxed">
          {suggestion.content}
        </p>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: catColor }} />
            <span className="text-navy/20 text-[10px] font-bold whitespace-nowrap shrink-0">{regionMeta?.label}</span>
            <span className="text-navy/15 text-[10px] shrink-0">|</span>
            <span className="text-navy/25 text-[10px] truncate">{suggestion.nickname}</span>
          </div>
          <div className="flex items-center gap-1 shrink-0 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
            <ReportButton suggestionId={suggestion.id} />
            <SuggestionLikeButton suggestionId={suggestion.id} initialLikes={suggestion.likes} size="sm" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
