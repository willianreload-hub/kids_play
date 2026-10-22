-- ==============================================================================
-- KIDS-PLAYER — MIGRAÇÃO FASE 5.1: MODO ESCOLA (TURMAS DO PROFESSOR)
--
-- MODELO:
--   • Um professor cria turmas e recebe códigos de convite legíveis.
--   • A família entra na turma pelo código (consentimento do responsável).
--   • O professor vê APENAS dados pedagógicos dos alunos inscritos:
--     nickname moderado, série, nível, sessões por matéria e deveres.
--   • PRIVACIDADE (ECA/LGPD) — barreiras explícitas:
--     - Códigos de turma nunca são listáveis publicamente (entrada via RPC).
--     - Professores NÃO acessam dados dos responsáveis (guardians, RLS próprio).
--     - Professores NÃO acessam o Modo Foco em nenhuma hipótese (dado de
--       saúde sensível): nenhuma política é criada em focus_*.
--     - Inscrição de aluno só via RPC validando responsável/aluno.
--
-- Idempotente: pode rodar mais de uma vez.
-- Como rodar: Supabase -> SQL Editor -> cole TODO este arquivo -> Run.
-- ==============================================================================

-- 1. PROFESSORES (login próprio via auth.users)
CREATE TABLE IF NOT EXISTS public.teachers (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    school_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. TURMAS (o código de convite é gerado automaticamente e é único)
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    name VARCHAR(60) NOT NULL,
    school_grade INT NOT NULL CHECK (school_grade IN (3, 4)),
    invite_code VARCHAR(12) UNIQUE NOT NULL DEFAULT upper(substr(replace(uuid_generate_v4()::text, '-', ''), 1, 8)),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. INSCRIÇÕES (aluno da turma; entrada apenas via join_class_by_code)
CREATE TABLE IF NOT EXISTS public.class_students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (class_id, student_id)
);

-- 4. DEVERES DE TURMA (metas de estudo atribuídas pelo professor)
CREATE TABLE IF NOT EXISTS public.class_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    title VARCHAR(120) NOT NULL,
    description TEXT,
    subject_id VARCHAR(40) REFERENCES public.subjects(id) ON DELETE SET NULL,
    target_sessions INT NOT NULL DEFAULT 3 CHECK (target_sessions BETWEEN 1 AND 10),
    due_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- RLS
-- ==============================================================================
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_assignments ENABLE ROW LEVEL SECURITY;

-- Professores gerenciam o próprio registro
DROP POLICY IF EXISTS "Professor gerencia seu registro" ON public.teachers;
CREATE POLICY "Professor gerencia seu registro"
    ON public.teachers FOR ALL
    USING (auth.uid() = id);

-- Turmas: o professor dono gerencia; a família inscrita apenas lê
DROP POLICY IF EXISTS "Professor gerencia suas turmas" ON public.classes;
CREATE POLICY "Professor gerencia suas turmas"
    ON public.classes FOR ALL
    USING (auth.uid() = teacher_id);

DROP POLICY IF EXISTS "Família lê turmas dos filhos inscritos" ON public.classes;
CREATE POLICY "Família lê turmas dos filhos inscritos"
    ON public.classes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.class_students cs
            WHERE cs.class_id = classes.id
              AND (cs.student_id = auth.uid() OR public.is_student_guardian(cs.student_id))
        )
    );

-- Inscrições: leitura pelo professor da turma ou pela família do aluno
DROP POLICY IF EXISTS "Inscrições visíveis ao professor da turma" ON public.class_students;
CREATE POLICY "Inscrições visíveis ao professor da turma"
    ON public.class_students FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.classes c
            WHERE c.id = class_students.class_id AND c.teacher_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Inscrições visíveis à família do aluno" ON public.class_students;
CREATE POLICY "Inscrições visíveis à família do aluno"
    ON public.class_students FOR SELECT
    USING (
        class_students.student_id = auth.uid()
        OR public.is_student_guardian(class_students.student_id)
    );

