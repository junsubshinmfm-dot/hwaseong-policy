'use client';

import { useState, useEffect } from 'react';

export type TimeOfDay = 'dawn' | 'day' | 'evening' | 'night';

interface TimeInfo {
  period: TimeOfDay;
  hour: number;
  label: string;
}

/** KST(한국시간) 기준 시간대 감지 */
function getKSTTime(): TimeInfo {
  const now = new Date();
  // KST = UTC + 9
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const kst = new Date(utc + 9 * 3600000);
  const hour = kst.getHours();

  if (hour >= 5 && hour < 7) return { period: 'dawn', hour, label: '새벽' };
  if (hour >= 7 && hour < 17) return { period: 'day', hour, label: '낮' };
  if (hour >= 17 && hour < 20) return { period: 'evening', hour, label: '저녁' };
  return { period: 'night', hour, label: '밤' };
}

export function useTimeOfDay() {
  const [time, setTime] = useState<TimeInfo>(getKSTTime);

  useEffect(() => {
    // 1분마다 갱신
    const interval = setInterval(() => {
      setTime(getKSTTime());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return time;
}

/** 시간대별 CSS 오버레이 스타일 */
export const TIME_STYLES: Record<TimeOfDay, {
  overlay: string;
  filter: string;
  glowColor: string;
  bgGradient: string;
}> = {
  dawn: {
    overlay: 'bg-gradient-to-b from-purple-900/30 via-pink-500/15 to-orange-300/20',
    filter: 'brightness(0.75) saturate(0.8) contrast(1.05)',
    glowColor: 'rgba(255, 180, 120, 0.15)',
    bgGradient: 'linear-gradient(to bottom, #2D1B4E 0%, #8B5A6B 40%, #D4956B 100%)',
  },
  day: {
    overlay: '',
    filter: 'brightness(1) saturate(1.05)',
    glowColor: 'rgba(255, 255, 255, 0.1)',
    bgGradient: 'linear-gradient(to bottom, #87CEEB 0%, #B8E4F9 40%, #E8F4FD 100%)',
  },
  evening: {
    overlay: 'bg-gradient-to-b from-orange-600/20 via-amber-500/15 to-red-800/25',
    filter: 'brightness(0.85) saturate(1.15) sepia(0.15)',
    glowColor: 'rgba(255, 140, 50, 0.2)',
    bgGradient: 'linear-gradient(to bottom, #1A2040 0%, #E87722 40%, #F5993D 100%)',
  },
  night: {
    overlay: 'bg-gradient-to-b from-[#0A0E2A]/60 via-[#0D1F4D]/50 to-[#0A0E2A]/60',
    filter: 'brightness(0.45) saturate(0.6) contrast(1.1)',
    glowColor: 'rgba(100, 150, 255, 0.15)',
    bgGradient: 'linear-gradient(to bottom, #060818 0%, #0D1F4D 40%, #0A1230 100%)',
  },
};
