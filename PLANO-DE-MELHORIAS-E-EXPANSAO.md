# Plano de Melhorias e Expansão — Kids-Player

> **Para agentes executoras:** Este é o plano-mestre. Fases 0–1 estão decompostas em tarefas executáveis passo a passo. Fases 2–5 são escopos de feature: ao iniciar cada uma, gerar o plano de implementação detalhado correspondente (skill `writing-plans`) antes de tocar no código. Os passos usam checkbox (`- [ ]`) para acompanhamento.

**Meta:** Evoluir o Kids-Player de projeto local funcional para plataforma educacional em produção — com pipeline CI/CD, backend real, conteúdo expandido e trilha de gamificação de longo prazo, preservando 100% da ética infantil (LGPD/ECA) e do modo demo.

**Arquitetura atual:** Next.js 16.4.2 App Router (Turbopack), React 19.3, TS strict, Tailwind 4, Supabase (schema pronto, ainda em modo demo via localStorage), PWA básico, Web Audio/Web Speech sem assets externos.

**Stack-alvo:** a mesma + GitHub Actions (CI), Vercel (deploy), Supabase real (Auth/Postgres/RLS), `useSyncExternalStore` para hidratação SSR, suítes `tsx` estendidas (sem runner novo).

**Spec (baseline):** [RELATORIO-ESTADO-PROJETO.md](RELATORIO-ESTADO-PROJETO.md) — estado verificado em 20/10/2026: `tsc` 0 erros · ESLint 0 erros/116 warnings · `npm test` 212/212 · build 19 rotas · smoke 18/18.

---

## Restrições Globais (valem para toda tarefa)

1. **Stack congelada:** Next.js 16.4.2 (App Router), React 19.3, TypeScript `strict`, Tailwind 4 — nenhum downgrade; consultar `node_modules/next/dist/docs/` antes de usar APIs duvidosas.
2. **Idioma:** produto e commits em PT-BR; commits no padrão convencional já usado no repositório (`feat:`, `fix:`, `chore:`, escopo entre parênteses quando útil).
3. **Ética infantil inegociável:** 0% anúncios, 0% dinheiro real/microtransações, **sem chat aberto entre crianças**, chances de lootbox sempre públicas, coleta mínima de dados; Modo Foco continua dado sensível restrito por RLS.
4. **Modo demo é sagrado:** o núcleo do app (jogos, pets, vila, perfil) deve funcionar 100% sem backend — Supabase é camada de sincronização, nunca pré-requisito de gameplay.
5. **Gate de qualidade de TODA mudança:** `npx tsc --noEmit` 0 erros · `npx eslint .` 0 erros · `npm test` verde · `npx next build` ok · mudanças de rota ⇒ atualizar `tests/smoke-routes.mjs` e rodar o smoke.
6. **Commits pequenos:** uma responsabilidade por commit, árvore limpa ao final de cada tarefa.

---

## Visão Geral do Roadmap

| Fase | Foco | Duração estimada | Pré-requisito externo |
|---|---|---|---|
| **0** | Fundação: backup, CI, deploy, warnings zerados | 3–5 dias | URL do repositório remoto (usuário) |
| **1** | Qualidade: hooks de hidratação, testes unitários, split do content-data, PWA v2, acessibilidade AA | ~2 semanas | Fase 0 |
| **2** | Backend real Supabase (multi-perfil, migração demo→nuvem, painel real) | 2–3 semanas | Credenciais Supabase (usuário) |
| **3** | Conteúdo: Teatro dos Contos, banco de questões 43→150, inglês 100 palavras, dificuldade adaptativa | 3–4 semanas | — (paralelizável com a Fase 2) |
| **4** | Gamificação: pets+evolução visual, Vila v2, temporadas, desafios assíncronos éticos | 4–6 semanas | Fase 2 (para os recursos sociais) |
| **5** | Escola & escala: modo turma, LGPD v2, analytics ético, 5º ano, i18n | visão 3–6 meses | Fases 2–3 maduras |

**Diagnóstico que motiva cada fase** (detalhes no RELATORIO): fortes — conteúdo validado (212 testes), RLS exemplar, build verde; dívidas — 116 warnings (unused vars + hidratação SSR), `content-data.ts` monolítico (1.542 linhas), `sw.js` cache-first sem versionamento (serve HTML antigo), **sem backup remoto/CI/deploy**, progresso preso ao localStorage da máquina, banco de 43 questões pequeno para repetição escolar, sons do Teatro dos Contos órfãos (feature anunciada, inexistente).

---

## FASE 0 — Fundação & Backup (3–5 dias)

### Tarefa 0.1 — Remote Git + push (backup)

**Pré-requisito:** usuário cria o repositório no GitHub (privado) e fornece a URL.

- [ ] **Passo 1:** adicionar o remote e subir os 18 commits
```bash
git remote add origin https://github.com/<usuario>/kids-player.git
git push -u origin master
```
- [ ] **Passo 2:** verificar
```bash
git remote -v        # deve listar origin
git log origin/master --oneline -3   # deve mostrar e7d2438 no topo
```
- [ ] **Passo 3:** Commit: nenhum (operações remotas).

