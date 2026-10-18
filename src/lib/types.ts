export type SchoolGrade = 3 | 4;

export type PetRarity = 'normal' | 'raro' | 'epico' | 'lendario' | 'mitico';

export interface StudentProfile {
  id: string;
  guardian_id?: string;
  nickname: string;
  school_grade: SchoolGrade;
  avatar_preset: string;
  avatar_url?: string;
  level: number;
  xp: number;
  points: number;
  streak_days: number;
  last_active_date?: string;
}

export interface Guardian {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
}

export interface FocusModeSettings {
  student_id: string;
  is_active: boolean;
  guardian_consent: boolean;
  guardian_consent_date?: string;
  session_duration_minutes: number;
  reduced_stimuli: boolean;
  tts_auto_read: boolean;
  pause_interval_minutes: number;
}

export interface Pet {
  id: string;
  name: string;
  species: string;
  rarity: PetRarity;
  description: string;
  sprite_key: string;
  base_power: number;
  avatar_svg?: string;
}

export interface UserPet {
  id: string;
  student_id: string;
  pet_id: string;
  nickname?: string;
  level: number;
  evolution_fragments: number;
  is_active: boolean;
  pet?: Pet;
}

export interface SubjectItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  color_theme: string;
  order_index: number;
  bncc_focus: string;
}

export interface QuestItem {
  id: string;
  title: string;
  description: string;
  category: 'diaria' | 'semanal' | 'especial';
  reward_points: number;
  reward_xp: number;
  target_count: number;
  current_progress: number;
  is_completed: boolean;
  is_claimed: boolean;
  quest_key: string;
}

export interface LeaderboardEntry {
  student_id: string;
  nickname: string;
  avatar_preset: string;
  avatar_url?: string;
  period_points: number;
  rank: number;
  is_current_user?: boolean;
}

export interface AvatarPreset {
  id: string;
  name: string;
  category: 'aventura' | 'espaco' | 'animais' | 'magia';
  svg_color: string;
  icon_name: string;
}

export interface QuestionOption {
  id: string;
  text: string;
  icon?: string;
}

export interface Question {
  id: string;
  subject_id: 'matematica' | 'portugues' | 'ciencias' | 'historia_geografia' | 'ingles' | 'digitacao';
  grade: SchoolGrade;
  bncc_code: string;
  topic: string;
  prompt: string;
  audio_prompt_text?: string;
  question_type: 'multiple_choice' | 'block_break' | 'fill_word';
  options: QuestionOption[];
  correct_answer: string;
  explanation: string;
  difficulty: 1 | 2 | 3;
}

export interface GameSessionResult {
  game_type: string;
  subject_id: string;
  score: number;
  correct_count: number;
  total_questions: number;
  accuracy_percent: number;
  points_earned: number;
  xp_earned: number;
  duration_seconds: number;
}

export type AccessoryType = 'chapeu' | 'oculos' | 'capa' | 'efeito';

export interface Accessory {
  id: string;
  name: string;
  type: AccessoryType;
  rarity: PetRarity;
  price_points: number;
  sprite_key: string;
  description: string;
  icon_name: string;
}

export interface UserAccessory {
  id: string;
  accessory_id: string;
  is_equipped: boolean;
  accessory?: Accessory;
}
