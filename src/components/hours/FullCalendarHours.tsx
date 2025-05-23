import React, { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { WorkTimeRecord } from '@/lib/services/work-time-service';
import HoursEntryForm from './HoursEntryForm';
import { StaffDashboard } from './StaffDashboard';

// Import FullCalendar and necessary plugins
// Note: Run 'npm install @fullcalendar/react @fullcalendar/core @fullcalendar/daygrid @fullcalendar/interaction' 
// to add the dependencies
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

export interface FullCalendarHoursProps {
  currentMonth: Date;
  hoursData: {
    [day: number]: {
      hours: number;
      location: string;
      description?: string;
      submittedBy?: string;
      submittedOn?: Date;
    };
  };
  workTimeRecords?: WorkTimeRecord[];
  onSubmitHours: (
    date: Date,
    hours: number,
    location: string,
    description: string
  ) => void;
  readOnly?: boolean;
}

export const FullCalendarHours: React.FC<FullCalendarHoursProps> = ({
  currentMonth,
  hoursData,
  workTimeRecords,
  onSubmitHours,
  readOnly = false
}) => {
  const calendarRef = useRef<FullCalendar>(null);
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [hoursWorked, setHoursWorked] = useState<number>(0);
  const [location, setLocation] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isFormInitialized, setIsFormInitialized] = useState<boolean>(false);
  const [isUserEditing, setIsUserEditing] = useState<boolean>(false);

  // When selectedDate changes, load the hours data if available
  useEffect(() => {
    if (selectedDate) {
      const day = selectedDate.getDate();
      const dayData = hoursData[day];
      
      // Only initialize or reset form if the user isn't currently editing
      // and the form hasn't been initialized for this date yet
      if (!isUserEditing) {
        if (dayData) {
          setHoursWorked(dayData.hours);
          setLocation(dayData.location || '');
          setDescription(dayData.description || '');
          setIsFormInitialized(true);
        } else if (!isFormInitialized) {
          // Only reset form for new entry if the form isn't already initialized
          setHoursWorked(0);
          setLocation('');
          setDescription('');
          setIsFormInitialized(true);
        }
      }
    } else {
      // Reset initialization state when no date is selected
      setIsFormInitialized(false);
      setIsUserEditing(false);
    }
  }, [selectedDate, hoursData, isUserEditing, isFormInitialized]);

  // Convert hoursData to FullCalendar events format
  const getEvents = () => {
    // Return empty array to not display any events
    return [];
  };

  const handleDateClick = (info: any) => {
    const clickedDate = new Date(info.dateStr);
    
    // Only allow selection of current day for submissions
    const today = new Date();
    const isToday = 
      clickedDate.getDate() === today.getDate() && 
      clickedDate.getMonth() === today.getMonth() && 
      clickedDate.getFullYear() === today.getFullYear();
    
    if (!isToday && !readOnly) {
      toast({
        title: "Not Allowed",
        description: "Hours can only be submitted for the current day.",
        variant: "destructive",
      });
      return;
    }
    
    // Reset editing state when selecting a new date
    setIsUserEditing(false);
    setIsFormInitialized(false);
    setSelectedDate(clickedDate);
  };

  const handleSubmit = () => {
    if (!selectedDate || readOnly) {
      return;
    }

    // Verify that the selected date is the current day
    const today = new Date();
    const isToday = 
      selectedDate.getDate() === today.getDate() && 
      selectedDate.getMonth() === today.getMonth() && 
      selectedDate.getFullYear() === today.getFullYear();

    if (!isToday) {
      toast({
        title: "Not Allowed",
        description: "Hours can only be submitted for the current day.",
        variant: "destructive",
      });
      setSelectedDate(null);
      return;
    }

    setIsSubmitting(true);

    try {
      onSubmitHours(
        selectedDate,
        hoursWorked,
        location,
        description
      );
    } catch (error) {
      console.error("Error in FullCalendarHours handleSubmit:", error);
    }

    // Reset form after submission
    setIsSubmitting(false);
    setSelectedDate(null);
    setIsFormInitialized(false);
    setIsUserEditing(false);
  };

  // Handle manual input changes
  const handleManualHoursChange = (value: number) => {
    setIsUserEditing(true);
    setHoursWorked(value);
  };

  const handleManualLocationChange = (value: string) => {
    setIsUserEditing(true);
    setLocation(value);
  };

  const handleManualDescriptionChange = (value: string) => {
    setIsUserEditing(true);
    setDescription(value);
  };

  // Handle view change to keep calendar responsive on mobile
  const handleWindowResize = () => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      
      // Change view based on screen width
      if (window.innerWidth < 768) {
        calendarApi.changeView('dayGridWeek');
      } else {
        calendarApi.changeView('dayGridMonth');
      }
    }
  };

  // Setup for direct hour input in calendar cells
  useEffect(() => {
    // Listen for input changes in the calendar
    const handleHoursInputChange = (event: Event) => {
      const input = event.target as HTMLInputElement;
      if (input.classList.contains('hours-input')) {
        const dateStr = input.dataset.date;
        const hoursValue = parseFloat(input.value);
        
        if (!dateStr || isNaN(hoursValue)) return;
        
        // Validate hours
        if (hoursValue < 0 || hoursValue > 24) {
          toast({
            title: 'Invalid hours',
            description: 'Hours must be between 0 and 24',
            variant: 'destructive',
          });
          return;
        }
        
        // Get the date from the data attribute
        const inputDate = new Date(dateStr);
        
        // Submit the hours (with empty location and description for quick entry)
        try {
          onSubmitHours(
            inputDate,
            hoursValue,
            location || 'Quick entry',
            description || 'Hours entered directly in calendar'
          );
        } catch (error) {
          console.error("Error submitting hours from direct input:", error);
          toast({
            title: 'Error',
            description: 'Failed to save hours. Please try again.',
            variant: 'destructive',
          });
        }
      }
    };
    
    // Add event listener for input changes
    document.addEventListener('change', handleHoursInputChange);
    
    return () => {
      document.removeEventListener('change', handleHoursInputChange);
    };
  }, [onSubmitHours, location, description, toast]);

  // Set up resize handler
  useEffect(() => {
    window.addEventListener('resize', handleWindowResize);
    
    // Set initial view based on screen width
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      if (window.innerWidth < 768) {
        calendarApi.changeView('dayGridWeek');
      }
    }
    
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  // Render custom day cell content with editable hours input
  const renderDayCellContent = (info: any) => {
    const date = info.date;
    const dateStr = format(date, 'yyyy-MM-dd');
    const day = date.getDate();
    
    // Check if this is today's date
    const today = new Date();
    const isToday = 
      date.getDate() === today.getDate() && 
      date.getMonth() === today.getMonth() && 
      date.getFullYear() === today.getFullYear();
    
    return {
      html: `
        <div class="day-cell-content">
          <div class="date-number">${day}</div>
          ${!readOnly && isToday ? `
            <input 
              type="number" 
              class="hours-input" 
              value=""
              min="0" 
              max="24" 
              step="0.5"
              data-date="${dateStr}"
              placeholder="0"
            />
          ` : ''}
        </div>
      `
    };
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="fullcalendar-container">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          initialDate={currentMonth}
          headerToolbar={{
            left: 'prev,next',
            center: 'title',
            right: 'today'
          }}
          height="auto"
          events={getEvents()}
          dateClick={handleDateClick}
          dayCellContent={renderDayCellContent}
          dayMaxEventRows={1}
          moreLinkClick="popover"
          selectable={!readOnly}
          selectConstraint={{
            start: new Date().toISOString().substring(0, 10), // today
            end: new Date().toISOString().substring(0, 10)
          }}
          eventDisplay="block"
          eventTextColor="#000"
          navLinks={false}
          fixedWeekCount={false}
          contentHeight="auto"
          // Mobile optimizations
          dayHeaderFormat={{ weekday: window.innerWidth < 768 ? 'short' : 'long' }}
          dayHeaderClassNames="text-sm md:text-base"
          dayCellClassNames="text-xs md:text-sm h-12 md:h-20"
        />
      </div>

      <div>
        {selectedDate ? (
          <HoursEntryForm
            date={selectedDate}
            hoursWorked={hoursWorked}
            setHoursWorked={handleManualHoursChange}
            location={location}
            setLocation={handleManualLocationChange}
            description={description}
            setDescription={handleManualDescriptionChange}
            onSubmit={handleSubmit}
            onCancel={() => setSelectedDate(null)}
            isSubmitting={isSubmitting}
            readOnly={readOnly}
          />
        ) : (
          <StaffDashboard />
        )}
      </div>
    </div>
  );
};

export default FullCalendarHours; 