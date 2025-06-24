import React, { Suspense, lazy, useEffect, useState, useRef } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { LoaderProvider } from '@/contexts/loader-context';
import { AnnouncementsProvider } from '@/contexts/announcements-context';
import ProtectedRoute, { UserRole } from '@/components/ProtectedRoute';
import { LoadingFallback } from '@/components/LoadingFallback';
import { hasConnectivityIssues, isAfterCleanReload, clearConnectivityIssue } from '@/lib/cache-manager';
import { supabase } from '@/lib/supabase';
import { AdaptiveLayout } from './components/layouts/AdaptiveLayout';
import { DeviceProvider } from './contexts/device-context';

// Application version for diagnostic purposes
const APP_VERSION = '1.0.1'; // Increment this when making significant changes

// Log first render time for performance diagnostics
console.log(`[App] Initializing CleanTrack app v${APP_VERSION} at ${new Date().toISOString()}`);
const startTime = performance.now();

// Lazy load pages to improve initial load time
const HomepageLogin = lazy(() => import('@/pages/HomepageLogin'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const StaffHours = lazy(() => import('@/pages/StaffHours'));
const Employees = lazy(() => import('@/pages/Employees'));
const Hours = lazy(() => import('@/pages/Hours'));
const Announcements = lazy(() => import('@/pages/Announcements'));
const Reports = lazy(() => import('@/pages/Reports'));
const RequestLeave = lazy(() => import('@/pages/RequestLeave'));
const ManageLeaveRequests = lazy(() => import('@/pages/ManageLeaveRequests'));
const SignUp = lazy(() => import('@/pages/SignUp'));
const Settings = lazy(() => import('@/pages/Settings'));
const RegistrationRequests = lazy(() => import('@/pages/RegistrationRequests'));
const Bonuses = lazy(() => import('@/pages/Bonuses'));
const Targets = lazy(() => import('@/pages/Targets'));
const WaitingApproval = lazy(() => import('@/pages/WaitingApproval'));
const ManageRoles = lazy(() => import('@/pages/ManageRoles'));

// Import ThemeProvider
import { ThemeProvider } from '@/contexts/theme-provider';

const AppRoutes = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<HomepageLogin />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/waiting-approval" element={<WaitingApproval />} />
        {/* Redirect any other path to login */}
        <Route path="*" element={<HomepageLogin />} />
      </Routes>
    )
  }

  return (
    <AdaptiveLayout user={user}>
      <Routes>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hours"
          element={
            <ProtectedRoute>
              <Hours />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff-hours"
          element={
            <ProtectedRoute roles={[UserRole.MANAGER, UserRole.HEAD_MANAGER, UserRole.OWNER]}>
              <StaffHours />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employees"
          element={
            <ProtectedRoute roles={[UserRole.SUPERVISOR, UserRole.MANAGER, UserRole.HEAD_MANAGER, UserRole.OWNER]}>
              <Employees />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bonuses"
          element={
            <ProtectedRoute roles={[UserRole.MANAGER, UserRole.HEAD_MANAGER, UserRole.OWNER]}>
              <Bonuses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/targets"
          element={
            <ProtectedRoute roles={[UserRole.MANAGER, UserRole.HEAD_MANAGER, UserRole.OWNER]}>
              <Targets />
            </ProtectedRoute>
          }
        />
        <Route
          path="/announcements"
          element={
            <ProtectedRoute>
              <Announcements />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/request-leave"
          element={
            <ProtectedRoute roles={[UserRole.STAFF, UserRole.SUPERVISOR]}>
              <RequestLeave />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage-leave"
          element={
            <ProtectedRoute roles={[UserRole.MANAGER, UserRole.HEAD_MANAGER, UserRole.OWNER]}>
              <ManageLeaveRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/registration-requests"
          element={
            <ProtectedRoute roles={[UserRole.MANAGER, UserRole.HEAD_MANAGER, UserRole.OWNER]}>
              <RegistrationRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage-roles"
          element={
            <ProtectedRoute roles={[UserRole.OWNER, UserRole.HEAD_MANAGER]}>
              <ManageRoles />
            </ProtectedRoute>
          }
        />
        {/* Fallback route */}
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </AdaptiveLayout>
  );
}

function App() {
  console.log(`[App] Rendering App component at ${new Date().toISOString()}`);
  const [isHealthy, setIsHealthy] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [loadTimeoutExpired, setLoadTimeoutExpired] = useState<boolean>(false);
  const intervalIdRef = useRef<number | undefined>();
  const initTimeoutRef = useRef<number | undefined>(); 
  
  // Add safety timeout to break out of loading state if initialization takes too long
  useEffect(() => {
    console.log('[App] Setting up safety timeout for app initialization');
    
    // Clear any existing timeout first
    if (initTimeoutRef.current) {
      window.clearTimeout(initTimeoutRef.current);
    }
    
    // Set a timeout to break out of loading state if initialization takes too long
    initTimeoutRef.current = window.setTimeout(() => {
      console.log('[App] Initialization safety timeout triggered after 10 seconds');
      setLoadTimeoutExpired(true);
      setIsInitialized(true); // Force initialization to proceed even if failed
    }, 10000); // 10 seconds timeout
    
    return () => {
      if (initTimeoutRef.current) {
        window.clearTimeout(initTimeoutRef.current);
      }
    };
  }, []);
  
  // Check Supabase connectivity
  useEffect(() => {
    console.log('[App] Running connectivity check effect');
    let isMounted = true;
    
    const checkConnectivity = async () => {
      // Skip if app has already initialized to prevent duplicate checks
      if (isInitialized && !isMounted) return;
      
      console.log('[App] Performing connectivity check');
      try {
        // Simple connectivity check
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[App] Supabase connectivity check failed:', error);
          if (isMounted) {
            setIsHealthy(false);
            // We've confirmed there is an error, so we can set initialized
            setIsInitialized(true);
          }
        } else {
          console.log('[App] Connectivity check successful');
          // Connection is good
          if (isMounted) {
            setIsHealthy(true);
            // Clear any stored connectivity issues
            clearConnectivityIssue();
            // Mark as initialized
            setIsInitialized(true);
          }
        }
      } catch (err) {
        console.error('[App] Unexpected error during connectivity check:', err);
        if (isMounted) {
          setIsHealthy(false);
          // Even though there's an error, mark as initialized so user can proceed
          setIsInitialized(true);
        }
      }
    };
    
    // Check immediately on load
    checkConnectivity();
    
    // Set up an interval to check periodically - use window.setInterval for proper typing
    // Store the interval ID in the ref to safely clear it later
    intervalIdRef.current = window.setInterval(checkConnectivity, 30000); // every 30 seconds
    
    // Log performance metrics
    const loadTime = performance.now() - startTime;
    console.log(`[App] Initial App render completed in ${loadTime.toFixed(2)}ms`);
    
    return () => {
      console.log('[App] Cleaning up connectivity check effect');
      isMounted = false;
      if (intervalIdRef.current) {
        window.clearInterval(intervalIdRef.current);
        intervalIdRef.current = undefined;
      }
    };
  }, []);
  
  // Always proceed with rendering if timeout expires, regardless of initialization
  if (loadTimeoutExpired && !isInitialized) {
    console.log('[App] Load timeout expired, forcing app to proceed');
    return (
      <LoadingFallback 
        message="App is taking longer than expected to initialize. Please try refreshing the page."
        retryEnabled={true}
        troubleshootEnabled={true}
      />
    );
  }
  
  // Show loading/error state
  if (!isInitialized) {
    console.log('[App] App not yet initialized, showing loading screen');
    return (
      <LoadingFallback 
        message="Initializing application..."
        retryEnabled={false}
        troubleshootEnabled={false}
      />
    );
  }
  
  // Show connectivity error
  if (!isHealthy || hasConnectivityIssues()) {
    console.log('[App] App has connectivity issues, showing error screen');
    return (
      <LoadingFallback 
        message="Unable to connect to the server"
        retryEnabled={true}
        troubleshootEnabled={true}
      />
    );
  }
  
  // Show that we're recovering from issues
  if (isAfterCleanReload()) {
    console.log('[App] App recovering from clean reload');
    return (
      <LoadingFallback 
        message="Reinitialized successfully, loading application..."
        retryEnabled={false}
        troubleshootEnabled={false}
      />
    );
  }

  console.log('[App] Rendering main application content');
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ThemeProvider defaultTheme="light" storageKey="cleantrack-theme">
        <LoaderProvider>
          <AuthProvider>
            <DeviceProvider>
              <AnnouncementsProvider>
                <AppRoutes />
                <Toaster />
              </AnnouncementsProvider>
            </DeviceProvider>
          </AuthProvider>
        </LoaderProvider>
      </ThemeProvider>
    </Suspense>
  );
}

export default App;
