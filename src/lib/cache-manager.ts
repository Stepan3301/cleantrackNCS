/**
 * Cache Manager Utility for CleanTrack
 * Provides functions to clear browser caches and reload the application
 */

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
        localStorage.removeItem(key);
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
        localStorage.removeItem(key);
      }
    });
  } catch (err) {
    console.error('Failed to clear app state cache:', err);
  }
};

// Clear Service Worker cache
export const clearServiceWorkerCache = async (): Promise<boolean> => {
  console.log('🧹 Clearing Service Worker cache...');
  try {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      // Send message to service worker to clear its cache
      navigator.serviceWorker.controller.postMessage({
        type: 'CLEAR_CACHE'
      });
      
      // Wait for confirmation (with timeout)
      const timeoutPromise = new Promise<boolean>((resolve) => {
        setTimeout(() => resolve(true), 1000);
      });
      
      const messagePromise = new Promise<boolean>((resolve) => {
        const messageHandler = (event: MessageEvent) => {
          if (event.data && event.data.type === 'CACHE_CLEARED') {
            navigator.serviceWorker.removeEventListener('message', messageHandler);
            resolve(true);
          }
        };
        navigator.serviceWorker.addEventListener('message', messageHandler);
      });
      
      // Return true if either timeout passes or we get confirmation
      return Promise.race([timeoutPromise, messagePromise]);
    }
    return true;
  } catch (err) {
    console.error('Failed to clear service worker cache:', err);
    return false;
  }
};

// Function to clear all browser cache data
export const clearAllCaches = async (): Promise<boolean> => {
  try {
    clearSupabaseCache();
    clearAppStateCache();
    await clearServiceWorkerCache();
    return true;
  } catch (err) {
    console.error('Error clearing caches:', err);
    return false;
  }
};

// Function to perform a clean reload
export const cleanReload = async (): Promise<void> => {
  // Set a flag to indicate we're doing a clean reload
  sessionStorage.setItem('cleantrack_reload', 'true');
  
  // Clear caches
  await clearAllCaches();
  
  // Force reload the page
  window.location.reload();
};

// Check if we're coming back from a clean reload
export const isAfterCleanReload = (): boolean => {
  const isCleanReload = sessionStorage.getItem('cleantrack_reload') === 'true';
  if (isCleanReload) {
    // Clear the flag
    sessionStorage.removeItem('cleantrack_reload');
  }
  return isCleanReload;
};

// Check if the application has had connectivity issues
export const hasConnectivityIssues = (): boolean => {
  try {
    const lastConnErr = localStorage.getItem('cleantrack_conn_error');
    const lastConnTime = localStorage.getItem('cleantrack_conn_time');
    
    if (!lastConnErr || !lastConnTime) return false;
    
    // If we've had a connection error in the last 5 minutes
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    return parseInt(lastConnTime, 10) > fiveMinutesAgo;
  } catch (err) {
    return false;
  }
};

// Record a connectivity issue
export const recordConnectivityIssue = (errorMessage: string): void => {
  try {
    localStorage.setItem('cleantrack_conn_error', errorMessage);
    localStorage.setItem('cleantrack_conn_time', Date.now().toString());
  } catch (err) {
    console.error('Failed to record connectivity issue:', err);
  }
};

// Clear connectivity issue record
export const clearConnectivityIssue = (): void => {
  try {
    localStorage.removeItem('cleantrack_conn_error');
    localStorage.removeItem('cleantrack_conn_time');
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