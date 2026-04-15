'use client';

import type { TimeOfDay } from '@/hooks/useTimeOfDay';

interface SkyBodyProps {
  period: TimeOfDay;
}

export default function SkyBody({ period }: SkyBodyProps) {
  if (period === 'day') {
    return (
      <>
        {/* 해 */}
        <div className="absolute top-[4%] left-[12%] z-[2] pointer-events-none">
          <div className="relative">
            <div className="absolute -inset-4 sm:-inset-10 rounded-full bg-yellow-300/15 animate-pulse" />
            <div className="absolute -inset-2 sm:-inset-5 rounded-full bg-yellow-200/25" />
            <div className="w-8 h-8 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-yellow-100 via-yellow-300 to-orange-400 shadow-[0_0_50px_15px_rgba(255,220,50,0.35)]" />
            {/* 광선 */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-36 sm:h-36">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="absolute top-1/2 left-1/2 w-[1.5px] bg-yellow-300/30 origin-bottom"
                  style={{
                    height: i % 2 === 0 ? '16px' : '10px',
                    transform: `translate(-50%, -100%) rotate(${i * 30}deg) translateY(-${i % 2 === 0 ? 18 : 15}px)`,
                  }} />
              ))}
            </div>
          </div>
        </div>
        {/* 구름 */}
        <Cloud left="60%" top="5%" size="lg" delay={0} />
        <Cloud left="30%" top="10%" size="md" delay={2} />
        <Cloud left="78%" top="12%" size="sm" delay={4} />
      </>
    );
  }

  if (period === 'dawn') {
    return (
      <>
        <div className="absolute bottom-[22%] left-[6%] z-[2] pointer-events-none">
          <div className="relative">
            <div className="absolute -inset-8 rounded-full bg-orange-300/20 animate-pulse" />
            <div className="absolute -inset-4 rounded-full bg-orange-200/25" />
            <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-full bg-gradient-to-br from-yellow-200 via-orange-400 to-red-400 shadow-[0_0_40px_12px_rgba(255,150,50,0.35)]"
              style={{ width: 'clamp(32px,5vw,72px)', height: 'clamp(32px,5vw,72px)' }} />
            {/* 수평선 빛 */}
            <div className="absolute top-1/2 -left-16 -right-16 h-[3px] bg-gradient-to-r from-transparent via-orange-300/50 to-transparent" />
            <div className="absolute top-1/2 -left-10 -right-10 h-[1px] mt-2 bg-gradient-to-r from-transparent via-pink-300/30 to-transparent" />
          </div>
        </div>
        <Cloud left="50%" top="8%" size="sm" delay={0} opacity={0.4} />
      </>
    );
  }

  if (period === 'evening') {
    return (
      <>
        <div className="absolute bottom-[22%] right-[6%] z-[2] pointer-events-none">
          <div className="relative">
            <div className="absolute -inset-8 rounded-full bg-red-400/20 animate-pulse" />
            <div className="absolute -inset-4 rounded-full bg-orange-400/25" />
            <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-full bg-gradient-to-br from-yellow-300 via-orange-500 to-red-600 shadow-[0_0_40px_12px_rgba(255,100,30,0.35)]"
              style={{ width: 'clamp(32px,5vw,72px)', height: 'clamp(32px,5vw,72px)' }} />
            <div className="absolute top-1/2 -left-16 -right-16 h-[3px] bg-gradient-to-r from-transparent via-red-400/50 to-transparent" />
            <div className="absolute top-1/2 -left-10 -right-10 h-[1px] mt-2 bg-gradient-to-r from-transparent via-orange-300/30 to-transparent" />
          </div>
        </div>
        <Cloud left="25%" top="6%" size="md" delay={0} opacity={0.3} />
      </>
    );
  }

  // 밤: 달 + 별
  return (
    <>
      {/* 달 */}
      <div className="absolute top-[5%] right-[10%] z-[2] pointer-events-none">
        <div className="relative">
          <div className="absolute -inset-6 rounded-full bg-blue-200/8" />
          <div className="absolute -inset-3 rounded-full bg-blue-100/5" />
          <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-full bg-gradient-to-br from-gray-50 via-gray-200 to-gray-400 shadow-[0_0_30px_8px_rgba(200,220,255,0.2)] relative overflow-hidden"
            style={{ width: 'clamp(32px,5vw,72px)', height: 'clamp(32px,5vw,72px)' }}>
            {/* 크레이터 */}
            <div className="absolute top-[20%] left-[15%] w-3 h-3 rounded-full bg-gray-400/20" />
            <div className="absolute top-[45%] left-[35%] w-2 h-2 rounded-full bg-gray-400/15" />
            <div className="absolute top-[25%] right-[20%] w-4 h-4 rounded-full bg-gray-400/15" />
            <div className="absolute bottom-[25%] left-[25%] w-2.5 h-2.5 rounded-full bg-gray-400/10" />
            {/* 초승달 그림자 */}
            <div className="absolute inset-0 rounded-full"
              style={{ background: 'radial-gradient(circle at 70% 40%, transparent 35%, rgba(10,15,40,0.55) 65%)' }} />
          </div>
        </div>
      </div>

      {/* 밤하늘 별 (많이) */}
      <div className="absolute inset-0 pointer-events-none z-[1]">
        {[...Array(35)].map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white animate-pulse"
            style={{
              width: `${1 + Math.random() * 1.5}px`,
              height: `${1 + Math.random() * 1.5}px`,
              top: `${Math.random() * 30}%`,
              left: `${3 + Math.random() * 94}%`,
              opacity: 0.3 + Math.random() * 0.6,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${1.5 + Math.random() * 2.5}s`,
            }}
          />
        ))}
        {/* 밝은 별 몇개 (십자 빛) */}
        {[
          { top: '8%', left: '25%' },
          { top: '15%', left: '55%' },
          { top: '5%', left: '75%' },
        ].map((pos, i) => (
          <div key={`bright-${i}`} className="absolute animate-pulse" style={{ ...pos, animationDelay: `${i}s` }}>
            <div className="relative w-2 h-2">
              <div className="absolute inset-0 rounded-full bg-white/80" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1px] h-4 bg-white/30" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-[1px] bg-white/30" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/** 구름 컴포넌트 */
function Cloud({ left, top, size, delay, opacity = 0.6 }: {
  left: string; top: string; size: 'sm' | 'md' | 'lg'; delay: number; opacity?: number;
}) {
  const sizes = {
    sm: { w: 'w-16 sm:w-20', h: 'h-4 sm:h-5' },
    md: { w: 'w-24 sm:w-32', h: 'h-5 sm:h-7' },
    lg: { w: 'w-32 sm:w-44', h: 'h-6 sm:h-9' },
  };
  const s = sizes[size];

  return (
    <div className="absolute z-[2] pointer-events-none" style={{ left, top }}>
      <div className={`relative ${s.w} ${s.h}`}
        style={{
          opacity,
          animation: `cloud-float ${8 + delay}s ease-in-out infinite alternate`,
          animationDelay: `${delay}s`,
        }}>
        <div className="absolute inset-0 rounded-full bg-white/70 blur-[2px]" />
        <div className="absolute -top-[40%] left-[20%] w-[40%] h-[120%] rounded-full bg-white/60 blur-[1px]" />
        <div className="absolute -top-[25%] left-[45%] w-[35%] h-[100%] rounded-full bg-white/50 blur-[1px]" />
      </div>
    </div>
  );
}