### Tarefa 0.2 — CI com GitHub Actions

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Passo 1:** criar `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [master]
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - name: Lint (0 erros, no máximo 20 warnings)
        run: npx eslint . --max-warnings 20
      - name: TypeScript
        run: npx tsc --noEmit
      - name: Integridade de conteúdo (212 checks)
        run: npm test
      - name: Build de produção
        run: npm run build
```

- [ ] **Passo 2:** push e observar o workflow ficar verde na aba Actions.
- [ ] **Passo 3:** Commit: `ci: adicionar pipeline de verificação com GitHub Actions`.

### Tarefa 0.3 — Deploy na Vercel

- [ ] **Passo 1:** importar o repositório na Vercel (New Project → repo do Kids-Player); framework auto-detectado (Next.js 16).
- [ ] **Passo 2:** variável de ambiente em Production: `NEXT_PUBLIC_APP_URL=https://kids-player-<hash>.vercel.app` (a Vercel informa a URL após o 1º deploy; redefinir e redeployar).
- [ ] **Passo 3:** verificar: abrir a URL de produção (landing carrega, Navbar renderiza, demo mode funciona); cada PR passa a gerar URL de preview.
- [ ] **Passo 4:** Commit: nenhum (configuração de plataforma). Registrar a URL de produção no README na seção "Como Rodar".

### Tarefa 0.4 — Zerar warnings de `no-unused-vars` (ratchet de qualidade)

**Contexto:** 107 dos 116 warnings são imports/variáveis não usados (concentrados em `jogos/biomas`, `jogos/ciencias`, `jogos/digitacao`, `perfil`, `ranking`, `pets`). Os ~9 restantes são de `react-hooks/set-state-in-effect` (resolvidos na Fase 1).

- [ ] **Passo 1:** listar os warnings por arquivo
```bash
npx eslint .
```
Anotar os arquivos com avisos `@typescript-eslint/no-unused-vars` (concentrados em `jogos/biomas`, `jogos/ciencias`, `jogos/digitacao`, `perfil`, `ranking`, `pets`).
- [ ] **Passo 2:** em cada arquivo listado, remover os imports/variáveis órfãos (nunca remover o que é usado em JSX ou type-only).
- [ ] **Passo 3:** rodar o gate completo (Restrição 5) — resultado medido em 21/10/2026: **19 warnings** (9 hidratação + 2 exhaustive-deps + 8 regras `@next`), ratchet do CI em 20.
- [ ] **Passo 4:** Commit (um por arquivo ou lote coeso): `chore: remover imports nao utilizados em <area>`.

**Critério de aceite da Fase 0:** push verde no CI · produção na Vercel · ratchet `--max-warnings 20` respeitado (19 atuais).

---

## FASE 1 — Qualidade, PWA v2 & Testes (~2 semanas)

### Tarefa 1.1 — Primitivas de hidratação SSR (`useLocalStorageState` + `useMediaQuery`)

**Files:**
- Create: `src/lib/client-hooks.ts`
- Modify: `src/components/CustomCursor.tsx`, `src/components/ParticleTrail.tsx`, `src/components/PwaRegister.tsx`
- Test: verificação via ESLint (warnings de hidratação somem) + navegação manual

**Interfaces (produz):**
- `useLocalStorageState<T>(key: string, fallback: T): readonly [T, (next: T | ((prev: T) => T)) => void]`
- `useMediaQuery(query: string): boolean`

- [ ] **Passo 1:** criar `src/lib/client-hooks.ts` com o conteúdo abaixo (o cache de snapshot por string bruta evita o loop infinito clássico do `useSyncExternalStore` com objetos):

```tsx
'use client';

import { useCallback, useSyncExternalStore } from 'react';

const listeners = new Set<() => void>();
const snapshots = new Map<string, { raw: string | null; value: unknown }>();

function emitChange() {
  listeners.forEach((l) => l());
}

function getSnapshot<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  const cached = snapshots.get(key);
  if (cached && cached.raw === raw) return cached.value as T;
  let value: T = fallback;
  if (raw !== null) {
    try {
      value = JSON.parse(raw) as T;
    } catch {
      value = fallback;
    }
  }
  snapshots.set(key, { raw, value });
  return value;
}

/** Estado persistido em localStorage, hidratado sem setState-in-effect e sem loop de snapshot. */
export function useLocalStorageState<T>(key: string, fallback: T) {
  const subscribe = useCallback((onChange: () => void) => {
    listeners.add(onChange);
    window.addEventListener('storage', onChange);
    return () => {
      listeners.delete(onChange);
      window.removeEventListener('storage', onChange);
    };
  }, []);

  const value = useSyncExternalStore(
    subscribe,
    () => getSnapshot(key, fallback),
    () => fallback
  );

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = getSnapshot(key, fallback);
      const resolved = typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
      localStorage.setItem(key, JSON.stringify(resolved));
      snapshots.set(key, { raw: JSON.stringify(resolved), value: resolved });
      emitChange();
    },
    [key, fallback]
  );

  return [value, setValue] as const;
}

/** matchMedia reativo, sem setState síncrono em effect. */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback((onChange: () => void) => {
    const mql = window.matchMedia(query);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false
  );
}
```

