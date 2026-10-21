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
  RotateCcw, ShieldCheck, Coffee
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function MatematicaGamePage() {
  const { profile, activePet, focusMode, addPoints, updateQuestProgress } = useAuth();
  const studentGrade = profile?.school_grade || 3;

  // Filtra questões de matemática para o ano escolar do aluno
  const questionsList = QUESTION_BANK.filter(
    q => q.subject_id === 'matematica' && q.grade === studentGrade
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [isHitting, setIsHitting] = useState(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [minedResources, setMinedResources] = useState<string[]>([]);
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

  // Mineração do Bloco ao Clicar
  const handleMineBlock = (optionText: string, optionId: string) => {
    if (isHitting || feedback?.isCorrect) return;

    sounds.playClick();
    setIsHitting(true);
    setSelectedBlockId(optionId);

    setTimeout(() => {
      setIsHitting(false);
      const isRight = optionText.trim().toLowerCase() === currentQ.correct_answer.trim().toLowerCase();

      if (isRight) {
        sounds.playSuccess();
        sounds.playCoin();

        if (!focusMode.reduced_stimuli) {
          confetti({
            particleCount: 35,
            spread: 50,
            origin: { y: 0.7 },
          });
        }

        const gems = ['💎 Diamante', '⭐ Estrela', '🪙 Barra de Ouro', '🔮 Rubi Mágico'];
        const randomGem = gems[Math.floor(Math.random() * gems.length)];

        setMinedResources(prev => [...prev, randomGem]);
        setScore(prev => prev + 25);
        addPoints(25, 'mineracao_matematica');
        updateQuestProgress('olimpiada_matematica', 1);

        setFeedback({
          isCorrect: true,
          message: `BOA! Bloco minerado! Você encontrou um ${randomGem}!`,
        });
      } else {
        sounds.playGentleBoop();
        setFeedback({
          isCorrect: false,
          message: currentQ.explanation,
        });
      }
    }, 450);
  };

  // Avançar para o próximo bloco/questão
  const handleNextQuestion = () => {
    sounds.playClick();
    setFeedback(null);
    setSelectedBlockId(null);

    // No Modo Foco, microsessões de 4 blocos ativam a pausa guiada
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
    setMinedResources([]);
    setFeedback(null);
    setSelectedBlockId(null);
    setRoundCompleted(false);
    setShowFocusPauseModal(false);
  };

  return (
    <div className={`min-h-[85vh] p-4 sm:p-6 flex flex-col justify-between max-w-4xl mx-auto ${focusMode.is_active ? 'bg-slate-900 rounded-3xl border-4 border-emerald-600/80 p-6' : ''}`}>
      
      {/* Topo do Jogo: Voltar, Matéria, Pontuação e Modo Foco */}
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
          <span className="font-pixel text-xs text-cyan-400 block">
            MUNDO DOS BLOCOS • {studentGrade}º ANO
          </span>
          <span className="text-[11px] text-slate-400 font-bold">
            Habilidade: {currentQ.bncc_code} - {currentQ.topic}
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

      {/* MODAL DE PAUSA GUIADA (EXCLUSIVO MODO FOCO) */}
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
              Você completou a microsessão com sucesso! Agora é hora de esticar os braços, respirar fundo 3 vezes e tomar um gole d&apos;água. Seu cérebro adora essas pausas!
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
        <div className="pixel-box bg-slate-900/95 p-8 text-center border-amber-400 my-auto">
          <div className="w-20 h-20 rounded-2xl bg-amber-500/20 border-4 border-amber-400 text-amber-300 mx-auto flex items-center justify-center mb-4">
            <Trophy size={40} />
          </div>
          <h2 className="font-pixel text-lg sm:text-2xl text-yellow-300 mb-2">
            MISSÃO DE MINERAÇÃO CONCLUÍDA!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mb-6 max-w-md mx-auto">
            Parabéns, herói! Você quebrou todos os desafios matemáticos e conquistou novos tesouros para sua jornada!
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-md mx-auto mb-6">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="block text-[10px] text-slate-400 font-pixel">MOEDAS</span>
              <span className="font-pixel text-base text-yellow-400">+{score}</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="block text-[10px] text-slate-400 font-pixel">XP GANHO</span>
              <span className="font-pixel text-base text-amber-300">+{score} XP</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
              <span className="block text-[10px] text-slate-400 font-pixel">RECURSOS</span>
              <span className="font-pixel text-xs text-cyan-300">{minedResources.length} Gemas</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <PixelButton variant="primary" size="md" onClick={handleRestart} icon={<RotateCcw size={16} />}>
              JOGAR OUTRA RODADA
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
          
          {/* Barra de Etapas Simples (Ideal para TDAH e clareza) */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs font-pixel text-slate-300 mb-1.5">
              <span>DESAFIO {currentIndex + 1} DE {focusMode.is_active ? 4 : questionsList.length}</span>
              <span className="text-cyan-400">Gemas Mineradas: {minedResources.length}</span>
            </div>
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-amber-400 transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / (focusMode.is_active ? 4 : questionsList.length)) * 100}%` }}
              />
            </div>
          </div>

          {/* Cartão do Desafio com Botão de Áudio */}
          <div className="pixel-box bg-gradient-to-b from-slate-900 to-slate-950 p-5 sm:p-6 mb-6 border-cyan-500 shadow-xl">
            <div className="flex items-start justify-between gap-3 mb-2">
              <span className="font-pixel text-[11px] text-amber-300 uppercase tracking-wide">
                ⛏️ QUEBRE O BLOCO CORRETO:
              </span>
              <button
                type="button"
                onClick={handleListenQuestion}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg border border-slate-700 flex items-center gap-1.5 text-xs font-bold transition-colors"
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

          {/* ÁREA DOS 4 BLOCOS MINERÁVEIS */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-6">
            {currentQ.options.map((opt) => {
              const isSelected = selectedBlockId === opt.id;
              const isConfirmedRight = feedback?.isCorrect && currentQ.correct_answer === opt.text;

              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={isHitting || (feedback?.isCorrect ?? false)}
                  onClick={() => handleMineBlock(opt.text, opt.id)}
                  className={`relative p-5 sm:p-6 rounded-2xl border-4 font-pixel text-sm sm:text-lg transition-all duration-150 select-none flex flex-col items-center justify-center min-h-[110px] sm:min-h-[130px] ${
                    isConfirmedRight
                      ? 'bg-emerald-600 border-emerald-300 text-white scale-105 shadow-[0_0_20px_rgba(46,213,115,0.8)]'
                      : isSelected && isHitting
                      ? 'bg-amber-600 border-amber-300 scale-95'
                      : 'bg-gradient-to-b from-slate-800 to-slate-900 hover:from-slate-750 hover:to-slate-850 border-slate-950 text-slate-100 shadow-[0_8px_0_#0f0f1b] active:translate-y-2 active:shadow-[0_2px_0_#0f0f1b]'
                  }`}
                >
                  {/* Textura sutil de bloco minerável */}
                  <div className="absolute inset-1 border border-white/10 rounded-xl pointer-events-none" />
                  
                  <span className="text-2xl sm:text-3xl font-extrabold drop-shadow">
                    {opt.text}
                  </span>

                  <span className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">
                    {isConfirmedRight ? '⭐ MINERADO!' : '⛏️ MINERAR'}
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
                : 'bg-indigo-950/90 border-indigo-400 text-indigo-200'
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
                    {feedback.isCorrect ? '🌟 PALAVRA DO PET: ACERTOU!' : '💡 DICA DO SEU COMPANHEIRO:'}
                  </span>
                  <p className="text-xs sm:text-sm font-medium leading-snug">
                    {feedback.message}
                  </p>
                </div>
              </div>

              {feedback.isCorrect && (
                <PixelButton variant="success" size="sm" onClick={handleNextQuestion} className="shrink-0">
                  PRÓXIMO BLOCO ➡️
                </PixelButton>
              )}
            </div>
          )}

        </div>
      )}

      {/* Rodapé: Recursos Coletados nesta Mina */}
      {!roundCompleted && minedResources.length > 0 && (
        <div className="pt-2 border-t border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="font-pixel text-[10px] text-slate-400 shrink-0">MOCHILA:</span>
          {minedResources.map((res, i) => (
            <span key={i} className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-[11px] text-amber-300 shrink-0">
              {res}
            </span>
          ))}
        </div>
      )}

    </div>
  );
}
