'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { recordVisitorSession } from '@/lib/analytics';

export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    recordVisitorSession();
  }, [pathname]);

  return null;
}
