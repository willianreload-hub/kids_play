'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/auth-context';
import { SUBJECTS } from '../../lib/content-data';
import { PixelButton } from '../../components/PixelButton';
import { PetIcon } from '../../components/PetIcon';
import { sounds } from '../../lib/sound-effects';
import { 
  Calculator, BookOpen, FlaskConical, Compass, Mic, Keyboard, 
  Gamepad2, Sparkles, Trophy, ArrowRight, ShieldCheck, Play,
  Map, Award, Rocket, CheckCircle2, Star, Gift, Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PassTier {
  level: number;
  xpRequired: number;
  rewardType: 'coins' | 'fragments' | 'title' | 'special';
  rewardLabel: string;
  icon: string;
  rewardValue: number;
}

export default function JogosPage() {
  const { profile, activePet, focusMode, addPoints, equippedAccessoryId } = useAuth();
  const [selectedGrade, setSelectedGrade] = useState<3 | 4>(profile?.school_grade || 3);
  const [activeTab, setActiveTab] = useState<'materias' | 'minijogos' | 'mapa' | 'passe'>('materias');

  // Estado do Passe da Sabedoria (Persistido no navegador)
  const [claimedLevels, setClaimedLevels] = useState<number[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kids_player_claimed_season_pass');
      return saved ? JSON.parse(saved) : [1];
    }
    return [1];
  });

  // Cálculo do Nível da Temporada baseado no XP
  const currentXp = profile?.xp || 0;
  const currentSeasonLevel = Math.min(30, Math.max(1, Math.floor(currentXp / 80) + 1));

  // Tabela dos 30 Níveis do Passe da Sabedoria (100% Gratuito)
  const seasonPassTiers: PassTier[] = Array.from({ length: 30 }, (_, i) => {
    const lvl = i + 1;
    const xpReq = (lvl - 1) * 80;

    if (lvl === 1) return { level: lvl, xpRequired: xpReq, rewardType: 'coins', rewardLabel: '50 Moedas', icon: '🪙', rewardValue: 50 };
    if (lvl === 5) return { level: lvl, xpRequired: xpReq, rewardType: 'title', rewardLabel: 'Título: Aluno Estrela', icon: '⭐', rewardValue: 0 };
    if (lvl === 10) return { level: lvl, xpRequired: xpReq, rewardType: 'special', rewardLabel: 'Óculos VR Futurista', icon: '🥽', rewardValue: 100 };
    if (lvl === 15) return { level: lvl, xpRequired: xpReq, rewardType: 'fragments', rewardLabel: '25 Fragmentos PET', icon: '⚡', rewardValue: 25 };
    if (lvl === 20) return { level: lvl, xpRequired: xpReq, rewardType: 'title', rewardLabel: 'Título: Mestre do Saber', icon: '👑', rewardValue: 0 };
    if (lvl === 25) return { level: lvl, xpRequired: xpReq, rewardType: 'coins', rewardLabel: '250 Moedas', icon: '💰', rewardValue: 250 };
    if (lvl === 30) return { level: lvl, xpRequired: xpReq, rewardType: 'special', rewardLabel: 'Troféu Supremo do Saber', icon: '🏆', rewardValue: 500 };

    if (lvl % 4 === 0) {
      return { level: lvl, xpRequired: xpReq, rewardType: 'fragments', rewardLabel: '15 Fragmentos PET', icon: '⚡', rewardValue: 15 };
    }

    return { level: lvl, xpRequired: xpReq, rewardType: 'coins', rewardLabel: `${40 + lvl * 5} Moedas`, icon: '🪙', rewardValue: 40 + lvl * 5 };
  });

  const handleClaimReward = (tier: PassTier) => {
    if (claimedLevels.includes(tier.level)) return;
    if (currentSeasonLevel < tier.level) {
      sounds.playGentleBoop();
      alert(`Você precisa atingir o Nível ${tier.level} de XP para desbloquear esta recompensa! Estude mais um pouco para avançar! 📚`);
      return;
    }

    sounds.playLevelUp();
    if (tier.rewardValue > 0) {
      addPoints(tier.rewardValue, `passe_sabedoria_nvl_${tier.level}`);
    }

    const nextClaimed = [...claimedLevels, tier.level];
    setClaimedLevels(nextClaimed);
    if (typeof window !== 'undefined') {
      localStorage.setItem('kids_player_claimed_season_pass', JSON.stringify(nextClaimed));
    }

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  // Mapeamento de ícones visuais
  const getSubjectIcon = (icon: string) => {
    switch (icon) {
      case 'calculator': return <Calculator className="w-6 h-6 text-cyan-400" />;
      case 'book-open': return <BookOpen className="w-6 h-6 text-pink-400" />;
      case 'flask': return <FlaskConical className="w-6 h-6 text-emerald-400" />;
      case 'compass': return <Compass className="w-6 h-6 text-amber-400" />;
      case 'mic': return <Mic className="w-6 h-6 text-purple-400" />;
      case 'keyboard': return <Keyboard className="w-6 h-6 text-orange-400" />;
      default: return <Gamepad2 className="w-6 h-6 text-yellow-400" />;
    }
  };

  const originalGames = [
    {
      id: 'fracoes_medidas',
      title: 'Alquimia das Frações & Medidas',
      genre: 'Frações Visuais & Alquimia',
      description: 'Corte pizzas mágicas, prepare poções com frações equivalentes e converta litros, quilos e metros!',
      color: '#c084fc',
      badge: 'NOVO • Frações & Medidas 🧪',
      href: '/jogos/fracoes',
      buttonText: 'PREPARAR POÇÕES 🧪',
    },
    {
      id: 'tabuada_espacial',
      title: 'Corrida Espacial da Tabuada',
      genre: 'Velocidade & Combos Retrô',
      description: 'Pilote a Nave Ômega, destrua asteroides calculando multiplicações e ative combos épicos com seu Copiloto PET!',
      color: '#818cf8',
      badge: 'NOVO • Tabuada & Combos 🚀',
      href: '/jogos/tabuada-espacial',
      buttonText: 'PILOTAR A NAVE ESTELAR 🚀',
    },
    {
      id: 'biomas_brasil',
      title: 'Expedição pelos Biomas do Brasil',
      genre: 'Aventura & Exploração Científica',
      description: 'Explore a Amazônia, Caatinga, Cerrado, Pantanal, Mata Atlântica e Pampa e ganhe insígnias de guardião!',
      color: '#10b981',
      badge: 'NOVO • Ciências & Geografia 🧭',
      href: '/jogos/biomas',
      buttonText: 'INICIAR EXPEDIÇÃO 🧭',
    },
    {
      id: 'bloco_minerador',
      title: 'Mundo dos Blocos da Sabedoria',
      genre: 'Sandbox / Mineração',
      description: 'Dê picaretadas nos blocos com a resposta correta para coletar gemas raras e construir seu castelo!',
      color: '#0fbcf9',
      badge: 'Matemática (BNCC)',
      href: '/jogos/matematica',
      buttonText: 'ENTRAR NA MINA DE BLOCOS ⛏️',
    },
    {
      id: 'aventura_plataforma',
      title: 'Salto nas Ilhas Celestes',
      genre: 'Aventura & Plataforma',
      description: 'Corra, pule entre nuvens e acerte os desafios de ortografia para abrir pontes secretas até o topo!',
      color: '#ff6b81',
      badge: 'Língua Portuguesa',
      href: '/jogos/portugues',
      buttonText: 'ENTRAR NA TRILHA DE SALTOS 🌉',
    },
    {
      id: 'ingles_voz',
      title: 'Ilha do Inglês Falante',
      genre: 'Reconhecimento de Voz & Áudio',
      description: 'Ouça pronúncias nativas em inglês, repita no microfone e colecione estrelas com o seu PET!',
      color: '#a55eea',
      badge: 'Inglês Interativo',
      href: '/jogos/ingles',
      buttonText: 'ENTRAR NA ILHA DE VOZ 🗣️',
    },
    {
      id: 'estacao_ciencias',
      title: 'Estação Científica da Natureza',
      genre: 'Laboratório & Descoberta',
      description: 'Examine animais, ciclos da água, plantas e o sistema solar no laboratório interativo!',
      color: '#2ed573',
      badge: 'Ciências Naturais',
      href: '/jogos/ciencias',
      buttonText: 'EXPLORAR O LABORATÓRIO 🔬',
    },
    {
      id: 'mestre_teclado',
      title: 'Mestre do Teclado Retrô',
      genre: 'Agilidade & Letramento',
      description: 'Treine a posição correta dos dedos com teclas brilhantes, meça sua velocidade WPM e seja um craque!',
      color: '#ff7f50',
      badge: 'Digitação Ágil',
      href: '/jogos/digitacao',
      buttonText: 'DOMINAR O TECLADO ⌨️',
    },
  ];

  // Simulação de treino rápido para ganhar moedas
  const handleQuickPlay = (subjectName: string) => {
    sounds.playSuccess();
    addPoints(25, 'treino_rapido');
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
    });
    alert(`Parabéns! Você completou um treino rápido de ${subjectName} e ganhou +25 Moedas! 🪙`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      
      {/* Banner de Boas-Vindas & Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-pixel text-xs text-amber-400">HUB DE AVENTURAS 2.0</span>
            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-bold">
              Ano Atual: {selectedGrade}º Ano
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Onde você quer se divertir hoje, {profile?.nickname || 'Campeão'}?
          </h1>
        </div>

        {/* Seletor de 3º ou 4º ano */}
        <div className="flex items-center gap-1 bg-slate-900 p-1.5 rounded-xl border-2 border-slate-800 self-stretch sm:self-auto justify-center">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setSelectedGrade(3);
            }}
            className={`px-3 py-1.5 rounded-lg font-pixel text-xs transition-all ${
              selectedGrade === 3
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            3º ANO
          </button>
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setSelectedGrade(4);
            }}
            className={`px-3 py-1.5 rounded-lg font-pixel text-xs transition-all ${
              selectedGrade === 4
                ? 'bg-pink-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            4º ANO
          </button>
        </div>
      </div>

      {/* Alerta do Modo Foco quando ativo */}
      {focusMode.is_active && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-950/70 border-2 border-emerald-500 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="font-pixel text-xs text-emerald-300">MODO FOCO ATIVO</h4>
              <p className="text-xs text-emerald-100">
                Uma tarefa por vez, pausas tranquilas a cada 4 minutos e leitura em voz alta disponível.
              </p>
            </div>
          </div>
          <span className="text-xs font-pixel text-emerald-400 bg-emerald-900/60 px-2.5 py-1 rounded-md border border-emerald-600">
            Trilha Calma
          </span>
        </div>
      )}

      {/* 4 Tabs Principais do Hub 2.0 */}
      <div className="flex items-center gap-2 mb-6 border-b-2 border-slate-800 pb-3 overflow-x-auto">
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            setActiveTab('materias');
          }}
          className={`font-pixel text-xs sm:text-sm px-4 py-2 rounded-lg transition-all shrink-0 ${
            activeTab === 'materias'
              ? 'bg-amber-400 text-slate-950 shadow-[0_3px_0_#92400e]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          📚 MATÉRIAS (BNCC)
        </button>

        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            setActiveTab('minijogos');
          }}
          className={`font-pixel text-xs sm:text-sm px-4 py-2 rounded-lg transition-all shrink-0 ${
            activeTab === 'minijogos'
              ? 'bg-cyan-400 text-slate-950 shadow-[0_3px_0_#0369a1]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          🎮 MINIJOGOS ({originalGames.length})
        </button>

        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            setActiveTab('mapa');
          }}
          className={`font-pixel text-xs sm:text-sm px-4 py-2 rounded-lg transition-all shrink-0 ${
            activeTab === 'mapa'
              ? 'bg-emerald-400 text-slate-950 shadow-[0_3px_0_#047857]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          🗺️ MAPA-MUNDI NAVEGÁVEL
        </button>

        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            setActiveTab('passe');
          }}
          className={`font-pixel text-xs sm:text-sm px-4 py-2 rounded-lg transition-all shrink-0 ${
            activeTab === 'passe'
              ? 'bg-purple-500 text-white shadow-[0_3px_0_#6b21a8]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          🌟 PASSE DA SABEDORIA (30 NÍVEIS)
        </button>
      </div>

      {/* ============================================================== */}
      {/* ABA 1: MATÉRIAS ESCOLARES (BNCC) */}
      {/* ============================================================== */}
      {activeTab === 'materias' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SUBJECTS.map(subject => (
            <div
              key={subject.id}
              className="pixel-box bg-slate-900/90 p-5 flex flex-col justify-between hover:border-amber-400 transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="p-3 bg-slate-800 rounded-xl border-2 border-slate-700 group-hover:border-amber-400 transition-colors">
                    {getSubjectIcon(subject.icon)}
                  </div>
                  <span className="font-pixel text-[10px] text-amber-300 bg-amber-950/60 border border-amber-600 px-2 py-0.5 rounded">
                    {selectedGrade}º Ano
                  </span>
                </div>

                <h3 className="font-pixel text-sm text-white mb-1.5 group-hover:text-amber-300">
                  {subject.name}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {subject.description}
                </p>

                <div className="text-[11px] font-bold text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-slate-800 mb-4">
                  🎯 Foco BNCC: <span className="text-slate-200">{subject.bncc_focus}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                {subject.id === 'matematica' ? (
                  <Link href="/jogos/matematica" className="w-full">
                    <PixelButton
                      variant="primary"
                      size="sm"
                      className="w-full"
                      icon={<Play className="w-3.5 h-3.5 fill-current" />}
                    >
                      JOGAR MINERAÇÃO ⛏️
                    </PixelButton>
                  </Link>
                ) : subject.id === 'portugues' ? (
                  <Link href="/jogos/portugues" className="w-full">
                    <PixelButton
                      variant="primary"
                      size="sm"
                      className="w-full"
                      icon={<Play className="w-3.5 h-3.5 fill-current" />}
                    >
                      JOGAR SALTOS MÁGICOS 🌉
                    </PixelButton>
                  </Link>
                ) : subject.id === 'ciencias' ? (
                  <Link href="/jogos/ciencias" className="w-full">
                    <PixelButton
                      variant="primary"
                      size="sm"
                      className="w-full"
                      icon={<Play className="w-3.5 h-3.5 fill-current" />}
                    >
                      JOGAR LABORATÓRIO 🔬
                    </PixelButton>
                  </Link>
                ) : subject.id === 'ingles' ? (
                  <Link href="/jogos/ingles" className="w-full">
                    <PixelButton
                      variant="primary"
                      size="sm"
                      className="w-full"
                      icon={<Play className="w-3.5 h-3.5 fill-current" />}
                    >
                      JOGAR COM VOZ 🗣️
                    </PixelButton>
                  </Link>
                ) : subject.id === 'digitacao' ? (
                  <Link href="/jogos/digitacao" className="w-full">
                    <PixelButton
                      variant="primary"
                      size="sm"
                      className="w-full"
                      icon={<Play className="w-3.5 h-3.5 fill-current" />}
                    >
                      JOGAR DIGITAÇÃO ⌨️
                    </PixelButton>
                  </Link>
                ) : (
                  <PixelButton
                    variant="primary"
                    size="sm"
                    className="w-full"
                    onClick={() => handleQuickPlay(subject.name)}
                    icon={<Play className="w-3.5 h-3.5 fill-current" />}
                  >
                    TREINAR AGORA (+25 🪙)
                  </PixelButton>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============================================================== */}
      {/* ABA 2: MINIJOGOS TEMÁTICOS ORIGINAIS */}
      {/* ============================================================== */}
      {activeTab === 'minijogos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {originalGames.map(game => (
            <div
              key={game.id}
              className="pixel-box bg-slate-900/90 p-6 flex flex-col justify-between border-slate-700 hover:border-cyan-400 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-pixel text-[10px] text-cyan-300 uppercase bg-cyan-950/70 border border-cyan-600 px-2.5 py-1 rounded">
                    {game.genre}
                  </span>
                  <span className="text-xs text-amber-300 font-bold">
                    {game.badge}
                  </span>
                </div>

                <h3 className="font-pixel text-base text-white mb-2">
                  {game.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {game.description}
                </p>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs mb-4">
                  <span className="text-slate-400">Duração média:</span>
                  <span className="font-bold text-amber-400">2 a 5 minutos</span>
                </div>
              </div>

              {game.href ? (
                <Link href={game.href} className="w-full">
                  <PixelButton
                    variant="warning"
                    size="md"
                    className="w-full"
                    icon={<Gamepad2 className="w-4 h-4" />}
                  >
                    {game.buttonText}
                  </PixelButton>
                </Link>
              ) : (
                <PixelButton
                  variant="warning"
                  size="md"
                  className="w-full"
                  onClick={() => handleQuickPlay(game.title)}
                  icon={<Gamepad2 className="w-4 h-4" />}
                >
                  ENTRAR NA PARTIDA 🎮
                </PixelButton>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ============================================================== */}
      {/* ABA 3: MAPA-MUNDI NAVEGÁVEL DO SABER (SPRINT 2.4) */}
      {/* ============================================================== */}
      {activeTab === 'mapa' && (
        <div className="space-y-6">
          <div className="pixel-box bg-gradient-to-r from-teal-950 via-slate-900 to-indigo-950 p-6 border-emerald-400 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="font-pixel text-xs text-emerald-400 block mb-1">
                ARQUIPÉLAGO DA SABEDORIA INTERATIVA
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
                Mapa dos Reinos do Conhecimento
              </h2>
              <p className="text-xs text-slate-300 max-w-xl">
                Navegue pelas ilhas mágicas! Cada território guarda segredos, minijogos curriculares e desafios da BNCC esperando pelo seu clique!
              </p>
            </div>
            <div className="flex items-center gap-2 bg-slate-950/80 px-4 py-2 rounded-2xl border border-slate-800 shrink-0">
              <span className="text-2xl">🗺️</span>
              <span className="font-pixel text-xs text-amber-300">8 Reinos Descobertos</span>
            </div>
          </div>

          {/* Grid Interativo das Ilhas do Mapa com Estilo Pixel-Art */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Ilha 1: Galáxia da Tabuada */}
            <div className="pixel-box bg-gradient-to-b from-indigo-950 to-slate-900 p-5 border-indigo-400 hover:scale-102 transition-transform">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">🚀</span>
                <span className="font-pixel text-[9px] bg-indigo-900 text-indigo-200 px-2 py-0.5 rounded">
                  SETOR ESPACIAL
                </span>
              </div>
              <h4 className="font-pixel text-sm text-amber-300 mb-1">Galáxia da Tabuada Cósmica</h4>
              <p className="text-xs text-slate-300 mb-4">
                Asteroides de multiplicação e divisão em alta velocidade com combo multiplier!
              </p>
              <Link href="/jogos/tabuada-espacial" className="block w-full">
                <PixelButton variant="primary" size="sm" className="w-full">
                  POUSAR NA NAVE 🛸
                </PixelButton>
              </Link>
            </div>

            {/* Ilha 2: Biomas do Brasil */}
            <div className="pixel-box bg-gradient-to-b from-emerald-950 to-slate-900 p-5 border-emerald-400 hover:scale-102 transition-transform">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">🧭</span>
                <span className="font-pixel text-[9px] bg-emerald-900 text-emerald-200 px-2 py-0.5 rounded">
                  RESERVA NATURAL
                </span>
              </div>
              <h4 className="font-pixel text-sm text-emerald-300 mb-1">Expedição Biomas do Brasil</h4>
              <p className="text-xs text-slate-300 mb-4">
                Explore a Amazônia, Caatinga, Cerrado, Pantanal, Mata Atlântica e Pampa!
              </p>
              <Link href="/jogos/biomas" className="block w-full">
                <PixelButton variant="success" size="sm" className="w-full">
                  EXPLORAR BIOMAS 🌳
                </PixelButton>
              </Link>
            </div>

            {/* Ilha 3: Alquimia das Frações */}
            <div className="pixel-box bg-gradient-to-b from-purple-950 to-slate-900 p-5 border-purple-400 hover:scale-102 transition-transform">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">🧪</span>
                <span className="font-pixel text-[9px] bg-purple-900 text-purple-200 px-2 py-0.5 rounded">
                  CALDEIRÃO ALQUÍMICO
                </span>
              </div>
              <h4 className="font-pixel text-sm text-purple-300 mb-1">Alquimia das Frações & Medidas</h4>
              <p className="text-xs text-slate-300 mb-4">
                Fatias visuais de tortas, poções mágicas e conversão de litros, metros e gramas!
              </p>
              <Link href="/jogos/fracoes" className="block w-full">
                <PixelButton variant="primary" size="sm" className="w-full">
                  ENTRAR NO CALDEIRÃO ⚗️
                </PixelButton>
              </Link>
            </div>

            {/* Ilha 4: Mina dos Blocos */}
            <div className="pixel-box bg-gradient-to-b from-cyan-950 to-slate-900 p-5 border-cyan-400 hover:scale-102 transition-transform">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">⛏️</span>
                <span className="font-pixel text-[9px] bg-cyan-900 text-cyan-200 px-2 py-0.5 rounded">
                  VALE DOS MINÉRIOS
                </span>
              </div>
              <h4 className="font-pixel text-sm text-cyan-300 mb-1">Mina dos Blocos de Aritmética</h4>
              <p className="text-xs text-slate-300 mb-4">
                Quebre os blocos corretos com a picareta e colete gemas raras!
              </p>
              <Link href="/jogos/matematica" className="block w-full">
                <PixelButton variant="warning" size="sm" className="w-full">
                  MINERAR BLOCOS 💎
                </PixelButton>
              </Link>
            </div>

            {/* Ilha 5: Ilhas Celestes */}
            <div className="pixel-box bg-gradient-to-b from-pink-950 to-slate-900 p-5 border-pink-400 hover:scale-102 transition-transform">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">🌉</span>
                <span className="font-pixel text-[9px] bg-pink-900 text-pink-200 px-2 py-0.5 rounded">
                  ARQUIPÉLAGO CELESTE
                </span>
              </div>
              <h4 className="font-pixel text-sm text-pink-300 mb-1">Salto nas Nuvens das Palavras</h4>
              <p className="text-xs text-slate-300 mb-4">
                Pule sobre as plataformas certas e domine a ortografia e a gramática!
              </p>
              <Link href="/jogos/portugues" className="block w-full">
                <PixelButton variant="primary" size="sm" className="w-full">
                  SALTAR NUVENS ☁️
                </PixelButton>
              </Link>
            </div>

            {/* Ilha 6: Estação Científica */}
            <div className="pixel-box bg-gradient-to-b from-teal-950 to-slate-900 p-5 border-teal-400 hover:scale-102 transition-transform">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">🔬</span>
                <span className="font-pixel text-[9px] bg-teal-900 text-teal-200 px-2 py-0.5 rounded">
                  OBSERVATÓRIO NATURAL
                </span>
              </div>
              <h4 className="font-pixel text-sm text-teal-300 mb-1">Estação de Ciências da Natureza</h4>
              <p className="text-xs text-slate-300 mb-4">
                Examine seres vivos, sustentabilidade, ciclos naturais e fases da lua!
              </p>
              <Link href="/jogos/ciencias" className="block w-full">
                <PixelButton variant="success" size="sm" className="w-full">
                  PESQUISAR NATUREZA 🌱
                </PixelButton>
              </Link>
            </div>

            {/* Ilha 7: Ilha da Voz em Inglês */}
            <div className="pixel-box bg-gradient-to-b from-purple-950 to-slate-900 p-5 border-purple-400 hover:scale-102 transition-transform">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">🗣️</span>
                <span className="font-pixel text-[9px] bg-purple-900 text-purple-200 px-2 py-0.5 rounded">
                  PORTO GLOBAL
                </span>
              </div>
              <h4 className="font-pixel text-sm text-purple-300 mb-1">Ilha do Inglês Falante</h4>
              <p className="text-xs text-slate-300 mb-4">
                Fale no microfone, treine a pronúncia em inglês e colecione estrelas!
              </p>
              <Link href="/jogos/ingles" className="block w-full">
                <PixelButton variant="warning" size="sm" className="w-full">
                  FALAR NO MICROFONE 🎙️
                </PixelButton>
              </Link>
            </div>

            {/* Ilha 8: Teclado Retrô */}
            <div className="pixel-box bg-gradient-to-b from-amber-950 to-slate-900 p-5 border-amber-400 hover:scale-102 transition-transform">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">⌨️</span>
                <span className="font-pixel text-[9px] bg-amber-900 text-amber-200 px-2 py-0.5 rounded">
                  CIDADE DA AGILIDADE
                </span>
              </div>
              <h4 className="font-pixel text-sm text-amber-300 mb-1">Mestre do Teclado Retrô</h4>
              <p className="text-xs text-slate-300 mb-4">
                Digite palavras mágicas na velocidade da luz e meça seu WPM!
              </p>
              <Link href="/jogos/digitacao" className="block w-full">
                <PixelButton variant="dark" size="sm" className="w-full">
                  DIGITAR AGORA ⚡
                </PixelButton>
              </Link>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ABA 4: PASSE DA SABEDORIA - 30 NÍVEIS GRATUITOS (SPRINT 2.4) */}
      {/* ============================================================== */}
      {activeTab === 'passe' && (
        <div className="space-y-6">
          
          {/* Banner do Passe da Sabedoria */}
          <div className="pixel-box bg-gradient-to-r from-purple-950 via-slate-900 to-amber-950 p-6 border-purple-400 shadow-2xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 text-center md:text-left">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-purple-600 border-4 border-amber-300 flex items-center justify-center text-4xl shadow-xl shrink-0">
                  🌟
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1 justify-center md:justify-start">
                    <span className="font-pixel text-xs text-amber-300">TEMPORADA 1 • 100% GRATUITO</span>
                    <span className="text-[10px] bg-emerald-950 border border-emerald-500 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                      Zero Dinheiro Real • Sem Anúncios
                    </span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-white mb-1">
                    Trilha do Passe da Sabedoria
                  </h2>
                  <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                    Avance de nível estudando e jogando! Cada lição concluída rende XP para desbloquear moedas, fragmentos raros de PET e títulos lendários!
                  </p>
                </div>
              </div>

              {/* Status do Aluno no Passe */}
              <div className="bg-slate-950/80 p-4 rounded-2xl border-2 border-purple-500 text-center shrink-0 min-w-[200px]">
                <span className="font-pixel text-[10px] text-purple-300 block mb-1">SEU NÍVEL ATUAL</span>
                <span className="font-pixel text-2xl text-amber-300 block mb-1">
                  NÍVEL {currentSeasonLevel} / 30
                </span>
                <span className="text-xs text-slate-400 font-bold">
                  {currentXp} XP Acumulado
                </span>
              </div>
            </div>

            {/* Barra de Progresso Geral da Temporada */}
            <div className="mt-6 pt-4 border-t border-purple-900/60">
              <div className="flex items-center justify-between text-xs font-bold mb-1.5 text-slate-300">
                <span>Progresso da Trilha da Sabedoria:</span>
                <span className="text-amber-300 font-pixel text-[11px]">
                  {Math.round((currentSeasonLevel / 30) * 100)}% Concluído
                </span>
              </div>
              <div className="w-full h-4 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 transition-all duration-500 shadow-md"
                  style={{ width: `${(currentSeasonLevel / 30) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Trilha dos 30 Níveis com Recompensas Resgatáveis */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {seasonPassTiers.map(tier => {
              const isUnlocked = currentSeasonLevel >= tier.level;
              const isClaimed = claimedLevels.includes(tier.level);

              return (
                <div
                  key={tier.level}
                  className={`pixel-box p-4 flex flex-col justify-between transition-all ${
                    isClaimed
                      ? 'bg-slate-900/60 border-slate-700 opacity-80'
                      : isUnlocked
                      ? 'bg-gradient-to-b from-purple-950 to-slate-900 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                      : 'bg-slate-950/80 border-slate-800 opacity-60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-pixel text-[11px] text-amber-300">
                        NÍVEL {tier.level}
                      </span>
                      {isClaimed ? (
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                          <CheckCircle2 size={12} /> Resgatado
                        </span>
                      ) : isUnlocked ? (
                        <span className="text-[10px] bg-amber-950 text-amber-300 px-1.5 py-0.2 rounded border border-amber-600 font-bold animate-pulse">
                          Disponível!
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                          <Lock size={11} /> Bloqueado
                        </span>
                      )}
                    </div>

                    <div className="w-14 h-14 mx-auto my-2 rounded-2xl bg-slate-900 border-2 border-slate-700 flex items-center justify-center text-3xl shadow">
                      {tier.icon}
                    </div>

                    <h4 className="font-pixel text-center text-xs text-white mb-1">
                      {tier.rewardLabel}
                    </h4>
                    <p className="text-center text-[10px] text-slate-400 mb-4">
                      Requer {tier.xpRequired} XP
                    </p>
                  </div>

                  <div>
                    {isClaimed ? (
                      <button
                        type="button"
                        disabled
                        className="w-full py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold text-slate-500 cursor-not-allowed"
                      >
                        Já Coletado ✔
                      </button>
                    ) : isUnlocked ? (
                      <PixelButton
                        variant="warning"
                        size="sm"
                        className="w-full"
                        onClick={() => handleClaimReward(tier)}
                        icon={<Gift size={13} />}
                      >
                        RESGATAR! 🎁
                      </PixelButton>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="w-full py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-600 font-bold cursor-not-allowed"
                      >
                        Bloqueado
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
}
