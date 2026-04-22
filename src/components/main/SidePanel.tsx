'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { CATEGORIES, type CategoryKey } from '@/data/categories';
import { useSuggestions } from '@/hooks/useSuggestions';
import PolicyRanking from './PolicyRanking';
import MyAreaPolicies from './MyAreaPolicies';

export default function SidePanel() {
  const router = useRouter();
  const { suggestions } = useSuggestions();

  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = {};
    suggestions.forEach((s) => {
      counts[s.category] = (counts[s.category] || 0) + 1;
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
  }, [suggestions]);

  const maxCount = Math.max(...categoryStats.map((c) => c.count), 1);

  return (
    <div className="h-full flex flex-col gap-4">
      {/* 프로필 카드 */}
      <div className="rounded-2xl overflow-hidden shadow-sm bg-navy">
        {/* 세로형 프로필 이미지 + 제안수 오버레이 */}
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/images/jmg-profile-vertical.png`}
            alt="정명근 · 대한민국 1등 도시 화성"
            className="block w-full h-auto"
          />

          {/* 제안 카운터 오버레이 (좌측 하단, 큰 사이즈) */}
          <div className="absolute bottom-4 left-4">
            <div className="text-white/75 text-xs font-bold uppercase tracking-wider mb-1">
              시민제안
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-orange text-6xl font-black leading-none drop-shadow-[0_2px_8px_rgba(245,130,32,0.4)]">
                {suggestions.length}
              </span>
              <span className="text-white text-lg font-extrabold">개</span>
            </div>
          </div>
        </div>

        {/* 정책제안하기 버튼 */}
        <button
          onClick={() => router.push('/suggestions/new')}
          className="w-full py-3 text-sm font-bold text-white bg-orange
                     hover:bg-orange/90 active:bg-orange/80 transition-colors
                     flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          정책 제안하기
        </button>
      </div>

      {/* 분야별 제안 바차트 */}
      <div className="brand-card p-5 flex-1">
        <h3 className="text-navy font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-orange" />
          분야별 시민제안
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

      {/* 인기 정책제안 랭킹 */}
      <PolicyRanking />

      {/* 우리동네 정책제안 */}
      <MyAreaPolicies />
    </div>
  );
}
