'use client';

import { useMemo } from 'react';
import { CATEGORIES, type CategoryKey } from '@/data/categories';
import policiesData from '@/data/policies.json';

export default function SidePanel() {
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
    <div className="h-full flex flex-col gap-4">
      {/* ── 프로필 카드: 네이비 배경 ── */}
      <div className="brand-card-navy p-6 relative overflow-hidden">
        {/* 장식 원호 (흰색 계열) */}
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full border-[4px] border-white/10 pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-20 h-20 rounded-full border-[4px] border-orange/20 pointer-events-none" />
        <div className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-orange/20" />

        <div className="relative flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/20">
            <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
              <path d="M10 38 A20 20 0 0 1 30 18" stroke="#F58220" strokeWidth="4" strokeLinecap="round" />
              <path d="M10 38 A12 12 0 0 1 22 26" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
              <rect x="30" y="10" width="10" height="10" rx="2.5" fill="#F58220" />
            </svg>
          </div>
          <div>
            <h2 className="text-white text-xl font-extrabold">정명근</h2>
            <p className="text-white/60 text-sm">화성특례시장 후보</p>
          </div>
        </div>

        {/* 슬로건 */}
        <div className="relative py-3 px-4 rounded-xl bg-white/10 border border-white/15">
          <p className="text-orange-light text-base font-bold text-center leading-relaxed">
            &ldquo;100가지 약속, 화성의 미래&rdquo;
          </p>
        </div>

        {/* 총 공약 수 */}
        <div className="mt-5 flex items-baseline gap-2 justify-center">
          <span className="text-5xl font-black text-orange">{policiesData.length}</span>
          <span className="text-white/60 text-base font-medium">개 공약</span>
        </div>
      </div>

      {/* ── 분야별 공약 바차트 ── */}
      <div className="brand-card p-5 flex-1">
        <h3 className="text-navy font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-orange" />
          분야별 공약
        </h3>

        <div className="space-y-3">
          {categoryStats.map((cat) => (
            <div key={cat.key} className="group">
              <div className="flex items-center justify-between mb-1">
                <span className="text-navy text-sm flex items-center gap-1.5 font-medium">
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </span>
                <span className="text-orange font-extrabold text-sm">
                  {cat.count}
                </span>
              </div>
              <div className="h-2.5 bg-navy-50 rounded-full overflow-hidden">
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
    </div>
  );
}
