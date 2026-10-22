'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/auth-context';
import { TALE_CATALOG, type Tale } from '../../lib/content-data';
import { PixelButton } from '../../components/PixelButton';
import { PetIcon } from '../../components/PetIcon';
import { sounds } from '../../lib/sound-effects';
import { speakText, stopSpeaking } from '../../lib/speech';
import { useLocalStorageState } from '../../lib/client-hooks';
import { trackEvent } from '../../lib/analytics';
import { ArrowLeft, BookOpen, Check, Volume2, Sparkles, Star } from 'lucide-react';
import confetti from 'canvas-confetti';

type Phase = 'hub' | 'reading' | 'questions' | 'finished';

export default function ContosPage() {
  const { profile, activePet, focusMode, addPoints } = useAuth();

  const [phase, setPhase] = useState<Phase>('hub');
  const [activeTale, setActiveTale] = useState<Tale | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [isReadingAloud, setIsReadingAloud] = useState(false);
  // Histórias já concluídas (persistência local via hook de hidratação SSR)
  const [completedTales, setCompletedTales] = useLocalStorageState<string[]>('kids_player_tales_completed', []);

  const stopReading = () => {
    stopSpeaking();
    setIsReadingAloud(false);
  };

  const openTale = (tale: Tale) => {
    sounds.playClick();
    stopReading();
    setActiveTale(tale);
    setPageIndex(0);
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setCorrectCount(0);
    setPhase('reading');
  };

  const backToHub = () => {
    sounds.playClick();
    stopReading();
    setPhase('hub');
    setActiveTale(null);
  };

  const readPageAloud = () => {
    if (!activeTale) return;
    const page = activeTale.pages[pageIndex];
    sounds.playClick();
    setIsReadingAloud(true);
    speakText(page.text, 'pt-BR');
    window.setTimeout(() => setIsReadingAloud(false), 500);
  };

  const turnPage = () => {
    if (!activeTale) return;
    const isLastPage = pageIndex === activeTale.pages.length - 1;
    sounds.playPageFlip();
    stopSpeaking();

    if (isLastPage) {
      setPhase('questions');
      return;
    }
    setPageIndex(prev => prev + 1);
  };

  const previousPage = () => {
    sounds.playPageFlip();
    stopSpeaking();
    if (pageIndex === 0) {
      backToHub();
      return;
    }
    setPageIndex(prev => prev - 1);
  };

  const selectAnswer = (optionIndex: number) => {
    if (!activeTale || selectedAnswer !== null) return;
    const question = activeTale.questions[questionIndex];
    setSelectedAnswer(optionIndex);

    const isCorrect = optionIndex === question.correctIndex;
    if (isCorrect) {
      sounds.playSuccess();
      setCorrectCount(prev => prev + 1);
    } else {
      sounds.playGentleBoop();
    }
  };

  const nextQuestion = () => {
    if (!activeTale) return;
    const isLastQuestion = questionIndex === activeTale.questions.length - 1;
    sounds.playClick();

    if (isLastQuestion) {
      finishTale();
      return;
    }
    setQuestionIndex(prev => prev + 1);
    setSelectedAnswer(null);
  };

  const finishTale = () => {
    if (!activeTale) return;
    const firstTime = !completedTales.includes(activeTale.id);
    sounds.playApplause();
    stopSpeaking();
    trackEvent('conto_concluido', '/contos');

    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.5 },
    });

    if (firstTime) {
      addPoints(activeTale.rewardPoints, `conto_${activeTale.id}`);
      setCompletedTales(prev => (prev.includes(activeTale.id) ? prev : [...prev, activeTale.id]));
    }
    setPhase('finished');
  };

  // ================================================================
  // HUB DAS HISTÓRIAS
  // ================================================================
  if (phase === 'hub') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Link href="/jogos" className="text-xs font-pixel text-slate-400 hover:text-white flex items-center gap-1">
              <ArrowLeft size={13} /> VOLTAR AOS JOGOS
            </Link>
            <span className="text-slate-600">•</span>
            <span className="font-pixel text-xs text-indigo-400">NOVIDADE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            Teatro dos Contos 🎭📖
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Fábulas mágicas dos pets para treinar a leitura (BNCC EF35LP). Ouça em voz alta, vire as páginas
            e responda as perguntinhas para ganhar moedas!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TALE_CATALOG.map(tale => {
            const isDone = completedTales.includes(tale.id);
            return (
              <button
                key={tale.id}
                type="button"
                onClick={() => openTale(tale)}
                className={`pixel-box bg-slate-900/95 p-5 text-left transition-transform hover:scale-[1.02] hover:-translate-y-1 ${tale.themeClasses.box} relative`}
              >
                {isDone && (
                  <span className={`absolute top-3 right-3 font-pixel text-[9px] px-2 py-1 rounded-lg flex items-center gap-1 ${tale.themeClasses.badge}`}>
                    <Star size={10} className="fill-current" /> LIDA
                  </span>
                )}
                <div className="text-4xl mb-3" aria-hidden="true">{tale.emoji}</div>
                <h2 className="font-pixel text-xs text-white mb-2 leading-relaxed">
                  {tale.title.toUpperCase()}
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {tale.synopsis}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">
                    {tale.pages.length} páginas · {tale.questions.length} perguntinhas
                  </span>
                  <span className="text-[10px] font-pixel text-yellow-300">
                    +{tale.rewardPoints} 🪙
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-8 pixel-box bg-slate-950/80 p-4 border-slate-700 flex items-center gap-3">
          <PetIcon petId={activePet?.id || 'pipoca_raposa'} size={36} />
          <p className="text-xs text-slate-300">
            <strong className="text-amber-300">{activePet?.name || 'Pipoca'}:</strong>{' '}
            &ldquo;Cada história esconde uma lição. Depois de ler, me conta qual foi sua parte favorita!&rdquo;
          </p>
        </div>
      </div>
    );
  }

  // ================================================================
  // LEITOR DA HISTÓRIA
  // ================================================================
  if (phase === 'reading' && activeTale) {
    const page = activeTale.pages[pageIndex];
    const isLastPage = pageIndex === activeTale.pages.length - 1;

    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={backToHub}
            className="text-xs font-pixel text-slate-400 hover:text-white flex items-center gap-1"
          >
            <ArrowLeft size={13} /> SAIR DA HISTÓRIA
          </button>
          <span className="font-pixel text-[10px] text-slate-400">
            PÁGINA {pageIndex + 1}/{activeTale.pages.length}
          </span>
        </div>

        {/* LIVRO ABERTO */}
        <div className={`pixel-box bg-slate-900/95 p-6 sm:p-8 mb-5 ${activeTale.themeClasses.box}`}>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={16} className="text-amber-300" />
            <h1 className="font-pixel text-xs sm:text-sm text-amber-200">
              {activeTale.title.toUpperCase()}
            </h1>
          </div>

          <div className="text-6xl text-center mb-5 select-none animate-bounce-subtle" aria-hidden="true">
            {page.sceneEmoji}
          </div>

          <p className="text-sm sm:text-base text-slate-200 leading-relaxed text-center min-h-[120px] flex items-center justify-center">
            {page.text}
          </p>

          {/* Indicador de progresso (pontos) */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {activeTale.pages.map((_, i) => (
              <span
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === pageIndex ? 'bg-amber-400 scale-125' : i < pageIndex ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* CONTROLES */}
        <div className="flex items-center justify-between gap-3">
          <PixelButton variant="dark" size="sm" onClick={previousPage}>
            ◀ VOLTAR
          </PixelButton>

          <PixelButton
            variant="info"
            size="sm"
            onClick={readPageAloud}
            icon={<Volume2 size={14} className={isReadingAloud ? 'animate-pulse' : ''} />}
          >
            {isReadingAloud ? 'LENDO...' : 'OUVIR'}
          </PixelButton>

          <PixelButton variant="primary" size="sm" onClick={turnPage}>
            {isLastPage ? 'PERGUNTINHAS ✨' : 'VIRAR PÁGINA ▶'}
          </PixelButton>
        </div>

        {focusMode.is_active && (
          <p className="text-center text-[11px] text-emerald-300/80 mt-4">
            🛡️ Modo Foco: uma página por vez, no seu ritmo. Respire fundo e boa leitura!
          </p>
        )}
      </div>
    );
  }

  // ================================================================
  // PERGUNTINHAS DE COMPREENSÃO
  // ================================================================
  if (phase === 'questions' && activeTale) {
    const question = activeTale.questions[questionIndex];
    const answered = selectedAnswer !== null;
    const isCorrect = selectedAnswer === question.correctIndex;

    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <span className="font-pixel text-xs text-indigo-300 block mb-1">
            PERGUNTINHA {questionIndex + 1} DE {activeTale.questions.length} 🧠
          </span>
          <h2 className="text-lg sm:text-xl font-extrabold text-white">
            {activeTale.title} {activeTale.emoji}
          </h2>
        </div>

        <div className="pixel-box bg-slate-900/95 p-6 border-indigo-400/80 mb-5">
          <p className="text-sm sm:text-base text-white text-center font-bold mb-5">
            {question.prompt}
          </p>

          <div className="space-y-2.5">
            {question.options.map((option, i) => {
              let style = 'bg-slate-950 border-slate-700 hover:border-indigo-400';
              if (answered && i === question.correctIndex) {
                style = 'bg-emerald-950/70 border-emerald-400';
              } else if (answered && i === selectedAnswer && !isCorrect) {
                style = 'bg-rose-950/70 border-rose-400';
              }
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectAnswer(i)}
                  disabled={answered}
                  className={`w-full text-left text-xs sm:text-sm border-2 rounded-xl px-4 py-3 transition-all text-slate-200 ${style}`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {answered && (
            <div className={`mt-5 p-3 rounded-xl border-2 text-xs leading-relaxed ${
              isCorrect
                ? 'bg-emerald-950/60 border-emerald-600 text-emerald-200'
                : 'bg-amber-950/60 border-amber-600 text-amber-200'
            }`}>
              {isCorrect ? '🎉 ' : '💛 '}
              {question.explanation}
            </div>
          )}
        </div>

        <div className="text-center">
          {answered && (
            <PixelButton variant="primary" size="md" onClick={nextQuestion}>
              {questionIndex === activeTale.questions.length - 1 ? 'FINALIZAR HISTÓRIA 🎬' : 'PRÓXIMA PERGUNTINHA ▶'}
            </PixelButton>
          )}
        </div>
      </div>
    );
  }

  // ================================================================
  // CONCLUSÃO
  // ================================================================
  if (phase === 'finished' && activeTale) {
    const firstTime = completedTales.includes(activeTale.id);
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="text-6xl mb-4" aria-hidden="true">🎭👏</div>
        <h1 className="font-pixel text-base text-amber-300 mb-3">
          PALMAS PARA VOCÊ!
        </h1>
        <p className="text-sm text-slate-300 mb-1">
          Você concluiu <strong className="text-white">&ldquo;{activeTale.title}&rdquo;</strong> acertando{' '}
          <strong className="text-emerald-300">{correctCount} de {activeTale.questions.length}</strong> perguntinhas.
        </p>
        {firstTime ? (
          <p className="text-xs text-yellow-300 font-bold mb-6 flex items-center justify-center gap-1">
            <Sparkles size={14} /> +{activeTale.rewardPoints} moedas mágicas guardadas no seu baú!
          </p>
        ) : (
          <p className="text-xs text-slate-500 mb-6">Releitura concluída — heróis voltam aos contos favoritos! 💛</p>
        )}

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <PixelButton variant="primary" size="md" onClick={() => openTale(activeTale)}>
            LER OUTRA VEZ 🔁
          </PixelButton>
          <PixelButton variant="dark" size="md" onClick={backToHub}>
            OUTRAS HISTÓRIAS 📚
          </PixelButton>
        </div>

        <div className="mt-8 pixel-box bg-slate-950/80 p-4 border-slate-700 flex items-center gap-3 text-left">
          <Check size={16} className="text-emerald-400 shrink-0" />
          <p className="text-[11px] text-slate-400">
            {profile?.nickname || 'Campeão'}, contar a história para alguém da família também vale como
            treino de leitura — os aplausos vêm de brinde!
          </p>
        </div>
      </div>
    );
  }

  return null;
}
