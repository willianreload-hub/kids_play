'use client';

import React, { createContext, useContext, useEffect, useState, useTransition } from 'react';
import { StudentProfile, Guardian, FocusModeSettings, Pet, SchoolGrade } from './types';
import { PET_CATALOG } from './content-data';
import { supabase, isSupabaseConfigured } from './supabase';
import { sounds } from './sound-effects';

interface SignUpParams {
  guardianEmail: string;
  guardianName: string;
  guardianPhone?: string;
  password?: string;
  nickname: string;
  grade: SchoolGrade;
  avatarPreset: string;
  selectedPetId: string;
  focusModeConsent?: boolean;
}

interface AuthContextType {
  profile: StudentProfile | null;
  guardian: Guardian | null;
  activePet: Pet | null;
  focusMode: FocusModeSettings;
  isLoading: boolean;
  isDemo: boolean;
  addPoints: (amount: number, reason: string) => void;
  setActivePet: (pet: Pet) => void;
  toggleFocusMode: (active: boolean) => void;
  updateFocusSettings: (settings: Partial<FocusModeSettings>) => void;
  updateProfile: (updates: Partial<StudentProfile>) => void;
  signUpStudent: (params: SignUpParams) => Promise<{ success: boolean; error?: string }>;
  loginStudent: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  loginAsDemo: (nickname?: string, grade?: SchoolGrade) => void;
  logout: () => void;
}

