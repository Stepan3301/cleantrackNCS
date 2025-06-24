import React, { ReactNode } from 'react';
import { MobileNavigation } from '../MobileNavigation';
import { User } from '@/contexts/auth-context';
import { MobileNavProvider, useMobileNav } from '@/contexts/mobile-nav-context';

interface MobileLayoutProps {
  children: ReactNode;
  user: User;
}

const MobileLayoutContent: React.FC<MobileLayoutProps> = ({ children, user }) => {
  const { isNavOpen } = useMobileNav();

  return (
    <div className={`mobile-layout ${isNavOpen ? 'nav-open' : ''}`}>
      <MobileNavigation />
      <div className="mobile-main-content">
        {/* We can add a mobile-specific header here if needed */}
        <main>{children}</main>
      </div>
    </div>
  );
};

export const MobileLayout: React.FC<MobileLayoutProps> = ({ children, user }) => {
  return (
    <MobileNavProvider>
      <MobileLayoutContent user={user}>{children}</MobileLayoutContent>
    </MobileNavProvider>
  );
}; 