'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { startTracker } from '@/lib/analytics';

export function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname?.startsWith('/admin')) return;

    const handle = startTracker(pathname || '/');
    return () => {
      handle?.stop();
    };
  }, [pathname]);

  return null;
}
