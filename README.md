# Kids-Player - Plataforma de Reforço Escolar Gamificado

Plataforma lúdica de reforço escolar alinhada à **BNCC** para crianças do **3º e 4º ano do Ensino Fundamental** (8 a 10 anos). Desenvolvida com estética **Pixel Art retrô**, minijogos originais inspirados em gêneros clássicos, sistema de **PETs companheiros**, **Trono dos Campeões (Ranking)**, **Quests Diárias** e o inovador **Modo Foco** (apoio pedagógico para atenção e TDAH).

---

## 🛠️ Stack Tecnológica

- **Frontend:** Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS
- **Design System:** Pixel Art Retrô (Press Start 2P + Fredoka), botões táteis 3D com som físico
- **Áudio & Voz:** Web Audio API (sintetizador 8-bit nativo zero-bandwidth) + Web Speech API (leitura em voz e repetição)
- **Backend & Banco:** Supabase (PostgreSQL, Auth, Storage e Row Level Security)
- **Hospedagem:** Vercel (plano gratuito)
- **Segurança & Ética:** Alinhado à LGPD e ECA Digital (sem anúncios, sem chat aberto, sem dinheiro real, proteção estrita de dados sensíveis)

---

## 🚀 Como Rodar Localmente

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Variáveis de Ambiente
Copie o arquivo de exemplo:
```bash
copy .env.example .env.local
```
Edite `.env.local` com suas credenciais do Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
> **Nota de Desenvolvimento:** O aplicativo possui modo de demonstração local gracioso (localStorage). Se as chaves do Supabase forem mantidas como placeholder, a aplicação funciona imediatamente para testes e navegação completa!

