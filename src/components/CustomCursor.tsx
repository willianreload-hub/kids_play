'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth-context';

export type CursorTheme = 'varinha' | 'picareta' | 'patinha' | 'foguete' | 'padrao';

interface ClickRipple {
  id: number;
  x: number;
  y: number;
  color: string;
}

declare global {
  interface WindowEventMap {
    'change_cursor_theme': CustomEvent<CursorTheme>;
  }
}

export function CustomCursor() {
  const { focusMode } = useAuth();
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [isPointer, setIsPointer] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [theme, setTheme] = useState<CursorTheme>('varinha');
  const [ripples, setRipples] = useState<ClickRipple[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Carrega tema do localStorage
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('kids_cursor_theme') as CursorTheme;
      if (savedTheme) setTheme(savedTheme);

      // Ouvinte de evento customizado para trocar cursor em tempo real sem recarregar
      const handleThemeChange = (e: CustomEvent<CursorTheme>) => {
        setTheme(e.detail);
      };
      window.addEventListener('change_cursor_theme', handleThemeChange);

      return () => {
        window.removeEventListener('change_cursor_theme', handleThemeChange);
      };
    }
  }, []);

  useEffect(() => {
    // Desativa se toque (touch device), se Modo Foco ativo ou redução de movimento
    if (typeof window === 'undefined') return;

    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isTouch || prefersReduced || focusMode.is_active || focusMode.reduced_stimuli || theme === 'padrao') {
      setIsVisible(false);
      document.body.classList.remove('custom-cursor-active');
      return;
    }

    setIsVisible(true);
    document.body.classList.add('custom-cursor-active');

    let rippleId = 0;

    const handlePointerMove = (e: PointerEvent) => {
      setPos({ x: e.clientX, y: e.clientY });

      const target = e.target as HTMLElement | null;
      if (target) {
        const isClickable = 
          target.tagName === 'BUTTON' || 
          target.tagName === 'A' || 
          target.closest('button') || 
          target.closest('a') ||
          target.getAttribute('role') === 'button' ||
          target.classList.contains('cursor-pointer');
        setIsPointer(!!isClickable);
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      setIsClicking(true);
      const newRipple: ClickRipple = {
        id: rippleId++,
        x: e.clientX,
        y: e.clientY,
        color: theme === 'varinha' ? '#fbbf24' : theme === 'picareta' ? '#38bdf8' : theme === 'patinha' ? '#f43f5e' : '#a855f7',
      };
      setRipples(prev => [...prev.slice(-5), newRipple]);

      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id));
      }, 500);
    };

    const handlePointerUp = () => {
      setIsClicking(false);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      document.body.classList.remove('custom-cursor-active');
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [theme, focusMode.is_active, focusMode.reduced_stimuli]);

  if (!isVisible) return null;

  return (
    <>
      {/* ONDAS TÁTEIS DE CLIQUE (RIPPLES) */}
      <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
        {ripples.map(r => (
          <div
            key={r.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 animate-ping"
            style={{
              left: r.x,
              top: r.y,
              width: 36,
              height: 36,
              borderColor: r.color,
              boxShadow: `0 0 12px ${r.color}`,
            }}
          />
        ))}
      </div>

      {/* CURSOR VISUAL PIXEL ART */}
      <div
        className={`pointer-events-none fixed z-50 transition-transform duration-75 select-none ${
          isClicking ? 'scale-90 rotate-12' : isPointer ? 'scale-115 -rotate-6' : 'scale-100'
        }`}
        style={{
          left: pos.x,
          top: pos.y,
          transform: `translate(${theme === 'patinha' ? '-50%, -50%' : '-4px, -4px'})`,
        }}
      >
        {theme === 'varinha' && (
          <div className="relative">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              {/* Estrela na ponta */}
              <polygon points="12,2 14,7 19,8 15,12 16,17 12,14 8,17 9,12 5,8 10,7" fill="#fde047" stroke="#78350f" strokeWidth="1.5" />
              {/* Cabo da varinha */}
              <line x1="12" y1="14" x2="22" y2="24" stroke="#a855f7" strokeWidth="3" strokeLinecap="round" />
              <line x1="12" y1="14" x2="22" y2="24" stroke="#e9d5ff" strokeWidth="1" strokeLinecap="round" />
            </svg>
            {isPointer && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-yellow-300 animate-ping" />
            )}
          </div>
        )}

        {theme === 'picareta' && (
          <div className="relative">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" className={isClicking ? 'rotate-45' : ''}>
              {/* Cabeça da picareta */}
              <path d="M4 14C6 8 10 4 16 2L18 4C14 8 10 12 8 18L4 14Z" fill="#38bdf8" stroke="#0369a1" strokeWidth="1.5" />
              {/* Cabo de madeira */}
              <line x1="11" y1="11" x2="22" y2="22" stroke="#92400e" strokeWidth="3" strokeLinecap="square" />
            </svg>
          </div>
        )}

        {theme === 'patinha' && (
          <div className="relative">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="#fb7185">
              <ellipse cx="12" cy="15" rx="5" ry="4" fill="#f43f5e" stroke="#881337" strokeWidth="1.5" />
              <circle cx="7" cy="8" r="2.5" fill="#fb7185" stroke="#881337" strokeWidth="1.5" />
              <circle cx="12" cy="6" r="2.5" fill="#fb7185" stroke="#881337" strokeWidth="1.5" />
              <circle cx="17" cy="8" r="2.5" fill="#fb7185" stroke="#881337" strokeWidth="1.5" />
            </svg>
          </div>
        )}

        {theme === 'foguete' && (
          <div className="relative">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" fill="#f97316" />
              <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" fill="#6366f1" stroke="#312e81" strokeWidth="1.5" />
              <circle cx="15" cy="9" r="1.5" fill="#38bdf8" />
            </svg>
          </div>
        )}
      </div>
    </>
  );
}