- [ ] **Passo 2 — CustomCursor:** trocar `const [theme, setTheme] = useState<CursorTheme>('varinha')` + effect de load por `const [theme, setTheme] = useLocalStorageState<CursorTheme>('kids_cursor_theme', 'varinha')`; o listener `change_cursor_theme` passa a chamar `setTheme(e.detail)`; a visibilidade (efeito das linhas ~50) passa a ser derivada no render, **sem tocar em `window`** (a pré-renderização estática roda no servidor): `const prefersReduced = useMediaQuery('(prefers-reduced-motion: reduce)'); const isTouch = useMediaQuery('(pointer: coarse)'); const hideCursor = isTouch || prefersReduced || focusMode.is_active || focusMode.reduced_stimuli || theme === 'padrao';` — o `document.body.classList` vira um `useEffect` de efeito colateral puro (sem setState).
- [ ] **Passo 3 — ParticleTrail:** substituir o effect que calcula `enabled` por `const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)'); const enabled = !reducedMotion && !focusMode.is_active && !focusMode.reduced_stimuli;` (state `enabled` é removido).
- [ ] **Passo 4 — PwaRegister:** `const isStandalone = useMediaQuery('(display-mode: standalone)');` no lugar do bloco matchMedia + `setIsInstalled(true)` do effect; manter `beforeinstallprompt` como está (é listener de evento, não hidratação).
- [ ] **Passo 5:** gate completo (Restrição 5) + conferir na navegação: tema do cursor continua persistindo entre reloads; partículas continuam desativando com Modo Foco.
- [ ] **Passo 6:** Commit: `refactor(hooks): primitivas useLocalStorageState/useMediaQuery e fim dos setState-in-effect de hidratacao`.

### Tarefa 1.1b — Hidratação restante nas páginas (`fracoes`, `perfil`, `pets`)

**Files:**
- Modify: `src/app/perfil/page.tsx:45-59`, `src/app/pets/page.tsx:52-63`, `src/app/jogos/fracoes/page.tsx:184-195`
- Estudado no código (21/10/2026): cada warning tem uma causa distinta.

- [ ] **Passo 1 — perfil (roleta diária):** o effect lê `kids_player_last_spin_date` e compara com a data de hoje. Substituir `hasSpunToday` por `const [lastSpinDate, setLastSpinDate] = useLocalStorageState<string | null>('kids_player_last_spin_date', null)` e derivar `const hasSpunToday = lastSpinDate === new Date().toISOString().slice(0, 10);`. **Atenção ao formato:** o hook grava JSON (`"2026-10-21"` com aspas) e o valor legado é texto cru — normalizar uma única vez: ao ler `null` do hook mas existir valor cru no `localStorage`, converter com `JSON.parse` no try/catch do próprio hook já resolve (o catch cai no fallback e a próxima gravação já sai em JSON). `handleSpinWheel` passa a gravar via `setLastSpinDate(today)` em vez de `localStorage.setItem` direto.
- [ ] **Passo 2 — pets (afeto por pet):** trocar o effect que lê `kids_player_pet_affection_<petId>` por `const [savedAffection, setSavedAffection] = useLocalStorageState<number>(`kids_player_pet_affection_${activePet?.id ?? 'none'}`, 70)` e derivar `const petAffection = savedAffection`. O `updateAffection` existente passa a chamar `setSavedAffection` (o hook já persiste). A frase de saudação no mesmo effect (reset quando o pet ativo muda) sai do effect e vai para dentro do seletor de pet (handler que chama `setActivePet`) ou de um atributo `key` no bloco de fala.
- [ ] **Passo 3 — fracoes (reset de rodada):** o effect reseta `interactiveFilled`, `selectedOptionId` e `feedback` quando `currentIndex` muda ("reset state on prop change"). Mover os três resets para a função que avança o desafio (a que faz `setCurrentIndex(prev => prev + 1)`), imediatamente antes do incremento; o bloco de TTS do Modo Foco permanece no effect (timer + limpeza — sem setState síncrono).
- [ ] **Passo 4:** gate completo + navegação manual: roleta diária continua bloqueando no mesmo dia; afeto persiste por pet; frações reiniciam limpas entre desafios.
- [ ] **Passo 5:** Commit: `refactor(hooks): hidratacao de roleta, afeto de pets e reset de fracoes sem setState-in-effect`.

**Nota de escopo:** o único warning `set-state-in-effect` que permanece é o do `PetCompanion` (mensagem contextual reativa ao Modo Foco e ao nickname — caso legítimo de effect, já documentado no `eslint.config.mjs`).

### Tarefa 1.2 — Helpers puros + suíte unitária

**Files:**
- Create: `src/lib/game-logic.ts`, `tests/unit-suite.ts`
- Modify: `package.json` (script), `src/app/jogos/digitacao/page.tsx` (usa `calcWpm`)

**Interfaces (produz):** `calcWpm(wordsTyped: number, elapsedMs: number): number` · `LOOTBOX_ODDS: Record<PetRarity, number>` · `rollLootboxDemo(rng?: () => number): PetRarity` · `nextDifficulty(current: 1|2|3, wasCorrect: boolean, streak: number): 1|2|3`