### 3. Executar o Esquema SQL no Supabase
1. Acesse o painel do seu projeto no [Supabase](https://supabase.com).
2. Abra a aba **SQL Editor**.
3. Copie e cole todo o conteúdo do arquivo `supabase/schema.sql` e clique em **Run**.
4. (Opcional) Em **Authentication > Providers > Email**, desmarque "Confirm email" para testes ágeis locais.

### 4. Rodar o Servidor de Desenvolvimento
```bash
npm run dev
```
Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 🌎 Deploy de Produção

O Kids-Player está publicado na Vercel: **[https://kids-play-five.vercel.app](https://kids-play-five.vercel.app)**

- O repositório oficial é [`willianreload-hub/kids_play`](https://github.com/willianreload-hub/kids_play) (privado). Cada push em `master` dispara o pipeline de CI (GitHub Actions: lint, TypeScript, suíte de integridade e build) e um novo deploy automático na Vercel.
- A aplicação roda em **modo demonstração** (localStorage) até que as credenciais reais do Supabase sejam configuradas — veja o `PLANO-DE-MELHORIAS-E-EXPANSAO.md`, Fase 2.
- **Regra de release PWA:** a cada deploy em produção, bumpar a constante `CACHE_VERSION` em `public/sw.js` para invalidar o cache dos navegadores que já instalaram o app.

---

## 📂 Estrutura de Pastas & Minijogos

```text
Projeto Kids-Player/
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Layout raiz com fontes, AuthProvider, Navbar, CustomCursor e PetCompanion
│   │   ├── page.tsx           # Landing Page imersiva com apresentação lúdica
│   │   ├── globals.css        # Design System pixel art, botões 3D, auras neon e Modo Foco
│   │   ├── cadastro/          # Cadastro com responsável, nickname moderado, avatar, pet e Modo Foco
│   │   ├── login/             # Login do aluno com modo de demonstração instantâneo
│   │   ├── jogos/             # Hub das matérias escolares BNCC, Mapa-Mundi e Passe da Sabedoria
│   │   │   ├── biomas/        # Expedição pelos 9 Ecossistemas do Brasil (Geografia/Ciências)
│   │   │   ├── ciencias/      # Estação Científica da Natureza (Laboratório Interativo)
│   │   │   ├── digitacao/     # Mestre do Teclado Retrô (Agilidade e Letramento)
│   │   │   ├── fracoes/       # Alquimia das Frações & Medidas (Corte de Tortas e Caldeirão)
│   │   │   ├── ingles/        # Ilha do Inglês Falante com Reconhecimento de Voz (TTS & STT)
│   │   │   ├── matematica/    # Mundo dos Blocos da Sabedoria (Sandbox e Mineração)
│   │   │   ├── portugues/     # Salto nas Ilhas Celestes (Plataforma e Ortografia)
│   │   │   └── tabuada-espacial/ # Corrida Espacial da Tabuada (Combos Retro x1 a x5 e Boss)
│   │   ├── perfil/            # Perfil do aluno, Sala de Troféus, Streak 7 Dias, Roleta Diária e Cursors
│   │   ├── ranking/           # Trono dos Campeões com coroa pixel art, top diário/semanal/mensal e pódio
│   │   ├── pets/              # Álbum com 15 PETs, 16 Acessórios, Cuidados/Afeto e Baú por Pontos
│   │   ├── vila/              # Vila Mágica dos Pets: construa e decore o lar do companheiro com moedas de estudo
│   │   ├── missoes/           # Quests diárias dinâmicas, baús semanais e 10 conquistas
│   │   └── responsavel/       # Painel de acompanhamento pedagógico para os pais
│   ├── components/
│   │   ├── CustomCursor.tsx   # Ponteiro temático retrô com faíscas e efeito tátil de clique
│   │   ├── Navbar.tsx         # HUD de jogo: moedas, streak, nível, toggle de som e Modo Foco
│   │   ├── ParticleTrail.tsx  # Rastro de partículas retrô que segue o cursor mágico
│   │   ├── PetCompanion.tsx   # Assistente flutuante com balão de fala dinâmico e leitura em voz
│   │   ├── PetIcon.tsx        # Renderizador nativo SVG em pixel art para os 15 PETs
│   │   ├── PixelButton.tsx    # Botão tátil 3D com áudio de clique embutido
│   │   └── PwaRegister.tsx    # Registro do Service Worker para instalação como app (PWA offline)
│   └── lib/
│       ├── types.ts           # Definições de tipos TypeScript do domínio e banco
│       ├── supabase.ts        # Cliente Supabase com verificação de credenciais
│       ├── auth-context.tsx   # Gerenciamento de estado do aluno, pontos, pets e Modo Foco
│       ├── content-data.ts    # Catálogo de matérias BNCC, 15 PETs, 16 acessórios, 10 conquistas e banco de questões
│       ├── nickname-moderator.ts # Moderador de apelidos infantis (LGPD & ECA Digital)
│       ├── sound-effects.ts   # Sintetizador Web Audio API de efeitos 8-bit sem dependências
│       └── speech.ts          # Web Speech API para leitura em voz alta e reconhecimento
├── supabase/
│   └── schema.sql             # Esquema SQL completo com RLS, 15 pets, 16 acessórios, 10 conquistas e BNCC
├── .env.example
├── .env.local
└── package.json
```

---

## 🎮 Minijogos Curriculares BNCC (8 Aventuras)

1. **🚀 Corrida Espacial da Tabuada (`/jogos/tabuada-espacial`)**: Pilotagem espacial arcade, combate a asteroides com multiplicação e divisão (`EF03MA03`, `EF04MA04`) e batalha contra o Chefão Mega Meteoro.
2. **🧭 Expedição pelos Biomas do Brasil (`/jogos/biomas`)**: Sobrevoo de balão pelos 9 grandes ecossistemas brasileiros (Amazônia, Caatinga, Cerrado, Pantanal, Mata Atlântica, Pampa, Manguezais, Araucárias e Cocais), com insígnias de guardião da natureza (`EF03GE04`, `EF04GE05`).
3. **🧪 Alquimia das Frações & Medidas (`/jogos/fracoes`)**: Corte visual de pizzas e tortas mágicas ($\frac{1}{2}$, $\frac{1}{4}$, $\frac{3}{4}$, $\frac{2}{3}$), poções alquímicas e conversão de litros, metros e quilogramas (`EF04MA09`, `EF04MA20`).
4. **⛏️ Mundo dos Blocos da Sabedoria (`/jogos/matematica`)**: Mineração de gemas e pedras respondendo a contas de adição e subtração com reserva (`EF03MA05`).
5. **🌉 Salto nas Ilhas Celestes (`/jogos/portugues`)**: Corrida de plataformas ativando pontes com regras ortográficas de S/SS, R/RR e M antes de P/B (`EF03LP01`).
6. **🔬 Estação Científica da Natureza (`/jogos/ciencias`)**: Observatório ambiental com ciclos da água, seres vivos, fotossíntese e fases da lua (`EF03CI07`, `EF04CI04`, `EF04CI11`).
7. **🗣️ Ilha do Inglês Falante (`/jogos/ingles`)**: Treinamento de pronúncia com síntese e reconhecimento de voz (Web Speech API).
8. **⌨️ Mestre do Teclado Retrô (`/jogos/digitacao`)**: Digitação ágil com medição de velocidade (WPM) e precisão.

---

## 🐾 Companheiros Mágicos & Gamificação Ética

- **15 PETs Colecionáveis:** Pipoca, Bolha, Sabichão, Faísca, Cósmico, Solzinho, Trovãozinho, Gota d'Água, Lupin, Estelar, Titã de Cristal, Glub, Atena, Ignis e Flora — renderizados dinamicamente em SVG pixel-art.
- **16 Acessórios Exclusivos:** Chapéus, óculos steampunk e VR, capas de nebulosa, asas de borboleta e auras de fogo fátuo.
- **Vila Mágica dos Pets:** Construa e decore o lar do seu companheiro em uma grade 8×6 com 19 itens (pisos, móveis, estudos e jardim) adquiridos com as moedas conquistadas estudando.
- **Sistema de Cuidados & Afeto:** Alimentação com frutinhas da sabedoria, carinho interativo com ronrom em 8-bit e diálogos pedagógicos com TTS.
- **Sala de Troféus & Conquistas:** 10 conquistas categorizadas (*Estudo*, *Jogos*, *Pets*, *Hábito*) com resgate de moedas e XP.
- **Fogo do Saber (Streak 7 Dias):** Bônus ativo de +10% de XP diário para estimular o hábito de estudo regular.
- **Roleta da Sabedoria Diária:** 1 baú gratuito por dia com prêmios de até 100 moedas, sem anúncios nem microtransações.
- **Passe da Sabedoria:** Trilha progressiva gratuita de 30 níveis no Hub de Jogos.
- **Ponteiros do Mouse Mágicos:** 5 temas personalizáveis no perfil (`varinha`, `picareta`, `patinha`, `foguete`, `padrao`) com animações de partículas e ondas de clique táteis.

---

## 🛡️ Segurança Infantil, Privacidade & LGPD

- **ECA Digital & LGPD:** Coleta mínima de dados. Nomes civis, telefones e emails pertencem ao responsável legal e nunca são expostos.
- **Moderação de Nicknames:** O algoritmo bloqueia palavras de baixo calão, números de telefone, emails, endereços físicos e sobrenomes comuns.
- **Modo Foco como Dado Sensível de Saúde:** O indicador de Modo Foco e seus relatórios são estritamente restritos ao aluno e seu responsável via políticas de Row Level Security (RLS). Nunca é exibido nenhum diagnóstico em telas públicas ou rankings.
- **Economia Ética e Segura:** 0% de dinheiro real, sem compras in-app, sem anúncios e com exibição 100% transparente das probabilidades de abertura dos baús surpresa.
- **Row Level Security (RLS):** Ativado em 100% das tabelas do banco de dados PostgreSQL.