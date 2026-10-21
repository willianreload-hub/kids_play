import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';

// Suporte ao novo formato de chave publishable do Supabase (com fallback para a anon key legado)
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'placeholder-key';

export const isSupabaseConfigured =
  Boolean(supabaseUrl && supabasePublishableKey) &&
  !supabaseUrl.includes('placeholder') &&
  !supabasePublishableKey.includes('placeholder');

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
