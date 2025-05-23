import { useEffect, useState, CSSProperties } from 'react';

interface ModernAddButtonProps {
  onClick: () => void
}

export function ModernAddButton({ onClick }: ModernAddButtonProps) {
  // Store the original position in local state
  const [buttonStyle, setButtonStyle] = useState<CSSProperties>({
    position: 'fixed',
    bottom: '38px',
    right: '38px'
  });

  // Ensure the button position stays fixed even when modals open (which can affect page layout)
  useEffect(() => {
    // Force browser to recompute styles
    const updatePosition = () => {
      setButtonStyle(prev => ({...prev}));
    };
    
    window.addEventListener('resize', updatePosition);
    document.addEventListener('scroll', updatePosition);
    
    // Also force position reset when dialog opens/closes
    const observer = new MutationObserver(updatePosition);
    observer.observe(document.body, { 
      childList: true,
      subtree: true, 
      attributes: true,
      attributeFilter: ['style', 'class']
    });
    
    return () => {
      window.removeEventListener('resize', updatePosition);
      document.removeEventListener('scroll', updatePosition);
      observer.disconnect();
    };
  }, []);
  
  return (
    <button 
      className="fab-add-employee" 
      onClick={onClick} 
      title="Add Employee"
      style={buttonStyle}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 8v8M8 12h8"/>
      </svg>
    </button>
  )
} 