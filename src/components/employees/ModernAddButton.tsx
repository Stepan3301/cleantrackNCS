import React from 'react';

interface ModernAddButtonProps {
  onClick: () => void;
}

export function ModernAddButton({ onClick }: ModernAddButtonProps) {
  return (
    <button 
      className="fab-add-employee" 
      onClick={onClick} 
      title="Add Employee"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 8v8M8 12h8"/>
      </svg>
    </button>
  )
} 