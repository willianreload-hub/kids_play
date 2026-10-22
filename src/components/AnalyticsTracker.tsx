'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackEvent } from '../lib/analytics';

/**
 * Registra a navegação como eventos de funil agregados (analytics ético:
 * apenas caminho + instante, sem nenhum dado pessoal).
 */
export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) trackEvent('page_view', pathname);
  }, [pathname]);

  return null;
}
