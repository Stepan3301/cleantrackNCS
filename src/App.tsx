import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/auth-context';
import { LoaderProvider } from '@/contexts/loader-context';
import { AnnouncementsProvider } from '@/contexts/announcements-context';
import ProtectedRoute, { UserRole } from '@/components/ProtectedRoute';
import ModernLayout from '@/components/ModernLayout';
import HomepageLogin from '@/pages/HomepageLogin';
import Dashboard from '@/pages/Dashboard';
import StaffHours from '@/pages/StaffHours';
import Employees from '@/pages/Employees';
import Hours from '@/pages/Hours';
import Announcements from '@/pages/Announcements';
import Reports from '@/pages/Reports';
import { ThemeProvider } from '@/contexts/theme-provider';
import RequestLeave from '@/pages/RequestLeave';
import ManageLeaveRequests from '@/pages/ManageLeaveRequests';
import SignUp from '@/pages/SignUp';
import Settings from '@/pages/Settings';
import RegistrationRequests from '@/pages/RegistrationRequests';
import Bonuses from '@/pages/Bonuses';
import Targets from '@/pages/Targets';
import WaitingApproval from '@/pages/WaitingApproval';
import ManageRoles from '@/pages/ManageRoles';

function App() {
  return (
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
            </Routes>
          </AnnouncementsProvider>
          <Toaster />
        </AuthProvider>
      </LoaderProvider>
    </ThemeProvider>
  );
}

export default App;
