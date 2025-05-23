import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';

export enum UserRole {
  STAFF = 'staff',
  SUPERVISOR = 'supervisor',
  MANAGER = 'manager',
  HEAD_MANAGER = 'head_manager',
  OWNER = 'owner'
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
  const { user, isLoading } = useAuth();
  
  // If still loading auth state, show loading indicator
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  // If no user (not authenticated), redirect to login
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  // Check if user account is pending approval
  if (user.status === 'pending_approval') {
    return <Navigate to="/waiting-approval" replace />;
  }
  
  // If roles are specified, check if user has required role
  if (roles && !roles.includes(user.role as UserRole)) {
    // User doesn't have the required role, redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }
  
  // User is authenticated and has required role, render children
  return <>{children}</>;
};

export default ProtectedRoute; 