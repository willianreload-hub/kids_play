-- ==============================================================================
-- KIDS-PLAYER — MIGRAÇÃO FASE 5.2: LGPD v2 (TERMO DE USO VERSIONADO)
-- Registra qual versão dos Termos de Uso o responsável legal aceitou,
-- permitindo solicitar re-aceitação quando uma nova versão entra no ar.
-- Idempotente: pode rodar mais de uma vez.
-- Como rodar: Supabase -> SQL Editor -> cole TODO este arquivo -> Run.
-- ==============================================================================

ALTER TABLE public.guardians
    ADD COLUMN IF NOT EXISTS accepted_terms_version INT NOT NULL DEFAULT 1;

ALTER TABLE public.guardians
    ADD COLUMN IF NOT EXISTS accepted_terms_updated_at TIMESTAMPTZ;

-- Responsáveis existentes aceitaram a versão 1 (termos originais do cadastro)
UPDATE public.guardians
SET accepted_terms_version = 1
WHERE accepted_terms_version IS NULL;

-- O responsável legal atualiza o próprio registro de aceite (RLS já garante)
-- (nenhuma política nova necessária: "Guardiões gerenciam seu próprio registro" é FOR ALL)
