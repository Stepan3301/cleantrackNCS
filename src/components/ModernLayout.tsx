import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ModernAppSidebar } from './ModernAppSidebar';
import { MobileNavigation } from './MobileNavigation';
import { setupSidebarNavigation } from '@/lib/sidebar-utils';
import { initializeModernButtons } from '@/lib/button-utils';
import { useLoader } from '@/contexts/loader-context';
import '../styles/modern-buttons.css';
import '../styles/mobile-responsive.css';

interface LayoutProps {
  children: React.ReactNode;
}

const ModernLayout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const { showLoader, hideLoader } = useLoader();
  const [isFirstRender, setIsFirstRender] = useState(true);
  
  // Check if mobile view
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Listen for resize events
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);
  
  // Handle route changes
  useEffect(() => {
    // Don't show loader on the initial page load as auth context already handles that
    if (isFirstRender) {
      setIsFirstRender(false);
      return;
    }
    
    // Show loader when route changes
    showLoader();
    
    // Hide loader after a short delay to ensure content has time to load
    const timer = setTimeout(() => {
      hideLoader();
    }, 500); // 500ms delay, adjust as needed
    
    return () => {
      clearTimeout(timer);
    };
  }, [location.pathname, showLoader, hideLoader, isFirstRender]);
  
  useEffect(() => {
    // Initialize sidebar navigation
    setupSidebarNavigation();
    
    // Initialize modern buttons
    initializeModernButtons();
    
    // Listen for sidebar collapsed state changes
    const handleResize = () => {
      const sidebar = document.querySelector('.sidebar-nav');
      if (sidebar?.classList.contains('collapsed')) {
        setIsSidebarCollapsed(true);
      } else {
        setIsSidebarCollapsed(false);
      }
    };
    
    // Initial check
    handleResize();
    
    // Set up listener for media query changes
    const mediaQuery = window.matchMedia('(max-width: 800px)');
    mediaQuery.addEventListener('change', handleResize);
    
    // Create a mutation observer to watch for class changes on the sidebar
    const observer = new MutationObserver(handleResize);
    const sidebar = document.querySelector('.sidebar-nav');
    if (sidebar) {
      observer.observe(sidebar, { attributes: true, attributeFilter: ['class'] });
    }
    
    // Re-apply button styles on dynamic content changes
    const contentObserver = new MutationObserver(() => {
      initializeModernButtons();
    });
    
    const mainContent = document.querySelector('main');
    if (mainContent) {
      contentObserver.observe(mainContent, { 
        childList: true, 
        subtree: true 
      });
    }
    
    // Hide loader when layout is fully mounted
    setTimeout(() => {
      hideLoader();
    }, 300);
    
    return () => {
      mediaQuery.removeEventListener('change', handleResize);
      observer.disconnect();
      contentObserver.disconnect();
    };
  }, [hideLoader]);
  
  return (
    <div className="flex h-screen">
      {/* Desktop Sidebar */}
      <ModernAppSidebar />
      
      {/* Mobile Navigation */}
      <MobileNavigation />
      
      {/* Main content */}
      <div 
        className="flex-1 transition-all duration-300 flex flex-col overflow-y-auto"
        style={{ 
          marginLeft: isMobile ? '0' : (isSidebarCollapsed ? '64px' : '220px')
        }}
      >
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default ModernLayout; 