import React from 'react';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showDate?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  showDate = false,
  className = '',
  children,
}: PageHeaderProps) {
  const today = new Date();
  const formattedDate = format(today, 'EEEE, MMMM d, yyyy');
  
  return (
    <div className={`page-header ${className}`}>
      <div className="page-header-content">
        <div className="page-header-text">
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
        
        <div className="page-header-actions">
          {showDate && (
            <div className="date-display">
              <Clock className="date-icon" size={16} />
              <span className="date-text">{formattedDate}</span>
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
} 