/**
 * Moderador de Nicknames para Crianças (Kids-Player)
 * Alinhado ao ECA Digital e LGPD para proteção de menores:
 * - Impede palavras impróprias ou ofensivas
 * - Bloqueia vazamento involuntário de dados pessoais (telefones, emails, CEPs, endereços, nomes completos)
 */

const BLOCKED_WORDS = [
  'palavrao', 'porra', 'caralho', 'merda', 'bosta', 'puta', 'viado', 'fdp',
  'otario', 'idiota', 'estupido', 'burro', 'desgraca', 'maldito', 'sexo',
  'nude', 'penis', 'vagina', 'piroca', 'cu', 'buceta', 'fuder', 'fode',
  'chupa', 'cacete', 'arrombado', 'babaca', 'corno', 'drogas', 'maconha',
  'coca', 'trafico', 'matar', 'morte', 'suicidio', 'nazista', 'hitler'
];

const ADDRESS_KEYWORDS = [
  'rua', 'avenida', 'av.', 'bairro', 'cep', 'numero', 'apartamento', 'apto', 'bloco', 'casa'
];

const SURNAMES_DETECT = [
  'silva', 'santos', 'oliveira', 'souza', 'rodrigues', 'ferreira', 'alves', 'pereira',
  'lima', 'gomes', 'costa', 'ribeiro', 'martins', 'carvalho', 'almeida', 'lopes', 'soares'
];

export interface NicknameValidationResult {
  isValid: boolean;
  message?: string;
}

export function validateNickname(nickname: string): NicknameValidationResult {
  const clean = nickname.trim();

  if (!clean) {
    return { isValid: false, message: 'Digite um apelido divertido para seu personagem!' };
  }

  if (clean.length < 3) {
    return { isValid: false, message: 'O apelido precisa ter pelo menos 3 letras!' };
  }

  if (clean.length > 20) {
    return { isValid: false, message: 'O apelido deve ter no máximo 20 letras.' };
  }

  const lower = clean.toLowerCase();

  // 1. Bloqueio de e-mails
  if (lower.includes('@') || lower.includes('.com') || lower.includes('.br')) {
    return {
      isValid: false,
      message: 'Por segurança, não use endereços de e-mail como apelido!',
    };
  }

  // 2. Bloqueio de números de telefone (sequências de 7 ou mais dígitos)
  const numbersOnly = lower.replace(/\D/g, '');
  if (numbersOnly.length >= 7) {
    return {
      isValid: false,
      message: 'Por segurança (ECA Digital), nunca use números de telefone no apelido!',
    };
  }

  // 3. Bloqueio de palavras que indicam endereço
  for (const word of ADDRESS_KEYWORDS) {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(lower)) {
      return {
        isValid: false,
        message: 'Por proteção à sua privacidade, não coloque endereços no seu nome!',
      };
    }
  }

  // 4. Bloqueio de sobrenomes reais comuns (evitar expor nome civil completo de crianças)
  const tokens = lower.split(/[\s_.-]+/);
  let surnameMatches = 0;
  for (const token of tokens) {
    if (SURNAMES_DETECT.includes(token)) {
      surnameMatches++;
    }
  }
  if (surnameMatches >= 2 || (tokens.length >= 3 && surnameMatches >= 1)) {
    return {
      isValid: false,
      message: 'Dica de herói: invente um apelido de game divertido em vez de usar seu nome completo!',
    };
  }

  // 5. Filtro de palavras inapropriadas
  for (const bad of BLOCKED_WORDS) {
    if (lower.includes(bad)) {
      return {
        isValid: false,
        message: 'Esse apelido tem palavras não permitidas. Escolha um nome amigável e heróico!',
      };
    }
  }

  // 6. Caracteres permitidos (letras, números, traços e underlines)
  const validPattern = /^[a-zA-Z0-9_ -]+$/;
  if (!validPattern.test(clean)) {
    return {
      isValid: false,
      message: 'Use apenas letras, números ou tracinhos.',
    };
  }

  return { isValid: true };
}
