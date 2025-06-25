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
      {/* Основной контент */}
      <main className="main-content">
        {children}
      </main>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}; 