-- A família pode REMOVER o próprio filho da turma (direito de saída)
DROP POLICY IF EXISTS "Família remove o filho da turma" ON public.class_students;
CREATE POLICY "Família remove o filho da turma"
    ON public.class_students FOR DELETE
    USING (
        class_students.student_id = auth.uid()
        OR public.is_student_guardian(class_students.student_id)
    );

-- Deveres: professor dono cria/edita; famílias inscritas leem
DROP POLICY IF EXISTS "Professor gerencia deveres da sua turma" ON public.class_assignments;
CREATE POLICY "Professor gerencia deveres da sua turma"
    ON public.class_assignments FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.classes c
            WHERE c.id = class_assignments.class_id AND c.teacher_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Família lê deveres das turmas dos filhos" ON public.class_assignments;
CREATE POLICY "Família lê deveres das turmas dos filhos"
    ON public.class_assignments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.class_students cs
            WHERE cs.class_id = class_assignments.class_id
              AND (cs.student_id = auth.uid() OR public.is_student_guardian(cs.student_id))
        )
    );

-- 5. DASHBOARD DO PROFESSOR: leitura das SESSÕES DE JOGO e TENTATIVAS dos alunos
--    das próprias turmas (somente dado pedagógico; Modo Foco permanece lacrado).
DROP POLICY IF EXISTS "Professor lê sessões dos alunos das suas turmas" ON public.game_sessions;
CREATE POLICY "Professor lê sessões dos alunos das suas turmas"
    ON public.game_sessions FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM public.class_students cs
            JOIN public.classes c ON c.id = cs.class_id
            WHERE cs.student_id = game_sessions.student_id
              AND c.teacher_id = auth.uid()
              AND c.is_active
        )
    );

DROP POLICY IF EXISTS "Professor lê tentativas dos alunos das suas turmas" ON public.attempts;
CREATE POLICY "Professor lê tentativas dos alunos das suas turmas"
    ON public.attempts FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM public.class_students cs
            JOIN public.classes c ON c.id = cs.class_id
            WHERE cs.student_id = attempts.student_id
              AND c.teacher_id = auth.uid()
              AND c.is_active
        )
    );

-- Perfis: o professor precisa ver apelido/série/nível dos alunos inscritos.
-- A leitura pública de profiles já existe ("ranking amigável"), portanto nada
-- precisa ser criado aqui — mas ele NUNCA alcança guardians (e-mail/nome/telefone).

-- ==============================================================================
-- 6. RPC: entrada na turma por código (consentimento do responsável ou o
--    próprio aluno). SECURITY DEFINER + validação explícita do solicitante.
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.join_class_by_code(
    p_code VARCHAR,
    p_student_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_class RECORD;
    v_already BOOLEAN;
BEGIN
    -- Somente o próprio aluno ou seu responsável legal pode inscrever
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'É preciso estar autenticado';
    END IF;
    IF auth.uid() <> p_student_id AND NOT public.is_student_guardian(p_student_id) THEN
        RAISE EXCEPTION 'Apenas o aluno ou o responsável legal pode entrar em uma turma';
    END IF;

    SELECT * INTO v_class
    FROM public.classes
    WHERE upper(invite_code) = upper(trim(p_code)) AND is_active;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Código de turma não encontrado. Confira com o professor!';
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM public.class_students
        WHERE class_id = v_class.id AND student_id = p_student_id
    ) INTO v_already;

    IF NOT v_already THEN
        INSERT INTO public.class_students (class_id, student_id)
        VALUES (v_class.id, p_student_id);
    END IF;

    RETURN jsonb_build_object(
        'class_id', v_class.id,
        'class_name', v_class.name,
        'already_enrolled', v_already
    );
END;
$$;

-- ==============================================================================
-- Nota: foco_mode_settings e focus_sessions continuam acessíveis SOMENTE ao
-- aluno e ao seu responsável (políticas da migração multi-perfil). Nenhuma
-- regra nova foi criada para professores — o Modo Foco permanece lacrado.
-- ==============================================================================
