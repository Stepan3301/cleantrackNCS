import { supabase } from '../supabase';
import { Database } from '@/types/database.types';

export interface WorkTimeInput {
  user_id: string;
  date: string;
  hours_worked: number;
  description?: string;
  location?: string;
}

export interface WorkTimeRecord {
  id: string;
  user_id: string;
  staff_id?: string;
  date: string;
  hours_worked: number;
  description?: string;
  location?: string;
  created_by: string;
  record_type: 'self' | 'supervisor';
  status: 'approved' | 'rejected' | 'pending';
  rejected_by?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  equality?: boolean | null;
}

export interface RecordComparison {
  date: string;
  user_id: string;
  staff_record?: WorkTimeRecord;
  supervisor_record?: WorkTimeRecord;
  status: 'matched' | 'mismatched' | 'pending';
  difference?: number;
  equality?: boolean | null;
}

export const workTimeService = {
  /**
   * Validates common work time submission rules
   */
  async validateWorkTimeSubmission(
    date: string,
    hours: number,
    userId: string,
    record_type: 'self' | 'supervisor'
  ): Promise<void> {
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      throw new Error(`Date must be in YYYY-MM-DD format, got: ${date}`);
    }

    // Check if date is in the future
    const submissionDate = new Date(date);
    // Reset time components to compare dates only
    submissionDate.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Use timestamp comparison for more accurate comparison
    if (submissionDate.getTime() > today.getTime()) {
      throw new Error('Cannot create records for future dates');
    }

    // Validate hours
    if (hours <= 0 || hours > 24) {
      throw new Error(`Hours worked must be between 0 and 24, got: ${hours}`);
    }

    // Check for existing record of the same type
    const { data: existingRecord } = await supabase
      .from('work_time')
      .select('id, record_type')
      .eq('user_id', userId)
      .eq('date', date)
      .eq('record_type', record_type)
      .single();

    if (existingRecord) {
      throw new Error(`A ${record_type} record already exists for user ${userId} on ${date}`);
    }
    
    // No need to check for other record types - supervisor and self records are now independent
  },

  /**
   * Create a staff work time record (self-submission)
   */
  async createStaffRecord(
    userId: string,
    date: string,
    hours: number,
    location?: string,
    description?: string
  ): Promise<WorkTimeRecord> {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('No authenticated user found');
    }

    // Ensure user is creating their own record
    if (userId !== user.id) {
      throw new Error('Staff members can only create records for themselves');
    }

    // Validate submission
    await this.validateWorkTimeSubmission(date, hours, userId, 'self');

    // Create the record
    const { data, error } = await supabase
      .from('work_time')
      .insert({
        user_id: userId,
        date,
        hours_worked: hours,
        location,
        description,
        created_by: user.id,
        record_type: 'self',
        status: 'approved'
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create staff record: ${error.message}`);
    }

    return data;
  },

  /**
   * Create a supervisor work time record
   */
  async createSupervisorRecord(
    supervisorId: string,
    staffId: string,
    date: string,
    hours: number,
    location?: string,
    description?: string
  ): Promise<WorkTimeRecord> {
    // Check if supervisor is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== supervisorId) {
      throw new Error('Invalid supervisor authentication');
    }

    // Verify supervisor relationship
    const { data: staffMember } = await supabase
      .from('profiles')
      .select('supervisor_id')
      .eq('id', staffId)
      .single();

    if (!staffMember || staffMember.supervisor_id !== supervisorId) {
      throw new Error('Not authorized to create records for this staff member');
    }

    // Validate submission
    await this.validateWorkTimeSubmission(date, hours, staffId, 'supervisor');

    // Create the record
    const { data, error } = await supabase
      .from('work_time')
      .insert({
        user_id: staffId,
        date,
        hours_worked: hours,
        location,
        description,
        created_by: supervisorId,
        record_type: 'supervisor',
        status: 'approved'
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create supervisor record: ${error.message}`);
    }

    return data;
  },

  /**
   * Get record comparison for a specific user and date
   */
  async getRecordComparison(userId: string, date: string): Promise<RecordComparison> {
    const { data: records, error } = await supabase
      .from('work_time')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date);

    if (error) {
      throw new Error(`Failed to get record comparison: ${error.message}`);
    }

    const typedRecords = (records || []) as WorkTimeRecord[];
    const staffRecord = typedRecords.find(r => r.record_type === 'self');
    const supervisorRecord = typedRecords.find(r => r.record_type === 'supervisor');

    let status: 'matched' | 'mismatched' | 'pending' = 'pending';
    let difference: number | undefined;
    
    // Get equality from record if available (should be same on both records)
    const equality = staffRecord?.equality ?? supervisorRecord?.equality;

    if (staffRecord && supervisorRecord) {
      // We have both records, check equality
      if (equality === true) {
        status = 'matched';
      } else if (equality === false) {
        status = 'mismatched';
        difference = Math.abs(staffRecord.hours_worked - supervisorRecord.hours_worked);
      } else {
        // If equality is null but we have both records, calculate it
        if (staffRecord.hours_worked === supervisorRecord.hours_worked) {
          status = 'matched';
        } else {
          status = 'mismatched';
          difference = Math.abs(staffRecord.hours_worked - supervisorRecord.hours_worked);
        }
      }
    }

    return {
      date,
      user_id: userId,
      staff_record: staffRecord,
      supervisor_record: supervisorRecord,
      status,
      difference,
      equality
    };
  },

  /**
   * Get all mismatched records within a date range
   */
  async getMismatchedRecords(
    startDate: string,
    endDate: string
  ): Promise<RecordComparison[]> {
    const { data: records, error } = await supabase
      .from('work_time')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) {
      throw new Error(`Failed to get mismatched records: ${error.message}`);
    }

    const typedRecords = (records || []) as WorkTimeRecord[];

    // Group records by user_id and date
    const recordGroups = typedRecords.reduce((groups, record) => {
      const key = `${record.user_id}-${record.date}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(record);
      return groups;
    }, {} as Record<string, WorkTimeRecord[]>);

    // Find mismatches
    const mismatches: RecordComparison[] = [];

    Object.entries(recordGroups).forEach(([key, groupRecords]) => {
      const [userId, date] = key.split('-');
      const staffRecord = groupRecords.find(r => r.record_type === 'self');
      const supervisorRecord = groupRecords.find(r => r.record_type === 'supervisor');
      
      // Get equality from record if available
      const equality = staffRecord?.equality ?? supervisorRecord?.equality;

      // Check if we have a mismatch based on equality field
      if (equality === false) {
        // We have a mismatch indicated by the equality field
        mismatches.push({
          date,
          user_id: userId,
          staff_record: staffRecord,
          supervisor_record: supervisorRecord,
          status: 'mismatched',
          difference: staffRecord && supervisorRecord ? 
            Math.abs(staffRecord.hours_worked - supervisorRecord.hours_worked) : undefined,
          equality
        });
      } else if (staffRecord && supervisorRecord && equality === null) {
        // If equality is null but we have both records, compute the comparison
        const hoursDifference = Math.abs(staffRecord.hours_worked - supervisorRecord.hours_worked);
        if (staffRecord.hours_worked !== supervisorRecord.hours_worked) {
          mismatches.push({
            date,
            user_id: userId,
            staff_record: staffRecord,
            supervisor_record: supervisorRecord,
            status: 'mismatched',
            difference: hoursDifference,
            equality: false // It should be false, but the DB trigger hasn't updated it yet
          });
        }
      }
    });

    return mismatches;
  },

  /**
   * Submit new work time record
   */
  async submitWorkTime(workTimeData: WorkTimeInput): Promise<WorkTimeRecord[]> {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('No authenticated user found');
    }
    
    // Validate required fields
    if (!workTimeData.date) {
      throw new Error('Date is required for work time submission');
    }
    
    // Validate date format (should be YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(workTimeData.date)) {
      throw new Error(`Date must be in YYYY-MM-DD format, got: ${workTimeData.date}`);
    }
    
    // Validate hours
    if (workTimeData.hours_worked === undefined || workTimeData.hours_worked === null) {
      throw new Error('Hours worked is required for work time submission');
    }
    
    // Ensure hours_worked is a valid number
    const hours = parseFloat(Number(workTimeData.hours_worked).toFixed(2));
    
    if (isNaN(hours)) {
      throw new Error(`Hours worked must be a valid number, got: ${workTimeData.hours_worked}`);
    }
    
    if (hours <= 0) {
      throw new Error(`Hours worked must be greater than 0, got: ${hours}`);
    }
    
    if (hours > 24) {
      throw new Error(`Hours worked must be less than or equal to 24, got: ${hours}`);
    }
    
    // Determine the record type (self vs supervisor)
    // If the user is submitting for themselves, it's 'self', otherwise it's 'supervisor'
    const record_type = workTimeData.user_id === user.id ? 'self' : 'supervisor';
    
    // Prepare submission data with default approved status
    const submissionData = {
      user_id: workTimeData.user_id || user.id,
      date: workTimeData.date,
      hours_worked: hours,
      description: workTimeData.description || null,
      location: workTimeData.location || null,
      status: 'approved', // All submissions are automatically approved
      created_by: user.id,
      record_type
    };
    
    try {
      // First, check if a record already exists
      const { data: existingRecord, error: checkError } = await supabase
        .from('work_time')
        .select('id')
        .eq('user_id', submissionData.user_id)
        .eq('date', workTimeData.date)
        .eq('record_type', record_type)
        .maybeSingle();
        
      if (checkError) {
        throw new Error(`Failed to check for existing records: ${checkError.message}`);
      }
      
      // Update if exists, otherwise insert
      if (existingRecord) {
        // Simple update - the new policy allows updating approved records
        const { data: updateData, error: updateError } = await supabase
          .from('work_time')
          .update({
            hours_worked: submissionData.hours_worked,
            location: submissionData.location,
            description: submissionData.description,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingRecord.id)
          .select();
          
        if (updateError) {
          throw new Error(`Failed to update work time: ${updateError.message}`);
        }
        
        return updateData;
      } else {
        // Insert new record
        const { data: insertData, error: insertError } = await supabase
          .from('work_time')
          .insert(submissionData)
          .select();
          
        if (insertError) {
          throw new Error(`Failed to insert work time: ${insertError.message}`);
        }
        
        return insertData;
      }
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Get work time records for a specific user
   */
  async getUserWorkTime(userId: string): Promise<WorkTimeRecord[]> {
    const { data, error } = await supabase
      .from('work_time')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
      
    if (error) {
      throw new Error(`Failed to get user work time: ${error.message}`);
    }
    
    return data || [];
  },
  
  /**
   * Get work time records for a specific date range
   */
  async getWorkTimeInDateRange(userId: string, startDate: string, endDate: string): Promise<WorkTimeRecord[]> {
    const { data, error } = await supabase
      .from('work_time')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });
      
    if (error) {
      throw new Error(`Failed to get work time in date range: ${error.message}`);
    }
    
    return data || [];
  },
  
  /**
   * Get total hours worked in a date range
   */
  async getTotalHoursWorked(userId: string, startDate: string, endDate: string): Promise<number> {
    const { data, error } = await supabase
      .from('work_time')
      .select('hours_worked')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate);
      
    if (error) {
      throw new Error(`Failed to get total hours worked: ${error.message}`);
    }
    
    if (!data || data.length === 0) {
      return 0;
    }
    
    // Sum up the hours worked
    return data.reduce((total, record) => total + Number(record.hours_worked), 0);
  },
  
  /**
   * Get work time records for users supervised by a specific supervisor
   * This is now just for viewing purposes, not for approval
   */
  async getSupervisorWorkTime(supervisorId: string): Promise<WorkTimeRecord[]> {
    // First, get all staff IDs for this supervisor
    const { data: staffProfiles, error: staffError } = await supabase
      .from('profiles')
      .select('id')
      .eq('supervisor_id', supervisorId)
      .eq('is_active', true);
      
    if (staffError) {
      throw new Error(`Failed to get staff profiles: ${staffError.message}`);
    }
    
    if (!staffProfiles || staffProfiles.length === 0) {
      return [];
    }
    
    // Get work time for all staff
    const staffIds = staffProfiles.map(profile => profile.id);
    const { data, error } = await supabase
      .from('work_time')
      .select('*, profiles!work_time_user_id_fkey(name)')
      .in('user_id', staffIds)
      .order('date', { ascending: false });
      
    if (error) {
      throw new Error(`Failed to get supervisor work time: ${error.message}`);
    }
    
    return data || [];
  },
  
  /**
   * Update a work time record - now mostly for rejections or corrections
   */
  async updateWorkTime(
    id: string,
    updateData: Partial<WorkTimeRecord>
  ): Promise<{ success: boolean, data: any }> {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('No authenticated user found');
    }
    
    // Set update timestamp
    updateData.updated_at = new Date().toISOString();
    
    // Handle rejections
    if (updateData.status === 'rejected') {
      updateData.rejected_by = user.id;
    }
    
    const { data, error } = await supabase
      .from('work_time')
      .update(updateData)
      .eq('id', id)
      .select();
    
    if (error) {
      throw new Error(`Failed to update work time: ${error.message}`);
    }
    
    return { success: true, data };
  },

  /**
   * Get completed hours by staff ID and month
   */
  async getCompletedHoursByStaffIdAndMonth(
    staffId: string,
    monthPeriod: string // YYYY-MM format
  ): Promise<{ data: number; error: Error | null }> {
    try {
      // Extract year and month from period
      const [year, month] = monthPeriod.split('-').map(Number);
      
      // Create start and end dates for the month
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];
      
      // Get total completed hours for the month
      // We need to sum both self and supervisor records
      const { data, error } = await supabase
        .from('work_time')
        .select('hours_worked')
        .eq('user_id', staffId)
        .eq('status', 'approved')
        .gte('date', startDate)
        .lte('date', endDate);
        
      if (error) {
        throw error;
      }
      
      const totalHours = data?.reduce((sum, record) => sum + (record.hours_worked || 0), 0) || 0;
      
      return { data: totalHours, error: null };
    } catch (error) {
      console.error('Error fetching completed hours:', error);
      return { data: 0, error: error as Error };
    }
  }
};

export default workTimeService; 