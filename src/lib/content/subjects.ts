import type { SubjectItem } from '../types';

export const SUBJECTS: SubjectItem[] = [
  {
    id: 'matematica',
    name: 'Matemática',
    description: 'Contas, tabuada, desafios de raciocínio, geometria e frações divertidas.',
    icon: 'calculator',
    color_theme: '#0fbcf9',
    order_index: 1,
    bncc_focus: 'EF03MA / EF04MA: Números, Álgebra e Grandezas',
  },
  {
    id: 'portugues',
    name: 'Língua Portuguesa',
    description: 'Leitura, desafios de sílabas, ortografia, gramática e histórias.',
    icon: 'book-open',
    color_theme: '#ff6b81',
    order_index: 2,
    bncc_focus: 'EF03LP / EF04LP: Leitura, Ortografia e Escrita',
  },
  {
    id: 'ciencias',
    name: 'Ciências Naturais',
    description: 'Corpo humano, seres vivos, ecologia, astronomia e experiências.',
    icon: 'flask',
    color_theme: '#2ed573',
    order_index: 3,
    bncc_focus: 'EF03CI / EF04CI: Matéria, Vida e Terra',
  },
  {
    id: 'historia_geografia',
    name: 'História & Geografia',
    description: 'Família, comunidade, mapas, cidades do Brasil e paisagens.',
    icon: 'compass',
    color_theme: '#ffa502',
    order_index: 4,
    bncc_focus: 'EF03HI/GE / EF04HI/GE: Sociedade e Espaço',
  },
  {
    id: 'ingles',
    name: 'Inglês Interativo (Voz)',
    description: 'Ouça as palavras e treine a pronúncia com o microfone de forma divertida.',
    icon: 'mic',
    color_theme: '#a55eea',
    order_index: 5,
    bncc_focus: 'Vocabulário visual e auditivo inicial',
  },
  {
    id: 'digitacao',
    name: 'Mestre do Teclado',
    description: 'Treine a digitação ágil pelas teclas para digitar como um profissional.',
    icon: 'keyboard',
    color_theme: '#ff7f50',
    order_index: 6,
    bncc_focus: 'Letramento digital e coordenação motora',
  },
];

