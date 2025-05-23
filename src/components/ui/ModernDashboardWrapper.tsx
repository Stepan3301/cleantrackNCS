import { useModernDashboard } from "@/lib/use-modern-dashboard";
import React from "react";

interface ModernDashboardWrapperProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Wrapper component to apply modern dashboard styling and layout to any content
 * Usage:
 * <ModernDashboardWrapper>
 *   <YourPageContent />
 * </ModernDashboardWrapper>
 */
export function ModernDashboardWrapper({ children, className = "" }: ModernDashboardWrapperProps) {
  // Apply the modern-dashboard class to body
  useModernDashboard();
  
  return (
    <div className={`dashboard-layout dashboard-container ${className}`}>
      {children}
    </div>
  );
} 