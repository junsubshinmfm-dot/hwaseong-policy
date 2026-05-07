'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { startTracker } from '@/lib/analytics';

export function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // 어드민 패턴 페이지(/admin, /control-*)는 통계 집계 제외
    if (pathname?.startsWith('/admin') || pathname?.startsWith('/control-')) return;

    const handle = startTracker(pathname || '/');
    return () => {
      handle?.stop();
    };
  }, [pathname]);

  return null;
}
