-- ==============================================================================
-- PROJETO KIDS-PLAYER: BANCO DE DADOS SUPABASE (PostgreSQL + RLS)
-- Reforço Escolar Gamificado para o 3º e 4º ano do Ensino Fundamental (BNCC)
-- ==============================================================================

-- 1. EXTENSÕES NECESSÁRIAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TABELAS DE USUÁRIOS E SEGURANÇA INFANTIL (LGPD & ECA DIGITAL)
-- ==============================================================================

-- Tabela de Responsáveis (Guardiões legais)
CREATE TABLE IF NOT EXISTS public.guardians (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    accepted_terms_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de Perfis de Alunos (Crianças)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    guardian_id UUID REFERENCES public.guardians(id) ON DELETE SET NULL,
    nickname VARCHAR(30) UNIQUE NOT NULL,
    school_grade INT NOT NULL CHECK (school_grade IN (3, 4)),
    avatar_preset VARCHAR(50) NOT NULL DEFAULT 'astro_kid',
    avatar_url TEXT,
    level INT NOT NULL DEFAULT 1 CHECK (level >= 1),
    xp INT NOT NULL DEFAULT 0 CHECK (xp >= 0),
    streak_days INT NOT NULL DEFAULT 0 CHECK (streak_days >= 0),
    last_active_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela do Modo Foco (Apoio Pedagógico para Atenção / TDAH - Dado Sensível Protegido)
CREATE TABLE IF NOT EXISTS public.focus_mode_settings (
    student_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    guardian_consent BOOLEAN NOT NULL DEFAULT FALSE,
    guardian_consent_date TIMESTAMPTZ,
    session_duration_minutes INT NOT NULL DEFAULT 4 CHECK (session_duration_minutes BETWEEN 2 AND 10),
    reduced_stimuli BOOLEAN NOT NULL DEFAULT TRUE,
    tts_auto_read BOOLEAN NOT NULL DEFAULT TRUE,
    pause_interval_minutes INT NOT NULL DEFAULT 5 CHECK (pause_interval_minutes BETWEEN 3 AND 15),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sessões de Foco (Métricas de apoio para relatório dos pais)
CREATE TABLE IF NOT EXISTS public.focus_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    duration_seconds INT DEFAULT 0,
    pauses_taken INT NOT NULL DEFAULT 0,
    tasks_completed INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 3. ECONOMIA: LIVRO-RAZÃO DE PONTOS (POINTS LEDGER)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.points_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount INT NOT NULL, -- positivo para ganho, negativo para gasto
    reason VARCHAR(50) NOT NULL, -- 'game_win', 'quest_daily', 'lootbox_buy', 'pet_evolution', 'streak_bonus'
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_points_ledger_student_created ON public.points_ledger(student_id, created_at);

-- View para Saldo Atual de Pontos do Aluno
CREATE OR REPLACE VIEW public.student_balances AS
SELECT 
    student_id,
    COALESCE(SUM(amount), 0) AS balance_points
FROM public.points_ledger
GROUP BY student_id;

-- ==============================================================================
-- 4. MATÉRIAS, HABILIDADES BNCC E BANCO DE QUESTÕES
-- ==============================================================================

-- Matérias Principais
CREATE TABLE IF NOT EXISTS public.subjects (
    id VARCHAR(40) PRIMARY KEY, -- 'matematica', 'portugues', 'ciencias', 'historia_geografia', 'ingles', 'digitacao'
    name VARCHAR(80) NOT NULL,
    description TEXT,
    icon VARCHAR(40) NOT NULL,
    color_theme VARCHAR(30) NOT NULL,
    order_index INT NOT NULL DEFAULT 0
);

-- Unidades Temáticas (3º ou 4º ano)
CREATE TABLE IF NOT EXISTS public.units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id VARCHAR(40) NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    grade INT NOT NULL CHECK (grade IN (3, 4)),
    title VARCHAR(120) NOT NULL,
    description TEXT,
    order_index INT NOT NULL DEFAULT 0
);

-- Habilidades Alinhadas à BNCC
CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
    bncc_code VARCHAR(20) NOT NULL, -- Ex: 'EF03MA05', 'EF04LP01'
    title VARCHAR(150) NOT NULL,
    description TEXT
);

