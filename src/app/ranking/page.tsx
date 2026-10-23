'use client';

import React, { useState, useMemo } from 'react';
import { useAuth } from '../../lib/auth-context';
import {
  Crown, Sparkles, Trophy, Medal, Flame, Star,
  Shield, Heart, Award, CheckCircle, Camera,
  Smile, BarChart3, TrendingUp, Zap
} from 'lucide-react';
import { sounds } from '../../lib/sound-effects';
import { AVATAR_PRESETS, PET_CATALOG } from '../../lib/content-data';
import { PetIcon } from '../../components/PetIcon';
import { PixelButton } from '../../components/PixelButton';
import confetti from 'canvas-confetti';

interface RankKid {
  id: string;
  nickname: string;
  avatarPreset: string;
  avatarUrl?: string;
  petId: string;
  basePointsDaily: number;
  grade: 3 | 4 | 5;
  streak: number;
  favoriteSubject: string;
}

// Base mock de crianças com nicknames seguros (moderados) e avatares
const SIMULATED_PLAYERS: RankKid[] = [
  { id: 'sim-1', nickname: 'EstrelaGamer', avatarPreset: 'astro_kid', petId: 'astro_gatinho', basePointsDaily: 420, grade: 3, streak: 8, favoriteSubject: 'Matemática' },
  { id: 'sim-2', nickname: 'PixelMestre', avatarPreset: 'ninja_pixel', petId: 'raio_dragao', basePointsDaily: 385, grade: 4, streak: 5, favoriteSubject: 'Português' },
  { id: 'sim-3', nickname: 'DinoRexBR', avatarPreset: 'dino_explorer', petId: 'pipoca_raposa', basePointsDaily: 340, grade: 3, streak: 12, favoriteSubject: 'Matemática' },
  { id: 'sim-4', nickname: 'MagaLua', avatarPreset: 'mago_estrelar', petId: 'corujinha_pixel', basePointsDaily: 295, grade: 4, streak: 4, favoriteSubject: 'Português' },
  { id: 'sim-5', nickname: 'RoboTurbo', avatarPreset: 'robo_campeao', petId: 'bolha_slime', basePointsDaily: 250, grade: 3, streak: 6, favoriteSubject: 'Matemática' },
  { id: 'sim-6', nickname: 'SuperLina', avatarPreset: 'guardia_gamer', petId: 'fenix_dourada', basePointsDaily: 220, grade: 4, streak: 9, favoriteSubject: 'Ciências' },
  { id: 'sim-7', nickname: 'UrsoGamer', avatarPreset: 'urso_sabio', petId: 'pipoca_raposa', basePointsDaily: 190, grade: 3, streak: 3, favoriteSubject: 'História' },
  { id: 'sim-8', nickname: 'PandaNinja', avatarPreset: 'panda_mestre', petId: 'bolha_slime', basePointsDaily: 160, grade: 4, streak: 7, favoriteSubject: 'Português' },
];

