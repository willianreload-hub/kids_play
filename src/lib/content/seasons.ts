// Temporadas do Kids-Player (Fase 4.3) — Passe da Sabedoria renovável.
// Estações do HEMISFÉRIO SUL; cada temporada nomeia um título cosmético
// para quem completa o Passe da Sabedoria dentro daquele período.

export interface Season {
  id: string;
  name: string;
  emoji: string;
  badgeClasses: string;
  /** Meses (1-12) em que a temporada está ativa */
  months: number[];
  /** Título cosmético premiado ao completar o Passe durante a temporada */
  rewardTitle: string;
}

export const SEASONS: Season[] = [
  {
    id: 'verao_herois',
    name: 'Verão dos Heróis',
    emoji: '☀️',
    badgeClasses: 'bg-amber-400 text-slate-950',
    months: [12, 1, 2],
    rewardTitle: 'Guardião do Sol',
  },
  {
    id: 'outono_cosmico',
    name: 'Outono Cósmico',
    emoji: '🍂',
    badgeClasses: 'bg-orange-500 text-white',
    months: [3, 4, 5],
    rewardTitle: 'Explorador das Folhas',
  },
  {
    id: 'inverno_estelar',
    name: 'Inverno Estelar',
    emoji: '❄️',
    badgeClasses: 'bg-cyan-400 text-slate-950',
    months: [6, 7, 8],
    rewardTitle: 'Mestre das Neves',
  },
  {
    id: 'primavera_magica',
    name: 'Primavera Mágica',
    emoji: '🌸',
    badgeClasses: 'bg-pink-400 text-slate-950',
    months: [9, 10, 11],
    rewardTitle: 'Flor da Sabedoria',
  },
];

/**
 * Temporada ativa no mês informado (1-12, hemisfério sul).
 * `month` e `seasons` injetáveis para testes determinísticos.
 */
export function getCurrentSeason(month: number, seasons: Season[] = SEASONS): Season {
  const found = seasons.find(s => s.months.includes(month));
  return found || seasons[0];
}
