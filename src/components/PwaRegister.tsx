'use client';

import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { sounds } from '../lib/sound-effects';
import { useMediaQuery } from '../lib/client-hooks';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PwaRegister() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalledByPrompt, setIsInstalledByPrompt] = useState(false);

  // Já instalado (rodando como PWA) — derivado no render, SSR-safe
  const isStandalone = useMediaQuery('(display-mode: standalone)');
  const isInstalled = isStandalone || isInstalledByPrompt;

  useEffect(() => {
    // Registra service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {
          // Registro silencioso
        });
      });
    }

    // Captura evento de instalação PWA
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    sounds.playClick();
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      sounds.playSuccess();
      setInstallPrompt(null);
      setIsInstalledByPrompt(true);
    }
  };

  if (!installPrompt || isDismissed || isInstalled) {
    return null;
  }

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 animate-bounce-subtle max-w-xs">
      <div className="pixel-box bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-900 p-3 sm:p-4 border-amber-400 shadow-[0_4px_20px_rgba(0,0,0,0.8)] flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center text-slate-950 shrink-0 shadow">
          <Download size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-pixel text-[11px] text-yellow-300 leading-tight">
            INSTALAR O APP!
          </h4>
          <p className="text-[10px] text-slate-300 leading-tight mt-0.5">
            Jogue em tela cheia no tablet ou computador como um videogame!
          </p>
          <div className="flex items-center gap-2 mt-2">
            <button
              type="button"
              onClick={handleInstallClick}
              className="text-[10px] font-pixel bg-amber-400 hover:bg-yellow-300 text-slate-950 px-2.5 py-1 rounded-md font-bold transition-all shadow"
            >
              INSTALAR
            </button>
            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              className="text-[10px] text-slate-400 hover:text-white px-1.5 py-1"
            >
              Depois
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="text-slate-400 hover:text-white p-1"
          aria-label="Fechar aviso de instalação do aplicativo"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
