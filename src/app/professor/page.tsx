'use client';

import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { SUBJECTS } from '../../lib/content-data';
import { sounds } from '../../lib/sound-effects';
import { PixelButton } from '../../components/PixelButton';
import {
  GraduationCap, Users, LogOut, Plus, Copy, Check,
  ArrowLeft, ClipboardList, School, Lock
} from 'lucide-react';

type Phase = 'entrar' | 'criar' | 'painel';

interface ClassRow {
  id: string;
  name: string;
  school_grade: number;
  invite_code: string;
  is_active: boolean;
}

interface StudentRow {
  student_id: string;
  profiles: { nickname: string; school_grade: number; level: number; streak_days: number } | null;
}

interface AssignmentRow {
  id: string;
  title: string;
  description: string | null;
  subject_id: string | null;
  target_sessions: number;
  due_date: string | null;
}

interface SessionRow {
  student_id: string;
  subject_id: string | null;
  duration_seconds: number;
  accuracy_percent: number | null;
  created_at: string;
}

export default function ProfessorPage() {
  const [phase, setPhase] = useState<Phase>('entrar');
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [teacherName, setTeacherName] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Formulários
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupSchool, setSignupSchool] = useState('');

  // Painel
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [activeClass, setActiveClass] = useState<ClassRow | null>(null);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [weekSessions, setWeekSessions] = useState<SessionRow[]>([]);
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassGrade, setNewClassGrade] = useState<3 | 4 | 5>(3);
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentSubject, setAssignmentSubject] = useState<string>('');
  const [assignmentTarget, setAssignmentTarget] = useState(3);
  const [copiedCode, setCopiedCode] = useState(false);

  // Verifica sessão de professor existente ao abrir
  useEffect(() => {
    const checkSession = async () => {
      if (!isSupabaseConfigured) {
        setIsLoading(false);
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: teacher } = await supabase
          .from('teachers')
          .select('id, full_name')
          .eq('id', user.id)
          .single();
        if (teacher) {
          setTeacherId(user.id);
          setTeacherName((teacher as { full_name: string }).full_name);
          setPhase('painel');
        }
      }
      setIsLoading(false);
    };
    checkSession();
  }, []);

  const handleSignup = async () => {
    setErrorMessage('');
    setIsLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: loginEmail,
      password: loginPassword,
    });
    if (error || !data.user) {
      setErrorMessage(error?.message || 'Não foi possível criar a conta.');
      setIsLoading(false);
      return;
    }
    const { error: teacherErr } = await supabase.from('teachers').insert({
      id: data.user.id,
      email: loginEmail,
      full_name: signupName,
      school_name: signupSchool || null,
    });
    if (teacherErr) {
      setErrorMessage(teacherErr.message);
      setIsLoading(false);
      return;
    }
    setTeacherId(data.user.id);
    setTeacherName(signupName);
    sounds.playSuccess();
    setPhase('painel');
    setIsLoading(false);
  };

  const handleLogin = async () => {
    setErrorMessage('');
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });
    if (error || !data.user) {
      setErrorMessage(error?.message || 'E-mail ou senha incorretos.');
      setIsLoading(false);
      return;
    }
    const { data: teacher } = await supabase
      .from('teachers')
      .select('id, full_name')
      .eq('id', data.user.id)
      .single();
    if (!teacher) {
      setErrorMessage('Esta conta não é de professor. Peça ao responsável o painel da família.');
      await supabase.auth.signOut();
      setIsLoading(false);
      return;
    }
    setTeacherId(data.user.id);
    setTeacherName((teacher as { full_name: string }).full_name);
    sounds.playSuccess();
    setPhase('painel');
    setIsLoading(false);
  };

  const handleLogout = async () => {
    sounds.playClick();
    await supabase.auth.signOut();
    setPhase('entrar');
    setTeacherId(null);
    setActiveClass(null);
  };

  // Carrega turmas do professor
  const loadClasses = async () => {
    if (!teacherId) return;
    const { data } = await supabase
      .from('classes')
      .select('id, name, school_grade, invite_code, is_active')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: true });
    setClasses((data as ClassRow[] | null) || []);
  };

  useEffect(() => {
    if (phase === 'painel' && teacherId) {
      // setState acontece assincronamente dentro do loadClasses (apos await) — padrão de data fetching legítimo
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadClasses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- loadClasses é estável no escopo deste effect (fecha sobre teacherId imutável)
  }, [phase, teacherId]);

  const openClass = async (cls: ClassRow) => {
    sounds.playClick();
    setActiveClass(cls);
    setStudents([]);
    setWeekSessions([]);
    setAssignments([]);
    setShowCreateClass(false);

    const [enrollments, assignmentsData] = await Promise.all([
      supabase
        .from('class_students')
        .select('student_id, profiles(nickname, school_grade, level, streak_days)')
        .eq('class_id', cls.id),
      supabase
        .from('class_assignments')
        .select('id, title, description, subject_id, target_sessions, due_date')
        .eq('class_id', cls.id)
        .order('created_at', { ascending: false }),
    ]);
    setStudents((enrollments.data as unknown as StudentRow[] | null) || []);
    setAssignments((assignmentsData.data as AssignmentRow[] | null) || []);

    const ids = (enrollments.data || []).map(e => (e as unknown as { student_id: string }).student_id);
    if (ids.length > 0) {
      const weekAgoDate = new Date();
      weekAgoDate.setDate(weekAgoDate.getDate() - 7);
      const weekAgo = weekAgoDate.toISOString();
      const { data: sessionsData } = await supabase
        .from('game_sessions')
        .select('student_id, subject_id, duration_seconds, accuracy_percent, created_at')
        .in('student_id', ids)
        .gte('created_at', weekAgo);
      setWeekSessions((sessionsData as SessionRow[] | null) || []);
    }
  };

  const handleCreateClass = async () => {
    if (!teacherId || newClassName.trim().length < 3) return;
    sounds.playClick();
    const { error } = await supabase.from('classes').insert({
      teacher_id: teacherId,
      name: newClassName.trim(),
      school_grade: newClassGrade,
    });
    if (!error) {
      sounds.playSuccess();
      setShowCreateClass(false);
      setNewClassName('');
      loadClasses();
    } else {
      setErrorMessage(error.message);
    }
  };

  const handleCreateAssignment = async () => {
    if (!activeClass || assignmentTitle.trim().length < 3) return;
    sounds.playClick();
    const { error } = await supabase.from('class_assignments').insert({
      class_id: activeClass.id,
      title: assignmentTitle.trim(),
      subject_id: assignmentSubject || null,
      target_sessions: assignmentTarget,
    });
    if (!error) {
      sounds.playSuccess();
      setShowCreateAssignment(false);
      setAssignmentTitle('');
      openClass(activeClass);
    }
  };

  const copyInviteCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {}
  };

  const studentWeekSessions = (studentId: string, subjectId?: string) =>
    weekSessions.filter(
      s => s.student_id === studentId && (!subjectId || s.subject_id === subjectId)
    );

  // ================================================================
  // TELAS DE AUTENTICAÇÃO DO PROFESSOR
  // ================================================================
  if (isLoading) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <p className="font-pixel text-xs text-slate-400 animate-pulse">CARREGANDO...</p>
      </div>
    );
  }

  if (phase !== 'painel') {
    const isSignup = phase === 'criar';
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 border-4 border-indigo-300 rounded-2xl mx-auto flex items-center justify-center mb-3 shadow-lg">
            <GraduationCap size={36} className="text-white" />
          </div>
          <h1 className="font-pixel text-lg text-indigo-300">PAINEL DO PROFESSOR</h1>
          <p className="text-xs text-slate-400 mt-2">
            Turmas, códigos de convite e o acompanhamento BNCC dos seus alunos.
          </p>
        </div>

        <div className="pixel-box bg-slate-900/95 p-6 border-indigo-400/70">
          {isSignup && (
            <>
              <label className="text-xs font-bold text-white block mb-1">Seu nome:</label>
              <input
                type="text"
                value={signupName}
                onChange={e => setSignupName(e.target.value)}
                placeholder="Prof. Ana"
                className="w-full bg-slate-950 border-2 border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white mb-3"
              />
              <label className="text-xs font-bold text-white block mb-1">Escola (opcional):</label>
              <input
                type="text"
                value={signupSchool}
                onChange={e => setSignupSchool(e.target.value)}
                placeholder="E.M. Monteiro Lobato"
                className="w-full bg-slate-950 border-2 border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white mb-3"
              />
            </>
          )}
          <label className="text-xs font-bold text-white block mb-1">E-mail:</label>
          <input
            type="email"
            value={loginEmail}
            onChange={e => setLoginEmail(e.target.value)}
            placeholder="professor@escola.com"
            className="w-full bg-slate-950 border-2 border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white mb-3"
          />
          <label className="text-xs font-bold text-white block mb-1">Senha:</label>
          <input
            type="password"
            value={loginPassword}
            onChange={e => setLoginPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            className="w-full bg-slate-950 border-2 border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white mb-4"
            onKeyDown={e => e.key === 'Enter' && (isSignup ? handleSignup() : handleLogin())}
          />

          {errorMessage && (
            <p className="text-[11px] text-rose-300 bg-rose-950/60 border border-rose-700 rounded-lg px-3 py-2 mb-4">
              ⚠️ {errorMessage}
            </p>
          )}

          <PixelButton
            variant={isSignup ? 'success' : 'primary'}
            size="md"
            className="w-full"
            onClick={isSignup ? handleSignup : handleLogin}
          >
            {isSignup ? 'CRIAR CONTA DE PROFESSOR 🎓' : 'ENTRAR 🔑'}
          </PixelButton>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setErrorMessage('');
              setPhase(isSignup ? 'entrar' : 'criar');
            }}
            className="w-full text-center text-[11px] text-slate-400 hover:text-white mt-4"
          >
            {isSignup ? 'Já tenho conta de professor — entrar' : 'Sou professor(a) e quero criar minha conta'}
          </button>
        </div>

        <div className="mt-5 flex items-start gap-2 text-[10px] text-slate-500 bg-slate-900/60 border border-slate-800 rounded-xl p-3">
          <Lock size={13} className="shrink-0 mt-0.5" />
          <p>
            Privacidade garantida: o professor vê apenas o apelido, a série e o desempenho
            pedagógico dos alunos da turma. Dados dos responsáveis e o Modo Foco nunca
            ficam visíveis para a escola.
          </p>
        </div>
      </div>
    );
  }

  // ================================================================
  // PAINEL DO PROFESSOR
  // ================================================================
  if (!activeClass) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="font-pixel text-[10px] text-indigo-400 block mb-1">MODO ESCOLA</span>
            <h1 className="text-xl font-extrabold text-white">Olá, {teacherName}! 🎓</h1>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-3 py-2 rounded-xl flex items-center gap-1.5"
          >
            <LogOut size={14} /> SAIR
          </button>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="font-pixel text-xs text-slate-300 flex items-center gap-2">
            <School size={15} className="text-amber-400" /> MINHAS TURMAS
          </h2>
          <PixelButton
            variant="primary"
            size="sm"
            onClick={() => {
              sounds.playClick();
              setShowCreateClass(s => !s);
            }}
            icon={<Plus size={14} />}
          >
            NOVA TURMA
          </PixelButton>
        </div>

        {showCreateClass && (
          <div className="pixel-box bg-slate-900/95 p-4 mb-5 border-indigo-400/60">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={newClassName}
                onChange={e => setNewClassName(e.target.value)}
                placeholder="Nome da turma (ex.: Turma 3ºA)"
                className="flex-1 bg-slate-950 border-2 border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
              />
              <div className="flex gap-2">
                {[3, 4, 5].map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setNewClassGrade(g as 3 | 4 | 5)}
                    className={`font-pixel text-xs px-4 rounded-xl border-2 ${
                      newClassGrade === g
                        ? 'bg-indigo-500 text-white border-indigo-300'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {g}º
                  </button>
                ))}
              </div>
              <PixelButton variant="success" size="sm" onClick={handleCreateClass}>
                CRIAR
              </PixelButton>
            </div>
          </div>
        )}

        {classes.length === 0 ? (
          <div className="pixel-box bg-slate-900/95 p-8 text-center border-slate-700">
            <Users size={36} className="text-slate-600 mx-auto mb-3" />
            <p className="text-xs text-slate-400">
              Nenhuma turma ainda. Crie a primeira e compartilhe o código de convite
              com as famílias!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classes.map(cls => (
              <button
                key={cls.id}
                type="button"
                onClick={() => openClass(cls)}
                className="pixel-box bg-slate-900/95 p-5 text-left border-indigo-400/60 hover:border-indigo-300 hover:scale-[1.01] transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-pixel text-xs text-white">{cls.name}</span>
                  <span className="font-pixel text-[10px] text-amber-300">{cls.school_grade}º ANO</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span className="bg-slate-950 border border-slate-700 px-2 py-1 rounded font-mono">
                    🔗 {cls.invite_code}
                  </span>
                  <span>Toque para ver a turma</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ================================================================
  // DETALHE DA TURMA: alunos, código e deveres
  // ================================================================
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            setActiveClass(null);
          }}
          className="text-xs font-pixel text-slate-400 hover:text-white flex items-center gap-1"
        >
          <ArrowLeft size={13} /> MINHAS TURMAS
        </button>
        <button
          type="button"
          onClick={() => copyInviteCode(activeClass.invite_code)}
          className="text-xs bg-amber-950 border-2 border-amber-500 text-amber-200 px-3 py-1.5 rounded-xl flex items-center gap-2 hover:bg-amber-900 transition-colors"
          title="Clique para copiar"
        >
          <span className="font-mono font-bold">{activeClass.invite_code}</span>
          {copiedCode ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
        </button>
      </div>

      <div className="pixel-box bg-slate-900/95 p-5 mb-6 border-indigo-400/70">
        <h1 className="text-lg font-extrabold text-white flex items-center gap-2 mb-1">
          {activeClass.name}
        </h1>
        <p className="text-xs text-slate-400 mb-4">
          Compartilhe o código <strong className="text-amber-300">{activeClass.invite_code}</strong> com
          as famílias — elas entram pelo Painel dos Pais, seção TURMAS.
        </p>

        <div className="flex items-center justify-between mb-3">
          <h3 className="font-pixel text-[11px] text-slate-300 flex items-center gap-2">
            <Users size={14} className="text-indigo-400" /> ALUNOS ({students.length})
          </h3>
          <span className="text-[10px] text-slate-500">Sessões dos últimos 7 dias</span>
        </div>

        {students.length === 0 ? (
          <p className="text-xs text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800">
            Nenhum aluno entrou ainda. Assim que uma família usar o código, o herói aparece aqui! ✨
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-slate-400 font-bold border-b border-slate-800">
                  <th className="py-2 pr-3">Herói</th>
                  <th className="py-2 pr-3">Nível</th>
                  <th className="py-2 pr-3">🔥 Streak</th>
                  <th className="py-2 pr-3">Sessões (7d)</th>
                  <th className="py-2">Matéria favorita</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => {
                  const profile = s.profiles;
                  const sessions = studentWeekSessions(s.student_id);
                  const bySubject = new Map<string, number>();
                  sessions.forEach(sess => {
                    const key = sess.subject_id || 'outros';
                    bySubject.set(key, (bySubject.get(key) || 0) + 1);
                  });
                  const fav = [...bySubject.entries()].sort((a, b) => b[1] - a[1])[0];
                  const favName = fav ? SUBJECTS.find(sub => sub.id === fav[0])?.name || fav[0] : '—';
                  return (
                    <tr key={s.student_id} className="border-b border-slate-800/60 text-slate-200">
                      <td className="py-2.5 pr-3 font-bold">{profile?.nickname || 'Herói'}</td>
                      <td className="py-2.5 pr-3">Nv {profile?.level || 1}</td>
                      <td className="py-2.5 pr-3">{profile?.streak_days || 0}d</td>
                      <td className="py-2.5 pr-3">
                        <span className="text-emerald-300 font-bold">{sessions.length}</span>
                      </td>
                      <td className="py-2.5 text-slate-400">{favName}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DEVERES DA TURMA */}
      <div className="pixel-box bg-slate-900/95 p-5 border-amber-400/60">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-pixel text-[11px] text-amber-300 flex items-center gap-2">
            <ClipboardList size={14} /> DEVERES DE ESTUDO
          </h3>
          <PixelButton
            variant="warning"
            size="sm"
            onClick={() => {
              sounds.playClick();
              setShowCreateAssignment(s => !s);
            }}
            icon={<Plus size={14} />}
          >
            NOVO DEVER
          </PixelButton>
        </div>

        {showCreateAssignment && (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-4 space-y-3">
            <input
              type="text"
              value={assignmentTitle}
              onChange={e => setAssignmentTitle(e.target.value)}
              placeholder="Título do dever (ex.: Treino de tabuada!)"
              className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <select
                value={assignmentSubject}
                onChange={e => setAssignmentSubject(e.target.value)}
                className="bg-slate-900 border-2 border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
              >
                <option value="">Qualquer matéria</option>
                {SUBJECTS.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <div className="flex items-center gap-2 bg-slate-900 border-2 border-slate-700 rounded-xl px-3">
                <span className="text-xs text-slate-400 shrink-0">Sessões:</span>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={assignmentTarget}
                  onChange={e => setAssignmentTarget(Number(e.target.value) || 3)}
                  className="w-full bg-transparent py-2 text-sm text-white outline-none"
                />
              </div>
              <PixelButton variant="success" size="sm" onClick={handleCreateAssignment}>
                PUBLICAR DEVER
              </PixelButton>
            </div>
          </div>
        )}

        {assignments.length === 0 ? (
          <p className="text-xs text-slate-400">
            Nenhum dever publicado. Crie metas de estudo para a turma — as famílias veem no painel dos pais!
          </p>
        ) : (
          <div className="space-y-2">
            {assignments.map(a => (
              <div key={a.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block truncate">{a.title}</span>
                  <span className="text-[10px] text-slate-400">
                    {a.subject_id ? SUBJECTS.find(s => s.id === a.subject_id)?.name || a.subject_id : 'Qualquer matéria'}
                    {' • '}meta de {a.target_sessions} sessõe{a.target_sessions === 1 ? '' : 's'}
                  </span>
                </div>
                <span className="font-pixel text-[10px] text-amber-300 shrink-0">
                  🎮 ATIVO
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-[10px] text-slate-600 text-center mt-6 flex items-center justify-center gap-1">
        <Lock size={11} /> Professores veem apenas dados pedagógicos. Modo Foco e dados dos
        responsáveis permanecem protegidos por RLS.
      </p>
    </div>
  );
}
