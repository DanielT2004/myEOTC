import { supabase } from '../lib/supabase';
import { UserProfile, UserRole } from '../types';

export interface SignUpData {
  email: string;
  password: string;
  full_name?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const authService = {
  async signUp(data: SignUpData) {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.full_name,
        },
      },
    });

    if (error) throw error;
    return authData;
  },

  async signIn(data: LoginData) {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) throw error;
    return authData;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        // If Supabase isn't configured, return null instead of throwing
        if (error.message?.includes('Invalid API key') || error.message?.includes('JWT')) {
          return null;
        }
        throw error;
      }
      return user;
    } catch (error: any) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  async getCurrentProfile(): Promise<UserProfile | null> {
    try {
      const user = await this.getCurrentUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        // If Supabase isn't configured, just return null
        if (error.message?.includes('Invalid API key') || error.message?.includes('JWT')) {
          return null;
        }
        throw error;
      }
      return data as UserProfile;
    } catch (error: any) {
      console.error('Error getting profile:', error);
      return null;
    }
  },

  async updateUserRole(userId: string, role: UserRole) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  onAuthStateChange(callback: (user: any) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ?? null);
    });
  },
};

