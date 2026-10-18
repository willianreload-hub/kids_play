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

## 📂 Estrutura de Pastas

```text
Projeto Kids-Player/
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Layout raiz com fontes, AuthProvider, Navbar e PetCompanion
│   │   ├── page.tsx           # Landing Page imersiva com apresentação lúdica
│   │   ├── globals.css        # Design System pixel art, botões 3D e Modo Foco
│   │   ├── cadastro/          # Cadastro com responsável, nickname moderado, avatar, pet e Modo Foco
│   │   ├── login/             # Login do aluno com modo de demonstração instantâneo
│   │   ├── jogos/             # Hub das matérias escolares BNCC e minijogos originais
│   │   ├── perfil/            # Perfil do aluno, avatar, XP, ajustes finos do Modo Foco e dados do responsável
│   │   ├── ranking/           # Trono dos Campeões com coroa pixel art, top diário/semanal/mensal e pódio
│   │   ├── pets/              # Álbum de PETs, raridades, chances transparentes e abertura de baú por pontos
│   │   └── missoes/           # Quests diárias, streak e conquistas
│   ├── components/
│   │   ├── Navbar.tsx         # HUD de jogo: moedas, streak, nível, toggle de som e Modo Foco
│   │   ├── PetCompanion.tsx   # Assistente flutuante com balão de fala dinâmico e leitura em voz
│   │   ├── PetIcon.tsx        # Renderizador nativo SVG em pixel art para todos os PETs
│   │   └── PixelButton.tsx    # Botão tátil 3D com áudio de clique embutido
│   └── lib/
│       ├── types.ts           # Definições de tipos TypeScript do domínio e banco
│       ├── supabase.ts        # Cliente Supabase com verificação de credenciais
│       ├── auth-context.tsx   # Gerenciamento de estado do aluno, pontos, pets e Modo Foco
│       ├── content-data.ts    # Catálogo de matérias BNCC, PETs iniciais, avatares e quests
│       ├── nickname-moderator.ts # Moderador de apelidos infantis (LGPD & ECA Digital)
│       ├── sound-effects.ts   # Sintetizador Web Audio API de efeitos 8-bit sem dependências
│       └── speech.ts          # Web Speech API para leitura em voz alta e reconhecimento
├── supabase/
│   └── schema.sql             # Esquema SQL completo com RLS, ledger de pontos e stored procedures
├── .env.example
├── .env.local
└── package.json
```

---

## 🛡️ Segurança Infantil, Privacidade & LGPD

- **ECA Digital & LGPD:** Coleta mínima de dados. Nomes civis, telefones e emails pertencem ao responsável legal e nunca são expostos.
- **Moderação de Nicknames:** O algoritmo bloqueia palavras de baixo calão, números de telefone, emails, endereços físicos e sobrenomes comuns.
- **Modo Foco como Dado Sensível de Saúde:** O indicador de Modo Foco e seus relatórios são estritamente restritos ao aluno e seu responsável via políticas de Row Level Security (RLS). Nunca é exibido nenhum diagnóstico em telas públicas ou rankings.
- **Economia Ética e Segura:** 0% de dinheiro real, sem compras in-app, sem anúncios e com exibição 100% transparente das probabilidades de abertura dos baús surpresa.
- **Row Level Security (RLS):** Ativado em 100% das tabelas do banco de dados PostgreSQL.