const DEFAULT_FOCUS_SETTINGS: FocusModeSettings = {
  student_id: 'demo-student',
  is_active: false,
  guardian_consent: false,
  session_duration_minutes: 4,
  reduced_stimuli: true,
  tts_auto_read: true,
  pause_interval_minutes: 5,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [guardian, setGuardian] = useState<Guardian | null>(null);
  const [activePet, setActivePetState] = useState<Pet | null>(null);
  const [focusMode, setFocusMode] = useState<FocusModeSettings>(DEFAULT_FOCUS_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [, startTransition] = useTransition();

  // Carrega estado salvo do localStorage ou Supabase
  useEffect(() => {
    async function initAuth() {
      if (typeof window === 'undefined') return;

      // 1. Tenta carregar sessão local
      const savedProfile = localStorage.getItem('kids_profile');
      const savedGuardian = localStorage.getItem('kids_guardian');
      const savedFocus = localStorage.getItem('kids_focus_settings');
      const savedPetId = localStorage.getItem('kids_active_pet_id');

      if (savedProfile) {
        try {
          const parsedProfile: StudentProfile = JSON.parse(savedProfile);
          setProfile(parsedProfile);
          if (savedGuardian) setGuardian(JSON.parse(savedGuardian));
          if (savedFocus) setFocusMode(JSON.parse(savedFocus));

          const foundPet = PET_CATALOG.find(p => p.id === (savedPetId || 'pipoca_raposa')) || PET_CATALOG[0];
          setActivePetState(foundPet);
          setIsDemo(parsedProfile.id.startsWith('demo-'));
          setIsLoading(false);
          return;
        } catch {
          // Erro de parse ignorado
        }
      }

      // Se configurado com Supabase, checa sessão
      if (isSupabaseConfigured) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const { data: profData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profData) {
              setProfile({
                id: profData.id,
                nickname: profData.nickname,
                school_grade: profData.school_grade as SchoolGrade,
                avatar_preset: profData.avatar_preset,
                avatar_url: profData.avatar_url,
                level: profData.level || 1,
                xp: profData.xp || 0,
                points: 150,
                streak_days: profData.streak_days || 1,
              });
              setIsLoading(false);
              return;
            }
          }
        } catch {
          // Fallback gracioso
        }
      }

      // Cria perfil inicial demo por padrão para a criança começar já explorando!
      loginAsDemo('Aventureiro', 3);
      setIsLoading(false);
    }

    initAuth();
  }, []);

  // Adiciona pontos no livro-razão e perfil
  const addPoints = (amount: number, reason: string) => {
    sounds.playCoin();
    setProfile(prev => {
      if (!prev) return null;
      const newPoints = Math.max(0, prev.points + amount);
      const newXp = prev.xp + Math.max(0, amount);
      const newLevel = Math.floor(newXp / 100) + 1;

      if (newLevel > prev.level) {
        sounds.playLevelUp();
      }

      const updated = {
        ...prev,
        points: newPoints,
        xp: newXp,
        level: newLevel,
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('kids_profile', JSON.stringify(updated));
      }

      // Se conectado ao Supabase
      if (isSupabaseConfigured && !isDemo) {
        supabase.rpc('apply_points_transaction', {
          p_student_id: prev.id,
          p_amount: amount,
          p_reason: reason,
        });
      }

      return updated;
    });
  };

  const setActivePet = (pet: Pet) => {
    setActivePetState(pet);
    if (typeof window !== 'undefined') {
      localStorage.setItem('kids_active_pet_id', pet.id);
    }
  };

  const toggleFocusMode = (active: boolean) => {
    setFocusMode(prev => {
      const updated = { ...prev, is_active: active };
      if (typeof window !== 'undefined') {
        localStorage.setItem('kids_focus_settings', JSON.stringify(updated));
        if (active) {
          document.body.classList.add('focus-mode-active');
        } else {
          document.body.classList.remove('focus-mode-active');
        }
      }
      return updated;
    });
  };

  const updateFocusSettings = (settings: Partial<FocusModeSettings>) => {
    setFocusMode(prev => {
      const updated = { ...prev, ...settings };
      if (typeof window !== 'undefined') {
        localStorage.setItem('kids_focus_settings', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const updateProfile = (updates: Partial<StudentProfile>) => {
    setProfile(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      if (typeof window !== 'undefined') {
        localStorage.setItem('kids_profile', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const loginAsDemo = (nickname: string = 'Super Aluno', grade: SchoolGrade = 3) => {
    const demoProf: StudentProfile = {
      id: 'demo-student-01',
      nickname,
      school_grade: grade,
      avatar_preset: 'astro_kid',
      level: 1,
      xp: 25,
      points: 200,
      streak_days: 3,
    };
    const defaultPet = PET_CATALOG[0]; // Pipoca
    setProfile(demoProf);
    setActivePetState(defaultPet);
    setIsDemo(true);

    if (typeof window !== 'undefined') {
      localStorage.setItem('kids_profile', JSON.stringify(demoProf));
      localStorage.setItem('kids_active_pet_id', defaultPet.id);
    }
  };

  const signUpStudent = async (params: SignUpParams): Promise<{ success: boolean; error?: string }> => {
    try {
      if (isSupabaseConfigured && params.password) {
        // Cadastro real no Supabase Auth
        const { data: authData, error: authErr } = await supabase.auth.signUp({
          email: params.guardianEmail,
          password: params.password,
        });

        if (authErr) {
          return { success: false, error: authErr.message };
        }

        const userId = authData.user?.id;
        if (userId) {
          // Cria guardião
          await supabase.from('guardians').insert({
            id: userId,
            email: params.guardianEmail,
            full_name: params.guardianName,
            phone: params.guardianPhone || null,
          });

          // Cria perfil do aluno
          await supabase.from('profiles').insert({
            id: userId,
            guardian_id: userId,
            nickname: params.nickname,
            school_grade: params.grade,
            avatar_preset: params.avatarPreset,
            level: 1,
            xp: 0,
            streak_days: 1,
          });

          // Concede pontos iniciais de boas-vindas no ledger
          await supabase.from('points_ledger').insert({
            student_id: userId,
            amount: 150,
            reason: 'welcome_bonus',
          });

          // Registra o pet inicial escolhido
          await supabase.from('user_pets').insert({
            student_id: userId,
            pet_id: params.selectedPetId,
            is_active: true,
          });

          // Se marcou modo foco
          if (params.focusModeConsent) {
            await supabase.from('focus_mode_settings').insert({
              student_id: userId,
              is_active: true,
              guardian_consent: true,
              guardian_consent_date: new Date().toISOString(),
            });
          }
        }
      }

      // Configuração local / demo instantânea
      const newProfile: StudentProfile = {
        id: `student-${Date.now()}`,
        nickname: params.nickname,
        school_grade: params.grade,
        avatar_preset: params.avatarPreset,
        level: 1,
        xp: 0,
        points: 150,
        streak_days: 1,
      };

      const newGuardian: Guardian = {
        id: `guard-${Date.now()}`,
        email: params.guardianEmail,
        full_name: params.guardianName,
        phone: params.guardianPhone,
      };

      const pet = PET_CATALOG.find(p => p.id === params.selectedPetId) || PET_CATALOG[0];

      startTransition(() => {
        setProfile(newProfile);
        setGuardian(newGuardian);
        setActivePetState(pet);
        setIsDemo(!isSupabaseConfigured);

        if (params.focusModeConsent) {
          toggleFocusMode(true);
        }
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('kids_profile', JSON.stringify(newProfile));
        localStorage.setItem('kids_guardian', JSON.stringify(newGuardian));
        localStorage.setItem('kids_active_pet_id', pet.id);
      }

      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Falha ao cadastrar';
      return { success: false, error: message };
    }
  };

  const loginStudent = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (isSupabaseConfigured && password) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { success: false, error: error.message };
      }

      // Fallback amigável
      loginAsDemo(email.split('@')[0] || 'Campeão', 3);
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Falha no login';
      return { success: false, error: message };
    }
  };

  const logout = () => {
    if (isSupabaseConfigured) {
      supabase.auth.signOut();
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kids_profile');
      localStorage.removeItem('kids_guardian');
      localStorage.removeItem('kids_active_pet_id');
    }
    setProfile(null);
    setGuardian(null);
    setActivePetState(null);
  };

  return (
    <AuthContext.Provider
      value={{
        profile,
        guardian,
        activePet,
        focusMode,
        isLoading,
        isDemo,
        addPoints,
        setActivePet,
        toggleFocusMode,
        updateFocusSettings,
        updateProfile,
        signUpStudent,
        loginStudent,
        loginAsDemo,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
