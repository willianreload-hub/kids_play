-- ==============================================================================
-- KIDS-PLAYER — MIGRAÇÃO MULTI-PERFIL (Fase 2.2)
-- Objetivo: um guardião autenticado pode gerenciar N perfis de filhos.
-- Segurança: todas as regras continuam restritas ao próprio aluno OU ao seu
--             responsável legal registrado (guardian_id). Idempotente.
-- Como rodar: Supabase -> SQL Editor -> cole TODO este arquivo -> Run.
-- ==============================================================================

-- 1. Função auxiliar: "sou eu o aluno OU sou o guardião dele?"
--    (SECURITY DEFINER evita recursão com as políticas de profiles)
CREATE OR REPLACE FUNCTION public.is_student_guardian(check_student_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = check_student_id AND guardian_id = auth.uid()
  );
$$;

-- 2. PROFILES: guardião pode criar e editar perfis dos filhos
DROP POLICY IF EXISTS "Aluno ou responsável insere perfil inicial" ON public.profiles;
CREATE POLICY "Aluno ou responsável insere perfil inicial"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id OR auth.uid() = guardian_id);

DROP POLICY IF EXISTS "Aluno atualiza seu próprio perfil" ON public.profiles;
CREATE POLICY "Aluno atualiza seu próprio perfil"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id OR auth.uid() = guardian_id);

-- 3. RPC DE PONTOS: passa a validar o autor da chamada (anti-abuso).
--    Antes QUALQUER usuário autenticado podia creditar/debitar em qualquer aluno.
CREATE OR REPLACE FUNCTION public.apply_points_transaction(
    p_student_id UUID,
    p_amount INT,
    p_reason VARCHAR(50),
    p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS INT AS $$
DECLARE
    v_current_balance INT;
    v_new_balance INT;
BEGIN
    IF auth.uid() IS NOT NULL
       AND auth.uid() <> p_student_id
       AND NOT public.is_student_guardian(p_student_id) THEN
        RAISE EXCEPTION 'Sem permissão para movimentar pontos deste aluno';
    END IF;

    SELECT COALESCE(SUM(amount), 0) INTO v_current_balance
    FROM public.points_ledger
    WHERE student_id = p_student_id;

    IF p_amount < 0 AND (v_current_balance + p_amount) < 0 THEN
        RAISE EXCEPTION 'Saldo insuficiente de moedas/pontos';
    END IF;

    INSERT INTO public.points_ledger (student_id, amount, reason, metadata)
    VALUES (p_student_id, p_amount, p_reason, p_metadata);

    RETURN (v_current_balance + p_amount);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. DADOS DO ALUNO: aluno OU seu guardião (mesma semântica das regras originais,
--    agora incluindo o responsável legal, como o ECA/LGPD espera do painel dos pais)
DROP POLICY IF EXISTS "Modo Foco restrito ao aluno ou responsável" ON public.focus_mode_settings;
CREATE POLICY "Modo Foco restrito ao aluno ou responsável"
    ON public.focus_mode_settings FOR ALL
    USING (auth.uid() = student_id OR public.is_student_guardian(student_id));

DROP POLICY IF EXISTS "Sessões de Foco do aluno ou responsável" ON public.focus_sessions;
CREATE POLICY "Sessões de Foco do aluno ou responsável"
    ON public.focus_sessions FOR ALL
    USING (auth.uid() = student_id OR public.is_student_guardian(student_id));

DROP POLICY IF EXISTS "Pets do aluno ou responsável" ON public.user_pets;
CREATE POLICY "Pets do aluno ou responsável"
    ON public.user_pets FOR ALL
    USING (auth.uid() = student_id OR public.is_student_guardian(student_id));

DROP POLICY IF EXISTS "Acessórios do aluno ou responsável" ON public.user_accessories;
CREATE POLICY "Acessórios do aluno ou responsável"
    ON public.user_accessories FOR ALL
    USING (auth.uid() = student_id OR public.is_student_guardian(student_id));

DROP POLICY IF EXISTS "Tentativas do aluno ou responsável" ON public.attempts;
CREATE POLICY "Tentativas do aluno ou responsável"
    ON public.attempts FOR ALL
    USING (auth.uid() = student_id OR public.is_student_guardian(student_id));

DROP POLICY IF EXISTS "Sessões de jogo do aluno ou responsável" ON public.game_sessions;
CREATE POLICY "Sessões de jogo do aluno ou responsável"
    ON public.game_sessions FOR ALL
    USING (auth.uid() = student_id OR public.is_student_guardian(student_id));

DROP POLICY IF EXISTS "Digitação do aluno ou responsável" ON public.typing_progress;
CREATE POLICY "Digitação do aluno ou responsável"
    ON public.typing_progress FOR ALL
    USING (auth.uid() = student_id OR public.is_student_guardian(student_id));

DROP POLICY IF EXISTS "Quests do aluno ou responsável" ON public.user_quests;
CREATE POLICY "Quests do aluno ou responsável"
    ON public.user_quests FOR ALL
    USING (auth.uid() = student_id OR public.is_student_guardian(student_id));

DROP POLICY IF EXISTS "Conquistas do aluno ou responsável" ON public.user_achievements;
CREATE POLICY "Conquistas do aluno ou responsável"
    ON public.user_achievements FOR ALL
    USING (auth.uid() = student_id OR public.is_student_guardian(student_id));

-- 5. LEITURAS SENSÍVEIS (livro-razão e histórico de caixas): aluno OU guardião
DROP POLICY IF EXISTS "Aluno visualiza seu livro-razão de pontos" ON public.points_ledger;
CREATE POLICY "Aluno visualiza seu livro-razão de pontos"
    ON public.points_ledger FOR SELECT
    USING (auth.uid() = student_id OR public.is_student_guardian(student_id));

DROP POLICY IF EXISTS "Aluno visualiza seu histórico de caixas" ON public.lootbox_opens;
CREATE POLICY "Aluno visualiza seu histórico de caixas"
    ON public.lootbox_opens FOR SELECT
    USING (auth.uid() = student_id OR public.is_student_guardian(student_id));

-- ==============================================================================
-- Nota: as políticas originais de cada tabela permanecem criadas pelo schema.sql
-- (semântica auth.uid() = student_id); as regras acima são ADITIVAS — um aluno
-- continua vendo apenas os próprios dados, e o guardião passa a enxergar os
-- dados dos filhos registrados sob o seu guardian_id. Nenhuma outra conta
-- ganha acesso: is_student_guardian exige o vínculo direto no banco.
-- ==============================================================================
