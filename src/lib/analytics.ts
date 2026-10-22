/**
 * Analytics ético do Kids-Player (Fase 5.3) — first-party, dentro do próprio Supabase.
 *
 * Princípios (LGPD/ECA Digital):
 *  - ZERO cookies, ZERO fingerprinting, ZERO PII (nada de IP, agente, dispositivo);
 *  - Cada evento guarda apenas: tipo + caminho da página + instante;
 *  - Fire-and-forget: falhas são silenciosas e nunca afetam a experiência da criança;
 *  - A tabela é write-only via API (leitura agregada só via SQL no painel).
 */

import { supabase, isSupabaseConfigured } from './supabase';

export type AnalyticsEventType =
  | 'page_view'
  | 'signup'
  | 'login'
  | 'conto_concluido'
  | 'turma_entrada'
  | 'vila_visitada';

const MAX_PATH_LENGTH = 120;

/** Registra um evento de funil sem nenhum dado pessoal (fire-and-forget). */
export function trackEvent(eventType: AnalyticsEventType, pagePath?: string): void {
  if (!isSupabaseConfigured) return;
  try {
    // Só o caminho limpo da página — query strings e hashes são descartados
    const cleanPath = (pagePath || '/').split('?')[0].split('#')[0].slice(0, MAX_PATH_LENGTH);
    supabase
      .from('analytics_events')
      .insert({ event_type: eventType, page_path: cleanPath })
      .then(() => undefined, () => undefined);
  } catch {
    // Silêncio absoluto: analytics nunca quebra o jogo
  }
}
