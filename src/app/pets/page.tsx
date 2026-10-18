'use client';

import React, { useState } from 'react';
import { useAuth } from '../../lib/auth-context';
import { PET_CATALOG, RARITY_LABELS } from '../../lib/content-data';
import { PetIcon } from '../../components/PetIcon';
import { PixelButton } from '../../components/PixelButton';
import { sounds } from '../../lib/sound-effects';
import { Pet, PetRarity } from '../../lib/types';
import { Sparkles, Gift, ShieldAlert, Check, Star, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PetsPage() {
  const { profile, activePet, setActivePet, addPoints } = useAuth();
  const [selectedRarityFilter, setSelectedRarityFilter] = useState<string>('todos');
  const [isOpeningBox, setIsOpeningBox] = useState(false);
  const [wonPet, setWonPet] = useState<{ pet: Pet; isDuplicate: boolean; fragments: number } | null>(null);

  // Chances transparentes da Caixa Surpresa
  const dropChances = [
    { rarity: 'normal', name: 'Normal', chance: '60%', color: 'text-slate-300' },
    { rarity: 'raro', name: 'Raro', chance: '25%', color: 'text-cyan-400' },
    { rarity: 'epico', name: 'Épico', chance: '10%', color: 'text-purple-400' },
    { rarity: 'lendario', name: 'Lendário', chance: '4%', color: 'text-amber-400' },
    { rarity: 'mitico', name: 'Mítico', chance: '1%', color: 'text-rose-400' },
  ];

  const filteredPets = selectedRarityFilter === 'todos'
    ? PET_CATALOG
    : PET_CATALOG.filter(p => p.rarity === selectedRarityFilter);

  // Abertura do Baú Surpresa (Sorteio por pontos do game, 0 dinheiro real)
  const handleOpenLootbox = () => {
    const boxCost = 100;
    if ((profile?.points || 0) < boxCost) {
      sounds.playGentleBoop();
      alert('Você precisa de 100 pontos para abrir o Baú Surpresa! Complete algumas tarefas de matemática ou português para ganhar mais pontos! 🪙');
      return;
    }

    sounds.playClick();
    setIsOpeningBox(true);
    addPoints(-boxCost, 'lootbox_buy');

    setTimeout(() => {
      // Simulação das chances transparentes
      const roll = Math.random() * 100;
      let chosenRarity: PetRarity = 'normal';
      if (roll < 1) chosenRarity = 'mitico';
      else if (roll < 5) chosenRarity = 'lendario';
      else if (roll < 15) chosenRarity = 'epico';
      else if (roll < 40) chosenRarity = 'raro';
      else chosenRarity = 'normal';

      const pool = PET_CATALOG.filter(p => p.rarity === chosenRarity);
      const chosenPet = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : PET_CATALOG[0];

      const isDup = chosenPet.id === activePet?.id;
      const fragments = isDup ? 15 : 0;

      setWonPet({
        pet: chosenPet,
        isDuplicate: isDup,
        fragments,
      });

      setIsOpeningBox(false);
      sounds.playLevelUp();
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
      });
    }, 1400);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="font-pixel text-xs text-amber-400">COLEÇÃO DE COMPANHEIROS</span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-bold">
              Álbum Oficial
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Meus PETs Mágicos
          </h1>
        </div>

        {/* Pet Ativo Destacado */}
        <div className="flex items-center gap-3 bg-slate-900 border-2 border-amber-400/70 px-4 py-2 rounded-2xl shadow-md">
          {activePet && <PetIcon petId={activePet.id} size={42} mood="happy" />}
          <div>
            <span className="block text-[10px] font-pixel text-slate-400">COMPANHEIRO ATIVO</span>
            <span className="font-pixel text-xs text-amber-300">{activePet?.name}</span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* ÁREA DO BAÚ SURPRESA (LOOTBOX POR PONTOS DO JOGO) */}
      {/* ============================================================== */}
      <div className="pixel-box bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 p-6 mb-8 border-purple-500">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-purple-600 border-4 border-amber-300 flex items-center justify-center text-3xl shadow-lg shrink-0 animate-bounce-subtle">
              🎁
            </div>
            <div>
              <span className="font-pixel text-xs text-yellow-300 block mb-1">
                BAÚ SURPRESA DE PETS (100 PONTOS)
              </span>
              <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
                Troque seus pontos conquistados no reforço escolar por uma chance de chocar um novo amigo! PETs repetidos viram fragmentos de evolução.
              </p>
            </div>
          </div>

          <div className="text-center shrink-0">
            <PixelButton
              variant="warning"
              size="md"
              onClick={handleOpenLootbox}
              disabled={isOpeningBox}
              icon={<Gift size={16} />}
            >
              {isOpeningBox ? 'ABRINDO BAÚ...' : 'ABRIR BAÚ (100 🪙)'}
            </PixelButton>
            <span className="block text-[10px] text-slate-400 mt-1.5 font-bold">
              Seu Saldo: {profile?.points || 0} Moedas
            </span>
          </div>
        </div>

        {/* Transparência de Chances (Obrigatório por Ética e Regras de Proteção) */}
        <div className="mt-4 pt-3 border-t border-purple-900/60 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-pixel text-[10px] text-slate-400">
            📊 CHANCES TRANSPARENTES:
          </span>
          <div className="flex items-center gap-3 flex-wrap">
            {dropChances.map(c => (
              <span key={c.rarity} className="text-[11px] font-bold text-slate-300">
                <span className={c.color}>{c.name}</span>: {c.chance}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Modal / Alerta de Pet Ganho */}
      {wonPet && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="pixel-box bg-slate-900 max-w-sm w-full p-6 text-center border-amber-400 animate-bounce-subtle">
            <span className="font-pixel text-xs text-amber-300 uppercase block mb-2">
              🎉 VOCÊ DESBLOQUEOU UM PET!
            </span>
            <div className="w-24 h-24 mx-auto my-3 flex items-center justify-center">
              <PetIcon petId={wonPet.pet.id} size={84} mood="happy" />
            </div>
            <h3 className="font-pixel text-base text-white mb-1">
              {wonPet.pet.name}
            </h3>
            <span className="inline-block text-[10px] font-pixel px-2 py-0.5 rounded uppercase mb-3" style={{ backgroundColor: RARITY_LABELS[wonPet.pet.rarity].bg, color: RARITY_LABELS[wonPet.pet.rarity].color }}>
              {RARITY_LABELS[wonPet.pet.rarity].label}
            </span>
            <p className="text-xs text-slate-300 mb-4">
              {wonPet.isDuplicate
                ? `Você já tinha este PET! Ele foi convertido em +${wonPet.fragments} Fragmentos de Evolução.`
                : wonPet.pet.description}
            </p>

            <div className="flex items-center gap-2">
              <PixelButton
                variant="primary"
                size="sm"
                className="w-full"
                onClick={() => {
                  sounds.playClick();
                  setActivePet(wonPet.pet);
                  setWonPet(null);
                }}
              >
                EQUIPAR COMO COMPANHEIRO ✨
              </PixelButton>
              <button
                type="button"
                onClick={() => setWonPet(null)}
                className="px-3 py-2 bg-slate-800 text-slate-400 rounded-lg text-xs"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filtros por Raridade */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6">
        <span className="font-pixel text-xs text-slate-400 shrink-0">Filtrar:</span>
        {['todos', 'normal', 'raro', 'epico', 'lendario', 'mitico'].map(r => (
          <button
            key={r}
            type="button"
            onClick={() => {
              sounds.playClick();
              setSelectedRarityFilter(r);
            }}
            className={`font-pixel text-[11px] px-3 py-1.5 rounded-lg border-2 uppercase shrink-0 transition-all ${
              selectedRarityFilter === r
                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Álbum de PETs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {filteredPets.map(pet => {
          const isActive = activePet?.id === pet.id;
          const rarityConf = RARITY_LABELS[pet.rarity];

          return (
            <div
              key={pet.id}
              className={`pixel-box p-5 flex flex-col justify-between transition-all ${
                isActive
                  ? 'bg-indigo-950/90 border-amber-400 shadow-[0_0_15px_rgba(255,215,0,0.3)]'
                  : 'bg-slate-900/90 border-slate-700 hover:border-slate-500'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="font-pixel text-[9px] px-2 py-0.5 rounded uppercase font-bold"
                    style={{ backgroundColor: rarityConf.bg, color: rarityConf.color }}
                  >
                    {rarityConf.label}
                  </span>
                  {isActive && (
                    <span className="font-pixel text-[9px] text-amber-300 flex items-center gap-1 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500">
                      <Check size={11} /> ATIVO
                    </span>
                  )}
                </div>

                <div className="w-20 h-20 mx-auto mb-3 flex items-center justify-center">
                  <PetIcon petId={pet.id} size={64} mood={isActive ? 'happy' : 'idle'} />
                </div>

                <h3 className="font-pixel text-center text-sm text-white mb-1">
                  {pet.name}
                </h3>
                <p className="text-center text-[11px] text-slate-400 mb-3">
                  {pet.species}
                </p>
                <p className="text-xs text-slate-300 text-center leading-relaxed mb-4">
                  {pet.description}
                </p>
              </div>

              <div>
                <PixelButton
                  variant={isActive ? 'success' : 'dark'}
                  size="sm"
                  className="w-full"
                  disabled={isActive}
                  onClick={() => {
                    sounds.playSuccess();
                    setActivePet(pet);
                  }}
                >
                  {isActive ? 'COMPANHEIRO ATIVO ⭐' : 'ESCOLHER COMO ATIVO'}
                </PixelButton>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
