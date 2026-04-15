'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { REGIONS, CATEGORIES, type RegionKey, type CategoryKey } from '@/data/categories';
import regionsData from '@/data/regions.json';
import policiesData from '@/data/policies.json';

interface RegionTooltipProps {
  regionId: RegionKey | null;
  mouseX: number;
  mouseY: number;
}

export default function RegionTooltip({ regionId, mouseX, mouseY }: RegionTooltipProps) {
  if (!regionId) return null;

  const region = REGIONS[regionId];
  const regionInfo = regionsData.find((r) => r.id === regionId);
  const policies = policiesData.filter((p) => p.region === regionId);

  // 분야별 카운트
  const categoryCounts: Partial<Record<CategoryKey, number>> = {};
  policies.forEach((p) => {
    const cat = p.category as CategoryKey;
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const topCategories = Object.entries(categoryCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <AnimatePresence>
      <motion.div
        key={regionId}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.15 }}
        className="fixed z-50 pointer-events-none"
        style={{
          left: mouseX + 16,
          top: mouseY - 8,
        }}
      >
        <div className="bg-white rounded-xl px-4 py-3 shadow-2xl border border-gray-200 min-w-[180px]">
          {/* 헤더 */}
          <div className="flex items-center gap-2 mb-2">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: region.color }}
            />
            <span className="text-gray-800 font-bold text-base">{region.label}</span>
            <span className="text-gray-500 text-sm ml-auto">
              {regionInfo?.policyCount || policies.length}개 공약
            </span>
          </div>

          {/* 인구 */}
          {regionInfo && (
            <p className="text-gray-500 text-sm mb-2">
              인구 {(regionInfo.stats.population.total / 10000).toFixed(1)}만명
            </p>
          )}

          {/* 주요 분야 */}
          {topCategories.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {topCategories.map(([cat, count]) => {
                const category = CATEGORIES[cat as CategoryKey];
                return (
                  <span
                    key={cat}
                    className="text-sm px-1.5 py-0.5 rounded"
                    style={{
                      backgroundColor: `${category.color}20`,
                      color: category.color,
                    }}
                  >
                    {category.icon} {category.label} {count}
                  </span>
                );
              })}
            </div>
          )}

          {/* 안내 */}
          <p className="text-gray-400 text-sm mt-2">클릭하여 상세 보기</p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
