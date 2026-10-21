import type { PetRarity } from './types';

/**
 * Lógica pura dos minijogos do Kids-Player.
 * Funções sem efeitos colaterais, testadas em tests/unit-suite.ts.
 */

/** WPM calibrado para crianças: piso de 1s e teto de 60 (espelha o comportamento do jogo de digitação). */
export function calcWpm(wordsTyped: number, elapsedMs: number): number {
  const minutes = Math.max(elapsedMs, 1000) / 60000;
  return Math.min(60, Math.round(wordsTyped / minutes));
}

/** Chances públicas da lootbox — única fonte de verdade do cliente; o servidor valida em secure_open_lootbox. */
export const LOOTBOX_ODDS: Record<PetRarity, number> = {
  normal: 60,
  raro: 25,
  epico: 10,
  lendario: 4,
  mitico: 1,
};

/** Sorteio demo (localStorage) com rng injetável para testes determinísticos. */
export function rollLootboxDemo(rng: () => number = Math.random): PetRarity {
  const roll = rng() * 100;
  let acc = 0;
  for (const [rarity, odds] of Object.entries(LOOTBOX_ODDS)) {
    acc += odds;
    if (roll < acc) return rarity as PetRarity;
  }
  return 'mitico';
}

/** Dificuldade adaptativa: 2 acertos seguidos sobe; erro desce; nunca sai do intervalo 1–3. */
export function nextDifficulty(
  current: 1 | 2 | 3,
  wasCorrect: boolean,
  streak: number
): 1 | 2 | 3 {
  if (wasCorrect && streak >= 2) return (Math.min(3, current + 1) as 1 | 2 | 3);
  if (!wasCorrect) return (Math.max(1, current - 1) as 1 | 2 | 3);
  return current;
}
