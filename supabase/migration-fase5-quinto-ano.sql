-- ==============================================================================
-- KIDS-PLAYER — MIGRAÇÃO FASE 5.4: EXTENSÃO PARA O 5º ANO
-- Amplia os CHECKs de school_grade de (3, 4) para (3, 4, 5) em perfis e turmas.
-- Idempotente: pode rodar mais de uma vez.
-- Como rodar: Supabase -> SQL Editor -> cole TODO este arquivo -> Run.
-- ==============================================================================

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_school_grade_check;
ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_school_grade_check CHECK (school_grade IN (3, 4, 5));

ALTER TABLE public.classes DROP CONSTRAINT IF EXISTS classes_school_grade_check;
ALTER TABLE public.classes
    ADD CONSTRAINT classes_school_grade_check CHECK (school_grade IN (3, 4, 5));
