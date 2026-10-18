'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../lib/auth-context';
import { sounds } from '../../../lib/sound-effects';
import { PixelButton } from '../../../components/PixelButton';
import { PetIcon } from '../../../components/PetIcon';
import { 
  Keyboard, Star, Sparkles, Award, ArrowRight, ShieldCheck, 
  RotateCcw, Zap, Target, Gauge, Heart
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TypingWord {
  id: string;
  word: string;
  category: string;
  tip: string;
}

const LESSON_WORDS: TypingWord[] = [
  { id: 'w1', word: 'SOL', category: 'Natureza', tip: 'Dedo anelar esquerdo (S), anelar direito (O), indicador direito (L)' },
  { id: 'w2', word: 'LUA', category: 'Espaço', tip: 'Três letrinhas brilhantes no céu!' },
  { id: 'w3', word: 'CASA', category: 'Cotidiano', tip: 'Use o dedo médio esquerdo no C e indicador no A' },
  { id: 'w4', word: 'BOLA', category: 'Brincadeira', tip: 'B de bola, O de olho, L de lua, A de amor!' },
  { id: 'w5', word: 'GATO', category: 'Animais', tip: 'O companheiro ronronante do teclado' },
  { id: 'w6', word: 'LIVRO', category: 'Escola', tip: 'Ler livros expande sua imaginação!' },
  { id: 'w7', word: 'PIPO', category: 'Pets', tip: 'Treine os dedos no nome da raposinha' },
  { id: 'w8', word: 'AMIGO', category: 'Sentimentos', tip: 'Um amigo de verdade sempre ajuda a estudar!' },
];

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ç'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

export default function DigitacaoGamePage() {
  const { profile, activePet, focusMode, addPoints } = useAuth();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [typedChars, setTypedChars] = useState('');
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [speedMode, setSpeedMode] = useState<'calmo' | 'normal' | 'turbo'>('calmo');
  const [stars, setStars] = useState(0);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [isCompletedSession, setIsCompletedSession] = useState(false);
  const [shakeError, setShakeError] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const currentItem = LESSON_WORDS[currentIndex] || LESSON_WORDS[0];
  const targetWord = currentItem.word;
  const nextExpectedChar = targetWord[typedChars.length] || '';

  // Foco automático no input para capturar teclado físico
  useEffect(() => {
    inputRef.current?.focus();
  }, [currentIndex, isCompletedSession]);

  // Captura de digitação física
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isCompletedSession) return;

    const key = e.key.toUpperCase();

    // Inicia cronômetro no primeiro toque
    if (!startTime) {
      setStartTime(Date.now());
    }

    // Ignora teclas de controle como Shift, Alt, etc.
    if (key.length > 1 && key !== 'BACKSPACE') return;

    if (key === 'BACKSPACE') {
      if (typedChars.length > 0) {
        setTypedChars(prev => prev.slice(0, -1));
        sounds.playClick();
      }
      return;
    }

    setTotalKeystrokes(prev => prev + 1);

    if (key === nextExpectedChar) {
      // Acerto da letra
      const newTyped = typedChars + key;
      setTypedChars(newTyped);
      setCorrectKeystrokes(prev => prev + 1);
      sounds.playClick();

      // Completou a palavra inteira!
      if (newTyped === targetWord) {
        sounds.playSuccess();
        sounds.playCoin();
        setStars(prev => prev + 1);
        const pts = 20;
        setPointsEarned(prev => prev + pts);
        addPoints(pts, `digitacao_${currentItem.id}`);

        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.6 },
        });

        setTimeout(() => {
          if (currentIndex + 1 < LESSON_WORDS.length) {
            setCurrentIndex(prev => prev + 1);
            setTypedChars('');
          } else {
            setIsCompletedSession(true);
            sounds.playFanfare();
            confetti({
              particleCount: 90,
              spread: 80,
              origin: { y: 0.6 }
            });
          }
        }, 500);
      }
    } else {
      // Erro gentil
      sounds.playGentleBoop();
      setShakeError(true);
      setTimeout(() => setShakeError(false), 300);
    }
  };

  // Clique na tecla virtual na tela (Touch / Mouse)
  const handleVirtualKeyClick = (char: string) => {
    if (isCompletedSession) return;
    if (!startTime) setStartTime(Date.now());

    setTotalKeystrokes(prev => prev + 1);

    if (char === nextExpectedChar) {
      const newTyped = typedChars + char;
      setTypedChars(newTyped);
      setCorrectKeystrokes(prev => prev + 1);
      sounds.playClick();

      if (newTyped === targetWord) {
        sounds.playSuccess();
        sounds.playCoin();
        setStars(prev => prev + 1);
        const pts = 20;
        setPointsEarned(prev => prev + pts);
        addPoints(pts, `digitacao_${currentItem.id}`);

        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.6 },
        });

        setTimeout(() => {
          if (currentIndex + 1 < LESSON_WORDS.length) {
            setCurrentIndex(prev => prev + 1);
            setTypedChars('');
          } else {
            setIsCompletedSession(true);
            sounds.playFanfare();
          }
        }, 500);
      }
    } else {
      sounds.playGentleBoop();
      setShakeError(true);
      setTimeout(() => setShakeError(false), 300);
    }
  };

  // Cálculo de Precisão e WPM calibrado para crianças
  const accuracy = totalKeystrokes > 0 ? Math.round((correctKeystrokes / totalKeystrokes) * 100) : 100;
  const timeElapsedMinutes = startTime ? (Date.now() - startTime) / 60000 : 0.1;
  const wordsTyped = (currentIndex * 5 + typedChars.length) / 5;
  const wpm = timeElapsedMinutes > 0 ? Math.min(60, Math.round(wordsTyped / timeElapsedMinutes)) : 0;

  const handleRestart = () => {
    sounds.playClick();
    setCurrentIndex(0);
    setTypedChars('');
    setTotalKeystrokes(0);
    setCorrectKeystrokes(0);
    setStartTime(null);
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
            <span className="font-pixel text-xs text-orange-400">LETRAMENTO DIGITAL & AGILIDADE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            Mestre do Teclado ⌨️
          </h1>
        </div>

        {/* HUD DE MÉTRICAS */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="bg-slate-900 border-2 border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <Gauge className="w-4 h-4 text-cyan-400" />
            <span className="font-pixel text-xs text-cyan-300">{wpm} WPM</span>
          </div>

          <div className="bg-slate-900 border-2 border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <Target className="w-4 h-4 text-emerald-400" />
            <span className="font-pixel text-xs text-emerald-300">{accuracy}%</span>
          </div>

          <div className="bg-slate-900 border-2 border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="font-pixel text-xs text-yellow-300">{stars}</span>
          </div>
        </div>
      </div>

      {/* AVISO DE MODO FOCO */}
      {focusMode.is_active && (
        <div className="mb-6 p-3 bg-emerald-950/70 border-2 border-emerald-500 rounded-xl flex items-center justify-between text-xs text-emerald-200">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-400 shrink-0" />
            <span>Modo Foco Ativo: Teclas destacadas com calma, sem penalidades de tempo.</span>
          </div>
          <span className="font-pixel text-[10px] bg-emerald-900 text-emerald-300 px-2 py-0.5 rounded">
            RITMO SUAVE
          </span>
        </div>
      )}

      {/* TELA DE SUCESSO DA SESSÃO */}
      {isCompletedSession ? (
        <div className="pixel-box bg-slate-900/95 p-8 text-center border-orange-500/80 animate-scale-up">
          <div className="w-20 h-20 bg-gradient-to-t from-orange-600 to-amber-500 rounded-2xl mx-auto flex items-center justify-center mb-4 border-4 border-orange-300 shadow-[0_0_25px_rgba(249,115,22,0.5)]">
            <Award size={44} className="text-white" />
          </div>

          <h2 className="font-pixel text-xl sm:text-2xl text-orange-300 mb-2">
            SEUS DEDOS SÃO MÁGICOS!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto mb-6">
            Parabéns! Você dominou o teclado como um programador prodígio e conquistou <strong>+{pointsEarned} Moedas Mágicas</strong>!
          </p>

          <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto mb-8">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="font-pixel text-[10px] text-slate-400 block">PRECISÃO</span>
              <span className="font-pixel text-lg text-emerald-400">{accuracy}%</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="font-pixel text-[10px] text-slate-400 block">VELOCIDADE</span>
              <span className="font-pixel text-lg text-cyan-300">{wpm} WPM</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="font-pixel text-[10px] text-slate-400 block">RECOMPENSA</span>
              <span className="font-pixel text-lg text-amber-300">+{pointsEarned} 🪙</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <PixelButton variant="primary" size="md" onClick={handleRestart}>
              JOGAR NOVAMENTE 🔄
            </PixelButton>
            <Link href="/jogos">
              <PixelButton variant="warning" size="md">
                OUTROS MINIJOGOS 🎮
              </PixelButton>
            </Link>
          </div>
        </div>
      ) : (
        /* ARENA PRINCIPAL DE DIGITAÇÃO */
        <div className="pixel-box bg-slate-900/95 p-6 sm:p-8 border-orange-500/80">
          
          {/* INPUT OCULTO PARA DIGITAÇÃO REAL */}
          <input
            ref={inputRef}
            type="text"
            className="opacity-0 absolute -top-9999px left-0"
            onKeyDown={handleKeyDown}
            autoFocus
          />

          <div className="flex items-center justify-between mb-4">
            <span className="font-pixel text-[11px] text-orange-300 bg-orange-950/80 border border-orange-600 px-3 py-1 rounded-lg">
              CATEGORIA: {currentItem.category.toUpperCase()}
            </span>
            <span className="text-xs text-slate-400">
              Palavra {currentIndex + 1} de {LESSON_WORDS.length}
            </span>
          </div>

          {/* PALAVRA ALVO EM LETRAS RETRÔ GIGANTES */}
          <div className={`text-center my-8 ${shakeError ? 'animate-shake' : ''}`}>
            <p className="text-xs text-slate-400 font-pixel mb-3">DIGITE NO TECLADO:</p>
            
            <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
              {targetWord.split('').map((char, idx) => {
                const isCharTyped = idx < typedChars.length;
                const isCharCurrent = idx === typedChars.length;

                return (
                  <div
                    key={idx}
                    className={`w-14 h-16 sm:w-16 sm:h-20 rounded-2xl flex items-center justify-center font-pixel text-2xl sm:text-4xl border-3 shadow-lg transition-all ${
                      isCharTyped
                        ? 'bg-emerald-600 border-emerald-300 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                        : isCharCurrent
                          ? 'bg-amber-400 border-yellow-200 text-slate-950 scale-110 animate-pulse shadow-[0_0_20px_rgba(251,191,36,0.6)]'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {char}
                  </div>
                );
              })}
            </div>

            {/* DICA DE POSICIONAMENTO DOS DEDOS */}
            <p className="text-xs text-slate-300 mt-4 max-w-md mx-auto bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
              💡 <span className="text-amber-300 font-bold">Dica:</span> {currentItem.tip}
            </p>
          </div>

          {/* TECLADO VIRTUAL RETRÔ COM TECLA ALVO EM DESTAQUE */}
          <div className="bg-slate-950/90 border-2 border-slate-800 p-4 rounded-2xl mb-6">
            <div className="space-y-2">
              {KEYBOARD_ROWS.map((row, rIdx) => (
                <div key={rIdx} className="flex justify-center gap-1 sm:gap-2">
                  {row.map(k => {
                    const isTargetKey = k === nextExpectedChar;
                    return (
                      <button
                        key={k}
                        type="button"
                        onClick={() => handleVirtualKeyClick(k)}
                        className={`w-7 h-9 sm:w-11 sm:h-12 rounded-lg font-pixel text-xs sm:text-sm border-2 transition-all flex items-center justify-center ${
                          isTargetKey
                            ? 'bg-amber-400 border-yellow-200 text-slate-950 scale-110 shadow-[0_0_12px_rgba(251,191,36,0.8)] font-bold animate-bounce-subtle'
                            : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                        }`}
                      >
                        {k}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            <p className="text-[10px] text-slate-500 text-center mt-3">
              Toque nas teclas ou digite direto no teclado do computador/notebook!
            </p>
          </div>

          {/* PET ACOMPANHANTE INCENTIVANDO */}
          <div className="flex items-center gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="shrink-0">
              {activePet && <PetIcon petId={activePet.id} size={36} mood="happy" />}
            </div>
            <p className="text-xs text-slate-300">
              <strong className="text-white">{activePet?.name}:</strong> &ldquo;Manter as mãos relaxadas e a coluna reta ajuda você a digitar ainda mais rápido!&rdquo;
            </p>
          </div>

        </div>
      )}

    </div>
  );
}
