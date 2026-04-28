/**
 * 슬라이더 0~100 값 기반 시간 보간 유틸리티
 * 0   = 2026 (시민제안 시점)
 * 100 = 2030 (정명근 공약 시점)
 */

export const TIMELINE_MIN = 0;
export const TIMELINE_MAX = 100;
export const TIMELINE_THRESHOLD = 50;

export const YEAR_PAST = 2026;
export const YEAR_FUTURE = 2030;

export const PLEDGE_COUNT = 50;

export const REVEAL_DATE = new Date('2026-05-21T00:00:00+09:00');

export type TimelinePhase = 'past' | 'transitioning' | 'future';

export function clamp(value: number, min = TIMELINE_MIN, max = TIMELINE_MAX): number {
  return Math.min(Math.max(value, min), max);
}

export function progress(sliderValue: number): number {
  return clamp(sliderValue) / TIMELINE_MAX;
}

export function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

export function lerpRound(from: number, to: number, t: number): number {
  return Math.round(lerp(from, to, t));
}

export function interpolateYear(sliderValue: number): number {
  return Math.round(lerp(YEAR_PAST, YEAR_FUTURE, progress(sliderValue)));
}

export function getPhase(sliderValue: number): TimelinePhase {
  if (sliderValue <= 5) return 'past';
  if (sliderValue >= 95) return 'future';
  return 'transitioning';
}

export function isFutureMode(sliderValue: number): boolean {
  return sliderValue >= TIMELINE_THRESHOLD;
}

export function getDaysUntilReveal(now: Date = new Date()): number {
  const diffMs = REVEAL_DATE.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

export function isRevealed(now: Date = new Date()): boolean {
  return now.getTime() >= REVEAL_DATE.getTime();
}

export function easeInOutCubic(t: number): number {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export interface CrossfadeOpacity {
  past: number;
  future: number;
}

export function crossfadeOpacity(sliderValue: number): CrossfadeOpacity {
  const t = clamp(sliderValue / TIMELINE_MAX, 0, 1);
  return { past: 1 - t, future: t };
}

/**
 * 지도/이미지 클립 비율 (0~1).
 * 슬라이더가 우측으로 간 만큼만 미래 레이어가 좌→우로 드러남.
 */
export function futureClipRatio(sliderValue: number): number {
  return clamp(sliderValue / TIMELINE_MAX, 0, 1);
}

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export function interpolateRgb(from: RGB, to: RGB, t: number): string {
  const tt = clamp(t, 0, 1);
  const r = Math.round(lerp(from.r, to.r, tt));
  const g = Math.round(lerp(from.g, to.g, tt));
  const b = Math.round(lerp(from.b, to.b, tt));
  return `rgb(${r}, ${g}, ${b})`;
}

export const PALETTE_PAST_BG: RGB = { r: 244, g: 245, b: 249 }; // #F4F5F9 차분
export const PALETTE_FUTURE_BG: RGB = { r: 255, g: 244, b: 232 }; // #FFF4E8 희망

export function backgroundForSlider(sliderValue: number): string {
  return interpolateRgb(PALETTE_PAST_BG, PALETTE_FUTURE_BG, sliderValue / TIMELINE_MAX);
}

// 권역별 공약 카운트는 실제 데이터에서 자동 계산.
// @/data/pledges 의 PLEDGE_COUNT_BY_REGION 을 사용할 것.

const FUTURE_HOSTNAMES = [
  // 정명근공약.kr puny code (도메인 등록 후 정확한 값으로 교체 필요)
  'xn--vh3b21llrhomh.kr',
  // 개발/테스트용
  'jmg-vision.local',
];

export function detectInitialSliderValue(hostname?: string): number {
  if (typeof window === 'undefined' && !hostname) return TIMELINE_MIN;
  const host = (hostname ?? window.location.hostname).toLowerCase();

  if (FUTURE_HOSTNAMES.some((h) => host === h || host.endsWith('.' + h))) {
    return TIMELINE_MAX;
  }
  return TIMELINE_MIN;
}
