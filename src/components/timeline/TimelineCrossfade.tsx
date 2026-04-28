'use client';

import type { ReactNode } from 'react';
import { useTimeline } from '@/hooks/useTimeline';
import { crossfadeOpacity } from '@/lib/timeline';

interface TimelineCrossfadeProps {
  past: ReactNode;
  future: ReactNode;
  className?: string;
  durationMs?: number;
  /**
   * true(기본)이면 5/21 이전(`revealed=false`)일 때 future 측에 blur 처리.
   * 잠금 배지·아이콘 등 항상 또렷해야 하는 컴포넌트는 false로 둘 것.
   */
  obfuscateFuture?: boolean;
}

/**
 * 좌(2026·시민제안) ↔ 우(2030·공약) cross-fade 래퍼.
 * 두 자식이 같은 자리에 겹쳐 있고, 슬라이더 0~100% 구간에서 페이드 교차.
 */
export default function TimelineCrossfade({
  past,
  future,
  className,
  durationMs = 250,
  obfuscateFuture = true,
}: TimelineCrossfadeProps) {
  const { sliderValue, revealed } = useTimeline();
  const opacity = crossfadeOpacity(sliderValue);
  const transition = `opacity ${durationMs}ms ease-out, filter ${durationMs}ms ease-out`;
  const futureBlur = obfuscateFuture && !revealed ? 'blur(7px)' : 'none';

  return (
    <span className={`inline-grid ${className ?? ''}`} style={{ gridTemplateAreas: '"stack"' }}>
      <span
        style={{ opacity: opacity.past, transition, gridArea: 'stack' }}
        aria-hidden={opacity.past < 0.5}
      >
        {past}
      </span>
      <span
        style={{
          opacity: opacity.future,
          transition,
          gridArea: 'stack',
          filter: futureBlur,
        }}
        aria-hidden={opacity.future < 0.5}
      >
        {future}
      </span>
    </span>
  );
}
