import React, { ReactNode } from 'react';
import { MobileNavigation } from '../MobileNavigation';
import { User } from '@/contexts/auth-context';
import { MobileNavProvider } from '@/contexts/mobile-nav-context';

interface MobileLayoutProps {
  children: ReactNode;
  user: User;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({ children, user }) => {
  return (
    <MobileNavProvider>
      <div className="min-h-screen bg-background">
        <main className="main-content">{children}</main>
        <div className="mobile-navigation">
          <MobileNavigation />
        </div>
      </div>
    </MobileNavProvider>
  );
}; 