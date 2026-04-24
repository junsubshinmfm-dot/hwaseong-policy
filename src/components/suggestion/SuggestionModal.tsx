'use client';

import { useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import CategoryTag from '@/components/shared/CategoryTag';
import SuggestionLikeButton from './SuggestionLikeButton';
import ReportButton from './ReportButton';
import CommentSection from './CommentSection';
import { REGIONS, type CategoryKey, type RegionKey } from '@/data/categories';
import type { Suggestion } from '@/types/suggestion';

const categoryIcons: Record<string, string> = {
  traffic: '🚇', welfare: '🏥', education: '📚', economy: '💰',
  environment: '🌳', safety: '🛡️', culture: '🎭', housing: '🏠', admin: '🏛️',
};

interface SuggestionModalProps {
  suggestion: Suggestion;
  onClose: () => void;
}

export default function SuggestionModal({ suggestion, onClose }: SuggestionModalProps) {
  const regionMeta = REGIONS[suggestion.region as RegionKey];

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  const date = new Date(suggestion.createdAt);
  const dateStr = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-navy-dark/40 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-6 pointer-events-none"
      >
        <div
          className="pointer-events-auto relative w-full h-full md:h-auto md:max-h-[90vh]
                     md:max-w-3xl md:rounded-2xl
                     bg-white border-0 md:border md:border-navy-100/30
                     overflow-y-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 닫기 */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-xl
                       bg-white/80 backdrop-blur-sm border border-navy-100/30 shadow-sm
                       flex items-center justify-center
                       text-gray-500 hover:text-navy hover:bg-navy-50
                       transition-all duration-200"
            aria-label="닫기"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* 상단 비주얼 */}
          <div className="relative w-full aspect-[3/1] bg-gradient-to-br from-navy-50 to-navy-100/30">
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full border-[3px] border-white/20 pointer-events-none" />
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-7xl opacity-15">
                {categoryIcons[suggestion.category] || '📋'}
              </span>
            </div>

            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-orange text-white text-sm font-bold shadow-sm">
                시민제안
              </span>
              <CategoryTag category={suggestion.category as CategoryKey} size="md" />
              {regionMeta && (
                <span
                  className="text-sm px-2.5 py-1 rounded-lg font-semibold"
                  style={{ backgroundColor: `${regionMeta.color}15`, color: regionMeta.color }}
                >
                  {regionMeta.label}
                </span>
              )}
            </div>
          </div>

          {/* 본문 */}
          <div className="p-6 md:p-8">
            <h2 className="text-navy text-2xl md:text-3xl font-bold mb-2 leading-tight">
              {suggestion.title}
            </h2>
            <div className="flex items-center gap-3 mb-6 text-sm text-navy/40">
              <span className="font-medium">{suggestion.nickname}</span>
              <span>|</span>
              <span>{dateStr}</span>
            </div>

            <div className="h-px bg-navy-100/30 mb-6" />

            <div className="space-y-5 mb-8">
              <div>
                <h3 className="text-navy/50 text-sm font-semibold uppercase tracking-wider mb-2">정책 내용</h3>
                <p className="text-gray-600 text-base leading-relaxed whitespace-pre-wrap">{suggestion.content}</p>
              </div>

              {suggestion.reason && (
                <div>
                  <h3 className="text-navy/50 text-sm font-semibold uppercase tracking-wider mb-2">필요한 이유</h3>
                  <p className="text-gray-600 text-base leading-relaxed whitespace-pre-wrap">{suggestion.reason}</p>
                </div>
              )}

              {suggestion.expectedEffect && (
                <div>
                  <h3 className="text-navy/50 text-sm font-semibold uppercase tracking-wider mb-2">기대 효과</h3>
                  <p className="text-gray-600 text-base leading-relaxed whitespace-pre-wrap">{suggestion.expectedEffect}</p>
                </div>
              )}
            </div>

            <div className="h-px bg-navy-100/30 mb-6" />

            <div className="flex items-center justify-between mb-6">
              <ReportButton suggestionId={suggestion.id} size="md" />
              <SuggestionLikeButton suggestionId={suggestion.id} initialLikes={suggestion.likes} size="md" />
            </div>

            <div className="h-px bg-navy-100/30 mb-6" />

            {/* 댓글 섹션 */}
            <CommentSection suggestionId={suggestion.id} />
          </div>
        </div>
      </motion.div>
    </>
  );
}
