import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { showLoader, hideLoader, initPageLoader } from '@/components/PageLoader';

interface LoaderContextType {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  showLoader: () => void;
  hideLoader: () => void;
}

const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

interface LoaderProviderProps {
  children: ReactNode;
}

export const LoaderProvider: React.FC<LoaderProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initialize loader on mount
    initPageLoader();
    
    // Add event listeners for navigation
    const handleStart = () => setIsLoading(true);
    const handleComplete = () => setIsLoading(false);
    
    // Cleanup on unmount
    return () => {
      // If needed, remove any listeners
    };
  }, []);

  useEffect(() => {
    if (isLoading) {
      showLoader();
    } else {
      hideLoader();
    }
  }, [isLoading]);

  const setLoading = (loading: boolean) => {
    setIsLoading(loading);
  };

  const value = {
    isLoading,
    setLoading,
    showLoader: () => {
      showLoader();
      setIsLoading(true);
    },
    hideLoader: () => {
      hideLoader();
      setIsLoading(false);
    }
  };

  return <LoaderContext.Provider value={value}>{children}</LoaderContext.Provider>;
};

export const useLoader = (): LoaderContextType => {
  const context = useContext(LoaderContext);
  if (context === undefined) {
    throw new Error('useLoader must be used within a LoaderProvider');
  }
  return context;
}; 