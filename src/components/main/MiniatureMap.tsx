'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { REGIONS, CATEGORIES, type RegionKey, type CategoryKey } from '@/data/categories';
import regionsData from '@/data/regions.json';
import { useTimeOfDay, TIME_STYLES } from '@/hooks/useTimeOfDay';
import { useSuggestionsByRegion } from '@/hooks/useSuggestions';
import { useWeather } from '@/hooks/useWeather';
import { useTimeline } from '@/hooks/useTimeline';
import { futureClipRatio } from '@/lib/timeline';
import { pledgesByRegion, PLEDGE_COUNT_BY_REGION } from '@/data/pledges';
import TimelineCrossfade from '@/components/timeline/TimelineCrossfade';
import PledgeRevealNotice from '@/components/timeline/PledgeRevealNotice';
import WeatherEffects from './WeatherEffects';
import SkyBody from './SkyBody';
import MayorCharacter from './MayorCharacter';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';
const CITY_IMAGE: string | null = `${BASE}/images/miniature-city.png`;
const CITY_IMAGE_FUTURE: string | null = `${BASE}/images/miniature-city-2030.png`;
// 임시 미래 톤은 자산이 없을 때만 사용 (CITY_IMAGE_FUTURE가 있으면 무시됨)
const FUTURE_PREVIEW_FILTER = '';

/**
 * 권역별 SVG 다각형 좌표 (% 기준)
 * 실제 화성시 지도 기준:
 *   1권역 만세구: 좌측 넓은 영역 (서쪽~남서쪽)
 *   2권역 효행구: 상단 중앙 (북쪽)
 *   3권역 병점구: 우상단 (북동쪽)
 *   4권역 동탄구: 우하단 (남동쪽, 가장 큰 인구)
 */
const REGION_POLYGONS: Record<RegionKey, {
  points: string;
  labelX: number; labelY: number;
}> = {
  /*
   * 이미지 픽셀 분석으로 추출한 섬 외곽 72포인트 기반
   * 분할선: x=32, x=50, x=72
   * 교차점: x=32 → y=24.8, 83.0 / x=50 → y=28.3, 85.1 / x=72 → y=19.4, 82.6
   */

  // 1권역 만세구 (x < 32): 좌측 외곽 + x=32 수직선
  manse: {
    points: '27.7,23.4 24.1,24.1 20.8,25.5 18.5,27.9 18.0,31.5 16.8,34.5 15.7,37.5 12.4,39.9 9.4,42.8 4.9,46.0 10.7,50.0 10.0,53.5 7.1,57.6 8.0,61.2 9.8,64.6 8.3,69.4 12.5,71.7 16.2,73.7 19.7,75.4 20.0,80.0 23.4,81.6 28.4,80.9 31.0,82.9 32,83.0 32,24.8',
    labelX: 19, labelY: 52,
  },
  // 2권역 효행구 (32 < x < 50): x=32 ~ x=50
  hyohaeng: {
    points: '32,24.8 32.4,24.9 35.4,24.7 38.7,25.7 39.7,21.6 43.1,24.4 46.1,28.0 47.9,26.6 50,28.3 50,85.1 46.9,85.2 44.0,83.8 41.3,82.5 38.0,83.1 34.4,83.4 32,83.0',
    labelX: 41, labelY: 52,
  },
  // 3권역 병점구 (50 < x < 72): x=50 ~ x=72
  byeongjeom: {
    points: '50,28.3 51.9,29.0 54.0,27.7 56.8,24.5 59.9,22.8 63.1,21.9 66.2,21.9 71.2,19.7 72,19.4 72,82.6 69.6,84.0 66.4,85.1 62.2,83.5 58.2,80.5 55.0,78.4 52.9,83.3 50,85.1',
    labelX: 61, labelY: 52,
  },
  // 4권역 동탄구 (x > 72): 우측 외곽 + x=72 수직선
  dongtan: {
    points: '72,19.4 77.1,17.7 83.0,17.0 83.8,21.6 88.5,23.0 91.9,25.8 92.5,30.2 94.4,33.8 96.1,37.6 96.6,41.8 93.3,46.2 93.3,50.0 88.6,53.4 83.9,56.0 87.7,60.1 91.6,65.1 92.1,69.6 89.2,72.6 85.4,74.8 82.0,76.9 78.7,78.7 75.6,80.5 72.6,82.2 72,82.6',
    labelX: 83, labelY: 48,
  },
};

