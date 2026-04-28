'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useTimeline } from '@/hooks/useTimeline';
import { TIMELINE_MAX, TIMELINE_MIN, YEAR_FUTURE, YEAR_PAST } from '@/lib/timeline';

export default function TimelineSlider() {
  const { sliderValue, setSliderValue, year, futureMode, revealed, daysUntilReveal } = useTimeline();
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const updateFromClientX = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const ratio = (clientX - rect.left) / rect.width;
      setSliderValue(ratio * TIMELINE_MAX);
    },
    [setSliderValue],
  );

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      e.preventDefault();
      updateFromClientX(e.clientX);
    };
    const handleUp = () => {
      draggingRef.current = false;
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
    };
  }, [updateFromClientX]);

  const handlePointerDown = (e: React.PointerEvent) => {
    draggingRef.current = true;
    updateFromClientX(e.clientX);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 5;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setSliderValue(sliderValue - step);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setSliderValue(sliderValue + step);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setSliderValue(TIMELINE_MIN);
    } else if (e.key === 'End') {
      e.preventDefault();
      setSliderValue(TIMELINE_MAX);
    }
  };

  const fillPercent = sliderValue;

  return (
    <div className="absolute top-[60px] sm:top-[68px] left-0 right-0 z-40">
      <div className="relative backdrop-blur-md border-b border-navy-100/40 shadow-[0_12px_32px_-16px_rgba(13,31,77,0.22)]
                     bg-gradient-to-r from-navy/[0.04] via-white/95 to-orange/[0.06]">
        {/* 좌측 navy accent bar (시민제안) */}
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-navy via-navy/70 to-navy/20" />
        {/* 우측 orange accent bar (공약) */}
        <div className="absolute right-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-orange via-orange/70 to-orange/20" />
        {/* 미세 도트 패턴 오버레이 */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #1A3B8F 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        />
        <div className="relative max-w-[1400px] mx-auto px-3 sm:px-8 pt-7 pb-3 sm:pt-8 sm:pb-4">
          {/* 모바일: D-카운트다운 별도 줄 */}
          {!revealed && (
            <p className="sm:hidden text-center text-[11px] text-navy/80 font-bold leading-none mb-2 inline-flex w-full items-center justify-center gap-1">
              <LockIcon className="w-3 h-3 text-orange" />
              정명근 공약 공개까지 <span className="text-orange font-black">D-{daysUntilReveal}</span>
            </p>
          )}

          <div className="flex items-center gap-2 sm:gap-8">
            {/* D-카운트다운 (데스크톱 인라인) */}
            {!revealed && (
              <span className="hidden sm:inline-flex shrink-0 items-center gap-1.5 text-xl leading-none whitespace-nowrap">
                <LockIcon className="w-5 h-5 text-orange" />
                <span className="text-navy/80 font-bold">정명근 공약 공개까지</span>
                <span className="text-orange font-black">D-{daysUntilReveal}</span>
              </span>
            )}

            {/* 좌측 라벨 — 2026 (박스 디자인, 모바일 컴팩트) */}
            <button
              onClick={() => setSliderValue(TIMELINE_MIN)}
              className={`shrink-0 flex flex-col items-start gap-0.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border transition-all
                          ${
                            futureMode
                              ? 'opacity-50 border-navy-100/30 bg-white/50 hover:opacity-80'
                              : 'opacity-100 border-navy/30 bg-white shadow-sm hover:shadow-md'
                          }`}
              aria-label="2026년으로 이동"
            >
              <span className="text-sm sm:text-xl font-black text-navy leading-none">
                {YEAR_PAST}
              </span>
              <span className="text-[9px] sm:text-xs text-navy/60 font-bold leading-tight tracking-wide">
                시민제안
              </span>
            </button>

            {/* 슬라이더 트랙 */}
            <div className="flex-1 relative">
              <div
                ref={trackRef}
                onPointerDown={handlePointerDown}
                role="slider"
                tabIndex={0}
                aria-valuemin={TIMELINE_MIN}
                aria-valuemax={TIMELINE_MAX}
                aria-valuenow={Math.round(sliderValue)}
                aria-label="시간 슬라이더 (2026 ↔ 2030)"
                onKeyDown={handleKeyDown}
                className="relative h-10 cursor-grab active:cursor-grabbing select-none touch-none focus:outline-none"
              >
                {/* 트랙 배경 — 좌측 navy 톤, 우측 orange 톤 그라데이션 */}
                <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-2.5 bg-gradient-to-r from-navy/15 via-navy-50 to-orange/15 rounded-full overflow-hidden shadow-inner">
                  {/* 진행 바 (orange) — 즉시 반응 */}
                  <div
                    className="h-full bg-gradient-to-r from-orange via-orange/85 to-orange/65 rounded-full shadow-[inset_0_1px_2px_rgba(255,255,255,0.3)]"
                    style={{ width: `${fillPercent}%` }}
                  />
                </div>

                {/* 분기점 마커 (25/50/75%) */}
                <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-px h-2 bg-navy/15" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-3 bg-navy/25" />
                <div className="absolute top-1/2 left-3/4 -translate-x-1/2 -translate-y-1/2 w-px h-2 bg-navy/15" />

                {/* 핸들 — 시계화 / 즉시 반응 */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none"
                  style={{ left: `${fillPercent}%` }}
                >
                  <div className="relative">
                    {/* 외곽 글로우 ring */}
                    <div className="absolute inset-0 rounded-full bg-orange/20 blur-md scale-150" />
                    {/* 핸들 본체 */}
                    <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white border-[3px] border-orange shadow-[0_4px_14px_rgba(245,130,32,0.45)] flex items-center justify-center">
                      <ClockIcon className="w-5 h-5 sm:w-6 sm:h-6 text-orange" />
                    </div>
                    {/* 핸들 위 연도 라벨 — 박스 디자인 */}
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-lg bg-navy text-white text-[11px] sm:text-xs font-black whitespace-nowrap shadow-md
                                    after:content-[''] after:absolute after:bottom-[-3px] after:left-1/2 after:-translate-x-1/2
                                    after:border-l-[4px] after:border-r-[4px] after:border-t-[4px]
                                    after:border-l-transparent after:border-r-transparent after:border-t-navy">
                      {year}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 우측 라벨 — 2030 (박스 디자인, 모바일 컴팩트) */}
            <button
              onClick={() => setSliderValue(TIMELINE_MAX)}
              className={`shrink-0 flex flex-col items-end gap-0.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border transition-all
                          ${
                            futureMode
                              ? 'opacity-100 border-orange/40 bg-orange/5 shadow-sm hover:shadow-md'
                              : 'opacity-50 border-orange/20 bg-white/50 hover:opacity-80'
                          }`}
              aria-label="2030년으로 이동"
            >
              <span className="text-sm sm:text-xl font-black text-navy leading-none">
                {YEAR_FUTURE}
              </span>
              <span className="text-[9px] sm:text-xs text-orange font-bold leading-tight tracking-wide">
                정명근 공약
              </span>
            </button>
          </div>

          {/* 슬라이더 안내 문구 */}
          <p className="mt-2 text-center text-[11px] sm:text-xs text-navy/55 font-medium">
            <span className="text-orange font-bold">시계 모양</span>을 오른쪽으로 옮기면
            정책제안 사이트가 <span className="text-orange font-bold">공약 사이트</span>로 바뀝니다
          </p>
        </div>
      </div>
    </div>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17 9V7a5 5 0 00-10 0v2H5v13h14V9h-2zm-8-2a3 3 0 016 0v2H9V7zm8 13H7V11h10v9z" />
    </svg>
  );
}