-- Banco de Questões
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL, -- Enunciado claro e infantil
    audio_prompt_text TEXT, -- Texto para o SpeechSynthesis ler em voz alta
    question_type VARCHAR(30) NOT NULL DEFAULT 'multiple_choice', -- 'multiple_choice', 'voice_repeat', 'typing', 'true_false'
    options JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array de opções ou botões
    correct_answer TEXT NOT NULL,
    explanation TEXT NOT NULL, -- Explicação amigável em caso de erro
    difficulty INT NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 3),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tentativas do Aluno (Respostas)
CREATE TABLE IF NOT EXISTS public.attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    selected_answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    response_time_ms INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sessões de Jogos (Minijogos da plataforma)
CREATE TABLE IF NOT EXISTS public.game_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    game_type VARCHAR(40) NOT NULL, -- 'bloco_minerador', 'aventura_plataforma', 'corrida_tabuada', 'hub_mundos', 'digitacao'
    subject_id VARCHAR(40) REFERENCES public.subjects(id) ON DELETE SET NULL,
    score INT NOT NULL DEFAULT 0,
    accuracy_percent NUMERIC(5,2) DEFAULT 0.00,
    xp_earned INT NOT NULL DEFAULT 0,
    points_earned INT NOT NULL DEFAULT 0,
    duration_seconds INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Mini-Curso de Digitação Gamificado
CREATE TABLE IF NOT EXISTS public.typing_progress (
    student_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    stage_level INT NOT NULL DEFAULT 1,
    wpm NUMERIC(5,1) DEFAULT 0.0,
    accuracy_percent NUMERIC(5,2) DEFAULT 0.00,
    stars INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 5. SISTEMA DE PETS, ACESSÓRIOS E LOOTBOX
-- ==============================================================================

-- Catálogo de PETs Originais
CREATE TABLE IF NOT EXISTS public.pets (
    id VARCHAR(50) PRIMARY KEY, -- 'pipoca_raposa', 'bolha_slime', 'raio_dragao', 'corujinha_pixel', 'estrela_cosmica'
    name VARCHAR(80) NOT NULL,
    species VARCHAR(60) NOT NULL,
    rarity VARCHAR(30) NOT NULL CHECK (rarity IN ('normal', 'raro', 'epico', 'lendario', 'mitico')),
    description TEXT NOT NULL,
    sprite_key VARCHAR(60) NOT NULL,
    base_power INT NOT NULL DEFAULT 10,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PETs que o Aluno possui
CREATE TABLE IF NOT EXISTS public.user_pets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    pet_id VARCHAR(50) NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    nickname VARCHAR(30),
    level INT NOT NULL DEFAULT 1 CHECK (level >= 1),
    evolution_fragments INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    acquired_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(student_id, pet_id)
);

-- Catálogo de Acessórios
CREATE TABLE IF NOT EXISTS public.accessories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(80) NOT NULL,
    accessory_type VARCHAR(30) NOT NULL CHECK (accessory_type IN ('chapeu', 'oculos', 'capa', 'efeito')),
    rarity VARCHAR(30) NOT NULL CHECK (rarity IN ('normal', 'raro', 'epico', 'lendario', 'mitico')),
    price_points INT NOT NULL CHECK (price_points >= 0),
    sprite_key VARCHAR(60) NOT NULL
);

-- Acessórios do Aluno
CREATE TABLE IF NOT EXISTS public.user_accessories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    accessory_id VARCHAR(50) NOT NULL REFERENCES public.accessories(id) ON DELETE CASCADE,
    equipped_to_pet_id UUID REFERENCES public.user_pets(id) ON DELETE SET NULL,
    is_equipped BOOLEAN NOT NULL DEFAULT FALSE,
    acquired_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Configuração Transparente da Caixa Surpresa (Lootbox por Pontos)