- [ ] **Passo 1:** criar `src/lib/game-logic.ts`:

```ts
import type { PetRarity } from './types';

/** WPM calibrado para crianças: piso de 1s e teto de 60 (espelha o comportamento do jogo de digitação). */
export function calcWpm(wordsTyped: number, elapsedMs: number): number {
  const minutes = Math.max(elapsedMs, 1000) / 60000;
  return Math.min(60, Math.round(wordsTyped / minutes));
}

/** Chances públicas da lootbox — única fonte de verdade do cliente; o servidor valida em secure_open_lootbox. */
export const LOOTBOX_ODDS: Record<PetRarity, number> = {
  normal: 60,
  raro: 25,
  epico: 10,
  lendario: 4,
  mitico: 1,
};

/** Sorteio demo (localStorage) com rng injetável para testes determinísticos. */
export function rollLootboxDemo(rng: () => number = Math.random): PetRarity {
  const roll = rng() * 100;
  let acc = 0;
  for (const [rarity, odds] of Object.entries(LOOTBOX_ODDS)) {
    acc += odds;
    if (roll < acc) return rarity as PetRarity;
  }
  return 'mitico';
}

/** Dificuldade adaptativa: 2 acertos seguidos sobe; erro desce; nunca sai do intervalo 1–3. */
export function nextDifficulty(
  current: 1 | 2 | 3,
  wasCorrect: boolean,
  streak: number
): 1 | 2 | 3 {
  if (wasCorrect && streak >= 2) return (Math.min(3, current + 1) as 1 | 2 | 3);
  if (!wasCorrect) return (Math.max(1, current - 1) as 1 | 2 | 3);
  return current;
}
```

- [ ] **Passo 2:** criar `tests/unit-suite.ts` (padrão da suíte existente — `assert` próprio, exit 1 em falha):

```ts
import { calcWpm, rollLootboxDemo, LOOTBOX_ODDS, nextDifficulty } from '../src/lib/game-logic';

let failures = 0;
function assert(condition: boolean, name: string) {
  if (condition) {
    console.log(`✅ [unit] ${name}`);
  } else {
    console.error(`❌ [unit] ${name}`);
    failures++;
  }
}

// calcWpm
assert(calcWpm(10, 60000) === 10, 'calcWpm: 10 palavras em 60s = 10 WPM');
assert(calcWpm(10, 1000) === 60, 'calcWpm: piso de 1s nunca ultrapassa o teto de 60');
assert(calcWpm(0, 60000) === 0, 'calcWpm: zero palavras = 0 WPM');

// rollLootboxDemo (rng determinístico)
assert(rollLootboxDemo(() => 0) === 'normal', 'lootbox: roll 0% -> normal');
assert(rollLootboxDemo(() => 0.61) === 'raro', 'lootbox: roll 61% -> raro');
assert(rollLootboxDemo(() => 0.995) === 'mitico', 'lootbox: roll 99,5% -> mitico');
assert(Object.values(LOOTBOX_ODDS).reduce((a, b) => a + b, 0) === 100, 'lootbox: chances somam 100%');

// nextDifficulty
assert(nextDifficulty(1, true, 2) === 2, 'adaptativa: 2 acertos seguidos sobem');
assert(nextDifficulty(3, true, 2) === 3, 'adaptativa: nunca passa de 3');
assert(nextDifficulty(2, false, 0) === 1, 'adaptativa: erro desce');
assert(nextDifficulty(1, false, 0) === 1, 'adaptativa: nunca desce abaixo de 1');
assert(nextDifficulty(2, true, 1) === 2, 'adaptativa: 1 acerto isolado mantem');

console.log(`\n📊 Unit suite: ${failures === 0 ? 'TODOS OS TESTES PASSARAM' : `${failures} FALHAS`}`);
process.exit(failures > 0 ? 1 : 0);
```

- [ ] **Passo 3:** em `package.json`, manter `"test": "tsx tests/integrity-suite.ts"`, adicionar `"test:unit": "tsx tests/unit-suite.ts"`, e incluir `npm run test:unit` no `.github/workflows/ci.yml` (imediatamente antes do `npm test`).
- [ ] **Passo 4:** na digitação, trocar o cálculo inline de `wpm` por `calcWpm(wordsTyped, elapsedMs)` (as variáveis já existem).
- [ ] **Passo 5:** `npm run test:unit` verde; `npm test` continua 212/212; gate completo.
- [ ] **Passo 6:** Commit: `feat(logic): extrair helpers puros (wpm, lootbox demo, dificuldade adaptativa) com suíte unitaria`.

### Tarefa 1.3 — Particionar o `content-data.ts` (1.542 linhas)

**Files:**
- Create: `src/lib/content/pets.ts`, `accessories.ts`, `avatars.ts`, `subjects.ts`, `quests.ts`, `questions.ts`, `english.ts`, `achievements.ts`, `index.ts`
- Modify: `src/lib/content-data.ts` (vira barrel de re-export)

- [ ] **Passo 1:** mover cada `export const` para o módulo correspondente (mesma exportação, mesmo tipo — mapa exato):

