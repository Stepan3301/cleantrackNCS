import { supabase } from '../supabase';
import { Request } from '@/types/database.types';

export interface RequestInput {
  user_id: string;
  request_type: 'leave' | 'equipment' | 'timesheet_correction' | 'other';
  title: string;
  description: string;
  start_date?: string;
  end_date?: string;
}

export const requestsService = {
  /**
   * Get all requests for a specific user
   */
  async getUserRequests(userId: string) {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching user requests:', error);
      throw error;
    }
    
    return data || [];
  },
  
  /**
   * Get all requests that need to be handled by a supervisor
   */
  async getPendingRequestsForSupervisor(supervisorId: string) {
    // First, get all staff IDs for this supervisor
    const { data: staffProfiles, error: staffError } = await supabase
      .from('profiles')
      .select('id')
      .eq('supervisor_id', supervisorId)
      .eq('is_active', true);
      
    if (staffError) {
      console.error('Error fetching staff profiles:', staffError);
      throw staffError;
    }
    
    if (!staffProfiles || staffProfiles.length === 0) {
      return [];
    }
    
    // Get pending requests for all staff
    const staffIds = staffProfiles.map(profile => profile.id);
    const { data, error } = await supabase
      .from('requests')
      .select('*, profiles!requests_user_id_fkey(name)')
      .in('user_id', staffIds)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching pending requests:', error);
      throw error;
    }
    
    return data || [];
  },
  
  /**
   * Create a new request
   */
  async createRequest(requestData: RequestInput) {
    const { data, error } = await supabase
      .from('requests')
      .insert({
        user_id: requestData.user_id,
        request_type: requestData.request_type,
        title: requestData.title,
        description: requestData.description,
        start_date: requestData.start_date || null,
        end_date: requestData.end_date || null,
        status: 'pending'
      })
      .select();
      
    if (error) {
      console.error('Error creating request:', error);
      throw error;
    }
    
    return data?.[0];
  },
  
  /**
   * Update a request's status (approve/reject)
   */
  async updateRequestStatus(id: string, status: 'approved' | 'rejected', handledBy: string, responseMessage: string = '') {
    const { data, error } = await supabase
      .from('requests')
      .update({
        status: status,
        handled_by: handledBy,
        response_message: responseMessage
      })
      .eq('id', id)
      .select();
      
    if (error) {
      console.error('Error updating request status:', error);
      throw error;
    }
    
    return data?.[0];
  },
  
  /**
   * Get a request by ID
   */
  async getRequestById(id: string) {
    const { data, error } = await supabase
      .from('requests')
      .select('*, profiles!requests_user_id_fkey(name, email, role)')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error('Error fetching request:', error);
      throw error;
    }
    
    return data;
  },
  
  /**
   * Get all requests by type
   */
  async getRequestsByType(type: 'leave' | 'equipment' | 'timesheet_correction' | 'other') {
    const { data, error } = await supabase
      .from('requests')
      .select('*, profiles!requests_user_id_fkey(name)')
      .eq('request_type', type)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error(`Error fetching ${type} requests:`, error);
      throw error;
    }
    
    return data || [];
  },
  
  /**
   * Get count of pending requests for a supervisor
   */
  async getPendingRequestsCount(supervisorId: string) {
    // First, get all staff IDs for this supervisor
    const { data: staffProfiles, error: staffError } = await supabase
      .from('profiles')
      .select('id')
      .eq('supervisor_id', supervisorId)
      .eq('is_active', true);
      
    if (staffError) {
      console.error('Error fetching staff profiles:', staffError);
      throw staffError;
    }
    
    if (!staffProfiles || staffProfiles.length === 0) {
      return 0;
    }
    
    // Count pending requests for all staff
    const staffIds = staffProfiles.map(profile => profile.id);
    const { count, error } = await supabase
      .from('requests')
      .select('*', { count: 'exact', head: true })
      .in('user_id', staffIds)
      .eq('status', 'pending');
      
    if (error) {
      console.error('Error counting pending requests:', error);
      throw error;
    }
    
    return count || 0;
  }
}; 