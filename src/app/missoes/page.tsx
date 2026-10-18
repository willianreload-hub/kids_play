'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/auth-context';
import { ACHIEVEMENTS_CATALOG } from '../../lib/content-data';
import { AchievementItem } from '../../lib/types';
import { PixelButton } from '../../components/PixelButton';
import { sounds } from '../../lib/sound-effects';
import { 
  Target, Flame, Gift, Trophy, CheckCircle, Clock, 
  Sparkles, Shield, ArrowRight, Star, Award, CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function MissoesPage() {
  const { profile, quests, claimQuestReward, streakBonusPercent, focusMode, addPoints } = useAuth();
  const [claimedNotice, setClaimedNotice] = useState<string | null>(null);

  // Conquistas sincronizadas com a Sala de Troféus
  const [claimedAchievements, setClaimedAchievements] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kids_player_claimed_achievements');
      return saved ? JSON.parse(saved) : ['ach_first_win'];
    }
    return ['ach_first_win'];
  });

  // Missões Semanais da Unidade (Grandes Metas)
  const [weeklyMissions, setWeeklyMissions] = useState([
    {
      id: 'wm1',
      title: 'Explorador da Semana',
      desc: 'Complete 10 partidas de minijogos (Matemática, Português ou Ciências)',
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
      {/* SEÇÃO 3: CONQUISTAS E MEDALHAS DA JORNADA (SALA DE TROFÉUS) */}
      {/* ============================================================== */}
      <div className="pixel-box bg-slate-900/90 p-6 border-amber-400/80 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 border-b border-slate-800 pb-4">
          <div>
            <h2 className="font-pixel text-xs sm:text-sm text-yellow-300 flex items-center gap-2">
              <Trophy size={16} className="text-amber-400" />
              SALA DE TROFÉUS & CONQUISTAS (10 MARCOS)
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Conclua marcos importantes nos estudos e resgate moedas e recompensas!
            </p>
          </div>
          <Link href="/perfil">
            <PixelButton variant="primary" size="sm">
              VER SALA COMPLETA NO PERFIL 🏆
            </PixelButton>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {ACHIEVEMENTS_CATALOG.map(ach => {
            const isClaimed = claimedAchievements.includes(ach.id);
            const isReadyToClaim = !isClaimed && ach.progress >= ach.max_progress;
            const percent = Math.min(100, Math.round((ach.progress / ach.max_progress) * 100));

            return (
              <div
                key={ach.id}
                className={`pixel-box p-4 flex flex-col justify-between transition-all ${
                  isClaimed
                    ? 'bg-slate-950/70 border-slate-800 opacity-70'
                    : isReadyToClaim
                    ? 'bg-gradient-to-b from-amber-950/80 to-slate-900 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.3)]'
                    : 'bg-slate-900 border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl">{ach.icon}</span>
                    <span className="font-pixel text-[9px] uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {ach.category}
                    </span>
                  </div>

                  <h4 className="font-pixel text-xs text-white mb-1">{ach.title}</h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed mb-3">{ach.description}</p>

                  {/* Barra de Progresso */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1">
                      <span>Progresso:</span>
                      <span className="font-pixel text-amber-300">
                        {Math.min(ach.progress, ach.max_progress)} / {ach.max_progress}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  {isClaimed ? (
                    <button
                      type="button"
                      disabled
                      className="w-full py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-[11px] font-bold text-slate-500 flex items-center justify-center gap-1 cursor-not-allowed"
                    >
                      <CheckCircle2 size={13} className="text-emerald-500" />
                      Conquistado ✅
                    </button>
                  ) : isReadyToClaim ? (
                    <PixelButton
                      variant="warning"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        sounds.playLevelUp();
                        addPoints(ach.reward_coins, `conquista_${ach.id}`);
                        const nextClaimed = [...claimedAchievements, ach.id];
                        setClaimedAchievements(nextClaimed);
                        if (typeof window !== 'undefined') {
                          localStorage.setItem('kids_player_claimed_achievements', JSON.stringify(nextClaimed));
                        }
                        setClaimedNotice(`Conquista "${ach.title}" resgatada! +${ach.reward_coins} Moedas!`);
                        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
                        setTimeout(() => setClaimedNotice(null), 3500);
                      }}
                    >
                      RESGATAR (+{ach.reward_coins} 🪙)
                    </PixelButton>
                  ) : (
                    <span className="block text-center text-[10px] text-slate-500 font-bold py-1">
                      Recompensa: +{ach.reward_coins} 🪙 (+{ach.reward_xp} XP)
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

