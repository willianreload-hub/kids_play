// Teatro dos Contos — fábulas originais do Kids-Player.
// Alinhadas à BNCC EF35LP02 / EF35LP03 (compreensão e interpretação de texto)
// para o 3º e 4º ano do Ensino Fundamental.

export interface TalePage {
  /** Texto da página (frases curtas, linguagem afetuosa para 8-10 anos) */
  text: string;
  /** Emoji grande que ilustra a cena */
  sceneEmoji: string;
}

export interface TaleQuestion {
  id: string;
  prompt: string;
  options: string[];
  /** Índice (0-based) da opção correta */
  correctIndex: number;
  explanation: string;
}

export interface Tale {
  id: string;
  title: string;
  emoji: string;
  synopsis: string;
  /** Classes Tailwind do tema visual (borda do card e do selo) */
  themeClasses: { box: string; badge: string };
  pages: TalePage[];
  questions: TaleQuestion[];
  rewardPoints: number;
  bnccCodes: string[];
}

export const TALE_CATALOG: Tale[] = [
  {
    id: 'pipoca_relogio_areia',
    title: 'A Raposa e o Relógio de Areia',
    emoji: '🦊⏳',
    synopsis:
      'Pipoca queria minerar mais gemas que todo mundo — até descobrir o segredo das pausinhas mágicas.',
    themeClasses: {
      box: 'border-amber-400/80',
      badge: 'bg-amber-400 text-slate-950',
    },
    pages: [
      {
        text: 'No alto da Colina dos Cálculos morava Pipoca, uma raposinha peluda e muito apressada. Ela queria ser a maior mineradora de gemas do mundo inteiro — e queria isso PARA ONTEM!',
        sceneEmoji: '🦊⛏️',
      },
      {
        text: 'Pipoca cavava sem parar. Cavava de manhã, cavava à tarde, cavava até de madrugada. Mas, de tanto correr, suas patinhas tremiam e os números dos blocos ficavam dançando na frente dos olhos dela.',
        sceneEmoji: '😵💫🔢',
      },
      {
        text: 'Foi então que a tartaruguinha Gota d\u2019Água apareceu com um presente: um relógio de areia azul. — Cave enquanto a areia cai — disse Gota. — Quando ela terminar, descanse, coma uma frutinha e respire bem fundo.',
        sceneEmoji: '🐢⏳',
      },
      {
        text: 'Pipoca achou estranho no começo. Mas, a cada descanso, suas ideias voltavam brilhantes! Com pausinhas mágicas, ela resolveu blocos que antes pareciam impossíveis. E foi assim que Pipoca aprendeu: até os grandes heróis descansam para ficarem ainda mais fortes!',
        sceneEmoji: '✨💪🦊',
      },
    ],
    questions: [
      {
        id: 'tale_pipoca_q1',
        prompt: 'O que acontecia com Pipoca quando ela cavava sem parar?',
        options: [
          'Ficava cada vez mais forte',
          'As patinhas tremiam e os números pareciam dançar',
          'Encontrava o dobro de gemas',
          'Ganhava um relógio novo',
        ],
        correctIndex: 1,
        explanation:
          'Isso mesmo! Trabalhar sem descanso deixava as patinhas de Pipoca tremendo e os números dançando. Até o corpo dos heróis precisa de pausinhas!',
      },
      {
        id: 'tale_pipoca_q2',
        prompt: 'Qual foi o segredo que Gota d\u2019Água ensinou para Pipoca?',
        options: [
          'Cavar apenas de madrugada',
          'Nunca parar de trabalhar',
          'Alternar o esforço com pausas e descansos',
          'Comprar uma máquina de cavar',
        ],
        correctIndex: 2,
        explanation:
          'Exato! O relógio de areia ensinou o ritmo mágico: esforço, pausa, frutinha e respiração funda. Descansar também faz parte da aventura!',
      },
    ],
    rewardPoints: 30,
    bnccCodes: ['EF35LP02', 'EF35LP03'],
  },
  {
    id: 'bolha_medo_de_errar',
    title: 'O Slime que Tinha Medo de Errar',
    emoji: '🫧💚',
    synopsis:
      'Bolha sabia todas as respostas... mas tinha um medo gelatinoso de levantar a mão. Descubra o que a coruja mais sábia revelou.',
    themeClasses: {
      box: 'border-emerald-400/80',
      badge: 'bg-emerald-400 text-slate-950',
    },
    pages: [
      {
        text: 'Na Vila dos Pets morava Bolha, um slime verde, gelatinoso e tremidinho. Bolha tinha um segredo: morria de medo de errar as respostas na Escola das Ilhas.',
        sceneEmoji: '🫂🏫',
      },
      {
        text: 'Um dia, a professora Coruja perguntou: — Quem quer somar 25 + 17 no quadro mágico? Bolha SABIA a resposta... mas as palavras ficaram presas na garganta gelatinosa, e ele ficou ali, quietinho feito pedra.',
        sceneEmoji: '🫧😖',
      },
      {
        text: 'Depois da aula, Sabichão, a coruja mais sábia da vila, pousou no ombro dele: — Errar é como quicar, pequeno slime. Cada quedinha ensina a pular mais alto. Eu erro 42 vezes antes de aprender a voar direito!',
        sceneEmoji: '🦉💬',
      },
      {
        text: 'No dia seguinte, Bolha levantou a mãozinha gelatinosa. Errou a conta... e o quadro mágico riu em cores! Bolha respirou fundo, tentou de novo e acertou. A sala inteira comemorou. Errar, ele descobriu, era o primeiro passo de acertar.',
        sceneEmoji: '🎉🙌',
      },
    ],
    questions: [
      {
        id: 'tale_bolha_q1',
        prompt: 'Por que Bolha não respondia, mesmo sabendo a resposta?',
        options: [
          'Porque estava com sono',
          'Porque tinha medo de errar',
          'Porque não tinha estudado',
          'Porque não gostava da escola',
        ],
        correctIndex: 1,
        explanation:
          'Isso mesmo! O medo de errar prendia as palavras de Bolha. Muita gente sente isso — e a história mostra que tem solução!',
      },
      {
        id: 'tale_bolha_q2',
        prompt: 'O que Sabichão contou sobre a própria história de aprender a voar?',
        options: [
          'Que nasceu sabendo voar',
          'Que voou de primeira, sem errar nunca',
          'Que errou 42 vezes antes de voar direito',
          'Que nunca tentou voar',
        ],
        correctIndex: 2,
        explanation:
          'Exato! Até a coruja mais sábia da vila errou 42 vezes. Errar faz parte de aprender TODAS as coisas novas!',
      },
    ],
    rewardPoints: 30,
    bnccCodes: ['EF35LP02', 'EF35LP03'],
  },
  {
    id: 'sabichao_palavras_magicas',
    title: 'A Coruja Guardiã das Palavras Mágicas',
    emoji: '🦉✨',
    synopsis:
      'No Livro de Ouro, cada palavra bem escrita vira um feitiço de luz. Faísca precisa de ajuda para escrever FELIZ... ou seria FELIS?',
    themeClasses: {
      box: 'border-indigo-400/80',
      badge: 'bg-indigo-400 text-slate-950',
    },
    pages: [
      {
        text: 'Na Floresta das Letras vivia Sabichão, a coruja guardiã do Livro de Ouro. Dizem que cada palavra bem escrita ali virava um feitiço de luz — e cada palavra escrita errada fazia o feitiço dar risada e se apagar.',
        sceneEmoji: '📖✨',
      },
      {
        text: 'Um dia, o dragãozinho Faísca chegou voando depressa: — Guardião! Preciso escrever um cartão para minha mamãe, mas não sei se é FELIZ ou FELIS! As penas de Sabichão brilharam de emoção: uma aventura ortográfica!',
        sceneEmoji: '🐲💌',
      },
      {
        text: '— Quando a letra faz o som de Z no final da palavra, usamos o Z mágico — piou a coruja. — FELIZ carrega dois feitiços: o F de festa e o Z de zangão. Juntos, eles acendem o cartão inteiro!',
        sceneEmoji: '🦉🔤',
      },
      {
        text: 'Faísca escreveu FELIZ com letra de fogo — e o cartão voou pelos ares soltando estrelinhas. Daquele dia em diante, o dragãozinho pediu uma dica nova a cada noite. Porque palavras bem escritas, na Floresta das Letras, são magia pura.',
        sceneEmoji: '🌟📮',
      },
    ],
    questions: [
      {
        id: 'tale_sabichao_q1',
        prompt: 'No Livro de Ouro, o que acontecia com as palavras escritas erradas?',
        options: [
          'Viravam feitiços de luz',
          'O feitiço dava risada e se apagava',
          'Ficavam invisíveis',
          'Puniam quem escreveu',
        ],
        correctIndex: 1,
        explanation:
          'Isso mesmo! A palavra errada fazia o feitiço rir e se apagar. Na escola é parecido: a grafia certa acende o sentido da frase!',
      },
      {
        id: 'tale_sabichao_q2',
        prompt: 'Segundo Sabichão, quando usamos a letra Z no final da palavra?',
        options: [
          'Quando a letra tem som de Z',
          'Só em nomes de dragões',
          'Nunca usamos Z no final',
          'Quando a palavra é longa',
        ],
        correctIndex: 0,
        explanation:
          'Exato! FELIZ termina com o som "iz" — por isso o Z mágico entra em cena. Ouvir o som da palavra ajuda a escrevê-la!',
      },
    ],
    rewardPoints: 30,
    bnccCodes: ['EF35LP02', 'EF03LP01', 'EF35LP03'],
  },
];
