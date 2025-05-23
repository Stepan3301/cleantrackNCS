/**
 * Cache Manager Utility for CleanTrack
 * Provides functions to clear browser caches and reload the application
 */

// Helper for safe localStorage access
const safeLocalStorage = {
  getItem(key: string, defaultValue: any = null): any {
    try {
      const value = localStorage.getItem(key);
      return value !== null ? value : defaultValue;
    } catch (err) {
      console.error(`Error getting ${key} from localStorage:`, err);
      return defaultValue;
    }
  },
  
  setItem(key: string, value: string): boolean {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (err) {
      console.error(`Error setting ${key} in localStorage:`, err);
      return false;
    }
  },
  
  removeItem(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (err) {
      console.error(`Error removing ${key} from localStorage:`, err);
      return false;
    }
  }
};

// Clear all Supabase auth-related data from localStorage
export const clearSupabaseCache = (): void => {
  console.log('🧹 Clearing Supabase cache data...');
  try {
    // Find and clear only Supabase-related items
    Object.keys(localStorage).forEach(key => {
      if (
        key.startsWith('sb-') || 
        key.startsWith('supabase.') || 
        key === 'supabase_session_timestamp'
      ) {
        safeLocalStorage.removeItem(key);
      }
    });
  } catch (err) {
    console.error('Failed to clear Supabase cache:', err);
  }
};

// Clear application state data
export const clearAppStateCache = (): void => {
  console.log('🧹 Clearing app state cache...');
  try {
    // Find and clear only app-specific items
    Object.keys(localStorage).forEach(key => {
      if (
        key.startsWith('cleantrack-') || 
        key.startsWith('ct-') ||
        key === 'cleantrack-theme'
      ) {
        safeLocalStorage.removeItem(key);
      }
    });
  } catch (err) {
    console.error('Failed to clear app state cache:', err);
  }
};

// Clear browser cache using the window.clearAppCache helper if available
export const clearBrowserCache = async (): Promise<boolean> => {
  console.log('🧹 Clearing browser cache...');
  try {
    if (window.clearAppCache) {
      return window.clearAppCache();
    }
    
    // Fallback if the helper isn't available
    if ('caches' in window) {
      const keys = await window.caches.keys();
      await Promise.all(keys.map(key => window.caches.delete(key)));
      return true;
    }
    
    return false;
  } catch (err) {
    console.error('Failed to clear browser cache:', err);
    return false;
  }
};

// Function to clear all browser cache data
export const clearAllCaches = async (): Promise<boolean> => {
  try {
    clearSupabaseCache();
    clearAppStateCache();
    await clearBrowserCache();
    return true;
  } catch (err) {
    console.error('Error clearing caches:', err);
    return false;
  }
};

// Function to perform a clean reload
export const cleanReload = async (): Promise<void> => {
  // Set a flag to indicate we're doing a clean reload
  try {
    sessionStorage.setItem('cleantrack_reload', 'true');
  } catch (err) {
    console.error('Error setting reload flag in sessionStorage:', err);
  }
  
  // Clear caches
  await clearAllCaches();
  
  // Force reload the page
  window.location.reload();
};

// Check if we're coming back from a clean reload
export const isAfterCleanReload = (): boolean => {
  try {
    const isCleanReload = sessionStorage.getItem('cleantrack_reload') === 'true';
    if (isCleanReload) {
      // Clear the flag
      sessionStorage.removeItem('cleantrack_reload');
    }
    return isCleanReload;
  } catch (err) {
    console.error('Error checking clean reload status:', err);
    return false;
  }
};

// Check if the application has had connectivity issues
export const hasConnectivityIssues = (): boolean => {
  try {
    const lastConnErr = safeLocalStorage.getItem('cleantrack_conn_error');
    const lastConnTime = safeLocalStorage.getItem('cleantrack_conn_time');
    
    if (!lastConnErr || !lastConnTime) return false;
    
    // If we've had a connection error in the last 5 minutes
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    return parseInt(lastConnTime, 10) > fiveMinutesAgo;
  } catch (err) {
    console.error('Error checking connectivity issues:', err);
    return false;
  }
};

// Record a connectivity issue
export const recordConnectivityIssue = (errorMessage: string): void => {
  try {
    safeLocalStorage.setItem('cleantrack_conn_error', errorMessage);
    safeLocalStorage.setItem('cleantrack_conn_time', Date.now().toString());
  } catch (err) {
    console.error('Failed to record connectivity issue:', err);
  }
};

// Clear connectivity issue record
export const clearConnectivityIssue = (): void => {
  try {
    safeLocalStorage.removeItem('cleantrack_conn_error');
    safeLocalStorage.removeItem('cleantrack_conn_time');
  } catch (err) {
    console.error('Failed to clear connectivity issue:', err);
  }
};

// Export a convenience helper to troubleshoot app loading issues
export const troubleshootLoading = async (): Promise<void> => {
  console.log('🔍 Troubleshooting app loading issues...');
  await clearAllCaches();
  cleanReload();
}; 