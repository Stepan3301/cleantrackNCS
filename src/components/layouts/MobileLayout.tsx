import React, { ReactNode } from 'react';
import { BottomNavigation } from '../BottomNavigation';
import { User } from '@/contexts/auth-context';

interface MobileLayoutProps {
  children: ReactNode;
  user: User;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({ children, user }) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Main content with proper class name for bottom nav CSS */}
      <main className="main-content px-4 py-6">
        {children}
      </main>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}; 