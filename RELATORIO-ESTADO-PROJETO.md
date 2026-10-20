# 📋 Relatório de Estado do Projeto — Kids-Player

**Data da análise:** 20/10/2026, 15:46–16:28 (BRT)
**Workspace:** `Projeto Kids-Player - Copia`
**Versão declarada:** 1.0.0 (arquitetura interna 2.2, conforme histórico de commits)

---

## 1. Visão Geral

**Kids-Player** é uma plataforma lúdica de reforço escolar gamificado, alinhada à **BNCC**, voltada ao **3º e 4º ano do Ensino Fundamental** (8 a 10 anos), com estética **Pixel Art retrô**. Inclui 8 minijogos curriculares, 15 PETs companheiros colecionáveis, economia ética (sem dinheiro real/anúncios), ranking, quests diárias, Passe da Sabedoria e **Modo Foco** (apoio pedagógico para atenção/TDAH tratado como dado sensível de saúde).

O projeto está **maduro e funcional no seu núcleo**, mas **atualmente não compila** devido a uma edição inacabada da feature "Vila dos Pets" em andamento (detalhes na seção 5).

---

## 2. Stack Tecnológica

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework | Next.js (App Router, Turbopack) | **16.4.2** |
| UI | React | 19.3.0 |
| Linguagem | TypeScript (modo `strict`) | 5.x |
| Estilo | Tailwind CSS (via `@tailwindcss/postcss`) | 4.x |
| Backend/Banco | Supabase (PostgreSQL + Auth + RLS) | JS SDK ^2.49.1 |
| Efeitos | canvas-confetti, lucide-react | ^1.9.4 / ^1.59.0 |
| Áudio | Web Audio API sintetizado (zero assets) + Web Speech API (TTS/STT) | nativo |
| PWA | manifest.json + sw.js + PwaRegister | — |
| Runtime local | Node / npm | 24.19.0 / 11.17.0 |
| Hospedagem prevista | Vercel (plano gratuito) | — |

⚠️ **Nota:** Next.js 16 tem breaking changes relevantes vs. versões anteriores (o próprio `AGENTS.md` do projeto alerta). Confirmado na prática: o subcomando `next lint` **foi removido** nesta versão.

---

## 3. Estrutura e Volume de Código

**34 arquivos TS/TSX em `src/`, ≈12.200 linhas não-vazias.** Composição:

| Área | Conteúdo |
|---|---|
| `src/app/` (20 arquivos) | layout raiz + globals.css + **18 rotas de página**: landing, cadastro, login, hub de jogos, **8 minijogos** (tabuada-espacial, biomas, fracoes, matematica, portugues, ciencias, ingles, digitacao), perfil, ranking, pets, missoes, responsavel e **vila (nova, não commitada)** |
| `src/components/` (7) | Navbar (HUD), PetCompanion, PetIcon (SVG pixel art p/ 15 pets), PixelButton, CustomCursor, ParticleTrail, PwaRegister |
| `src/lib/` (7) | auth-context (estado + persistência), content-data (catálogos), sound-effects (sintetizador 8-bit), speech, nickname-moderator, supabase, types |
| `supabase/schema.sql` | 746 linhas: **22 tabelas**, RLS em 100% delas, 2 stored procedures seguras, 3 views de ranking (diário/semanal/mensal), seed completo |
| `public/` | manifest.json, sw.js, ícones SVG 192/512 |
| `scratch/` (gitignored) | test-suite.ts (integridade) + test-routes.js (smoke test de 17 rotas) |

### Volumes de conteúdo (validados por teste automatizado)
- **43 questões** no QUESTION_BANK (TS) + 4 questões no seed SQL, com código BNCC por habilidade
- **15 PETs** (normal → mítico), **16 acessórios**, **10 conquistas**, **14 palavras** de inglês com pronúncia
- 6 matérias, 8 unidades temáticas, 12 habilidades BNCC mapeadas (EF03MA05, EF04LP01, EF03CI07…)
- Lootbox com **chances transparentes**: 60% normal / 25% raro / 10% épico / 4% lendário / 1% mítico

