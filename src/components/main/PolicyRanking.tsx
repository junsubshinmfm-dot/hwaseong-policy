'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CATEGORIES, REGIONS, type CategoryKey, type RegionKey } from '@/data/categories';
import { useSuggestions } from '@/hooks/useSuggestions';
import { useTimeline } from '@/hooks/useTimeline';
import { PLEDGES_FALLBACK } from '@/data/pledges';
import TimelineCrossfade from '@/components/timeline/TimelineCrossfade';

export default function PolicyRanking() {
  const router = useRouter();
  const { suggestions: citizenSuggestions, loading } = useSuggestions();
  const { futureMode, revealed } = useTimeline();
  const futureBlur = futureMode && !revealed;

  // 슬라이더 우측이면 공약 더미를 그대로 5개. 좌측이면 좋아요 순 시민제안.
  const ranked = futureMode
    ? PLEDGES_FALLBACK.slice(0, 5)
    : [...citizenSuggestions].sort((a, b) => b.likes - a.likes).slice(0, 5);

  const hasAnyLikes = futureMode ? true : ranked.some((r) => r.likes > 0);

  return (
    <div className="brand-card p-4">
      <h3 className="text-navy font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
        <span className="text-orange text-base">&#9829;</span>
        <TimelineCrossfade
          past={<span>인기 정책제안 TOP 5</span>}
          future={<span>인기 공약 TOP 5</span>}
        />
      </h3>

      {loading ? (
        <div className="flex items-center justify-center py-4">
          <div className="w-4 h-4 border-2 border-navy/20 border-t-navy rounded-full animate-spin" />
        </div>
      ) : !hasAnyLikes || ranked.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-navy/30 text-xs">
            아직 제안된 정책이 없습니다
          </p>
          <button
            onClick={() => router.push('/suggestions/new')}
            className="mt-2 text-orange text-xs font-bold hover:underline"
          >
            첫 번째 정책을 제안해보세요!
          </button>
        </div>
      ) : (
        <div
          className="space-y-2 transition-[filter] duration-300"
          style={{ filter: futureBlur ? 'blur(7px)' : 'none' }}
        >
          {ranked.map((suggestion, i) => {
            const catColor = CATEGORIES[suggestion.category as CategoryKey]?.color || '#1A3B8F';
            const regionMeta = REGIONS[suggestion.region as RegionKey];

            return (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => router.push(`/region/${suggestion.region}?suggestion=${suggestion.id}`)}
                className="flex items-center gap-2.5 p-2 rounded-xl cursor-pointer hover:bg-navy-50 transition-colors"
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                  i === 0 ? 'bg-orange text-white' : i === 1 ? 'bg-navy text-white' : 'bg-navy-50 text-navy'
                }`}>
                  {i + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-navy font-bold text-xs truncate">{suggestion.title}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: catColor }} />
                    <span className="text-navy/30 text-[10px]">{regionMeta?.label}</span>
                    <span className="text-navy/15 text-[10px]">|</span>
                    <span className="text-navy/20 text-[10px]">{suggestion.nickname}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-orange text-[10px]">&#9829;</span>
                  <span className="text-orange font-extrabold text-xs">{suggestion.likes}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