| Constante | Destino |
|---|---|
| `PET_CATALOG`, `RARITY_LABELS` | `content/pets.ts` |
| `ACCESSORY_CATALOG` | `content/accessories.ts` |
| `AVATAR_PRESETS` | `content/avatars.ts` |
| `SUBJECTS` | `content/subjects.ts` |
| `INITIAL_QUESTS` | `content/quests.ts` |
| `QUESTION_BANK` | `content/questions.ts` |
| `ENGLISH_VOCABULARY` | `content/english.ts` |
| `ACHIEVEMENTS_CATALOG` | `content/achievements.ts` |

- [ ] **Passo 2:** `src/lib/content-data.ts` passa a ser apenas:

```ts
// Barrel: mantém os imports históricos (`../lib/content-data`) funcionando.
export { PET_CATALOG, RARITY_LABELS } from './content/pets';
export { ACCESSORY_CATALOG } from './content/accessories';
export { AVATAR_PRESETS } from './content/avatars';
export { SUBJECTS } from './content/subjects';
export { INITIAL_QUESTS } from './content/quests';
export { QUESTION_BANK } from './content/questions';
export { ENGLISH_VOCABULARY } from './content/english';
export { ACHIEVEMENTS_CATALOG } from './content/achievements';
```

- [ ] **Passo 3:** gate completo — `npm test` (a suíte importa `../src/lib/content-data` e não muda) e build verde.
- [ ] **Passo 4:** Commit: `refactor(content): particionar content-data em modulos por dominio (barrel compativel)`.

### Tarefa 1.4 — PWA v2: cache versionado, SWR e offline de verdade

**Contexto:** o `sw.js` atual é cache-first para **tudo** com `CACHE_NAME` estático — após um deploy, o app continua servindo HTML antigo indefinidamente.

**Files:**
- Modify: `public/sw.js` (reescrita completa abaixo)

- [ ] **Passo 1:** substituir o `public/sw.js` por:

```js
// Kids-Player Service Worker v2
// BUMPAR A VERSÃO A CADA RELEASE (cache imutável é invalidado aqui):
const CACHE_VERSION = 'kids-player-v2';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Navegação: rede primeiro (HTML sempre fresco), fallback para a última página visitada
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match('/'))
        )
    );
    return;
  }

  // Estáticos do Next (imutáveis por build): stale-while-revalidate
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const refresh = fetch(request)
          .then((res) => {
            const copy = res.clone();
            caches.open(CACHE_VERSION).then((c) => c.put(request, copy));
            return res;
          })
          .catch(() => cached);
        return cached || refresh;
      })
    );
    return;
  }

  // Demais GETs (manifest, ícones): cache-first
  event.respondWith(caches.match(request).then((cached) => cached || fetch(request)));
});
```

- [ ] **Passo 2:** adicionar ao README (seção "Deploy"): regra de bumpar `CACHE_VERSION` a cada release em produção.
- [ ] **Passo 3:** verificar manualmente: DevTools → Application → Service Workers; navegar offline (DevTools → Network → Offline) → última página continua carregando; novo deploy não serve HTML velho.
- [ ] **Passo 4:** Commit: `feat(pwa): service worker v2 com cache versionado, network-first no HTML e SWR de estaticos`.

### Tarefa 1.5 — Acessibilidade AA

**Files:**
- Modify: `src/app/globals.css` (focus-visible), componentes com botões só-ícone (`Navbar.tsx`, `perfil/page.tsx`, `pets/page.tsx`)

- [ ] **Passo 1:** adicionar em `globals.css` um estilo global de foco visível:
```css
:focus-visible {
  outline: 3px solid #fbbf24; /* âmbar do design system */
  outline-offset: 2px;
}
```
- [ ] **Passo 2:** auditar botões só-ícone (toggle de som da Navbar, ações do perfil/pets/vila): todos precisam de `aria-label` descritivo em PT-BR (ex.: `aria-label="Ativar ou desativar os sons do jogo"`).
- [ ] **Passo 3:** checklist manual nas 18 rotas (Axe DevTools no Chrome): contraste AA nos textos sobre os fundos escuros (`text-slate-400` sobre `bg-slate-950` é o limite — verificar), ordem de tabulação coerente, alvos de toque ≥ 44px nas telas do celular, `prefers-reduced-motion` já respeitado pelos efeitos de partícula/cursor.
- [ ] **Passo 4:** corrigir os apontamentos, rodar o gate completo.
- [ ] **Passo 5:** Commit: `feat(a11y): foco visivel global, aria-labels em botoes de icone e ajustes AA`.

### Tarefa 1.6 — Performance mobile (scopo)

**✅ Medido em 21/10/2026** (Lighthouse headless sobre `https://kids-play-five.vercel.app`, build da Fase 1):

| Categoria | Nota | Métricas-chave |
|---|---|---|
| Performance | **85** (meta ≥ 85 ✓) | FCP 2,7s · LCP 3,5s · **TBT 148ms (95)** · **CLS 0 (100)** · Speed Index 3,2s |
| Acessibilidade | **98** | — |
| Best Practices | **100** | — |
| SEO | **100** | — |