---

## 4. Estado do Git

- **Branch:** `master` · **13 commits** · autor `2KCine Player <2kcine.player@gmail.com>`
- **🔴 Nenhum remote configurado** — o repositório existe **apenas nesta pasta** (sem backup em GitHub/GitLab).
- **Último commit:** `6032030` — 18/10/2026 10:43 ("chore: adicionar scratch/ ao .gitignore")
- **Histórico bem disciplinado** com conventional commits em fases claras: Fase 1 (fundação) → Fase 2 (núcleo de aprendizado) → Fase 3 (economia de PETs/lootbox) → Fase 4 (ranking/missoes) → Fase 5 (inglês por voz, ciências, digitação) → Fase 6 (PWA, painel do responsável, polimento) → Expansão 2.2 (frações, seed enriquecido) → fixes de segurança (moderador de nicknames).

### Trabalho não commitado (feature em andamento — "Vila Mágica dos Pets")
| Arquivo | Situação |
|---|---|
| `src/app/vila/page.tsx` | **NOVO** (450 linhas, não rastreado) — editor de vila em grade 8×6, catálogo com 19 itens em 4 categorias, pet que passeia sozinho, persistência em localStorage |
| `src/app/pets/page.tsx` | +8 linhas: botão "🏡 VILA DOS PETS" |
| `src/components/Navbar.tsx` | +1 linha: link "🏡 Vila" no menu |
| `src/lib/sound-effects.ts` | +76 linhas: 3 sons novos (playWoodPlace, playPageFlip, playApplause) — **⚠️ com bug de sintaxe, ver seção 5** |

Tudo editado em **18/10 entre 14:51 e 14:54** (após o último commit e após o último build).

---

## 5. Achados por Severidade

### 🔴 CRÍTICO — O projeto não compila neste estado
`src/lib/sound-effects.ts:303-305` — os 3 métodos novos (`playWoodPlace`, `playPageFlip`, `playApplause`) foram **colados dentro do corpo de `playPotionBubble()`**, substituindo o fechamento do método anterior. Faltam as linhas `});`, `} catch {}` e `}` após a linha 303.

**Evidência:** `tsc --noEmit` falha com **7 erros** (TS1128, TS1005×5, TS1472 em `sound-effects.ts`), o que quebra `npm run dev` e `npm run build` para qualquer pessoa que abrir o projeto agora.
**Correção:** trivial — reinserir as 3–4 linhas de fechamento. Os 3 métodos novos em si estão corretos.

### 🟠 ALTO — `npm run lint` quebrado (duplamente)
1. Next.js 16 **removeu o subcomando `next lint`** (confirmado: o CLI interpreta "lint" como nome de diretório e falha).
2. **Não existe arquivo de configuração ESLint** na raiz (nem `eslint.config.mjs`, nem `.eslintrc*`), embora `eslint` 9 e `eslint-config-next` estejam instalados como devDependencies.
**Correção:** criar `eslint.config.mjs` com flat config do `eslint-config-next` e trocar o script para `eslint .`.

### 🟡 MÉDIO — Feature Vila incompleta
- O catálogo define `price` por item, mas a UI renderiza **"Grátis ✨" para tudo** (o campo de preço não é usado — ou a intenção era cobrar moedas, ou o campo deve ser removido).
- A rota `/vila` **não está no smoke test** (`scratch/test-routes.js` cobre 17 rotas, a vila é a 18ª).
- Os sons `playPageFlip`/`playApplause` já prontos para um **"Teatro dos Contos"** que ainda não tem página — indício de próxima feature planejada.

