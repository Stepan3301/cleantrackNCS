import React, { useState, useEffect } from 'react';
import './modern-calendar.css';

export interface ModernCalendarProps {
  selectedDate?: Date;
  onSelectDate?: (date: Date) => void;
  className?: string;
  markedDates?: Record<string, {
    hours?: number;
    location?: string;
    description?: string;
  }>;
}

const ModernCalendar: React.FC<ModernCalendarProps> = ({ 
  selectedDate, 
  onSelectDate, 
  className = '',
  markedDates = {} 
}) => {
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [internalSelectedDate, setInternalSelectedDate] = useState<Date | undefined>(selectedDate);

  useEffect(() => {
    if (selectedDate) {
      setInternalSelectedDate(selectedDate);
    }
  }, [selectedDate]);

  // Update parent component's state when internal selection changes
  useEffect(() => {
    if (internalSelectedDate && onSelectDate) {
      onSelectDate(internalSelectedDate);
    }
  }, [internalSelectedDate, onSelectDate]);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const navigateToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const navigateToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const renderCalendarGrid = () => {
    const today = new Date();
    
    // First day of the month (0 = Sunday, 1 = Monday, etc)
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    
    // Days in previous month
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();
    
    // Days in current month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Create grid
    const calendarGrid = [];

    // Add day names header
    for (let i = 0; i < 7; i++) {
      calendarGrid.push(
        <div key={`day-${i}`} className="calendar-day">
          {dayNames[i]}
        </div>
      );
    }

    // Add previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      const prevMonthDay = prevMonthDays - i;
      calendarGrid.push(
        <div 
          key={`prev-${prevMonthDay}`} 
          className="calendar-date other-month"
        >
          {prevMonthDay}
        </div>
      );
    }

    // Add current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateString = date.toISOString().split('T')[0];
      const isToday = 
        day === today.getDate() && 
        currentMonth === today.getMonth() && 
        currentYear === today.getFullYear();
        
      const isSelected = 
        internalSelectedDate && 
        day === internalSelectedDate.getDate() && 
        currentMonth === internalSelectedDate.getMonth() && 
        currentYear === internalSelectedDate.getFullYear();
        
      // Check if this date has associated data
      const hasMarkedData = markedDates[dateString] !== undefined;
      
      let classNames = "calendar-date";
      if (isToday) classNames += " today";
      if (isSelected) classNames += " selected";
      
      // Indicator for dates with hours logged
      let indicator = null;
      if (hasMarkedData && markedDates[dateString].hours !== undefined) {
        indicator = (
          <div className="date-indicator">{markedDates[dateString].hours}h</div>
        );
      }
      
      calendarGrid.push(
        <div 
          key={`day-${day}`} 
          className={classNames}
          onClick={() => setInternalSelectedDate(new Date(currentYear, currentMonth, day))}
        >
          {day}
          {indicator}
        </div>
      );
    }

    // Add next month days to fill grid
    const totalCells = firstDay + daysInMonth;
    const nextDays = (7 - (totalCells % 7)) % 7;
    
    for (let i = 1; i <= nextDays; i++) {
      calendarGrid.push(
        <div 
          key={`next-${i}`} 
          className="calendar-date other-month"
        >
          {i}
        </div>
      );
    }

    return calendarGrid;
  };

  return (
    <div className={`calendar-wrapper ${className}`}>
      <div className="calendar-bubbles">
        <div className="calendar-bubble"></div>
        <div className="calendar-bubble"></div>
        <div className="calendar-bubble"></div>
      </div>
      <div className="calendar-card" id="calendarCard">
        <div className="calendar-header">
          <button 
            className="calendar-nav" 
            id="prevMonth" 
            aria-label="Previous Month"
            onClick={navigateToPreviousMonth}
          >
            &lt;
          </button>
          <div className="calendar-title" id="calendarTitle">
            {monthNames[currentMonth]} {currentYear}
          </div>
          <button 
            className="calendar-nav" 
            id="nextMonth" 
            aria-label="Next Month"
            onClick={navigateToNextMonth}
          >
            &gt;
          </button>
        </div>
        <div className="calendar-grid" id="calendarGrid">
          {renderCalendarGrid()}
        </div>
      </div>
    </div>
  );
};

export default ModernCalendar; 