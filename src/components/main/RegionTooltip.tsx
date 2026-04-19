'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { REGIONS, type RegionKey } from '@/data/categories';
import regionsData from '@/data/regions.json';

interface RegionTooltipProps {
  regionId: RegionKey | null;
  mouseX: number;
  mouseY: number;
}

export default function RegionTooltip({ regionId, mouseX, mouseY }: RegionTooltipProps) {
  if (!regionId) return null;

  const region = REGIONS[regionId];
  const regionInfo = regionsData.find((r) => r.id === regionId);

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
          <div className="flex items-center gap-2 mb-2">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: region.color }}
            />
            <span className="text-gray-800 font-bold text-base">{region.label}</span>
          </div>

          {regionInfo && (
            <p className="text-gray-500 text-sm mb-2">
              인구 {(regionInfo.stats.population.total / 10000).toFixed(1)}만명
            </p>
          )}

          <p className="text-gray-400 text-sm mt-2">클릭하여 상세 보기</p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
