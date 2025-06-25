import React, { createContext, useContext, useState, useEffect } from 'react';

const DeviceContext = createContext<{ isMobile: boolean }>({ isMobile: false });

export const useDevice = () => useContext(DeviceContext);

export const DeviceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      // Множественные способы определения мобильного устройства
      const mediaQuery = window.matchMedia('(max-width: 768px)');
      const userAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const touchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const screenWidth = window.innerWidth <= 768;
      
      // Считаем устройство мобильным если выполняется любое из условий
      const mobile = mediaQuery.matches || userAgent || (touchDevice && screenWidth);
      
      console.log('Device detection:', {
        mediaQuery: mediaQuery.matches,
        userAgent,
        touchDevice,
        screenWidth,
        finalResult: mobile
      });
      
      setIsMobile(mobile);
    };

    // Проверяем сразу при загрузке
    checkMobile();
    
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const handler = (event: MediaQueryListEvent) => {
      console.log('Media query changed:', event.matches);
      checkMobile();
    };
    
    // Add the event listener in a way that is compatible with older browsers
    try {
      mediaQuery.addEventListener('change', handler);
    } catch (e) {
      // Fallback for older browsers
      mediaQuery.addListener(handler);
    }

    // Также слушаем изменения размера окна
    const resizeHandler = () => {
      checkMobile();
    };
    window.addEventListener('resize', resizeHandler);

    return () => {
      try {
        mediaQuery.removeEventListener('change', handler);
      } catch (e) {
        // Fallback for older browsers
        mediaQuery.removeListener(handler);
      }
      window.removeEventListener('resize', resizeHandler);
    };
  }, []);

  return (
    <DeviceContext.Provider value={{ isMobile }}>
      {children}
    </DeviceContext.Provider>
  );
}; 