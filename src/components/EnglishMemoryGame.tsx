'use client';

import React, { useState } from 'react';
import { ENGLISH_VOCABULARY, type EnglishWordItem } from '../lib/content-data';
import { speakText } from '../lib/speech';
import { sounds } from '../lib/sound-effects';
import { PixelButton } from './PixelButton';
import { RotateCcw, Trophy, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MemoryCard {
  id: string;
  wordId: string;
  kind: 'word' | 'translation';
  label: string;
  emoji: string;
}

interface EnglishMemoryGameProps {
  onAddPoints: (amount: number, reason: string) => void;
  reducedStimuli: boolean;
}

const PAIRS_PER_ROUND = 8;
const ROUND_REWARD = 30;

export function EnglishMemoryGame({ onAddPoints, reducedStimuli }: EnglishMemoryGameProps) {
  const [deck, setDeck] = useState<MemoryCard[] | null>(null);
  const [flippedKeys, setFlippedKeys] = useState<string[]>([]);
  const [matchedWordIds, setMatchedWordIds] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [roundRewardGiven, setRoundRewardGiven] = useState(false);

  const totalPairs = deck ? deck.length / 2 : PAIRS_PER_ROUND;
  const isWon = deck !== null && matchedWordIds.length === totalPairs;

  const startNewRound = () => {
    sounds.playClick();
    const pool = [...ENGLISH_VOCABULARY];
    const picked: EnglishWordItem[] = [];
    while (picked.length < PAIRS_PER_ROUND && pool.length > 0) {
      const idx = Math.floor(Math.random() * pool.length);
      picked.push(pool.splice(idx, 1)[0]);
    }
    const cards: MemoryCard[] = picked.flatMap(w => [
      { id: `${w.id}-word`, wordId: w.id, kind: 'word' as const, label: w.word, emoji: w.emoji },
      { id: `${w.id}-trans`, wordId: w.id, kind: 'translation' as const, label: w.translation, emoji: w.emoji },
    ]);
    // Embaralhamento Fisher-Yates
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    setDeck(cards);
    setFlippedKeys([]);
    setMatchedWordIds([]);
    setMoves(0);
    setIsChecking(false);
    setRoundRewardGiven(false);
  };

  const flipCard = (card: MemoryCard) => {
    if (isChecking || !deck || isWon) return;
    if (flippedKeys.includes(card.id) || matchedWordIds.includes(card.wordId)) return;

    sounds.playClick();
    const newFlipped = [...flippedKeys, card.id];
    setFlippedKeys(newFlipped);

    if (newFlipped.length < 2) return;

    setMoves(m => m + 1);
    const firstId = newFlipped[0];
    const first = deck.find(c => c.id === firstId)!;
    const second = card;

    if (first.wordId === second.wordId && first.kind !== second.kind) {
      // PAR ENCONTRADO: celebra e fala a palavra em inglês
      window.setTimeout(() => {
        sounds.playSuccess();
        const word = ENGLISH_VOCABULARY.find(w => w.id === first.wordId);
        if (word) speakText(word.word, 'en-US');
        setMatchedWordIds(prev => [...prev, first.wordId]);
        setFlippedKeys([]);

        const willMatchCount = matchedWordIds.length + 1;
        if (deck && willMatchCount === deck.length / 2) {
          // FIM DE JOGO: vitória!
          sounds.playFanfare();
          if (!reducedStimuli) {
            confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });
          }
          if (!roundRewardGiven) {
            setRoundRewardGiven(true);
            onAddPoints(ROUND_REWARD, 'ingles_memoria');
          }
        }
      }, 350);
    } else {
      // Errou o par: vira de volta
      setIsChecking(true);
      window.setTimeout(() => {
        sounds.playGentleBoop();
        setFlippedKeys([]);
        setIsChecking(false);
      }, 850);
    }
  };

  const speakMatchedWord = (card: MemoryCard) => {
    const word = ENGLISH_VOCABULARY.find(w => w.id === card.wordId);
    if (word) {
      sounds.playClick();
      speakText(word.word, 'en-US');
    }
  };

  // ================================================================
  // TELA DE ABERTURA DO MODO
  // ================================================================
  if (!deck) {
    return (
      <div className="pixel-box bg-slate-900/95 p-8 text-center border-purple-400">
        <div className="text-5xl mb-4" aria-hidden="true">🃏🧠</div>
        <h2 className="font-pixel text-base text-purple-300 mb-3">
          MODO MEMÓRIA MÁGICA!
        </h2>
        <p className="text-xs text-slate-300 max-w-md mx-auto mb-6 leading-relaxed">
          Encontre os 8 pares: cada palavra em inglês tem seu par na tradução.
          Quando você achar um par, o jogo fala a palavra em inglês para você
          nunca mais esquecer! 🎧✨
        </p>
        <PixelButton variant="primary" size="lg" onClick={startNewRound}>
          EMBARALHAR E COMEÇAR! 🎴
        </PixelButton>
      </div>
    );
  }

  return (
    <div>
      {/* HUD DO JOGO */}
      <div className="flex items-center justify-between mb-4 text-xs font-pixel">
        <span className="text-purple-300">
          PARES: {matchedWordIds.length}/{totalPairs}
        </span>
        <span className="text-amber-300">
          JOGADAS: {moves}
        </span>
        <span
          className="flex items-center gap-1 text-emerald-300 cursor-pointer"
          onClick={() => matchedWordIds.length > 0 && speakMatchedWord(deck.find(c => c.wordId === matchedWordIds[matchedWordIds.length - 1])!)}
          title="Ouvir a última palavra pareada"
        >
          <Volume2 size={14} /> OUVIR
        </span>
      </div>

      {/* TABULEIRO 4x4 */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-6">
        {deck.map(card => {
          const isFaceUp = flippedKeys.includes(card.id) || matchedWordIds.includes(card.wordId);
          const isMatched = matchedWordIds.includes(card.wordId);
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => flipCard(card)}
              disabled={isMatched}
              className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center p-1.5 transition-all duration-300 select-none ${
                isMatched
                  ? 'bg-emerald-950/70 border-emerald-400 opacity-70'
                  : isFaceUp
                    ? 'bg-purple-950/80 border-purple-400 scale-105'
                    : 'bg-slate-800 border-slate-700 hover:border-purple-400 hover:scale-105'
              }`}
              aria-label={isFaceUp ? `${card.label}` : 'Carta virada para baixo'}
            >
              {isFaceUp ? (
                <>
                  <span className="text-lg mb-0.5" aria-hidden="true">{card.emoji}</span>
                  <span className={`text-[10px] sm:text-xs font-bold text-center leading-tight ${
                    card.kind === 'word' ? 'text-purple-200' : 'text-emerald-200'
                  }`}>
                    {card.label}
                  </span>
                </>
              ) : (
                <span className="text-2xl" aria-hidden="true">🃏</span>
              )}
            </button>
          );
        })}
      </div>

      {/* TELA DE VITÓRIA */}
      {isWon && (
        <div className="pixel-box bg-slate-900/95 p-6 text-center border-emerald-400 animate-scale-up mb-4">
          <div className="text-4xl mb-2" aria-hidden="true">🏆🐘</div>
          <h2 className="font-pixel text-sm text-emerald-300 mb-2">
            VOCÊ TEM MEMÓRIA DE ELEFANTE!
          </h2>
          <p className="text-xs text-slate-300 mb-1">
            Todos os 8 pares encontrados em <strong className="text-amber-300">{moves} jogadas</strong>!
          </p>
          {roundRewardGiven && (
            <p className="text-[11px] text-yellow-300 font-bold mb-3">
              +{ROUND_REWARD} moedas mágicas! 🪙
            </p>
          )}
          <div className="flex items-center justify-center gap-3 mt-3">
            <PixelButton variant="primary" size="sm" onClick={startNewRound} icon={<RotateCcw size={14} />}>
              JOGAR DE NOVO
            </PixelButton>
          </div>
        </div>
      )}

      {/* BOTÃO DE NOVO TABULEIRO (durante o jogo) */}
      {!isWon && (
        <div className="text-center">
          <PixelButton variant="dark" size="sm" onClick={startNewRound} icon={<RotateCcw size={14} />}>
            EMBARALHAR DE NOVO
          </PixelButton>
        </div>
      )}

      {/* LEGENDA DAS CORES */}
      <div className="flex items-center justify-center gap-4 mt-4 text-[10px] text-slate-500">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-400 inline-block" /> Palavra em inglês
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" /> Tradução
        </span>
        <span className="flex items-center gap-1">
          <Trophy size={11} /> 8 pares = +{ROUND_REWARD} moedas
        </span>
      </div>
    </div>
  );
}
