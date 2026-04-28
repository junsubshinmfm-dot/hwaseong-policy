'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  TIMELINE_MIN,
  TIMELINE_MAX,
  clamp,
  detectInitialSliderValue,
  getDaysUntilReveal,
  getPhase,
  interpolateYear,
  isFutureMode,
  isRevealed,
  progress,
  type TimelinePhase,
} from '@/lib/timeline';

interface TimelineContextValue {
  sliderValue: number;
  setSliderValue: (value: number) => void;
  progress: number;
  phase: TimelinePhase;
  futureMode: boolean;
  year: number;
  revealed: boolean;
  daysUntilReveal: number;
}

const TimelineContext = createContext<TimelineContextValue | null>(null);

const STORAGE_KEY = 'timeline-slider-value';

export function TimelineProvider({ children }: { children: ReactNode }) {
  const [sliderValue, setSliderValueRaw] = useState<number>(TIMELINE_MIN);
  const [revealed, setRevealed] = useState<boolean>(() => isRevealed());
  const [daysUntilReveal, setDaysUntilReveal] = useState<number>(() => getDaysUntilReveal());
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    // 1) sessionStorage에 저장된 슬라이더 위치가 있으면 그것을 사용 (페이지 이동 간 유지)
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        const parsed = parseFloat(stored);
        if (!Number.isNaN(parsed)) {
          setSliderValueRaw(parsed);
          return;
        }
      }
    }
    // 2) 그 외엔 도메인 기반 초기값
    setSliderValueRaw(detectInitialSliderValue());
  }, []);

  useEffect(() => {
    if (revealed) return;
    const tick = () => {
      setRevealed(isRevealed());
      setDaysUntilReveal(getDaysUntilReveal());
    };
    tick();
    const interval = setInterval(tick, 60_000);
    return () => clearInterval(interval);
  }, [revealed]);

  const setSliderValue = useCallback((value: number) => {
    const clamped = clamp(value);
    setSliderValueRaw(clamped);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(STORAGE_KEY, String(clamped));
    }
  }, []);

  const value = useMemo<TimelineContextValue>(
    () => ({
      sliderValue,
      setSliderValue,
      progress: progress(sliderValue),
      phase: getPhase(sliderValue),
      futureMode: isFutureMode(sliderValue),
      year: interpolateYear(sliderValue),
      revealed,
      daysUntilReveal,
    }),
    [sliderValue, setSliderValue, revealed, daysUntilReveal],
  );

  return <TimelineContext.Provider value={value}>{children}</TimelineContext.Provider>;
}

export function useTimeline(): TimelineContextValue {
  const ctx = useContext(TimelineContext);
  if (!ctx) {
    throw new Error('useTimeline must be used within TimelineProvider');
  }
  return ctx;
}

export function useTimelineValue<T>(selector: (ctx: TimelineContextValue) => T): T {
  const ctx = useTimeline();
  return selector(ctx);
}

export { TIMELINE_MIN, TIMELINE_MAX };
