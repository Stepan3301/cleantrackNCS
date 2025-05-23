import { supabase } from '@/lib/supabase';

export const fileUploadService = {
  /**
   * Upload a profile image to storage
   * @param userId The user ID to associate the image with
   * @param file The file to upload
   * @returns The URL of the uploaded image
   */
  async uploadProfileImage(userId: string, file: File): Promise<string> {
    // Create a unique file name based on user ID and timestamp
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}_${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;
    
    // Upload the file to Supabase Storage
    const { data, error } = await supabase
      .storage
      .from('profile-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload image');
    }
    
    // Get the public URL
    const { data: urlData } = supabase
      .storage
      .from('profile-images')
      .getPublicUrl(filePath);
    
    return urlData.publicUrl;
  },
  
  /**
   * Delete a profile image from storage
   * @param imageUrl The URL of the image to delete
   */
  async deleteProfileImage(imageUrl: string): Promise<void> {
    // Extract the path from the URL
    const baseUrl = supabase.storage.from('profile-images').getPublicUrl('').data.publicUrl;
    let filePath = imageUrl.replace(baseUrl, '');
    
    // Remove leading slash if present
    if (filePath.startsWith('/')) {
      filePath = filePath.substring(1);
    }
    
    // Delete the file
    const { error } = await supabase
      .storage
      .from('profile-images')
      .remove([filePath]);
    
    if (error) {
      console.error('Error deleting file:', error);
      throw new Error('Failed to delete image');
    }
  }
}; 