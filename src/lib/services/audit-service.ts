import { supabase } from '../supabase';

export const auditService = {
  /**
   * Log a role change event
   */
  async logRoleChange(params: {
    userId: string;
    changedByUserId: string;
    oldRole: string;
    newRole: string;
  }) {
    try {
      const { userId, changedByUserId, oldRole, newRole } = params;
      
      // Log the event in the audit_logs table
      const { error } = await supabase
        .from('audit_logs')
        .insert({
          event_type: 'role_change',
          user_id: userId,
          performed_by: changedByUserId,
          details: {
            old_role: oldRole,
            new_role: newRole,
          },
        });
      
      if (error) {
        console.error('Error logging role change:', error);
        // Don't throw - we don't want to disrupt the main operation if logging fails
      }
    } catch (err) {
      console.error('Error in auditService.logRoleChange:', err);
      // Don't throw - we don't want to disrupt the main operation if logging fails
    }
  },
  
  /**
   * Get role change logs for a specific user
   */
  async getRoleChangeLogs(userId: string) {
    const { data, error } = await supabase
      .from('audit_logs')
      .select(`
        id,
        event_type,
        user_id,
        performed_by,
        details,
        created_at,
        profiles:performed_by (name)
      `)
      .eq('event_type', 'role_change')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching role change logs:', error);
      throw error;
    }
    
    return data || [];
  },
  
  /**
   * Get recent role changes across the system
   */
  async getRecentRoleChanges(limit = 50) {
    const { data, error } = await supabase
      .from('audit_logs')
      .select(`
        id,
        event_type,
        user_id,
        performed_by,
        details,
        created_at,
        users:user_id (name),
        performers:performed_by (name)
      `)
      .eq('event_type', 'role_change')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching recent role changes:', error);
      throw error;
    }
    
    return data || [];
  }
}; 