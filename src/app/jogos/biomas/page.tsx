'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../lib/auth-context';
import { QUESTION_BANK } from '../../../lib/content-data';
import { Question } from '../../../lib/types';
import { PixelButton } from '../../../components/PixelButton';
import { PetIcon } from '../../../components/PetIcon';
import { sounds } from '../../../lib/sound-effects';
import { speakText, stopSpeaking } from '../../../lib/speech';
import { 
  ArrowLeft, Compass, Trees, Award, Volume2, 
  Check, Sparkles, MapPin, ShieldCheck, Heart 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BiomeInfo {
  id: string;
  name: string;
  tagline: string;
  color: string;
  borderColor: string;
  bgGradient: string;
  icon: string;
  symbolAnimal: string;
  climate: string;
  flora: string;
  questionId: string;
  badgeName: string;
}

const BRAZIL_BIOMES: BiomeInfo[] = [
  {
    id: 'amazonia',
    name: 'Amazônia',
    tagline: 'A Maior Floresta Tropical do Mundo',
    color: 'text-emerald-300',
    borderColor: 'border-emerald-500',
    bgGradient: 'from-emerald-950 via-slate-900 to-green-950',
    icon: '🌳',
    symbolAnimal: 'Onça-Pintada & Boto-Cor-de-Rosa',
    climate: 'Equatorial Quente e Muito Chuvoso',
    flora: 'Vitória-Régia, Castanheira e Seringueira',
    questionId: 'bio_amazonia_01',
    badgeName: 'Guardião da Amazônia',
  },
  {
    id: 'caatinga',
    name: 'Caatinga',
    tagline: 'O Único Bioma 100% Brasileiro',
    color: 'text-amber-400',
    borderColor: 'border-amber-500',
    bgGradient: 'from-amber-950 via-slate-900 to-orange-950',
    icon: '🌵',
    symbolAnimal: 'Asa-Branca & Tatu-Bola',
    climate: 'Semiárido Quente com Chuvas Concentradas',
    flora: 'Mandacaru, Juazeiro e Xiquexique',
    questionId: 'bio_caatinga_01',
    badgeName: 'Protetor da Caatinga',
  },
  {
    id: 'cerrado',
    name: 'Cerrado',
    tagline: 'A Savana e Caixa-d\'Água do Brasil',
    color: 'text-yellow-400',
    borderColor: 'border-yellow-500',
    bgGradient: 'from-yellow-950 via-slate-900 to-amber-950',
    icon: '🌾',
    symbolAnimal: 'Lobo-Guará & Tamanduá-Bandeira',
    climate: 'Tropical com Estação Seca e Estação Chuvosa',
    flora: 'Pequi, Ipê-Amarelo e Buriti',
    questionId: 'bio_cerrado_01',
    badgeName: 'Defensor do Cerrado',
  },
  {
    id: 'pantanal',
    name: 'Pantanal',
    tagline: 'Maior Planície Alagável do Planeta',
    color: 'text-cyan-300',
    borderColor: 'border-cyan-500',
    bgGradient: 'from-cyan-950 via-slate-900 to-teal-950',
    icon: '🐊',
    symbolAnimal: 'Tuiuiú & Jacaré-do-Pantanal',
    climate: 'Tropical com Ciclo Marcante de Cheias',
    flora: 'Aguapé, Carandá e Piúva',
    questionId: 'bio_pantanal_01',
    badgeName: 'Vigia do Pantanal',
  },
  {
    id: 'mata_atlantica',
    name: 'Mata Atlântica',
    tagline: 'A Floresta das Montanhas e do Litoral',
    color: 'text-pink-300',
    borderColor: 'border-pink-500',
    bgGradient: 'from-pink-950 via-slate-900 to-indigo-950',
    icon: '🐒',
    symbolAnimal: 'Mico-Leão-Dourado & Tucano-de-Bico-Preto',
    climate: 'Tropical Úmido e Subtropical Litorâneo',
    flora: 'Pau-Brasil, Bromélias e Palmito-Juçara',
    questionId: 'bio_mata_atlantica_01',
    badgeName: 'Amigo da Mata Atlântica',
  },
  {
    id: 'pampa',
    name: 'Pampa',
    tagline: 'Os Campos Sulinos e Coxilhas',
    color: 'text-lime-300',
    borderColor: 'border-lime-500',
    bgGradient: 'from-lime-950 via-slate-900 to-slate-900',
    icon: '🐎',
    symbolAnimal: 'Quero-Quero & Veado-Campeiro',
    climate: 'Subtropical com Quatro Estações Bem Definidas',
    flora: 'Gramíneas Nativas e Capim-Forquilha',
    questionId: 'bio_pampa_01',
    badgeName: 'Patrulheiro do Pampa',
  },
  {
    id: 'manguezal',
    name: 'Manguezais & Costa',
    tagline: 'O Berçário Mágico das Marés e Oceanos',
    color: 'text-teal-300',
    borderColor: 'border-teal-500',
    bgGradient: 'from-teal-950 via-slate-900 to-cyan-950',
    icon: '🦀',
    symbolAnimal: 'Caranguejo-Uçá & Garça-Branca',
    climate: 'Litorâneo Úmido e Marés Salobras',
    flora: 'Mangue-Vermelho de Raízes Aéreas',
    questionId: 'bio_manguezal_01',
    badgeName: 'Protetor dos Manguezais',
  },
  {
    id: 'araucarias',
    name: 'Mata de Araucárias',
    tagline: 'A Floresta dos Pinheirais das Serras Frias',
    color: 'text-indigo-300',
    borderColor: 'border-indigo-500',
    bgGradient: 'from-indigo-950 via-slate-900 to-slate-950',
    icon: '🌲',
    symbolAnimal: 'Gralha-Azul & Bugio-Ruivo',
    climate: 'Subtropical Frio com Geadas de Inverno',
    flora: 'Araucária (Pinheiro-do-Paraná) e Erva-Mate',
    questionId: 'bio_araucarias_01',
    badgeName: 'Guardião dos Pinheirais',
  },
  {
    id: 'cocais',
    name: 'Mata dos Cocais',
    tagline: 'A Terra das Palmeiras de Babaçu e Carnaúba',
    color: 'text-amber-300',
    borderColor: 'border-amber-500',
    bgGradient: 'from-amber-950 via-slate-900 to-yellow-950',
    icon: '🌴',
    symbolAnimal: 'Gato-Maracajá & Arara-Canindé',
    climate: 'Tropical de Transição (Úmido ao Semiárido)',
    flora: 'Palmeiras de Babaçu, Carnaúba e Buriti',
    questionId: 'bio_cocais_01',
    badgeName: 'Amigo dos Cocais',
  },
];

export default function BiomasDoBrasilPage() {
  const { profile, activePet, focusMode, addPoints, updateQuestProgress, equippedAccessoryId } = useAuth();
  
  const [selectedBiomeId, setSelectedBiomeId] = useState<string>('amazonia');
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kids_player_biome_badges');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [selectedOptId, setSelectedOptId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);

  const currentBiome = BRAZIL_BIOMES.find(b => b.id === selectedBiomeId) || BRAZIL_BIOMES[0];
  const currentQuestion: Question = QUESTION_BANK.find(q => q.id === currentBiome.questionId) || QUESTION_BANK[0];

  const handleSelectBiome = (id: string) => {
    sounds.playClick();
    setSelectedBiomeId(id);
    setSelectedOptId(null);
    setFeedback(null);
  };

  const handleListenQuestion = () => {
    sounds.playClick();
    stopSpeaking();
    const textToSpeak = `${currentBiome.name}. ${currentQuestion.prompt}`;
    speakText(textToSpeak, 'pt-BR');
  };

  const handleAnswer = (optionText: string, optionId: string) => {
    if (feedback?.isCorrect) return;

    sounds.playClick();
    setSelectedOptId(optionId);

    const isRight = optionText.trim().toLowerCase() === currentQuestion.correct_answer.trim().toLowerCase();

    if (isRight) {
      sounds.playSuccess();
      sounds.playCoin();

      const nextBadges = Array.from(new Set([...unlockedBadges, currentBiome.id]));
      setUnlockedBadges(nextBadges);
      if (typeof window !== 'undefined') {
        localStorage.setItem('kids_player_biome_badges', JSON.stringify(nextBadges));
      }

      addPoints(30, `bioma_${currentBiome.id}`);
      updateQuestProgress('explorador_natureza', 1);

      if (!focusMode.reduced_stimuli) {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
        });
      }

      setFeedback({
        isCorrect: true,
        message: `🌿 EXCELENTE, EXPLORADOR! Você conquistou a Insígnia do ${currentBiome.name} (+30 Moedas)!`,
      });
    } else {
      sounds.playGentleBoop();
      setFeedback({
        isCorrect: false,
        message: currentQuestion.explanation,
      });
    }
  };

  const isCurrentBiomeCompleted = unlockedBadges.includes(currentBiome.id);
  const allCompleted = unlockedBadges.length === BRAZIL_BIOMES.length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <Link
          href="/jogos"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border-2 border-slate-700 hover:border-amber-400 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-all shadow-md"
        >
          <ArrowLeft size={16} />
          <span>Voltar aos Jogos</span>
        </Link>

        {/* Progresso do Caderno de Campo */}
        <div className="flex items-center gap-2 bg-slate-900 border-2 border-emerald-500/80 px-4 py-1.5 rounded-2xl shadow">
          <Award size={16} className="text-amber-400" />
          <span className="font-pixel text-[11px] text-white">
            Insígnias Conquistadas: {unlockedBadges.length} / {BRAZIL_BIOMES.length}
          </span>
        </div>
      </div>

      {/* Banner Principal da Expedição */}
      <div className="pixel-box bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 p-6 mb-8 border-emerald-500 shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-emerald-900/80 border-4 border-emerald-400 flex items-center justify-center text-4xl shadow-lg shrink-0">
              🧭
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-pixel text-xs text-amber-400">CIÊNCIAS & GEOGRAFIA DO BRASIL (BNCC)</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-1">
                Expedição pelos Biomas do Brasil
              </h1>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                Embarque com o seu PET pelos 9 grandes ecossistemas e biomas do nosso país! Descubra a fauna, a flora e colete todas as insígnias de guardião da natureza!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 p-3 rounded-2xl shrink-0">
            <PetIcon petId={activePet?.id || 'pipoca_raposa'} size={48} mood="happy" accessoryId={equippedAccessoryId} />
            <div>
              <span className="font-pixel text-[9px] text-slate-400 block">GUIA DA EXPEDIÇÃO</span>
              <span className="font-pixel text-xs text-amber-300">{activePet?.name || 'Pipoca'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Seletor Visual dos 9 Ecossistemas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2.5 mb-8">
        {BRAZIL_BIOMES.map(biome => {
          const isSelected = selectedBiomeId === biome.id;
          const isDone = unlockedBadges.includes(biome.id);

          return (
            <button
              key={biome.id}
              type="button"
              onClick={() => handleSelectBiome(biome.id)}
              className={`p-3.5 rounded-2xl border-2 flex flex-col items-center text-center transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)] scale-105'
                  : 'bg-slate-950/90 border-slate-800 hover:border-slate-600 opacity-80 hover:opacity-100'
              }`}
            >
              <span className="text-3xl mb-1">{biome.icon}</span>
              <span className="font-pixel text-xs text-white truncate max-w-full">
                {biome.name}
              </span>
              <div className="mt-1">
                {isDone ? (
                  <span className="inline-flex items-center gap-0.5 text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-600 px-1.5 py-0.2 rounded-full font-bold">
                    <Check size={9} /> Concluído
                  </span>
                ) : (
                  <span className="text-[9px] text-slate-400 font-bold">
                    Explorar
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Cartão de Exploração do Bioma Ativo */}
      <div className={`pixel-box bg-gradient-to-b ${currentBiome.bgGradient} p-6 sm:p-8 ${currentBiome.borderColor} shadow-2xl relative mb-8`}>
        
        {/* Cabeçalho do Bioma */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-3xl">{currentBiome.icon}</span>
              <h2 className="font-pixel text-xl sm:text-2xl text-white">
                {currentBiome.name}
              </h2>
            </div>
            <p className="text-sm text-slate-300 font-medium">
              {currentBiome.tagline}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700 text-slate-300">
              🏅 Insígnia: <strong className={currentBiome.color}>{currentBiome.badgeName}</strong>
            </span>
          </div>
        </div>

        {/* Ficha Técnica do Ecossistema */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 text-xs">
          <div className="bg-slate-950/70 p-3 rounded-xl border border-white/10">
            <span className="text-slate-400 block mb-0.5 font-bold">🐾 Fauna Marcante:</span>
            <span className="text-white font-medium">{currentBiome.symbolAnimal}</span>
          </div>
          <div className="bg-slate-950/70 p-3 rounded-xl border border-white/10">
            <span className="text-slate-400 block mb-0.5 font-bold">🌿 Flora Típica:</span>
            <span className="text-white font-medium">{currentBiome.flora}</span>
          </div>
          <div className="bg-slate-950/70 p-3 rounded-xl border border-white/10">
            <span className="text-slate-400 block mb-0.5 font-bold">☀️ Clima:</span>
            <span className="text-white font-medium">{currentBiome.climate}</span>
          </div>
        </div>

        {/* Desafio de Campo */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border-2 border-slate-700">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="font-pixel text-[11px] text-amber-300 flex items-center gap-1">
              <Compass size={13} className="text-amber-400" />
              DESAFIO DE CAMPO DO NATURALISTA:
            </span>
            <button
              type="button"
              onClick={handleListenQuestion}
              className="flex items-center gap-1 text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors border border-slate-600"
            >
              <Volume2 size={14} />
              <span>Ouvir</span>
            </button>
          </div>

          <p className="text-base sm:text-lg font-bold text-white mb-5 leading-relaxed">
            {currentQuestion.prompt}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {currentQuestion.options.map(opt => {
              const isSelected = selectedOptId === opt.id;
              const isCorrectAnswer = opt.text.trim().toLowerCase() === currentQuestion.correct_answer.trim().toLowerCase();

              let btnStyle = 'bg-slate-950/80 border-slate-700 text-slate-200 hover:border-amber-400 hover:bg-slate-800';
              if (feedback && isSelected) {
                btnStyle = feedback.isCorrect
                  ? 'bg-emerald-600 border-emerald-400 text-white'
                  : 'bg-rose-600 border-rose-400 text-white';
              } else if (feedback && isCorrectAnswer) {
                btnStyle = 'bg-emerald-700/80 border-emerald-400 text-emerald-200';
              }

              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={Boolean(feedback?.isCorrect)}
                  onClick={() => handleAnswer(opt.text, opt.id)}
                  className={`p-3.5 rounded-xl border-2 text-left font-bold text-xs sm:text-sm transition-all shadow active:scale-98 ${btnStyle}`}
                >
                  {opt.text}
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {feedback && (
            <div className={`p-4 rounded-xl border-2 text-xs sm:text-sm font-bold ${
              feedback.isCorrect 
                ? 'bg-emerald-950 border-emerald-500 text-emerald-300' 
                : 'bg-rose-950 border-rose-500 text-rose-300'
            }`}>
              <p className="leading-relaxed">{feedback.message}</p>
            </div>
          )}
        </div>

      </div>

      {/* Certificado de Mestre Explorador dos Biomas */}
      {allCompleted && (
        <div className="pixel-box bg-gradient-to-r from-amber-950 via-yellow-950 to-amber-950 p-6 border-amber-400 shadow-2xl text-center space-y-3 animate-bounce-subtle">
          <span className="text-5xl block">📜🏆</span>
          <h3 className="font-pixel text-lg text-amber-300">
            CERTIFICADO DE GRANDE EXPLORADOR DOS BIOMAS DO BRASIL
          </h3>
          <p className="text-xs text-slate-200 max-w-lg mx-auto">
            Você completou a expedição por todos os 6 biomas! Demonstrou grande amor e respeito pela natureza, fauna e flora da nossa terra!
          </p>
        </div>
      )}

    </div>
  );
}
