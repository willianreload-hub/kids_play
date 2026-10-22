-- ==============================================================================
-- KIDS-PLAYER — MIGRAÇÃO FASE 5.3: ANALYTICS ÉTICO (FIRST-PARTY)
--
-- PRINCÍPIOS (LGPD/ECA): zero cookies, zero fingerprinting, zero PII.
-- Cada evento guarda apenas: tipo, caminho da página e instante. Nada de IP,
-- agente de usuário, identificadores de dispositivo ou qualquer dado pessoal.
-- A tabela é WRITE-ONLY: qualquer sessão pode gravar eventos, nenhuma pode ler
-- (a leitura agregada é feita por SQL no painel do banco).
--
-- Idempotente: pode rodar mais de uma vez.
-- Como rodar: Supabase -> SQL Editor -> cole TODO este arquivo -> Run.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(40) NOT NULL,   -- 'page_view', 'signup', 'login', 'conto_concluido', 'turma_entrada'
    page_path VARCHAR(120),            -- '/jogos/matematica' (sem query strings)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_type_created
    ON public.analytics_events (event_type, created_at);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Escrita anônima: qualquer visitante gera eventos de funil, sem identificá-lo
DROP POLICY IF EXISTS "Eventos anônimos de funil" ON public.analytics_events;
CREATE POLICY "Eventos anônimos de funil"
    ON public.analytics_events FOR INSERT
    WITH CHECK (true);

-- Leitura: NENHUMA via API. Painel do Supabase (SQL) faz as agregações.
-- (Nenhuma política de SELECT — a tabela é write-only via REST.)

-- ==============================================================================
-- Consultas prontas para o painel SQL (copie quando quiser):
--
-- Funil de visita -> cadastro (últimos 30 dias):
--   SELECT count(*) FILTER (WHERE event_type = 'page_view') AS visitas,
--          count(*) FILTER (WHERE event_type = 'signup')   AS cadastros
--   FROM public.analytics_events
--   WHERE created_at > NOW() - INTERVAL '30 days';
--
-- Páginas mais visitadas (últimos 7 dias):
--   SELECT page_path, count(*) AS visitas
--   FROM public.analytics_events
--   WHERE event_type = 'page_view' AND created_at > NOW() - INTERVAL '7 days'
--   GROUP BY page_path ORDER BY visitas DESC LIMIT 20;
-- ==============================================================================
