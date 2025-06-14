import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { ModernAppSidebar } from './ModernAppSidebar';
import { MobileNavigation } from './MobileNavigation';

const ModernLayout = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        <main className="pb-16 px-4 pt-4">
          {children}
        </main>
        <MobileNavigation />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <ModernAppSidebar />
      <main className="flex-1 overflow-auto p-6">
        {children}
      </main>
    </div>
  );
};

export default ModernLayout; 