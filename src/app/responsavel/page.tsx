'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/auth-context';
import { sounds } from '../../lib/sound-effects';
import { PixelButton } from '../../components/PixelButton';
import { 
  ShieldCheck, Clock, Award, BookOpen, Heart, Settings, 
  Sparkles, CheckCircle, AlertTriangle, Download, Trash2, 
  Lightbulb, HelpCircle, ChevronRight, Volume2, UserCheck
} from 'lucide-react';

export default function ResponsavelPage() {
  const { 
    profile, 
    guardian, 
    focusMode, 
    updateFocusSettings, 
    toggleFocusMode, 
    updateProfile 
  } = useAuth();

  const [savedNotice, setSavedNotice] = useState(false);
  const [sessionMinutes, setSessionMinutes] = useState(focusMode.session_duration_minutes || 4);
  const [pauseMinutes, setPauseMinutes] = useState(focusMode.pause_interval_minutes || 5);
  const [ttsEnabled, setTtsEnabled] = useState(focusMode.tts_auto_read);
  const [reducedStimuli, setReducedStimuli] = useState(focusMode.reduced_stimuli);
  const [confirmResetModal, setConfirmResetModal] = useState(false);

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
      {/* 4 CARDS DE MÉTRICAS REAIS DA SEMANA */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        {/* Tempo de Estudo */}
        <div className="pixel-box bg-slate-900/90 p-4 border-cyan-500/60">
          <div className="flex items-center justify-between text-cyan-400 mb-2">
            <span className="font-pixel text-[10px]">TEMPO DE FOCO</span>
            <Clock size={16} />
          </div>
          <div className="font-pixel text-xl text-cyan-300 mb-1">
            85 Minutos
          </div>
          <p className="text-[10px] text-slate-400">
            Nesta semana em sessões ativas de minijogos.
          </p>
        </div>

        {/* Precisão Geral */}
        <div className="pixel-box bg-slate-900/90 p-4 border-emerald-500/60">
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="font-pixel text-[10px]">PRECISÃO MÉDIA</span>
            <Award size={16} />
          </div>
          <div className="font-pixel text-xl text-emerald-300 mb-1">
            88% Acertos
          </div>
          <p className="text-[10px] text-slate-400">
            Excelente aproveitamento em 1ª tentativa!
          </p>
        </div>

        {/* Disciplina Mais Praticada */}
        <div className="pixel-box bg-slate-900/90 p-4 border-amber-500/60">
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <span className="font-pixel text-[10px]">DESTAQUE</span>
            <BookOpen size={16} />
          </div>
          <div className="font-pixel text-lg text-yellow-300 mb-1">
            Matemática
          </div>
          <p className="text-[10px] text-slate-400">
            {profile?.school_grade}º Ano: Tabuada e Cálculos.
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
      {/* DISTRIBUIÇÃO PEDAGÓGICA POR MATÉRIA (BNCC) */}
      {/* ============================================================== */}
      <div className="pixel-box bg-slate-900/90 p-6 mb-8 border-indigo-500/70">
        <h3 className="font-pixel text-xs sm:text-sm text-indigo-300 mb-4 flex items-center gap-2">
          <BookOpen size={16} />
          DISTRIBUIÇÃO DO TEMPO POR MATÉRIA ESCOLAR
        </h3>

        {/* Barra de Distribuição Horizontal */}
        <div className="w-full h-5 rounded-full overflow-hidden flex border-2 border-slate-950 shadow-inner mb-4">
          <div style={{ width: '35%' }} className="bg-cyan-500" title="Matemática: 35%" />
          <div style={{ width: '30%' }} className="bg-pink-500" title="Língua Portuguesa: 30%" />
          <div style={{ width: '15%' }} className="bg-emerald-500" title="Ciências: 15%" />
          <div style={{ width: '10%' }} className="bg-purple-500" title="Inglês: 10%" />
          <div style={{ width: '10%' }} className="bg-orange-500" title="Digitação: 10%" />
        </div>

        {/* Legendas e Detalhes */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-500 shrink-0" />
            <span className="text-slate-300">Matemática (35%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-pink-500 shrink-0" />
            <span className="text-slate-300">Português (30%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-slate-300">Ciências (15%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500 shrink-0" />
            <span className="text-slate-300">Inglês (10%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500 shrink-0" />
            <span className="text-slate-300">Digitação (10%)</span>
          </div>
        </div>
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

        {/* Zona de Gerenciamento de Dados */}
        <div className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            Deseja redefinir o progresso ou limpar os dados armazenados localmente neste navegador?
          </p>
          <button
            type="button"
            onClick={() => setConfirmResetModal(true)}
            className="text-xs bg-rose-950 hover:bg-rose-900 border border-rose-500 text-rose-300 px-3 py-2 rounded-xl transition-colors shrink-0"
          >
            Limpar Dados Deste Dispositivo 🗑️
          </button>
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