**Gargalo identificado (candidato à Fase 2):** FCP/LCP puxados pelo Google Fonts via `<link>` em `layout.tsx` (já apontado pelo warning `@next/next/no-page-custom-font`) — migrar para `next/font/google` deve puxar Performance para ~90+. TBT/CLS excelentes (client-side leve).

**✅ RE-MEDIDO em 22/10/2026 (após next/font):** Performance **86** · **FCP 2.735ms → 967ms (-65%)** · LCP 3.464ms → 3.009ms · A11y 98 · BP 100 · SEO 100. Gargalo eliminado; fontes auto-hospedadas (commit `5164a52`).

**Critério de aceite da Fase 1:** `npx eslint .` com 0 erros e apenas o warning documentado do `PetCompanion` · `npm run test:unit` rodando no CI · `content-data` particionado com barrel compatível · PWA v2 verificado em navegação offline · a11y auditada nas 18 rotas.

**✅ FASE 1 CONCLUÍDA EM 21/10/2026** — commits `ab062a9` → `40676ac`: ESLint 19→11 warnings (9 de hidratação + 2 deps eliminados, restam 8 regras `@next/*` + 1 PetCompanion + 2 deps) · 19 testes unitários + 212 de integridade no CI · monólito de 1.563 linhas → 8 módulos · PWA v2 no ar (cache versionado, HTML sempre fresco) · a11y 98/100 no Lighthouse com Performance 85 (meta atingida).

---

## FASE 2 — Backend Real Supabase (2–3 semanas)

> **Ao iniciar esta fase:** gerar plano de implementação detalhado por tarefa (skill `writing-plans`).

| # | Iniciativa | Escopo essencial | Critério de aceite |
|---|---|---|---|
| 2.1 | **Conexão real** | Rodar `supabase/schema.sql` no painel; preencher `.env.local` (URL + anon key); criar conta de responsável + perfil de aluno reais via UI de cadastro; smoke das RLS via SQL Editor (SELECT em `profiles` de outro usuário retorna 0 linhas; `points_ledger` só do próprio aluno). | Cadastro→login→jogar→pontos persistindo no Postgres; demo mode continua funcionando com chaves placeholder. |
| 2.2 | **Multi-perfil por responsável** | Hoje o schema já tem `guardian_id` em `profiles`: permitir 1 responsável → N filhos (troca de perfil no login/painel do responsável). Migrations: nenhuma prevista (verificar `nickname` UNIQUE por aluno). | Responsável com 2 filhos alterna perfis sem vazar dados entre eles (RLS prova). |
| 2.3 | **Migração demo→nuvem** | Na primeira sincronização com conta real: 1 merge único do `kids_profile`/`kids_user_pets` (pontos XP/moedas) via `apply_points_transaction` com `reason='demo_migration'`; flag `demo_migrated` em `profiles.metadata` (novo JSONB) para não duplicar. | Progresso local vira progresso em nuvem exatamente uma vez. |
| 2.4 | **Painel do responsável real** | A página `responsavel/` passa a ler `game_sessions`, `attempts`, `focus_sessions` e as views `leaderboard_*` do aluno real; gráficos por habilidade BNCC (recharts opcional). Opcional: e-mail semanal (Supabase Edge Function + Resend). | Responsável vê tempo de estudo, precisão por matéria e histórico de foco do próprio filho (RLS garante isolamento). |

**Risco da fase:** anon key client-side é o modelo do projeto (RLS é a barreira) — não introduzir service role key no cliente em hipótese alguma.

### ✅ Progresso da Fase 2 (22/10/2026)

| Item | Status | Evidência |
|---|---|---|
| 2.1 Schema + seed no ar | ✅ | 7 consultas REST: 6 matérias, 15 pets, 16 acessórios, 10 conquistas, 4 quests, 5 lootbox, 4 questões |
| 2.1 RLS verificado | ✅ | Leituras sensíveis vazias para anônimo; INSERT anônimo (moedas/perfil/foco) rejeitado com 42501 |
| 2.1 Produção conectada | ✅ | URL real + publishable key embutidas no bundle da Vercel (variáveis reconfiguradas após remover as marcadas como "Secret") |
| 2.3 Cola do modo real | ✅ Commit `67de297` | Hidratação real da sessão (perfil/saldo/guardião/pet), bônus via RPC, UUID real no perfil local, `loginStudent` deixa de sobrescrever com demo |
| 2.3 Migração demo→nuvem | ✅ Commit `67de297` | `migrateDemoProgressToCloud`: moedas acima do kit inicial entram como transação única `demo_migration`; XP só sobe; flag `kids_demo_migrated_<uid>` por dispositivo |
| 2.2 Multi-perfil e 2.4 Painel real | ✅ Commits `134b7bc` + `9eb2a5d` | Verificado E2E em 22/10: guardião cria filho (pet + 200 moedas + sessão de jogo), lê livro-razão e sessões do filho; conta B tem **0 acesso** ao filho de A (ledger/pets invisíveis), RPC endurecida rejeitou injeção de 99.999 moedas, e B não se cadastra como filho alheio. Painel /responsavel com métricas reais + seção Filhos & Perfis + modal de cadastro |
| 2.1/2.3 Testes E2E autenticados | ✅ 22/10/2026 | Cadastro real completo (sessão imediata, guardião, perfil, bônus 200 via RPC, pet); saldo da view consistente; RPC +50; **isolamento entre contas** (A não vê lançamentos de B; B não altera o perfil de A — 0 linhas, RLS 42501). Nota: contas criadas antes de desativar "Confirm email" continuam bloqueadas até confirmação manual em Authentication → Users |

