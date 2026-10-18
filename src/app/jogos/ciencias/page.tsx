'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../lib/auth-context';
import { QUESTION_BANK } from '../../../lib/content-data';
import { Question } from '../../../lib/types';
import { speakText, stopSpeaking } from '../../../lib/speech';
import { sounds } from '../../../lib/sound-effects';
import { PixelButton } from '../../../components/PixelButton';
import { PetIcon } from '../../../components/PetIcon';
import { 
  FlaskConical, Sparkles, Volume2, CheckCircle2, XCircle, 
  ArrowRight, ShieldCheck, Star, Award, Compass, Search, Atom
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CienciasGamePage() {
  const { profile, activePet, focusMode, addPoints } = useAuth();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [stars, setStars] = useState(0);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [showRestModal, setShowRestModal] = useState(false);
  const [isCompletedSession, setIsCompletedSession] = useState(false);

  // Filtra perguntas de ciências para a série do aluno ou padrão
  const scienceQuestions: Question[] = QUESTION_BANK.filter(
    q => q.subject_id === 'ciencias'
  );

  const currentQ: Question = scienceQuestions[currentIndex] || scienceQuestions[0];

  // Leitura em voz alta automática se Modo Foco com TTS ativado
  useEffect(() => {
    if (focusMode.is_active && focusMode.tts_auto_read && currentQ) {
      const timer = setTimeout(() => {
        handleReadQuestion();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, focusMode.is_active]);

  const handleReadQuestion = () => {
    sounds.playClick();
    speakText(currentQ.audio_prompt_text || currentQ.prompt, 'pt-BR');
  };

  const handleSelectOption = (optionText: string, optionId: string) => {
    if (isAnswered) return;

    setSelectedOptionId(optionId);
    setIsAnswered(true);

    const correct = optionText === currentQ.correct_answer;
    setIsCorrect(correct);

    if (correct) {
      sounds.playSuccess();
      sounds.playCoin();
      setStars(prev => prev + 1);
      const pts = 25;
      setPointsEarned(prev => prev + pts);
      addPoints(pts, `ciencias_${currentQ.id}`);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#2ed573', '#70a1ff', '#ffa502']
      });
    } else {
      sounds.playGentleBoop();
    }
  };

  const handleNext = () => {
    sounds.playClick();
    setSelectedOptionId(null);
    setIsAnswered(false);
    setIsCorrect(false);

    // Pausa do Modo Foco após 4 tarefas
    if (focusMode.is_active && (currentIndex + 1) % 4 === 0 && currentIndex + 1 < scienceQuestions.length) {
      setShowRestModal(true);
      return;
    }

    if (currentIndex + 1 < scienceQuestions.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsCompletedSession(true);
      sounds.playFanfare();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handleRestart = () => {
    sounds.playClick();
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setStars(0);
    setPointsEarned(0);
    setIsCompletedSession(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/jogos" className="text-xs font-pixel text-slate-400 hover:text-white">
              ← VOLTAR AO HUB
            </Link>
            <span className="text-slate-600">•</span>
            <span className="font-pixel text-xs text-emerald-400">CIÊNCIAS NATURAIS & ECOLOGIA</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            Estação Científica 🔬
          </h1>
        </div>

        {/* HUD DE PROGRESSO */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 border-2 border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <span className="font-pixel text-sm text-yellow-300">{stars}</span>
          </div>

          <div className="bg-slate-900 border-2 border-slate-800 px-3 py-1.5 rounded-xl text-xs font-pixel text-emerald-300">
            {currentIndex + 1} / {scienceQuestions.length}
          </div>
        </div>
      </div>

      {/* AVISO DO MODO FOCO */}
      {focusMode.is_active && (
        <div className="mb-6 p-3 bg-emerald-950/70 border-2 border-emerald-500 rounded-xl flex items-center justify-between text-xs text-emerald-200">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-400 shrink-0" />
            <span>Modo Foco Ativo: Experimentos explicados sem pressa de tempo.</span>
          </div>
          <span className="font-pixel text-[10px] bg-emerald-900 text-emerald-300 px-2 py-0.5 rounded">
            RITMO CALMO
          </span>
        </div>
      )}

      {/* MODAL DE PAUSA DO MODO FOCO */}
      {showRestModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="pixel-box bg-slate-900 max-w-md w-full p-6 text-center border-emerald-400 animate-scale-up">
            <div className="w-16 h-16 bg-emerald-950 border-3 border-emerald-400 rounded-2xl mx-auto flex items-center justify-center mb-4">
              {activePet && <PetIcon petId={activePet.id} size={48} mood="happy" />}
            </div>
            <h2 className="font-pixel text-lg text-emerald-300 mb-2">
              PAUSA CIENTÍFICA COM {activePet?.name.toUpperCase()}!
            </h2>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              O cérebro aprende ainda mais quando descansa! Respire fundo, olhe para longe e relaxe os olhos por um minutinho.
            </p>
            <PixelButton
              variant="success"
              size="md"
              className="w-full"
              onClick={() => {
                sounds.playClick();
                setShowRestModal(false);
                setCurrentIndex(prev => prev + 1);
              }}
            >
              CONTINUAR EXPERIMENTOS 🧪
            </PixelButton>
          </div>
        </div>
      )}

      {/* TELA DE CONCLUSÃO DA SESSÃO */}
      {isCompletedSession ? (
        <div className="pixel-box bg-slate-900/95 p-8 text-center border-emerald-500/80 animate-scale-up">
          <div className="w-20 h-20 bg-gradient-to-t from-emerald-700 to-teal-500 rounded-2xl mx-auto flex items-center justify-center mb-4 border-4 border-emerald-300 shadow-[0_0_25px_rgba(46,213,115,0.5)]">
            <Atom size={44} className="text-white" />
          </div>

          <h2 className="font-pixel text-xl sm:text-2xl text-emerald-300 mb-2">
            VOCÊ É UM CIENTISTA GENIAL!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto mb-6">
            Parabéns! Você descobriu os mistérios da natureza e ganhou <strong>+{pointsEarned} Moedas Mágicas</strong>!
          </p>

          <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto mb-8">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="font-pixel text-xs text-slate-400 block">ESTRELAS</span>
              <span className="font-pixel text-xl text-yellow-400">{stars} ⭐</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="font-pixel text-xs text-slate-400 block">RECOMPENSA</span>
              <span className="font-pixel text-xl text-amber-300">+{pointsEarned} 🪙</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <PixelButton variant="primary" size="md" onClick={handleRestart}>
              REPETIR LABORATÓRIO 🔄
            </PixelButton>
            <Link href="/jogos">
              <PixelButton variant="warning" size="md">
                OUTROS MINIJOGOS 🎮
              </PixelButton>
            </Link>
          </div>
        </div>
      ) : (
        /* CARD PRINCIPAL DO EXPERIMENTO */
        <div className="pixel-box bg-slate-900/95 p-6 sm:p-8 border-emerald-500/80">
          
          <div className="flex items-center justify-between mb-4">
            <span className="font-pixel text-[11px] text-emerald-300 bg-emerald-950/80 border border-emerald-600 px-3 py-1 rounded-lg">
              TÓPICO: {currentQ.topic.toUpperCase()} ({currentQ.bncc_code})
            </span>
            <span className="text-xs text-slate-400">
              {currentQ.grade}º Ano Fundamental
            </span>
          </div>

          {/* PERGUNTA & ÁUDIO */}
          <div className="bg-slate-950/80 border-2 border-slate-800 p-5 rounded-2xl mb-6 relative">
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-pixel text-sm sm:text-base text-white leading-relaxed">
                {currentQ.prompt}
              </h2>
              <button
                type="button"
                onClick={handleReadQuestion}
                className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow shrink-0 transition-transform hover:scale-105 active:scale-95"
                title="Ouvir a pergunta"
              >
                <Volume2 size={20} />
              </button>
            </div>
          </div>

          {/* HIPÓTESES / OPÇÕES DE RESPOSTA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {currentQ.options.map(opt => {
              const isSelected = selectedOptionId === opt.id;
              const isOptionCorrect = opt.text === currentQ.correct_answer;

              let btnStyle = 'bg-slate-800 border-slate-700 text-slate-100 hover:border-emerald-400 hover:bg-slate-750';

              if (isAnswered) {
                if (isOptionCorrect) {
                  btnStyle = 'bg-emerald-600/90 border-emerald-300 text-white shadow-[0_0_15px_rgba(46,213,115,0.4)]';
                } else if (isSelected && !isCorrect) {
                  btnStyle = 'bg-rose-900/80 border-rose-500 text-rose-200';
                } else {
                  btnStyle = 'bg-slate-900/60 border-slate-800 text-slate-500 opacity-60';
                }
              }

              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(opt.text, opt.id)}
                  className={`p-4 rounded-xl border-3 font-pixel text-xs sm:text-sm text-left transition-all flex items-center justify-between ${btnStyle}`}
                >
                  <span>{opt.text}</span>
                  {isAnswered && isOptionCorrect && (
                    <CheckCircle2 size={20} className="text-white shrink-0 ml-2" />
                  )}
                  {isAnswered && isSelected && !isCorrect && (
                    <XCircle size={20} className="text-rose-300 shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>

          {/* EXPLICAÇÃO PEDAGÓGICA DO PET */}
          {isAnswered && (
            <div className={`p-4 rounded-2xl border-2 mb-6 animate-scale-up ${
              isCorrect 
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-100' 
                : 'bg-amber-950/80 border-amber-500 text-amber-100'
            }`}>
              <div className="flex items-start gap-3">
                <div className="shrink-0 p-1 bg-slate-900 rounded-xl border border-slate-700">
                  {activePet && <PetIcon petId={activePet.id} size={38} mood={isCorrect ? 'happy' : 'idle'} />}
                </div>
                <div>
                  <h4 className="font-pixel text-xs mb-1 text-white">
                    {isCorrect ? '🌟 Descoberta Confirmada!' : '💡 Dica da Natureza:'}
                  </h4>
                  <p className="text-xs sm:text-sm leading-relaxed">
                    {currentQ.explanation}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* BOTÃO PARA PRÓXIMO EXPERIMENTO */}
          {isAnswered && (
            <div className="flex justify-end pt-2">
              <PixelButton
                variant="primary"
                size="md"
                onClick={handleNext}
                icon={<ArrowRight size={18} />}
              >
                {currentIndex + 1 === scienceQuestions.length ? 'VER RESULTADO FINAL' : 'PRÓXIMO EXPERIMENTO'}
              </PixelButton>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