const regionKeys: RegionKey[] = ['dongtan', 'byeongjeom', 'manse', 'hyohaeng'];

const categoryIcons: Record<string, string> = {
  traffic: '\u{1F687}', welfare: '\u{1F3E5}', education: '\u{1F4DA}', economy: '\u{1F4B0}',
  environment: '\u{1F333}', safety: '\u{1F6E1}', culture: '\u{1F3AD}', housing: '\u{1F3E0}', admin: '\u{1F3DB}',
};

export default function MiniatureMap() {
  const router = useRouter();
  const time = useTimeOfDay();
  const weather = useWeather();
  const timeStyle = TIME_STYLES[time.period];
  const scrollRef = useRef<HTMLDivElement>(null);
  const { sliderValue, revealed, futureMode } = useTimeline();
  const futureRatio = futureClipRatio(sliderValue);
  // 미래 레이어가 좌→우로 채워짐. 우측은 (1 - ratio)% 만큼 잘라냄.
  const futureClipRight = (1 - futureRatio) * 100;
  const futureSrc = CITY_IMAGE_FUTURE ?? CITY_IMAGE;
  const baseFutureFilter = CITY_IMAGE_FUTURE
    ? timeStyle.filter
    : `${timeStyle.filter ?? ''} ${FUTURE_PREVIEW_FILTER}`.trim();
  // 5/21 이전엔 미래 레이어를 흐리게 (티저 모드)
  const futureFilter = revealed ? baseFutureFilter : `${baseFutureFilter} blur(8px)`;
  const showClipLine = sliderValue > 1 && sliderValue < 99;

  const [hovered, setHovered] = useState<RegionKey | null>(null);
  const [selected, setSelected] = useState<RegionKey | null>(null);

  const handleRegionClick = useCallback((id: RegionKey) => {
    setSelected((prev) => (prev === id ? null : id));
  }, []);

  const { suggestions: selectedSuggestions } = useSuggestionsByRegion(selected || 'dongtan');
  // 슬라이더 우측(2030)일 땐 더미 공약 카드, 좌측(2026)일 땐 시민제안 카드
  const selectedPledges = useMemo(
    () => (selected ? pledgesByRegion(selected) : []),
    [selected],
  );
  const cardsToShow = futureMode ? selectedPledges : selectedSuggestions;
  const selectedRegion = selected ? REGIONS[selected] : null;
  const hoveredRegion = hovered ? REGIONS[hovered] : null;
  const hoveredInfo = hovered ? regionsData.find((r) => r.id === hovered) : null;

  // 마우스 드래그 스크롤
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);
  const dragMoved = useRef(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      dragMoved.current = false;
      dragStartX.current = e.pageX - el.offsetLeft;
      dragScrollLeft.current = el.scrollLeft;
      el.style.cursor = 'grabbing';
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const walk = (x - dragStartX.current) * 1.5;
      if (Math.abs(walk) > 5) dragMoved.current = true;
      el.scrollLeft = dragScrollLeft.current - walk;
    };
    const onMouseUp = () => {
      isDragging.current = false;
      el.style.cursor = 'grab';
    };

    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [selected]);

  return (
    <div className="w-full">
      {/* SNS 링크 */}
      <div className="mb-2 sm:mb-3 px-1">
        <p className="text-navy font-bold text-xs sm:text-sm mb-1.5">정명근 SNS 바로가기</p>
        <div className="flex items-center gap-2 sm:gap-3">
          {/* 페이스북 */}
          <a href="https://www.facebook.com/mg0628?locale=ko_KR" target="_blank" rel="noopener noreferrer"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center bg-[#1877F2] hover:scale-110 transition-transform shadow-sm">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </a>
          {/* 인스타그램 */}
          <a href="https://www.instagram.com/mg0628_/" target="_blank" rel="noopener noreferrer"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] hover:scale-110 transition-transform shadow-sm">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
          </a>
          {/* 유튜브 */}
          <a href="https://www.youtube.com/@JungmgTV" target="_blank" rel="noopener noreferrer"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center bg-[#FF0000] hover:scale-110 transition-transform shadow-sm">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </a>
          {/* 네이버블로그 */}
          <a href="https://blog.naver.com/hwaseong_mg" target="_blank" rel="noopener noreferrer"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center bg-[#03C75A] hover:scale-110 transition-transform shadow-sm overflow-hidden">
            <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 48 48" fill="none">
              {/* 말풍선 */}
              <path d="M8 8h32v24a4 4 0 01-4 4H22l-8 8v-8h-2a4 4 0 01-4-4V12a4 4 0 014-4z" fill="white" />
              {/* blog 텍스트 */}
              <text x="11" y="27" fontFamily="Arial, sans-serif" fontSize="11" fontWeight="900" fill="#F58220">blog</text>
            </svg>
          </a>

          {/* 공명선거감시단 — SNS 행 우측 (PC/모바일 공통) */}
          <a
            href="https://watch-hwaseong-production.up.railway.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-navy text-white text-[11px] sm:text-xs font-bold
                       border border-orange/30 shadow-sm hover:bg-navy-dark active:scale-95 transition-all"
            aria-label="공명선거감시단 사이트로 이동"
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            공명선거감시단
            <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 opacity-70 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>

      {/* ── 메인 미니어처 뷰 ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="relative rounded-2xl overflow-hidden shadow-xl border border-navy/10"
      >
        <div className="absolute inset-0 transition-all duration-[3000ms]" style={{ background: timeStyle.bgGradient }} />
        {/* 해/달 */}
        <SkyBody period={time.period} />

        <div className="relative w-full aspect-square">
          {CITY_IMAGE ? (
            <>
              {/* 2026 베이스 레이어 */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={CITY_IMAGE} alt="화성특례시 미니어처 (현재)"
                className="absolute inset-0 w-full h-full object-cover transition-all duration-[3000ms]"
                style={{ filter: timeStyle.filter }} />

              {/* 2030 미래 레이어 — 슬라이더가 우측으로 간 만큼 좌→우로 드러남 */}
              {futureSrc && futureRatio > 0 && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={futureSrc}
                  alt="화성특례시 미니어처 (2030)"
                  aria-hidden={futureRatio < 0.5}
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  style={{
                    filter: futureFilter,
                    clipPath: `inset(0 ${futureClipRight}% 0 0)`,
                  }}
                />
              )}

              {/* 클립 가이드 라인 (슬라이더 위치) */}
              {showClipLine && (
                <div
                  className="absolute top-0 bottom-0 w-[2px] bg-white/70 shadow-[0_0_8px_rgba(255,255,255,0.6)] pointer-events-none z-[7]"
                  style={{ left: `${sliderValue}%` }}
                />
              )}
            </>
          ) : (
            <PlaceholderCity time={time.period} />
          )}

          {timeStyle.overlay && (
            <div className={`absolute inset-0 transition-all duration-[3000ms] ${timeStyle.overlay}`} />
          )}
          <WeatherEffects type={weather.type} />
          {time.period === 'night' && (
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 50% 60%, rgba(253,224,71,0.06) 0%, transparent 50%)' }} />
          )}

          {/* 정명근 도트 캐릭터 - 지도 위를 자유롭게 뛰어다님 (오버레이 열렸을 때는 비활성) */}
          <MayorCharacter disabled={!!selected} />

          {/* 권역 SVG 다각형 오버레이 */}
          <svg className="absolute inset-0 w-full h-full z-[6]" viewBox="0 0 100 100" preserveAspectRatio="none">
            {regionKeys.map((id) => {
              const poly = REGION_POLYGONS[id];
              const region = REGIONS[id];
              const isHovered = hovered === id;
              const isSelected = selected === id;

              return (
                <polygon
                  key={id}
                  points={poly.points}
                  className="cursor-pointer transition-all duration-300"
                  fill={isSelected ? `${region.color}40` : isHovered ? `${region.color}25` : 'transparent'}
                  stroke="transparent"
                  strokeWidth={0}
                  onMouseEnter={() => setHovered(id)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => handleRegionClick(id)}
                />
              );
            })}
          </svg>

          {/* 권역 라벨 */}
          {regionKeys.map((id) => {
            const poly = REGION_POLYGONS[id];
            const region = REGIONS[id];
            const isHovered = hovered === id;
            const isSelected = selected === id;

            return (
              <div key={`label-${id}`}
                className="absolute pointer-events-none z-[7] -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${poly.labelX}%`, top: `${poly.labelY}%` }}
              >
                <motion.div animate={{ scale: isSelected ? 1.15 : isHovered ? 1.1 : 1, y: isSelected || isHovered ? -3 : 0 }}
                  transition={{ duration: 0.2 }} className="text-center">
                  <div className="inline-block px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl text-white text-[10px] sm:text-sm font-extrabold shadow-lg transition-all duration-300"
                    style={{
                      backgroundColor: isSelected ? region.color : isHovered ? region.color : `${region.color}CC`,
                      boxShadow: isSelected ? `0 4px 24px ${region.color}50` : `0 2px 8px rgba(0,0,0,0.2)`,
                    }}>
                    {region.label}
                  </div>
                  <div className="mt-0.5 sm:mt-1 text-[9px] sm:text-xs font-bold"
                    style={{
                      color: time.period === 'night' ? 'rgba(255,255,255,0.7)' : 'rgba(26,59,143,0.7)',
                      textShadow: time.period === 'night' ? '0 1px 4px rgba(0,0,0,0.8)' : '0 1px 4px rgba(255,255,255,0.8)',
                    }}>
                    <TimelineCrossfade
                      past={<span>제안 보기</span>}
                      future={<span>공약 보기</span>}
                    />
                  </div>
                </motion.div>
              </div>
            );
          })}

          {/* ══════════ 공약 오버레이 (풀스크린) ══════════ */}
          <AnimatePresence>
            {selected && selectedRegion && (
              <motion.div
                key={`overlay-${selected}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 z-[8] flex flex-col"
                onClick={() => setSelected(null)}
              >
                {/* 어두운 배경 */}
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />

                {/* 상단 헤더 */}
                <div className="relative z-10 flex items-center justify-between px-2 sm:px-4 pt-2 sm:pt-4"
                  onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-1.5 sm:gap-2.5">
                    <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shadow-lg" style={{ backgroundColor: selectedRegion.color }} />
                    <span className="text-white font-extrabold text-sm sm:text-lg drop-shadow">{selectedRegion.label}</span>
                    <span className="text-white/50 text-xs sm:text-sm font-bold">
                      <TimelineCrossfade
                        past={<span>{selectedSuggestions.length}개 제안</span>}
                        future={<span>{PLEDGE_COUNT_BY_REGION[selected] ?? 0}개 공약</span>}
                      />
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      onClick={() => router.push(`/region/${selected}`)}
                      className="px-2.5 py-1 sm:px-4 sm:py-1.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold text-white transition-all hover:scale-105"
                      style={{ backgroundColor: selectedRegion.color, boxShadow: `0 4px 16px ${selectedRegion.color}50` }}
                    >
                      자세히 보기
                    </button>
                    <button onClick={() => setSelected(null)}
                      className="w-9 h-9 sm:w-8 sm:h-8 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors">
                      <svg className="w-5 h-5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* 카드 캐러셀 — 드래그 + 5개 보임 (양끝 잘림) */}
                <div className="relative z-10 flex-1 flex items-center overflow-hidden">
                  {futureMode && !revealed ? (
                    <div className="w-full px-6 sm:px-12 flex items-center justify-center"
                         onClick={(e) => e.stopPropagation()}>
                      <PledgeRevealNotice variant="modal" regionLabel={selectedRegion?.label} />
                    </div>
                  ) : (
                  <div ref={scrollRef}
                    onClick={(e) => e.stopPropagation()}
                    className="flex gap-2 sm:gap-3 overflow-x-auto py-1 sm:py-2 scrollbar-hide items-center w-full cursor-grab select-none"
                    style={{
                      height: 'clamp(180px, 45%, 500px)',
                      paddingLeft: '8%',
                      paddingRight: '8%',
                    }}
                  >
                    {/* 제안하기 카드 — 시민제안 모드(2026)에서만 노출 */}
                    {!futureMode && (
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                        className="shrink-0"
                        style={{ width: 'calc(24% - 10px)', minWidth: '140px' }}
                      >
                        <div
                          className="h-full bg-gradient-to-br from-orange to-orange-dark rounded-2xl overflow-hidden shadow-2xl
                                     hover:scale-[1.03] hover:-translate-y-2 transition-all duration-300
                                     border border-white/30 flex flex-col items-center justify-center cursor-pointer p-4"
                          onClick={() => router.push('/suggestions/new')}
                        >
                          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-3">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                          </div>
                          <p className="text-white font-bold text-sm text-center">정책 제안하기</p>
                          <p className="text-white/60 text-[10px] text-center mt-1">이 지역에 필요한 정책을 제안해주세요</p>
                        </div>
                      </motion.div>
                    )}
                    {cardsToShow.map((suggestion, i) => {
                      const catColor = CATEGORIES[suggestion.category as CategoryKey]?.color || '#1A3B8F';

                      return (
                        <motion.div
                          key={suggestion.id}
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35, delay: i * 0.03 }}
                          className="shrink-0"
                          style={{ width: 'calc(24% - 10px)', minWidth: '140px' }}
                        >
                          <div
                            className="h-full bg-white rounded-2xl overflow-hidden shadow-2xl
                                       hover:scale-[1.03] hover:-translate-y-2 transition-all duration-300
                                       border border-white/30 flex flex-col"
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                              if (dragMoved.current) return;
                              router.push(`/region/${selected}?suggestion=${suggestion.id}`);
                            }}
                          >
                            <div className="h-2 flex shrink-0">
                              <div className="flex-1" style={{ backgroundColor: catColor }} />
                              <div className="w-8 bg-orange" />
                            </div>

                            <div className="relative shrink-0 h-16 sm:h-28 md:h-48">
                              <div className="absolute inset-0"
                                style={{ background: `linear-gradient(135deg, ${catColor}08 0%, ${catColor}22 100%)` }} />
                              <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full border-[3px] opacity-10"
                                style={{ borderColor: catColor }} />
                              <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-15">
                                {categoryIcons[suggestion.category] || '\u{1F4CB}'}
                              </div>
                              <div className="absolute top-3 left-3 px-2 py-0.5 rounded-lg text-[10px] font-bold text-white bg-orange shadow-lg">
                                <TimelineCrossfade
                                  past={<span>시민제안</span>}
                                  future={<span>공약</span>}
                                />
                              </div>
                              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg text-xs font-bold"
                                style={{ backgroundColor: `${catColor}18`, color: catColor }}>
                                {CATEGORIES[suggestion.category as CategoryKey]?.label}
                              </div>
                              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent" />
                            </div>

                            <div className="px-3.5 pb-3 pt-1 flex-1 flex flex-col">
                              <h4 className="text-navy font-extrabold text-[11px] sm:text-sm mb-1 sm:mb-1.5 line-clamp-1 sm:line-clamp-2 leading-snug">
                                {suggestion.title}
                              </h4>
                              <p className="text-navy/35 text-[10px] sm:text-xs line-clamp-1 sm:line-clamp-3 leading-relaxed flex-1">
                                {suggestion.content}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                  )}

                  {/* 좌우 잘림 페이드 — 5/21 전 안내 박스 모드에선 숨김 */}
                  {!(futureMode && !revealed) && (
                    <>
                      <div className="absolute top-0 left-0 bottom-0 w-[8%] bg-gradient-to-r from-black/60 to-transparent pointer-events-none z-[1]" />
                      <div className="absolute top-0 right-0 bottom-0 w-[8%] bg-gradient-to-l from-black/60 to-transparent pointer-events-none z-[1]" />
                    </>
                  )}
                </div>

                {/* 하단 닫기 안내 */}
                <div className="relative z-10 py-4 text-center">
                  <p className="text-white/30 text-xs">빈 영역을 터치하면 닫힙니다</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 호버 정보 바 */}
          <AnimatePresence>
            {hovered && hoveredRegion && !selected && (
              <motion.div key="info-bar" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
                transition={{ duration: 0.2 }} className="absolute bottom-0 left-0 right-0 z-10">
                <div className="mx-3 mb-3 px-4 py-3 rounded-xl bg-white/90 backdrop-blur-md shadow-lg border border-navy/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: hoveredRegion.color }} />
                    <span className="text-navy font-extrabold">{hoveredRegion.label}</span>
                    <span className="text-navy/40 text-sm">{hoveredInfo && `${(hoveredInfo.stats.population.total / 10000).toFixed(1)}만명`}</span>
                  </div>
                  <span className="text-orange font-bold text-sm">클릭하여 보기</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

function PlaceholderCity({ time }: { time: string }) {
  const isNight = time === 'night';
  const isEvening = time === 'evening';
  const groundColor = isNight ? '#1a2040' : isEvening ? '#6B7B55' : '#5A8A3C';
  return (
    <div className="absolute inset-0 flex items-end justify-center overflow-hidden">
      <div className="absolute bottom-0 left-0 right-0 h-[35%] rounded-t-[50%] transition-all duration-[3000ms]"
        style={{ background: `radial-gradient(ellipse at 50% 100%, ${groundColor} 0%, ${groundColor}DD 60%, transparent 100%)` }} />
      <div className="absolute bottom-[15%] left-1/2 -translate-x-1/2 w-[65%] h-[30%] rounded-full border-2 transition-all duration-[3000ms]"
        style={{ borderColor: isNight ? '#333' : '#9E9E9E' }} />
      <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-[45%] h-[20%] rounded-full border-2 transition-all duration-[3000ms]"
        style={{ borderColor: isNight ? '#2a2a3a' : '#BDBDBD' }} />
      <BuildingGroup left="12%" bottom="28%" heights={[40, 65, 50, 35]} color="#E88544" isNight={isNight} />
      <BuildingGroup left="60%" bottom="28%" heights={[55, 80, 60, 45, 70]} color="#2B6FD4" isNight={isNight} />
      <div className="absolute transition-all duration-[3000ms]" style={{ left: '18%', bottom: '12%' }}>
        <div className="flex items-end gap-2">
          {[28, 35, 22, 30].map((h, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="rounded-full transition-all duration-[3000ms]"
                style={{ width: `${h * 0.5}px`, height: `${h}px`, backgroundColor: isNight ? '#1B3520' : '#38A169' }} />
              <div className="w-1.5 h-2 bg-amber-800/60 rounded-b" />
            </div>
          ))}
        </div>
      </div>
      <BuildingGroup left="58%" bottom="10%" heights={[35, 50, 40, 55, 30]} color="#7B5FBF" isNight={isNight} />
      <div className="absolute left-1/2 -translate-x-1/2 bottom-[22%] z-[2]">
        <div className="flex flex-col items-center">
          <div className="w-3 h-3 rounded-full transition-all duration-[3000ms]" style={{ backgroundColor: isNight ? '#F5822080' : '#F58220' }} />
          <div className="w-6 transition-all duration-[3000ms] rounded-t" style={{ height: '50px', backgroundColor: isNight ? '#1A3B8F90' : '#1A3B8F' }} />
          <div className="w-10 h-3 rounded transition-all duration-[3000ms]" style={{ backgroundColor: isNight ? '#15306090' : '#152F73' }} />
          {isNight && <div className="absolute top-3 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-yellow-300/80 rounded-full animate-pulse" />}
        </div>
      </div>
    </div>
  );
}

function BuildingGroup({ left, bottom, heights, color, isNight }: {
  left: string; bottom: string; heights: number[]; color: string; isNight: boolean;
}) {
  return (
    <div className="absolute flex items-end gap-1 transition-all duration-[3000ms]" style={{ left, bottom }}>
      {heights.map((h, i) => (
        <div key={i} className="relative rounded-t-sm transition-all duration-[3000ms]"
          style={{ width: `${8 + i * 2}px`, height: `${h}px`, backgroundColor: isNight ? `${color}70` : `${color}B0` }}>
          {isNight && h > 35 && (
            <div className="absolute inset-x-0 top-2 flex flex-col gap-2 items-center">
              {[...Array(Math.floor(h / 20))].map((_, j) => (
                <div key={j} className="w-1 h-1 rounded-full animate-pulse"
                  style={{ backgroundColor: `rgba(253,224,71,${0.4 + Math.random() * 0.5})`, animationDelay: `${j * 0.5}s` }} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
