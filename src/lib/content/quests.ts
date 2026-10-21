import type { QuestItem } from '../types';

export const INITIAL_QUESTS: QuestItem[] = [
  {
    id: 'q1',
    title: 'Olimpíada da Matemática',
    description: 'Acerte 5 desafios matemáticos nos minijogos.',
    category: 'diaria',
    reward_points: 60,
    reward_xp: 40,
    target_count: 5,
    current_progress: 2,
    is_completed: false,
    is_claimed: false,
    quest_key: 'olimpiada_matematica',
  },
  {
    id: 'q2',
    title: 'Detetive das Palavras',
    description: 'Complete uma rodada de ortografia em Português sem desistir.',
    category: 'diaria',
    reward_points: 50,
    reward_xp: 35,
    target_count: 1,
    current_progress: 1,
    is_completed: true,
    is_claimed: false,
    quest_key: 'desafio_palavras',
  },
  {
    id: 'q3',
    title: 'Voz Afiada em Inglês',
    description: 'Repita 3 palavras em inglês pelo microfone.',
    category: 'diaria',
    reward_points: 70,
    reward_xp: 50,
    target_count: 3,
    current_progress: 0,
    is_completed: false,
    is_claimed: false,
    quest_key: 'ingles_repeticao',
  },
];

