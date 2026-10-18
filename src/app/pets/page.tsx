'use client';

import React, { useState } from 'react';
import { useAuth } from '../../lib/auth-context';
import { PET_CATALOG, ACCESSORY_CATALOG, RARITY_LABELS } from '../../lib/content-data';
import { PetIcon } from '../../components/PetIcon';
import { PixelButton } from '../../components/PixelButton';
import { sounds } from '../../lib/sound-effects';
import { Pet, PetRarity, Accessory } from '../../lib/types';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { 
  Sparkles, Gift, Check, Star, Lock, Shirt, 
  ArrowUpCircle, ShoppingBag, ShieldCheck, Heart 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PetsPage() {
  const { 
    profile, 
    activePet, 
    userPets, 
    userAccessories, 
    equippedAccessoryId, 
    setActivePet, 
    addPoints, 
    evolvePet, 
    buyAccessory, 
    toggleEquipAccessory, 
    unlockPetFromBox,
    focusMode 
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'album' | 'loja_acessorios' | 'evolucao'>('album');
  const [selectedRarityFilter, setSelectedRarityFilter] = useState<string>('todos');
  const [isOpeningBox, setIsOpeningBox] = useState(false);
  const [boxShake, setBoxShake] = useState(false);
  const [wonPet, setWonPet] = useState<{ pet: Pet; isDuplicate: boolean; fragments: number } | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

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

  // Abertura Segura do Baú Surpresa (Lootbox 100% por Moedas do Jogo)
  const handleOpenLootbox = async () => {
    const boxCost = 100;
    if ((profile?.points || 0) < boxCost) {
      sounds.playGentleBoop();
      alert('Você precisa de 100 moedas para abrir o Baú Surpresa! Jogue minijogos de matemática ou português para conquistar mais moedas! 🪙');
      return;
    }

    sounds.playClick();
    setIsOpeningBox(true);
    setBoxShake(true);

    // Se conectado com o Supabase, chama a Stored Procedure segura do servidor
    if (isSupabaseConfigured && profile && !profile.id.startsWith('demo-')) {
      try {
        const { data, error } = await supabase.rpc('secure_open_lootbox', {
          p_student_id: profile.id,
        });

        if (!error && data) {
          const droppedPet = PET_CATALOG.find(p => p.id === data.dropped_pet_id) || PET_CATALOG[0];
          finishLootboxOpening(droppedPet, data.was_duplicate, data.fragments_converted, boxCost);
          return;
        }
      } catch {
        // Fallback para sorteio local seguro
      }
    }

    // Sorteio Local Seguro com as probabilidades transparentes
    setTimeout(() => {
      const roll = Math.random() * 100;
      let chosenRarity: PetRarity = 'normal';
      if (roll < 1.0) chosenRarity = 'mitico';
      else if (roll < 5.0) chosenRarity = 'lendario';
      else if (roll < 15.0) chosenRarity = 'epico';
      else if (roll < 40.0) chosenRarity = 'raro';
      else chosenRarity = 'normal';

      const pool = PET_CATALOG.filter(p => p.rarity === chosenRarity);
      const chosenPet = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : PET_CATALOG[0];

      const alreadyOwns = userPets.some(up => up.pet_id === chosenPet.id);
      const fragments = alreadyOwns
        ? (chosenRarity === 'mitico' ? 50 : chosenRarity === 'lendario' ? 30 : chosenRarity === 'epico' ? 15 : chosenRarity === 'raro' ? 8 : 3)
        : 0;

      finishLootboxOpening(chosenPet, alreadyOwns, fragments, boxCost);
    }, focusMode.reduced_stimuli ? 800 : 1300);
  };

  const finishLootboxOpening = (chosenPet: Pet, isDuplicate: boolean, fragments: number, boxCost: number) => {
    addPoints(-boxCost, 'lootbox_buy');
    unlockPetFromBox(chosenPet, isDuplicate, fragments);

    setBoxShake(false);
    setIsOpeningBox(false);
    setWonPet({
      pet: chosenPet,
      isDuplicate,
      fragments,
    });

    sounds.playLevelUp();
    if (!focusMode.reduced_stimuli) {
      confetti({
        particleCount: 75,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  };

  const handleEvolve = (petId: string) => {
    const res = evolvePet(petId);
    if (res.success) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      setActionNotice(res.message || 'PET evoluído com sucesso!');
      setTimeout(() => setActionNotice(null), 3500);
    } else {
      sounds.playGentleBoop();
      alert(res.message);
    }
  };

  const handleBuyAcc = (accId: string) => {
    const res = buyAccessory(accId);
    if (res.success) {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
      setActionNotice(res.message || 'Item comprado!');
      setTimeout(() => setActionNotice(null), 3000);
    } else {
      sounds.playGentleBoop();
      alert(res.message);
    }
  };

  // Contagem do Álbum
  const ownedCount = userPets.length;
  const totalPets = PET_CATALOG.length;
  const albumPercent = Math.round((ownedCount / totalPets) * 100);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="font-pixel text-xs text-amber-400">SISTEMA DE PETS & ECONOMIA</span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-bold">
              Álbum: {ownedCount}/{totalPets} ({albumPercent}%)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Meus Companheiros Mágicos
          </h1>
        </div>

        {/* Pet Ativo e Acessório Equipado */}
        <div className="flex items-center gap-3 bg-slate-900 border-2 border-amber-400/80 px-4 py-2 rounded-2xl shadow-md">
          {activePet && (
            <PetIcon 
              petId={activePet.id} 
              size={48} 
              mood="happy" 
              accessoryId={equippedAccessoryId} 
            />
          )}
          <div>
            <span className="block text-[10px] font-pixel text-slate-400">COMPANHEIRO ATIVO</span>
            <span className="font-pixel text-xs text-amber-300">{activePet?.name}</span>
            {equippedAccessoryId && (
              <span className="block text-[10px] text-pink-300 font-bold">
                Item: {ACCESSORY_CATALOG.find(a => a.id === equippedAccessoryId)?.name}
              </span>
            )}
          </div>
        </div>
      </div>

      {actionNotice && (
        <div className="mb-6 p-3 bg-emerald-950/90 border-2 border-emerald-500 rounded-xl text-emerald-300 text-xs font-bold text-center animate-bounce-subtle">
          ✨ {actionNotice}
        </div>
      )}

      {/* ============================================================== */}
      {/* BAÚ SURPRESA (LOOTBOX SEGURA POR PONTOS DO GAME) */}
      {/* ============================================================== */}
      <div className="pixel-box bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 p-5 sm:p-6 mb-8 border-purple-500 shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className={`w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-500 via-purple-600 to-pink-500 border-4 border-amber-300 flex items-center justify-center text-4xl shadow-xl shrink-0 ${boxShake ? 'animate-bounce' : 'animate-bounce-subtle'}`}>
              🎁
            </div>
            <div>
              <span className="font-pixel text-xs text-yellow-300 block mb-1">
                BAÚ SURPRESA DE PETS (100 MOEDAS)
              </span>
              <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
                Troque suas moedas conquistadas nas lições por uma chance de chocar um novo amigo! 
                <strong> PETs repetidos viram Fragmentos de Evolução</strong> para subir o nível do seu companheiro!
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

        {/* Probabilidades Transparentes */}
        <div className="mt-4 pt-3 border-t border-purple-900/60 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-pixel text-[10px] text-slate-400 flex items-center gap-1">
            <ShieldCheck size={13} className="text-emerald-400" />
            CHANCES TRANSPARENTES (SEM FRAUDE):
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

      {/* Modal de Abertura do Baú */}
      {wonPet && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="pixel-box bg-slate-900 max-w-sm w-full p-6 text-center border-amber-400 animate-bounce-subtle">
            <span className="font-pixel text-xs text-amber-300 uppercase block mb-1">
              🎉 VOCÊ TIROU NA CAIXA:
            </span>
            <div className="w-24 h-24 mx-auto my-3 flex items-center justify-center">
              <PetIcon petId={wonPet.pet.id} size={84} mood="happy" />
            </div>
            <h3 className="font-pixel text-base text-white mb-1">
              {wonPet.pet.name}
            </h3>
            <span 
              className="inline-block text-[10px] font-pixel px-2 py-0.5 rounded uppercase mb-3 font-bold" 
              style={{ backgroundColor: RARITY_LABELS[wonPet.pet.rarity].bg, color: RARITY_LABELS[wonPet.pet.rarity].color }}
            >
              {RARITY_LABELS[wonPet.pet.rarity].label}
            </span>
            <p className="text-xs text-slate-300 mb-5 leading-relaxed">
              {wonPet.isDuplicate
                ? `Você já tinha este PET! Ele foi convertido com sucesso em +${wonPet.fragments} Fragmentos de Evolução!`
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
                EQUIPAR COMO ATIVO ⭐
              </PixelButton>
              <button
                type="button"
                onClick={() => setWonPet(null)}
                className="px-3 py-2 bg-slate-800 text-slate-400 rounded-lg text-xs hover:text-white"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Abas da Economia de PETs */}
      <div className="flex items-center gap-2 mb-6 border-b-2 border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            setActiveTab('album');
          }}
          className={`font-pixel text-xs sm:text-sm px-4 py-2 rounded-lg transition-all ${
            activeTab === 'album'
              ? 'bg-amber-400 text-slate-950 shadow-[0_3px_0_#92400e]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          🐾 ÁLBUM DE PETS
        </button>

        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            setActiveTab('evolucao');
          }}
          className={`font-pixel text-xs sm:text-sm px-4 py-2 rounded-lg transition-all ${
            activeTab === 'evolucao'
              ? 'bg-cyan-400 text-slate-950 shadow-[0_3px_0_#0369a1]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          ⚡ EVOLUÇÃO ({userPets.length})
        </button>

        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            setActiveTab('loja_acessorios');
          }}
          className={`font-pixel text-xs sm:text-sm px-4 py-2 rounded-lg transition-all ${
            activeTab === 'loja_acessorios'
              ? 'bg-pink-400 text-slate-950 shadow-[0_3px_0_#9d174d]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          🎩 ACESSÓRIOS & LOJA
        </button>
      </div>

      {/* ============================================================== */}
      {/* ABA 1: ÁLBUM DE PETS (DESBLOQUEADOS VS FALTANDO) */}
      {/* ============================================================== */}
      {activeTab === 'album' && (
        <div>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {filteredPets.map(pet => {
              const userPet = userPets.find(up => up.pet_id === pet.id);
              const isOwned = Boolean(userPet);
              const isActive = activePet?.id === pet.id;
              const rarityConf = RARITY_LABELS[pet.rarity];

              return (
                <div
                  key={pet.id}
                  className={`pixel-box p-5 flex flex-col justify-between transition-all ${
                    isActive
                      ? 'bg-indigo-950/90 border-amber-400 shadow-[0_0_15px_rgba(255,215,0,0.3)]'
                      : isOwned
                      ? 'bg-slate-900/90 border-slate-700 hover:border-slate-500'
                      : 'bg-slate-950/80 border-slate-800 opacity-60'
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
                      {isActive ? (
                        <span className="font-pixel text-[9px] text-amber-300 flex items-center gap-1 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500">
                          <Check size={11} /> ATIVO
                        </span>
                      ) : isOwned ? (
                        <span className="font-pixel text-[9px] text-cyan-300">
                          Nvl {userPet?.level || 1}
                        </span>
                      ) : (
                        <span className="font-pixel text-[9px] text-slate-500 flex items-center gap-1">
                          <Lock size={10} /> BLOQUEADO
                        </span>
                      )}
                    </div>

                    <div className="w-20 h-20 mx-auto mb-3 flex items-center justify-center">
                      {isOwned ? (
                        <PetIcon 
                          petId={pet.id} 
                          size={64} 
                          mood={isActive ? 'happy' : 'idle'} 
                          accessoryId={isActive ? equippedAccessoryId : undefined} 
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-600 border border-slate-700">
                          <Lock size={24} />
                        </div>
                      )}
                    </div>

                    <h3 className="font-pixel text-center text-sm text-white mb-1">
                      {isOwned ? pet.name : '??? (Não descoberto)'}
                    </h3>
                    <p className="text-center text-[11px] text-slate-400 mb-3">
                      {pet.species}
                    </p>
                    <p className="text-xs text-slate-300 text-center leading-relaxed mb-4">
                      {isOwned ? pet.description : 'Abra o Baú Surpresa para ter a chance de desbloquear este companheiro!'}
                    </p>
                  </div>

                  <div>
                    {isOwned ? (
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
                    ) : (
                      <button
                        type="button"
                        onClick={handleOpenLootbox}
                        className="w-full py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold text-slate-400 hover:text-amber-300 transition-colors"
                      >
                        Tentar no Baú (100 🪙)
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ABA 2: EVOLUÇÃO DE PETS (NÍVEIS E FRAGMENTOS) */}
      {/* ============================================================== */}
      {activeTab === 'evolucao' && (
        <div className="space-y-5">
          <div className="pixel-box bg-slate-900/90 p-4 border-cyan-500 flex items-center justify-between">
            <div>
              <h3 className="font-pixel text-xs text-cyan-300">CENTRO DE EVOLUÇÃO</h3>
              <p className="text-xs text-slate-300">
                PETs repetidos no Baú viram Fragmentos. Use-os para subir o nível dos seus amigos e ganhar bônus de XP!
              </p>
            </div>
            <span className="text-2xl">⚡</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {userPets.map(up => {
              const petData = PET_CATALOG.find(p => p.id === up.pet_id);
              if (!petData) return null;

              const reqFrags = up.level * 15;
              const canEvolve = up.level < 5 && up.evolution_fragments >= reqFrags;

              return (
                <div key={up.id} className="pixel-box bg-slate-900 p-5 flex flex-col justify-between border-slate-700">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <PetIcon petId={petData.id} size={48} mood="happy" />
                        <div>
                          <h4 className="font-pixel text-sm text-white">{petData.name}</h4>
                          <span className="text-xs text-amber-300 font-bold">Nível {up.level} de 5</span>
                        </div>
                      </div>
                      <span className="font-pixel text-[10px] bg-cyan-950 border border-cyan-500 text-cyan-300 px-2 py-1 rounded">
                        +{up.level * 5}% XP Bônus
                      </span>
                    </div>

                    {/* Barra de Fragmentos */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs font-bold mb-1">
                        <span className="text-slate-400">Fragmentos de Evolução:</span>
                        <span className="text-cyan-300 font-pixel text-[11px]">
                          {up.evolution_fragments} / {up.level < 5 ? reqFrags : 'MAX'}
                        </span>
                      </div>
                      <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-amber-400 transition-all duration-300"
                          style={{ width: `${up.level >= 5 ? 100 : Math.min(100, (up.evolution_fragments / reqFrags) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <PixelButton
                    variant={canEvolve ? 'success' : 'dark'}
                    size="sm"
                    className="w-full"
                    disabled={!canEvolve}
                    onClick={() => handleEvolve(up.pet_id)}
                    icon={<ArrowUpCircle size={15} />}
                  >
                    {up.level >= 5
                      ? 'NÍVEL MÁXIMO ALCANÇADO 👑'
                      : canEvolve
                      ? `EVOLUIR PARA NÍVEL ${up.level + 1} ⚡`
                      : `FALTAM ${reqFrags - up.evolution_fragments} FRAGMENTOS`}
                  </PixelButton>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ABA 3: LOJA DE ACESSÓRIOS & GUARDA-ROUPA */}
      {/* ============================================================== */}
      {activeTab === 'loja_acessorios' && (
        <div className="space-y-6">
          <div className="pixel-box bg-slate-900/90 p-4 border-pink-500 flex items-center justify-between">
            <div>
              <h3 className="font-pixel text-xs text-pink-300">LOJA DE ACESSÓRIOS</h3>
              <p className="text-xs text-slate-300">
                Personalize o visual do seu PET ativo! Compre itens com suas moedas conquistadas e vista-os em tempo real.
              </p>
            </div>
            <span className="text-2xl">🎩</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {ACCESSORY_CATALOG.map(acc => {
              const isOwned = userAccessories.some(ua => ua.accessory_id === acc.id);
              const isEquipped = equippedAccessoryId === acc.id;

              return (
                <div
                  key={acc.id}
                  className={`pixel-box p-5 flex flex-col justify-between transition-all ${
                    isEquipped
                      ? 'bg-pink-950/80 border-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.3)]'
                      : 'bg-slate-900 border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-3xl">{acc.icon_name}</span>
                      <span className="font-pixel text-[9px] uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {acc.type}
                      </span>
                    </div>

                    <h4 className="font-pixel text-sm text-white mb-1">{acc.name}</h4>
                    <p className="text-xs text-slate-300 mb-3">{acc.description}</p>
                    <span className="font-pixel text-xs text-yellow-300 block mb-4">
                      {isOwned ? '✅ JÁ COMPRADO' : `${acc.price_points} 🪙 Moedas`}
                    </span>
                  </div>

                  <div>
                    {isOwned ? (
                      <PixelButton
                        variant={isEquipped ? 'primary' : 'success'}
                        size="sm"
                        className="w-full"
                        onClick={() => toggleEquipAccessory(acc.id)}
                      >
                        {isEquipped ? 'DESEQUIPAR ✖' : 'EQUIPAR NO PET ✨'}
                      </PixelButton>
                    ) : (
                      <PixelButton
                        variant="warning"
                        size="sm"
                        className="w-full"
                        onClick={() => handleBuyAcc(acc.id)}
                        icon={<ShoppingBag size={14} />}
                      >
                        COMPRAR ({acc.price_points} 🪙)
                      </PixelButton>
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
