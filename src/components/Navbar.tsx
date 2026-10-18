'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../lib/auth-context';
import { sounds } from '../lib/sound-effects';
import { Volume2, VolumeX, Flame, Coins, ShieldCheck, Sparkles, Menu, X, User } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { profile, focusMode, toggleFocusMode } = useAuth();
  const [isMuted, setIsMuted] = useState(sounds.getMuted());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleToggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
    if (!muted) sounds.playClick();
  };

  const navLinks = [
    { href: '/jogos', label: '🎮 Jogos', key: 'jogos' },
    { href: '/pets', label: '🐾 Meus PETs', key: 'pets' },
    { href: '/ranking', label: '🏆 Ranking', key: 'ranking' },
    { href: '/missoes', label: '🎯 Missões', key: 'missoes' },
    { href: '/perfil', label: '👤 Perfil', key: 'perfil' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur border-b-4 border-slate-950 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          
          {/* Logo Kids-Player com estética retrô */}
          <Link
            href="/"
            onClick={() => sounds.playClick()}
            className="flex items-center gap-2 group cursor-pointer shrink-0"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-tr from-pink-500 via-purple-600 to-amber-400 rounded-xl flex items-center justify-center border-2 border-amber-300 shadow-md group-hover:rotate-6 transition-transform">
              <Sparkles className="text-white w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="font-pixel text-xs sm:text-base text-yellow-400 drop-shadow-[0_2px_0_rgba(0,0,0,1)] tracking-tight">
                KIDS<span className="text-pink-400">PLAYER</span>
              </span>
              <span className="block text-[10px] text-cyan-300 font-bold uppercase tracking-wider">
                Reforço Gamificado
              </span>
            </div>
          </Link>

          {/* Links de Navegação Desktop */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {navLinks.map(link => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.key}
                  href={link.href}
                  onClick={() => sounds.playClick()}
                  className={`px-3 py-2 rounded-lg font-bold text-xs uppercase tracking-wide transition-all border-2 ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-[0_3px_0_#92400e]'
                      : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* HUD de Recursos do Jogador (Moedas, Streak, Som, Modo Foco) */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Moedas / Pontos */}
            <div 
              className="flex items-center gap-1.5 bg-slate-800/90 px-2.5 py-1.5 rounded-lg border-2 border-amber-500 shadow-inner"
              title="Seus Pontos & Moedas de Game"
            >
              <Coins className="text-yellow-400 w-4 h-4 sm:w-5 sm:h-5 animate-bounce-subtle" />
              <span className="font-pixel text-xs sm:text-sm text-yellow-300 font-bold">
                {profile?.points ?? 150}
              </span>
            </div>

            {/* Streak diário (Chama) */}
            <div 
              className="flex items-center gap-1 bg-slate-800/90 px-2.5 py-1.5 rounded-lg border-2 border-orange-500 shadow-inner"
              title="Sequência de dias jogando"
            >
              <Flame className="text-orange-500 w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
              <span className="font-pixel text-xs sm:text-sm text-orange-300 font-bold">
                {profile?.streak_days ?? 1}d
              </span>
            </div>

            {/* Indicador / Toggle do Modo Foco */}
            <button
              type="button"
              onClick={() => toggleFocusMode(!focusMode.is_active)}
              className={`hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg border-2 font-bold text-[11px] transition-all ${
                focusMode.is_active
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-[0_2px_0_#065f46]'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
              title="Ativar/Desativar Modo Foco (Mais calma e uma tarefa por vez)"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Foco: {focusMode.is_active ? 'ON' : 'OFF'}</span>
            </button>

            {/* Botão de Áudio (Mutar / Desmutar) */}
            <button
              type="button"
              onClick={handleToggleSound}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border-2 border-slate-700 transition-colors"
              title={isMuted ? 'Desmutar sons retrô' : 'Mutar sons'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            {/* Perfil Mini */}
            <Link
              href="/perfil"
              onClick={() => sounds.playClick()}
              className="hidden sm:flex items-center gap-2 bg-indigo-950/80 hover:bg-indigo-900 border-2 border-indigo-400/60 px-2.5 py-1 rounded-xl transition-all"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-xs font-pixel text-white">
                {profile?.nickname?.slice(0, 1) || 'A'}
              </div>
              <div className="text-left hidden md:block">
                <span className="block text-xs font-bold text-white leading-tight truncate max-w-[90px]">
                  {profile?.nickname || 'Hero'}
                </span>
                <span className="block text-[10px] text-amber-300 font-pixel">
                  Nvl {profile?.level || 1}
                </span>
              </div>
            </Link>

            {/* Botão Hamburguer Mobile */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-200 border-2 border-slate-700"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Menu Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t-2 border-slate-800 flex flex-col gap-2">
            {navLinks.map(link => (
              <Link
                key={link.key}
                href={link.href}
                onClick={() => {
                  sounds.playClick();
                  setMobileMenuOpen(false);
                }}
                className="px-3 py-2.5 rounded-lg bg-slate-800 font-bold text-sm text-slate-200 hover:bg-slate-700 flex items-center justify-between"
              >
                <span>{link.label}</span>
              </Link>
            ))}
            <div className="flex items-center justify-between px-3 py-2 bg-slate-950 rounded-lg mt-1">
              <span className="text-xs font-bold text-slate-300">Apoio Modo Foco:</span>
              <button
                type="button"
                onClick={() => toggleFocusMode(!focusMode.is_active)}
                className={`px-3 py-1 rounded text-xs font-bold ${
                  focusMode.is_active ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'
                }`}
              >
                {focusMode.is_active ? 'Ativado' : 'Desativado'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Barra de Navegação Inferior (Mobile Bar) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-900 border-t-2 border-slate-800 px-2 py-1.5 flex justify-around items-center">
        {navLinks.map(link => {
          const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
          return (
            <Link
              key={link.key}
              href={link.href}
              onClick={() => sounds.playClick()}
              className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-bold ${
                isActive ? 'text-amber-400 bg-slate-800' : 'text-slate-400'
              }`}
            >
              <span>{link.label.split(' ')[0]}</span>
              <span>{link.label.split(' ')[1]}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
