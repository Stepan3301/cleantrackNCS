import React, { createContext, useContext, useState, useEffect } from 'react';

const DeviceContext = createContext<{ isMobile: boolean }>({ isMobile: false });

export const useDevice = () => useContext(DeviceContext);

export const DeviceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    setIsMobile(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => setIsMobile(event.matches);
    
    // Add the event listener in a way that is compatible with older browsers
    try {
      mediaQuery.addEventListener('change', handler);
    } catch (e) {
      // Fallback for older browsers
      mediaQuery.addListener(handler);
    }

    return () => {
      try {
        mediaQuery.removeEventListener('change', handler);
      } catch (e) {
        // Fallback for older browsers
        mediaQuery.removeListener(handler);
      }
    };
  }, []);

  return (
    <DeviceContext.Provider value={{ isMobile }}>
      {children}
    </DeviceContext.Provider>
  );
}; 