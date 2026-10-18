'use client';

import React, { useState } from 'react';
import { useAuth } from '../../lib/auth-context';
import { INITIAL_QUESTS } from '../../lib/content-data';
import { PixelButton } from '../../components/PixelButton';
import { QuestItem } from '../../lib/types';
import { sounds } from '../../lib/sound-effects';
import { Target, Flame, Gift, Trophy, CheckCircle, Clock, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function MissoesPage() {
  const { profile, addPoints } = useAuth();
  const [quests, setQuests] = useState<QuestItem[]>(INITIAL_QUESTS);

  const achievements = [
    { id: 'first_win', title: 'Primeiro Passo', desc: 'Completou a primeira lição de reforço', icon: '🌱', unlocked: true },
    { id: 'math_hero', title: 'Calculadora Veloz', desc: 'Acertou 10 operações sem errar', icon: '⚡', unlocked: true },
    { id: 'reader_star', title: 'Mestre da Leitura', desc: 'Leu e completou 5 historinhas', icon: '📖', unlocked: false },
    { id: 'streak_7', title: 'Fogo Sagrado', desc: 'Manteve 7 dias seguidos de reforço', icon: '🔥', unlocked: false },
  ];

  const handleClaimReward = (questId: string) => {
    const q = quests.find(item => item.id === questId);
    if (!q || !q.is_completed || q.is_claimed) return;

    sounds.playLevelUp();
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
    });

    addPoints(q.reward_points, `quest_${q.quest_key}`);

    setQuests(prev =>
      prev.map(item =>
        item.id === questId ? { ...item, is_claimed: true } : item
      )
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="font-pixel text-xs text-amber-400">DESAFIOS & RECOMPENSAS</span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-bold">
              Reseta Todo Dia
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Missões do Dia
          </h1>
        </div>

        {/* Card de Bônus de Streak */}
        <div className="bg-gradient-to-r from-orange-950 to-amber-950 border-2 border-orange-500/80 px-4 py-2.5 rounded-2xl flex items-center gap-3 shadow-md">
          <Flame className="text-orange-400 w-7 h-7 animate-pulse" />
          <div>
            <span className="font-pixel text-[10px] text-orange-300 block">
              SEQUÊNCIA DIÁRIA (STREAK)
            </span>
            <span className="font-pixel text-xs text-white">
              {profile?.streak_days || 1} Dias Seguidos (+10% XP)
            </span>
          </div>
        </div>
      </div>

      {/* Lista de Quests Diárias */}
      <div className="space-y-4 mb-10">
        <h2 className="font-pixel text-xs sm:text-sm text-cyan-300 flex items-center gap-2">
          <Target size={16} />
          QUESTS DE HOJE
        </h2>

        {quests.map(quest => {
          const progressPercent = Math.min(100, (quest.current_progress / quest.target_count) * 100);

          return (
            <div
              key={quest.id}
              className={`pixel-box p-5 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                quest.is_claimed
                  ? 'bg-slate-900/60 border-slate-800 opacity-70'
                  : quest.is_completed
                  ? 'bg-emerald-950/70 border-emerald-500 shadow-md'
                  : 'bg-slate-900/90 border-slate-700'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-pixel text-xs sm:text-sm text-white">
                    {quest.title}
                  </h3>
                  {quest.is_completed && !quest.is_claimed && (
                    <span className="font-pixel text-[9px] bg-emerald-500 text-slate-950 px-2 py-0.5 rounded font-bold">
                      CONCLUÍDO!
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 mb-3">
                  {quest.description}
                </p>

                {/* Barra de Progresso */}
                <div className="max-w-md">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1">
                    <span>Progresso:</span>
                    <span>{quest.current_progress} / {quest.target_count}</span>
                  </div>
                  <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Recompensa e Ação */}
              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                <div className="text-right">
                  <span className="font-pixel text-xs text-yellow-300 block">
                    +{quest.reward_points} 🪙
                  </span>
                  <span className="text-[10px] text-amber-400 font-bold">
                    +{quest.reward_xp} XP
                  </span>
                </div>

                {quest.is_claimed ? (
                  <button
                    type="button"
                    disabled
                    className="px-4 py-2 bg-slate-800 text-slate-500 font-pixel text-xs rounded-lg border border-slate-700"
                  >
                    RESGATADO
                  </button>
                ) : quest.is_completed ? (
                  <PixelButton
                    variant="success"
                    size="sm"
                    onClick={() => handleClaimReward(quest.id)}
                    icon={<Gift size={14} />}
                  >
                    RESGATAR!
                  </PixelButton>
                ) : (
                  <PixelButton
                    variant="dark"
                    size="sm"
                    onClick={() => window.location.href = '/jogos'}
                  >
                    JOGAR AGORA
                  </PixelButton>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Seção de Conquistas & Medalhas */}
      <div className="pixel-box bg-slate-900/90 p-6">
        <h2 className="font-pixel text-xs sm:text-sm text-amber-300 mb-4 flex items-center gap-2">
          <Trophy size={16} />
          CONQUISTAS E MEDALHAS
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {achievements.map(ach => (
            <div
              key={ach.id}
              className={`p-3.5 rounded-xl border-2 flex items-center gap-3.5 transition-all ${
                ach.unlocked
                  ? 'bg-amber-950/40 border-amber-500/80'
                  : 'bg-slate-950/60 border-slate-800 opacity-50'
              }`}
            >
              <span className="text-3xl">{ach.icon}</span>
              <div>
                <h4 className="font-pixel text-xs text-white mb-0.5">
                  {ach.title}
                </h4>
                <p className="text-[11px] text-slate-300">
                  {ach.desc}
                </p>
                <span className="text-[10px] font-bold text-amber-400 mt-1 block">
                  {ach.unlocked ? 'Desbloqueado! 🏅' : 'Bloqueado'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
