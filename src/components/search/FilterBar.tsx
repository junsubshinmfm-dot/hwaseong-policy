'use client';

import { CATEGORIES, REGIONS, type CategoryKey, type RegionKey } from '@/data/categories';

interface FilterBarProps {
  selectedCategories: CategoryKey[];
  selectedRegions: RegionKey[];
  onToggleCategory: (key: CategoryKey) => void;
  onToggleRegion: (key: RegionKey) => void;
  onClearAll: () => void;
}

const categoryEntries = Object.entries(CATEGORIES) as [CategoryKey, (typeof CATEGORIES)[CategoryKey]][];
const regionEntries = Object.entries(REGIONS) as [RegionKey, (typeof REGIONS)[RegionKey]][];

export default function FilterBar({
  selectedCategories,
  selectedRegions,
  onToggleCategory,
  onToggleRegion,
  onClearAll,
}: FilterBarProps) {
  const hasFilters = selectedCategories.length > 0 || selectedRegions.length > 0;

  return (
    <div className="space-y-3">
      {/* 분야 필터 */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-orange text-sm font-bold shrink-0 w-10">분야</span>
        <div className="flex gap-1.5 flex-wrap">
          {categoryEntries.map(([key, cat]) => {
            const active = selectedCategories.includes(key);
            return (
              <button
                key={key}
                onClick={() => onToggleCategory(key)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm font-bold
                           transition-all duration-200 ${
                  active
                    ? 'text-white shadow-sm'
                    : 'bg-white text-navy/50 border border-navy/8 hover:bg-navy-50 hover:text-navy'
                }`}
                style={active ? { backgroundColor: cat.color } : {}}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 권역 필터 */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-navy text-sm font-bold shrink-0 w-10">권역</span>
        <div className="flex gap-1.5 flex-wrap">
          {regionEntries.map(([key, reg]) => {
            const active = selectedRegions.includes(key);
            return (
              <button
                key={key}
                onClick={() => onToggleRegion(key)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-bold
                           transition-all duration-200 ${
                  active
                    ? 'text-white shadow-sm'
                    : 'bg-white text-navy/50 border border-navy/8 hover:bg-navy-50 hover:text-navy'
                }`}
                style={active ? { backgroundColor: reg.color } : {}}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: active ? '#fff' : reg.color }} />
                <span>{reg.label}</span>
              </button>
            );
          })}
        </div>

        {hasFilters && (
          <button onClick={onClearAll} className="ml-auto text-orange text-sm font-bold hover:text-orange-dark transition-colors">
            초기화
          </button>
        )}
      </div>
    </div>
  );
}