CREATE TABLE IF NOT EXISTS public.lootbox_config (
    rarity VARCHAR(30) PRIMARY KEY CHECK (rarity IN ('normal', 'raro', 'epico', 'lendario', 'mitico')),
    drop_rate_percent NUMERIC(5,2) NOT NULL,
    cost_points INT NOT NULL DEFAULT 100,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Histórico de Aberturas de Lootbox
CREATE TABLE IF NOT EXISTS public.lootbox_opens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    cost_paid INT NOT NULL,
    dropped_rarity VARCHAR(30) NOT NULL,
    dropped_pet_id VARCHAR(50) NOT NULL REFERENCES public.pets(id),
    was_duplicate BOOLEAN NOT NULL DEFAULT FALSE,
    fragments_converted INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 6. MISSÕES, QUESTS DIÁRIAS E CONQUISTAS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.quests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(120) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(30) NOT NULL DEFAULT 'diaria' CHECK (category IN ('diaria', 'semanal', 'especial')),
    reward_points INT NOT NULL DEFAULT 50,
    reward_xp INT NOT NULL DEFAULT 30,
    target_count INT NOT NULL DEFAULT 1,
    quest_key VARCHAR(50) NOT NULL -- 'olimpiada_matematica', 'desafio_palavras', 'corrida_tabuada', etc.
);

CREATE TABLE IF NOT EXISTS public.user_quests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    quest_id UUID NOT NULL REFERENCES public.quests(id) ON DELETE CASCADE,
    current_progress INT NOT NULL DEFAULT 0,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    is_claimed BOOLEAN NOT NULL DEFAULT FALSE,
    period_date DATE NOT NULL DEFAULT CURRENT_DATE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(student_id, quest_id, period_date)
);

CREATE TABLE IF NOT EXISTS public.achievements (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    badge_icon VARCHAR(50) NOT NULL,
    reward_points INT NOT NULL DEFAULT 100
);

CREATE TABLE IF NOT EXISTS public.user_achievements (
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    achievement_id VARCHAR(50) NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY(student_id, achievement_id)
);

-- ==============================================================================
-- 7. RANKINGS COM RESPEITO À LGPD (TOP DIÁRIO, SEMANAL, MENSAL)
-- Exposição estritamente limitada a: nickname, avatar e pontos ganhos no período.
-- ==============================================================================

-- Top Diário
CREATE OR REPLACE VIEW public.leaderboard_daily AS
SELECT 
    p.id AS student_id,
    p.nickname,
    p.avatar_preset,
    p.avatar_url,
    COALESCE(SUM(pl.amount), 0) AS period_points
FROM public.profiles p
JOIN public.points_ledger pl ON pl.student_id = p.id
WHERE pl.created_at >= CURRENT_DATE 
  AND pl.amount > 0
GROUP BY p.id, p.nickname, p.avatar_preset, p.avatar_url
ORDER BY period_points DESC;

-- Top Semanal
CREATE OR REPLACE VIEW public.leaderboard_weekly AS
SELECT 
    p.id AS student_id,
    p.nickname,
    p.avatar_preset,
    p.avatar_url,
    COALESCE(SUM(pl.amount), 0) AS period_points
FROM public.profiles p
JOIN public.points_ledger pl ON pl.student_id = p.id
WHERE pl.created_at >= date_trunc('week', CURRENT_DATE) 
  AND pl.amount > 0
GROUP BY p.id, p.nickname, p.avatar_preset, p.avatar_url
ORDER BY period_points DESC;

-- Top Mensal
CREATE OR REPLACE VIEW public.leaderboard_monthly AS
SELECT 
    p.id AS student_id,
    p.nickname,
    p.avatar_preset,
    p.avatar_url,
    COALESCE(SUM(pl.amount), 0) AS period_points
FROM public.profiles p
JOIN public.points_ledger pl ON pl.student_id = p.id
WHERE pl.created_at >= date_trunc('month', CURRENT_DATE) 
  AND pl.amount > 0
GROUP BY p.id, p.nickname, p.avatar_preset, p.avatar_url
ORDER BY period_points DESC;

-- ==============================================================================
-- 8. FUNÇÕES DO SERVIDOR SEGURAS (STORED PROCEDURES)
-- ==============================================================================

-- Função segura para creditar ou debitar pontos no livro-razão
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
    SELECT COALESCE(SUM(amount), 0) INTO v_current_balance
    FROM public.points_ledger
    WHERE student_id = p_student_id;

    -- Se for débito e o saldo for insuficiente, aborta
    IF p_amount < 0 AND (v_current_balance + p_amount) < 0 THEN
        RAISE EXCEPTION 'Saldo insuficiente de moedas/pontos';
    END IF;

    INSERT INTO public.points_ledger (student_id, amount, reason, metadata)
    VALUES (p_student_id, p_amount, p_reason, p_metadata);

    RETURN (v_current_balance + p_amount);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função segura para abertura de Lootbox 100% no servidor (anti-fraude)
