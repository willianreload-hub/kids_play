'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/auth-context';
import { PixelButton } from '../../components/PixelButton';
import { sounds } from '../../lib/sound-effects';
import { 
  Target, Flame, Gift, Trophy, CheckCircle, Clock, 
  Sparkles, Shield, ArrowRight, Star, Award 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function MissoesPage() {
  const { profile, quests, claimQuestReward, streakBonusPercent, focusMode } = useAuth();
  const [claimedNotice, setClaimedNotice] = useState<string | null>(null);

  // Missões Semanais da Unidade (Grandes Metas)
  const [weeklyMissions, setWeeklyMissions] = useState([
    {
      id: 'wm1',
      title: 'Explorador da Semana',
      desc: 'Complete 10 partidas de minijogos (Matemática ou Português)',
      target: 10,
      current: 4,
      rewardPoints: 300,
      rewardXp: 180,
      isCompleted: false,
      isClaimed: false,
    },
    {
      id: 'wm2',
      title: 'Guardião dos Saberes',
      desc: 'Mantenha sua sequência ativa por pelo menos 5 dias',
      target: 5,
      current: profile?.streak_days || 3,
      rewardPoints: 500,
      rewardXp: 300,
      isCompleted: (profile?.streak_days || 3) >= 5,
      isClaimed: false,
    },
  ]);

  const achievements = [
    { id: 'first_win', title: 'Primeiro Passo', desc: 'Completou a primeira lição de reforço', icon: '🌱', unlocked: true },
    { id: 'math_hero', title: 'Mestre da Mina', desc: 'Minerou 10 blocos na matemática', icon: '⛏️', unlocked: true },
    { id: 'reader_star', title: 'Guardião das Palavras', desc: 'Destrancou pontes mágicas no português', icon: '🌉', unlocked: true },
    { id: 'streak_7', title: 'Chama Eterna', desc: 'Manteve 7 dias seguidos de reforço', icon: '🔥', unlocked: (profile?.streak_days || 1) >= 7 },
    { id: 'lootbox_lucky', title: 'Amigo dos PETs', desc: 'Chocou um companheiro no Baú Surpresa', icon: '🎁', unlocked: true },
    { id: 'crown_ready', title: 'Rumo ao Trono', desc: 'Conquistou mais de 500 pontos no total', icon: '👑', unlocked: (profile?.points || 0) >= 500 },
  ];

  const handleClaim = (questId: string, questTitle: string) => {
    sounds.playLevelUp();
    if (!focusMode.reduced_stimuli) {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    const res = claimQuestReward(questId);
    if (res.success) {
      setClaimedNotice(`Recompensa da quest "${questTitle}" resgatada! +${res.pointsEarned} Moedas creditadas (com bônus de streak)!`);
      setTimeout(() => setClaimedNotice(null), 3500);
    }
  };

  const handleClaimWeekly = (wmId: string) => {
    sounds.playLevelUp();
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
    setWeeklyMissions(prev =>
      prev.map(wm => wm.id === wmId ? { ...wm, isClaimed: true } : wm)
    );
    setClaimedNotice('Baú Semanal Resgatado com Sucesso! +300 Moedas!');
    setTimeout(() => setClaimedNotice(null), 3500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="font-pixel text-xs text-amber-400">DESAFIOS & ENGAJAMENTO</span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-bold">
              Reseta Todo Dia à Meia-Noite
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Missões & Conquistas
          </h1>
        </div>

        {/* Card do Streak Diário com Chamas */}
        <div className="pixel-box bg-gradient-to-r from-orange-950 via-slate-900 to-amber-950 p-3 sm:p-4 border-orange-500 flex items-center gap-3.5 shadow-lg">
          <div className="relative">
            <Flame className="text-orange-400 w-8 h-8 sm:w-10 sm:h-10 animate-pulse" />
            <Sparkles className="text-yellow-300 w-4 h-4 absolute -top-1 -right-1" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-pixel text-xs text-orange-300">
                STREAK: {profile?.streak_days || 1} DIAS!
              </span>
              <span className="text-[10px] bg-orange-500 text-slate-950 px-1.5 py-0.2 rounded font-bold">
                +{streakBonusPercent}% BÔNUS
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Jogue todo dia para multiplicar seus pontos e XP nas recompensas!
            </p>
          </div>
        </div>
      </div>

      {claimedNotice && (
        <div className="mb-6 p-3 bg-emerald-950/90 border-2 border-emerald-500 rounded-xl text-emerald-300 text-xs font-bold text-center animate-bounce-subtle">
          🎉 {claimedNotice}
        </div>
      )}

      {/* ============================================================== */}
      {/* SEÇÃO 1: QUESTS DIÁRIAS (ATUALIZADAS AO JOGAR) */}
      {/* ============================================================== */}
      <div className="space-y-4 mb-10">
        <div className="flex items-center justify-between border-b-2 border-slate-800 pb-2">
          <h2 className="font-pixel text-xs sm:text-sm text-cyan-300 flex items-center gap-2">
            <Target size={16} />
            QUESTS DIÁRIAS DO HERÓI
          </h2>
          <span className="text-xs text-slate-400">
            Atualizam em tempo real enquanto você joga!
          </span>
        </div>

        {quests.map(quest => {
          const progressPercent = Math.min(100, Math.round((quest.current_progress / quest.target_count) * 100));
          const bonusPoints = Math.round(quest.reward_points * (1 + (streakBonusPercent / 100)));

          return (
            <div
              key={quest.id}
              className={`pixel-box p-5 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                quest.is_claimed
                  ? 'bg-slate-900/60 border-slate-800 opacity-60'
                  : quest.is_completed
                  ? 'bg-emerald-950/80 border-emerald-400 shadow-[0_0_15px_rgba(46,213,115,0.3)]'
                  : 'bg-slate-900/90 border-slate-700 hover:border-slate-600'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-pixel text-xs sm:text-sm text-white">
                    {quest.title}
                  </h3>
                  {quest.is_completed && !quest.is_claimed && (
                    <span className="font-pixel text-[9px] bg-emerald-500 text-slate-950 px-2 py-0.5 rounded font-bold animate-pulse">
                      PRONTO PARA RESGATAR!
                    </span>
                  )}
                  {quest.is_claimed && (
                    <span className="font-pixel text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                      RESGATADO ✅
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
                    <span className={quest.is_completed ? 'text-emerald-300 font-pixel text-xs' : 'text-slate-300'}>
                      {quest.current_progress} de {quest.target_count} ({progressPercent}%)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Recompensa e Botão de Ação */}
              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                <div className="text-right">
                  <span className="font-pixel text-xs text-yellow-300 block">
                    +{bonusPoints} 🪙
                  </span>
                  <span className="text-[10px] text-amber-400 font-bold">
                    +{quest.reward_xp} XP
                  </span>
                </div>

                {quest.is_claimed ? (
                  <button
                    type="button"
                    disabled
                    className="px-4 py-2.5 bg-slate-800 text-slate-500 font-pixel text-xs rounded-lg border border-slate-700 cursor-not-allowed"
                  >
                    CONCLUÍDO
                  </button>
                ) : quest.is_completed ? (
                  <PixelButton
                    variant="success"
                    size="sm"
                    onClick={() => handleClaim(quest.id, quest.title)}
                    icon={<Gift size={15} />}
                  >
                    RESGATAR! 🎁
                  </PixelButton>
                ) : (
                  <Link href="/jogos">
                    <PixelButton variant="dark" size="sm">
                      JOGAR AGORA
                    </PixelButton>
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* SEÇÃO 2: MISSÕES SEMANAIS E BAÚS DE UNIDADE */}
      {/* ============================================================== */}
      <div className="space-y-4 mb-10">
        <div className="flex items-center justify-between border-b-2 border-slate-800 pb-2">
          <h2 className="font-pixel text-xs sm:text-sm text-amber-300 flex items-center gap-2">
            <Gift size={16} />
            BAÚS DE MISSÕES SEMANAIS
          </h2>
          <span className="text-xs text-slate-400">
            Grandes metas da temporada
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {weeklyMissions.map(wm => {
            const wmPercent = Math.min(100, Math.round((wm.current / wm.target) * 100));

            return (
              <div key={wm.id} className="pixel-box bg-slate-900 p-5 flex flex-col justify-between border-amber-600/80">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-pixel text-xs text-white">{wm.title}</span>
                    <span className="font-pixel text-[11px] text-yellow-300">+{wm.rewardPoints} 🪙</span>
                  </div>
                  <p className="text-xs text-slate-300 mb-3">{wm.desc}</p>
                  
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span>Progresso Semanal:</span>
                      <span>{wm.current}/{wm.target}</span>
                    </div>
                    <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-300"
                        style={{ width: `${wmPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  {wm.isClaimed ? (
                    <button disabled className="w-full py-2 bg-slate-800 text-slate-500 rounded-lg font-pixel text-xs">
                      BAÚ COLETADO ✅
                    </button>
                  ) : wm.isCompleted ? (
                    <PixelButton
                      variant="warning"
                      size="sm"
                      className="w-full"
                      onClick={() => handleClaimWeekly(wm.id)}
                      icon={<Gift size={14} />}
                    >
                      ABRIR BAÚ SEMANAL 🎁
                    </PixelButton>
                  ) : (
                    <Link href="/jogos" className="w-full">
                      <PixelButton variant="dark" size="sm" className="w-full">
                        AVANÇAR NA TRILHA 🚀
                      </PixelButton>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* SEÇÃO 3: CONQUISTAS E MEDALHAS DA JORNADA */}
      {/* ============================================================== */}
      <div className="pixel-box bg-slate-900/90 p-6">
        <h2 className="font-pixel text-xs sm:text-sm text-yellow-300 mb-4 flex items-center gap-2">
          <Trophy size={16} />
          CONQUISTAS E MEDALHAS DO HERÓI
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {achievements.map(ach => (
            <div
              key={ach.id}
              className={`p-3.5 rounded-xl border-2 flex items-center gap-3 transition-all ${
                ach.unlocked
                  ? 'bg-amber-950/40 border-amber-500/80 shadow-sm'
                  : 'bg-slate-950/70 border-slate-800 opacity-50'
              }`}
            >
              <span className="text-3xl shrink-0">{ach.icon}</span>
              <div>
                <h4 className="font-pixel text-[11px] text-white leading-tight mb-0.5">
                  {ach.title}
                </h4>
                <p className="text-[10px] text-slate-300 leading-snug">
                  {ach.desc}
                </p>
                <span className="text-[9px] font-bold text-amber-400 mt-1 block">
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
