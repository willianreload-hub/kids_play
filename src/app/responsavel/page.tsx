'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth-context';
import { sounds } from '../../lib/sound-effects';
import { PixelButton } from '../../components/PixelButton';
import { PetIcon } from '../../components/PetIcon';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { SUBJECTS, AVATAR_PRESETS, PET_CATALOG, TERMS_VERSION, TERMS_UPDATED_AT, TERMS_SECTIONS } from '../../lib/content-data';
import { validateNickname } from '../../lib/nickname-moderator';
import { trackEvent } from '../../lib/analytics';
import {
  ShieldCheck, Clock, Award, BookOpen, Heart, Settings,
  AlertTriangle, Lightbulb, UserCheck, Users, Plus, School
} from 'lucide-react';

interface SessionRow {
  game_type: string;
  subject_id: string | null;
  duration_seconds: number;
  accuracy_percent: number | null;
  points_earned: number;
  created_at: string;
}

// Cores do gráfico de distribuição por matéria (paleta do design system)
const SUBJECT_COLORS: Record<string, string> = {
  matematica: 'bg-cyan-500',
  portugues: 'bg-pink-500',
  ciencias: 'bg-emerald-500',
  historia_geografia: 'bg-yellow-500',
  ingles: 'bg-purple-500',
  digitacao: 'bg-orange-500',
};

const subjectName = (id: string) => SUBJECTS.find(s => s.id === id)?.name || id;

