import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { announcementsService } from '@/lib/services/announcements-service';
import { useAuth } from './auth-context';

// Define the shape of an announcement
export interface Announcement {
  id: string;
  title: string;
  content: string;
  announcement_type: 'general' | 'direct';
  recipients?: string[];
  author_id: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    name: string;
  };
}

// Define the context interface
interface AnnouncementsContextType {
  generalAnnouncements: Announcement[];
  userAnnouncements: Announcement[];
  isLoading: boolean;
  error: string | null;
  refreshAnnouncements: () => void;
  createAnnouncement: (data: any) => Promise<Announcement>;
}

// Create the context with a default value
const AnnouncementsContext = createContext<AnnouncementsContextType>({
  generalAnnouncements: [],
  userAnnouncements: [],
  isLoading: false,
  error: null,
  refreshAnnouncements: () => {},
  createAnnouncement: async () => {
    console.error('createAnnouncement called before provider was initialized');
    return {} as Announcement;
  },
});

// Export a hook to use the announcements context
export const useAnnouncements = () => useContext(AnnouncementsContext);

// Create a provider component
export const AnnouncementsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [generalAnnouncements, setGeneralAnnouncements] = useState<Announcement[]>([]);
  const [userAnnouncements, setUserAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Function to refresh announcements
  const refreshAnnouncements = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);

      console.log('Refreshing announcements for user:', user.id, user.role);

      if (user.role === 'head_manager' || user.role === 'owner') {
        // Admins get all announcements
        const allData = await announcementsService.getAllAnnouncements();
        console.log('Fetched all announcements:', allData.length);
        setGeneralAnnouncements(allData);
      } else {
        // Other users get general announcements
        const generalData = await announcementsService.getGeneralAnnouncements();
        console.log('Fetched general announcements:', generalData.length);
        setGeneralAnnouncements(generalData);
        
        // And their direct announcements
        const userData = await announcementsService.getAnnouncementsForUser(user.id);
        console.log('Fetched user-specific announcements:', userData.length);
        setUserAnnouncements(userData);
      }
    } catch (err) {
      console.error('Error refreshing announcements:', err);
      setError('Failed to load announcements. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Create a new announcement and refresh
  const createAnnouncement = async (data: any): Promise<Announcement> => {
    try {
      console.log('Creating announcement with data:', data);
      const result = await announcementsService.createAnnouncement(data);
      console.log('Announcement created successfully:', result);
      
      // After creating, refresh the list
      await refreshAnnouncements();
      return result;
    } catch (err) {
      console.error('Error creating announcement:', err);
      throw err;
    }
  };

  // Initial load
  useEffect(() => {
    if (user) {
      console.log('User authenticated, loading announcements');
      refreshAnnouncements();
    }
  }, [refreshAnnouncements, user]);

  // Create the context value object
  const contextValue: AnnouncementsContextType = {
    generalAnnouncements,
    userAnnouncements,
    isLoading,
    error,
    refreshAnnouncements,
    createAnnouncement,
  };

  return (
    <AnnouncementsContext.Provider value={contextValue}>
      {children}
    </AnnouncementsContext.Provider>
  );
}; 