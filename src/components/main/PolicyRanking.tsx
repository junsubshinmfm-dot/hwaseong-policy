'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CATEGORIES, REGIONS, type CategoryKey, type RegionKey } from '@/data/categories';
import policiesData from '@/data/policies.json';

export default function PolicyRanking() {
  const router = useRouter();
  const [rankings, setRankings] = useState<{ id: number; count: number }[]>([]);

  useEffect(() => {
    const counts: Record<string, number> = JSON.parse(
      localStorage.getItem('likeCounts') || '{}'
    );
    const likedIds: number[] = JSON.parse(
      localStorage.getItem('liked') || '[]'
    );

    // 좋아요 수 기준 정렬, 없으면 liked 목록 기준
    const ranked = policiesData
      .map((p) => ({ id: p.id, count: counts[p.id] || 0, isLiked: likedIds.includes(p.id) }))
      .sort((a, b) => b.count - a.count || (b.isLiked ? 1 : 0) - (a.isLiked ? 1 : 0))
      .slice(0, 5);

    setRankings(ranked);
  }, []);

  const hasAnyLikes = rankings.some((r) => r.count > 0);

  return (
    <div className="brand-card p-4">
      <h3 className="text-navy font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
        <span className="text-orange text-base">&#9829;</span>
        인기 공약 TOP 5
      </h3>

      {!hasAnyLikes ? (
        <p className="text-navy/30 text-xs text-center py-4">
          공약에 좋아요를 눌러보세요!
        </p>
      ) : (
        <div className="space-y-2">
          {rankings.map((rank, i) => {
            const policy = policiesData.find((p) => p.id === rank.id);
            if (!policy) return null;
            const catColor = CATEGORIES[policy.category as CategoryKey]?.color || '#1A3B8F';
            const regionMeta = REGIONS[policy.region as RegionKey];

            return (
              <motion.div
                key={rank.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => router.push(`/region/${policy.region}?policy=${policy.id}`)}
                className="flex items-center gap-2.5 p-2 rounded-xl cursor-pointer hover:bg-navy-50 transition-colors"
              >
                {/* 순위 */}
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                  i === 0 ? 'bg-orange text-white' : i === 1 ? 'bg-navy text-white' : 'bg-navy-50 text-navy'
                }`}>
                  {i + 1}
                </div>

                {/* 공약 정보 */}
                <div className="flex-1 min-w-0">
                  <p className="text-navy font-bold text-xs truncate">{policy.title}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: catColor }} />
                    <span className="text-navy/30 text-[10px]">{regionMeta?.label}</span>
                  </div>
                </div>

                {/* 좋아요 수 */}
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-orange text-[10px]">&#9829;</span>
                  <span className="text-orange font-extrabold text-xs">{rank.count}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
