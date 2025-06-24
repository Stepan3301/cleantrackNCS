import React, { ReactNode } from 'react';
import { DesktopLayout } from './DesktopLayout';
import { MobileLayout } from './MobileLayout';
import { User } from '@/contexts/auth-context';
import { useDevice } from '@/contexts/device-context';

interface AdaptiveLayoutProps {
  children: ReactNode;
  user: User;
}

export const AdaptiveLayout: React.FC<AdaptiveLayoutProps> = ({ children, user }) => {
  const { isMobile } = useDevice();

  return isMobile ? (
    <MobileLayout user={user}>{children}</MobileLayout>
  ) : (
    <DesktopLayout user={user}>{children}</DesktopLayout>
  );
}; 