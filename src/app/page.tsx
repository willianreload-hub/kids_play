'use client';

import React from 'react';
import Link from 'next/link';
import { PixelButton } from '../components/PixelButton';
import { PetIcon } from '../components/PetIcon';
import { PET_CATALOG, SUBJECTS } from '../lib/content-data';
import { Sparkles, Crown, Zap, ShieldCheck, HeartHandshake, ArrowRight, Play } from 'lucide-react';
import { sounds } from '../lib/sound-effects';

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* Background estrelado sutil */}
      <div className="absolute inset-0 retro-grid opacity-30 pointer-events-none" />

      {/* Hero Section */}
      <section className="relative max-w-6xl mx-auto px-4 pt-8 pb-16 sm:pt-16 sm:pb-24 text-center">
        
        {/* Badge da BNCC e Ensino Fundamental */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-900/80 border-2 border-indigo-400/50 text-indigo-200 text-xs sm:text-sm font-bold mb-6 animate-bounce-subtle">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Alinhado à BNCC • 3º e 4º ano do Ensino Fundamental</span>
        </div>

        {/* Título Principal */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight drop-shadow-md">
          Aprender agora parece{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-pink-400 to-cyan-400 font-pixel text-2xl sm:text-4xl md:text-5xl block sm:inline-block mt-2 sm:mt-0">
            JOGAR NO MÁXIMO!
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-xl text-slate-300 mb-8 sm:mb-10 font-normal leading-relaxed">
          Reforce Matemática, Português, Ciências e Inglês com desafios curtos,
          colecione <strong className="text-amber-300">PETs fofos em pixel art</strong>, suba ao{' '}
          <strong className="text-yellow-400">Trono dos Campeões</strong> e conquiste medalhas todo dia!
        </p>

        {/* CTAs Principais */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link href="/cadastro" onClick={() => sounds.playCoin()}>
            <PixelButton variant="primary" size="lg" icon={<Play className="fill-current w-4 h-4" />}>
              CRIAR MEU HERÓI GRÁTIS
            </PixelButton>
          </Link>

          <Link href="/jogos" onClick={() => sounds.playClick()}>
            <PixelButton variant="warning" size="lg" icon={<Zap className="w-4 h-4" />}>
              EXPLORAR MINIJOGOS
            </PixelButton>
          </Link>

          <Link href="/login" onClick={() => sounds.playClick()}>
            <PixelButton variant="dark" size="lg">
              JÁ TENHO CONTA
            </PixelButton>
          </Link>
        </div>

        {/* Desfile dos PETs Iniciais */}
        <div className="pixel-box bg-slate-900/90 max-w-4xl mx-auto p-4 sm:p-6 mb-16">
          <div className="flex items-center justify-between mb-4 border-b-2 border-slate-800 pb-2">
            <span className="font-pixel text-xs sm:text-sm text-amber-400 flex items-center gap-2">
              🐾 ESCOLHA SEU COMPANHEIRO DE AVENTURA
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">100% Gratuito no Início</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {PET_CATALOG.slice(0, 4).map(pet => (
              <div
                key={pet.id}
                className="bg-slate-800/80 hover:bg-slate-750 p-3 rounded-xl border-2 border-slate-700 hover:border-amber-400 transition-all text-center flex flex-col items-center group cursor-pointer"
              >
                <div className="w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <PetIcon petId={pet.id} size={54} mood="happy" />
                </div>
                <h4 className="font-pixel text-xs text-white mt-2 group-hover:text-amber-300">
                  {pet.name}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  {pet.species}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Matérias do 3º e 4º ano */}
        <div className="text-left mb-16">
          <div className="text-center mb-8">
            <h2 className="font-pixel text-lg sm:text-2xl text-cyan-400 mb-2">
              PORTAIS DO CONHECIMENTO
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Aulas gamificadas em sessões rápidas de 2 a 5 minutos, sem cansar!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SUBJECTS.map(subj => (
              <Link
                key={subj.id}
                href={`/jogos?materia=${subj.id}`}
                onClick={() => sounds.playClick()}
                className="pixel-box-sm bg-slate-900/90 p-4 hover:border-cyan-400 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-pixel text-xs text-white group-hover:text-cyan-300">
                      {subj.name}
                    </span>
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: subj.color_theme }} />
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    {subj.description}
                  </p>
                </div>
                <div className="text-[10px] text-cyan-400 font-bold uppercase flex items-center gap-1">
                  <span>{subj.bncc_focus}</span>
                  <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Destaques Especiais: Ranking do Trono + Modo Foco + Segurança */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          
          {/* Card Trono */}
          <div className="pixel-box bg-gradient-to-b from-amber-950/60 to-slate-900 p-5 border-amber-600">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
              <Crown className="w-6 h-6" />
            </div>
            <h3 className="font-pixel text-sm text-amber-300 mb-2">
              TRONO DOS CAMPEÕES
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Top Diário, Semanal e Mensal com pódio pixel art para os 3 primeiros colocados. Cada acerto rende pontos para sua coroa!
            </p>
          </div>

          {/* Card Modo Foco */}
          <div className="pixel-box bg-gradient-to-b from-emerald-950/60 to-slate-900 p-5 border-emerald-600">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-pixel text-sm text-emerald-300 mb-2">
              MODO FOCO (ATENÇÃO)
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Trilha adaptada com microsessões, menos estímulos, uma questão por tela, leitura em voz e sem contagem regressiva punitiva.
            </p>
          </div>

          {/* Card Proteção & LGPD */}
          <div className="pixel-box bg-gradient-to-b from-indigo-950/60 to-slate-900 p-5 border-indigo-600">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="font-pixel text-sm text-indigo-300 mb-2">
              SEGURO & SEM ANÚNCIOS
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Zero dinheiro real, sem chat livre entre alunos, consentimento dos pais obrigatório e nicknames moderados conforme o ECA Digital.
            </p>
          </div>

        </div>

      </section>
    </div>
  );
}
