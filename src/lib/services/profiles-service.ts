import { supabase } from '../supabase';
import { Profile, UserRole } from '@/types/database.types';

export const profilesService = {
  /**
   * Get all profiles
   */
  async getAllProfiles() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching profiles:', error);
      throw error;
    }
    
    return data || [];
  },
  
  /**
   * Get a profile by ID
   */
  async getProfileById(id: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
    
    return data;
  },
  
  /**
   * Get profiles by role
   */
  async getProfilesByRole(role: UserRole) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', role)
      .eq('is_active', true);
      
    if (error) {
      console.error(`Error fetching ${role} profiles:`, error);
      throw error;
    }
    
    return data || [];
  },
  
  /**
   * Get staff members for a specific supervisor
   */
  async getStaffForSupervisor(supervisorId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('supervisor_id', supervisorId)
      .eq('is_active', true);
      
    if (error) {
      console.error('Error fetching staff for supervisor:', error);
      throw error;
    }
    
    return data || [];
  },
  
  /**
   * Get supervisors for a specific manager
   */
  async getSupervisorsForManager(managerId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('manager_id', managerId)
      .eq('is_active', true);
      
    if (error) {
      console.error('Error fetching supervisors for manager:', error);
      throw error;
    }
    
    return data || [];
  },
  
  /**
   * Update a profile
   */
  async updateProfile(id: string, updates: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select();
      
    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
    
    return data?.[0];
  },
  
  /**
   * Search profiles by name or email
   */
  async searchProfiles(query: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
      .eq('is_active', true);
      
    if (error) {
      console.error('Error searching profiles:', error);
      throw error;
    }
    
    return data || [];
  },
  
  /**
   * Update a profile's avatar URL
   */
  async updateProfileAvatar(id: string, avatarUrl: string | null) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select();
      
    if (error) {
      console.error('Error updating profile avatar:', error);
      throw error;
    }
    
    return data?.[0];
  }
}; 