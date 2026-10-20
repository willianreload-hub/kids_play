'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/auth-context';
import { PetIcon } from '../../components/PetIcon';
import { PixelButton } from '../../components/PixelButton';
import { sounds } from '../../lib/sound-effects';
import { 
  Home, Sparkles, Heart, Trash2, RotateCcw, 
  Palette, Camera, Coins, ArrowLeft, Info, Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface VillageTile {
  floor: string;
  item: string | null;
}

interface CatalogItem {
  id: string;
  name: string;
  icon: string;
  category: 'pisos' | 'moveis' | 'estudo' | 'jardim';
  price: number;
  description: string;
}

const ITEMS_CATALOG: CatalogItem[] = [
  // Pisos
  { id: 'floor_grama', name: 'Grama Macia', icon: '🌱', category: 'pisos', price: 0, description: 'Grama verde e fresquinha para passear!' },
  { id: 'floor_madeira', name: 'Tablado de Madeira', icon: '🪵', category: 'pisos', price: 10, description: 'Piso rústico e aconchegante.' },
  { id: 'floor_pedra', name: 'Calçada de Pedra', icon: '🧱', category: 'pisos', price: 15, description: 'Caminho firme feito com pedras mineradas.' },
  { id: 'floor_cristal', name: 'Piso de Cristal', icon: '💎', category: 'pisos', price: 30, description: 'Brilha com reflexos mágicos de estrelas!' },
  { id: 'floor_agua', name: 'Lago Cristalino', icon: '🌊', category: 'pisos', price: 20, description: 'Água pura e refrescante para os pets.' },

  // Móveis
  { id: 'item_cama', name: 'Caminha Fofa', icon: '🛏️', category: 'moveis', price: 25, description: 'Onde seu companheiro tira uma soneca.' },
  { id: 'item_tigela', name: 'Tigela de Frutinhas', icon: '🥣', category: 'moveis', price: 15, description: 'Sempre cheia de maçãs da sabedoria.' },
  { id: 'item_casinha', name: 'Casinha de Madeira', icon: '🏠', category: 'moveis', price: 40, description: 'Abrigo seguro e divertido.' },
  { id: 'item_tapete', name: 'Tapete Mágico', icon: '🧶', category: 'moveis', price: 20, description: 'Aquece as patinhas nos dias frios.' },

  // Estudo & Magia
  { id: 'item_estante', name: 'Estante de Livros', icon: '📚', category: 'estudo', price: 30, description: 'Livros de historinhas e matemática.' },
  { id: 'item_caldeirao', name: 'Caldeirão Alquímico', icon: '🧪', category: 'estudo', price: 35, description: 'Para criar poções de concentração.' },
  { id: 'item_telescopio', name: 'Telescópio Astral', icon: '🔭', category: 'estudo', price: 45, description: 'Observa constelações e planetas!' },
  { id: 'item_trofeu', name: 'Troféu Imperial', icon: '🏆', category: 'estudo', price: 50, description: 'Símbolo do aluno mais dedicado da turma.' },
  { id: 'item_fogueira', name: 'Lareira Quentinha', icon: '🔥', category: 'estudo', price: 35, description: 'Ilumina as noites de estudo na vila.' },

  // Jardim & Natureza
  { id: 'item_arvore', name: 'Pinheiro Encantado', icon: '🌲', category: 'jardim', price: 25, description: 'Árvore nativa que atrai passarinhos.' },
  { id: 'item_flores', name: 'Canteiro de Flores', icon: '🌸', category: 'jardim', price: 15, description: 'Flores coloridas e cheirosas.' },
  { id: 'item_cogumelo', name: 'Cogumelo Mágico', icon: '🍄', category: 'jardim', price: 20, description: 'Solta faíscas brilhantes ao toque.' },
  { id: 'item_fonte', name: 'Fonte dos Desejos', icon: '⛲', category: 'jardim', price: 40, description: 'Jorra água mágica sem parar.' },
];

const GRID_COLS = 8;
const GRID_ROWS = 6;
const TOTAL_TILES = GRID_COLS * GRID_ROWS;

// Abas do catálogo de construção da vila
const CATEGORY_TABS: { id: 'pisos' | 'moveis' | 'estudo' | 'jardim'; label: string }[] = [
  { id: 'moveis', label: '🪑 Móveis' },
  { id: 'estudo', label: '📚 Estudos' },
  { id: 'pisos', label: '🧱 Pisos' },
  { id: 'jardim', label: '🌸 Jardim' },
];

// Itens que já vêm no kit inicial da vila (a criança possui tudo do modelo padrão)
const DEFAULT_LAYOUT_OWNED = [
  'floor_madeira', 'floor_pedra', 'item_cama', 'item_tigela',
  'item_estante', 'item_trofeu', 'item_arvore', 'item_fonte',
];

export default function VilaPage() {
  const { profile, activePet, addPoints } = useAuth();

  const [activeCategory, setActiveCategory] = useState<'pisos' | 'moveis' | 'estudo' | 'jardim'>('moveis');
  const [selectedTool, setSelectedTool] = useState<string>('item_cama');
  const [isEraser, setIsEraser] = useState(false);
  const [petPos, setPetPos] = useState({ col: 3, row: 2 });
  const [petMood, setPetMood] = useState('Que lugar gostoso para relaxar!');
  const [showHearts, setShowHearts] = useState(false);
  const [placeFeedback, setPlaceFeedback] = useState<'saved' | 'bought' | 'blocked' | null>(null);

  // Inicializa vila do LocalStorage ou layout inicial padrão
  const [grid, setGrid] = useState<VillageTile[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kids_player_pet_village');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    // Vila padrão inicial fofinha
    return Array.from({ length: TOTAL_TILES }, (_, i) => {
      const col = i % GRID_COLS;
      const row = Math.floor(i / GRID_COLS);

      let floor = 'floor_grama';
      let item: string | null = null;

      // Tablado no canto
      if (col >= 2 && col <= 5 && row >= 1 && row <= 3) {
        floor = 'floor_madeira';
      }
      if (col === 3 && row === 1) item = 'item_cama';
      if (col === 4 && row === 1) item = 'item_tigela';
      if (col === 2 && row === 2) item = 'item_estante';
      if (col === 5 && row === 2) item = 'item_trofeu';
      if (col === 0 && row === 0) item = 'item_arvore';
      if (col === 7 && row === 0) item = 'item_arvore';
      if (col === 7 && row === 5) item = 'item_fonte';
      if (col >= 6 && row >= 4) floor = 'floor_pedra';

      return { floor, item };
    });
  });

  // Itens já adquiridos com moedas de estudo (economia ética do Kids-Player)
  const [ownedItems, setOwnedItems] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kids_player_village_owned');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    // Kit inicial: pisos gratuitos + tudo que já vem no modelo padrão da vila
    return [
      ...ITEMS_CATALOG.filter(it => it.price === 0).map(it => it.id),
      ...DEFAULT_LAYOUT_OWNED,
    ];
  });

  // Salvar no localStorage sempre que a grade mudar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('kids_player_pet_village', JSON.stringify(grid));
    }
  }, [grid]);

  // Salvar os itens adquiridos no localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('kids_player_village_owned', JSON.stringify(ownedItems));
    }
  }, [ownedItems]);

  // Movimentação suave autônoma do Pet na Vila a cada 6 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      const nextCol = Math.max(1, Math.min(GRID_COLS - 2, petPos.col + (Math.random() > 0.5 ? 1 : -1)));
      const nextRow = Math.max(1, Math.min(GRID_ROWS - 2, petPos.row + (Math.random() > 0.5 ? 1 : -1)));
      setPetPos({ col: nextCol, row: nextRow });

      const petPhrases = [
        'Adorei essa decoração!',
        'Que grama macia para descansar!',
        'Depois vou ler um livro na estante!',
        'Você é o melhor amigo de todos!',
        'Nossa vila é a mais bonita do reino!',
      ];
      setPetMood(petPhrases[Math.floor(Math.random() * petPhrases.length)]);
    }, 6000);

    return () => clearInterval(interval);
  }, [petPos]);

  // Aplica a ferramenta atual em uma célula da grade
  const applyToolToTile = (index: number) => {
    // PÁ / LIMPADOR: remove item ou devolve o piso de grama (sem custo)
    if (isEraser) {
      sounds.playWoodPlace();
      setGrid(prev => {
        const next = [...prev];
        const target = { ...next[index] };
        if (target.item) {
          target.item = null;
        } else {
          target.floor = 'floor_grama';
        }
        next[index] = target;
        return next;
      });
      setPlaceFeedback('saved');
      setTimeout(() => setPlaceFeedback(null), 1200);
      return;
    }

    const selectedItem = ITEMS_CATALOG.find(it => it.id === selectedTool);
    if (!selectedItem) return;

    // Primeira colocação de um item novo: compra com as moedas conquistadas estudando
    if (!ownedItems.includes(selectedItem.id)) {
      const balance = profile?.points ?? 0;
      if (selectedItem.price > balance) {
        setPetMood(
          `Ops! Faltam ${selectedItem.price - balance} moedinhas para o ${selectedItem.name}. Vença minijogos e missões para juntar mais!`
        );
        setPlaceFeedback('blocked');
        setTimeout(() => setPlaceFeedback(null), 1600);
        return;
      }

      addPoints(-selectedItem.price, `vila_buy_${selectedItem.id}`);
      setOwnedItems(prev => [...prev, selectedItem.id]);
      setPlaceFeedback('bought');
    } else {
      sounds.playWoodPlace();
      setPlaceFeedback('saved');
    }

    setGrid(prev => {
      const next = [...prev];
      const target = { ...next[index] };
      if (selectedItem.category === 'pisos') {
        target.floor = selectedItem.id;
      } else {
        target.item = selectedItem.id;
      }
      next[index] = target;
      return next;
    });

    setTimeout(() => setPlaceFeedback(null), 1400);
  };

  // Carinho no Pet
  const handlePetPet = () => {
    sounds.playPetPurr();
    setShowHearts(true);
    setPetMood('Ronrom... Muito obrigado pelo carinho! ❤️');
    setTimeout(() => setShowHearts(false), 2000);

    confetti({
      particleCount: 25,
      spread: 50,
      origin: { y: 0.5 },
      colors: ['#f43f5e', '#ec4899', '#fbbf24']
    });
  };

  // Limpar toda a Vila
  const handleResetVillage = () => {
    if (!confirm('Deseja recriar o jardim da vila com o modelo padrão?')) return;
    sounds.playClick();
    localStorage.removeItem('kids_player_pet_village');
    window.location.reload();
  };

  // Ícone visual do piso
  const getFloorClass = (floorId: string) => {
    switch (floorId) {
      case 'floor_madeira':
        return 'bg-amber-900/90 border-amber-800';
      case 'floor_pedra':
        return 'bg-slate-700 border-slate-600';
      case 'floor_cristal':
        return 'bg-cyan-950/90 border-cyan-500 shadow-[inset_0_0_8px_rgba(6,182,212,0.4)]';
      case 'floor_agua':
        return 'bg-blue-600/80 border-blue-400 animate-pulse';
      case 'floor_grama':
      default:
        return 'bg-emerald-900/90 border-emerald-700';
    }
  };

  const getItemEmoji = (itemId: string | null) => {
    if (!itemId) return null;
    const item = ITEMS_CATALOG.find(i => i.id === itemId);
    return item ? item.icon : null;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/pets" className="text-xs font-pixel text-slate-400 hover:text-white flex items-center gap-1">
              <ArrowLeft size={13} /> VOLTAR AOS PETS
            </Link>
            <span className="text-slate-600">•</span>
            <span className="font-pixel text-xs text-amber-400">ESPAÇO CRIATIVO 2.0</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            A Vila Mágica dos Pets 🏡
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
            Construa e decore o cantinho favorito de <strong>{activePet?.name || 'seu companheiro'}</strong> com os materiais que você conquista estudando!
          </p>
        </div>

        {/* STATUS DO PET & MOEDAS */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 border-2 border-amber-500/80 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <Coins className="text-yellow-400 w-4 h-4" />
            <span className="font-pixel text-xs text-yellow-300">
              {profile?.points || 150} Moedas
            </span>
          </div>

          <button
            type="button"
            onClick={handleResetVillage}
            className="p-2 bg-slate-800 hover:bg-slate-700 border-2 border-slate-700 text-slate-300 hover:text-white rounded-xl transition-all"
            title="Recriar Modelo Inicial"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* ÁREA PRINCIPAL: VILA (ISOMÉTRICA RETRÔ) + INVENTÁRIO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LADO ESQUERDO: GRADE INTERATIVA DA VILA (8 COLUNAS X 6 LINHAS) */}
        <div className="lg:col-span-8 pixel-box bg-slate-950/90 p-5 border-emerald-500 shadow-2xl relative">
          
          {/* TOPO DA VILA: DIÁLOGO DO PET COMPANHEIRO */}
          <div className="flex items-center justify-between mb-4 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handlePetPet}
                className="w-12 h-12 shrink-0 bg-slate-800 p-1 rounded-xl border border-amber-400/80 hover:scale-105 transition-transform relative"
                title="Fazer Carinho no Pet"
              >
                <PetIcon petId={activePet?.id || 'pipoca_raposa'} size={40} />
                {showHearts && (
                  <span className="absolute -top-3 -right-2 text-lg animate-bounce">💖</span>
                )}
              </button>
              <div>
                <span className="font-pixel text-[11px] text-amber-300 block">
                  {activePet?.name || 'Seu Pet'}:
                </span>
                <p className="text-xs text-slate-200">
                  &ldquo;{petMood}&rdquo;
                </p>
              </div>
            </div>

            <PixelButton
              variant="warning"
              size="sm"
              onClick={handlePetPet}
              icon={<Heart size={14} className="fill-current text-rose-500" />}
            >
              FAZER CARINHO 💖
            </PixelButton>
          </div>

          {/* GRADE DA VILA (8 COLUNAS X 6 LINHAS) */}
          <div className="grid grid-cols-8 gap-2 p-3 bg-emerald-950/40 rounded-2xl border-2 border-emerald-600/60 shadow-inner relative overflow-hidden">
            
            {grid.map((tile, idx) => {
              const col = idx % GRID_COLS;
              const row = Math.floor(idx / GRID_COLS);
              const isPetHere = petPos.col === col && petPos.row === row;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyToolToTile(idx)}
                  className={`aspect-square rounded-xl border-2 transition-all flex items-center justify-center relative hover:scale-105 hover:z-10 ${getFloorClass(tile.floor)}`}
                  title={`Posição [${col + 1}, ${row + 1}]`}
                >
                  {/* Item decorativo / móvel */}
                  {tile.item && (
                    <span className="text-2xl sm:text-3xl drop-shadow-md select-none animate-scale-up">
                      {getItemEmoji(tile.item)}
                    </span>
                  )}

                  {/* O Pet passeando nesta célula */}
                  {isPetHere && (
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePetPet();
                      }}
                      className="absolute inset-0 flex items-center justify-center z-20 cursor-pointer animate-bounce-subtle"
                    >
                      <div className="w-10 h-10 p-0.5 rounded-lg bg-slate-900/80 border-2 border-amber-400 shadow-xl">
                        <PetIcon petId={activePet?.id || 'pipoca_raposa'} size={32} />
                      </div>
                    </div>
                  )}
                </button>
              );
            })}

          </div>

          {/* DICA DE CONSTRUÇÃO */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-4 px-2">
            <span>💡 Clique em um bloco da vila para colocar o item selecionado. Itens novos são comprados com suas moedas de estudo!</span>
            {placeFeedback === 'saved' && (
              <span className="font-pixel text-[10px] text-emerald-400 flex items-center gap-1 animate-pulse">
                <Check size={12} /> Salvo!
              </span>
            )}
            {placeFeedback === 'bought' && (
              <span className="font-pixel text-[10px] text-amber-300 flex items-center gap-1 animate-pulse">
                <Coins size={12} /> Item adquirido!
              </span>
            )}
            {placeFeedback === 'blocked' && (
              <span className="font-pixel text-[10px] text-rose-400 flex items-center gap-1 animate-pulse">
                <Coins size={12} /> Moedinhas insuficientes!
              </span>
            )}
          </div>

        </div>

        {/* LADO DIREITO: INVENTÁRIO DE CONSTRUÇÃO & DECORAÇÃO */}
        <div className="lg:col-span-4 pixel-box bg-slate-900/95 p-5 border-slate-700 shadow-xl">
          
          <h3 className="font-pixel text-xs text-amber-300 mb-3 flex items-center gap-2">
            <Palette size={16} />
            CATÁLOGO DE CONSTRUÇÃO
          </h3>

          {/* CATEGORIAS */}
          <div className="grid grid-cols-2 gap-1.5 mb-4">
            {CATEGORY_TABS.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setIsEraser(false);
                  setActiveCategory(cat.id);
                }}
                className={`py-2 px-3 rounded-lg font-pixel text-[10px] border transition-all ${
                  !isEraser && activeCategory === cat.id
                    ? 'bg-amber-400 text-slate-950 font-bold border-amber-300 shadow'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* FERRAMENTA BORRACHA / PÁ */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setIsEraser(true);
            }}
            className={`w-full py-2 px-3 rounded-xl border-2 font-pixel text-xs mb-4 flex items-center justify-center gap-2 transition-all ${
              isEraser
                ? 'bg-rose-500 text-white border-rose-300 shadow-[0_3px_0_#9f1239]'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-rose-400'
            }`}
          >
            <Trash2 size={15} /> PÁ / LIMPADOR (BORRACHA)
          </button>

          {/* ITENS DA CATEGORIA ATIVA */}
          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {ITEMS_CATALOG
              .filter(item => item.category === activeCategory)
              .map(item => {
                const isSelected = !isEraser && selectedTool === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setIsEraser(false);
                      setSelectedTool(item.id);
                    }}
                    className={`w-full p-2.5 rounded-xl border-2 flex items-center gap-3 text-left transition-all ${
                      isSelected
                        ? 'bg-amber-400/20 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.3)]'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-3xl shrink-0 p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                      {item.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-pixel text-[11px] text-white truncate">
                          {item.name}
                        </span>
                        {ownedItems.includes(item.id) ? (
                          <span className="text-[10px] text-emerald-400 font-bold shrink-0">
                            {item.price === 0 ? 'Grátis ✨' : '✓ Adquirido'}
                          </span>
                        ) : (
                          <span className="text-[10px] text-yellow-300 font-bold shrink-0 flex items-center gap-0.5">
                            <Coins size={10} /> {item.price}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 leading-snug truncate">
                        {item.description}
                      </p>
                    </div>
                  </button>
                );
              })}
          </div>

        </div>

      </div>

    </div>
  );
}
