import React, { useState } from 'react'
import { cleanReload, troubleshootLoading } from '@/lib/cache-manager'

interface LoadingFallbackProps {
  message?: string
  retryEnabled?: boolean
  troubleshootEnabled?: boolean
  showProgressBar?: boolean
}

export function LoadingFallback({
  message = "Loading application...",
  retryEnabled = true,
  troubleshootEnabled = true,
  showProgressBar = true
}: LoadingFallbackProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  
  // Simulate progress bar
  React.useEffect(() => {
    if (showProgressBar && !isRetrying) {
      const timer = setInterval(() => {
        setProgress(prev => {
          // Progress slows down as it approaches 90%
          const increment = prev < 30 ? 10 : prev < 60 ? 5 : prev < 80 ? 2 : 0.5;
          const nextProgress = Math.min(prev + increment, 90);
          return nextProgress;
        });
      }, 500);
      
      return () => clearInterval(timer);
    }
  }, [showProgressBar, isRetrying]);
  
  const handleRetry = async () => {
    setIsRetrying(true);
    setProgress(0);
    
    // Simulate progress for a clean reload
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
    
    await cleanReload();
    
    // In case reload doesn't happen
    clearInterval(timer);
    setIsRetrying(false);
  };
  
  const handleTroubleshoot = async () => {
    setShowTroubleshooting(true);
    setIsRetrying(true);
    setProgress(0);
    
    // Simulate progress for a clean reload
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
    
    await troubleshootLoading();
    
    // In case reload doesn't happen
    clearInterval(timer);
    setIsRetrying(false);
    setShowTroubleshooting(false);
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-gradient-to-br from-cyan-50 to-blue-100">
      <div className="mb-8">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mb-4 text-primary animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </div>
      
      <h2 className="mb-2 text-2xl font-bold text-gray-800">{message}</h2>
      
      {showProgressBar && (
        <div className="w-full max-w-md h-2 bg-gray-200 rounded-full overflow-hidden mt-4 mb-6">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      
      {isRetrying ? (
        <p className="mt-4 text-gray-600">
          {showTroubleshooting ? "Clearing caches and troubleshooting..." : "Reloading application..."}
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {retryEnabled && (
            <button
              className="px-6 py-2 text-white bg-primary rounded-lg shadow-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-colors"
              onClick={handleRetry}
              disabled={isRetrying}
            >
              Retry Loading
            </button>
          )}
          
          {troubleshootEnabled && (
            <div>
              <button
                className="px-6 py-2 text-primary bg-transparent border border-primary rounded-lg hover:bg-primary hover:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-colors mt-3"
                onClick={handleTroubleshoot}
                disabled={isRetrying}
              >
                Troubleshoot Loading Issues
              </button>
              <p className="mt-2 text-xs text-gray-500">
                This will clear all caches and reload the app
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 