**✅ FASE 2 CONCLUÍDA EM 22/10/2026** (schema + RLS verificados, produção conectada, cola real com migração demo→nuvem, multi-perfil e painel dos pais com dados reais). **Aprendizados arquiteturais:** (1) o modelo 1:1 estava gravado também no banco (`profiles_id_fkey` → auth.users) — removido na migração para permitir filhos "virtuais" sob a sessão do guardião, com integridade mantida pelos demais FKs + RLS; (2) a RPC de pontos original não validava o autor — qualquer autenticado podia movimentar moedas alheias; agora exige o próprio aluno ou guardião vinculado.

**Achados da fase (bugs latentes corrigidos):** (1) INSERT direto no `points_ledger` era bloqueado por RLS — bônus agora via `apply_points_transaction`; (2) cadastro real gravava id falso `student-<ts>` no perfil local (isDemo errado, RPC com FK inválida); (3) login real sobrescrevia o estado com perfil demo.

**Pendências operacionais:** (1) "Confirm email" AINDA ATIVO no projeto — com ele ligado o cadastro real cria o usuário de auth mas os inserts seguintes falham (sem sessão, RLS bloqueia); desativar em Authentication → Sign In / Providers (recomendação já presente no README); (2) seguimento de segurança: views `student_balances`/`leaderboard_*` rodam com o dono e ignoram RLS — para produção, avaliar `security_invoker = on`; (3) em produção futura com e-mail confirmado, o cadastro deve avisar "confirme seu e-mail" em vez de seguir como se tudo tivesse sido gravado.

---

## FASE 3 — Conteúdo: Teatro dos Contos & Banco de Questões (3–4 semanas)

> Paralelizável com a Fase 2. **Ao iniciar:** plano detalhado por feature.

| # | Iniciativa | Escopo essencial | Critério de aceite |
|---|---|---|---|
| 3.1 | **🎭 Teatro dos Contos** (sons já prontos: `playPageFlip`, `playApplause`) | Rota `/contos` + leitor: 3 fábulas originais pedagógicas por série (EF35LP02/EF35LP03 — compreensão e interpretação), leitura página a página com TTS opcional, 1 pergunta de compreensão por capítulo, `playPageFlip` ao virar página, `playApplause` + confetti + pontos ao concluir. Link na Navbar e no Hub de Jogos. | Rota nova no smoke (19 rotas); questão de compreensão valida via `addPoints`; página funciona offline (PWA v2). |
| 3.2 | **Banco de questões 43 → 150** | Processo editorial leve: planilha (`content/questions.source.csv`) → script de conversão validado → `content/questions.ts`. Metas por matéria: matemática 30, português 25, ciências 25, história/geografia 30, inglês 25, digitação 20. Novo gate no `integrity-suite.ts` (ver código abaixo). | `npm test` falha com qualquer matéria abaixo da meta; todas as questões têm BNCC, explicação e opções válidas (o gate atual já exige). |
| 3.3 | **Inglês 14 → 100 palavras** + modo memória | Ampliar `ENGLISH_VOCABULARY` com categorias (animais, cores, família, escola, comida, números); novo minijogo de memória auditiva dentro de `/jogos/ingles` usando TTS existente. | 100 palavras com transcrição fonética amigável + frase de exemplo; teste de meta no integrity-suite. |
| 3.4 | **Dificuldade adaptativa** | Usar `nextDifficulty` (Tarefa 1.2) nos jogos de quiz: streak de 2 acertos sobe o `difficulty` do pool; erro desce. Indicador visual lúdico ("nível do herói"). | Jogador de 3º ano nunca fica preso em questões fáceis repetidas; helper unit-testado. |

**Gate de meta para o `integrity-suite.ts`** (adicionar junto com a Tarefa 3.2):

```ts
const MIN_QUESTIONS_BY_SUBJECT: Record<string, number> = {
  matematica: 30,
  portugues: 25,
  ciencias: 25,
  historia_geografia: 30,
  ingles: 25,
  digitacao: 20,
};
(Object.keys(MIN_QUESTIONS_BY_SUBJECT) as string[]).forEach((subject) => {
  const count = QUESTION_BANK.filter((q) => q.subject_id === subject).length;
  assert(
    count >= MIN_QUESTIONS_BY_SUBJECT[subject],
    'Meta de Conteúdo',
    `Materia '${subject}' com ${count} questões (meta: ${MIN_QUESTIONS_BY_SUBJECT[subject]})`
  );
});
```

---

## FASE 4 — Gamificação & Retenção (4–6 semanas)

> Depende da Fase 2 para os recursos sociais (tudo assíncrono, sem chat).

