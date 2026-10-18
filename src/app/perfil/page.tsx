'use client';

import React, { useState } from 'react';
import { useAuth } from '../../lib/auth-context';
import { AVATAR_PRESETS, PET_CATALOG } from '../../lib/content-data';
import { PixelButton } from '../../components/PixelButton';
import { PetIcon } from '../../components/PetIcon';
import { sounds } from '../../lib/sound-effects';
import { validateNickname } from '../../lib/nickname-moderator';
import { 
  User, Shield, Coins, Flame, Award, Heart, 
  Settings, LogOut, Check, Sparkles, Volume2 
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
    logout 
  } = useAuth();

  const [isEditingNick, setIsEditingNick] = useState(false);
  const [newNick, setNewNick] = useState(profile?.nickname || '');
  const [nickError, setNickError] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

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
