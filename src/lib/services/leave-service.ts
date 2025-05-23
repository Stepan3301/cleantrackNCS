import { supabase } from '@/lib/supabase';
import { addMonths, differenceInBusinessDays, isBefore, isAfter, format, startOfMonth, endOfMonth, subMonths, compareAsc } from 'date-fns';

export interface LeaveBalance {
  id: string;
  user_id: string;
  balance: number;
  last_accrual_date: string;
  monthly_accrual_rate: number;
  created_at: string;
  updated_at: string;
}

export interface LeaveRequest {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  days_requested: number;
  leave_type: 'annual' | 'sick' | 'unpaid' | 'other';
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewer_id: string | null;
  review_notes: string | null;
  has_sufficient_balance: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateLeaveRequestInput {
  start_date: string;
  end_date: string;
  leave_type: 'annual' | 'sick' | 'unpaid' | 'other';
  reason: string;
}

export interface UpdateLeaveRequestInput {
  status: 'approved' | 'rejected';
  review_notes?: string;
}

export const leaveService = {
  /**
   * Get leave balance for a user
   */
  async getLeaveBalance(userId: string): Promise<LeaveBalance | null> {
    try {
      const { data, error } = await supabase
        .from('leave_balances')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      
      // Process monthly accruals if needed
      if (data) {
        await this.checkAndProcessAccruals(userId);
        
        // Get the latest balance after possible accrual
        const { data: updatedData, error: updatedError } = await supabase
          .from('leave_balances')
          .select('*')
          .eq('user_id', userId)
          .single();
          
        if (updatedError) throw updatedError;
        return updatedData;
      }
      
      return data;
    } catch (error) {
      console.error('Error getting leave balance:', error);
      return null;
    }
  },

  /**
   * Get leave requests for a user
   */
  async getUserLeaveRequests(userId: string): Promise<LeaveRequest[]> {
    try {
      const { data, error } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting user leave requests:', error);
      return [];
    }
  },

  /**
   * Get pending leave requests (for managers)
   */
  async getPendingLeaveRequests() {
    try {
      const { data, error } = await supabase
        .from('leave_requests')
        .select(`
          *,
          profiles:user_id (
            name,
            email,
            role
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting pending leave requests:', error);
      return [];
    }
  },

  /**
   * Create a new leave request
   */
  async createLeaveRequest(userId: string, requestData: CreateLeaveRequestInput) {
    try {
      const startDate = new Date(requestData.start_date);
      const endDate = new Date(requestData.end_date);
      
      // Validate dates
      if (isBefore(endDate, startDate)) {
        return {
          success: false,
          message: 'End date must be after start date'
        };
      }

      // Calculate business days
      const daysRequested = differenceInBusinessDays(endDate, startDate) + 1;
      
      if (daysRequested <= 0) {
        return {
          success: false,
          message: 'You must select at least one business day'
        };
      }
      
      // Check if user has sufficient balance for annual leave
      let hasSufficientBalance = true;
      
      if (requestData.leave_type === 'annual') {
        const balance = await this.getLeaveBalance(userId);
        
        if (balance && balance.balance < daysRequested) {
          hasSufficientBalance = false;
        }
      }
      
      const { data, error } = await supabase
        .from('leave_requests')
        .insert({
          user_id: userId,
          start_date: requestData.start_date,
          end_date: requestData.end_date,
          days_requested: daysRequested,
          leave_type: requestData.leave_type,
          reason: requestData.reason,
          status: 'pending',
          has_sufficient_balance: hasSufficientBalance
        })
        .select()
        .single();

      if (error) throw error;
      
      return {
        success: true,
        message: 'Leave request submitted successfully',
        data
      };
    } catch (error) {
      console.error('Error creating leave request:', error);
      return {
        success: false,
        message: 'Failed to submit leave request'
      };
    }
  },

  /**
   * Update a leave request status (approve/reject)
   */
  async updateLeaveRequestStatus(requestId: string, reviewerId: string, updateData: UpdateLeaveRequestInput) {
    try {
      // Get the leave request first
      const { data: request, error: requestError } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('id', requestId)
        .single();
        
      if (requestError) throw requestError;
      
      if (!request) {
        return {
          success: false,
          message: 'Leave request not found'
        };
      }
      
      // If approving annual leave, check if user has sufficient balance
      if (updateData.status === 'approved' && request.leave_type === 'annual') {
        // Get current balance
        const { data: balance, error: balanceError } = await supabase
          .from('leave_balances')
          .select('balance')
          .eq('user_id', request.user_id)
          .single();
          
        if (balanceError) throw balanceError;
        
        if (balance && balance.balance < request.days_requested) {
          return {
            success: false,
            message: 'User does not have sufficient leave balance'
          };
        }
        
        // If there's sufficient balance and we're approving, deduct the days
        if (updateData.status === 'approved') {
          const { error: updateError } = await supabase
            .from('leave_balances')
            .update({
              balance: balance.balance - request.days_requested,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', request.user_id);
            
          if (updateError) throw updateError;
        }
      }
      
      // Update the request status
      const { data, error } = await supabase
        .from('leave_requests')
        .update({
          status: updateData.status,
          reviewer_id: reviewerId,
          review_notes: updateData.review_notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .select()
        .single();

      if (error) throw error;
      
      const actionText = updateData.status === 'approved' ? 'approved' : 'rejected';
      
      return {
        success: true,
        message: `Leave request ${actionText} successfully`,
        data
      };
    } catch (error) {
      console.error('Error updating leave request:', error);
      return {
        success: false,
        message: 'Failed to process leave request'
      };
    }
  },

  /**
   * Check if monthly accrual should be processed and do it if needed
   */
  async checkAndProcessAccruals(userId: string) {
    try {
      // Get the user's leave balance record
      const { data: balance, error } = await supabase
        .from('leave_balances')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      if (error) {
        // If the user doesn't have a balance record yet, create one
        if (error.code === 'PGRST116') {
          const { data: newBalance, error: createError } = await supabase
            .from('leave_balances')
            .insert({
              user_id: userId,
              balance: 2.5, // Initial grant of 2.5 days
              last_accrual_date: new Date().toISOString(),
              monthly_accrual_rate: 2.5
            })
            .select()
            .single();
            
          if (createError) throw createError;
          return newBalance;
        }
        throw error;
      }
      
      // Check if it's time for the monthly accrual
      const lastAccrualDate = new Date(balance.last_accrual_date);
      const nextAccrualDate = addMonths(lastAccrualDate, 1);
      const now = new Date();
      
      // If next accrual date has passed, update the balance
      if (compareAsc(now, nextAccrualDate) >= 0) {
        const { data: updatedBalance, error: updateError } = await supabase
          .from('leave_balances')
          .update({
            balance: balance.balance + balance.monthly_accrual_rate,
            last_accrual_date: now.toISOString(),
            updated_at: now.toISOString()
          })
          .eq('user_id', userId)
          .select()
          .single();
          
        if (updateError) throw updateError;
        
        // Create an announcement for the user
        await supabase
          .from('announcements')
          .insert({
            sender_id: null, // System announcement
            recipient_id: userId,
            message: `You've received your monthly leave allowance of ${balance.monthly_accrual_rate} days.`,
            is_read: false
          });
          
        return updatedBalance;
      }
      
      return balance;
    } catch (error) {
      console.error('Error checking/processing accruals:', error);
      return null;
    }
  }
};

export default leaveService; 