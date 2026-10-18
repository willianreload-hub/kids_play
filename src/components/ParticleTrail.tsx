'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth-context';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
}

const COLORS = ['#f59e0b', '#38bdf8', '#ec4899', '#a855f7', '#10b981'];

export function ParticleTrail() {
  const { focusMode } = useAuth();
  const [particles, setParticles] = useState<Particle[]>([]);
  const [enabled, setEnabled] = useState(true);

  // Não renderizar se Modo Foco ativo ou estímulos reduzidos ou preferência do sistema por redução de movimento
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced || focusMode.is_active || focusMode.reduced_stimuli) {
        setEnabled(false);
      } else {
        setEnabled(true);
      }
    }
  }, [focusMode.is_active, focusMode.reduced_stimuli]);

  useEffect(() => {
    if (!enabled) return;

    let particleId = 0;
    let throttleTimeout: NodeJS.Timeout | null = null;

    const handlePointerMove = (e: PointerEvent) => {
      if (throttleTimeout) return;

      throttleTimeout = setTimeout(() => {
        throttleTimeout = null;
      }, 55);

      const newParticle: Particle = {
        id: particleId++,
        x: e.clientX,
        y: e.clientY,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: Math.floor(Math.random() * 4) + 4,
      };

      setParticles(prev => [...prev.slice(-12), newParticle]);

      setTimeout(() => {
        setParticles(prev => prev.filter(p => p.id !== newParticle.id));
      }, 700);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      if (throttleTimeout) clearTimeout(throttleTimeout);
    };
  }, [enabled]);

  if (!enabled || particles.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute animate-fade-out"
          style={{
            left: p.x - p.size / 2,
            top: p.y - p.size / 2,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 8px ${p.color}`,
            borderRadius: '2px', // Estilo pixel art quadrado
          }}
        />
      ))}
    </div>
  );
}
