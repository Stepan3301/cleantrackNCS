import { supabase } from '../supabase';

export interface RegistrationRequest {
  id: string;
  email: string;
  name: string;
  phone?: string;
  desired_role: string;
  status: 'pending' | 'approved' | 'rejected';
  handled_by?: string;
  created_at: string;
  updated_at: string;
}

export interface RegistrationRequestInput {
  email: string;
  name: string;
  phone?: string;
  desired_role: string;
}

export const registrationRequestsService = {
  /**
   * Create a new registration request
   */
  async createRequest(requestData: RegistrationRequestInput) {
    const { data, error } = await supabase
      .from('registration_requests')
      .insert({
        email: requestData.email,
        name: requestData.name,
        phone: requestData.phone || null,
        desired_role: requestData.desired_role,
        status: 'pending'
      })
      .select();
      
    if (error) {
      console.error('Error creating registration request:', error);
      throw error;
    }
    
    return data?.[0];
  },
  
  /**
   * Get all pending registration requests
   */
  async getPendingRequests() {
    const { data, error } = await supabase
      .from('registration_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching pending registration requests:', error);
      throw error;
    }
    
    return data || [];
  },
  
  /**
   * Approve a registration request
   */
  async approveRequest(requestId: string, handlerId: string) {
    const { data, error } = await supabase
      .from('registration_requests')
      .update({
        status: 'approved',
        handled_by: handlerId
      })
      .eq('id', requestId)
      .select();
      
    if (error) {
      console.error('Error approving registration request:', error);
      throw error;
    }
    
    return data?.[0];
  },
  
  /**
   * Reject a registration request
   */
  async rejectRequest(requestId: string, handlerId: string) {
    const { data, error } = await supabase
      .from('registration_requests')
      .update({
        status: 'rejected',
        handled_by: handlerId
      })
      .eq('id', requestId)
      .select();
      
    if (error) {
      console.error('Error rejecting registration request:', error);
      throw error;
    }
    
    return data?.[0];
  },
  
  /**
   * Get registration request by email
   */
  async getRequestByEmail(email: string) {
    const { data, error } = await supabase
      .from('registration_requests')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1);
      
    if (error) {
      console.error('Error fetching registration request by email:', error);
      throw error;
    }
    
    return data?.[0];
  }
}; 