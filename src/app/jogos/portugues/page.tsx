'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../lib/auth-context';
import { QUESTION_BANK } from '../../../lib/content-data';
import { Question } from '../../../lib/types';
import { PixelButton } from '../../../components/PixelButton';
import { PetIcon } from '../../../components/PetIcon';
import { sounds } from '../../../lib/sound-effects';
import { speakText, stopSpeaking } from '../../../lib/speech';
import {
  Volume2, ArrowLeft, Trophy,
  RotateCcw, ShieldCheck, Footprints, Coffee
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PortuguesGamePage() {
  const { profile, activePet, focusMode, addPoints, updateQuestProgress } = useAuth();
  const studentGrade = profile?.school_grade || 3;

  // Filtra questões de português para o ano escolar do aluno
  const questionsList = QUESTION_BANK.filter(
    q => q.subject_id === 'portugues' && q.grade === studentGrade
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isJumping, setIsJumping] = useState(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [bridgesCrossed, setBridgesCrossed] = useState(0);
  const [score, setScore] = useState(0);
  const [roundCompleted, setRoundCompleted] = useState(false);
  const [showFocusPauseModal, setShowFocusPauseModal] = useState(false);

  const currentQ: Question = questionsList[currentIndex] || questionsList[0];

  // Leitura automática no Modo Foco ao mudar de pergunta
  useEffect(() => {
    if (focusMode.is_active && focusMode.tts_auto_read && currentQ) {
      const textToSpeak = currentQ.audio_prompt_text || currentQ.prompt;
      speakText(textToSpeak, 'pt-BR');
    }
  }, [currentIndex, focusMode.is_active, focusMode.tts_auto_read, currentQ]);

  // Função para ler o enunciado sob demanda
  const handleListenQuestion = () => {
    sounds.playClick();
    stopSpeaking();
    const textToSpeak = currentQ.audio_prompt_text || currentQ.prompt;
    speakText(textToSpeak, 'pt-BR');
  };

  // Salto para a ilha ao escolher a resposta
  const handleSelectOption = (optionText: string, optionId: string) => {
    if (isJumping || feedback?.isCorrect) return;

    sounds.playClick();
    setIsJumping(true);
    setSelectedOptionId(optionId);

    setTimeout(() => {
      setIsJumping(false);
      const isRight = optionText.trim().toLowerCase() === currentQ.correct_answer.trim().toLowerCase();

      if (isRight) {
        sounds.playSuccess();
        sounds.playCoin();

        if (!focusMode.reduced_stimuli) {
          confetti({
            particleCount: 30,
            spread: 60,
            origin: { y: 0.6 },
          });
        }

        setBridgesCrossed(prev => prev + 1);
        setScore(prev => prev + 25);
        addPoints(25, 'salto_portugues');
        updateQuestProgress('desafio_palavras', 1);

        setFeedback({
          isCorrect: true,
          message: `EXCELENTE! Ponte mágica destrancada! Você avançou para a próxima ilha!`,
        });
      } else {
        sounds.playGentleBoop();
        setFeedback({
          isCorrect: false,
          message: currentQ.explanation,
        });
      }
    }, 400);
  };

  // Avançar para a próxima ilha / pergunta
  const handleNextQuestion = () => {
    sounds.playClick();
    setFeedback(null);
    setSelectedOptionId(null);

    // No Modo Foco, microsessões de 4 saltos ativam a pausa guiada
    if (focusMode.is_active && (currentIndex + 1) >= 4) {
      setShowFocusPauseModal(true);
      return;
    }

    if (currentIndex + 1 < questionsList.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      sounds.playLevelUp();
      setRoundCompleted(true);
    }
  };

  // Reiniciar partida
  const handleRestart = () => {
    sounds.playClick();
    setCurrentIndex(0);
    setScore(0);
    setBridgesCrossed(0);
    setFeedback(null);
    setSelectedOptionId(null);
    setRoundCompleted(false);
    setShowFocusPauseModal(false);
  };

  return (
    <div className={`min-h-[85vh] p-4 sm:p-6 flex flex-col justify-between max-w-4xl mx-auto ${focusMode.is_active ? 'bg-slate-900 rounded-3xl border-4 border-emerald-600/80 p-6' : ''}`}>
      
      {/* Topo do Jogo */}
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b-2 border-slate-800">
        <Link
          href="/jogos"
          onClick={() => {
            stopSpeaking();
            sounds.playClick();
          }}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700"
        >
          <ArrowLeft size={16} />
          Voltar aos Jogos
        </Link>

        <div className="text-center">
          <span className="font-pixel text-xs text-pink-400 block">
            TRILHA DOS SALTOS MÁGICOS • {studentGrade}º ANO
          </span>
          <span className="text-[11px] text-slate-400 font-bold">
            {currentQ.bncc_code} - {currentQ.topic}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {focusMode.is_active && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-pixel text-emerald-400 bg-emerald-950 border border-emerald-500 px-2 py-1 rounded">
              <ShieldCheck size={13} />
              Modo Foco
            </span>
          )}
          <div className="bg-slate-800 px-3 py-1 rounded-lg border-2 border-amber-500 font-pixel text-xs text-yellow-300">
            +{score} 🪙
          </div>
        </div>
      </div>

      {/* MODAL DE PAUSA GUIADA (MODO FOCO) */}
      {showFocusPauseModal && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="pixel-box bg-slate-900 max-w-md w-full p-6 text-center border-emerald-400">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-2xl mx-auto flex items-center justify-center mb-3">
              <Coffee size={32} />
            </div>
            <h3 className="font-pixel text-base text-emerald-300 mb-2">
              PAUSA TRANQUILA DO FOCO 🌿
            </h3>
            <div className="w-16 h-16 mx-auto mb-2">
              {activePet && <PetIcon petId={activePet.id} size={60} mood="happy" />}
            </div>
            <p className="text-xs sm:text-sm text-slate-200 mb-4 leading-relaxed">
              Você saltou por 4 ilhas com muita atenção! Agora descanse os olhinhos, tome uma água fresca e faça um alongamento relaxante.
            </p>
            <PixelButton
              variant="success"
              size="md"
              className="w-full"
              onClick={() => {
                setShowFocusPauseModal(false);
                setRoundCompleted(true);
              }}
            >
              ESTOU PRONTO PARA VER MEU RESULTADO! ✨
            </PixelButton>
          </div>
        </div>
      )}

      {/* TELA DE CONCLUSÃO DA PARTIDA */}
      {roundCompleted ? (
        <div className="pixel-box bg-slate-900/95 p-8 text-center border-pink-400 my-auto">
          <div className="w-20 h-20 rounded-2xl bg-pink-500/20 border-4 border-pink-400 text-pink-300 mx-auto flex items-center justify-center mb-4">
            <Trophy size={40} />
          </div>
          <h2 className="font-pixel text-lg sm:text-2xl text-pink-300 mb-2">
            TRILHA CONCLUÍDA COM SUCESSO!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mb-6 max-w-md mx-auto">
            Sensacional! Seu herói atravessou todas as pontes com a sabedoria da Língua Portuguesa!
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-md mx-auto mb-6">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="block text-[10px] text-slate-400 font-pixel">MOEDAS</span>
              <span className="font-pixel text-base text-yellow-400">+{score}</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="block text-[10px] text-slate-400 font-pixel">XP GANHO</span>
              <span className="font-pixel text-base text-pink-300">+{score} XP</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
              <span className="block text-[10px] text-slate-400 font-pixel">PONTES</span>
              <span className="font-pixel text-xs text-emerald-300">{bridgesCrossed} Saltos</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <PixelButton variant="primary" size="md" onClick={handleRestart} icon={<RotateCcw size={16} />}>
              SALTAR NOVAMENTE
            </PixelButton>
            <Link href="/jogos" onClick={() => sounds.playClick()}>
              <PixelButton variant="dark" size="md">
                VOLTAR AO HUB
              </PixelButton>
            </Link>
          </div>
        </div>
      ) : (
        /* ÁREA PRINCIPAL DA PARTIDA */
        <div className="flex-1 flex flex-col justify-between my-2">
          
          {/* Barra de Etapas */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs font-pixel text-slate-300 mb-1.5">
              <span>ILHA {currentIndex + 1} DE {focusMode.is_active ? 4 : questionsList.length}</span>
              <span className="text-pink-400">Pontes Conquistadas: {bridgesCrossed}</span>
            </div>
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-purple-400 transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / (focusMode.is_active ? 4 : questionsList.length)) * 100}%` }}
              />
            </div>
          </div>

          {/* Cartão do Desafio */}
          <div className="pixel-box bg-gradient-to-b from-slate-900 to-slate-950 p-5 sm:p-6 mb-6 border-pink-500 shadow-xl">
            <div className="flex items-start justify-between gap-3 mb-2">
              <span className="font-pixel text-[11px] text-pink-300 uppercase tracking-wide">
                🌉 ESCOLHA O CAMINHO CORRETO PARA A PONTE:
              </span>
              <button
                type="button"
                onClick={handleListenQuestion}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-pink-300 rounded-lg border border-slate-700 flex items-center gap-1.5 text-xs font-bold transition-colors"
                title="Ouvir pergunta em voz alta"
              >
                <Volume2 size={16} />
                <span className="hidden sm:inline">Ouvir Pergunta</span>
              </button>
            </div>

            <h2 className="text-base sm:text-xl font-extrabold text-white leading-relaxed">
              {currentQ.prompt}
            </h2>
          </div>

          {/* OPÇÕES DE RESPOSTA EM PLATAFORMAS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
            {currentQ.options.map((opt) => {
              const isSelected = selectedOptionId === opt.id;
              const isConfirmedRight = feedback?.isCorrect && currentQ.correct_answer === opt.text;

              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={isJumping || (feedback?.isCorrect ?? false)}
                  onClick={() => handleSelectOption(opt.text, opt.id)}
                  className={`relative p-4 sm:p-5 rounded-2xl border-3 font-pixel text-xs sm:text-sm transition-all duration-150 select-none text-left flex items-center justify-between ${
                    isConfirmedRight
                      ? 'bg-emerald-600 border-emerald-300 text-white shadow-[0_0_20px_rgba(46,213,115,0.8)] scale-102'
                      : isSelected && isJumping
                      ? 'bg-pink-600 border-pink-300'
                      : 'bg-slate-800/90 hover:bg-slate-750 border-slate-700 text-slate-100 shadow-[0_6px_0_#0f0f1b] active:translate-y-1 active:shadow-[0_2px_0_#0f0f1b]'
                  }`}
                >
                  <span className="font-bold pr-2 leading-relaxed">
                    {opt.text}
                  </span>
                  
                  <span className="text-xs px-2 py-1 rounded-md bg-slate-900 border border-slate-700 font-pixel text-pink-300 shrink-0">
                    {isConfirmedRight ? '⭐ CERTO!' : 'SALTAR 🚀'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* FEEDBACK DO PET COMPANHEIRO */}
          {feedback && (
            <div className={`p-4 rounded-2xl border-3 flex items-center justify-between gap-4 mb-4 animate-bounce-subtle ${
              feedback.isCorrect
                ? 'bg-emerald-950/90 border-emerald-400 text-emerald-200'
                : 'bg-purple-950/90 border-purple-400 text-purple-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className="shrink-0 w-12 h-12">
                  {activePet && (
                    <PetIcon 
                      petId={activePet.id} 
                      size={48} 
                      mood={feedback.isCorrect ? 'happy' : 'idle'} 
                    />
                  )}
                </div>
                <div>
                  <span className="font-pixel text-[11px] block font-bold">
                    {feedback.isCorrect ? '🎉 PARABÉNS PELO SALTO!' : '💡 DICA DO SABICHÃO:'}
                  </span>
                  <p className="text-xs sm:text-sm font-medium leading-snug">
                    {feedback.message}
                  </p>
                </div>
              </div>

              {feedback.isCorrect && (
                <PixelButton variant="success" size="sm" onClick={handleNextQuestion} className="shrink-0">
                  PRÓXIMA ILHA ➡️
                </PixelButton>
              )}
            </div>
          )}

        </div>
      )}

      {/* Rodapé: Saltos Concluídos */}
      {!roundCompleted && bridgesCrossed > 0 && (
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-pixel">
          <span className="flex items-center gap-1.5">
            <Footprints size={14} className="text-pink-400" />
            Ilhas Saltadas: {bridgesCrossed}
          </span>
          <span className="text-yellow-400">
            Total Ganho: +{score} Moedas
          </span>
        </div>
      )}

    </div>
  );
}
