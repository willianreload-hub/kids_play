import {
  QUESTION_BANK,
  PET_CATALOG,
  ACCESSORY_CATALOG,
  ACHIEVEMENTS_CATALOG,
  ENGLISH_VOCABULARY
} from '../src/lib/content-data';
import { validateNickname } from '../src/lib/nickname-moderator';
import * as fs from 'fs';
import * as path from 'path';

interface TestResult {
  category: string;
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, category: string, name: string, errorMsg?: string) {
  if (condition) {
    results.push({ category, name, passed: true });
  } else {
    results.push({ category, name, passed: false, error: errorMsg || 'Assertion failed' });
    console.error(`❌ [${category}] ${name}: ${errorMsg || 'Failed'}`);
  }
}

console.log('🔍 INICIANDO ROTINA DE TESTES INTEGRADA DO KIDS-PLAYER...\n');

// ==============================================================================
// TESTE 1: BANCO DE QUESTÕES (QUESTION_BANK)
// ==============================================================================
console.log('--- 1. Testando Integridade de QUESTION_BANK ---');
const questionIds = new Set<string>();
let qErrors = 0;

QUESTION_BANK.forEach((q, idx) => {
  // Unicidade de ID
  if (questionIds.has(q.id)) {
    assert(false, 'Questões', `ID duplicado na questão #${idx}`, `ID '${q.id}' repetido.`);
    qErrors++;
  } else {
    questionIds.add(q.id);
  }

  // Enunciado
  if (!q.prompt || q.prompt.trim().length === 0) {
    assert(false, 'Questões', `Enunciado vazio em '${q.id}'`, 'Prompt está vazio.');
    qErrors++;
  }

  // Opções e Resposta Correta
  if (!Array.isArray(q.options) || q.options.length < 2) {
    assert(false, 'Questões', `Opções insuficientes em '${q.id}'`, `Possui ${q.options?.length} opções.`);
    qErrors++;
  } else {
    const hasCorrect = q.options.some(opt => opt.text.trim() === q.correct_answer.trim());
    if (!hasCorrect) {
      assert(false, 'Questões', `Resposta correta inexistente nas opções de '${q.id}'`, 
        `correct_answer='${q.correct_answer}' não coincide com nenhuma opção: [${q.options.map(o => `'${o.text}'`).join(', ')}]`
      );
      qErrors++;
    }
  }

  // Explicação
  if (!q.explanation || q.explanation.trim().length === 0) {
    assert(false, 'Questões', `Explicação ausente em '${q.id}'`, 'Campo explanation está vazio.');
    qErrors++;
  }

  // Subject ID
  const validSubjects = ['matematica', 'portugues', 'ciencias', 'historia_geografia', 'ingles', 'digitacao'];
  if (!validSubjects.includes(q.subject_id)) {
    assert(false, 'Questões', `Matéria inválida em '${q.id}'`, `subject_id='${q.subject_id}' desconhecido.`);
    qErrors++;
  }
});

if (qErrors === 0) {
  assert(true, 'Questões', `Todas as ${QUESTION_BANK.length} questões do banco são válidas e consistentes.`);
}

// ==============================================================================
// TESTE 1b: METAS DE CONTEÚDO (Fase 3) — o CI reprova se alguma matéria encolher
// ==============================================================================
console.log('\n--- 1b. Testando Metas de Conteúdo da Fase 3 ---');
const MIN_QUESTIONS_BY_SUBJECT: Record<string, number> = {
  matematica: 30,
  portugues: 25,
  ciencias: 25,
  historia_geografia: 25,
};
Object.keys(MIN_QUESTIONS_BY_SUBJECT).forEach((subject) => {
  const count = QUESTION_BANK.filter((q) => q.subject_id === subject).length;
  assert(
    count >= MIN_QUESTIONS_BY_SUBJECT[subject],
    'Meta de Conteúdo',
    `Matéria '${subject}' com ${count} questões (meta mínima: ${MIN_QUESTIONS_BY_SUBJECT[subject]})`
  );
});
assert(
  ENGLISH_VOCABULARY.length >= 100,
  'Meta de Conteúdo',
  `Vocabulário de inglês com ${ENGLISH_VOCABULARY.length} palavras (meta mínima: 100)`
);

