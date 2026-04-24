'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { startTracker } from '@/lib/analytics';

export function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // 관리자 페이지는 집계에서 제외
    if (pathname?.startsWith('/admin')) return;

    const handle = startTracker();
    return () => {
      handle?.stop();
    };
  }, [pathname]);

  return null;
}
