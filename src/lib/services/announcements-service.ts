import { supabase } from '../supabase';
import { Announcement } from '@/types/database.types';

export interface AnnouncementInput {
  title: string;
  content: string;
  announcement_type: 'general' | 'direct';
  recipients?: string[];  // Required for direct announcements
}

export const announcementsService = {
  /**
   * Get all announcements
   */
  async getAllAnnouncements() {
    const { data, error } = await supabase
      .from('announcements')
      .select('*, profiles!announcements_author_id_fkey(name)')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching announcements:', error);
      throw error;
    }
    
    return data || [];
  },
  
  /**
   * Get an announcement by ID
   */
  async getAnnouncementById(id: string) {
    const { data, error } = await supabase
      .from('announcements')
      .select('*, profiles!announcements_author_id_fkey(name)')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error('Error fetching announcement:', error);
      throw error;
    }
    
    return data;
  },
  
  /**
   * Create a new announcement
   */
  async createAnnouncement(announcementData: AnnouncementInput) {
    console.log('🔍 announcements-service: Starting createAnnouncement', announcementData);
    
    try {
      // Get the current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      console.log('🔍 announcements-service: Auth user data:', userData);
      
      if (userError) {
        console.error('❌ announcements-service: Auth error getting user:', userError);
        throw userError;
      }
      
      if (!userData.user) {
        console.error("❌ announcements-service: Authentication error: No user found");
        throw new Error('User not authenticated');
      }
      
      // For direct announcements, recipients is required
      if (announcementData.announcement_type === 'direct' && (!announcementData.recipients || announcementData.recipients.length === 0)) {
        console.error("❌ announcements-service: Validation error: No recipients for direct announcement");
        throw new Error('Recipients are required for direct announcements');
      }
      
      // Get user profile to verify permission
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userData.user.id)
        .single();
        
      if (profileError) {
        console.error('❌ announcements-service: Error fetching user profile:', profileError);
        throw new Error(`Permission check failed: ${profileError.message}`);
      }
      
      console.log('🔍 announcements-service: User role:', profileData?.role);
      
      // Check if user has permission to create announcements
      if (!profileData || (profileData.role !== 'head_manager' && profileData.role !== 'owner')) {
        console.error('❌ announcements-service: Permission denied - User role:', profileData?.role);
        throw new Error('You do not have permission to create announcements');
      }
      
      const insertData = {
        title: announcementData.title,
        content: announcementData.content,
        announcement_type: announcementData.announcement_type,
        recipients: announcementData.announcement_type === 'direct' 
          ? announcementData.recipients.map(id => id.toString()) // Ensure all IDs are strings
          : null,
        author_id: userData.user.id
      };
      
      console.log('🔍 announcements-service: Inserting announcement with data:', insertData);
      
      // Execute the database insert operation
      const { data, error } = await supabase
        .from('announcements')
        .insert(insertData)
        .select();
        
      if (error) {
        console.error('❌ announcements-service: Error creating announcement:', error);
        console.error('❌ Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        // More specific error messaging based on error codes
        if (error.code === 'PGRST301') {
          throw new Error('Permission denied: RLS policy violation. You may not have permission to create announcements.');
        } else if (error.code === '23505') { 
          throw new Error('Duplicate announcement. Please try with a different title.');
        } else if (error.code === '42P01') {
          throw new Error('The announcements table does not exist. Please contact the administrator.');
        } else if (error.code === '42501') {
          throw new Error('Database permission denied. Please check your user role.');
        } else {
          throw error;
        }
      }
      
      if (!data || data.length === 0) {
        console.error('❌ announcements-service: No data returned from insert operation');
        throw new Error('No data returned from insert operation');
      }
      
      console.log('✅ announcements-service: Announcement created successfully:', data[0]);
      return data[0];
    } catch (err) {
      console.error('❌ announcements-service: Exception during insert:', err);
      throw err;
    }
  },
  
  /**
   * Update an announcement
   */
  async updateAnnouncement(id: string, updates: Partial<AnnouncementInput>) {
    // If changing to direct type, ensure recipients are provided
    if (updates.announcement_type === 'direct' && (!updates.recipients || updates.recipients.length === 0)) {
      throw new Error('Recipients are required for direct announcements');
    }
    
    // If changing to general type, remove recipients
    if (updates.announcement_type === 'general') {
      updates.recipients = undefined;  // Will be set to NULL in the database
    }
    
    const { data, error } = await supabase
      .from('announcements')
      .update({
        ...updates
      })
      .eq('id', id)
      .select();
      
    if (error) {
      console.error('Error updating announcement:', error);
      throw error;
    }
    
    return data?.[0];
  },
  
  /**
   * Delete an announcement
   */
  async deleteAnnouncement(id: string) {
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting announcement:', error);
      throw error;
    }
    
    return true;
  },
  
  /**
   * Get general announcements
   */
  async getGeneralAnnouncements() {
    console.log('🔍 announcementsService: Fetching general announcements');
    const { data, error } = await supabase
      .from('announcements')
      .select('*, profiles!announcements_author_id_fkey(name)')
      .eq('announcement_type', 'general')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('❌ announcementsService: Error fetching general announcements:', error);
      throw error;
    }
    
    console.log('✅ announcementsService: Fetched general announcements:', data?.length || 0, data);
    return data || [];
  },
  
  /**
   * Get announcements for a specific user
   * This includes all general announcements and direct ones where the user is a recipient
   */
  async getAnnouncementsForUser(userId: string) {
    console.log('🔍 announcementsService: Getting announcements for user:', userId);
    
    // First get general announcements
    const { data: generalAnnouncements, error: generalError } = await supabase
      .from('announcements')
      .select('*, profiles!announcements_author_id_fkey(name)')
      .eq('announcement_type', 'general')
      .order('created_at', { ascending: false });
      
    if (generalError) {
      console.error('❌ announcementsService: Error fetching general announcements:', generalError);
      throw generalError;
    }
    
    console.log('✅ announcementsService: Successfully fetched general announcements:', generalAnnouncements?.length || 0);
    
    // Then get direct announcements for this user (using string comparison for recipients)
    try {
      const { data: directAnnouncements, error: directError } = await supabase
        .from('announcements')
        .select('*, profiles!announcements_author_id_fkey(name)')
        .eq('announcement_type', 'direct')
        .contains('recipients', [userId.toString()])
        .order('created_at', { ascending: false });
        
      if (directError) {
        console.error('❌ announcementsService: Error fetching direct announcements:', directError);
        throw directError;
      }
      
      console.log('✅ announcementsService: Successfully fetched direct announcements:', directAnnouncements?.length || 0);
      
      // Combine the results
      return [...(generalAnnouncements || []), ...(directAnnouncements || [])];
    } catch (err) {
      console.error('Failed to get direct announcements:', err);
      // If direct announcements fail, still return general announcements
      return generalAnnouncements || [];
    }
  },
  
  /**
   * Get announcements by author
   */
  async getAnnouncementsByAuthor(authorId: string) {
    const { data, error } = await supabase
      .from('announcements')
      .select('*, profiles!announcements_author_id_fkey(name)')
      .eq('author_id', authorId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error(`Error fetching announcements by author ${authorId}:`, error);
      throw error;
    }
    
    return data || [];
  },
  
  /**
   * Get recent announcements (from the last n days)
   */
  async getRecentAnnouncements(days: number = 30) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    
    const { data, error } = await supabase
      .from('announcements')
      .select('*, profiles!announcements_author_id_fkey(name)')
      .gte('created_at', date.toISOString())
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching recent announcements:', error);
      throw error;
    }
    
    return data || [];
  }
};