CREATE OR REPLACE FUNCTION public.secure_open_lootbox(p_student_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_box_cost INT := 100;
    v_current_balance INT;
    v_random_roll NUMERIC;
    v_selected_rarity VARCHAR(30);
    v_selected_pet_id VARCHAR(50);
    v_is_duplicate BOOLEAN := FALSE;
    v_fragments INT := 0;
    v_pet RECORD;
BEGIN
    -- 1. Verifica saldo do aluno
    SELECT COALESCE(SUM(amount), 0) INTO v_current_balance
    FROM public.points_ledger
    WHERE student_id = p_student_id;

    IF v_current_balance < v_box_cost THEN
        RAISE EXCEPTION 'Pontos insuficientes para abrir o Baú Surpresa';
    END IF;

    -- 2. Sorteia raridade com base nas porcentagens configuradas
    v_random_roll := (random() * 100);

    -- Padrão: Mítico (1%), Lendário (4%), Épico (10%), Raro (25%), Normal (60%)
    IF v_random_roll < 1.0 THEN
        v_selected_rarity := 'mitico';
    ELSIF v_random_roll < 5.0 THEN
        v_selected_rarity := 'lendario';
    ELSIF v_random_roll < 15.0 THEN
        v_selected_rarity := 'epico';
    ELSIF v_random_roll < 40.0 THEN
        v_selected_rarity := 'raro';
    ELSE
        v_selected_rarity := 'normal';
    END IF;

    -- 3. Escolhe um PET aleatório daquela raridade
    SELECT id, name, species, rarity, description, sprite_key
    INTO v_pet
    FROM public.pets
    WHERE rarity = v_selected_rarity
    ORDER BY random()
    LIMIT 1;

    -- Fallback caso não encontre PET da raridade
    IF v_pet.id IS NULL THEN
        SELECT id, name, species, rarity, description, sprite_key
        INTO v_pet
        FROM public.pets
        ORDER BY random()
        LIMIT 1;
        v_selected_rarity := v_pet.rarity;
    END IF;

    v_selected_pet_id := v_pet.id;

    -- 4. Debita o custo da caixa
    PERFORM public.apply_points_transaction(
        p_student_id, 
        -v_box_cost, 
        'lootbox_buy', 
        jsonb_build_object('rarity', v_selected_rarity, 'pet_id', v_selected_pet_id)
    );

    -- 5. Verifica se já possui o PET
    IF EXISTS (SELECT 1 FROM public.user_pets WHERE student_id = p_student_id AND pet_id = v_selected_pet_id) THEN
        v_is_duplicate := TRUE;
        -- Converte em fragmentos de evolução baseado na raridade
        v_fragments := CASE v_selected_rarity
            WHEN 'mitico' THEN 50
            WHEN 'lendario' THEN 30
            WHEN 'epico' THEN 15
            WHEN 'raro' THEN 8
            ELSE 3
        END;

        UPDATE public.user_pets
        SET evolution_fragments = evolution_fragments + v_fragments
        WHERE student_id = p_student_id AND pet_id = v_selected_pet_id;
    ELSE
        INSERT INTO public.user_pets (student_id, pet_id, nickname, is_active)
        VALUES (p_student_id, v_selected_pet_id, v_pet.name, FALSE);
    END IF;

    -- 6. Registra no histórico de aberturas
    INSERT INTO public.lootbox_opens (student_id, cost_paid, dropped_rarity, dropped_pet_id, was_duplicate, fragments_converted)
    VALUES (p_student_id, v_box_cost, v_selected_rarity, v_selected_pet_id, v_is_duplicate, v_fragments);

    -- 7. Retorna os detalhes para o cliente comemorar
    RETURN jsonb_build_object(
        'success', TRUE,
        'pet_id', v_pet.id,
        'pet_name', v_pet.name,
        'rarity', v_pet.rarity,
        'species', v_pet.species,
        'sprite_key', v_pet.sprite_key,
        'was_duplicate', v_is_duplicate,
        'fragments_converted', v_fragments
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 9. POLÍTICAS DE SEGURANÇA (ROW LEVEL SECURITY - RLS)
-- ==============================================================================

ALTER TABLE public.guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_mode_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.typing_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accessories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_accessories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lootbox_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lootbox_opens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Regras para GUARDIANS: Somente o próprio guardião acessa seus dados
CREATE POLICY "Guardiões gerenciam seu próprio registro"
    ON public.guardians FOR ALL
    USING (auth.uid() = id);

-- Regras para PROFILES: Leitura pública (para ranking e amigos), escrita somente do dono
CREATE POLICY "Perfis visíveis para ranking público amigável"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Aluno atualiza seu próprio perfil"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Aluno ou responsável insere perfil inicial"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Regras para MODO FOCO: Estritamente restrito ao aluno e seu responsável
CREATE POLICY "Modo Foco restrito ao próprio aluno"
    ON public.focus_mode_settings FOR ALL
    USING (auth.uid() = student_id);

CREATE POLICY "Sessões de Foco restritas ao próprio aluno"
    ON public.focus_sessions FOR ALL
    USING (auth.uid() = student_id);

-- Regras para POINTS LEDGER: Aluno pode visualizar suas transações
CREATE POLICY "Aluno visualiza seu livro-razão de pontos"
    ON public.points_ledger FOR SELECT
    USING (auth.uid() = student_id);

-- Regras para CONTEÚDO (Matérias, Unidades, Habilidades, Questões, Pets, Acessórios, Quests): Leitura pública para autenticados
CREATE POLICY "Leitura pública de matérias" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Leitura pública de unidades" ON public.units FOR SELECT USING (true);
CREATE POLICY "Leitura pública de habilidades" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Leitura pública de questões" ON public.questions FOR SELECT USING (true);
CREATE POLICY "Leitura pública de pets" ON public.pets FOR SELECT USING (true);
CREATE POLICY "Leitura pública de acessórios" ON public.accessories FOR SELECT USING (true);
CREATE POLICY "Leitura pública de chances de lootbox" ON public.lootbox_config FOR SELECT USING (true);
CREATE POLICY "Leitura pública de quests" ON public.quests FOR SELECT USING (true);
CREATE POLICY "Leitura pública de conquistas" ON public.achievements FOR SELECT USING (true);

-- Regras para PROGRESSO DO ALUNO (Pets, Acessórios, Tentativas, Quests, Digitação)
CREATE POLICY "Aluno gerencia seus próprios pets"
    ON public.user_pets FOR ALL
    USING (auth.uid() = student_id);

CREATE POLICY "Aluno gerencia seus próprios acessórios"
    ON public.user_accessories FOR ALL
    USING (auth.uid() = student_id);

CREATE POLICY "Aluno registra e vê suas tentativas"
    ON public.attempts FOR ALL
    USING (auth.uid() = student_id);

CREATE POLICY "Aluno registra suas sessões de jogos"
    ON public.game_sessions FOR ALL
    USING (auth.uid() = student_id);

CREATE POLICY "Aluno atualiza seu progresso de digitação"
    ON public.typing_progress FOR ALL
    USING (auth.uid() = student_id);

CREATE POLICY "Aluno gerencia suas quests"
    ON public.user_quests FOR ALL
    USING (auth.uid() = student_id);

CREATE POLICY "Aluno visualiza suas conquistas"
    ON public.user_achievements FOR ALL
    USING (auth.uid() = student_id);

CREATE POLICY "Aluno visualiza seu histórico de caixas"
    ON public.lootbox_opens FOR SELECT
    USING (auth.uid() = student_id);

-- ==============================================================================
-- 10. DADOS INICIAIS (SEED DATA)
-- ==============================================================================

-- Configuração de Chances da Lootbox (Transparência total)
INSERT INTO public.lootbox_config (rarity, drop_rate_percent, cost_points) VALUES
    ('normal', 60.00, 100),
    ('raro', 25.00, 100),
    ('epico', 10.00, 100),
    ('lendario', 4.00, 100),
    ('mitico', 1.00, 100)
ON CONFLICT (rarity) DO UPDATE SET drop_rate_percent = EXCLUDED.drop_rate_percent;

-- Matérias Iniciais BNCC
INSERT INTO public.subjects (id, name, description, icon, color_theme, order_index) VALUES
    ('matematica', 'Matemática', 'Números, operações, tabuada, desafios e geometria divertida!', 'calculator', 'kids-blue', 1),
    ('portugues', 'Língua Portuguesa', 'Interpretação, ortografia, sílabas, rimas e histórias!', 'book-open', 'kids-pink', 2),
    ('ciencias', 'Ciências Naturais', 'Corpo humano, seres vivos, ecologia e o universo!', 'flask', 'kids-green', 3),
    ('historia_geografia', 'História e Geografia', 'Comunidade, mapas, cidades, paisagens e nosso país!', 'compass', 'kids-yellow', 4),
    ('ingles', 'Inglês Interativo', 'Aprenda palavras novas, animais e treine sua pronúncia com a voz!', 'globe', 'kids-purple', 5),
    ('digitacao', 'Mestre do Teclado', 'Aprenda a digitar rápido feito um herói das teclas!', 'keyboard', 'kids-orange', 6)
ON CONFLICT (id) DO NOTHING;

-- Catálogo de PETs Iniciais Originais (Pixel Art)
INSERT INTO public.pets (id, name, species, rarity, description, sprite_key, base_power) VALUES
    ('pipoca_raposa', 'Pipoca', 'Raposinha Curiosa', 'normal', 'Uma raposinha esperta que ama resolver enigmas de matemática.', 'pet_fox', 15),
    ('bolha_slime', 'Bolha', 'Slime Sorridente', 'normal', 'Um bichinho gelatinoso e super fofo que adora ler historinhas.', 'pet_slime', 12),
    ('corujinha_pixel', 'Sabichão', 'Coruja dos Livros', 'raro', 'Sempre alerta com conselhos sábios e ótimas dicas de português.', 'pet_owl', 28),
    ('raio_dragao', 'Faísca', 'Dragãozinho Alado', 'epico', 'Cospe faíscas de energia quando você bate recordes de velocidade!', 'pet_dragon', 45),
    ('astro_gatinho', 'Cósmico', 'Gatinho Astronauta', 'lendario', 'Veio das estrelas para iluminar suas maiores descobertas.', 'pet_cat', 70),
    ('fenix_dourada', 'Solzinho', 'Pássaro do Alvorecer', 'mitico', 'Uma criatura lendária cintilante que irradia sabedoria máxima!', 'pet_phoenix', 120)
ON CONFLICT (id) DO NOTHING;

-- Acessórios Iniciais
INSERT INTO public.accessories (id, name, accessory_type, rarity, price_points, sprite_key) VALUES
    ('chapeu_formatura', 'Chapéu de Formatura', 'chapeu', 'normal', 150, 'acc_hat_grad'),
    ('oculos_detetive', 'Óculos de Detetive', 'oculos', 'raro', 300, 'acc_glasses_detective'),
    ('capa_estelar', 'Capa de Super Herói', 'capa', 'epico', 600, 'acc_cape_hero'),
    ('coroa_ouro_pixel', 'Coroa Imperial Pixel', 'chapeu', 'mitico', 2500, 'acc_crown_gold')
ON CONFLICT (id) DO NOTHING;

-- Quests Diárias Iniciais
INSERT INTO public.quests (title, description, category, reward_points, reward_xp, target_count, quest_key) VALUES
    ('Olimpíada da Matemática', 'Acerte 5 desafios matemáticos em qualquer minijogo.', 'diaria', 60, 40, 5, 'olimpiada_matematica'),
    ('Desafio de Palavras', 'Complete uma rodada de leitura e ortografia em Português.', 'diaria', 50, 35, 1, 'desafio_palavras'),
    ('Caça-Vocabulário em Inglês', 'Fale ou selecione 3 palavras corretas em Inglês.', 'diaria', 70, 50, 3, 'ingles_repeticao'),
    ('Corrida da Tabuada', 'Vença uma corrida no modo velocidade sem errar nenhuma conta.', 'diaria', 80, 60, 1, 'corrida_tabuada')
ON CONFLICT DO NOTHING;
