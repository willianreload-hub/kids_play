'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../lib/auth-context';
import { ENGLISH_VOCABULARY, EnglishWordItem } from '../../../lib/content-data';
import { speakText, startVoiceRecognition, isSpeechRecognitionSupported } from '../../../lib/speech';
import { sounds } from '../../../lib/sound-effects';
import { PixelButton } from '../../../components/PixelButton';
import { PetIcon } from '../../../components/PetIcon';
import {
  Volume2, Mic,
  ArrowRight, ShieldCheck, Star, Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function InglesGamePage() {
  const { activePet, focusMode, addPoints, updateQuestProgress } = useAuth();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [spokenResult, setSpokenResult] = useState('');
  const [recognitionError, setRecognitionError] = useState('');
  const [feedbackState, setFeedbackState] = useState<'idle' | 'success' | 'retry'>('idle');
  const [stars, setStars] = useState(0);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [fallbackMode, setFallbackMode] = useState(false);
  const [showRestModal, setShowRestModal] = useState(false);
  const [isCompletedSession, setIsCompletedSession] = useState(false);

  const wordList = ENGLISH_VOCABULARY;
  const currentItem: EnglishWordItem = wordList[currentIndex] || wordList[0];

  // Reproduzir áudio nativo em inglês com voz infantil calibrada
  const handlePlayAudio = () => {
    sounds.playClick();
    speakText(currentItem.word, 'en-US');
  };

  // Auto-leitura ao abrir se Modo Foco com TTS ativo
  useEffect(() => {
    if (focusMode.is_active && focusMode.tts_auto_read) {
      const timer = setTimeout(() => {
        handlePlayAudio();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, currentItem, focusMode.is_active, focusMode.tts_auto_read]);

  // Reproduzir frase de exemplo
  const handlePlaySentence = () => {
    sounds.playClick();
    speakText(currentItem.exampleSentence, 'en-US');
  };

  // Avaliação tolerante para crianças brasileiras aprendendo inglês
  const evaluateSpoken = (transcript: string) => {
    const cleanTranscript = transcript.toLowerCase().trim().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '');
    const cleanTarget = currentItem.word.toLowerCase().trim();

    setSpokenResult(transcript);

    // Checagem exata ou de substrings fonéticas tolerantes
    const isMatch = 
      cleanTranscript.includes(cleanTarget) ||
      cleanTarget.includes(cleanTranscript) ||
      (cleanTarget === 'dog' && (cleanTranscript.includes('dog') || cleanTranscript.includes('dogue') || cleanTranscript.includes('dock'))) ||
      (cleanTarget === 'cat' && (cleanTranscript.includes('cat') || cleanTranscript.includes('ket') || cleanTranscript.includes('queti'))) ||
      (cleanTarget === 'blue' && (cleanTranscript.includes('blue') || cleanTranscript.includes('bloo') || cleanTranscript.includes('blu'))) ||
      (cleanTarget === 'sun' && (cleanTranscript.includes('sun') || cleanTranscript.includes('san') || cleanTranscript.includes('sam'))) ||
      (cleanTarget === 'star' && (cleanTranscript.includes('star') || cleanTranscript.includes('istar') || cleanTranscript.includes('sta')));

    if (isMatch) {
      handleSuccess();
    } else {
      setFeedbackState('retry');
      sounds.playGentleBoop();
    }
  };

  const handleStartListening = () => {
    if (!isSpeechRecognitionSupported()) {
      setRecognitionError('Seu navegador não possui microfone ativo. Usando o Modo Alternativo de Escuta!');
      setFallbackMode(true);
      return;
    }

    setRecognitionError('');
    setSpokenResult('');
    setFeedbackState('idle');
    setIsListening(true);
    sounds.playClick();

    const stopFn = startVoiceRecognition(
      'en-US',
      (spokenText) => {
        setIsListening(false);
        evaluateSpoken(spokenText);
      },
      (errorMsg) => {
        setIsListening(false);
        setRecognitionError(errorMsg);
        sounds.playGentleBoop();
      },
      () => {
        setIsListening(false);
      }
    );

    // Timeout de segurança após 5 segundos se nada for dito
    setTimeout(() => {
      setIsListening(prev => {
        if (prev) {
          stopFn();
          return false;
        }
        return false;
      });
    }, 5000);
  };

  const handleSuccess = () => {
    setFeedbackState('success');
    sounds.playSuccess();
    sounds.playCoin();
    setStars(prev => prev + 1);
    const pts = 20;
    setPointsEarned(prev => prev + pts);
    addPoints(pts, `ingles_${currentItem.id}`);
    updateQuestProgress('ingles_repeticao', 1);

    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  const handleNextWord = () => {
    sounds.playClick();
    setFeedbackState('idle');
    setSpokenResult('');
    setRecognitionError('');

    // Pausa do Modo Foco a cada 4 palavras
    if (focusMode.is_active && (currentIndex + 1) % 4 === 0 && currentIndex + 1 < wordList.length) {
      setShowRestModal(true);
      return;
    }

    if (currentIndex + 1 < wordList.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsCompletedSession(true);
      sounds.playFanfare();
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  };

  const handleRestart = () => {
    sounds.playClick();
    setCurrentIndex(0);
    setStars(0);
    setPointsEarned(0);
    setFeedbackState('idle');
    setSpokenResult('');
    setIsCompletedSession(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      {/* CABEÇALHO DO JOGO */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/jogos" className="text-xs font-pixel text-slate-400 hover:text-white">
              ← VOLTAR AO HUB
            </Link>
            <span className="text-slate-600">•</span>
            <span className="font-pixel text-xs text-purple-400">INGLÊS INTERATIVO (VOZ)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            Ilha do Inglês Falante 🗣️
          </h1>
        </div>

        {/* HUD DE PROGRESSO */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 border-2 border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <span className="font-pixel text-sm text-yellow-300">{stars}</span>
          </div>

          <div className="bg-slate-900 border-2 border-slate-800 px-3 py-1.5 rounded-xl text-xs font-pixel text-purple-300">
            {currentIndex + 1} / {wordList.length}
          </div>
        </div>
      </div>

      {/* AVISO DO MODO FOCO */}
      {focusMode.is_active && (
        <div className="mb-6 p-3 bg-emerald-950/70 border-2 border-emerald-500 rounded-xl flex items-center justify-between text-xs text-emerald-200">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-400 shrink-0" />
            <span>Modo Foco Ativo: Pronúncias com ritmo calmo e pausas a cada 4 palavras.</span>
          </div>
          <span className="font-pixel text-[10px] bg-emerald-900 text-emerald-300 px-2 py-0.5 rounded">
            SEM PRESSÃO
          </span>
        </div>
      )}

      {/* MODAL DE PAUSA DO MODO FOCO */}
      {showRestModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="pixel-box bg-slate-900 max-w-md w-full p-6 text-center border-emerald-400 animate-scale-up">
            <div className="w-16 h-16 bg-emerald-950 border-3 border-emerald-400 rounded-2xl mx-auto flex items-center justify-center mb-4">
              {activePet && <PetIcon petId={activePet.id} size={48} mood="happy" />}
            </div>
            <h2 className="font-pixel text-lg text-emerald-300 mb-2">
              HORA DO DESCANSO COM {activePet?.name.toUpperCase()}!
            </h2>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Você completou 4 palavras em inglês! Beba um gole de água, respire fundo e estique os bracinhos antes de continuar.
            </p>
            <PixelButton
              variant="success"
              size="md"
              className="w-full"
              onClick={() => {
                sounds.playClick();
                setShowRestModal(false);
                setCurrentIndex(prev => prev + 1);
              }}
            >
              ESTOU PRONTO PARA MAIS! 🚀
            </PixelButton>
          </div>
        </div>
      )}

      {/* TELA DE CONCLUSÃO DA SESSÃO */}
      {isCompletedSession ? (
        <div className="pixel-box bg-slate-900/95 p-8 text-center border-purple-500/80 animate-scale-up">
          <div className="w-20 h-20 bg-gradient-to-t from-purple-700 to-indigo-500 rounded-2xl mx-auto flex items-center justify-center mb-4 border-4 border-purple-300 shadow-[0_0_25px_rgba(168,85,247,0.5)]">
            <Award size={44} className="text-yellow-300" />
          </div>

          <h2 className="font-pixel text-xl sm:text-2xl text-purple-300 mb-2">
            VOCÊ FALOU COMO UM VERDADEIRO MESTRE!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto mb-6">
            Parabéns! Você praticou sua pronúncia, treinou seus ouvidos e ganhou <strong>+{pointsEarned} Moedas Mágicas</strong>!
          </p>

          <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto mb-8">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="font-pixel text-xs text-slate-400 block">ESTRELAS</span>
              <span className="font-pixel text-xl text-yellow-400">{stars} ⭐</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="font-pixel text-xs text-slate-400 block">RECOMPENSA</span>
              <span className="font-pixel text-xl text-amber-300">+{pointsEarned} 🪙</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <PixelButton variant="primary" size="md" onClick={handleRestart}>
              JOGAR NOVAMENTE 🔄
            </PixelButton>
            <Link href="/jogos">
              <PixelButton variant="warning" size="md">
                OUTROS MINIJOGOS 🎮
              </PixelButton>
            </Link>
          </div>
        </div>
      ) : (
        /* CARD PRINCIPAL DA PALAVRA ATUAL */
        <div className="pixel-box bg-slate-900/95 p-6 sm:p-8 border-purple-500/80">
          
          <div className="flex items-center justify-between mb-4">
            <span className="font-pixel text-[11px] text-purple-300 bg-purple-950/80 border border-purple-600 px-3 py-1 rounded-lg">
              CATEGORIA: {currentItem.category.toUpperCase()}
            </span>
            <span className="text-xs text-slate-400">
              Palavra {currentIndex + 1} de {wordList.length}
            </span>
          </div>

          {/* PALAVRA EM DESTAQUE COM ILUSTRAÇÃO PIXEL */}
          <div className="text-center my-6">
            <div className="text-6xl sm:text-7xl mb-4 animate-bounce-subtle">
              {currentItem.emoji}
            </div>

            <div className="flex items-center justify-center gap-3 mb-2">
              <h2 className="font-pixel text-3xl sm:text-5xl text-white tracking-wide">
                {currentItem.word}
              </h2>
              <button
                type="button"
                onClick={handlePlayAudio}
                className="p-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
                title="Ouvir a pronúncia em inglês"
              >
                <Volume2 size={24} />
              </button>
            </div>

            <p className="text-base sm:text-lg text-purple-300 font-bold mb-1">
              Significado: <span className="text-yellow-300">{currentItem.translation}</span>
            </p>

            <p className="text-xs sm:text-sm text-slate-400">
              Pronúncia amigável: <strong className="text-slate-200 tracking-wider">&ldquo;{currentItem.phoneticHelp}&rdquo;</strong>
            </p>
          </div>

          {/* FRASE DE EXEMPLO CONTEXTUALIZADA */}
          <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl mb-6 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs sm:text-sm text-slate-200 font-medium">
                &ldquo;{currentItem.exampleSentence}&rdquo;
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {currentItem.exampleTranslation}
              </p>
            </div>
            <button
              type="button"
              onClick={handlePlaySentence}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 shrink-0"
              title="Ouvir a frase inteira"
            >
              <Volume2 size={18} />
            </button>
          </div>

          {/* ÁREA DE INTERAÇÃO COM MICROFONE */}
          <div className="text-center my-6">
            
            {/* BOTÃO DO MICROFONE */}
            <div className="mb-4">
              <button
                type="button"
                disabled={feedbackState === 'success' || isListening}
                onClick={handleStartListening}
                className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 transition-all flex items-center justify-center mx-auto shadow-2xl ${
                  isListening
                    ? 'bg-rose-600 border-rose-300 text-white animate-pulse scale-110 shadow-[0_0_30px_rgba(244,63,94,0.7)]'
                    : feedbackState === 'success'
                      ? 'bg-emerald-600 border-emerald-300 text-white'
                      : 'bg-purple-600 hover:bg-purple-500 border-purple-300 text-white hover:scale-105 active:scale-95'
                }`}
              >
                {isListening ? (
                  <Mic size={36} className="animate-bounce" />
                ) : (
                  <Mic size={36} />
                )}
              </button>
            </div>

            <p className="font-pixel text-xs sm:text-sm text-slate-200 mb-2">
              {isListening 
                ? '🎙️ Ouvindo você... Fale agora!' 
                : feedbackState === 'success' 
                  ? '🎉 Pronúncia incrível! Você acertou!' 
                  : 'Clique no microfone e diga a palavra em voz alta!'}
            </p>

            {/* SE O NAVEGADOR OUVIU ALGO */}
            {spokenResult && (
              <div className="inline-block bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-300 mb-3">
                Você falou: <span className="text-white font-bold">&ldquo;{spokenResult}&rdquo;</span>
              </div>
            )}

            {/* MENSAGEM DE ERRO OU DICA CASO NÃO TENHA OUVIDO */}
            {recognitionError && (
              <div className="text-xs text-rose-300 bg-rose-950/60 border border-rose-800 p-2.5 rounded-lg max-w-md mx-auto mb-3">
                ⚠️ {recognitionError}
              </div>
            )}

            {/* FEEDBACK DE TENTAR DE NOVO */}
            {feedbackState === 'retry' && (
              <div className="text-xs text-amber-300 bg-amber-950/60 border border-amber-800 p-2.5 rounded-lg max-w-md mx-auto mb-3">
                💡 Quase lá! Clique em ouvir <Volume2 size={14} className="inline" /> e tente repetir com calma: &ldquo;{currentItem.phoneticHelp}&rdquo;!
              </div>
            )}

            {/* MODO ALTERNATIVO DE ESCUTA SE NÃO TIVER MICROFONE */}
            <div className="mt-4 pt-4 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setFallbackMode(!fallbackMode)}
                className="text-[11px] text-slate-400 hover:text-white underline font-normal"
              >
                {fallbackMode ? 'Ocultar opções de clique' : 'Sem microfone no computador? Clique aqui para o modo de escuta!'}
              </button>

              {fallbackMode && (
                <div className="mt-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <p className="text-xs text-slate-300 mb-2">
                    Qual destas opções significa a palavra falada?
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      currentItem.translation,
                      'Outra Palavra',
                      'Mais uma Opção',
                      'Diferente',
                    ].sort().map((opt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          if (opt === currentItem.translation) {
                            handleSuccess();
                          } else {
                            sounds.playGentleBoop();
                          }
                        }}
                        className={`p-2 rounded-lg border text-xs font-bold transition-all ${
                          opt === currentItem.translation && feedbackState === 'success'
                            ? 'bg-emerald-600 border-emerald-400 text-white'
                            : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* BOTÃO PARA PRÓXIMA PALAVRA */}
          <div className="flex justify-end pt-4 border-t border-slate-800">
            <PixelButton
              variant={feedbackState === 'success' ? 'success' : 'primary'}
              size="md"
              disabled={feedbackState !== 'success' && !fallbackMode}
              onClick={handleNextWord}
              icon={<ArrowRight size={18} />}
            >
              {currentIndex + 1 === wordList.length ? 'FINALIZAR LIÇÃO' : 'PRÓXIMA PALAVRA'}
            </PixelButton>
          </div>

        </div>
      )}

    </div>
  );
}
