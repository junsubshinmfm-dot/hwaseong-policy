'use client';

import type { TimeOfDay } from '@/hooks/useTimeOfDay';

interface SkyBodyProps {
  period: TimeOfDay;
}

/**
 * 시간대별 해/달 표시
 * - 새벽: 해가 왼쪽 낮게 (떠오르는 중)
 * - 낮: 해가 위쪽 중앙
 * - 저녁: 해가 오른쪽 낮게 (지는 중)
 * - 밤: 달 + 별
 */
export default function SkyBody({ period }: SkyBodyProps) {
  if (period === 'day') {
    return (
      <div className="absolute top-[6%] left-[15%] z-[2] pointer-events-none">
        {/* 해 글로우 */}
        <div className="relative">
          <div className="absolute -inset-6 rounded-full bg-yellow-300/20 animate-pulse" />
          <div className="absolute -inset-3 rounded-full bg-yellow-200/30" />
          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-yellow-200 via-yellow-300 to-orange-400 shadow-[0_0_30px_10px_rgba(255,220,50,0.3)]" />
          {/* 광선 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-20 sm:h-20">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="absolute top-1/2 left-1/2 w-[1px] h-3 sm:h-4 bg-yellow-300/40 origin-bottom"
                style={{ transform: `translate(-50%, -100%) rotate(${i * 45}deg) translateY(-12px)` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (period === 'dawn') {
    return (
      <div className="absolute bottom-[25%] left-[8%] z-[2] pointer-events-none">
        <div className="relative">
          <div className="absolute -inset-4 rounded-full bg-orange-300/25 animate-pulse" />
          <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-orange-200 via-orange-400 to-red-400 shadow-[0_0_25px_8px_rgba(255,150,50,0.3)]" />
          {/* 수평선 빛 */}
          <div className="absolute top-1/2 -left-8 -right-8 h-[2px] bg-gradient-to-r from-transparent via-orange-300/40 to-transparent" />
        </div>
      </div>
    );
  }

  if (period === 'evening') {
    return (
      <div className="absolute bottom-[25%] right-[8%] z-[2] pointer-events-none">
        <div className="relative">
          <div className="absolute -inset-4 rounded-full bg-red-400/25 animate-pulse" />
          <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-yellow-300 via-orange-500 to-red-600 shadow-[0_0_25px_8px_rgba(255,100,30,0.3)]" />
          <div className="absolute top-1/2 -left-8 -right-8 h-[2px] bg-gradient-to-r from-transparent via-red-400/40 to-transparent" />
        </div>
      </div>
    );
  }

  // 밤: 달 + 별
  return (
    <div className="absolute top-[8%] right-[12%] z-[2] pointer-events-none">
      <div className="relative">
        {/* 달 글로우 */}
        <div className="absolute -inset-4 rounded-full bg-blue-200/10" />
        {/* 초승달 */}
        <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-gray-100 to-gray-300 shadow-[0_0_20px_5px_rgba(200,220,255,0.2)] relative overflow-hidden">
          {/* 달 크레이터 */}
          <div className="absolute top-2 left-1.5 w-1.5 h-1.5 rounded-full bg-gray-400/30" />
          <div className="absolute top-4 left-3 w-1 h-1 rounded-full bg-gray-400/25" />
          <div className="absolute top-2.5 right-2 w-2 h-2 rounded-full bg-gray-400/20" />
          {/* 그림자 (초승달 효과) */}
          <div className="absolute inset-0 rounded-full"
            style={{ background: 'radial-gradient(circle at 65% 45%, transparent 40%, rgba(15,20,50,0.6) 70%)' }} />
        </div>
        {/* 주변 별 */}
        <div className="absolute -top-3 -left-4 w-1 h-1 rounded-full bg-white/70 animate-pulse" />
        <div className="absolute top-0 -right-5 w-0.5 h-0.5 rounded-full bg-white/50 animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute -bottom-2 -left-6 w-0.5 h-0.5 rounded-full bg-white/40 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute -top-5 right-2 w-0.5 h-0.5 rounded-full bg-white/60 animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute bottom-1 -right-7 w-1 h-1 rounded-full bg-white/50 animate-pulse" style={{ animationDelay: '0.8s' }} />
      </div>
    </div>
  );
}
