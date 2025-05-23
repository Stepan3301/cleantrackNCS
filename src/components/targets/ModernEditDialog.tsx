import React, { useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { X } from 'lucide-react';

interface ModernEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  staffName: string;
  staffEmail?: string;
  period: string;
  targetHours: number;
  onTargetHoursChange: (value: number) => void;
  onSave: () => void;
  isSaving: boolean;
}

export function ModernEditDialog({
  isOpen,
  onClose,
  staffName,
  staffEmail,
  period,
  targetHours,
  onTargetHoursChange,
  onSave,
  isSaving
}: ModernEditDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Handle escape key to close dialog
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
  
  // Auto-focus the hours input
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isOpen]);
  
  // Prevent click outside from closing when editing
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
      onClose();
    }
  };
  
  if (!isOpen) return null;
  
  const formattedPeriod = format(new Date(`${period}-01`), 'MMMM yyyy');
  
  return (
    <div className="modern-edit-dialog-overlay" onClick={handleBackdropClick}>
      <div className="modern-edit-dialog" ref={dialogRef}>
        <button 
          className="modern-edit-dialog-close" 
          onClick={onClose}
          aria-label="Close"
        >
          <X />
        </button>
        
        <h2 className="modern-edit-dialog-title">Edit Target Hours</h2>
        
        <div className="modern-edit-dialog-content">
          <div className="modern-edit-dialog-field">
            <label className="modern-edit-dialog-label">Staff Member</label>
            <input
              type="text"
              className="modern-edit-dialog-input"
              value={staffName}
              disabled
            />
          </div>
          
          {staffEmail && (
            <div className="modern-edit-dialog-field">
              <label className="modern-edit-dialog-label">Email</label>
              <input
                type="text"
                className="modern-edit-dialog-input"
                value={staffEmail}
                disabled
              />
            </div>
          )}
          
          <div className="modern-edit-dialog-field">
            <label className="modern-edit-dialog-label">Period</label>
            <input
              type="text"
              className="modern-edit-dialog-input"
              value={formattedPeriod}
              disabled
            />
          </div>
          
          <div className="modern-edit-dialog-field">
            <label className="modern-edit-dialog-label">Target Hours</label>
            <input
              ref={inputRef}
              type="number"
              min="0"
              max="500"
              className="modern-edit-dialog-input"
              value={targetHours}
              onChange={(e) => onTargetHoursChange(Number(e.target.value))}
            />
          </div>
        </div>
        
        <div className="modern-edit-dialog-footer">
          <button 
            className="modern-edit-dialog-cancel"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </button>
          
          <button 
            className="modern-edit-dialog-save"
            onClick={onSave}
            disabled={isSaving}
          >
            {isSaving && (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
            )}
            Save
          </button>
        </div>
      </div>
    </div>
  );
} 