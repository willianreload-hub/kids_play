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
  ArrowLeft, Rocket, Zap, Volume2,
  RotateCcw, Sparkles, Shield, AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function TabuadaEspacialPage() {
  const { activePet, focusMode, addPoints, updateQuestProgress, equippedAccessoryId } = useAuth();

  // Filtra as perguntas da Tabuada Espacial e de multiplicação/divisão
  const spaceQuestions = QUESTION_BANK.filter(
    q => q.id.startsWith('tab_espacial_') || (q.subject_id === 'matematica' && q.topic.toLowerCase().includes('tabuada'))
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [combo, setCombo] = useState(1);
  const [maxCombo, setMaxCombo] = useState(1);
  const [score, setScore] = useState(0);
  const [lightyears, setLightyears] = useState(1200);
  const [isFiring, setIsFiring] = useState(false);
  const [selectedOptId, setSelectedOptId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [gameFinished, setGameFinished] = useState(false);
  const [spaceshipShield, setSpaceshipShield] = useState(100);

  const currentQ: Question = spaceQuestions[currentIndex] || spaceQuestions[0];

  useEffect(() => {
    if (focusMode.is_active && focusMode.tts_auto_read && currentQ) {
      const textToSpeak = currentQ.audio_prompt_text || currentQ.prompt;
      speakText(textToSpeak, 'pt-BR');
    }
  }, [currentIndex, focusMode.is_active, focusMode.tts_auto_read, currentQ]);

  const handleListen = () => {
    sounds.playClick();
    stopSpeaking();
    const textToSpeak = currentQ.audio_prompt_text || currentQ.prompt;
    speakText(textToSpeak, 'pt-BR');
  };

  const handleAnswer = (optionText: string, optionId: string) => {
    if (isFiring || feedback?.isCorrect) return;

    sounds.playClick();
    setIsFiring(true);
    setSelectedOptId(optionId);

    setTimeout(() => {
      setIsFiring(false);
      const isRight = optionText.trim().toLowerCase() === currentQ.correct_answer.trim().toLowerCase();

      if (isRight) {
        const nextCombo = combo + 1;
        setCombo(nextCombo);
        if (nextCombo > maxCombo) setMaxCombo(nextCombo);

        sounds.playCombo(nextCombo);
        sounds.playCoin();

        const ptsEarned = 15 * combo;
        setScore(prev => prev + ptsEarned);
        setLightyears(prev => prev + 850);
        addPoints(ptsEarned, 'tabuada_espacial_acerto');
        updateQuestProgress('olimpiada_matematica', 1);

        if (!focusMode.reduced_stimuli) {
          confetti({
            particleCount: 30 + combo * 10,
            spread: 60,
            origin: { y: 0.6 },
          });
        }

        setFeedback({
          isCorrect: true,
          message: `🎯 TIRO CERTEIRO! Asteroide destruído com sucesso! Combo x${nextCombo} ativado!`,
        });
      } else {
        sounds.playGentleBoop();
        setCombo(1);
        setSpaceshipShield(prev => Math.max(20, prev - 15));
        setFeedback({
          isCorrect: false,
          message: currentQ.explanation,
        });
      }
    }, 400);
  };

  const handleNextChallenge = () => {
    sounds.playClick();
    setFeedback(null);
    setSelectedOptId(null);

    if (currentIndex + 1 < spaceQuestions.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setGameFinished(true);
      sounds.playLevelUp();
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.5 },
      });
    }
  };

  const handleRestart = () => {
    sounds.playClick();
    setCurrentIndex(0);
    setCombo(1);
    setScore(0);
    setLightyears(1200);
    setSpaceshipShield(100);
    setFeedback(null);
    setSelectedOptId(null);
    setGameFinished(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      {/* Barra Superior de Navegação */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <Link
          href="/jogos"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border-2 border-slate-700 hover:border-amber-400 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-all shadow-md"
        >
          <ArrowLeft size={16} />
          <span>Voltar aos Jogos</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-purple-950/80 border border-purple-500/80 px-3 py-1 rounded-full text-xs font-pixel text-purple-300">
            <Rocket size={13} className="text-pink-400" />
            <span>{lightyears.toLocaleString()} Anos-luz</span>
          </div>
          <div className="flex items-center gap-1 bg-amber-950/80 border border-amber-500/80 px-3 py-1 rounded-full text-xs font-pixel text-amber-300">
            <Zap size={13} className="text-yellow-400" />
            <span>Combo: x{combo}</span>
          </div>
        </div>
      </div>

      {!gameFinished ? (
        <div className="space-y-6">
          
          {/* Cockpit & HUD Espacial */}
          <div className="pixel-box bg-gradient-to-b from-indigo-950 via-slate-950 to-purple-950 p-6 border-indigo-500 shadow-2xl relative overflow-hidden">
            
            {/* Fundo Estelar Retrô */}
            {!focusMode.reduced_stimuli && (
              <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
            )}

            {/* Painel do Copiloto Pet e Nave */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-indigo-900/60 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-indigo-900/80 border-2 border-amber-400 rounded-2xl flex items-center justify-center shadow-lg">
                  <PetIcon petId={activePet?.id || 'pipoca_raposa'} size={42} mood={combo > 2 ? 'happy' : 'idle'} accessoryId={equippedAccessoryId} />
                </div>
                <div>
                  <span className="font-pixel text-[10px] text-pink-400 block">COPILOTO CÓSMICO</span>
                  <span className="font-pixel text-xs text-white">{activePet?.name || 'Pipoca'}</span>
                  <span className="text-[11px] text-slate-400 block">
                    {combo >= 3 ? '🚀 Hiperespaço Ativado!' : '🛸 Nave Pronta para Disparar'}
                  </span>
                </div>
              </div>

              {/* Status do Escudo da Nave */}
              <div className="w-full sm:w-48 bg-slate-900/90 p-2.5 rounded-xl border border-slate-700">
                <div className="flex items-center justify-between text-[10px] font-pixel mb-1">
                  <span className="text-cyan-300 flex items-center gap-1">
                    <Shield size={12} className="text-cyan-400" /> ESCUDO NAVE
                  </span>
                  <span className={spaceshipShield > 40 ? 'text-emerald-400' : 'text-rose-400'}>
                    {spaceshipShield}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      spaceshipShield > 40 
                        ? 'bg-gradient-to-r from-cyan-500 to-emerald-400' 
                        : 'bg-gradient-to-r from-orange-500 to-rose-500'
                    }`}
                    style={{ width: `${spaceshipShield}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Radar de Desafio Cósmico (Alerta de Meteoro & Boss) */}
            <div className="py-6 text-center relative z-10">
              {currentIndex === spaceQuestions.length - 1 || combo >= 4 ? (
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-950 border-2 border-rose-500 text-rose-300 font-pixel text-[10px] uppercase mb-3 animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.5)]">
                  <span className="text-sm">👾</span>
                  <span>MEGA METEORO CHEFÃO DETECTADO (+50 BÔNUS!)</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-500 text-indigo-300 font-pixel text-[10px] uppercase mb-3">
                  <AlertTriangle size={12} className="text-amber-400" />
                  <span>DESAFIO DE METEORO ARITMÉTICO • FASE {currentIndex + 1} DE {spaceQuestions.length}</span>
                </div>
              )}

              {combo > 1 && (
                <div className="mb-2">
                  <span className="inline-flex items-center gap-1 font-pixel text-xs text-yellow-300 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-500 animate-bounce shadow">
                    <Zap size={13} className="text-yellow-400" /> COMBO x{combo} ATIVADO!
                  </span>
                </div>
              )}

              <h2 className="text-xl sm:text-2xl font-extrabold text-white max-w-xl mx-auto leading-relaxed mb-4">
                {currentQ.prompt}
              </h2>

              <button
                type="button"
                onClick={handleListen}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-900/70 hover:bg-indigo-800 text-indigo-200 border border-indigo-500 rounded-xl text-xs font-bold transition-colors"
              >
                <Volume2 size={16} />
                <span>Ouvir Desafio</span>
              </button>
            </div>

            {/* Efeito de Disparo de Laser na Nave */}
            <div className="flex justify-center mb-6 relative z-10">
              {isFiring && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-3 h-16 bg-gradient-to-t from-cyan-400 via-amber-300 to-transparent rounded-full shadow-[0_0_15px_#22d3ee] pointer-events-none animate-ping" />
              )}
              <div className={`text-5xl transition-all duration-200 ${isFiring ? 'scale-125 -translate-y-2' : ''}`}>
                🚀
              </div>
            </div>

            {/* Alternativas dos Asteroides (Canhões de Resposta) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
              {currentQ.options.map(opt => {
                const isSelected = selectedOptId === opt.id;
                const isCorrectAnswer = opt.text.trim().toLowerCase() === currentQ.correct_answer.trim().toLowerCase();

                let btnStyle = 'bg-slate-900/90 border-slate-700 text-white hover:border-amber-400 hover:bg-slate-800';
                if (feedback && isSelected) {
                  btnStyle = feedback.isCorrect
                    ? 'bg-emerald-600 border-emerald-400 text-white'
                    : 'bg-rose-600 border-rose-400 text-white';
                } else if (feedback && isCorrectAnswer) {
                  btnStyle = 'bg-emerald-700/80 border-emerald-400 text-emerald-200';
                }

                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={isFiring || Boolean(feedback?.isCorrect)}
                    onClick={() => handleAnswer(opt.text, opt.id)}
                    className={`p-4 rounded-2xl border-4 font-pixel text-base sm:text-lg text-center transition-all shadow-lg active:scale-95 flex flex-col items-center justify-center gap-1 ${btnStyle}`}
                  >
                    <span className="text-xl">☄️</span>
                    <span>{opt.text}</span>
                  </button>
                );
              })}
            </div>

            {/* Painel de Feedback Pedagógico */}
            {feedback && (
              <div className={`mt-6 p-4 rounded-xl border-2 text-xs sm:text-sm font-bold relative z-10 transition-all ${
                feedback.isCorrect 
                  ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300' 
                  : 'bg-rose-950/90 border-rose-500 text-rose-300'
              }`}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0">{feedback.isCorrect ? '🌟' : '💡'}</span>
                  <div className="flex-1">
                    <p className="leading-relaxed">{feedback.message}</p>
                    {feedback.isCorrect && (
                      <div className="mt-3">
                        <PixelButton
                          variant="success"
                          size="sm"
                          onClick={handleNextChallenge}
                        >
                          PRÓXIMO METEORO 🚀
                        </PixelButton>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Dicas Pedagógicas BNCC de Apoio */}
          <div className="pixel-box bg-slate-900 p-4 border-slate-800 text-slate-400 text-xs flex items-center justify-between">
            <span className="font-pixel text-[10px] text-cyan-400 flex items-center gap-1">
              <Sparkles size={13} /> DICA DO COMANDANTE:
            </span>
            <span className="text-right">
              Multiplicação é somar parcelas iguais várias vezes! (Ex: 6 × 7 = 7 + 7 + 7 + 7 + 7 + 7)
            </span>
          </div>

        </div>
      ) : (
        /* Tela de Missão Concluída */
        <div className="pixel-box bg-gradient-to-b from-indigo-950 to-slate-950 p-8 text-center border-amber-400 shadow-2xl space-y-6">
          <div className="text-6xl animate-bounce">🏆</div>
          <h2 className="font-pixel text-2xl text-amber-300">
            MISSÃO ESPACIAL CUMPRIDA!
          </h2>
          <p className="text-slate-300 max-w-md mx-auto text-sm leading-relaxed">
            Parabéns, Comandante! Você navegou por todos os cinturões de asteroides resolvendo a tabuada com maestria!
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto py-2">
            <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-700">
              <span className="font-pixel text-[10px] text-slate-400 block mb-1">PONTOS</span>
              <span className="font-pixel text-lg text-amber-300">+{score} 🪙</span>
            </div>
            <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-700">
              <span className="font-pixel text-[10px] text-slate-400 block mb-1">MAIOR COMBO</span>
              <span className="font-pixel text-lg text-cyan-300">x{maxCombo} ⚡</span>
            </div>
            <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-700">
              <span className="font-pixel text-[10px] text-slate-400 block mb-1">DISTÂNCIA</span>
              <span className="font-pixel text-lg text-pink-300">{lightyears} AL</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <PixelButton
              variant="warning"
              size="md"
              onClick={handleRestart}
              icon={<RotateCcw size={16} />}
            >
              VOAR NOVAMENTE 🚀
            </PixelButton>
            <Link href="/jogos">
              <PixelButton variant="dark" size="md">
                VOLTAR AO HUB DE JOGOS
              </PixelButton>
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}
