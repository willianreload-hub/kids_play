// Barrel de compatibilidade: o conteúdo curricular agora vive em src/lib/content/*.
// Todos os imports históricos (`../lib/content-data`) continuam funcionando sem alteração.
export { PET_CATALOG, RARITY_LABELS } from './content/pets';
export { ACCESSORY_CATALOG } from './content/accessories';
export { AVATAR_PRESETS } from './content/avatars';
export { SUBJECTS } from './content/subjects';
export { INITIAL_QUESTS } from './content/quests';
export { QUESTION_BANK } from './content/questions';
export { ENGLISH_VOCABULARY, type EnglishWordItem } from './content/english';
export { ACHIEVEMENTS_CATALOG } from './content/achievements';
export { TALE_CATALOG, type Tale, type TalePage, type TaleQuestion } from './content/tales';
