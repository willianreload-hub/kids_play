'use client';

/**
 * Primitivas de hidratação SSR do Kids-Player.
 * Substituem o padrão useState + useEffect(localStorage/matchMedia),
 * eliminando os warnings de set-state-in-effect e o risco de snapshot instável.
 */

import { useCallback, useSyncExternalStore } from 'react';

const listeners = new Set<() => void>();
const snapshots = new Map<string, { raw: string | null; value: unknown }>();

function emitChange() {
  listeners.forEach((l) => l());
}

function getSnapshot<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  const cached = snapshots.get(key);
  if (cached && cached.raw === raw) return cached.value as T;
  let value: T = fallback;
  if (raw !== null) {
    try {
      value = JSON.parse(raw) as T;
    } catch {
      value = fallback;
    }
  }
  snapshots.set(key, { raw, value });
  return value;
}

/** Estado persistido em localStorage, hidratado sem setState-in-effect e sem loop de snapshot. */
export function useLocalStorageState<T>(key: string, fallback: T) {
  const subscribe = useCallback((onChange: () => void) => {
    listeners.add(onChange);
    window.addEventListener('storage', onChange);
    return () => {
      listeners.delete(onChange);
      window.removeEventListener('storage', onChange);
    };
  }, []);

  const value = useSyncExternalStore(
    subscribe,
    () => getSnapshot(key, fallback),
    () => fallback
  );

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = getSnapshot(key, fallback);
      const resolved = typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
      const raw = JSON.stringify(resolved);
      localStorage.setItem(key, raw);
      snapshots.set(key, { raw, value: resolved });
      emitChange();
    },
    [key, fallback]
  );

  return [value, setValue] as const;
}

/** matchMedia reativo, sem setState síncrono em effect e seguro para SSR (retorna false no servidor). */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback((onChange: () => void) => {
    const mql = window.matchMedia(query);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false
  );
}
