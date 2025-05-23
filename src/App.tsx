import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/auth-context';
import { LoaderProvider } from '@/contexts/loader-context';
import { AnnouncementsProvider } from '@/contexts/announcements-context';
import ProtectedRoute, { UserRole } from '@/components/ProtectedRoute';
import ModernLayout from '@/components/ModernLayout';
import { LoadingFallback } from '@/components/LoadingFallback';
import { hasConnectivityIssues, isAfterCleanReload, clearConnectivityIssue } from '@/lib/cache-manager';
import { supabase } from '@/lib/supabase';

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

function App() {
  const [isHealthy, setIsHealthy] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  
  // Check Supabase connectivity
  useEffect(() => {
    let isMounted = true;
    
    const checkConnectivity = async () => {
      try {
        // Simple connectivity check
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Supabase connectivity check failed:', error);
          if (isMounted) setIsHealthy(false);
        } else {
          // Connection is good
          if (isMounted) {
            setIsHealthy(true);
            // Clear any stored connectivity issues
            clearConnectivityIssue();
          }
        }
      } catch (err) {
        console.error('Unexpected error during connectivity check:', err);
        if (isMounted) setIsHealthy(false);
      } finally {
        if (isMounted) setIsInitialized(true);
      }
    };
    
    // Check immediately on load
    checkConnectivity();
    
    // Set up an interval to check periodically
    const intervalId = setInterval(checkConnectivity, 30000); // every 30 seconds
    
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);
  
  // Show loading/error state
  if (!isInitialized) {
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
    return (
      <LoadingFallback 
        message="Reinitialized successfully, loading application..."
        retryEnabled={false}
        troubleshootEnabled={false}
      />
    );
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <ThemeProvider defaultTheme="light" storageKey="cleantrack-theme">
        <LoaderProvider>
          <AuthProvider>
            <AnnouncementsProvider>
              <Routes>
                <Route path="/" element={<HomepageLogin />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/waiting-approval" element={<WaitingApproval />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <ModernLayout>
                        <Dashboard />
                      </ModernLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/hours"
                  element={
                    <ProtectedRoute>
                      <ModernLayout>
                        <Hours />
                      </ModernLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/staff-hours"
                  element={
                    <ProtectedRoute roles={[UserRole.MANAGER, UserRole.HEAD_MANAGER, UserRole.OWNER]}>
                      <ModernLayout>
                        <StaffHours />
                      </ModernLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/employees"
                  element={
                    <ProtectedRoute roles={[UserRole.SUPERVISOR, UserRole.MANAGER, UserRole.HEAD_MANAGER, UserRole.OWNER]}>
                      <ModernLayout>
                        <Employees />
                      </ModernLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/bonuses"
                  element={
                    <ProtectedRoute roles={[UserRole.MANAGER, UserRole.HEAD_MANAGER, UserRole.OWNER]}>
                      <ModernLayout>
                        <Bonuses />
                      </ModernLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/targets"
                  element={
                    <ProtectedRoute roles={[UserRole.MANAGER, UserRole.HEAD_MANAGER, UserRole.OWNER]}>
                      <ModernLayout>
                        <Targets />
                      </ModernLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/announcements"
                  element={
                    <ProtectedRoute roles={[UserRole.HEAD_MANAGER, UserRole.OWNER]}>
                      <ModernLayout>
                        <Announcements />
                      </ModernLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/manage-roles"
                  element={
                    <ProtectedRoute roles={[UserRole.HEAD_MANAGER, UserRole.OWNER]}>
                      <ModernLayout>
                        <ManageRoles />
                      </ModernLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/reports"
                  element={
                    <ProtectedRoute roles={[UserRole.MANAGER, UserRole.HEAD_MANAGER, UserRole.OWNER]}>
                      <ModernLayout>
                        <Reports />
                      </ModernLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/leave/request"
                  element={
                    <ProtectedRoute>
                      <ModernLayout>
                        <RequestLeave />
                      </ModernLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/leave/manage"
                  element={
                    <ProtectedRoute roles={[UserRole.SUPERVISOR, UserRole.MANAGER, UserRole.HEAD_MANAGER, UserRole.OWNER]}>
                      <ModernLayout>
                        <ManageLeaveRequests />
                      </ModernLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/registration-requests"
                  element={
                    <ProtectedRoute roles={[UserRole.HEAD_MANAGER, UserRole.OWNER]}>
                      <ModernLayout>
                        <RegistrationRequests />
                      </ModernLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <ModernLayout>
                        <Settings />
                      </ModernLayout>
                    </ProtectedRoute>
                  }
                />
                {/* 404 catch-all route */}
                <Route path="*" element={
                  <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-cyan-50 to-blue-100">
                    <h1 className="text-3xl font-bold text-primary mb-4">Page Not Found</h1>
                    <p className="text-gray-600 mb-8">The page you are looking for doesn't exist or has been moved.</p>
                    <a href="/" className="px-6 py-2 bg-primary text-white rounded-lg shadow hover:bg-primary-dark transition-colors">
                      Return to Homepage
                    </a>
                  </div>
                } />
              </Routes>
            </AnnouncementsProvider>
            <Toaster />
          </AuthProvider>
        </LoaderProvider>
      </ThemeProvider>
    </Suspense>
  );
}

// We need to import this after the App definition due to circular dependency
import { ThemeProvider } from '@/contexts/theme-provider';

export default App;
