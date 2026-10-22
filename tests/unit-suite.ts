import { calcWpm, rollLootboxDemo, LOOTBOX_ODDS, nextDifficulty } from '../src/lib/game-logic';
import { getCurrentSeason, SEASONS } from '../src/lib/content/seasons';

let failures = 0;
const results: { name: string; passed: boolean }[] = [];

function assert(condition: boolean, name: string) {
  results.push({ name, passed: condition });
  if (condition) {
    console.log(`✅ [unit] ${name}`);
  } else {
    console.error(`❌ [unit] ${name}`);
    failures++;
  }
}

// ==============================================================================
// 1. calcWpm — medidor de velocidade de digitação
// ==============================================================================
assert(calcWpm(10, 60000) === 10, 'calcWpm: 10 palavras em 60s = 10 WPM');
assert(calcWpm(10, 1000) === 60, 'calcWpm: piso de 1s nunca ultrapassa o teto de 60');
assert(calcWpm(10, 500) === 60, 'calcWpm: meio segundo também respeita o piso de 1s');
assert(calcWpm(0, 60000) === 0, 'calcWpm: zero palavras = 0 WPM');
assert(calcWpm(100, 60000) === 60, 'calcWpm: teto de 60 WPM nunca é excedido');

// ==============================================================================
// 2. rollLootboxDemo — sorteio com chances públicas (60/25/10/4/1)
// ==============================================================================
assert(rollLootboxDemo(() => 0) === 'normal', 'lootbox: roll 0% -> normal');
assert(rollLootboxDemo(() => 0.61) === 'raro', 'lootbox: roll 61% -> raro');
assert(rollLootboxDemo(() => 0.87) === 'epico', 'lootbox: roll 87% -> epico');
assert(rollLootboxDemo(() => 0.96) === 'lendario', 'lootbox: roll 96% -> lendario');
assert(rollLootboxDemo(() => 0.995) === 'mitico', 'lootbox: roll 99,5% -> mitico');
assert(
  Object.values(LOOTBOX_ODDS).reduce((a, b) => a + b, 0) === 100,
  'lootbox: chances somam exatamente 100%'
);
assert(
  Object.entries(LOOTBOX_ODDS).every(([r]) =>
    ['normal', 'raro', 'epico', 'lendario', 'mitico'].includes(r)
  ),
  'lootbox: raridades válidas'
);

// ==============================================================================
// 3. nextDifficulty — dificuldade adaptativa
// ==============================================================================
assert(nextDifficulty(1, true, 2) === 2, 'adaptativa: 2 acertos seguidos sobem de nível');
assert(nextDifficulty(2, true, 2) === 3, 'adaptativa: sobe do nível 2 para o 3');
assert(nextDifficulty(3, true, 2) === 3, 'adaptativa: nunca passa do nível 3');
assert(nextDifficulty(2, false, 0) === 1, 'adaptativa: erro desce de nível');
assert(nextDifficulty(1, false, 0) === 1, 'adaptativa: nunca desce abaixo do nível 1');
assert(nextDifficulty(2, true, 1) === 2, 'adaptativa: 1 acerto isolado mantém o nível');
assert(nextDifficulty(2, false, 5) === 1, 'adaptativa: erro reseta mesmo com sequência boa');

// ==============================================================================
// 4. TEMPORADAS SAZONAIS (Fase 4.3) — hemisfério sul
// ==============================================================================
assert(getCurrentSeason(1, SEASONS).id === 'verao_herois', 'temporadas: janeiro = Verão dos Heróis');
assert(getCurrentSeason(2, SEASONS).id === 'verao_herois', 'temporadas: fevereiro = Verão dos Heróis');
assert(getCurrentSeason(12, SEASONS).id === 'verao_herois', 'temporadas: dezembro = Verão dos Heróis');
assert(getCurrentSeason(4, SEASONS).id === 'outono_cosmico', 'temporadas: abril = Outono Cósmico');
assert(getCurrentSeason(7, SEASONS).id === 'inverno_estelar', 'temporadas: julho = Inverno Estelar');
assert(getCurrentSeason(10, SEASONS).id === 'primavera_magica', 'temporadas: outubro = Primavera Mágica');
assert(
  SEASONS.every(s => s.months.length === 3 && s.rewardTitle.length > 0),
  'temporadas: as 4 estações cobrem 3 meses cada e têm título sazonal'
);

// ==============================================================================
// RESUMO
// ==============================================================================
const total = results.length;
const passed = results.filter(r => r.passed).length;
console.log('\n======================================================');
console.log(`📊 SUÍTE UNITÁRIA (game-logic): ${passed}/${total} aprovados${failures > 0 ? ` (${failures} falhas)` : ''}`);
console.log('======================================================\n');
process.exit(failures > 0 ? 1 : 0);
