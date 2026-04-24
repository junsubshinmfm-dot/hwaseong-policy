'use client';

import { motion } from 'framer-motion';
import CategoryTag from '@/components/shared/CategoryTag';
import LikeButton from '@/components/shared/LikeButton';
import { REGIONS, type CategoryKey, type RegionKey } from '@/data/categories';

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

interface ResultGridProps {
  results: Policy[];
  query: string;
  onCardClick: (policy: Policy) => void;
}

export default function ResultGrid({ results, query, onCardClick }: ResultGridProps) {
  if (results.length === 0) {
    return <EmptyState query={query} />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {results.map((policy, i) => (
        <motion.div
          key={policy.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.03 }}
        >
          <ResultCard policy={policy} query={query} onClick={() => onCardClick(policy)} />
        </motion.div>
      ))}
    </div>
  );
}

function ResultCard({ policy, query, onClick }: { policy: Policy; query: string; onClick: () => void }) {
  const regionMeta = REGIONS[policy.region as RegionKey];

  const categoryIcons: Record<string, string> = {
    traffic: '🚇', welfare: '🏥', education: '📚', economy: '💰',
    environment: '🌳', safety: '🛡️', culture: '🎭', housing: '🏠', admin: '🏛️',
  };

  // 검색어 하이라이트
  const highlight = (text: string) => {
    if (!query.trim()) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(
      new RegExp(`(${escaped})`, 'gi'),
      '**$1**'
    );
  };

  const highlightedTitle = highlight(policy.title);

  return (
    <div
      onClick={onClick}
      className="brand-card overflow-hidden cursor-pointer group h-full flex flex-col"
    >
      {/* 상단 컬러바 */}
      <div className="h-1.5 w-full flex">
        <div className="flex-1" style={{ backgroundColor: regionMeta?.color || '#1A3B8F' }} />
        <div className="w-12" style={{ backgroundColor: '#F58220' }} />
      </div>

      <div className="p-5 flex flex-col flex-1">
        {/* 태그 행 */}
        <div className="flex items-center gap-2 mb-3">
          <span className="w-7 h-7 rounded-lg bg-navy text-white flex items-center justify-center
                         text-sm font-bold shrink-0">
            {policy.id}
          </span>
          <CategoryTag category={policy.category as CategoryKey} size="sm" />
          {regionMeta && (
            <span
              className="text-sm px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${regionMeta.color}15`, color: regionMeta.color }}
            >
              {regionMeta.label}
            </span>
          )}
        </div>

        {/* 아이콘 */}
        <div className="text-3xl mb-2 opacity-30">{categoryIcons[policy.category] || '📋'}</div>

        {/* 제목 (하이라이트) */}
        <h3 className="text-navy font-bold text-base mb-1.5 line-clamp-2 group-hover:text-navy-light">
          {highlightedTitle.split('**').map((part, i) =>
            i % 2 === 1 ? (
              <span key={i} className="text-orange bg-orange/10 px-0.5 rounded">{part}</span>
            ) : (
              <span key={i}>{part}</span>
            )
          )}
        </h3>

        {/* 요약 */}
        <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">{policy.summary}</p>

        {/* 좋아요 */}
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <LikeButton policyId={policy.id} size="sm" />
        </div>
      </div>
    </div>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <h3 className="text-gray-500 text-xl font-medium mb-2">
        {query ? '검색 결과가 없습니다' : '검색어를 입력해주세요'}
      </h3>
      <p className="text-gray-400 text-base max-w-sm">
        {query
          ? `"${query}"에 대한 공약을 찾지 못했습니다. 다른 검색어나 필터를 시도해보세요.`
          : '공약 제목, 내용, 분야 등으로 검색할 수 있습니다.'}
      </p>
    </div>
  );
}
