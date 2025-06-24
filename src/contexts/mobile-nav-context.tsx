import React, { createContext, useContext, useState, ReactNode } from 'react';

interface MobileNavContextType {
  isNavOpen: boolean;
  setIsNavOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const MobileNavContext = createContext<MobileNavContextType | undefined>(undefined);

export const MobileNavProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <MobileNavContext.Provider value={{ isNavOpen, setIsNavOpen }}>
      {children}
    </MobileNavContext.Provider>
  );
};

export const useMobileNav = () => {
  const context = useContext(MobileNavContext);
  if (context === undefined) {
    throw new Error('useMobileNav must be used within a MobileNavProvider');
  }
  return context;
}; 