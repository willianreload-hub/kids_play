'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth-context';
import { PetIcon } from './PetIcon';
import { Volume2, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { speakText, stopSpeaking } from '../lib/speech';

interface PetCompanionProps {
  customMessage?: string;
  mood?: 'idle' | 'happy' | 'sad';
}

export function PetCompanion({ customMessage, mood = 'idle' }: PetCompanionProps) {
  const { activePet, profile, focusMode, equippedAccessoryId } = useAuth();
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(
    'Olá, campeão! Qual desafio nós vamos vencer hoje juntos?'
  );

  // Mensagens contextuais amigáveis — reatividade intencional ao contexto
  useEffect(() => {
    if (customMessage) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- mensagem contextual reage ao contexto; documentado no PLANO-DE-MELHORIAS (Fase 1)
      setCurrentMessage(customMessage);
      return;
    }

    if (focusMode.is_active) {
      setCurrentMessage(
        'Modo Foco ligado! Vamos dar um passo de cada vez. Você consegue, conte comigo!'
      );
      return;
    }

    const tips = [
      `Oi, ${profile?.nickname || 'amiguinho'}! Que bom ver você aqui!`,
      'Sabia que você ganha pontos em cada resposta e pode chocar ovos de novos pets?',
      'Pronto para a aventura do dia? Escolha uma matéria ali em cima!',
      'Errar faz parte do treino dos campeões! Eu sempre ajudo você a tentar de novo.',
    ];

    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    setCurrentMessage(randomTip);
  }, [customMessage, focusMode.is_active, profile?.nickname]);

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    stopSpeaking();
    speakText(currentMessage, 'pt-BR');
  };

  if (!activePet) return null;

  return (
    <aside 
      aria-label="Assistente Virtual Pet"
      className="fixed bottom-4 right-4 z-40 max-w-xs sm:max-w-sm transition-all duration-300"
    >
      <div className="flex flex-col items-end">
        {/* Balão de Fala do PET */}
        {!isMinimized && (
          <div className="pet-bubble p-3.5 mb-2 shadow-xl bg-white text-gray-800 text-xs sm:text-sm font-medium border-2 border-slate-800 animate-bounce-subtle">
            <div className="flex items-start justify-between gap-2 mb-1">
              <span className="font-pixel text-[10px] text-indigo-700 flex items-center gap-1">
                <Sparkles size={12} className="text-amber-500" />
                {activePet.name} ({activePet.species})
              </span>
              <button
                type="button"
                onClick={handleSpeak}
                className="p-1 hover:bg-slate-100 rounded text-slate-600 hover:text-indigo-600 transition-colors"
                title="Ouvir em voz alta"
              >
                <Volume2 size={15} />
              </button>
            </div>
            <p className="leading-snug">{currentMessage}</p>
          </div>
        )}

        {/* Avatar Flutuante do PET e Botão de Minimizar */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 bg-slate-900 text-white rounded-full border-2 border-amber-400 shadow hover:bg-slate-800 transition-colors"
            title={isMinimized ? 'Expandir companheiro' : 'Recolher balão'}
          >
            {isMinimized ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          <button
            type="button"
            onClick={() => setIsMinimized(!isMinimized)}
            className="cursor-pointer bg-gradient-to-b from-indigo-900 to-slate-950 p-2 rounded-2xl border-4 border-amber-400 shadow-xl hover:scale-105 active:scale-95 transition-transform"
            title={`Seu companheiro: ${activePet.name}`}
          >
            <PetIcon petId={activePet.id} size={52} mood={mood} accessoryId={equippedAccessoryId} />
          </button>
        </div>
      </div>
    </aside>
  );
}
