'use client';

import React, { useState } from 'react';
import { useAuth } from '../../lib/auth-context';
import { Crown, Sparkles, Trophy, Medal, Flame, Star } from 'lucide-react';
import { sounds } from '../../lib/sound-effects';
import { AVATAR_PRESETS } from '../../lib/content-data';

interface RankUser {
  rank: number;
  nickname: string;
  avatarPreset: string;
  points: number;
  grade: number;
  streak: number;
}

export default function RankingPage() {
  const { profile } = useAuth();
  const [period, setPeriod] = useState<'diario' | 'semanal' | 'mensal'>('diario');

  // Dados de ranking simulados dinâmicos respeitando LGPD (apenas nickname + avatar + pontos)
  const leaderboardData: Record<'diario' | 'semanal' | 'mensal', RankUser[]> = {
    diario: [
      { rank: 1, nickname: 'EstrelaGamer', avatarPreset: 'astro_kid', points: 420, grade: 3, streak: 8 },
      { rank: 2, nickname: 'PixelMestre', avatarPreset: 'ninja_pixel', points: 380, grade: 4, streak: 5 },
      { rank: 3, nickname: 'DinoRexBR', avatarPreset: 'dino_explorer', points: 310, grade: 3, streak: 12 },
      { rank: 4, nickname: 'MagaLua', avatarPreset: 'mago_estrelar', points: 260, grade: 4, streak: 4 },
      { rank: 5, nickname: 'RoboTurbo', avatarPreset: 'robo_campeao', points: 230, grade: 3, streak: 3 },
      { rank: 6, nickname: 'SuperLina', avatarPreset: 'guardia_gamer', points: 195, grade: 4, streak: 6 },
    ],
    semanal: [
      { rank: 1, nickname: 'PixelMestre', avatarPreset: 'ninja_pixel', points: 2150, grade: 4, streak: 5 },
      { rank: 2, nickname: 'EstrelaGamer', avatarPreset: 'astro_kid', points: 1980, grade: 3, streak: 8 },
      { rank: 3, nickname: 'MagaLua', avatarPreset: 'mago_estrelar', points: 1640, grade: 4, streak: 4 },
      { rank: 4, nickname: 'DinoRexBR', avatarPreset: 'dino_explorer', points: 1450, grade: 3, streak: 12 },
      { rank: 5, nickname: 'PandaFofo', avatarPreset: 'panda_mestre', points: 1220, grade: 3, streak: 7 },
    ],
    mensal: [
      { rank: 1, nickname: 'DinoRexBR', avatarPreset: 'dino_explorer', points: 8400, grade: 3, streak: 12 },
      { rank: 2, nickname: 'PixelMestre', avatarPreset: 'ninja_pixel', points: 7900, grade: 4, streak: 5 },
      { rank: 3, nickname: 'EstrelaGamer', avatarPreset: 'astro_kid', points: 7200, grade: 3, streak: 8 },
      { rank: 4, nickname: 'MagaLua', avatarPreset: 'mago_estrelar', points: 6100, grade: 4, streak: 4 },
      { rank: 5, nickname: 'RoboTurbo', avatarPreset: 'robo_campeao', points: 5800, grade: 3, streak: 3 },
    ],
  };

  const list = leaderboardData[period];
  const top1 = list[0];
  const top2 = list[1];
  const top3 = list[2];
  const rest = list.slice(3);

  const getAvatarIcon = (presetId: string) => {
    return AVATAR_PRESETS.find(a => a.id === presetId)?.icon_name || '🚀';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      {/* Título com Trono e Coroa */}
      <div className="text-center mb-8">
        
        {/* Coroa Pixel Art Gigante no Topo */}
        <div className="inline-block relative mb-2 animate-bounce-subtle">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-t from-amber-600 to-yellow-400 rounded-2xl mx-auto flex items-center justify-center border-4 border-amber-300 shadow-[0_0_25px_rgba(255,215,0,0.6)]">
            <Crown size={38} className="text-slate-950 fill-amber-200" />
          </div>
          <Sparkles className="absolute -top-2 -right-2 text-yellow-300 w-6 h-6 animate-pulse" />
        </div>

        <h1 className="font-pixel text-xl sm:text-3xl text-amber-300 mb-2 drop-shadow-[0_2px_0_#451a03]">
          TRONO DOS CAMPEÕES
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
          Os heróis que mais aprenderam e conquistaram pontos nesta temporada!
        </p>

        {/* Abas: Diário, Semanal, Mensal */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setPeriod('diario');
            }}
            className={`font-pixel text-xs px-4 py-2.5 rounded-xl border-3 transition-all ${
              period === 'diario'
                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-[0_4px_0_#92400e]'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
            }`}
          >
            TOP DIÁRIO
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setPeriod('semanal');
            }}
            className={`font-pixel text-xs px-4 py-2.5 rounded-xl border-3 transition-all ${
              period === 'semanal'
                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-[0_4px_0_#92400e]'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
            }`}
          >
            TOP SEMANAL
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setPeriod('mensal');
            }}
            className={`font-pixel text-xs px-4 py-2.5 rounded-xl border-3 transition-all ${
              period === 'mensal'
                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-[0_4px_0_#92400e]'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
            }`}
          >
            TOP MENSAL
          </button>
        </div>
      </div>

      {/* PÓDIO DOS 3 PRIMEIROS (Tema Visual Pixel Art) */}
      <div className="pixel-box bg-slate-900/95 p-6 mb-8 border-amber-500/80">
        <div className="flex items-end justify-center gap-2 sm:gap-6 pt-6 pb-2">
          
          {/* 2º LUGAR (Prata) */}
          {top2 && (
            <div className="flex flex-col items-center flex-1 max-w-[130px] sm:max-w-[160px]">
              <div className="relative mb-2">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-700 border-4 border-slate-300 flex items-center justify-center text-2xl sm:text-3xl shadow-lg">
                  {getAvatarIcon(top2.avatarPreset)}
                </div>
                <div className="absolute -top-3 -right-2 bg-slate-300 text-slate-950 font-pixel text-[10px] px-1.5 py-0.5 rounded-full border border-slate-400 font-bold">
                  2º
                </div>
              </div>
              <span className="font-pixel text-xs text-white truncate max-w-full text-center">
                {top2.nickname}
              </span>
              <span className="font-pixel text-[11px] text-amber-300 mb-2">
                {top2.points} pts
              </span>
              <div className="w-full h-24 sm:h-32 bg-gradient-to-t from-slate-700 to-slate-500 rounded-t-xl border-t-4 border-x-4 border-slate-400 flex items-center justify-center shadow-md">
                <span className="font-pixel text-2xl text-slate-300 font-bold">2</span>
              </div>
            </div>
          )}

          {/* 1º LUGAR (Ouro com Coroa & Pódio Maior) */}
          {top1 && (
            <div className="flex flex-col items-center flex-1 max-w-[150px] sm:max-w-[180px] -mt-6">
              <div className="relative mb-2">
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-amber-500 border-4 border-yellow-200 flex items-center justify-center text-3xl sm:text-4xl shadow-2xl animate-pulse-gold">
                  {getAvatarIcon(top1.avatarPreset)}
                </div>
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-yellow-300 animate-bounce-subtle">
                  <Crown size={28} className="fill-yellow-400" />
                </div>
                <div className="absolute -bottom-2 bg-yellow-400 text-slate-950 font-pixel text-[10px] px-2 py-0.5 rounded-full border-2 border-yellow-200 font-bold shadow">
                  1º REI
                </div>
              </div>
              <span className="font-pixel text-xs sm:text-sm text-yellow-300 truncate max-w-full text-center mt-2">
                {top1.nickname}
              </span>
              <span className="font-pixel text-xs text-amber-300 mb-2">
                {top1.points} pts
              </span>
              <div className="w-full h-32 sm:h-44 bg-gradient-to-t from-amber-600 via-amber-500 to-yellow-400 rounded-t-xl border-t-4 border-x-4 border-yellow-200 flex flex-col items-center justify-center shadow-xl">
                <Trophy className="text-amber-950 w-7 h-7 mb-1" />
                <span className="font-pixel text-3xl text-amber-950 font-bold">1</span>
              </div>
            </div>
          )}

          {/* 3º LUGAR (Bronze) */}
          {top3 && (
            <div className="flex flex-col items-center flex-1 max-w-[130px] sm:max-w-[160px]">
              <div className="relative mb-2">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-900 border-4 border-amber-600 flex items-center justify-center text-2xl sm:text-3xl shadow-lg">
                  {getAvatarIcon(top3.avatarPreset)}
                </div>
                <div className="absolute -top-3 -right-2 bg-amber-600 text-white font-pixel text-[10px] px-1.5 py-0.5 rounded-full border border-amber-400 font-bold">
                  3º
                </div>
              </div>
              <span className="font-pixel text-xs text-white truncate max-w-full text-center">
                {top3.nickname}
              </span>
              <span className="font-pixel text-[11px] text-amber-300 mb-2">
                {top3.points} pts
              </span>
              <div className="w-full h-18 sm:h-24 bg-gradient-to-t from-amber-950 to-amber-800 rounded-t-xl border-t-4 border-x-4 border-amber-700 flex items-center justify-center shadow-md">
                <span className="font-pixel text-2xl text-amber-500 font-bold">3</span>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* POSIÇÃO FIXA DO ALUNO ATUAL (Sempre visível mesmo fora do top) */}
      <div className="pixel-box bg-gradient-to-r from-indigo-950 via-purple-950 to-indigo-950 p-4 mb-6 border-indigo-400 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 border-2 border-indigo-300 flex items-center justify-center font-pixel text-xs text-white">
            #7
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-pixel text-xs text-white">{profile?.nickname || 'Você'}</span>
              <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-1.5 py-0.2 rounded">
                SUA POSIÇÃO
              </span>
            </div>
            <p className="text-[11px] text-indigo-200">
              Faltam apenas 35 pontos para você entrar no Top 5! Treine mais uma rodada!
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="font-pixel text-sm text-yellow-300 block">
            {profile?.points || 0} pts
          </span>
          <span className="text-[10px] text-slate-300">
            Nível {profile?.level || 1}
          </span>
        </div>
      </div>

      {/* LISTA DAS POSIÇÕES SEGUINTES */}
      <div className="pixel-box bg-slate-900/90 p-4 divide-y divide-slate-800">
        <div className="px-3 py-2 text-xs font-pixel text-slate-400 flex items-center justify-between">
          <span>CLASSIFICAÇÃO</span>
          <span>PONTUAÇÃO</span>
        </div>

        {rest.map(user => (
          <div
            key={user.rank}
            className="px-3 py-3 flex items-center justify-between hover:bg-slate-800/60 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="font-pixel text-xs text-slate-400 w-6">
                #{user.rank}
              </span>
              <span className="text-xl">
                {getAvatarIcon(user.avatarPreset)}
              </span>
              <div>
                <span className="font-bold text-sm text-white block">
                  {user.nickname}
                </span>
                <span className="text-[10px] text-slate-400">
                  {user.grade}º Ano • Streak {user.streak} dias 🔥
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="font-pixel text-xs text-amber-300">
                {user.points} pts
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
