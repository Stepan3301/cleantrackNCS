import { useEffect } from 'react';
import "../styles/modern-dashboard.css";

/**
 * Hook to apply modern dashboard styling to a page
 * Adds the modern-dashboard class to the body on mount
 * Removes it on unmount
 */
export function useModernDashboard() {
  useEffect(() => {
    // Add the modern-dashboard class to the body
    document.body.classList.add('modern-dashboard');
    
    // Remove the class when component unmounts
    return () => {
      document.body.classList.remove('modern-dashboard');
    }
  }, []);
}

/**
 * Higher order component to wrap any component with modern dashboard styling
 */
export function withModernDashboard<T>(Component: React.ComponentType<T>) {
  return function WithModernDashboardComponent(props: T) {
    useModernDashboard();
    
    return <Component {...props} />;
  };
}

/**
 * Layout component to wrap page content with modern dashboard styling
 */
export function ModernDashboardLayout({ children }: { children: React.ReactNode }) {
  useModernDashboard();
  
  return (
    <div className="dashboard-layout dashboard-container">
      {children}
    </div>
  );
} 