import React from 'react';
import { User, useAuth } from '@/contexts/auth-context';
import { ModernAppSidebar } from '../ModernAppSidebar';

interface DesktopLayoutProps {
  children: React.ReactNode;
  user: User;
}

export const DesktopLayout: React.FC<DesktopLayoutProps> = ({ children, user }) => {
  const { logout } = useAuth();
  
  return (
    <div className="flex h-screen bg-background">
      <ModernAppSidebar user={user} logout={logout} />
      <main className="main-content flex-1 overflow-auto p-6">
        {children}
      </main>
    </div>
  );
}; 