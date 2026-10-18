/**
 * Suporte a Voz via Web Speech API do Navegador
 * - SpeechSynthesis: Leitura em voz alta amigável para crianças (ideal para Modo Foco e Português/Inglês)
 * - SpeechRecognition: Reconhecimento de voz para repetição de palavras (Inglês) com avaliação tolerante
 */

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}

export function speakText(text: string, lang: 'pt-BR' | 'en-US' = 'pt-BR', onEnd?: () => void) {
  if (!isSpeechSynthesisSupported()) {
    onEnd?.();
    return;
  }

  try {
    window.speechSynthesis.cancel(); // Para fala anterior

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.95; // Levemente mais pausado para melhor compreensão infantil
    utterance.pitch = 1.1; // Tom levemente mais agudo e animado

    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(v => v.lang.startsWith(lang));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    if (onEnd) {
      utterance.onend = () => onEnd();
      utterance.onerror = () => onEnd();
    }

    window.speechSynthesis.speak(utterance);
  } catch {
    onEnd?.();
  }
}

export function stopSpeaking() {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
}

// Reconhecimento de Fala para repetição (Inglês ou comandos)
export function startVoiceRecognition(
  lang: 'pt-BR' | 'en-US',
  onResult: (spokenText: string) => void,
  onError: (err: string) => void,
  onEnd: () => void
): () => void {
  if (!isSpeechRecognitionSupported()) {
    onError('Seu navegador não suporta reconhecimento de voz. Você pode clicar nas opções!');
    onEnd();
    return () => {};
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();

    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      onError(event.error || 'Não conseguimos ouvir. Tente falar um pouquinho mais alto!');
    };

    recognition.onend = () => {
      onEnd();
    };

    recognition.start();

    return () => {
      try {
        recognition.stop();
      } catch {}
    };
  } catch {
    onError('Não foi possível iniciar o microfone.');
    onEnd();
    return () => {};
  }
}