// ==============================================================================
// TESTE 2: CATÁLOGO DE PETS & RENDERIZADOR SVG (PetIcon.tsx)
// ==============================================================================
console.log('\n--- 2. Testando Catálogo de PETs e Renderizador ---');
const petIds = new Set<string>();
const petIconContent = fs.readFileSync(path.resolve(__dirname, '../src/components/PetIcon.tsx'), 'utf-8');

PET_CATALOG.forEach(pet => {
  if (petIds.has(pet.id)) {
    assert(false, 'PETs', `ID duplicado '${pet.id}'`);
  } else {
    petIds.add(pet.id);
  }

  assert(pet.name.trim().length > 0, 'PETs', `Nome válido para '${pet.id}'`);
  assert(pet.base_power > 0, 'PETs', `Poder positivo para '${pet.id}'`);
  assert(['normal', 'raro', 'epico', 'lendario', 'mitico'].includes(pet.rarity), 'PETs', `Raridade válida para '${pet.id}'`);

  // Verifica se o PetIcon.tsx possui suporte ao ID do Pet
  const hasIconCase = petIconContent.includes(`'${pet.id}'`) || petIconContent.includes(`"${pet.id}"`);
  assert(hasIconCase, 'PetIcon', `Suporte SVG em PetIcon para '${pet.id}'`, `Pet '${pet.id}' não encontrado nos cases de PetIcon.tsx!`);
});

assert(PET_CATALOG.length === 20, 'PETs', `Total de 20 PETs cadastrados (atual: ${PET_CATALOG.length})`);

// ==============================================================================
// TESTE 3: CATÁLOGO DE ACESSÓRIOS
// ==============================================================================
console.log('\n--- 3. Testando Catálogo de Acessórios ---');
const accIds = new Set<string>();

ACCESSORY_CATALOG.forEach(acc => {
  if (accIds.has(acc.id)) {
    assert(false, 'Acessórios', `ID duplicado '${acc.id}'`);
  } else {
    accIds.add(acc.id);
  }

  assert(['chapeu', 'oculos', 'capa', 'efeito'].includes(acc.type), 'Acessórios', `Tipo válido para '${acc.id}'`);
  assert(acc.price_points > 0, 'Acessórios', `Preço positivo para '${acc.id}' (${acc.price_points} moedas)`);
});

assert(ACCESSORY_CATALOG.length === 16, 'Acessórios', `Total de 16 Acessórios cadastrados (atual: ${ACCESSORY_CATALOG.length})`);

// ==============================================================================
// TESTE 4: CONQUISTAS (ACHIEVEMENTS_CATALOG)
// ==============================================================================
console.log('\n--- 4. Testando Conquistas e Sala de Troféus ---');
const achIds = new Set<string>();

ACHIEVEMENTS_CATALOG.forEach(ach => {
  if (achIds.has(ach.id)) {
    assert(false, 'Conquistas', `ID duplicado '${ach.id}'`);
  } else {
    achIds.add(ach.id);
  }

  assert(['estudo', 'pets', 'jogos', 'habito'].includes(ach.category), 'Conquistas', `Categoria válida em '${ach.id}'`);
  assert(ach.max_progress > 0, 'Conquistas', `Meta positiva em '${ach.id}'`);
  assert(ach.reward_coins > 0, 'Conquistas', `Recompensa positiva em '${ach.id}'`);
});

assert(ACHIEVEMENTS_CATALOG.length === 10, 'Conquistas', `Total de 10 Conquistas cadastradas (atual: ${ACHIEVEMENTS_CATALOG.length})`);

// ==============================================================================
// TESTE 5: MODERADOR DE APELIDOS (LGPD & ECA DIGITAL)
// ==============================================================================
console.log('\n--- 5. Testando Moderador de Nicknames Infantis ---');

// Casos que DEVEM ser aceitos
const validNicknames = [
  'SuperPipoca', 'EstrelaAzul', 'MestreGamer', 'Gamer123', 'AstroNinja', 'DinoSabio'
];

validNicknames.forEach(nick => {
  const res = validateNickname(nick);
  assert(res.isValid, 'NickModerator', `Deve aprovar apelido saudável '${nick}'`, res.message);
});

