import { supabase } from '@/lib/supabase';

export const fileUploadService = {
  /**
   * Upload a profile image to storage
   * @param userId The user ID to associate the image with
   * @param file The file to upload
   * @returns The URL of the uploaded image
   */
  async uploadProfileImage(userId: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;
    
    const { error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });
    
    if (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload image');
    }
    
    // Get the public URL of the uploaded file
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);
    
    if (!data.publicUrl) {
      throw new Error('Failed to retrieve public URL');
    }
    
    return data.publicUrl;
  },
  
  /**
   * Delete a profile image from storage
   * @param avatarUrl The URL of the image to delete
   */
  async deleteProfileImage(avatarUrl: string): Promise<void> {
    // We need to extract the file path from the full URL
    const baseUrl = supabase.storage.from('avatars').getPublicUrl('').data.publicUrl;
    if (!avatarUrl.startsWith(baseUrl)) {
      throw new Error('Invalid avatar URL. Cannot determine file path for deletion.');
    }
    
    const filePath = avatarUrl.replace(baseUrl, '');
    
    if (!filePath) {
      // Nothing to delete
      return;
    }
    
    const { error } = await supabase.storage
      .from('avatars')
      .remove([filePath]);
    
    if (error) {
      console.error('Error deleting image from storage:', error);
      throw new Error('Failed to delete image');
    }
  }
}; 