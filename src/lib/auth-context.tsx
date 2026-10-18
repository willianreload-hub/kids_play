'use client';

import React, { createContext, useContext, useEffect, useState, useTransition } from 'react';
import { StudentProfile, Guardian, FocusModeSettings, Pet, SchoolGrade, UserPet, UserAccessory } from './types';
import { PET_CATALOG, ACCESSORY_CATALOG } from './content-data';
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
  userPets: UserPet[];
  userAccessories: UserAccessory[];
  equippedAccessoryId: string | null;
  focusMode: FocusModeSettings;
  isLoading: boolean;
  isDemo: boolean;
  addPoints: (amount: number, reason: string) => void;
  setActivePet: (pet: Pet) => void;
  evolvePet: (petId: string) => { success: boolean; newLevel?: number; message?: string };
  buyAccessory: (accessoryId: string) => { success: boolean; message?: string };
  toggleEquipAccessory: (accessoryId: string) => void;
  unlockPetFromBox: (pet: Pet, isDuplicate: boolean, fragments: number) => void;
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
  const [userPets, setUserPets] = useState<UserPet[]>([]);
  const [userAccessories, setUserAccessories] = useState<UserAccessory[]>([]);
  const [equippedAccessoryId, setEquippedAccessoryId] = useState<string | null>(null);
  const [focusMode, setFocusMode] = useState<FocusModeSettings>(DEFAULT_FOCUS_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [, startTransition] = useTransition();

  // Carrega estado salvo do localStorage ou Supabase
  useEffect(() => {
    async function initAuth() {
      if (typeof window !== 'undefined') {
        const savedProfile = localStorage.getItem('kids_profile');
        const savedGuardian = localStorage.getItem('kids_guardian');
        const savedFocus = localStorage.getItem('kids_focus_settings');
        const savedPetId = localStorage.getItem('kids_active_pet_id');
        const savedUserPets = localStorage.getItem('kids_user_pets');
        const savedUserAccessories = localStorage.getItem('kids_user_accessories');
        const savedEquippedAcc = localStorage.getItem('kids_equipped_acc');

        if (savedProfile) {
          try {
            const parsedProfile: StudentProfile = JSON.parse(savedProfile);
            setProfile(parsedProfile);
            if (savedGuardian) setGuardian(JSON.parse(savedGuardian));
            if (savedFocus) setFocusMode(JSON.parse(savedFocus));
            if (savedEquippedAcc) setEquippedAccessoryId(savedEquippedAcc);

            const foundPet = PET_CATALOG.find(p => p.id === (savedPetId || 'pipoca_raposa')) || PET_CATALOG[0];
            setActivePetState(foundPet);

            if (savedUserPets) {
              setUserPets(JSON.parse(savedUserPets));
            } else {
              const initialUserPets: UserPet[] = [
                {
                  id: `up-${foundPet.id}`,
                  student_id: parsedProfile.id,
                  pet_id: foundPet.id,
                  nickname: foundPet.name,
                  level: 1,
                  evolution_fragments: 10,
                  is_active: true,
                  pet: foundPet,
                },
              ];
              setUserPets(initialUserPets);
              localStorage.setItem('kids_user_pets', JSON.stringify(initialUserPets));
            }

            if (savedUserAccessories) {
              setUserAccessories(JSON.parse(savedUserAccessories));
            }

            setIsDemo(parsedProfile.id.startsWith('demo-') || parsedProfile.id.startsWith('student-'));
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
                  points: 250,
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

        // Cria perfil inicial demo por padrão
        loginAsDemo('Aventureiro', 3);
        setIsLoading(false);
      }
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
    setUserPets(prev => {
      const updated = prev.map(up => ({
        ...up,
        is_active: up.pet_id === pet.id,
      }));
      if (typeof window !== 'undefined') {
        localStorage.setItem('kids_user_pets', JSON.stringify(updated));
      }
      return updated;
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem('kids_active_pet_id', pet.id);
    }
  };

  // Evolução de PET com fragmentos
  const evolvePet = (petId: string) => {
    const userPet = userPets.find(up => up.pet_id === petId);
    if (!userPet) {
      return { success: false, message: 'Você ainda não possui este PET!' };
    }

    const currentLvl = userPet.level;
    if (currentLvl >= 5) {
      return { success: false, message: 'Este PET já alcançou o nível máximo de evolução (Nível 5)!' };
    }

    // Fragmentos necessários por nível
    const reqFragments = currentLvl * 15;
    if (userPet.evolution_fragments < reqFragments) {
      return { 
        success: false, 
        message: `Faltam fragmentos! Você tem ${userPet.evolution_fragments} e precisa de ${reqFragments} para o Nível ${currentLvl + 1}.` 
      };
    }

    const nextLvl = currentLvl + 1;
    sounds.playLevelUp();

    setUserPets(prev => {
      const updated = prev.map(up => {
        if (up.pet_id === petId) {
          return {
            ...up,
            level: nextLvl,
            evolution_fragments: up.evolution_fragments - reqFragments,
          };
        }
        return up;
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('kids_user_pets', JSON.stringify(updated));
      }
      return updated;
    });

    return { 
      success: true, 
      newLevel: nextLvl, 
      message: `PARABÉNS! Seu PET evoluiu para o Nível ${nextLvl}! Seus bônus de XP aumentaram!` 
    };
  };

  // Compra de Acessório
  const buyAccessory = (accessoryId: string) => {
    const acc = ACCESSORY_CATALOG.find(a => a.id === accessoryId);
    if (!acc) return { success: false, message: 'Acessório não encontrado.' };

    const alreadyOwned = userAccessories.some(ua => ua.accessory_id === accessoryId);
    if (alreadyOwned) return { success: false, message: 'Você já possui este acessório!' };

    if ((profile?.points || 0) < acc.price_points) {
      sounds.playGentleBoop();
      return { success: false, message: `Você precisa de ${acc.price_points} moedas para comprar este acessório!` };
    }

    addPoints(-acc.price_points, `buy_acc_${accessoryId}`);
    sounds.playSuccess();

    const newAcc: UserAccessory = {
      id: `ua-${Date.now()}`,
      accessory_id: accessoryId,
      is_equipped: false,
      accessory: acc,
    };

    setUserAccessories(prev => {
      const updated = [...prev, newAcc];
      if (typeof window !== 'undefined') {
        localStorage.setItem('kids_user_accessories', JSON.stringify(updated));
      }
      return updated;
    });

    return { success: true, message: `Você comprou ${acc.name}! Agora pode vesti-lo no seu PET!` };
  };

  // Equipar / Desequipar Acessório
  const toggleEquipAccessory = (accessoryId: string) => {
    sounds.playClick();
    setEquippedAccessoryId(prev => {
      const next = prev === accessoryId ? null : accessoryId;
      if (typeof window !== 'undefined') {
        if (next) {
          localStorage.setItem('kids_equipped_acc', next);
        } else {
          localStorage.removeItem('kids_equipped_acc');
        }
      }
      return next;
    });

    setUserAccessories(prev => {
      const updated = prev.map(ua => ({
        ...ua,
        is_equipped: ua.accessory_id === accessoryId ? !ua.is_equipped : false,
      }));
      if (typeof window !== 'undefined') {
        localStorage.setItem('kids_user_accessories', JSON.stringify(updated));
      }
      return updated;
    });
  };

  // Desbloqueio de PET vindo da Caixa Surpresa
  const unlockPetFromBox = (pet: Pet, isDuplicate: boolean, fragments: number) => {
    setUserPets(prev => {
      let updated: UserPet[];
      const existing = prev.find(up => up.pet_id === pet.id);

      if (existing) {
        // Converte em fragmentos
        updated = prev.map(up =>
          up.pet_id === pet.id
            ? { ...up, evolution_fragments: up.evolution_fragments + fragments }
            : up
        );
      } else {
        // Adiciona novo pet ao álbum
        const newUp: UserPet = {
          id: `up-${Date.now()}`,
          student_id: profile?.id || 'demo-student',
          pet_id: pet.id,
          nickname: pet.name,
          level: 1,
          evolution_fragments: 0,
          is_active: false,
          pet,
        };
        updated = [...prev, newUp];
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('kids_user_pets', JSON.stringify(updated));
      }
      return updated;
    });
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
      points: 350,
      streak_days: 3,
    };
    const defaultPet = PET_CATALOG[0]; // Pipoca
    const initialUserPets: UserPet[] = [
      {
        id: `up-${defaultPet.id}`,
        student_id: demoProf.id,
        pet_id: defaultPet.id,
        nickname: defaultPet.name,
        level: 1,
        evolution_fragments: 15,
        is_active: true,
        pet: defaultPet,
      },
    ];

    setProfile(demoProf);
    setActivePetState(defaultPet);
    setUserPets(initialUserPets);
    setIsDemo(true);

    if (typeof window !== 'undefined') {
      localStorage.setItem('kids_profile', JSON.stringify(demoProf));
      localStorage.setItem('kids_active_pet_id', defaultPet.id);
      localStorage.setItem('kids_user_pets', JSON.stringify(initialUserPets));
    }
  };

  const signUpStudent = async (params: SignUpParams): Promise<{ success: boolean; error?: string }> => {
    try {
      if (isSupabaseConfigured && params.password) {
        const { data: authData, error: authErr } = await supabase.auth.signUp({
          email: params.guardianEmail,
          password: params.password,
        });

        if (authErr) {
          return { success: false, error: authErr.message };
        }

        const userId = authData.user?.id;
        if (userId) {
          await supabase.from('guardians').insert({
            id: userId,
            email: params.guardianEmail,
            full_name: params.guardianName,
            phone: params.guardianPhone || null,
          });

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

          await supabase.from('points_ledger').insert({
            student_id: userId,
            amount: 200,
            reason: 'welcome_bonus',
          });

          await supabase.from('user_pets').insert({
            student_id: userId,
            pet_id: params.selectedPetId,
            is_active: true,
          });

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

      const newProfile: StudentProfile = {
        id: `student-${Date.now()}`,
        nickname: params.nickname,
        school_grade: params.grade,
        avatar_preset: params.avatarPreset,
        level: 1,
        xp: 0,
        points: 200,
        streak_days: 1,
      };

      const newGuardian: Guardian = {
        id: `guard-${Date.now()}`,
        email: params.guardianEmail,
        full_name: params.guardianName,
        phone: params.guardianPhone,
      };

      const pet = PET_CATALOG.find(p => p.id === params.selectedPetId) || PET_CATALOG[0];
      const initialUserPets: UserPet[] = [
        {
          id: `up-${pet.id}`,
          student_id: newProfile.id,
          pet_id: pet.id,
          nickname: pet.name,
          level: 1,
          evolution_fragments: 15,
          is_active: true,
          pet,
        },
      ];

      startTransition(() => {
        setProfile(newProfile);
        setGuardian(newGuardian);
        setActivePetState(pet);
        setUserPets(initialUserPets);
        setIsDemo(!isSupabaseConfigured);

        if (params.focusModeConsent) {
          toggleFocusMode(true);
        }
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('kids_profile', JSON.stringify(newProfile));
        localStorage.setItem('kids_guardian', JSON.stringify(newGuardian));
        localStorage.setItem('kids_active_pet_id', pet.id);
        localStorage.setItem('kids_user_pets', JSON.stringify(initialUserPets));
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
      localStorage.removeItem('kids_user_pets');
      localStorage.removeItem('kids_user_accessories');
      localStorage.removeItem('kids_equipped_acc');
    }
    setProfile(null);
    setGuardian(null);
    setActivePetState(null);
    setUserPets([]);
    setUserAccessories([]);
    setEquippedAccessoryId(null);
  };

  return (
    <AuthContext.Provider
      value={{
        profile,
        guardian,
        activePet,
        userPets,
        userAccessories,
        equippedAccessoryId,
        focusMode,
        isLoading,
        isDemo,
        addPoints,
        setActivePet,
        evolvePet,
        buyAccessory,
        toggleEquipAccessory,
        unlockPetFromBox,
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
