import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('⚠️ Supabase URL and Anon Key must be set in environment variables');
  console.warn('⚠️ The app will run but database features will not work');
  console.warn('⚠️ Create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

// Configure Supabase client with explicit auth settings
// This ensures JWT tokens are properly sent to the database for RLS
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});