### 🟡 MÉDIO — Testes existem, mas não são executáveis por rotina
- A suíte de integridade (`scratch/test-suite.ts`) é excelente e **passa 212/212** (via `npx -y tsx`): valida banco de questões, consistência 15 pets ↔ renderer SVG, 16 acessórios, 10 conquistas, moderador de nicknames e consistência TS ↔ schema.sql.
- Porém: **não há script `test` no package.json**, `tsx` não é devDependency (depende de download via npx) e `scratch/` é **gitignored** — nada disso roda em CI/pre-commit; o conhecimento dos testes vive só nesta máquina.

### 🟢 POSITIVO — Modo demo e backend pronto para plugar
- `.env.local` contém os valores de Supabase como **placeholders** (apenas `NEXT_PUBLIC_APP_URL` real). O app detecta isso (`isSupabaseConfigured`) e opera em **modo demo gracioso via localStorage** (chaves `kids_*`) — 100% navegável sem backend.
- O `supabase/schema.sql` está completo e coeso (RLS em 22 tabelas, policies por aluno/responsável, funções seguras de transação de pontos e lootbox anti-abuso, views de ranking), pronto para executar no painel Supabase quando houver credenciais reais.
- Existe um **build de produção de 18/10 10:28** (`.next/BUILD_ID: VuGceARd3ueIPdCo5P94X`), anterior ao WIP — representa o HEAD, mas **não** inclui a Vila.

### 🟢 POSITIVO — Segurança & conformidade infantil bem endereçadas
- **RLS em 100% das tabelas**; Modo Foco e sessões de foco restritos ao próprio aluno/responsável; dados do responsável nunca expostos em telas públicas.
- Moderador de nicknames com normalização de acentos, bloqueio de e-mail/telefone/endereço/sobrenomes/ofensas (último commit foi exatamente um hardening disso).
- Economia sem dinheiro real, lootbox com probabilidades públicas, sem anúncios — coerente com LGPD/ECA Digital declarado no README.
- `.env.local` corretamente gitignored.

### 🔵 BAIXO — Higiene
- Pasta `UsersPCtestnpmdirnpm-cache/` (cache do npm criado dentro do projeto por configuração de ambiente) — gitignored, mas pode ser removida para liberar espaço.
- README levemente desatualizado na seção de estrutura: não menciona `vila/`, `ParticleTrail.tsx` e `PwaRegister.tsx`.
- Linha em branco extra no fim de `sound-effects.ts` (cosmético, junto da correção crítica).
- `sw.js` com cache estático `v1` (sem versionamento por build) — funciona, mas pode servir conteúdo antigo após deploys; refinável.

---

## 6. Diagnóstico Resumido

> O projeto está **estruturalmente saudável e bem engenheirado** (arquitetura em camadas limpa, conteúdo curricular validado por 212 testes, banco com RLS exemplar, histórico de git disciplinado). O estado atual é de **feature em progresso interrompida a meio caminho**: a "Vila Mágica dos Pets" está ~90% pronta, mas um erro de colagem em `sound-effects.ts` derruba a compilação inteira. Não há backup remoto do repositório.

---

## 7. Recomendações Priorizadas

| # | Ação | Impacto | Esforço |
|---|---|---|---|
| 1 | **Corrigir o fechamento de `playPotionBubble()`** em `sound-effects.ts:303` | Desbloqueia dev/build imediatamente | 5 min |
| 2 | **Commitar a feature Vila**: decidir se itens custam moedas (usar `price`) ou são grátis (remover o campo); adicionar `/vila` ao smoke test | Consolida o WIP; evita perda do trabalho | 30 min |
| 3 | **Repor o lint**: criar `eslint.config.mjs` (flat config) + mudar script para `eslint .` | Recupera verificação de qualidade | 15 min |
| 4 | **Oficializar os testes**: `"test": "tsx scratch/test-suite.ts"` no package.json + `tsx` como devDependency | Regressão de conteúdo passa a ser detectável | 10 min |
| 5 | **Configurar remote Git** (GitHub privado) e fazer push | Elimina risco de perda total | 10 min |
| 6 | Quando tiver credenciais reais: rodar `supabase/schema.sql` no painel e preencher `.env.local`; considerar mover a persistência demo→Supabase | Backend de produção | ~2 h |
| 7 | Próximos passos de produto sugeridos pelo código: "Teatro dos Contos" (sons já prontos) e integração real do Supabase | Roadmap | — |