export default function RankingPage() {
  const { profile, activePet, updateProfile } = useAuth();

  // Abas principais: 'ranking' (Pódio coletivo), 'pessoal' (Progresso próprio/Modo Foco), 'privacidade' (Foto & ECA Digital)
  const [mainTab, setMainTab] = useState<'ranking' | 'pessoal' | 'privacidade'>('ranking');
  
  // Filtros de leaderboard
  const [period, setPeriod] = useState<'diario' | 'semanal' | 'mensal'>('diario');
  const [gradeFilter, setGradeFilter] = useState<'todos' | 3 | 4 | 5>('todos');

  // Estado para consentimento de foto do responsável (ECA Digital)
  const [guardianPhotoConsent, setGuardianPhotoConsent] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [photoSuccess, setPhotoSuccess] = useState('');

  // Disparo comemorativo de pódio
  const triggerCelebration = (kidName: string, rankPosition: number) => {
    sounds.playFanfare();
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: rankPosition === 1 ? ['#f59e0b', '#fbbf24', '#fef08a'] : ['#38bdf8', '#818cf8', '#c084fc']
    });
  };

  // Helper para buscar ícone do avatar preset
  const getAvatarIcon = (presetId: string) => {
    return AVATAR_PRESETS.find(a => a.id === presetId)?.icon_name || '🚀';
  };

  // Helper para buscar pet
  const getPetInfo = (petId: string) => {
    return PET_CATALOG.find(p => p.id === petId) || PET_CATALOG[0];
  };

  // Construção dinâmica da lista incluindo o próprio aluno ativo
  const leaderboardList = useMemo(() => {
    const multiplier = period === 'diario' ? 1 : period === 'semanal' ? 5 : 18;
    
    // Lista combinada com jogadores simulados
    const combined: Array<{
      id: string;
      nickname: string;
      avatarPreset: string;
      avatarUrl?: string;
      petId: string;
      points: number;
      grade: 3 | 4 | 5;
      streak: number;
      favoriteSubject: string;
      isCurrentUser?: boolean;
    }> = SIMULATED_PLAYERS.map(p => ({
      ...p,
      points: Math.round(p.basePointsDaily * multiplier),
      isCurrentUser: false,
    }));

    // Insere o aluno logado se existir
    if (profile) {
      // Ajuste de pontuação do usuário para o período
      const userPeriodPoints = period === 'diario' 
        ? profile.points 
        : period === 'semanal' 
          ? profile.points * 3 + 120 
          : profile.points * 10 + 450;

      combined.push({
        id: profile.id,
        nickname: profile.nickname,
        avatarPreset: profile.avatar_preset,
        avatarUrl: profile.avatar_url,
        petId: activePet?.id || 'pipoca_raposa',
        points: userPeriodPoints,
        grade: profile.school_grade,
        streak: profile.streak_days,
        favoriteSubject: 'Geral',
        isCurrentUser: true,
      });
    }

    // Filtrar por Série
    const filtered = combined.filter(p => {
      if (gradeFilter === 'todos') return true;
      return p.grade === gradeFilter;
    });

    // Ordenar por pontos descendente
    filtered.sort((a, b) => b.points - a.points);

    // Mapear posição de ranking
    return filtered.map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));
  }, [period, gradeFilter, profile, activePet]);

  const top1 = leaderboardList[0];
  const top2 = leaderboardList[1];
  const top3 = leaderboardList[2];
  const restList = leaderboardList.slice(3);

  // Posição atual do aluno
  const userRankEntry = leaderboardList.find(p => p.isCurrentUser);

  // Lógica de upload de foto segura para perfil com consentimento
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError('');
    setPhotoSuccess('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (!guardianPhotoConsent) {
      setPhotoError('É obrigatório que o responsável legal marque a autorização antes de carregar uma foto.');
      sounds.playGentleBoop();
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setPhotoError('A imagem deve ter no máximo 2MB.');
      sounds.playGentleBoop();
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      updateProfile({ avatar_url: dataUrl });
      setPhotoSuccess('Foto de perfil atualizada com sucesso! Seus pais têm controle total.');
      sounds.playSuccess();
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    updateProfile({ avatar_url: undefined });
    setPhotoSuccess('Foto removida. Agora seu avatar seguro em pixel art está ativo!');
    sounds.playClick();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      {/* CABEÇALHO DO TÍTULO */}
      <div className="text-center mb-8">
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
          Celebre cada conquista, desafie seus limites e vença a si mesmo a cada dia!
        </p>

        {/* NAVEGAÇÃO ENTRE ABAS PRINCIPAIS */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setMainTab('ranking');
            }}
            className={`font-pixel text-xs px-4 py-2.5 rounded-xl border-3 transition-all flex items-center gap-2 ${
              mainTab === 'ranking'
                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-[0_4px_0_#92400e]'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
            }`}
          >
            <Trophy size={16} />
            RANKING DA GALERA
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setMainTab('pessoal');
            }}
            className={`font-pixel text-xs px-4 py-2.5 rounded-xl border-3 transition-all flex items-center gap-2 ${
              mainTab === 'pessoal'
                ? 'bg-emerald-400 text-slate-950 border-emerald-300 shadow-[0_4px_0_#065f46]'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
            }`}
          >
            <Star size={16} />
            MEU PROGRESSO PESSOAL
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setMainTab('privacidade');
            }}
            className={`font-pixel text-xs px-4 py-2.5 rounded-xl border-3 transition-all flex items-center gap-2 ${
              mainTab === 'privacidade'
                ? 'bg-cyan-400 text-slate-950 border-cyan-300 shadow-[0_4px_0_#0e7490]'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
            }`}
          >
            <Shield size={16} />
            FOTO & PRIVACIDADE
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* ABA 1: RANKING COLETIVO DA GALERA */}
      {/* ============================================================== */}
      {mainTab === 'ranking' && (
        <>
          {/* BANNER DE PROTEÇÃO LGPD & ECA DIGITAL */}
          <div className="bg-slate-900/90 border-2 border-slate-800 rounded-xl p-3 mb-6 flex items-center gap-3 text-slate-300 text-xs">
            <Shield size={20} className="text-emerald-400 shrink-0" />
            <p>
              <strong className="text-white">Ambiente Seguro para Crianças:</strong> Apenas apelidos aprovados e avatares são exibidos publicamente. Nenhuma informação pessoal ou contato é divulgado.
            </p>
          </div>

          {/* FILTROS DUPLOS: PERÍODO + ANO ESCOLAR */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 bg-slate-900/80 p-3 rounded-2xl border-2 border-slate-800">
            {/* Período */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto justify-center">
              <span className="text-[10px] font-pixel text-slate-400 mr-1">TEMPO:</span>
              {(['diario', 'semanal', 'mensal'] as const).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setPeriod(p);
                  }}
                  className={`text-[11px] font-pixel px-3 py-1.5 rounded-lg border-2 transition-all ${
                    period === p
                      ? 'bg-amber-400 text-slate-950 border-amber-300'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  {p === 'diario' ? 'HOJE' : p === 'semanal' ? 'SEMANA' : 'MÊS'}
                </button>
              ))}
            </div>

            {/* Ano Escolar */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto justify-center">
              <span className="text-[10px] font-pixel text-slate-400 mr-1">TURMA:</span>
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setGradeFilter('todos');
                }}
                className={`text-[11px] font-pixel px-2.5 py-1.5 rounded-lg border-2 transition-all ${
                  gradeFilter === 'todos'
                    ? 'bg-indigo-500 text-white border-indigo-400'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                TODAS
              </button>
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setGradeFilter(3);
                }}
                className={`text-[11px] font-pixel px-2.5 py-1.5 rounded-lg border-2 transition-all ${
                  gradeFilter === 3
                    ? 'bg-indigo-500 text-white border-indigo-400'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                3º ANO
              </button>
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setGradeFilter(4);
                }}
                className={`text-[11px] font-pixel px-2.5 py-1.5 rounded-lg border-2 transition-all ${
                  gradeFilter === 4
                    ? 'bg-indigo-500 text-white border-indigo-400'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                4º ANO
              </button>
            </div>
          </div>

          {/* PÓDIO RETRÔ DOS 3 PRIMEIROS */}
          <div className="pixel-box bg-slate-900/95 p-6 mb-8 border-amber-500/80">
            <div className="flex items-end justify-center gap-2 sm:gap-6 pt-6 pb-2">
              
              {/* 2º LUGAR (Prata) */}
              {top2 && (
                <div 
                  onClick={() => triggerCelebration(top2.nickname, 2)}
                  className="flex flex-col items-center flex-1 max-w-[130px] sm:max-w-[160px] cursor-pointer hover:scale-105 transition-transform"
                  title="Clique para parabenizar!"
                >
                  <div className="relative mb-2">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-700 border-4 border-slate-300 flex items-center justify-center text-2xl sm:text-3xl shadow-lg overflow-hidden">
                      {top2.avatarUrl ? (
                        <img src={top2.avatarUrl} alt={top2.nickname} className="w-full h-full object-cover" />
                      ) : (
                        getAvatarIcon(top2.avatarPreset)
                      )}
                    </div>
                    {/* Badge do Pet */}
                    <div className="absolute -bottom-2 -left-2 bg-slate-900 border-2 border-slate-400 rounded-lg p-0.5 shadow">
                      <PetIcon petId={top2.petId} size={22} mood="happy" />
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
                  <div className="w-full h-24 sm:h-32 bg-gradient-to-t from-slate-700 to-slate-500 rounded-t-xl border-t-4 border-x-4 border-slate-400 flex flex-col items-center justify-center shadow-md">
                    <Medal className="text-slate-300 w-5 h-5 mb-1 opacity-70" />
                    <span className="font-pixel text-2xl text-slate-200 font-bold">2</span>
                  </div>
                </div>
              )}

              {/* 1º LUGAR (Ouro com Coroa & Pódio Maior) */}
              {top1 && (
                <div 
                  onClick={() => triggerCelebration(top1.nickname, 1)}
                  className="flex flex-col items-center flex-1 max-w-[150px] sm:max-w-[180px] -mt-6 cursor-pointer hover:scale-105 transition-transform"
                  title="Clique para parabenizar o Rei/Rainha!"
                >
                  <div className="relative mb-2">
                    <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-amber-500 border-4 border-yellow-200 flex items-center justify-center text-3xl sm:text-4xl shadow-2xl animate-pulse-gold overflow-hidden">
                      {top1.avatarUrl ? (
                        <img src={top1.avatarUrl} alt={top1.nickname} className="w-full h-full object-cover" />
                      ) : (
                        getAvatarIcon(top1.avatarPreset)
                      )}
                    </div>
                    {/* Pet Campeão */}
                    <div className="absolute -bottom-2 -left-2 bg-slate-950 border-2 border-yellow-300 rounded-lg p-0.5 shadow-lg">
                      <PetIcon petId={top1.petId} size={26} mood="happy" />
                    </div>
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-yellow-300 animate-bounce-subtle">
                      <Crown size={28} className="fill-yellow-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
                    </div>
                    <div className="absolute -bottom-2 -right-1 bg-yellow-400 text-slate-950 font-pixel text-[10px] px-2 py-0.5 rounded-full border-2 border-yellow-200 font-bold shadow">
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
                    <Trophy className="text-amber-950 w-8 h-8 mb-1" />
                    <span className="font-pixel text-3xl text-amber-950 font-bold">1</span>
                  </div>
                </div>
              )}

              {/* 3º LUGAR (Bronze) */}
              {top3 && (
                <div 
                  onClick={() => triggerCelebration(top3.nickname, 3)}
                  className="flex flex-col items-center flex-1 max-w-[130px] sm:max-w-[160px] cursor-pointer hover:scale-105 transition-transform"
                  title="Clique para parabenizar!"
                >
                  <div className="relative mb-2">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-900 border-4 border-amber-600 flex items-center justify-center text-2xl sm:text-3xl shadow-lg overflow-hidden">
                      {top3.avatarUrl ? (
                        <img src={top3.avatarUrl} alt={top3.nickname} className="w-full h-full object-cover" />
                      ) : (
                        getAvatarIcon(top3.avatarPreset)
                      )}
                    </div>
                    <div className="absolute -bottom-2 -left-2 bg-slate-900 border-2 border-amber-600 rounded-lg p-0.5 shadow">
                      <PetIcon petId={top3.petId} size={22} mood="happy" />
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
                  <div className="w-full h-18 sm:h-24 bg-gradient-to-t from-amber-950 to-amber-800 rounded-t-xl border-t-4 border-x-4 border-amber-700 flex flex-col items-center justify-center shadow-md">
                    <Medal className="text-amber-500 w-5 h-5 mb-1 opacity-70" />
                    <span className="font-pixel text-2xl text-amber-500 font-bold">3</span>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* POSIÇÃO DINÂMICA DO ALUNO ATUAL */}
          {userRankEntry && (
            <div className="pixel-box bg-gradient-to-r from-indigo-950 via-purple-950 to-indigo-950 p-4 mb-6 border-indigo-400 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-600 border-2 border-indigo-300 flex items-center justify-center font-pixel text-sm text-white shadow">
                  #{userRankEntry.rank}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-pixel text-sm text-white">{userRankEntry.nickname}</span>
                    <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded">
                      SUA POSIÇÃO
                    </span>
                    <span className="text-[10px] bg-indigo-800 text-indigo-200 px-1.5 py-0.5 rounded">
                      {userRankEntry.grade}º Ano
                    </span>
                  </div>
                  <p className="text-xs text-indigo-200 mt-0.5">
                    {userRankEntry.rank === 1
                      ? '👑 Incrível! Você está na liderança máxima do trono!'
                      : `Faltam apenas ${(leaderboardList[userRankEntry.rank - 2]?.points || userRankEntry.points) - userRankEntry.points + 15} pontos para você subir no ranking!`}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="font-pixel text-base text-yellow-300 block">
                  {userRankEntry.points} pts
                </span>
                <span className="text-[10px] text-slate-300">
                  {userRankEntry.streak} dias seguidos 🔥
                </span>
              </div>
            </div>
          )}

          {/* LISTA DAS POSIÇÕES SEGUINTES (4º EM DIANTE) */}
          <div className="pixel-box bg-slate-900/90 p-4 divide-y divide-slate-800">
            <div className="px-3 py-2 text-xs font-pixel text-slate-400 flex items-center justify-between">
              <span>CLASSIFICAÇÃO DOS HERÓIS</span>
              <span>PONTUAÇÃO</span>
            </div>

            {restList.map(user => {
              const pet = getPetInfo(user.petId);
              return (
                <div
                  key={user.id}
                  className={`px-3 py-3 flex items-center justify-between rounded-xl transition-all ${
                    user.isCurrentUser 
                      ? 'bg-indigo-900/40 border-2 border-indigo-500/50' 
                      : 'hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-pixel text-xs text-slate-400 w-7 text-center">
                      #{user.rank}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-xl overflow-hidden shrink-0">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.nickname} className="w-full h-full object-cover" />
                      ) : (
                        getAvatarIcon(user.avatarPreset)
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">
                          {user.nickname}
                        </span>
                        {user.isCurrentUser && (
                          <span className="text-[9px] bg-amber-400 text-slate-950 font-bold px-1.5 py-0.2 rounded">
                            VOCÊ
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span>{user.grade}º Ano</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 text-amber-400">
                          <Flame size={12} className="text-orange-500 fill-orange-500" />
                          {user.streak}d
                        </span>
                        <span>•</span>
                        <span className="text-indigo-300">Pet: {pet.name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-pixel text-xs text-amber-300">
                      {user.points} pts
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ============================================================== */}
      {/* ABA 2: MEU PROGRESSO PESSOAL (SEM ANSIEDADE / AUTO-SUPERAÇÃO) */}
      {/* ============================================================== */}
      {mainTab === 'pessoal' && (
        <div className="space-y-6">
          
          {/* BANNER ENCORAJADOR DO PET COMPANHEIRO */}
          <div className="pixel-box bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 p-5 border-emerald-400/80 flex flex-col sm:flex-row items-center gap-4">
            <div className="shrink-0 p-2 bg-slate-900/80 rounded-2xl border-2 border-emerald-500 shadow-lg">
              {activePet && <PetIcon petId={activePet.id} size={64} mood="happy" />}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-pixel text-xs text-emerald-300">CONSELHO DO {activePet?.name.toUpperCase()}</span>
                <span className="text-[10px] bg-emerald-500 text-slate-950 font-bold px-2 py-0.5 rounded">
                  MODO AUTO-SUPERAÇÃO
                </span>
              </div>
              <p className="text-sm text-slate-200">
                &ldquo;Você não precisa ser melhor que os outros, basta aprender um pouquinho mais do que sabia ontem! Cada bloco quebrado e cada salto mágico constrói sua inteligência!&rdquo;
              </p>
            </div>
          </div>

          {/* 4 CARDS DE MARCOS PESSOAIS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Meta Semanal */}
            <div className="pixel-box bg-slate-900/90 p-4 border-amber-500/50">
              <div className="flex items-center justify-between text-amber-400 mb-2">
                <span className="font-pixel text-[10px]">META SEMANAL</span>
                <Trophy size={16} />
              </div>
              <div className="font-pixel text-xl text-yellow-300 mb-1">
                {profile?.points || 0} / 500
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
                <div 
                  className="bg-amber-400 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, ((profile?.points || 0) / 500) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-2 block">
                {Math.min(100, Math.round(((profile?.points || 0) / 500) * 100))}% da meta atingida!
              </span>
            </div>

            {/* Sequência de Dedicação */}
            <div className="pixel-box bg-slate-900/90 p-4 border-orange-500/50">
              <div className="flex items-center justify-between text-orange-400 mb-2">
                <span className="font-pixel text-[10px]">CHAMA DE ESTUDOS</span>
                <Flame size={16} className="fill-orange-500" />
              </div>
              <div className="font-pixel text-xl text-orange-400 mb-1">
                {profile?.streak_days || 1} Dias
              </div>
              <p className="text-[10px] text-slate-300">
                Bônus ativo de XP garantido a cada lição jogada!
              </p>
            </div>

            {/* Nível do Herói */}
            <div className="pixel-box bg-slate-900/90 p-4 border-indigo-500/50">
              <div className="flex items-center justify-between text-indigo-400 mb-2">
                <span className="font-pixel text-[10px]">NÍVEL ATUAL</span>
                <Zap size={16} />
              </div>
              <div className="font-pixel text-xl text-indigo-300 mb-1">
                Nível {profile?.level || 1}
              </div>
              <p className="text-[10px] text-slate-300">
                XP Total: {profile?.xp || 0} pontos acumulados
              </p>
            </div>

            {/* Pet Evolução */}
            <div className="pixel-box bg-slate-900/90 p-4 border-purple-500/50">
              <div className="flex items-center justify-between text-purple-400 mb-2">
                <span className="font-pixel text-[10px]">PET PARCEIRO</span>
                <Heart size={16} className="fill-rose-500 text-rose-500" />
              </div>
              <div className="font-pixel text-base text-purple-300 mb-1 truncate">
                {activePet?.name}
              </div>
              <p className="text-[10px] text-slate-300">
                Raridade {activePet?.rarity.toUpperCase()}
              </p>
            </div>

          </div>

          {/* GRÁFICO RETRÔ DE ESFORÇO DOS ÚLTIMOS 7 DIAS */}
          <div className="pixel-box bg-slate-900/90 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="text-emerald-400" size={18} />
                <h3 className="font-pixel text-xs text-white">MINHA DEDICAÇÃO NOS ÚLTIMOS 7 DIAS</h3>
              </div>
              <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                <TrendingUp size={14} /> Constância constante!
              </span>
            </div>

            {/* Barras Pixel Art */}
            <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-40 pt-4 pb-2 border-b-2 border-slate-800">
              {[
                { day: 'Seg', pts: 45, max: 80 },
                { day: 'Ter', pts: 60, max: 80 },
                { day: 'Qua', pts: 30, max: 80 },
                { day: 'Qui', pts: 75, max: 80 },
                { day: 'Sex', pts: 50, max: 80 },
                { day: 'Sáb', pts: 80, max: 80, isPeak: true },
                { day: 'Hoje', pts: profile?.points ? Math.min(80, profile.points) : 40, max: 80, isToday: true },
              ].map((item, idx) => {
                const heightPercent = Math.max(15, Math.round((item.pts / item.max) * 100));
                return (
                  <div key={idx} className="flex flex-col items-center h-full justify-end group">
                    <span className="text-[9px] font-pixel text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                      {item.pts} pts
                    </span>
                    <div 
                      className={`w-full rounded-t-lg transition-all border-t-2 border-x-2 ${
                        item.isToday 
                          ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 border-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.5)]' 
                          : item.isPeak 
                            ? 'bg-gradient-to-t from-amber-600 to-yellow-400 border-yellow-200' 
                            : 'bg-gradient-to-t from-indigo-700 to-indigo-500 border-indigo-400'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className={`text-[10px] font-pixel mt-2 ${item.isToday ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="text-[11px] text-slate-400 text-center mt-3">
              💡 Dica pedagógica: Estudar 10 minutos todos os dias fixa muito mais a matéria do que estudar horas de uma vez só!
            </p>
          </div>

          {/* MURAL DE CONQUISTAS E MEDALHAS DESBLOQUEADAS */}
          <div className="pixel-box bg-slate-900/90 p-5">
            <h3 className="font-pixel text-xs text-amber-300 mb-4 flex items-center gap-2">
              <Award size={16} />
              MURAL DE CONQUISTAS DE AUTO-SUPERAÇÃO
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { title: 'Primeiros Passos', desc: 'Criou sua conta e escolheu seu pet inicial', icon: '🌱', unlocked: true },
                { title: 'Mundo dos Blocos', desc: 'Concluiu sua primeira rodada de Matemática', icon: '🧱', unlocked: true },
                { title: 'Saltos Mágicos', desc: 'Acertou os desafios de Língua Portuguesa', icon: '✨', unlocked: true },
                { title: 'Chama Acesa', desc: 'Manteve uma sequência de 3+ dias seguidos', icon: '🔥', unlocked: (profile?.streak_days || 0) >= 3 },
                { title: 'Colecionador de Pets', desc: 'Abriu baús na Loja Mágica de Pets', icon: '🐾', unlocked: true },
                { title: 'Foco Absoluto', desc: 'Estudou com calma usando o Modo Foco', icon: '🧘', unlocked: true },
              ].map((badge, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    sounds.playClick();
                    if (badge.unlocked) sounds.playSuccess();
                  }}
                  className={`p-3 rounded-xl border-2 flex items-center gap-3 transition-all cursor-pointer ${
                    badge.unlocked
                      ? 'bg-slate-800/90 border-amber-400/80 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 opacity-60'
                  }`}
                >
                  <span className="text-3xl shrink-0">{badge.icon}</span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-pixel text-[11px] text-white">{badge.title}</h4>
                      {badge.unlocked && <CheckCircle size={12} className="text-emerald-400 shrink-0" />}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* BOTÃO DE CELEBRAÇÃO PESSOAL */}
            <div className="text-center mt-6">
              <PixelButton
                variant="success"
                size="md"
                onClick={() => {
                  sounds.playFanfare();
                  confetti({
                    particleCount: 80,
                    spread: 70,
                    origin: { y: 0.6 }
                  });
                }}
              >
                🎉 COMEMORAR MINHA EVOLUÇÃO PESSOAL!
              </PixelButton>
            </div>
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* ABA 3: FOTO & PRIVACIDADE (ECA DIGITAL & LGPD) */}
      {/* ============================================================== */}
      {mainTab === 'privacidade' && (
        <div className="space-y-6">
          
          {/* AVISO LEGAL E PEDAGÓGICO DE PROTEÇÃO INFANTIL */}
          <div className="pixel-box bg-slate-900/95 p-6 border-cyan-400">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-cyan-950 rounded-2xl border-2 border-cyan-500 shrink-0">
                <Shield size={32} className="text-cyan-400" />
              </div>
              <div>
                <h3 className="font-pixel text-sm text-cyan-300 mb-1">
                  SEGURANÇA E PRIVACIDADE (ECA DIGITAL & LGPD)
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Para proteger o bem-estar e a intimidade das crianças, o <strong>Kids-Player</strong> segue rigorosamente o 
                  Estatuto da Criança e do Adolescente (ECA Digital) e a Lei Geral de Proteção de Dados (LGPD).
                </p>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
                  <div className="flex items-center gap-1.5 bg-slate-950/70 p-2 rounded-lg border border-slate-800">
                    <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                    <span>Nenhum chat aberto entre estranhos</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-950/70 p-2 rounded-lg border border-slate-800">
                    <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                    <span>Apelidos filtrados contra nomes reais</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-950/70 p-2 rounded-lg border border-slate-800">
                    <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                    <span>Zero anúncios e zero dinheiro real</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-950/70 p-2 rounded-lg border border-slate-800">
                    <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                    <span>Avatares pixel art seguros por padrão</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AVATAR ATUAL & ESCOLHA */}
          <div className="pixel-box bg-slate-900/90 p-5">
            <h3 className="font-pixel text-xs text-amber-300 mb-4 flex items-center gap-2">
              <Smile size={16} />
              MEU AVATAR ATUAL
            </h3>

            <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
              <div className="w-20 h-20 rounded-2xl bg-slate-800 border-4 border-amber-400 flex items-center justify-center text-4xl shadow-xl overflow-hidden shrink-0">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Foto do perfil" className="w-full h-full object-cover" />
                ) : (
                  getAvatarIcon(profile?.avatar_preset || 'astro_kid')
                )}
              </div>

              <div className="flex-1 text-center sm:text-left">
                <h4 className="font-pixel text-sm text-white mb-1">
                  {profile?.avatar_url ? 'Foto Pessoal Autorizada' : 'Avatar Retrô Pixel Art'}
                </h4>
                <p className="text-xs text-slate-300">
                  {profile?.avatar_url 
                    ? 'Você está usando uma foto pessoal autorizada pelo responsável.'
                    : 'Você está usando um avatar ilustrado seguro que protege sua identidade.'}
                </p>

                {profile?.avatar_url && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="mt-3 text-xs bg-rose-950 border border-rose-500 text-rose-300 px-3 py-1.5 rounded-lg hover:bg-rose-900 transition-colors"
                  >
                    Remover foto e voltar ao avatar seguro
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* UPLOAD DE FOTO COM CONSENTIMENTO DO RESPONSÁVEL */}
          <div className="pixel-box bg-slate-900/90 p-5">
            <h3 className="font-pixel text-xs text-cyan-300 mb-3 flex items-center gap-2">
              <Camera size={16} />
              ENVIAR FOTO PESSOAL (OPCIONAL)
            </h3>

            {photoError && (
              <div className="mb-4 p-3 bg-rose-950/80 border-2 border-rose-500 rounded-xl text-rose-300 text-xs">
                ⚠️ {photoError}
              </div>
            )}

            {photoSuccess && (
              <div className="mb-4 p-3 bg-emerald-950/80 border-2 border-emerald-500 rounded-xl text-emerald-300 text-xs">
                ✅ {photoSuccess}
              </div>
            )}

            <div className="bg-slate-950/90 border-2 border-slate-800 p-4 rounded-xl mb-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={guardianPhotoConsent}
                  onChange={e => setGuardianPhotoConsent(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 bg-slate-800 border-slate-700"
                />
                <span className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-cyan-300">Autorização do Pai, Mãe ou Responsável Legal:</strong> Declaro ser o responsável legal pela criança e autorizo expressamente o carregamento desta foto para exibição no perfil e pódio, ciente de que posso removê-la a qualquer momento.
                </span>
              </label>
            </div>

            <div className="flex items-center gap-3">
              <label className={`font-pixel text-xs px-4 py-2.5 rounded-xl border-3 transition-all cursor-pointer inline-flex items-center gap-2 ${
                guardianPhotoConsent
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 hover:bg-cyan-400 shadow-[0_4px_0_#0e7490]'
                  : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed opacity-60'
              }`}>
                <Camera size={16} />
                ESCOLHER FOTO DO DISPOSITIVO
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  disabled={!guardianPhotoConsent}
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>

              <span className="text-[11px] text-slate-400">
                Formatos: JPG ou PNG (máx. 2MB)
              </span>
            </div>
          </div>

          {/* ESCOLHA ALTERNATIVA DE PRESETS SEGUROS */}
          <div className="pixel-box bg-slate-900/90 p-5">
            <h3 className="font-pixel text-xs text-indigo-300 mb-3 flex items-center gap-2">
              <Sparkles size={16} />
              OU ESCOLHA UM DOS AVATARES RETRÔ OFICIAIS
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {AVATAR_PRESETS.map(av => (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    updateProfile({ avatar_preset: av.id, avatar_url: undefined });
                    setPhotoSuccess(`Avatar alterado para ${av.name}!`);
                  }}
                  className={`p-3 rounded-xl border-2 flex items-center gap-3 transition-all ${
                    profile?.avatar_preset === av.id && !profile?.avatar_url
                      ? 'bg-amber-400/20 border-amber-400 scale-102'
                      : 'bg-slate-800 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <span className="text-2xl">{av.icon_name}</span>
                  <div className="text-left">
                    <span className="font-pixel text-[11px] text-white block truncate">{av.name}</span>
                    <span className="text-[10px] text-slate-400 capitalize">{av.category}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
