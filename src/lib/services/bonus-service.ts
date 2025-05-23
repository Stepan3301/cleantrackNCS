import { supabase } from '../supabase';

export interface Bonus {
  id: string;
  user_id: string;
  amount_per_hour: number;
  hours_threshold: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

export interface StaffWithBonus {
  id: string;
  name: string;
  email: string;
  role: string;
  supervisor_name: string | null;
  manager_name: string | null;
  amount_per_hour: number;
  hours_threshold: number;
  current_month_bonus: number;
  hours_worked: number;
  progress: number; // Percentage of target hours completed
}

export interface BonusFormula {
  amount_per_hour: number;
  hours_threshold: number;
}

export const bonusService = {
  /**
   * Get all staff members with their bonus formulas
   */
  async getAllStaffWithBonuses(): Promise<StaffWithBonus[]> {
    const { data, error } = await supabase
      .from('staff_with_bonuses')
      .select('*')
      .order('name');
      
    if (error) {
      console.error('Error fetching staff with bonuses:', error);
      throw error;
    }
    
    // Get hours worked for each staff member
    const staffWithBonuses = await Promise.all((data || []).map(async (staff) => {
      const hoursWorked = await this.getCurrentMonthWorkedHours(staff.id);
      const progress = staff.hours_threshold > 0 ? 
        Math.min(Math.round((hoursWorked / staff.hours_threshold) * 100), 100) : 0;
      
      return {
        ...staff,
        hours_worked: hoursWorked,
        progress
      };
    }));
    
    return staffWithBonuses;
  },
  
  /**
   * Get current month's worked hours for a staff member
   */
  async getCurrentMonthWorkedHours(staffId: string): Promise<number> {
    try {
      // Get current date
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth(); // JavaScript months are 0-based
      
      // Create start and end dates for the month
      const startDate = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0).getDate();
      const endDate = new Date(year, month, lastDay);
      
      // Format as ISO strings and take just the date part (YYYY-MM-DD)
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];
      
      console.log(`Fetching work hours for ${staffId} from ${formattedStartDate} to ${formattedEndDate}`);
      
      // Query only approved work time records for this date range and staff member
      const { data, error } = await supabase
        .from('work_time')
        .select('hours_worked')
        .eq('user_id', staffId)
        .eq('status', 'approved')
        .gte('date', formattedStartDate)
        .lte('date', formattedEndDate);
        
      if (error) {
        console.error('Error fetching worked hours:', error);
        throw error;
      }
      
      console.log(`Found ${data?.length || 0} work records for ${staffId}`);
      
      // Sum hours worked
      return data?.reduce((total, record) => total + (record.hours_worked || 0), 0) || 0;
    } catch (error) {
      console.error('Error in getCurrentMonthWorkedHours:', error);
      // Return 0 instead of throwing to prevent cascading errors
      return 0;
    }
  },
  
  /**
   * Get bonus formula for a specific staff member
   */
  async getStaffBonus(staffId: string): Promise<Bonus | null> {
    const { data, error } = await supabase
      .from('bonuses')
      .select('*')
      .eq('user_id', staffId)
      .order('created_at', { ascending: false })
      .limit(1);
      
    if (error) {
      console.error('Error fetching staff bonus:', error);
      throw error;
    }
    
    return data && data.length > 0 ? data[0] : null;
  },
  
  /**
   * Set bonus formula for a specific staff member
   */
  async setStaffBonus(staffId: string, formula: BonusFormula, currentUserId: string): Promise<Bonus> {
    // Check if bonus already exists for this staff member
    const existingBonus = await this.getStaffBonus(staffId);
    
    if (existingBonus) {
      // Update existing bonus
      const { data, error } = await supabase
        .from('bonuses')
        .update({
          amount_per_hour: formula.amount_per_hour,
          hours_threshold: formula.hours_threshold,
          updated_by: currentUserId
        })
        .eq('id', existingBonus.id)
        .select();
        
      if (error) {
        console.error('Error updating staff bonus:', error);
        throw error;
      }
      
      return data![0];
    } else {
      // Create new bonus
      const { data, error } = await supabase
        .from('bonuses')
        .insert({
          user_id: staffId,
          amount_per_hour: formula.amount_per_hour,
          hours_threshold: formula.hours_threshold,
          created_by: currentUserId
        })
        .select();
        
      if (error) {
        console.error('Error creating staff bonus:', error);
        throw error;
      }
      
      return data![0];
    }
  },
  
  /**
   * Bulk set bonus formula for all staff members
   */
  async bulkSetBonuses(formula: BonusFormula, currentUserId: string): Promise<void> {
    try {
      // First get all staff IDs
      const { data: staffProfiles, error: staffError } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'staff')
        .eq('is_active', true);
        
      if (staffError) {
        throw staffError;
      }
      
      if (!staffProfiles || staffProfiles.length === 0) {
        return; // No staff members to update
      }
      
      // For each staff member, set the bonus formula
      for (const staff of staffProfiles) {
        await this.setStaffBonus(staff.id, formula, currentUserId);
      }
    } catch (error) {
      console.error('Error in bulk set bonuses:', error);
      throw error;
    }
  },
  
  /**
   * Calculate bonus for a specific staff member for the current month
   * Only counts bonus for hours worked beyond the threshold
   */
  async calculateCurrentMonthBonus(staffId: string): Promise<number> {
    try {
      // Get the bonus formula
      const bonusData = await this.getStaffBonus(staffId);
      if (!bonusData || bonusData.amount_per_hour <= 0 || bonusData.hours_threshold <= 0) {
        console.log(`No bonus formula or invalid formula for staff ${staffId}`);
        return 0; // No bonus formula or invalid formula
      }
      
      // Get worked hours
      const hoursWorked = await this.getCurrentMonthWorkedHours(staffId);
      console.log(`Staff ${staffId} worked ${hoursWorked} hours with threshold ${bonusData.hours_threshold}`);
      
      // Only calculate bonus if hours worked is greater than threshold
      if (hoursWorked <= bonusData.hours_threshold) {
        return 0;
      }
      
      // Calculate bonus for hours beyond threshold
      const extraHours = hoursWorked - bonusData.hours_threshold;
      const bonusAmount = extraHours * bonusData.amount_per_hour;
      
      console.log(`Calculated bonus for ${staffId}: ${extraHours} extra hours × ${bonusData.amount_per_hour} = ${bonusAmount}`);
      return bonusAmount;
    } catch (error) {
      console.error('Error calculating current month bonus:', error);
      return 0; // Return 0 instead of throwing to prevent cascading errors
    }
  },
  
  /**
   * Get staff members managed by a specific supervisor
   */
  async getStaffBySupervisorWithBonuses(supervisorId: string): Promise<StaffWithBonus[]> {
    // First get staff IDs for this supervisor
    const { data: staffIds, error: staffError } = await supabase
      .from('profiles')
      .select('id')
      .eq('supervisor_id', supervisorId)
      .eq('is_active', true);
      
    if (staffError) {
      console.error('Error fetching staff IDs:', staffError);
      throw staffError;
    }
    
    if (!staffIds || staffIds.length === 0) {
      return [];
    }
    
    // Get bonus data for these staff members
    const { data, error } = await supabase
      .from('staff_with_bonuses')
      .select('*')
      .in('id', staffIds.map(s => s.id))
      .order('name');
      
    if (error) {
      console.error('Error fetching staff with bonuses:', error);
      throw error;
    }
    
    return data || [];
  },
  
  /**
   * Get total bonuses paid for the current month
   */
  async getTotalBonusesPaid(): Promise<number> {
    try {
      const { data: allStaff } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'staff')
        .eq('is_active', true);
        
      if (!allStaff || allStaff.length === 0) {
        return 0;
      }
      
      let totalBonuses = 0;
      for (const staff of allStaff) {
        const bonus = await this.calculateCurrentMonthBonus(staff.id);
        totalBonuses += bonus;
      }
      
      return totalBonuses;
    } catch (error) {
      console.error('Error calculating total bonuses:', error);
      throw error;
    }
  }
};

export default bonusService; 