---

*Relatório gerado por análise automatizada do diretório: varredura de árvore, leitura de configurações, `git status/log/diff`, execução de `tsc --noEmit`, `next lint` e da suíte de testes `scratch/test-suite.ts` (212/212 aprovados).*

---

## 8. Atualização Pós-Intervenção (20/10/2026, 17:20)

As recomendações da seção 7 foram executadas nesta sessão, na ordem citada:

| # | Recomendação | Status | Commit |
|---|---|---|---|
| 1 | Corrigir o fechamento de `playPotionBubble()` em `sound-effects.ts` | ✅ Executado | `51b2fa6` |
| 2 | Finalizar a Vila com economia de moedas e commitar a feature | ✅ Executado | `0a411ab` |
| 3 | Repor o lint (ESLint 9 flat config) e corrigir os erros | ✅ Executado | `5e9956e` + `51e7cce` |
| 4 | Oficializar os testes (`npm test` + suíte em `tests/` rastreável) | ✅ Executado | `51e7cce` |
| 5 | Configurar remote Git e fazer push | ⏳ Pendente — requer URL do repositório (gh CLI não instalado) | — |
| 6 | Integração real do Supabase | ⏳ Pendente — requer credenciais do painel do usuário | — |

### Detalhes das mudanças
- **Vila dos Pets completa:** os 19 itens do catálogo agora custam moedas de estudo (`addPoints(-price, 'vila_buy_<item>')`, espelhando o padrão de `buyAccessory`); o kit inicial (pisos gratuitos + itens do modelo padrão) já vem desbloqueado; itens adquiridos persistem em `kids_player_village_owned`; feedback visual de "Salvo!", "Item adquirido!" e "Moedinhas insuficientes!" com mensagens pedagógicas do pet. Import de `Link` ausente em `pets/page.tsx` corrigido; rota `/vila` adicionada ao smoke test; README atualizado (vila, ParticleTrail, PwaRegister).
- **Lint restaurado:** `eslint.config.mjs` flat config oficial do Next 16 (`core-web-vitals` + `typescript`); script `lint: eslint .`. Foram corrigidos **todos os 22 erros** reais apontados: 3 funções referenciadas em effects antes da declaração (`loginAsDemo`, `handleReadQuestion`, `handlePlayAudio` — risco de closure obsoleta), 2 chamadas de `Date.now()` na renderização (WPM da digitação agora atualiza via interval), 4 aspas não escapadas no inglês, 3 `any` eliminados (augmentação de `WindowEventMap` no CustomCursor; `CATEGORY_TABS` tipado na vila) e o `require()` do smoke test convertido para ESM. A regra `react-hooks/set-state-in-effect` ficou como *warning* documentado (padrão legítimo de hidratação SSR — 9 ocorrências de leitura de localStorage/matchMedia/service worker no mount).
- **Testes oficiais:** suíte de integridade movida de `scratch/` (gitignored) para `tests/integrity-suite.ts`; `tsx` promovido a devDependency; `npm test` roda as 212 verificações; `npm run test:routes` roda o smoke test ESM de 18 rotas.

### Saúde verificada no final da sessão
| Verificação | Resultado |
|---|---|
| `tsc --noEmit` | ✅ 0 erros |
| `npm run lint` (`eslint .`) | ✅ 0 erros · 116 warnings (unused vars e hidratação SSR) |
| `npm test` | ✅ 212/212 aprovados |
| `next build` (produção, Turbopack) | ✅ Compilou em 3s · 19 rotas pré-renderizadas |
| Smoke test (`next start` + 18 rotas) | ✅ 18/18 HTTP 200 com HTML válido |
