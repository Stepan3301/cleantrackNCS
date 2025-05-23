import { useCallback, useEffect, useState } from 'react';
import { useLoader } from '@/contexts/loader-context';

interface UsePageLoaderOptions {
  initialState?: boolean;
  minDisplayTime?: number;
}

/**
 * Custom hook for controlling the page loader.
 * Provides utilities to show and hide the loader with minimum display time.
 * 
 * @param options Configuration options
 * @returns Object with loader state and control functions
 */
export function usePageLoader(options: UsePageLoaderOptions = {}) {
  const { initialState = false, minDisplayTime = 500 } = options;
  const { showLoader, hideLoader, isLoading, setLoading } = useLoader();
  const [startTime, setStartTime] = useState<number | null>(null);

  // Show the loader and record the start time
  const show = useCallback(() => {
    setStartTime(Date.now());
    showLoader();
  }, [showLoader]);

  // Hide the loader, respecting the minimum display time
  const hide = useCallback(() => {
    if (startTime) {
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < minDisplayTime) {
        // If minimum display time hasn't elapsed, wait before hiding
        setTimeout(() => {
          hideLoader();
          setStartTime(null);
        }, minDisplayTime - elapsedTime);
      } else {
        // Minimum time has elapsed, hide immediately
        hideLoader();
        setStartTime(null);
      }
    } else {
      hideLoader();
    }
  }, [hideLoader, startTime, minDisplayTime]);

  // Function to execute an async operation with the loader
  const withLoader = useCallback(
    async <T,>(asyncFn: () => Promise<T>): Promise<T> => {
      show();
      try {
        return await asyncFn();
      } finally {
        hide();
      }
    },
    [show, hide]
  );

  // Initialize the loader state if needed
  useEffect(() => {
    if (initialState) {
      show();
    }
  }, [initialState, show]);

  return {
    isLoading,
    show,
    hide,
    withLoader,
    setLoading
  };
}

export default usePageLoader; 