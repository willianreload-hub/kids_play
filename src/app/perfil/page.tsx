'use client';

import { useState } from 'react';
import { useAuth } from '../../lib/auth-context';
import { AVATAR_PRESETS, ACHIEVEMENTS_CATALOG } from '../../lib/content-data';
import { PixelButton } from '../../components/PixelButton';
import { PetIcon } from '../../components/PetIcon';
import { sounds } from '../../lib/sound-effects';
import { validateNickname } from '../../lib/nickname-moderator';
import { useLocalStorageState } from '../../lib/client-hooks';
import {
  Shield, Flame, Heart,
  LogOut, Check, Sparkles,
  Trophy, CheckCircle2, Gift
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PerfilPage() {
  const { 
    profile, 
    guardian, 
    activePet, 
    focusMode, 
    updateProfile, 
    updateFocusSettings, 
    toggleFocusMode, 
    logout,
    addPoints 
  } = useAuth();

  const [isEditingNick, setIsEditingNick] = useState(false);
  const [newNick, setNewNick] = useState(profile?.nickname || '');
  const [nickError, setNickError] = useState('');
  const [selectedCursor, setSelectedCursor] = useLocalStorageState<string>('kids_cursor_theme', 'varinha');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Conquistas e Roleta Diária
  const [claimedAchievements, setClaimedAchievements] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kids_player_claimed_achievements');
      return saved ? JSON.parse(saved) : ['ach_first_win'];
    }
    return ['ach_first_win'];
  });

  const [isSpinning, setIsSpinning] = useState(false);
  const [spinReward, setSpinReward] = useState<number | null>(null);
  const [achFilter, setAchFilter] = useState<string>('todos');

  // Roleta diária: data do último giro persistida via hook (sem setState-in-effect)
  const [lastSpinDate, setLastSpinDate] = useLocalStorageState<string | null>(
    'kids_player_last_spin_date',
    null
  );
  const hasSpunToday = lastSpinDate === new Date().toISOString().slice(0, 10);

  const handleSpinWheel = () => {
    if (hasSpunToday || isSpinning) return;
    setIsSpinning(true);
    sounds.playClick();

    setTimeout(() => {
      const rewards = [25, 40, 50, 60, 80, 100];
      const won = rewards[Math.floor(Math.random() * rewards.length)];
      setSpinReward(won);
      setIsSpinning(false);
      addPoints(won, 'roleta_diaria_sabedoria');
      sounds.playCoin();
      sounds.playLevelUp();

      const today = new Date().toISOString().slice(0, 10);
      setLastSpinDate(today);

      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
      });
    }, 1000);
  };

  const handleClaimAchievement = (achId: string, coins: number) => {
    if (claimedAchievements.includes(achId)) return;
    sounds.playLevelUp();
    addPoints(coins, `conquista_${achId}`);
    const nextClaimed = [...claimedAchievements, achId];
    setClaimedAchievements(nextClaimed);
    if (typeof window !== 'undefined') {
      localStorage.setItem('kids_player_claimed_achievements', JSON.stringify(nextClaimed));
    }

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
    });
  };

  // Avatar selecionado
  const currentAvatar = AVATAR_PRESETS.find(a => a.id === profile?.avatar_preset) || AVATAR_PRESETS[0];

  const handleSaveNickname = () => {
    const val = validateNickname(newNick);
    if (!val.isValid) {
      setNickError(val.message || 'Apelido inválido.');
      sounds.playGentleBoop();
      return;
    }

    updateProfile({ nickname: newNick });
    setIsEditingNick(false);
    setNickError('');
    setSavedSuccess(true);
    sounds.playSuccess();
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleSelectAvatar = (presetId: string) => {
    sounds.playClick();
    updateProfile({ avatar_preset: presetId });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleSelectCursor = (themeId: string) => {
    sounds.playClick();
    setSelectedCursor(themeId);
    window.dispatchEvent(new CustomEvent('change_cursor_theme', { detail: themeId }));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const xpCurrent = profile?.xp || 0;
  const xpNextLevel = ((profile?.level || 1)) * 100;
  const xpPercent = Math.min(100, Math.floor((xpCurrent % 100) / 100 * 100));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      {/* Cabeçalho do Perfil */}
      <div className="text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 border-b-2 border-slate-800 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-indigo-700 to-purple-600 border-4 border-amber-400 flex items-center justify-center text-3xl shadow-lg">
            {currentAvatar.icon_name}
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <span className="font-pixel text-xs text-amber-400">PERFIL DO ALUNO</span>
              <span className="text-[10px] bg-indigo-950 border border-indigo-500 text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                {profile?.school_grade}º Ano Fundamental
              </span>
            </div>
            
            {/* Nickname e Botão de Editar */}
            <div className="flex items-center gap-2 mt-1">
              {isEditingNick ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newNick}
                    onChange={e => setNewNick(e.target.value)}
                    className="bg-slate-800 border-2 border-amber-400 rounded-lg px-2 py-1 text-sm text-white font-bold"
                  />
                  <button
                    type="button"
                    onClick={handleSaveNickname}
                    className="p-1 bg-emerald-600 rounded text-white"
                  >
                    <Check size={16} />
                  </button>
                </div>
              ) : (
                <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
                  {profile?.nickname || 'Super Aluno'}
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setIsEditingNick(true);
                    }}
                    className="text-xs text-amber-400 hover:underline font-normal"
                  >
                    [editar]
                  </button>
                </h1>
              )}
            </div>
            {nickError && <p className="text-[11px] text-rose-400 mt-1">{nickError}</p>}
          </div>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 border-2 border-slate-800 p-2.5 rounded-xl text-center min-w-[75px]">
            <span className="block text-[10px] text-slate-400 font-pixel">NÍVEL</span>
            <span className="font-pixel text-sm text-amber-300">{profile?.level || 1}</span>
          </div>
          <div className="bg-slate-900 border-2 border-slate-800 p-2.5 rounded-xl text-center min-w-[75px]">
            <span className="block text-[10px] text-slate-400 font-pixel">PONTOS</span>
            <span className="font-pixel text-sm text-yellow-400">{profile?.points || 0}</span>
          </div>
          <div className="bg-slate-900 border-2 border-slate-800 p-2.5 rounded-xl text-center min-w-[75px]">
            <span className="block text-[10px] text-slate-400 font-pixel">STREAK</span>
            <span className="font-pixel text-sm text-orange-400">{profile?.streak_days || 1}d</span>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="mb-6 p-3 bg-emerald-950/80 border-2 border-emerald-500 rounded-xl text-emerald-300 text-xs font-bold text-center">
          ✅ Alterações salvas com sucesso!
        </div>
      )}

      {/* Barra de Progresso de XP */}
      <div className="pixel-box bg-slate-900/90 p-4 mb-6">
        <div className="flex items-center justify-between text-xs font-bold mb-1.5">
          <span className="text-amber-300 font-pixel text-[11px]">EXPERIÊNCIA (XP)</span>
          <span className="text-slate-300">{xpCurrent} / {xpNextLevel} XP</span>
        </div>
        <div className="w-full h-4 bg-slate-950 rounded-full overflow-hidden border-2 border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-500"
            style={{ width: `${xpPercent}%` }}
          />
        </div>
      </div>

      {/* ============================================================== */}
      {/* GAMIFICAÇÃO: FOGO DA SEQUÊNCIA (STREAK) & ROLETA DIÁRIA */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* Fogo da Sequência Semanal */}
        <div className="pixel-box bg-gradient-to-r from-orange-950/80 via-slate-900 to-amber-950/80 p-5 border-orange-500 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-pixel text-xs text-orange-400 flex items-center gap-1.5">
                <Flame size={16} className="text-orange-400 fill-orange-500 animate-pulse" />
                FOGO DO SABER (STREAK DIÁRIO)
              </span>
              <span className="font-pixel text-[10px] bg-orange-950 text-orange-300 border border-orange-600 px-2 py-0.5 rounded">
                {profile?.streak_days || 1} Dias Seguidos!
              </span>
            </div>

            <p className="text-xs text-slate-300 mb-4">
              Estudar um pouquinho todo dia mantém sua mente ágil! A cada dia consecutivo, você ganha <strong>+10% de XP Bônus</strong> em todas as matérias!
            </p>

            {/* Marcadores dos 7 dias da semana */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day, idx) => {
                const isCurrentActive = idx < (profile?.streak_days || 1) % 7 || (profile?.streak_days || 1) >= 7;
                return (
                  <div
                    key={day}
                    className={`p-2 rounded-xl border flex flex-col items-center text-center transition-all ${
                      isCurrentActive
                        ? 'bg-orange-950/80 border-orange-400 text-orange-200 shadow-md'
                        : 'bg-slate-950/80 border-slate-800 text-slate-500'
                    }`}
                  >
                    <span className="text-xs mb-0.5">{isCurrentActive ? '🔥' : '⚪'}</span>
                    <span className="font-pixel text-[9px]">{day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-[11px] text-amber-300 font-bold bg-slate-950/80 p-2 rounded-lg border border-slate-800 text-center mt-3">
            ✨ Multiplicador Ativo: +10% de XP por Conexão Diária!
          </div>
        </div>

        {/* Roleta da Sabedoria Diária (1 Giro Grátis Todo Dia) */}
        <div className="pixel-box bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 p-5 border-purple-400 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-pixel text-xs text-purple-300 flex items-center gap-1.5">
                <Gift size={16} className="text-amber-400" />
                ROLETA DA SABEDORIA (1X AO DIA)
              </span>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500 px-2 py-0.5 rounded-full font-bold">
                100% Gratuito
              </span>
            </div>

            <p className="text-xs text-slate-300 mb-4">
              Gire o Baú Diário da Sabedoria para ganhar moedas de estudos grátis para usar na compra de acessórios e frutinhas para o seu PET!
            </p>

            <div className="flex items-center justify-center py-2">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-purple-600 border-4 border-amber-300 flex items-center justify-center text-3xl shadow-lg ${
                isSpinning ? 'animate-spin' : 'animate-bounce-subtle'
              }`}>
                🎁
              </div>
            </div>

            {spinReward && (
              <p className="text-center font-pixel text-xs text-amber-300 my-2">
                🎉 VOCÊ GANHOU +{spinReward} MOEDAS!
              </p>
            )}
          </div>

          <div className="pt-3">
            <PixelButton
              variant={hasSpunToday ? 'dark' : 'warning'}
              size="sm"
              className="w-full"
              disabled={hasSpunToday || isSpinning}
              onClick={handleSpinWheel}
            >
              {isSpinning
                ? 'GIRANDO O BAÚ...'
                : hasSpunToday
                ? 'JÁ RESGATADO HOJE! VOLTE AMANHÃ ✔'
                : 'ABRIR RECOMPENSA DIÁRIA 🎁'}
            </PixelButton>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* Escolha de Avatar */}
        <div className="pixel-box bg-slate-900/90 p-5">
          <h3 className="font-pixel text-xs text-cyan-300 mb-3 flex items-center gap-1.5">
            <Sparkles size={14} />
            MUDAR AVATAR
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {AVATAR_PRESETS.map(av => (
              <button
                key={av.id}
                type="button"
                onClick={() => handleSelectAvatar(av.id)}
                className={`p-2.5 rounded-xl border-2 flex flex-col items-center transition-all ${
                  profile?.avatar_preset === av.id
                    ? 'bg-amber-400/20 border-amber-400 scale-105'
                    : 'bg-slate-800 border-slate-700 hover:border-slate-500'
                }`}
              >
                <span className="text-2xl">{av.icon_name}</span>
                <span className="text-[10px] text-slate-300 font-bold mt-1 truncate max-w-full">
                  {av.name.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Companheiro PET Atual */}
        <div className="pixel-box bg-slate-900/90 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-pixel text-xs text-amber-300 flex items-center gap-1.5">
                <Heart size={14} className="text-rose-400" />
                PET COMPANHEIRO
              </h3>
              <span className="font-pixel text-[10px] text-slate-400">
                Raridade: {activePet?.rarity.toUpperCase()}
              </span>
            </div>

            <div className="flex items-center gap-4 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 mb-3">
              {activePet && <PetIcon petId={activePet.id} size={54} mood="happy" />}
              <div>
                <h4 className="font-pixel text-sm text-white">{activePet?.name}</h4>
                <p className="text-xs text-slate-400">{activePet?.species}</p>
                <p className="text-[11px] text-slate-300 mt-1">{activePet?.description}</p>
              </div>
            </div>
          </div>

          <PixelButton
            variant="warning"
            size="sm"
            className="w-full"
            onClick={() => window.location.href = '/pets'}
          >
            VER COLEÇÃO COMPLETA DE PETS 🐾
          </PixelButton>
        </div>
      </div>

      {/* SELETOR DE PONTEIRO DO MOUSE MÁGICO RETRÔ (SPRINT 2.1) */}
      <div className="pixel-box bg-slate-900/90 p-5 mb-8 border-indigo-400">
        <h3 className="font-pixel text-xs text-amber-300 mb-2 flex items-center gap-2">
          <Sparkles size={16} className="text-yellow-400" />
          PONTEIRO DO MOUSE MÁGICO (EFEITOS RETRÔ)
        </h3>
        <p className="text-xs text-slate-300 mb-4">
          Escolha como o ponteiro do seu mouse se transforma na tela com faíscas mágicas e cliques táteis:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { id: 'varinha', name: 'Varinha Estelar', icon: '🪄', desc: 'Solta faíscas douradas' },
            { id: 'picareta', name: 'Picareta Pixel', icon: '⛏️', desc: 'Gira no clique tátil' },
            { id: 'patinha', name: 'Patinha de Pet', icon: '🐾', desc: 'Deixa pegadas fofas' },
            { id: 'foguete', name: 'Mini Foguete', icon: '🚀', desc: 'Propulsão estelar' },
            { id: 'padrao', name: 'Cursor Normal', icon: '🏹', desc: 'Padrão do navegador' },
          ].map(c => (
            <button
              key={c.id}
              type="button"
              onClick={() => handleSelectCursor(c.id)}
              className={`p-3 rounded-xl border-2 flex flex-col items-center text-center transition-all ${
                selectedCursor === c.id
                  ? 'bg-amber-400/20 border-amber-400 scale-105 shadow-[0_0_12px_rgba(251,191,36,0.4)]'
                  : 'bg-slate-800 border-slate-700 hover:border-slate-500 hover:bg-slate-750'
              }`}
            >
              <span className="text-3xl mb-1">{c.icon}</span>
              <span className="font-pixel text-[11px] text-white block">{c.name}</span>
              <span className="text-[10px] text-slate-400 mt-0.5">{c.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================== */}
      {/* SALA DE TROFÉUS & CONQUISTAS 2.0 (GAMIFICAÇÃO DE METAS) */}
      {/* ============================================================== */}
      <div className="pixel-box bg-slate-900/90 p-6 mb-8 border-amber-400 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="text-amber-400 w-5 h-5" />
              <h3 className="font-pixel text-xs sm:text-sm text-amber-300">
                SALA DE TROFÉUS & CONQUISTAS
              </h3>
            </div>
            <p className="text-xs text-slate-300">
              Conclua marcos importantes nos estudos e resgate moedas e recompensas exclusivas!
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-pixel text-[10px] text-slate-400">Filtrar:</span>
            {['todos', 'estudo', 'jogos', 'pets', 'habito'].map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setAchFilter(cat)}
                className={`font-pixel text-[10px] px-2.5 py-1 rounded-lg uppercase transition-all ${
                  achFilter === cat
                    ? 'bg-amber-400 text-slate-950 font-bold shadow'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {ACHIEVEMENTS_CATALOG
            .filter(a => achFilter === 'todos' || a.category === achFilter)
            .map(ach => {
              const isClaimed = claimedAchievements.includes(ach.id);
              const isReadyToClaim = !isClaimed && ach.progress >= ach.max_progress;

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

                    {/* Barra de Progresso da Conquista */}
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
                          style={{ width: `${Math.min(100, (ach.progress / ach.max_progress) * 100)}%` }}
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
                        Conquistado
                      </button>
                    ) : isReadyToClaim ? (
                      <PixelButton
                        variant="warning"
                        size="sm"
                        className="w-full"
                        onClick={() => handleClaimAchievement(ach.id, ach.reward_coins)}
                      >
                        RESGATAR (+{ach.reward_coins} 🪙)
                      </PixelButton>
                    ) : (
                      <span className="block text-center text-[10px] text-slate-500 font-bold py-1">
                        Recompensa: +{ach.reward_coins} 🪙
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* SEÇÃO DO MODO FOCO (AJUSTES FINOS PELO RESPONSÁVEL) */}
      {/* ============================================================== */}
      <div className="pixel-box bg-slate-900/90 p-5 sm:p-6 border-emerald-600 mb-8">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Heart className="text-emerald-400 w-5 h-5" />
            <div>
              <h3 className="font-pixel text-xs sm:text-sm text-emerald-300">
                CONFIGURAÇÕES DO MODO FOCO (APOIO À ATENÇÃO)
              </h3>
              <p className="text-[11px] text-slate-400">
                Acessibilidade pedagógica para ritmo calmo, pausas e redução de estímulos
              </p>
            </div>
          </div>

          {/* Toggle Principal */}
          <button
            type="button"
            onClick={() => toggleFocusMode(!focusMode.is_active)}
            className={`font-pixel text-xs px-3 py-1.5 rounded-lg border-2 transition-all ${
              focusMode.is_active
                ? 'bg-emerald-600 text-white border-emerald-400'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            {focusMode.is_active ? 'ATIVADO' : 'DESATIVADO'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          
          {/* Duração da Sessão */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-300">Duração da Microsessão:</span>
              <span className="font-pixel text-emerald-400">{focusMode.session_duration_minutes} minutos</span>
            </div>
            <input
              type="range"
              min="2"
              max="8"
              value={focusMode.session_duration_minutes}
              onChange={e => updateFocusSettings({ session_duration_minutes: Number(e.target.value) })}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Recomendado: 3 a 5 minutos com pausa orientada pelo PET.
            </p>
          </div>

          {/* Leitura em Voz Alta */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-300 block">Leitura em Voz Automática</span>
              <span className="text-[10px] text-slate-400">Lê enunciados com sintetizador amigável</span>
            </div>
            <input
              type="checkbox"
              checked={focusMode.tts_auto_read}
              onChange={e => updateFocusSettings({ tts_auto_read: e.target.checked })}
              className="w-5 h-5 rounded text-emerald-600 accent-emerald-500"
            />
          </div>

          {/* Redução de Estímulos */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-300 block">Reduzir Estímulos e Partículas</span>
              <span className="text-[10px] text-slate-400">Desativa flashes e animações rápidas</span>
            </div>
            <input
              type="checkbox"
              checked={focusMode.reduced_stimuli}
              onChange={e => updateFocusSettings({ reduced_stimuli: e.target.checked })}
              className="w-5 h-5 rounded text-emerald-600 accent-emerald-500"
            />
          </div>

          {/* Intervalo de Pausas */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-300 block">Pausa de Respiração & Água</span>
              <span className="text-[10px] text-slate-400">O PET sugere alongar a cada intervalo</span>
            </div>
            <span className="font-pixel text-emerald-400 text-xs">
              {focusMode.pause_interval_minutes}m
            </span>
          </div>

        </div>
      </div>

      {/* Área do Responsável Legal */}
      <div className="pixel-box bg-slate-900/90 p-5 border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="text-indigo-400 w-4 h-4" />
            <h4 className="font-pixel text-xs text-indigo-300">DADOS DO RESPONSÁVEL</h4>
          </div>
          <p className="text-xs text-slate-300">
            Responsável: <strong className="text-white">{guardian?.full_name || 'Guardião Legal'}</strong> ({guardian?.email || 'contato@familia.com'})
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Conta protegida com isolamento por usuário (RLS). Nenhuma informação de saúde ou laudo é compartilhada publicamente.
          </p>
        </div>

        <button
          type="button"
          onClick={logout}
          className="px-4 py-2 bg-rose-950/70 hover:bg-rose-900/80 border-2 border-rose-600 rounded-xl text-rose-300 font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0"
        >
          <LogOut size={14} />
          Trocar Conta / Sair
        </button>
      </div>

    </div>
  );
}