| # | Iniciativa | Escopo essencial | Notas éticas |
|---|---|---|---|
| 4.1 | **Pets 15 → 20 + evolução visual** | 5 novos pets (biomas brasileiros — sinergia com o jogo de biomas); `PetIcon.tsx` ganha variantes por estágio de evolução (nível 1/3/5 mudam detalhes do SVG). | Novos pets entram no seed SQL e no integrity-suite (gate de 15 vira 20). |
| 4.2 | **Vila v2** | Grade 10×8 (toolbar de rolagem); plantações com ciclo real (regar 1×/dia → streak de jardineiro); **visita à vila de amigos** (somente leitura, sem interação nem chat). | Visitas mostram apenas nickname moderado + vila; nenhuma comunicação direta. |
| 4.3 | **Temporadas** | Passe da Sabedoria renovável (30 níveis por estação) com cosméticos sazonais; calendário no hub. | Continua 100% gratuito — sem passe pago. |
| 4.4 | **Desafios assíncronos éticos** | Ghost replay da digitação (superar o próprio recorde e o "fantasma" do ranking sem dados expostos); torneio semanal por código de turma (entrada por código, sem busca pública de nomes). | Sem ranking global de menores; torneios sempre mediados por código/educador. |

---

## FASE 5 — Escola & Escala (visão 3–6 meses)

| # | Iniciativa | Escopo essencial |
|---|---|---|
| 5.1 | **Modo Escola** | Perfil de professor; turmas por código de convite; dashboard pedagógico por habilidade BNCC da turma; atribuição de "deveres" (quests para a turma). Schema: tabelas `classes`, `class_students`, `class_assignments` com RLS de professor. |
| 5.2 | **LGPD v2** | Termo de uso versionado com consentimento explícito registrado (`guardians.accepted_terms_at` já existe — adicionar `terms_version`); fluxo de exportação e apagamento de dados do responsável; revisão legal antes da escala. |
| 5.3 | **Analytics ético** | Plausible self-hosted (sem cookies cross-site, sem fingerprinting): DAU, tempo de estudo, precisão por habilidade, funil cadastro→1º jogo. |
| 5.4 | **5º ano + i18n** | Estender `SchoolGrade` para `3 | 4 | 5` (schema CHECK + types + conteúdo EF05\*); internacionalização PT→EN/ES via roteamento de locale do App Router. |

---

## Priorização (Quick Wins primeiro)

| Ordem | Item | Impacto | Esforço | Por quê |
|---|---|---|---|---|
| 1 | 0.2 CI + 0.3 Vercel | Alto | Baixo | Protege tudo o que vem depois; preview por PR |
| 2 | 0.4 Zerar unused-vars | Médio | Baixo | Reduz ruído de 107 para ~9 warnings |
| 3 | 3.1 Teatro dos Contos | Alto | Médio | Sons já prontos; feature anunciada inexistente |
| 4 | 1.4 PWA v2 | Médio | Baixo | Corrige HTML obsoleto pós-deploy (crítico com Vercel ativo) |
| 5 | 2.1 Backend real | Alto | Médio | Destrava progresso multi-dispositivo e a Fase 4 |
| 6 | 1.1–1.3 Qualidade | Médio | Médio | Base sustentável para escalar conteúdo |
| 7 | 3.2 Banco 150 questões | Alto | Alto (editorial) | Repetição escolar sem redundância |

## Métricas de Sucesso

- **Técnicas:** CI verde < 5 min · 0 erros e ≤ 15 warnings no lint · testes ≥ 230 (212 atuais + unit + metas) · Lighthouse mobile ≥ 85 / PWA installable · smoke 19/19 após os Contos.
- **Produto (após Fase 2):** DAU/WAU ≥ 30% · sessão média ≥ 8 min · precisão média ≥ 70% e subindo com dificuldade adaptativa · conclusão de quest diária ≥ 60% · retenção D7 ≥ 25% · NPS dos responsáveis ≥ 40 (pesquisa leve no painel).

## Riscos & Mitigações

| Risco | Mitigação |
|---|---|
| Escopo pedagógico estourar para outras séries | Fase 5.4 é a ÚNICA porta de entrada de novas séries; até lá, BNCC 3º/4º apenas |
| Multiplayer expor crianças | Tudo assíncrono e mediado por código; nunca chat aberto; nicknames moderados já ativos |
| Supabase free tier em escala | Monitorar MAU no painel; analytics próprio (5.3) antes de considerar upgrade |
| Conteúdo editorial virar gargalo | Processo planilha→script→gate automatizado (3.2); metas por matéria no CI |
| Deploy servir HTML antigo | PWA v2 (1.4) + regra de bump de `CACHE_VERSION` no README |
| Regressão em jogos durante refactors | Gate obrigatório (Restrição 5) + smoke de rotas em todo PR |

## Como Executar

1. **Fase 0 é o ponto de partida** — 0.2 (CI) e 0.4 (warnings) podem executar **imediatamente**; 0.1/0.3 dependem da URL do repositório.
2. Para cada tarefa: seguir os passos na ordem, rodar o gate (Restrição 5) e commitar.
3. Fases 2–5: gerar o plano de implementação detalhado da iniciativa (skill `writing-plans`) antes de começar.
