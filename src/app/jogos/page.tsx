'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/auth-context';
import { SUBJECTS } from '../../lib/content-data';
import { PixelButton } from '../../components/PixelButton';
import { sounds } from '../../lib/sound-effects';
import { 
  Calculator, BookOpen, FlaskConical, Compass, Mic, Keyboard, 
  Gamepad2, Sparkles, Trophy, ArrowRight, ShieldCheck, Play 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function JogosPage() {
  const { profile, focusMode, addPoints } = useAuth();
  const [selectedGrade, setSelectedGrade] = useState<3 | 4>(profile?.school_grade || 3);
  const [activeTab, setActiveTab] = useState<'materias' | 'minijogos'>('materias');

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
      id: 'bloco_minerador',
      title: 'Mundo dos Blocos da Sabedoria',
      genre: 'Sandbox / Mineração',
      description: 'Dê picaretadas nos blocos com a resposta correta para coletar gemas raras e construir seu castelo!',
      color: '#0fbcf9',
      badge: 'Matemática & Português',
    },
    {
      id: 'aventura_plataforma',
      title: 'Salto nas Ilhas Celestes',
      genre: 'Aventura & Plataforma',
      description: 'Corra, pule entre nuvens e acerte os desafios para abrir pontes secretas até o topo!',
      color: '#ff6b81',
      badge: 'Ciências & Geografia',
    },
    {
      id: 'corrida_tabuada',
      title: 'Velocidade Turbo das Estrelas',
      genre: 'Corrida Rápida',
      description: 'Acelere seu foguetinho interestelar a cada conta de tabuada resolvida antes que o tempo acabe!',
      color: '#ffa502',
      badge: 'Tabuada & Reflexos',
    },
    {
      id: 'hub_mundos',
      title: 'Praça dos Portais Criativos',
      genre: 'Mundo Aberto / Hub',
      description: 'Encontre amigos, visite ilhas temáticas de cada matéria e colete baús escondidos com seu PET!',
      color: '#a55eea',
      badge: 'Exploração Livre',
    },
  ];

  // Simulação de treino rápido para ganhar moedas já na Fase 1!
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
            <span className="font-pixel text-xs text-amber-400">HUB DE AVENTURAS</span>
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

      {/* Tabs de Escolha: Matérias BNCC vs Minijogos Originais */}
      <div className="flex items-center gap-3 mb-6 border-b-2 border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            setActiveTab('materias');
          }}
          className={`font-pixel text-xs sm:text-sm px-4 py-2 rounded-lg transition-all ${
            activeTab === 'materias'
              ? 'bg-amber-400 text-slate-950 shadow-[0_3px_0_#92400e]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          📚 MATÉRIAS ESCOLARES (BNCC)
        </button>

        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            setActiveTab('minijogos');
          }}
          className={`font-pixel text-xs sm:text-sm px-4 py-2 rounded-lg transition-all ${
            activeTab === 'minijogos'
              ? 'bg-cyan-400 text-slate-950 shadow-[0_3px_0_#0369a1]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          🎮 MINIJOGOS TEMÁTICOS
        </button>
      </div>

      {/* CONTEÚDO DA TAB: MATÉRIAS */}
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

      {/* CONTEÚDO DA TAB: MINIJOGOS ORIGINAIS */}
      {activeTab === 'minijogos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              {game.id === 'bloco_minerador' ? (
                <Link href="/jogos/matematica" className="w-full">
                  <PixelButton
                    variant="warning"
                    size="md"
                    className="w-full"
                    icon={<Gamepad2 className="w-4 h-4" />}
                  >
                    ENTRAR NA MINA DE BLOCOS ⛏️
                  </PixelButton>
                </Link>
              ) : game.id === 'aventura_plataforma' ? (
                <Link href="/jogos/portugues" className="w-full">
                  <PixelButton
                    variant="warning"
                    size="md"
                    className="w-full"
                    icon={<Gamepad2 className="w-4 h-4" />}
                  >
                    ENTRAR NA TRILHA DE SALTOS 🌉
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

    </div>
  );
}
