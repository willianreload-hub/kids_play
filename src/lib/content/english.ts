// =========================================================================
// VOCABULÁRIO DE INGLÊS INTERATIVO (ÁUDIO, VOZ & PRONÚNCIA)
// =========================================================================
export interface EnglishWordItem {
  id: string;
  word: string;
  translation: string;
  category: 'animais' | 'cores' | 'comida' | 'escola' | 'natureza';
  emoji: string;
  phoneticHelp: string;
  exampleSentence: string;
  exampleTranslation: string;
}

export const ENGLISH_VOCABULARY: EnglishWordItem[] = [
  {
    id: 'en_01',
    word: 'Dog',
    translation: 'Cachorro',
    category: 'animais',
    emoji: '🐶',
    phoneticHelp: 'Dóg',
    exampleSentence: 'The dog is playing in the park.',
    exampleTranslation: 'O cachorro está brincando no parque.',
  },
  {
    id: 'en_02',
    word: 'Cat',
    translation: 'Gato',
    category: 'animais',
    emoji: '🐱',
    phoneticHelp: 'Két',
    exampleSentence: 'The friendly cat is sleeping.',
    exampleTranslation: 'O gato amigo está dormindo.',
  },
  {
    id: 'en_03',
    word: 'Blue',
    translation: 'Azul',
    category: 'cores',
    emoji: '🔵',
    phoneticHelp: 'Blú',
    exampleSentence: 'The sky is beautiful and blue.',
    exampleTranslation: 'O céu é lindo e azul.',
  },
  {
    id: 'en_04',
    word: 'Yellow',
    translation: 'Amarelo',
    category: 'cores',
    emoji: '⭐',
    phoneticHelp: 'Ié-lou',
    exampleSentence: 'The shining star is yellow.',
    exampleTranslation: 'A estrela brilhante é amarela.',
  },
  {
    id: 'en_05',
    word: 'Red',
    translation: 'Vermelho',
    category: 'cores',
    emoji: '🍎',
    phoneticHelp: 'Réd',
    exampleSentence: 'I have a sweet red apple.',
    exampleTranslation: 'Eu tenho uma maçã vermelha docinha.',
  },
  {
    id: 'en_06',
    word: 'Book',
    translation: 'Livro',
    category: 'escola',
    emoji: '📚',
    phoneticHelp: 'Búk',
    exampleSentence: 'I love reading my magic book.',
    exampleTranslation: 'Eu adoro ler meu livro mágico.',
  },
  {
    id: 'en_07',
    word: 'Sun',
    translation: 'Sol',
    category: 'natureza',
    emoji: '☀️',
    phoneticHelp: 'Sãn',
    exampleSentence: 'The warm sun is in the sky.',
    exampleTranslation: 'O sol quentinho está no céu.',
  },
  {
    id: 'en_08',
    word: 'Water',
    translation: 'Água',
    category: 'natureza',
    emoji: '💧',
    phoneticHelp: 'Uó-ter',
    exampleSentence: 'Drinking cold water is good.',
    exampleTranslation: 'Beber água fresca faz bem.',
  },
  {
    id: 'en_09',
    word: 'Friend',
    translation: 'Amigo',
    category: 'escola',
    emoji: '🤝',
    phoneticHelp: 'Frénd',
    exampleSentence: 'You are my best friend!',
    exampleTranslation: 'Você é meu melhor amigo!',
  },
  {
    id: 'en_10',
    word: 'Star',
    translation: 'Estrela',
    category: 'natureza',
    emoji: '✨',
    phoneticHelp: 'Is-tár',
    exampleSentence: 'Look at the glowing star!',
    exampleTranslation: 'Olhe para a estrela brilhante!',
  },
  {
    id: 'en_11',
    word: 'Lion',
    translation: 'Leão',
    category: 'animais',
    emoji: '🦁',
    phoneticHelp: 'Lái-on',
    exampleSentence: 'The brave lion is the king of the savanna.',
    exampleTranslation: 'O leão corajoso é o rei da savana.',
  },
  {
    id: 'en_12',
    word: 'Rainbow',
    translation: 'Arco-íris',
    category: 'natureza',
    emoji: '🌈',
    phoneticHelp: 'Rêin-bou',
    exampleSentence: 'Look at the colorful rainbow after the rain.',
    exampleTranslation: 'Olhe para o arco-íris colorido depois da chuva.',
  },
  {
    id: 'en_13',
    word: 'Moon',
    translation: 'Lua',
    category: 'natureza',
    emoji: '🌙',
    phoneticHelp: 'Mún',
    exampleSentence: 'The shiny moon lights up the night sky.',
    exampleTranslation: 'A lua brilhante ilumina o céu da noite.',
  },
  {
    id: 'en_14',
    word: 'Apple',
    translation: 'Maçã',
    category: 'comida',
    emoji: '🍎',
    phoneticHelp: 'É-pol',
    exampleSentence: 'Eating a fresh apple keeps you healthy.',
    exampleTranslation: 'Comer uma maçã fresquinha mantém você saudável.',
  },
];

