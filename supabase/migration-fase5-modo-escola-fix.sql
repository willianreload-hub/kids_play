-- ==============================================================================
-- KIDS-PLAYER — CORREÇÃO MODO ESCOLA: recursão infinita nas políticas (42P17)
--
-- CAUSA: a política "Família lê turmas" consulta class_students, cuja política
--        "Inscrições visíveis ao professor" consulta classes de volta — o
--        Postgres detecta o ciclo e bloqueia qualquer SELECT (42P17).
-- CORREÇÃO: padrão canônico do Supabase — políticas consultam FUNÇÕES
--        SECURITY DEFINER, que não reavaliam o RLS das tabelas internas.
--
-- Idempotente: pode rodar mais de uma vez.
-- Como rodar: Supabase -> SQL Editor -> cole TODO este arquivo -> Run.
-- ==============================================================================

-- 1. FUNÇÕES AUXILIARES (SECURITY DEFINER quebram o ciclo de recursão)

-- Sou o professor desta turma?
CREATE OR REPLACE FUNCTION public.is_class_teacher(p_class_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.classes c
    WHERE c.id = p_class_id AND c.teacher_id = auth.uid()
  );
$$;

-- Há aluno meu (ou do qual sou guardião) nesta turma?
CREATE OR REPLACE FUNCTION public.is_class_family_member(p_class_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.class_students cs
    WHERE cs.class_id = p_class_id
      AND (cs.student_id = auth.uid() OR public.is_student_guardian(cs.student_id))
  );
$$;

-- Este aluno está inscrito em alguma turma minha (ativa)?
CREATE OR REPLACE FUNCTION public.is_student_in_my_class(p_student_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.class_students cs
    JOIN public.classes c ON c.id = cs.class_id
    WHERE cs.student_id = p_student_id
      AND c.teacher_id = auth.uid()
      AND c.is_active
  );
$$;

-- 2. POLÍTICAS REFEITAS VIA FUNÇÕES (sem subqueries cruzadas entre si)

-- TURMAS: família lê turmas dos filhos inscritos
DROP POLICY IF EXISTS "Família lê turmas dos filhos inscritos" ON public.classes;
CREATE POLICY "Família lê turmas dos filhos inscritos"
    ON public.classes FOR SELECT
    USING (public.is_class_family_member(id));

-- INSCRIÇÕES: professor da turma lê
DROP POLICY IF EXISTS "Inscrições visíveis ao professor da turma" ON public.class_students;
CREATE POLICY "Inscrições visíveis ao professor da turma"
    ON public.class_students FOR SELECT
    USING (public.is_class_teacher(class_id));

-- DEVERES: professor gerencia / família lê
DROP POLICY IF EXISTS "Professor gerencia deveres da sua turma" ON public.class_assignments;
CREATE POLICY "Professor gerencia deveres da sua turma"
    ON public.class_assignments FOR ALL
    USING (public.is_class_teacher(class_id));

DROP POLICY IF EXISTS "Família lê deveres das turmas dos filhos" ON public.class_assignments;
CREATE POLICY "Família lê deveres das turmas dos filhos"
    ON public.class_assignments FOR SELECT
    USING (public.is_class_family_member(class_id));

-- SESSÕES DE JOGO / TENTATIVAS: professor lê apenas alunos das suas turmas
DROP POLICY IF EXISTS "Professor lê sessões dos alunos das suas turmas" ON public.game_sessions;
CREATE POLICY "Professor lê sessões dos alunos das suas turmas"
    ON public.game_sessions FOR SELECT
    USING (public.is_student_in_my_class(student_id));

DROP POLICY IF EXISTS "Professor lê tentativas dos alunos das suas turmas" ON public.attempts;
CREATE POLICY "Professor lê tentativas dos alunos das suas turmas"
    ON public.attempts FOR SELECT
    USING (public.is_student_in_my_class(student_id));

-- ==============================================================================
-- Nota: as políticas que NÃO causavam recursão permanecem como na migração
-- original (professor-gerencia-suas-turmas em classes; inscrições/remoção da
-- família em class_students — usam apenas auth.uid() e is_student_guardian,
-- que consulta profiles, fora do ciclo). O Modo Foco segue totalmente lacrado
-- para professores.
-- ==============================================================================
