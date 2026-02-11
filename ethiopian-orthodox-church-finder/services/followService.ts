import { supabase } from '../lib/supabase';

export const followService = {
  // Follow a church
  async followChurch(userId: string, churchId: string): Promise<void> {
    const { error } = await supabase
      .from('followed_churches')
      .insert({
        user_id: userId,
        church_id: churchId,
      })
      .select(); // Required for RLS to work properly

    if (error) {
      // Ignore duplicate key errors
      if (error.code !== '23505') throw error;
    }
  },

  // Unfollow a church
  async unfollowChurch(userId: string, churchId: string): Promise<void> {
    const { error } = await supabase
      .from('followed_churches')
      .delete()
      .eq('user_id', userId)
      .eq('church_id', churchId);

    if (error) throw error;
  },

  // Get followed churches for a user
  async getFollowedChurches(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('followed_churches')
      .select('church_id')
      .eq('user_id', userId);

    if (error) throw error;
    return (data || []).map((item: any) => item.church_id);
  },

  // Check if user follows a church
  async isFollowing(userId: string, churchId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('followed_churches')
      .select('id')
      .eq('user_id', userId)
      .eq('church_id', churchId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return false; // Not found
      throw error;
    }
    return !!data;
  },
};

