import { supabase } from '../supabase';
import { PostgrestError } from '@supabase/supabase-js';

export interface TargetHours {
  id: string;
  user_id: string;
  target_hours: number;
  period: string; // YYYY-MM format
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface UserWithTargetHours {
  id: string;
  name: string;
  role: string;
  supervisor_id?: string;
  supervisor_name?: string;
  target_hours: number;
  period: string;
}

// Helper function to create detailed error messages
const createErrorMessage = (action: string, error: PostgrestError | Error | unknown): string => {
  if (error instanceof Error) {
    return `Failed to ${action}: ${error.message}`;
  } else if (typeof error === 'object' && error !== null && 'message' in error) {
    return `Failed to ${action}: ${(error as any).message}`;
  }
  return `Failed to ${action}: Unknown error`;
};

export const targetHoursService = {
  /**
   * Get target hours for all staff for a specific period
   * Uses a single query with joins to enhance performance
   */
  async getTargetHoursForPeriod(period: string): Promise<UserWithTargetHours[]> {
    try {
      // Get authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user found');
      }

      console.log('Fetching target hours for period:', period);
      
      // First, get all staff users
      const { data: staffProfiles, error: staffError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'staff')
        .eq('is_active', true);
      
      if (staffError) {
        console.error('Error fetching staff profiles:', staffError);
        throw new Error(createErrorMessage('get staff users', staffError));
      }
      
      if (!staffProfiles || staffProfiles.length === 0) {
        console.log('No active staff found');
        return [];
      }

      console.log(`Found ${staffProfiles.length} staff profiles`);
      
      // Get supervisor information for all staff
      const supervisorIds = staffProfiles
        .map(staff => staff.supervisor_id)
        .filter(id => id !== null && id !== undefined);
      
      const { data: supervisors, error: supervisorsError } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', supervisorIds);
      
      if (supervisorsError) {
        console.error('Error fetching supervisors:', supervisorsError);
        throw new Error(createErrorMessage('get supervisors', supervisorsError));
      }

      console.log(`Found ${supervisors?.length || 0} supervisors`);
      
      // Get all target hours for this period in a single query
      const { data: targetHours, error: targetError } = await supabase
        .from('target_hours')
        .select('*')
        .eq('period', period);
      
      if (targetError) {
        console.error('Error fetching target hours:', targetError);
        throw new Error(createErrorMessage('get target hours', targetError));
      }

      console.log(`Found ${targetHours?.length || 0} target hour records for period ${period}`);
      
      // Map staff users to include their target hours and supervisor names
      const usersWithTargets = staffProfiles.map(staff => {
        const targetRecord = targetHours?.find(t => t.user_id === staff.id) || null;
        const supervisor = supervisors?.find(s => s.id === staff.supervisor_id) || null;
        
        return {
          id: staff.id,
          name: staff.name || `Staff ${staff.id.substring(0, 8)}`,
          role: staff.role,
          supervisor_id: staff.supervisor_id,
          supervisor_name: supervisor?.name || null,
          target_hours: targetRecord ? targetRecord.target_hours : 200, // Default to 200 if not set
          period
        };
      });
      
      console.log('Successfully mapped users with targets:', usersWithTargets.length);
      return usersWithTargets;
    } catch (error) {
      console.error('Error in getTargetHoursForPeriod:', error);
      throw error;
    }
  },
  
  /**
   * Set target hours for a specific user and period
   * Uses upsert for more efficient database operations
   */
  async setTargetHours(userId: string, period: string, targetHours: number): Promise<TargetHours> {
    try {
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Authentication required');
      }
      
      const { data, error } = await supabase
        .from('target_hours')
        .upsert({
          user_id: userId,
          period,
          target_hours: targetHours,
          created_by: user.id,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,period'
        })
        .select()
        .single();
      
      if (error) {
        throw new Error(createErrorMessage('update target hours', error));
      }
      
      if (!data) {
        throw new Error('Failed to update target hours: No data returned');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Bulk set target hours for all staff for a specific period
   * Uses batched operations for better performance
   */
  async bulkSetTargetHours(period: string, targetHours: number): Promise<void> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Authentication required');
      }
      
      // Get all staff user IDs
      const { data: staffUsers, error: staffError } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'staff')
        .eq('is_active', true);
      
      if (staffError || !staffUsers) {
        throw new Error(createErrorMessage('get staff users', staffError));
      }
      
      // Create batch records for the upsert operation
      const batchRecords = staffUsers.map(staffUser => ({
        user_id: staffUser.id,
        period,
        target_hours: targetHours,
        created_by: user.id,
        updated_at: new Date().toISOString()
      }));
      
      // Use a single upsert operation for all records instead of multiple individual calls
      // This significantly reduces network traffic and database load
      const { error } = await supabase
        .from('target_hours')
        .upsert(batchRecords, {
          onConflict: 'user_id,period'
        });
      
      if (error) {
        throw new Error(createErrorMessage('bulk update target hours', error));
      }
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get target hours for a specific staff member
   */
  async getTargetHoursByStaffId(staffId: string): Promise<{ hours: number } | null> {
    try {
      // Get current month in YYYY-MM format
      const now = new Date();
      const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      
      // Query target hours for the staff member
      const { data, error } = await supabase
        .from('target_hours')
        .select('target_hours')
        .eq('user_id', staffId)
        .eq('period', period)
        .single();
      
      if (error) {
        // If no record is found, return default value
        if (error.code === 'PGRST116') {
          return { hours: 200 }; // Default target hours
        }
        throw error;
      }
      
      return { hours: data.target_hours };
    } catch (error) {
      console.error('Error fetching target hours by staff ID:', error);
      return { hours: 200 }; // Default target hours on error
    }
  }
};

export default targetHoursService;