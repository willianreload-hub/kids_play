'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth-context';
import { PET_CATALOG, ACCESSORY_CATALOG, RARITY_LABELS } from '../../lib/content-data';
import { PetIcon } from '../../components/PetIcon';
import { PixelButton } from '../../components/PixelButton';
import { sounds } from '../../lib/sound-effects';
import { Pet, PetRarity, Accessory } from '../../lib/types';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { speakText, stopSpeaking } from '../../lib/speech';
import { 
  Sparkles, Gift, Check, Star, Lock, Shirt, 
  ArrowUpCircle, ShoppingBag, ShieldCheck, Heart,
  Volume2, Utensils, Coffee, Award, Smile
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

  const [activeTab, setActiveTab] = useState<'album' | 'cuidados' | 'loja_acessorios' | 'evolucao'>('cuidados');
  const [selectedRarityFilter, setSelectedRarityFilter] = useState<string>('todos');
  const [isOpeningBox, setIsOpeningBox] = useState(false);
  const [boxShake, setBoxShake] = useState(false);
  const [wonPet, setWonPet] = useState<{ pet: Pet; isDuplicate: boolean; fragments: number } | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Estados do Sistema de Carinho & Cuidados 2.0
  const [petAffection, setPetAffection] = useState<number>(70);
  const [petMood, setPetMood] = useState<'idle' | 'happy' | 'sad'>('idle');
  const [petPhrase, setPetPhrase] = useState<string>(
    'Olá, amiguinho! Que bom ter você aqui. Fazer carinho e me alimentar me deixa muito feliz para estudar!'
  );
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; left: number; top: number; symbol: string }[]>([]);
  const [isPetting, setIsPetting] = useState(false);

  // Sincronizar Afeto do Pet Ativo
  useEffect(() => {
    if (activePet) {
      const savedAffection = localStorage.getItem(`kids_player_pet_affection_${activePet.id}`);
      if (savedAffection !== null) {
        setPetAffection(Number(savedAffection));
      } else {
        setPetAffection(70);
      }
      setPetPhrase(`Olá! Eu sou o ${activePet.name}! Estou super animado para te acompanhar nas lições de hoje!`);
    }
  }, [activePet]);

  const updateAffection = (delta: number) => {
    setPetAffection(prev => {
      const nextVal = Math.min(100, Math.max(0, prev + delta));
      if (activePet) {
        localStorage.setItem(`kids_player_pet_affection_${activePet.id}`, String(nextVal));
      }
      return nextVal;
    });
  };

  const spawnFloatingParticles = (symbol: string, count = 5) => {
    const particles = Array.from({ length: count }).map((_, i) => ({
      id: Date.now() + i + Math.random(),
      left: 20 + Math.random() * 60,
      top: 15 + Math.random() * 40,
      symbol,
    }));
    setFloatingHearts(prev => [...prev, ...particles]);
    setTimeout(() => {
      setFloatingHearts(prev => prev.filter(p => !particles.some(np => np.id === p.id)));
    }, 1200);
  };

  const handlePetAction = (action: 'carinho' | 'fruta' | 'biscoito' | 'suco') => {
    if (!activePet) return;

    if (action === 'carinho') {
      sounds.playPetPurr();
      setIsPetting(true);
      setPetMood('happy');
      updateAffection(8);
      spawnFloatingParticles('💖', 6);

      const affectionPhrases = [
        `*Purrrr...* ${activePet.name} ronrona bem baixinho e encosta o focinho na sua mão! Que delícia!`,
        `Que carinho quentinho! Meu coração fica radiante quando estudamos juntos!`,
        `Você é o melhor amigo de aventuras do mundo! Ganhei energia extra para as próximas questões!`,
        `Com um amigo tão legal, qualquer desafio escolar vira uma gostosa brincadeira!`,
      ];
      const randomPhrase = affectionPhrases[Math.floor(Math.random() * affectionPhrases.length)];
      setPetPhrase(randomPhrase);

      setTimeout(() => {
        setIsPetting(false);
        setPetMood('idle');
      }, 1400);

      if (petAffection >= 92) {
        confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
      }
      return;
    }

    // Ações de Alimentação com Frutas/Comidinhas
    const cost = 5;
    if ((profile?.points || 0) < cost) {
      sounds.playGentleBoop();
      alert(`Você precisa de ${cost} moedas para dar este lanchinho! Jogue minijogos para conquistar mais moedas! 🪙`);
      return;
    }

    addPoints(-cost, `pet_feed_${action}`);
    sounds.playSuccess();
    setPetMood('happy');
    updateAffection(15);

    if (action === 'fruta') {
      spawnFloatingParticles('🍎', 5);
      setPetPhrase('Nham nham nham! Frutinha da Sabedoria fresquinha! 🍎 O suco do saber me deu ânimo total para ler e calcular!');
    } else if (action === 'biscoito') {
      spawnFloatingParticles('🍪', 5);
      setPetPhrase('Croc croc croc! Biscoitinho crocante com formato de números! 🍪 Minha mente está afiada para a tabuada!');
    } else if (action === 'suco') {
      spawnFloatingParticles('🧃', 5);
      setPetPhrase('Gole gole gole! Que suco mágico refrescante! 🧃 Sinto que nossa dupla é invencível nas perguntas de ciências!');
    }

    setTimeout(() => {
      setPetMood('idle');
    }, 1500);
  };

  const handleSpeakDialogue = () => {
    stopSpeaking();
    speakText(petPhrase, 'pt-BR');
  };

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

        {/* Pet Ativo, Afeto e Acessório Equipado */}
        <div className="flex items-center gap-3 bg-slate-900 border-2 border-amber-400/80 px-4 py-2.5 rounded-2xl shadow-md">
          {activePet && (
            <div className="relative">
              <PetIcon 
                petId={activePet.id} 
                size={48} 
                mood={petMood} 
                accessoryId={equippedAccessoryId} 
              />
              {petAffection >= 90 && (
                <span className="absolute -top-1.5 -right-1.5 text-xs animate-bounce">💖</span>
              )}
            </div>
          )}
          <div>
            <span className="block text-[10px] font-pixel text-slate-400">COMPANHEIRO ATIVO</span>
            <div className="flex items-center gap-2">
              <span className="font-pixel text-xs text-amber-300">{activePet?.name}</span>
              <span className="text-[10px] bg-pink-950 text-pink-300 border border-pink-700 font-bold px-1.5 py-0.2 rounded-full">
                💖 {petAffection}%
              </span>
            </div>
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
      <div className="flex items-center gap-2 mb-6 border-b-2 border-slate-800 pb-3 overflow-x-auto">
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            setActiveTab('cuidados');
          }}
          className={`font-pixel text-xs sm:text-sm px-4 py-2 rounded-lg transition-all shrink-0 ${
            activeTab === 'cuidados'
              ? 'bg-rose-500 text-white shadow-[0_3px_0_#9f1239]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          💖 CUIDADOS & CARINHO
        </button>

        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            setActiveTab('album');
          }}
          className={`font-pixel text-xs sm:text-sm px-4 py-2 rounded-lg transition-all shrink-0 ${
            activeTab === 'album'
              ? 'bg-amber-400 text-slate-950 shadow-[0_3px_0_#92400e]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          🐾 ÁLBUM ({ownedCount}/{totalPets})
        </button>

        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            setActiveTab('evolucao');
          }}
          className={`font-pixel text-xs sm:text-sm px-4 py-2 rounded-lg transition-all shrink-0 ${
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
          className={`font-pixel text-xs sm:text-sm px-4 py-2 rounded-lg transition-all shrink-0 ${
            activeTab === 'loja_acessorios'
              ? 'bg-pink-400 text-slate-950 shadow-[0_3px_0_#9d174d]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          🎩 ACESSÓRIOS & LOJA
        </button>
      </div>

      {/* ============================================================== */}
      {/* ABA NOVO: CUIDADOS & CARINHO (INTERAÇÃO AFETIVA 2.0) */}
      {/* ============================================================== */}
      {activeTab === 'cuidados' && (
        <div className="space-y-6">
          {activePet ? (
            <div className="pixel-box bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 p-6 border-pink-500 shadow-2xl relative overflow-hidden">
              
              {/* Partículas Flutuantes de Carinho / Comida */}
              {floatingHearts.map(p => (
                <span
                  key={p.id}
                  className="absolute pointer-events-none text-2xl animate-float-up z-20"
                  style={{ left: `${p.left}%`, top: `${p.top}%` }}
                >
                  {p.symbol}
                </span>
              ))}

              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                
                {/* Visual Interativo do Pet com Efeito de Clique */}
                <div className="flex flex-col items-center text-center">
                  <div className="relative group">
                    <button
                      type="button"
                      onClick={() => handlePetAction('carinho')}
                      title="Clique para fazer carinho!"
                      className={`relative p-5 rounded-3xl bg-slate-900/90 border-4 border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.35)] transition-all cursor-pointer ${
                        isPetting ? 'scale-110 -rotate-3' : 'hover:scale-105 active:scale-95'
                      }`}
                    >
                      <PetIcon
                        petId={activePet.id}
                        size={110}
                        mood={petMood}
                        accessoryId={equippedAccessoryId}
                      />
                      <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-rose-500 text-white font-pixel text-[9px] px-2.5 py-0.5 rounded-full border border-rose-300 shadow">
                        💖 Toque aqui!
                      </span>
                    </button>
                  </div>

                  <h3 className="font-pixel text-base text-amber-300 mt-4 mb-0.5">
                    {activePet.name}
                  </h3>
                  <span className="text-xs text-slate-400">
                    {activePet.species} • {RARITY_LABELS[activePet.rarity].label}
                  </span>
                </div>

                {/* Diálogo Afetivo e Medidor de Vínculo */}
                <div className="flex-1 w-full space-y-4">
                  {/* Balão de Fala do Pet */}
                  <div className="relative p-4 rounded-2xl bg-slate-900 border-2 border-indigo-400/80 shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-pixel text-[11px] text-pink-400 flex items-center gap-1">
                        <Sparkles size={14} className="text-amber-400" />
                        Mensagem do seu Amigo:
                      </span>
                      <button
                        type="button"
                        onClick={handleSpeakDialogue}
                        className="flex items-center gap-1 px-2.5 py-1 bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 rounded-lg text-xs font-bold transition-colors border border-indigo-500/50"
                        title="Ouvir mensagem em voz alta"
                      >
                        <Volume2 size={14} />
                        <span>Ouvir</span>
                      </button>
                    </div>
                    <p className="text-sm text-slate-200 leading-relaxed font-medium">
                      &quot;{petPhrase}&quot;
                    </p>
                  </div>

                  {/* Barra de Afeto & Vínculo */}
                  <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700">
                    <div className="flex items-center justify-between text-xs font-bold mb-2">
                      <span className="font-pixel text-[11px] text-rose-300 flex items-center gap-1.5">
                        <Heart size={14} className="text-rose-400 fill-rose-500" />
                        NÍVEL DE AMIZADE: {petAffection}%
                      </span>
                      <span className="text-[11px] text-amber-300 font-bold">
                        {petAffection >= 90
                          ? '👑 Vínculo Mestre (+15% XP)'
                          : petAffection >= 70
                          ? '🌟 Grande Amigo (+10% XP)'
                          : petAffection >= 40
                          ? '😊 Bom Companheiro (+5% XP)'
                          : '💤 Com Sono (Precisa de Carinho)'}
                      </span>
                    </div>

                    <div className="w-full h-4 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-rose-500 via-pink-400 to-amber-300 transition-all duration-500 shadow-sm"
                        style={{ width: `${petAffection}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-slate-400 mt-2">
                      Dica pedagógica: Crianças que cuidam de seus companheiros ganham bônus de XP após cada bateria de exercícios concluída!
                    </p>
                  </div>

                  {/* Painel de Cuidados: Botões de Interação */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => handlePetAction('carinho')}
                      className="flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-b from-rose-600 to-pink-700 hover:from-rose-500 hover:to-pink-600 border-2 border-rose-300 shadow-md active:scale-95 transition-all text-white font-bold"
                    >
                      <span className="text-2xl mb-1">💖</span>
                      <span className="font-pixel text-[10px]">CARINHO</span>
                      <span className="text-[9px] text-rose-200 mt-0.5">Grátis (+8 Afeto)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePetAction('fruta')}
                      className="flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-b from-red-600 to-orange-700 hover:from-red-500 hover:to-orange-600 border-2 border-amber-300 shadow-md active:scale-95 transition-all text-white font-bold"
                    >
                      <span className="text-2xl mb-1">🍎</span>
                      <span className="font-pixel text-[10px]">FRUTINHA</span>
                      <span className="text-[9px] text-amber-200 mt-0.5">5 🪙 (+15 Afeto)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePetAction('biscoito')}
                      className="flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-b from-amber-600 to-yellow-700 hover:from-amber-500 hover:to-yellow-600 border-2 border-yellow-300 shadow-md active:scale-95 transition-all text-white font-bold"
                    >
                      <span className="text-2xl mb-1">🍪</span>
                      <span className="font-pixel text-[10px]">BISCOITO</span>
                      <span className="text-[9px] text-amber-100 mt-0.5">5 🪙 (+15 Afeto)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePetAction('suco')}
                      className="flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-b from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 border-2 border-cyan-300 shadow-md active:scale-95 transition-all text-white font-bold"
                    >
                      <span className="text-2xl mb-1">🧃</span>
                      <span className="font-pixel text-[10px]">SUCO SABER</span>
                      <span className="text-[9px] text-cyan-100 mt-0.5">5 🪙 (+15 Afeto)</span>
                    </button>
                  </div>

                </div>

              </div>
            </div>
          ) : (
            <div className="pixel-box bg-slate-900 p-8 text-center border-slate-700">
              <p className="text-slate-300 mb-4">Você ainda não tem um Pet Ativo escolhido!</p>
              <PixelButton
                variant="primary"
                size="md"
                onClick={() => setActiveTab('album')}
              >
                ESCOLHER NO ÁLBUM 🐾
              </PixelButton>
            </div>
          )}

          {/* Troca Rápida de Pet para Carinho */}
          <div>
            <h4 className="font-pixel text-xs text-slate-300 mb-3 flex items-center gap-1.5">
              <span>🔄</span> SELECIONAR OUTRO PET PARA CUIDAR:
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {userPets.map(up => {
                const pet = PET_CATALOG.find(p => p.id === up.pet_id);
                if (!pet) return null;
                const isSelected = activePet?.id === pet.id;
                return (
                  <button
                    key={up.id}
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setActivePet(pet);
                    }}
                    className={`p-3 rounded-xl border-2 flex flex-col items-center text-center transition-all ${
                      isSelected
                        ? 'bg-purple-950 border-amber-400 shadow-md'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-600 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <PetIcon petId={pet.id} size={40} mood={isSelected ? 'happy' : 'idle'} />
                    <span className="font-pixel text-[10px] text-white mt-1.5 truncate max-w-full">
                      {pet.name}
                    </span>
                    <span className="text-[9px] text-amber-400 font-bold">
                      Nvl {up.level}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

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
