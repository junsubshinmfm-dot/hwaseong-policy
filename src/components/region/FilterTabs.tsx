'use client';

import { CATEGORIES, type CategoryKey } from '@/data/categories';

interface FilterTabsProps {
  activeFilter: CategoryKey | null;
  onFilter: (category: CategoryKey | null) => void;
  counts: Partial<Record<CategoryKey, number>>;
}

const categoryEntries = Object.entries(CATEGORIES) as [CategoryKey, (typeof CATEGORIES)[CategoryKey]][];

export default function FilterTabs({ activeFilter, onFilter, counts }: FilterTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => onFilter(null)}
        className={`shrink-0 px-4 py-2 rounded-xl text-base font-bold transition-all duration-200 ${
          !activeFilter
            ? 'bg-navy text-white shadow-md'
            : 'bg-white text-navy/50 border border-navy/10 hover:bg-navy-50 hover:text-navy'
        }`}
      >
        전체
      </button>

      {categoryEntries.map(([key, cat]) => {
        const count = counts[key] || 0;
        if (count === 0) return null;
        const isActive = activeFilter === key;

        return (
          <button
            key={key}
            onClick={() => onFilter(isActive ? null : key)}
            className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-base font-bold
                        transition-all duration-200 ${
              isActive
                ? 'text-white shadow-md'
                : 'bg-white text-navy/50 border border-navy/10 hover:bg-navy-50 hover:text-navy'
            }`}
            style={isActive ? { backgroundColor: cat.color } : {}}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
            <span className={`text-sm font-extrabold ${isActive ? 'text-white/80' : 'text-orange'}`}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