// Casos que DEVEM ser rejeitados (Proteção da Criança)
const blockedNicknames = [
  { nick: 'ab', reason: 'Muito curto (< 3)' },
  { nick: 'NomeMuitoLongoComMaisDeVinteCaracteres123', reason: 'Muito longo (> 20)' },
  { nick: 'lucas@gmail.com', reason: 'Exposição de E-mail' },
  { nick: '11999998888', reason: 'Número de Telefone' },
  { nick: 'Rua das Flores 123', reason: 'Endereço físico' },
  { nick: 'bobao feio', reason: 'Ofensa infantil' },
  { nick: 'SilvaGamer', reason: 'Sobrenome real' },
  { nick: 'Santos12', reason: 'Sobrenome real' },
  { nick: 'Gamer!!!???', reason: 'Caracteres especiais repetidos' },
];

blockedNicknames.forEach(({ nick, reason }) => {
  const res = validateNickname(nick);
  assert(!res.isValid, 'NickModerator', `Deve bloquear '${nick}' (${reason})`, `Permitiu indevidamente: ${nick}`);
});

// ==============================================================================
// TESTE 6: VALIDAÇÃO DO ESQUEMA SQL (schema.sql)
// ==============================================================================
console.log('\n--- 6. Testando Integridade do Esquema SQL (Supabase) ---');
const schemaContent = fs.readFileSync(path.resolve(__dirname, '../supabase/schema.sql'), 'utf-8');

// Verifica tabelas essenciais
const requiredTables = [
  'guardians', 'profiles', 'focus_mode_settings', 'focus_sessions',
  'points_ledger', 'subjects', 'units', 'skills', 'questions',
  'attempts', 'game_sessions', 'typing_progress', 'pets', 'user_pets',
  'accessories', 'user_accessories', 'lootbox_config', 'lootbox_opens',
  'quests', 'user_quests', 'achievements', 'user_achievements'
];

requiredTables.forEach(table => {
  const tableDef = schemaContent.includes(`CREATE TABLE IF NOT EXISTS public.${table}`);
  assert(tableDef, 'Esquema SQL', `Tabela 'public.${table}' declarada`);
});

// Verifica RLS ativo
const rlsTables = [
  'profiles', 'guardians', 'focus_mode_settings', 'points_ledger',
  'user_pets', 'user_accessories', 'user_quests', 'user_achievements'
];

rlsTables.forEach(table => {
  const rlsDef = schemaContent.includes(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`);
  assert(rlsDef, 'Esquema SQL', `RLS ativado para '${table}'`);
});

// Verifica se todos os 15 Pets do TS estão no seed do SQL
PET_CATALOG.forEach(pet => {
  const inSql = schemaContent.includes(`'${pet.id}'`);
  assert(inSql, 'Seed SQL', `Pet '${pet.id}' no seed do schema.sql`);
});

// Verifica se todos os 16 Acessórios do TS estão no seed do SQL
ACCESSORY_CATALOG.forEach(acc => {
  const inSql = schemaContent.includes(`'${acc.id}'`);
  assert(inSql, 'Seed SQL', `Acessório '${acc.id}' no seed do schema.sql`);
});

// Verifica se todas as 10 Conquistas do TS estão no seed do SQL
ACHIEVEMENTS_CATALOG.forEach(ach => {
  const inSql = schemaContent.includes(`'${ach.id}'`);
  assert(inSql, 'Seed SQL', `Conquista '${ach.id}' no seed do schema.sql`);
});

// ==============================================================================
// RESUMO FINAL
// ==============================================================================
const total = results.length;
const passed = results.filter(r => r.passed).length;
const failed = results.filter(r => !r.passed).length;

console.log('\n======================================================');
console.log(`📊 RESULTADO DA ROTINA DE TESTES:`);
console.log(`   Total de Testes Executados: ${total}`);
console.log(`   ✅ Sucessos: ${passed}`);
console.log(`   ❌ Falhas: ${failed}`);
console.log('======================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 TODOS OS TESTES PASSARAM COM SUCESSO! 100% ÍNTEGRO!\n');
  process.exit(0);
}
