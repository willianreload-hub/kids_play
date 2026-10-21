'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../lib/auth-context';
import { PixelButton } from '../../../components/PixelButton';
import { PetIcon } from '../../../components/PetIcon';
import { sounds } from '../../../lib/sound-effects';
import { speakText, stopSpeaking } from '../../../lib/speech';
import {
  ArrowLeft, Sparkles, Volume2, Trophy, RotateCcw,
  FlaskConical, Check, Zap, Scale, Ruler, Droplet
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface FractionChallenge {
  id: string;
  type: 'fracao_visual' | 'medida_volume' | 'medida_massa' | 'medida_comprimento';
  title: string;
  prompt: string;
  audioPrompt: string;
  slicesTotal?: number;
  slicesFilled?: number;
  options: { id: string; label: string; isCorrect: boolean }[];
  hint: string;
  explanation: string;
  pedagogicalNote: string;
}

const CHALLENGES: FractionChallenge[] = [
  {
    id: 'f1',
    type: 'fracao_visual',
    title: 'A Torta Mística de Amoras',
    prompt: 'O dragãozinho comeu 2 fatias de uma torta que foi dividida em 4 pedaços iguais. Que fração da torta ele comeu?',
    audioPrompt: 'O dragãozinho comeu 2 fatias de uma torta dividida em 4 pedaços iguais. Que fração da torta ele comeu?',
    slicesTotal: 4,
    slicesFilled: 2,
    options: [
      { id: 'opt_1_4', label: '1/4 (Um Quarto)', isCorrect: false },
      { id: 'opt_2_4', label: '2/4 (ou a Metade!)', isCorrect: true },
      { id: 'opt_3_4', label: '3/4 (Três Quartos)', isCorrect: false },
      { id: 'opt_4_4', label: '4/4 (A Torta Inteira)', isCorrect: false },
    ],
    hint: 'Lembre-se: o número de baixo (denominador) é em quantas partes dividimos, e o de cima (numerador) é quantas pegamos!',
    explanation: 'Muito bem! 2 pedaços de 4 é representado por 2/4, que é exatamente a metade da torta!',
    pedagogicalNote: 'BNCC EF04MA09: Reconhecimento de frações unitárias e equivalência de 1/2 e 2/4.',
  },
  {
    id: 'f2',
    type: 'medida_volume',
    title: 'Poção da Levitação (Litros & Mililitros)',
    prompt: 'O caldeirão do alquimista precisa de 1 LITRO de água da cachoeira. Se você já despejou 600 mL, quantos mL ainda faltam?',
    audioPrompt: 'O caldeirão precisa de um litro de água. Se você já despejou 600 mililitros, quantos mililitros faltam?',
    options: [
      { id: 'opt_200', label: '200 mL', isCorrect: false },
      { id: 'opt_400', label: '400 mL', isCorrect: true },
      { id: 'opt_500', label: '500 mL', isCorrect: false },
      { id: 'opt_600', label: '600 mL', isCorrect: false },
    ],
    hint: 'Dica preciosa: 1 Litro inteiro equivale a exatamente 1000 mL (mililitros)!',
    explanation: 'Exato! 1 Litro = 1000 mL. Como já temos 600 mL, faltam 1000 - 600 = 400 mL para a poção ficar perfeita!',
    pedagogicalNote: 'BNCC EF04MA20: Conversão prática entre medidas de capacidade (Litro e Mililitro).',
  },
  {
    id: 'f3',
    type: 'fracao_visual',
    title: 'Cristal Astral Dividido',
    prompt: 'Um cristal mágico foi quebrado em 8 fragmentos iguais. Seu companheiro usou 3 fragmentos para carregar o cajado. Qual fração representa o que ele usou?',
    audioPrompt: 'Um cristal foi quebrado em 8 fragmentos iguais. Seu companheiro usou 3 fragmentos. Qual fração representa o que ele usou?',
    slicesTotal: 8,
    slicesFilled: 3,
    options: [
      { id: 'opt_3_8', label: '3/8 (Três Oitavos)', isCorrect: true },
      { id: 'opt_5_8', label: '5/8 (Cinco Oitavos)', isCorrect: false },
      { id: 'opt_1_2', label: '1/2 (Metade)', isCorrect: false },
      { id: 'opt_3_5', label: '3/5 (Três Quintos)', isCorrect: false },
    ],
    hint: 'Coloque as partes usadas em cima (3) e o total em baixo (8)!',
    explanation: 'Sensacional! O total é 8 partes e usamos 3, logo a fração é 3/8!',
    pedagogicalNote: 'BNCC EF04MA09: Representação fracionária com denominadores variados.',
  },
  {
    id: 'f4',
    type: 'medida_massa',
    title: 'A Balança do Dragão Amigo',
    prompt: 'O filhote de dragão precisa de 2 QUILOGRAMAS (kg) de frutas estelares por dia. Quantos GRAMAS (g) isso representa?',
    audioPrompt: 'O dragão precisa de 2 quilogramas de frutas. Quantos gramas isso representa?',
    options: [
      { id: 'opt_200g', label: '200 gramas', isCorrect: false },
      { id: 'opt_1000g', label: '1.000 gramas', isCorrect: false },
      { id: 'opt_2000g', label: '2.000 gramas', isCorrect: true },
      { id: 'opt_20000g', label: '20.000 gramas', isCorrect: false },
    ],
    hint: 'Cada 1 kg é igual a 1.000 gramas!',
    explanation: 'Fantástico! 1 kg = 1000 g, portanto 2 kg = 2 x 1000 = 2000 gramas!',
    pedagogicalNote: 'BNCC EF04MA20: Relação de grandezas de massa (kg e g).',
  },
  {
    id: 'f5',
    type: 'fracao_visual',
    title: 'Pizza de Frutas Cósmicas',
    prompt: 'A turma quer dividir uma pizza em 6 pedaços iguais. Se comerem 5 pedaços, que fração da pizza foi consumida?',
    audioPrompt: 'A turma dividiu a pizza em 6 pedaços. Se comerem 5 pedaços, que fração foi consumida?',
    slicesTotal: 6,
    slicesFilled: 5,
    options: [
      { id: 'opt_1_6', label: '1/6 (Um Sexto)', isCorrect: false },
      { id: 'opt_5_6', label: '5/6 (Cinco Sextos)', isCorrect: true },
      { id: 'opt_6_5', label: '6/5 (Seis Quintos)', isCorrect: false },
      { id: 'opt_1_2', label: '1/2 (Metade)', isCorrect: false },
    ],
    hint: 'Quem comeu 5 de 6 fatias comeu quase a pizza inteira!',
    explanation: 'Perfeito! 5 partes consumidas de um total de 6 partes resulta na fração 5/6!',
    pedagogicalNote: 'BNCC EF04MA09: Compreensão do todo fracionado.',
  },
  {
    id: 'f6',
    type: 'medida_comprimento',
    title: 'O Tapete Voador Encantado',
    prompt: 'Para consertar o tapete voador, precisamos de 3 METROS de fita de seda dourada. Quantos CENTÍMETROS (cm) equivalem a 3 metros?',
    audioPrompt: 'Precisamos de 3 metros de fita dourada. Quantos centímetros equivalem a 3 metros?',
    options: [
      { id: 'opt_30cm', label: '30 cm', isCorrect: false },
      { id: 'opt_300cm', label: '300 cm', isCorrect: true },
      { id: 'opt_3000cm', label: '3.000 cm', isCorrect: false },
      { id: 'opt_100cm', label: '100 cm', isCorrect: false },
    ],
    hint: 'Lembrete da régua: 1 Metro = 100 Centímetros!',
    explanation: 'Isso aí! Cada 1 metro tem 100 centímetros. Logo, 3 metros = 3 x 100 = 300 centímetros!',
    pedagogicalNote: 'BNCC EF04MA20: Medidas de comprimento (metro e centímetro).',
  },
  {
    id: 'f7',
    type: 'fracao_visual',
    title: 'Frasco de Elixir Alquímico',
    prompt: 'Qual das frações abaixo representa exatamente a METADE de qualquer objeto ou quantidade?',
    audioPrompt: 'Qual das frações abaixo representa exatamente a metade?',
    slicesTotal: 2,
    slicesFilled: 1,
    options: [
      { id: 'opt_1_2', label: '1/2 (Um Meio / Metade)', isCorrect: true },
      { id: 'opt_1_3', label: '1/3 (Um Terço)', isCorrect: false },
      { id: 'opt_1_4', label: '1/4 (Um Quarto)', isCorrect: false },
      { id: 'opt_2_1', label: '2/1 (Dois Inteiros)', isCorrect: false },
    ],
    hint: 'Dividir em 2 partes iguais e pegar 1 parte dá a metade!',
    explanation: 'Exatamente! 1/2 é a fração mais famosa e representa exatamente a metade!',
    pedagogicalNote: 'BNCC EF04MA09: Fração unitária fundamental.',
  },
  {
    id: 'f8',
    type: 'medida_volume',
    title: 'Garrafinhas de Suco dos Goblins',
    prompt: 'Uma garrafa contém 1/2 litro (meio litro) de suco de laranja. Quantos mililitros (mL) tem essa garrafa?',
    audioPrompt: 'Uma garrafa contém meio litro de suco. Quantos mililitros tem essa garrafa?',
    options: [
      { id: 'opt_250', label: '250 mL', isCorrect: false },
      { id: 'opt_500', label: '500 mL', isCorrect: true },
      { id: 'opt_750', label: '750 mL', isCorrect: false },
      { id: 'opt_1000', label: '1000 mL', isCorrect: false },
    ],
    hint: 'Se 1 litro inteiro tem 1.000 mL, a metade de 1.000 é...',
    explanation: 'Perfeito! 1 Litro = 1000 mL. A metade (1/2 litro) é 500 mL!',
    pedagogicalNote: 'BNCC EF04MA09 e EF04MA20: Intersecção de fração e medidas de capacidade.',
  },
];

export default function FracoesGamePage() {
  const { activePet, focusMode, addPoints } = useAuth();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [combo, setCombo] = useState(1);
  const [maxCombo, setMaxCombo] = useState(1);
  const [score, setScore] = useState(0);
  const [totalCoinsWon, setTotalCoinsWon] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [interactiveFilled, setInteractiveFilled] = useState<number | null>(null);

  const currentCh = CHALLENGES[currentIndex];

  useEffect(() => {
    setInteractiveFilled(currentCh.slicesFilled ?? null);
    setSelectedOptionId(null);
    setFeedback(null);

    if (focusMode.is_active && focusMode.tts_auto_read && currentCh) {
      const timer = setTimeout(() => {
        speakText(currentCh.audioPrompt || currentCh.prompt, 'pt-BR');
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, currentCh, focusMode.is_active, focusMode.tts_auto_read]);

  const handleListen = () => {
    sounds.playClick();
    stopSpeaking();
    speakText(currentCh.audioPrompt || currentCh.prompt, 'pt-BR');
  };

  const handleSelectOption = (optId: string, isCorrect: boolean) => {
    if (feedback) return;

    setSelectedOptionId(optId);

    if (isCorrect) {
      sounds.playPotionBubble();
      sounds.playSuccess();
      sounds.playCoin();

      const newCombo = combo + 1;
      setCombo(newCombo);
      if (newCombo > maxCombo) setMaxCombo(newCombo);

      sounds.playCombo(Math.min(newCombo, 5));

      const pointsEarned = 25 * Math.min(newCombo, 3);
      setScore(prev => prev + 100 * combo);
      setTotalCoinsWon(prev => prev + pointsEarned);
      addPoints(pointsEarned, `alquimia_fracoes_${currentCh.id}`);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#06b6d4', '#10b981', '#f59e0b']
      });

      setFeedback({
        isCorrect: true,
        message: currentCh.explanation,
      });
    } else {
      sounds.playGentleBoop();
      setCombo(1);
      setFeedback({
        isCorrect: false,
        message: `${currentCh.hint}`,
      });
    }
  };

  const handleNextChallenge = () => {
    sounds.playClick();
    if (currentIndex + 1 < CHALLENGES.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setGameFinished(true);
      sounds.playFanfare();
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.5 },
      });
    }
  };

  const handleRestart = () => {
    sounds.playClick();
    setCurrentIndex(0);
    setCombo(1);
    setScore(0);
    setTotalCoinsWon(0);
    setGameFinished(false);
  };

  // Renderizador SVG da pizza/círculo fracionado
  const renderFractionWheel = (total: number, filled: number) => {
    const radius = 64;
    const center = 75;
    const slices = [];

    for (let i = 0; i < total; i++) {
      const startAngle = (i * 360) / total;
      const endAngle = ((i + 1) * 360) / total;

      const startRad = (startAngle - 90) * (Math.PI / 180);
      const endRad = (endAngle - 90) * (Math.PI / 180);

      const x1 = center + radius * Math.cos(startRad);
      const y1 = center + radius * Math.sin(startRad);
      const x2 = center + radius * Math.cos(endRad);
      const y2 = center + radius * Math.sin(endRad);

      const largeArc = endAngle - startAngle > 180 ? 1 : 0;
      const pathData = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

      const isSliceFilled = i < filled;

      slices.push(
        <path
          key={i}
          d={pathData}
          fill={isSliceFilled ? '#06b6d4' : '#1e293b'}
          stroke="#0f172a"
          strokeWidth="2.5"
          className="transition-all duration-300 hover:opacity-90"
        />
      );
    }

    return (
      <div className="flex flex-col items-center">
        <svg width="150" height="150" viewBox="0 0 150 150" className="drop-shadow-lg">
          <circle cx={center} cy={center} r={radius + 3} fill="#0f172a" stroke="#38bdf8" strokeWidth="3" />
          {slices}
          <circle cx={center} cy={center} r="6" fill="#f8fafc" />
        </svg>
        <span className="font-pixel text-[11px] text-cyan-300 mt-2 bg-slate-900/90 px-3 py-1 rounded-full border border-cyan-500/50">
          {filled} de {total} partes pintadas
        </span>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* NAVEGAÇÃO & CABEÇALHO */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/jogos" className="text-xs font-pixel text-slate-400 hover:text-white flex items-center gap-1">
              <ArrowLeft size={14} /> VOLTAR AO HUB
            </Link>
            <span className="text-slate-600">•</span>
            <span className="font-pixel text-xs text-purple-400">MATEMÁTICA VISUAL & MEDIDAS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            Alquimia das Frações & Medidas 🧪
          </h1>
        </div>

        {/* HUD DE COMBO E MOEDAS */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 border-2 border-purple-500/60 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <Zap className={`w-4 h-4 ${combo > 1 ? 'text-amber-400 animate-bounce' : 'text-slate-400'}`} />
            <span className="font-pixel text-xs text-purple-300">
              COMBO x{combo}
            </span>
          </div>

          <div className="bg-slate-900 border-2 border-amber-500/60 px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-pixel text-xs text-yellow-300">
            <span>+{totalCoinsWon}</span>
            <span>🪙</span>
          </div>

          <div className="bg-slate-900 border-2 border-slate-800 px-3 py-1.5 rounded-xl text-xs font-pixel text-slate-300">
            {currentIndex + 1} / {CHALLENGES.length}
          </div>
        </div>
      </div>

      {/* MODO FOCO INDICATOR */}
      {focusMode.is_active && (
        <div className="mb-6 p-3 bg-purple-950/70 border-2 border-purple-400 rounded-xl flex items-center justify-between text-xs text-purple-200">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-purple-300 animate-pulse" />
            <span>Modo Foco Ativo: Ritmo calmo, leitura automática e sem contagem regressiva punitiva!</span>
          </div>
          <button
            type="button"
            onClick={handleListen}
            className="px-2.5 py-1 bg-purple-800 hover:bg-purple-700 text-white rounded font-pixel text-[10px] flex items-center gap-1"
          >
            <Volume2 size={12} /> OUVIR
          </button>
        </div>
      )}

      {/* TELA PRINCIPAL DE DESAFIO OU TELA FINAL */}
      {!gameFinished ? (
        <div className="pixel-box bg-slate-900/95 p-6 border-purple-500 shadow-2xl">
          
          {/* TOPO: ÍCONE DO TIPO E TÍTULO */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-purple-900/50 border border-purple-500/50 text-purple-300">
                {currentCh.type === 'fracao_visual' && <FlaskConical size={20} />}
                {currentCh.type === 'medida_volume' && <Droplet size={20} />}
                {currentCh.type === 'medida_massa' && <Scale size={20} />}
                {currentCh.type === 'medida_comprimento' && <Ruler size={20} />}
              </span>
              <div>
                <h3 className="font-pixel text-sm sm:text-base text-white">
                  {currentCh.title}
                </h3>
                <span className="text-[10px] text-purple-300 font-bold">
                  {currentCh.pedagogicalNote}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleListen}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-1 text-xs"
              title="Ouvir Enunciado"
            >
              <Volume2 size={16} />
              <span className="hidden sm:inline font-pixel text-[10px]">OUVIR</span>
            </button>
          </div>

          {/* ÁREA CENTRAL: REPRESENTAÇÃO VISUAL INTERATIVA + ENUNCIADO */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center mb-8">
            
            {/* ILUSTRAÇÃO VISUAL DA FRAÇÃO OU DO CALDEIRÃO */}
            <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-950/80 rounded-2xl border-2 border-slate-800 min-h-[190px]">
              {currentCh.slicesTotal ? (
                renderFractionWheel(currentCh.slicesTotal, interactiveFilled ?? currentCh.slicesFilled ?? 0)
              ) : (
                <div className="flex flex-col items-center text-center">
                  <div className="relative">
                    <FlaskConical className="w-20 h-20 text-purple-400 animate-pulse" />
                    <Sparkles className="w-6 h-6 text-yellow-300 absolute -top-1 -right-2 animate-bounce" />
                  </div>
                  <span className="font-pixel text-xs text-amber-300 mt-3">
                    {currentCh.type === 'medida_volume' && '1 Litro = 1.000 mL'}
                    {currentCh.type === 'medida_massa' && '1 kg = 1.000 gramas'}
                    {currentCh.type === 'medida_comprimento' && '1 Metro = 100 cm'}
                  </span>
                </div>
              )}
            </div>

            {/* ENUNCIADO CLARO & COMPANHEIRO */}
            <div className="md:col-span-7 flex flex-col justify-between">
              <div className="p-4 bg-purple-950/40 rounded-xl border border-purple-500/40 mb-4">
                <p className="text-base sm:text-lg text-white font-medium leading-relaxed">
                  {currentCh.prompt}
                </p>
              </div>

              {/* MENSAGEM DO PET COMPANHEIRO */}
              <div className="flex items-center gap-3 p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <div className="w-10 h-10 shrink-0">
                  <PetIcon petId={activePet?.id || 'pipoca_raposa'} size={40} />
                </div>
                <div className="text-xs text-slate-300 leading-snug">
                  <span className="font-pixel text-[10px] text-amber-300 block mb-0.5">
                    {activePet?.name || 'Seu Pet'}:
                  </span>
                  {feedback
                    ? feedback.message
                    : 'Pense com calma e escolha o frasco de poção com a resposta correta!'}
                </div>
              </div>
            </div>

          </div>

          {/* OPÇÕES DE RESPOSTA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
            {currentCh.options.map(option => {
              const isSelected = selectedOptionId === option.id;
              let btnClass = 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-white';

              if (isSelected) {
                if (option.isCorrect) {
                  btnClass = 'bg-emerald-950 border-emerald-400 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.4)]';
                } else {
                  btnClass = 'bg-rose-950 border-rose-500 text-rose-200';
                }
              }

              return (
                <button
                  key={option.id}
                  type="button"
                  disabled={feedback?.isCorrect}
                  onClick={() => handleSelectOption(option.id, option.isCorrect)}
                  className={`p-4 rounded-xl border-2 font-pixel text-xs sm:text-sm text-left transition-all flex items-center justify-between ${btnClass}`}
                >
                  <span>{option.label}</span>
                  {isSelected && option.isCorrect && <Check size={18} className="text-emerald-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* BOTÃO DE CONTINUAR QUANDO ACERTA */}
          {feedback?.isCorrect && (
            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <PixelButton
                variant="success"
                size="md"
                onClick={handleNextChallenge}
              >
                PRÓXIMA POÇÃO MÁGICA 🧪 →
              </PixelButton>
            </div>
          )}

        </div>
      ) : (
        /* TELA DE CONCLUSÃO DO MINIJOGO */
        <div className="pixel-box bg-slate-900/95 p-8 text-center border-purple-400 shadow-2xl">
          <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-bounce" />
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
            Alquimista Supremo das Frações! 🌟
          </h2>
          <p className="text-slate-300 text-sm max-w-md mx-auto mb-6">
            Você dominou as fatias mágicas, cortou tortas com perfeição e converteu litros, quilos e metros feito um verdadeiro mestre!
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-lg mx-auto mb-8">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <span className="font-pixel text-[10px] text-slate-400 block mb-1">PONTOS</span>
              <span className="font-pixel text-lg text-purple-300">{score}</span>
            </div>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <span className="font-pixel text-[10px] text-slate-400 block mb-1">COMBO MÁXIMO</span>
              <span className="font-pixel text-lg text-cyan-300">x{maxCombo}</span>
            </div>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
              <span className="font-pixel text-[10px] text-slate-400 block mb-1">MOEDAS GANHAS</span>
              <span className="font-pixel text-lg text-yellow-300">+{totalCoinsWon} 🪙</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <PixelButton
              variant="warning"
              size="md"
              onClick={handleRestart}
              icon={<RotateCcw size={16} />}
            >
              JOGAR NOVAMENTE
            </PixelButton>
            <Link href="/jogos">
              <PixelButton variant="primary" size="md">
                VOLTAR AO MAPA DE JOGOS 🗺️
              </PixelButton>
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}