export default function ResponsavelPage() {
  const {
    profile,
    guardian,
    focusMode,
    updateFocusSettings,
    toggleFocusMode,
    isDemo,
    familyProfiles,
    addChildProfile,
    switchStudentProfile
  } = useAuth();

  const [savedNotice, setSavedNotice] = useState(false);
  const [sessionMinutes, setSessionMinutes] = useState(focusMode.session_duration_minutes || 4);
  const [pauseMinutes, setPauseMinutes] = useState(focusMode.pause_interval_minutes || 5);
  const [ttsEnabled, setTtsEnabled] = useState(focusMode.tts_auto_read);
  const [reducedStimuli, setReducedStimuli] = useState(focusMode.reduced_stimuli);
  const [confirmResetModal, setConfirmResetModal] = useState(false);

  // MÉTRICAS REAIS (Fase 2.4): sessões de jogo do aluno ativo no servidor.
  // Padrão sem setState-in-effect: o efeito só grava no retorno da promessa e a
  // derivação abaixo invalida automaticamente quando o aluno ativo muda.
  const [statsByStudent, setStatsByStudent] = useState<{ studentId: string; rows: SessionRow[] } | null>(null);
  const statsAreCurrent = !isDemo && isSupabaseConfigured && !!profile?.id && statsByStudent?.studentId === profile.id;
  const sessions: SessionRow[] = statsAreCurrent ? statsByStudent!.rows : [];
  const isLoadingStats = !isDemo && isSupabaseConfigured && !!profile?.id && !statsAreCurrent;

  useEffect(() => {
    const studentId = profile?.id;
    if (!studentId || isDemo || !isSupabaseConfigured) return;
    let cancelled = false;
    supabase
      .from('game_sessions')
      .select('game_type, subject_id, duration_seconds, accuracy_percent, points_earned, created_at')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(300)
      .then(({ data }) => {
        if (cancelled) return;
        setStatsByStudent({ studentId, rows: (data as SessionRow[] | null) || [] });
      });
    return () => {
      cancelled = true;
    };
  }, [profile?.id, isDemo]);

  // Métricas derivadas das sessões reais
  const totalMinutes = Math.round(sessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) / 60);
  const withAccuracy = sessions.filter(s => (s.accuracy_percent ?? 0) > 0);
  const avgAccuracy = withAccuracy.length
    ? Math.round(withAccuracy.reduce((acc, s) => acc + (s.accuracy_percent || 0), 0) / withAccuracy.length)
    : 0;
  const bySubject = new Map<string, number>();
  sessions.forEach(s => {
    const key = s.subject_id || 'outros';
    bySubject.set(key, (bySubject.get(key) || 0) + 1);
  });
  const topSubjectId = [...bySubject.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  const topSubject = SUBJECTS.find(s => s.id === topSubjectId) || null;

  // MULTI-PERFIL (Fase 2.2): modal de novo filho
  const [showAddChild, setShowAddChild] = useState(false);
  const [newChildNickname, setNewChildNickname] = useState('');
  const [newChildGrade, setNewChildGrade] = useState<3 | 4 | 5>(3);
  const [newChildAvatar, setNewChildAvatar] = useState(AVATAR_PRESETS[0]?.id || 'astro_kid');
  const [newChildPetId, setNewChildPetId] = useState(PET_CATALOG[0]?.id || 'pipoca_raposa');
  const [addChildError, setAddChildError] = useState('');
  const [isAddingChild, setIsAddingChild] = useState(false);

  const handleAddChild = async () => {
    const validation = validateNickname(newChildNickname);
    if (!validation.isValid) {
      setAddChildError(validation.message || 'Escolha outro apelido divertido.');
      return;
    }
    setIsAddingChild(true);
    const res = await addChildProfile({
      nickname: newChildNickname,
      grade: newChildGrade,
      avatarPreset: newChildAvatar,
      selectedPetId: newChildPetId,
    });
    setIsAddingChild(false);
    if (!res.success) {
      setAddChildError(res.error || 'Não foi possível cadastrar o filho.');
      return;
    }
    sounds.playSuccess();
    setShowAddChild(false);
    setNewChildNickname('');
    setAddChildError('');
  };

  const handleSwitchChild = async (studentId: string) => {
    sounds.playClick();
    await switchStudentProfile(studentId);
  };

  // LGPD v2 (Fase 5.2): aceite versionado dos termos — derivado do guardião,
  // com marcação local apenas no evento de aceite (sem setState-in-effect)
  const guardianTermsVersion = (guardian as { accepted_terms_version?: number } | null)?.accepted_terms_version ?? null;
  const [justAcceptedVersion, setJustAcceptedVersion] = useState<number | null>(null);
  const [isAcceptingTerms, setIsAcceptingTerms] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const termsAcceptedVersion = justAcceptedVersion ?? guardianTermsVersion;
  const termsUpToDate = termsAcceptedVersion !== null && termsAcceptedVersion >= TERMS_VERSION;

  const handleAcceptTerms = async () => {
    setIsAcceptingTerms(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from('guardians')
        .update({ accepted_terms_version: TERMS_VERSION, accepted_terms_updated_at: new Date().toISOString() })
        .eq('id', user.id);
      if (!error) {
        setJustAcceptedVersion(TERMS_VERSION);
        sounds.playSuccess();
      }
    }
    setIsAcceptingTerms(false);
  };

  // LGPD: PORTABILIDADE — exporta todos os dados da família em JSON
  const handleExportData = async () => {
    if (isDemo || !isSupabaseConfigured) {
      setAddChildError('A exportação requer a conta real conectada.');
      return;
    }
    setIsExporting(true);
    sounds.playClick();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Sessão expirada');

      const exportData: Record<string, unknown> = {
        app: 'Kids-Player',
        exported_at: new Date().toISOString(),
        termos_aceitos_versao: termsAcceptedVersion,
      };

      exportData.guardiao = (await supabase.from('guardians').select('*').eq('id', user.id).single()).data;

      const { data: familyRows } = await supabase
        .from('profiles')
        .select('*')
        .or(`id.eq.${user.id},guardian_id.eq.${user.id}`);
      exportData.perfis_da_familia = familyRows;

      const ids = (familyRows || []).map(r => (r as { id: string }).id);
      if (ids.length > 0) {
        exportData.historico_de_moedas = (
          await supabase.from('points_ledger').select('student_id,amount,reason,created_at').in('student_id', ids)
        ).data;
        exportData.sessoes_de_jogo = (
          await supabase
            .from('game_sessions')
            .select('game_type,score,accuracy_percent,duration_seconds,created_at')
            .in('student_id', ids)
        ).data;
        exportData.configuracoes_modo_foco = (
          await supabase.from('focus_mode_settings').select('*').in('student_id', ids)
        ).data;
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'kids-player-meus-dados.json';
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setAddChildError('Não foi possível exportar agora. Tente novamente.');
    }
    setIsExporting(false);
  };

  // MODO ESCOLA (Fase 5.1): turmas do aluno ativo — entrada por código (RPC validada)
  const [turmaCode, setTurmaCode] = useState('');
  const [turmaError, setTurmaError] = useState('');
  const [turmas, setTurmas] = useState<{ id: string; name: string; school_grade: number }[]>([]);
  const [showJoinTurma, setShowJoinTurma] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const loadTurmas = async () => {
    if (!profile || isDemo || !isSupabaseConfigured) {
      setTurmas([]);
      return;
    }
    const { data } = await supabase
      .from('class_students')
      .select('id, class_id, classes(id, name, school_grade)')
      .eq('student_id', profile.id);
    const rows = ((data as { classes: { id: string; name: string; school_grade: number } | null }[] | null) || [])
      .filter(r => r.classes)
      .map(r => r.classes!);
    setTurmas(rows);
  };

  const handleJoinTurma = async () => {
    if (!profile || turmaCode.trim().length < 4) {
      setTurmaError('Confira o código com o professor.');
      return;
    }
    setIsJoining(true);
    setTurmaError('');
    const { error } = await supabase.rpc('join_class_by_code', {
      p_code: turmaCode.trim(),
      p_student_id: profile.id,
    });
    if (error) {
      setTurmaError(error.message);
    } else {
      sounds.playSuccess();
      trackEvent('turma_entrada', '/responsavel');
      setShowJoinTurma(false);
      setTurmaCode('');
      loadTurmas();
    }
    setIsJoining(false);
  };

  const handleLeaveTurma = async (classId: string) => {
    if (!profile) return;
    sounds.playClick();
    await supabase
      .from('class_students')
      .delete()
      .eq('class_id', classId)
      .eq('student_id', profile.id);
    loadTurmas();
  };

  useEffect(() => {
    loadTurmas();
  }, [profile?.id, isDemo]);

  const handleSaveSettings = () => {
    sounds.playSuccess();
    updateFocusSettings({
      session_duration_minutes: sessionMinutes,
      pause_interval_minutes: pauseMinutes,
      tts_auto_read: ttsEnabled,
      reduced_stimuli: reducedStimuli,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleResetData = () => {
    sounds.playClick();
    if (typeof window !== 'undefined') {
      localStorage.clear();
      window.location.href = '/';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 border-b-2 border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-pixel text-xs text-emerald-400">PAINEL DA FAMÍLIA</span>
            <span className="text-[10px] bg-slate-800 border border-slate-700 text-slate-300 px-2 py-0.5 rounded-full font-bold">
              ECA Digital & LGPD
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            Área dos Pais & Educadores 🛡️
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Acompanhe a dedicação, ajuste a acessibilidade pedagógica e garanta a segurança de <strong>{profile?.nickname || 'seu filho(a)'}</strong>.
          </p>
        </div>

        {/* IDENTIFICAÇÃO DO RESPONSÁVEL */}
        <div className="bg-slate-900 border-2 border-slate-800 p-3 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500 text-emerald-300 flex items-center justify-center font-bold">
            <UserCheck size={20} />
          </div>
          <div className="text-right sm:text-left">
            <span className="text-xs font-bold text-white block">
              {guardian?.full_name || 'Responsável Legal'}
            </span>
            <span className="text-[11px] text-slate-400 block">
              {guardian?.email || 'responsavel@exemplo.com'}
            </span>
          </div>
        </div>
      </div>

      {savedNotice && (
        <div className="mb-6 p-3 bg-emerald-950/90 border-2 border-emerald-400 rounded-xl text-emerald-200 text-xs font-bold text-center animate-scale-up">
          ✅ Preferências pedagógicas salvas com sucesso!
        </div>
      )}

      {/* ============================================================== */}
      {/* FILHOS & PERFIS DA FAMÍLIA (MULTI-PERFIL — FASE 2.2) */}
      {/* ============================================================== */}
      <div className="pixel-box bg-slate-900/90 p-6 mb-8 border-fuchsia-500/70">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <h3 className="font-pixel text-xs sm:text-sm text-fuchsia-300 flex items-center gap-2">
            <Users size={16} />
            FILHOS & PERFIS DA FAMÍLIA
          </h3>
          {!isDemo && isSupabaseConfigured ? (
            <PixelButton
              variant="primary"
              size="sm"
              onClick={() => {
                sounds.playClick();
                setAddChildError('');
                setShowAddChild(true);
              }}
              icon={<Plus size={14} />}
            >
              ADICIONAR FILHO
            </PixelButton>
          ) : (
            <span className="text-[10px] text-slate-500 max-w-[220px] text-right">
              Conecte a conta real para gerenciar vários filhos
            </span>
          )}
        </div>

        {isDemo ? (
          <p className="text-xs text-slate-400">
            No modo demonstração o painel usa um único perfil local. Crie uma conta real para cadastrar a família completa! ✨
          </p>
        ) : familyProfiles.length === 0 ? (
          <p className="text-xs text-slate-400">Nenhum perfil de filho vinculado a esta conta ainda.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {familyProfiles.map(child => {
              const isActive = child.id === profile?.id;
              return (
                <div
                  key={child.id}
                  className={`p-3 rounded-xl border-2 flex items-center gap-3 transition-all ${
                    isActive
                      ? 'bg-fuchsia-950/60 border-fuchsia-400 shadow-[0_0_10px_rgba(232,121,249,0.25)]'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-xl shrink-0" aria-hidden="true">
                    {AVATAR_PRESETS.find(a => a.id === child.avatar_preset)?.icon_name || '🙂'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-pixel text-[11px] text-white block truncate">
                      {child.nickname}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {child.school_grade}º ano · Nível {child.level} · {child.streak_days}d 🔥
                    </span>
                  </div>
                  {isActive ? (
                    <span className="text-[10px] font-pixel text-fuchsia-300 shrink-0" title="Perfil em jogo agora">
                      ATIVO ★
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSwitchChild(child.id)}
                      className="text-[10px] font-pixel bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 px-2 py-1 rounded-lg shrink-0 transition-colors"
                      aria-label={`Tornar ${child.nickname} o perfil ativo`}
                    >
                      USAR
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 4 CARDS DE MÉTRICAS REAIS (servidor, aluno ativo) */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

        {/* Tempo de Estudo */}
        <div className="pixel-box bg-slate-900/90 p-4 border-cyan-500/60">
          <div className="flex items-center justify-between text-cyan-400 mb-2">
            <span className="font-pixel text-[10px]">TEMPO DE FOCO</span>
            <Clock size={16} />
          </div>
          <div className="font-pixel text-xl text-cyan-300 mb-1">
            {totalMinutes} Minuto{totalMinutes === 1 ? '' : 's'}
          </div>
          <p className="text-[10px] text-slate-400">
            {isLoadingStats ? 'Somando sessões...' : `${sessions.length} sessõe${sessions.length === 1 ? '' : 's'} registrada${sessions.length === 1 ? '' : 's'} no servidor.`}
          </p>
        </div>

        {/* Precisão Geral */}
        <div className="pixel-box bg-slate-900/90 p-4 border-emerald-500/60">
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="font-pixel text-[10px]">PRECISÃO MÉDIA</span>
            <Award size={16} />
          </div>
          <div className="font-pixel text-xl text-emerald-300 mb-1">
            {avgAccuracy}% Acertos
          </div>
          <p className="text-[10px] text-slate-400">
            {avgAccuracy >= 80 ? 'Excelente aproveitamento em 1ª tentativa!' : avgAccuracy > 0 ? 'Cada tentativa deixa o raciocínio mais forte!' : 'Jogue minijogos para gerar o histórico de precisão.'}
          </p>
        </div>

        {/* Disciplina Mais Praticada */}
        <div className="pixel-box bg-slate-900/90 p-4 border-amber-500/60">
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <span className="font-pixel text-[10px]">DESTAQUE</span>
            <BookOpen size={16} />
          </div>
          <div className="font-pixel text-lg text-yellow-300 mb-1 truncate">
            {topSubject ? topSubject.name : 'Explorando tudo ✨'}
          </div>
          <p className="text-[10px] text-slate-400">
            {topSubject ? `${profile?.school_grade}º Ano · ${topSubject.bncc_focus}.` : 'A matéria favorita aparece após os primeiros jogos.'}
          </p>
        </div>

        {/* Constância Semanal */}
        <div className="pixel-box bg-slate-900/90 p-4 border-orange-500/60">
          <div className="flex items-center justify-between text-orange-400 mb-2">
            <span className="font-pixel text-[10px]">CONSTÂNCIA</span>
            <Heart size={16} className="text-rose-500 fill-rose-500" />
          </div>
          <div className="font-pixel text-xl text-orange-400 mb-1">
            {profile?.streak_days || 1} Dias Seguidos
          </div>
          <p className="text-[10px] text-slate-400">
            Hábito diário de estudo consolidado!
          </p>
        </div>

      </div>

      {/* ============================================================== */}
      {/* DISTRIBUIÇÃO PEDAGÓGICA POR MATÉRIA (BNCC) — DADOS REAIS */}
      {/* ============================================================== */}
      <div className="pixel-box bg-slate-900/90 p-6 mb-8 border-indigo-500/70">
        <h3 className="font-pixel text-xs sm:text-sm text-indigo-300 mb-4 flex items-center gap-2">
          <BookOpen size={16} />
          DISTRIBUIÇÃO DO TEMPO POR MATÉRIA ESCOLAR
        </h3>

        {bySubject.size === 0 ? (
          <p className="text-xs text-slate-400">
            Nenhuma sessão registrada ainda — a distribuição aparece conforme {profile?.nickname || 'seu filho(a)'} joga os minijogos. 🎮
          </p>
        ) : (
          <>
            {/* Barra de Distribuição Horizontal (percentuais reais) */}
            <div className="w-full h-5 rounded-full overflow-hidden flex border-2 border-slate-950 shadow-inner mb-4">
              {[...bySubject.entries()].map(([subjectId, count]) => {
                const pct = Math.round((count / sessions.length) * 100);
                return (
                  <div
                    key={subjectId}
                    style={{ width: `${pct}%` }}
                    className={SUBJECT_COLORS[subjectId] || 'bg-slate-500'}
                    title={`${subjectName(subjectId)}: ${pct}% (${count} sessões)`}
                  />
                );
              })}
            </div>

            {/* Legendas e Detalhes */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
              {[...bySubject.entries()]
                .sort((a, b) => b[1] - a[1])
                .map(([subjectId, count]) => {
                  const pct = Math.round((count / sessions.length) * 100);
                  return (
                    <div key={subjectId} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full shrink-0 ${SUBJECT_COLORS[subjectId] || 'bg-slate-500'}`} />
                      <span className="text-slate-300 truncate">
                        {subjectName(subjectId)} ({pct}%)
                      </span>
                    </div>
                  );
                })}
            </div>
          </>
        )}
      </div>

      {/* ============================================================== */}
      {/* TURMAS & DEVERES DA ESCOLA (MODO ESCOLA — FASE 5.1) */}
      {/* ============================================================== */}
      <div className="pixel-box bg-slate-900/90 p-6 mb-8 border-indigo-500/70">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <h3 className="font-pixel text-xs sm:text-sm text-indigo-300 flex items-center gap-2">
            <School size={16} />
            TURMAS & DEVERES DA ESCOLA
          </h3>
          {isDemo || !isSupabaseConfigured ? (
            <span className="text-[10px] text-slate-500 max-w-[220px] text-right">
              Conecte a conta real para entrar em turmas com o código do professor
            </span>
          ) : (
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setTurmaError('');
                setShowJoinTurma(s => !s);
              }}
              className="text-[11px] font-pixel bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-xl transition-colors shrink-0"
            >
              + ENTRAR COM CÓDIGO
            </button>
          )}
        </div>

        <p className="text-[11px] text-slate-400 mb-3">
          Perfil ativo: <strong className="text-white">{profile?.nickname || '—'}</strong>.
          O professor vê apenas o apelido e o desempenho pedagógico — seus dados e o Modo Foco
          ficam protegidos.
        </p>

        {showJoinTurma && (
          <div className="flex flex-col sm:flex-row gap-2 mb-4 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <input
              type="text"
              value={turmaCode}
              onChange={e => {
                setTurmaCode(e.target.value.toUpperCase());
                setTurmaError('');
              }}
              placeholder="CÓDIGO DA TURMA (ex.: A1B2C3D4)"
              maxLength={12}
              className="flex-1 bg-slate-900 border-2 border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono uppercase tracking-wider"
            />
            <button
              type="button"
              onClick={handleJoinTurma}
              disabled={isJoining}
              className="text-xs font-pixel bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl disabled:opacity-50 shrink-0"
            >
              {isJoining ? '...' : 'ENTRAR'}
            </button>
          </div>
        )}
        {turmaError && (
          <p className="text-[11px] text-rose-300 bg-rose-950/60 border border-rose-700 rounded-lg px-3 py-2 mb-3">
            ⚠️ {turmaError}
          </p>
        )}

        {turmas.length === 0 ? (
          <p className="text-xs text-slate-400">
            {profile?.nickname || 'Seu filho(a)'} ainda não está em nenhuma turma. Com o código do
            professor em mãos, toque em ENTRAR COM CÓDIGO!
          </p>
        ) : (
          <div className="space-y-2">
            {turmas.map(t => (
              <div key={t.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-white block">{t.name}</span>
                  <span className="text-[10px] text-slate-400">{t.school_grade}º ano</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleLeaveTurma(t.id)}
                  className="text-[10px] bg-rose-950 hover:bg-rose-900 border border-rose-600 text-rose-300 px-2.5 py-1.5 rounded-lg transition-colors shrink-0"
                >
                  SAIR DA TURMA
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* AJUSTES FINOS DO MODO FOCO (CONFIGURÁVEL PELO RESPONSÁVEL) */}
      {/* ============================================================== */}
      <div className="pixel-box bg-slate-900/90 p-6 mb-8 border-emerald-500/80">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-pixel text-xs sm:text-sm text-emerald-300 flex items-center gap-2">
              <Settings size={16} />
              CONFIGURAÇÃO DO MODO FOCO & ACESSIBILIDADE (TDAH / ATENÇÃO)
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Personalize o ritmo de estudos ideal para o perfil da criança.
            </p>
          </div>

          <button
            type="button"
            onClick={() => toggleFocusMode(!focusMode.is_active)}
            className={`font-pixel text-xs px-4 py-2 rounded-xl border-2 transition-all ${
              focusMode.is_active
                ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-[0_3px_0_#065f46]'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            {focusMode.is_active ? 'MODO FOCO ATIVADO ✅' : 'MODO FOCO DESATIVADO ❌'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950/70 p-5 rounded-2xl border border-slate-800 mb-6">
          
          {/* Duração das Micro-Sessões */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold mb-2">
              <span className="text-slate-200">Duração da Micro-Sessão:</span>
              <span className="font-pixel text-emerald-300">{sessionMinutes} Minutos</span>
            </div>
            <input
              type="range"
              min={3}
              max={10}
              step={1}
              value={sessionMinutes}
              onChange={e => setSessionMinutes(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Recomendado: 4 a 5 minutos por sessão para manter o engajamento sem sobrecarga cognitiva.
            </p>
          </div>

          {/* Duração das Pausas com o Pet */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold mb-2">
              <span className="text-slate-200">Intervalo de Pausa Relaxante:</span>
              <span className="font-pixel text-cyan-300">{pauseMinutes} Minutos</span>
            </div>
            <input
              type="range"
              min={3}
              max={8}
              step={1}
              value={pauseMinutes}
              onChange={e => setPauseMinutes(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Pausa guiada com respiração, alongamento e mensagens carinhosas do pet companheiro.
            </p>
          </div>

          {/* Leitura em Voz Alta (TTS) */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="text-xs font-bold text-white block">Leitura em Voz Alta Automática (TTS)</span>
              <p className="text-[11px] text-slate-400">
                O narrador lê as perguntas e enunciados automaticamente ao abrir cada tela.
              </p>
            </div>
            <input
              type="checkbox"
              checked={ttsEnabled}
              onChange={e => setTtsEnabled(e.target.checked)}
              className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
            />
          </div>

          {/* Redução de Estímulos e Animações */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="text-xs font-bold text-white block">Redução de Estímulos Visuais</span>
              <p className="text-[11px] text-slate-400">
                Oculta confetes excessivos e trilhas de partículas para evitar distrações.
              </p>
            </div>
            <input
              type="checkbox"
              checked={reducedStimuli}
              onChange={e => setReducedStimuli(e.target.checked)}
              className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
            />
          </div>

        </div>

        <div className="text-right">
          <PixelButton variant="success" size="md" onClick={handleSaveSettings}>
            SALVAR PREFERÊNCIAS 💾
          </PixelButton>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SEGURANÇA, PRIVACIDADE & LGPD INFANTIL */}
      {/* ============================================================== */}
      <div className="pixel-box bg-slate-900/90 p-6 mb-8 border-cyan-500/80">
        <h3 className="font-pixel text-xs sm:text-sm text-cyan-300 mb-4 flex items-center gap-2">
          <ShieldCheck size={18} />
          GARANTIAS DE PROTEÇÃO E PRIVACIDADE (ECA DIGITAL & LGPD)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
            <span className="text-emerald-400 font-bold block mb-1">✅ Zero Publicidade</span>
            <p className="text-slate-400 text-[11px]">Nenhum anúncio ou rastreador comercial de terceiros.</p>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
            <span className="text-emerald-400 font-bold block mb-1">✅ Zero Dinheiro Real</span>
            <p className="text-slate-400 text-[11px]">Moedas e baús são obtidos exclusivamente estudando.</p>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
            <span className="text-emerald-400 font-bold block mb-1">✅ Zero Chat Aberto</span>
            <p className="text-slate-400 text-[11px]">Crianças não conversam com estranhos na plataforma.</p>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
            <span className="text-emerald-400 font-bold block mb-1">✅ Controle Total</span>
            <p className="text-slate-400 text-[11px]">Você pode apagar ou alterar os dados a qualquer instante.</p>
          </div>
        </div>

        {/* Zona de Gerenciamento de Dados (LGPD v2 — Fase 5.2) */}
        <div className="border-t border-slate-800 pt-4 space-y-4">
          {/* Termos de uso versionados */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
              <div>
                <span className="text-xs font-bold text-white block">
                  Termos de Uso & Privacidade — versão {TERMS_VERSION} ({TERMS_UPDATED_AT})
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {termsUpToDate
                    ? '✅ Você está na versão mais recente dos termos.'
                    : termsAcceptedVersion === null
                      ? 'Conta criada antes do versionamento — confira e confirme os termos atuais.'
                      : `⚠️ Você aceitou a versão ${termsAcceptedVersion}. Uma nova versão está disponível.`}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setShowTerms(s => !s);
                  }}
                  className="text-[11px] bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                  {showTerms ? 'OCULTAR' : 'LER TERMOS'}
                </button>
                {!termsUpToDate && (
                  <button
                    type="button"
                    onClick={handleAcceptTerms}
                    disabled={isAcceptingTerms}
                    className="text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isAcceptingTerms ? '...' : 'ACEITAR'}
                  </button>
                )}
              </div>
            </div>
            {showTerms && (
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {TERMS_SECTIONS.map(section => (
                  <div key={section.title}>
                    <span className="text-[11px] font-bold text-emerald-300 block">{section.title}</span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{section.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Portabilidade e exclusão */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-400">
              Direito de portabilidade (LGPD): baixe todos os dados da sua família em JSON, ou limpe os dados
              guardados neste navegador.
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleExportData}
                disabled={isExporting}
                className="text-xs bg-cyan-950 hover:bg-cyan-900 border border-cyan-500 text-cyan-300 px-3 py-2 rounded-xl transition-colors disabled:opacity-50"
              >
                {isExporting ? 'GERANDO...' : 'BAIXAR MEUS DADOS 📄'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmResetModal(true)}
                className="text-xs bg-rose-950 hover:bg-rose-900 border border-rose-500 text-rose-300 px-3 py-2 rounded-xl transition-colors"
              >
                Limpar Deste Dispositivo 🗑️
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* DICAS PEDAGÓGICAS DA SEMANA PARA A FAMÍLIA */}
      {/* ============================================================== */}
      <div className="pixel-box bg-slate-900/90 p-6 mb-8 border-amber-500/80">
        <h3 className="font-pixel text-xs sm:text-sm text-amber-300 mb-4 flex items-center gap-2">
          <Lightbulb size={18} />
          CONSELHOS PEDAGÓGICOS DA SEMANA PARA A FAMÍLIA
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="font-pixel text-[11px] text-yellow-300 block mb-1.5">
              1. Elogie a Dedicação
            </span>
            <p className="text-slate-300 leading-relaxed">
              Em vez de dizer apenas &ldquo;você é inteligente&rdquo;, diga &ldquo;adorei ver você tentando até conseguir&rdquo;. Isso desenvolve a mentalidade de crescimento.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="font-pixel text-[11px] text-emerald-300 block mb-1.5">
              2. Respeite as Micro-Pausas
            </span>
            <p className="text-slate-300 leading-relaxed">
              O cérebro na infância consolida novas conexões neuronais durante os momentos de descanso. 4 minutos de foco com 5 minutos de pausa valem ouro.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="font-pixel text-[11px] text-cyan-300 block mb-1.5">
              3. Conecte com a Vida Real
            </span>
            <p className="text-slate-300 leading-relaxed">
              Pergunte ao seu filho como ele usaria o que aprendeu em Ciências e Matemática para resolver algo no supermercado ou na preparação de uma receita!
            </p>
          </div>

        </div>
      </div>

      {/* MODAL: ADICIONAR FILHO (MULTI-PERFIL) */}
      {showAddChild && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="pixel-box bg-slate-900 max-w-lg w-full p-6 border-fuchsia-500 animate-scale-up max-h-[90vh] overflow-y-auto">
            <h2 className="font-pixel text-base text-fuchsia-300 mb-2">
              NOVO FILHO NA FAMÍLIA ✨
            </h2>
            <p className="text-[11px] text-slate-400 mb-5">
              Crie o perfil de aventura do seu filho. Ele ganha 200 moedas de boas-vindas e um PET companheiro!
            </p>

            {/* Apelido moderado */}
            <label className="text-xs font-bold text-white block mb-1" htmlFor="novo-filho-apelido">
              Apelido de herói (sem dados reais, conforme o ECA):
            </label>
            <input
              id="novo-filho-apelido"
              type="text"
              maxLength={20}
              value={newChildNickname}
              onChange={e => {
                setNewChildNickname(e.target.value);
                setAddChildError('');
              }}
              placeholder="Ex.: DinossauroAzul"
              className="w-full bg-slate-950 border-2 border-slate-700 focus:border-fuchsia-400 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-600 mb-4"
            />

            {/* Série */}
            <span className="text-xs font-bold text-white block mb-1.5">Ano escolar:</span>
            <div className="flex gap-2 mb-4">
              {[3, 4, 5].map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setNewChildGrade(g as 3 | 4 | 5)}
                  className={`font-pixel text-xs px-4 py-2 rounded-xl border-2 transition-all ${
                    newChildGrade === g
                      ? 'bg-fuchsia-500 text-slate-950 border-fuchsia-300'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  {g}º ANO
                </button>
              ))}
            </div>

            {/* Avatar */}
            <span className="text-xs font-bold text-white block mb-1.5">Avatar:</span>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-4">
              {AVATAR_PRESETS.map(a => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setNewChildAvatar(a.id)}
                  title={a.name}
                  aria-label={`Escolher avatar ${a.name}`}
                  className={`aspect-square rounded-xl border-2 flex items-center justify-center text-2xl transition-all ${
                    newChildAvatar === a.id
                      ? 'bg-fuchsia-500/20 border-fuchsia-400 scale-105'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-600'
                  }`}
                >
                  {a.icon_name}
                </button>
              ))}
            </div>

            {/* Pet inicial */}
            <span className="text-xs font-bold text-white block mb-1.5">PET companheiro:</span>
            <div className="grid grid-cols-5 gap-2 mb-5">
              {PET_CATALOG.slice(0, 5).map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setNewChildPetId(p.id)}
                  title={p.name}
                  aria-label={`Escolher pet ${p.name}`}
                  className={`aspect-square rounded-xl border-2 flex items-center justify-center transition-all ${
                    newChildPetId === p.id
                      ? 'bg-fuchsia-500/20 border-fuchsia-400 scale-105'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-600'
                  }`}
                >
                  <PetIcon petId={p.id} size={36} />
                </button>
              ))}
            </div>

            {addChildError && (
              <p className="text-[11px] text-rose-300 bg-rose-950/60 border border-rose-700 rounded-lg px-3 py-2 mb-4">
                ⚠️ {addChildError}
              </p>
            )}

            <div className="flex items-center justify-end gap-3">
              <PixelButton
                variant="dark"
                size="sm"
                onClick={() => {
                  sounds.playClick();
                  setShowAddChild(false);
                  setAddChildError('');
                }}
              >
                CANCELAR
              </PixelButton>
              <PixelButton
                variant="primary"
                size="sm"
                onClick={handleAddChild}
                disabled={isAddingChild || newChildNickname.trim().length < 3}
              >
                {isAddingChild ? 'CRIANDO...' : 'CRIAR PERFIL 🚀'}
              </PixelButton>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE RESET */}
      {confirmResetModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="pixel-box bg-slate-900 max-w-md w-full p-6 text-center border-rose-500 animate-scale-up">
            <div className="w-16 h-16 bg-rose-950 border-3 border-rose-500 rounded-2xl mx-auto flex items-center justify-center mb-4">
              <AlertTriangle size={32} className="text-rose-400" />
            </div>
            <h2 className="font-pixel text-base text-rose-300 mb-2">
              CONFIRMAR LIMPEZA DE DADOS?
            </h2>
            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              Esta ação irá apagar todas as moedas, histórico de missões e pets salvos neste computador. O aluno começará do nível 1 como um novo herói.
            </p>
            <div className="flex items-center justify-center gap-3">
              <PixelButton
                variant="danger"
                size="sm"
                onClick={handleResetData}
              >
                SIM, LIMPAR TUDO
              </PixelButton>
              <PixelButton
                variant="primary"
                size="sm"
                onClick={() => setConfirmResetModal(false)}
              >
                CANCELAR
              </PixelButton>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
