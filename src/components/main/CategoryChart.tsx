'use client';

import { useMemo } from 'react';
import { CATEGORIES, type CategoryKey } from '@/data/categories';
import policiesData from '@/data/policies.json';

export default function CategoryChart() {
  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = {};
    policiesData.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });

    return Object.entries(CATEGORIES)
      .map(([key, cat]) => ({
        key: key as CategoryKey,
        label: cat.label,
        icon: cat.icon,
        color: cat.color,
        count: counts[key] || 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, []);

  const maxCount = Math.max(...categoryStats.map((c) => c.count), 1);

  return (
    <div className="brand-card p-4">
      <h3 className="text-navy font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
        <span className="w-3 h-3 rounded-sm bg-orange" />
        분야별 공약
      </h3>

      <div className="space-y-2.5">
        {categoryStats.map((cat) => (
          <div key={cat.key}>
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-navy text-xs flex items-center gap-1.5 font-medium">
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </span>
              <span className="text-orange font-extrabold text-xs">
                {cat.count}
              </span>
            </div>
            <div className="h-2 bg-navy-50 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${(cat.count / maxCount) * 100}%`,
                  backgroundColor: cat.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
