import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { WorkTimeRecord } from '@/lib/services/work-time-service';
import HoursEntryForm from './HoursEntryForm';
import { StaffDashboard } from './StaffDashboard';
import ModernCalendar from '@/components/ui/modern-calendar';
import { dateUtils } from '@/lib/utils/date';
import { Clock, MapPin, FileText, User, CalendarIcon } from 'lucide-react';

// New component to display record details
interface RecordDetailsViewProps {
  record: WorkTimeRecord;
}

const RecordDetailsView: React.FC<RecordDetailsViewProps> = ({ record }) => {
  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
      <h3 className="text-lg font-medium mb-3 text-primary">Record Details</h3>
      
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <CalendarIcon className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <div className="text-sm font-medium">Date</div>
            <div>{dateUtils.formatToString(dateUtils.parseLocalDate(record.date))}</div>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <div className="text-sm font-medium">Hours Worked</div>
            <div>{record.hours_worked} hours</div>
          </div>
        </div>
        
        {record.location && (
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <div className="text-sm font-medium">Location</div>
              <div>{record.location}</div>
            </div>
          </div>
        )}
        
        {record.description && (
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <div className="text-sm font-medium">Description</div>
              <div className="text-muted-foreground">{record.description}</div>
            </div>
          </div>
        )}
        
        <div className="flex items-start gap-3">
          <User className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <div className="text-sm font-medium">Record Type</div>
            <div>{record.record_type === 'self' ? 'Self-reported' : 'Supervisor-reported'}</div>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground mt-2">
          Created: {new Date(record.created_at).toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export interface ModernFullCalendarHoursProps {
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

export const ModernFullCalendarHours: React.FC<ModernFullCalendarHoursProps> = ({
  currentMonth,
  hoursData,
  workTimeRecords = [],
  onSubmitHours,
  readOnly = false
}) => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [hoursWorked, setHoursWorked] = useState<number>(0);
  const [location, setLocation] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isFormInitialized, setIsFormInitialized] = useState<boolean>(false);
  const [isUserEditing, setIsUserEditing] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<WorkTimeRecord | null>(null);

  // Format hours data for ModernCalendar
  const formattedMarkedDates = React.useMemo(() => {
    const result: Record<string, { hours?: number, location?: string, description?: string }> = {};
    
    for (const [day, data] of Object.entries(hoursData)) {
      // Create date for this day in the current month
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), parseInt(day));
      const dateStr = dateUtils.formatToString(date);
      
      result[dateStr] = {
        hours: data.hours,
        location: data.location,
        description: data.description
      };
    }
    
    return result;
  }, [hoursData, currentMonth]);

  // When selectedDate changes, load the hours data if available
  useEffect(() => {
    if (selectedDate) {
      const day = selectedDate.getDate();
      const dayData = hoursData[day];
      
      // Find record for the selected date
      const dateStr = dateUtils.formatToString(selectedDate);
      const recordForDate = workTimeRecords.find(record => record.date === dateStr);
      
      setSelectedRecord(recordForDate || null);
      
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
      setSelectedRecord(null);
    }
  }, [selectedDate, hoursData, workTimeRecords, isUserEditing, isFormInitialized]);

  const handleDateSelect = (date: Date) => {
    // If we're in read-only mode, we can select any date to view records
    if (readOnly) {
      setIsUserEditing(false);
      setIsFormInitialized(false);
      setSelectedDate(date);
      return;
    }
    
    // Only allow selection of current day for submissions
    const isToday = dateUtils.isSameDay(date, new Date());
    
    if (!isToday) {
      // For non-current days, check if there's a record to display
      const dateStr = dateUtils.formatToString(date);
      const recordForDate = workTimeRecords.find(record => record.date === dateStr);
      
      if (recordForDate) {
        // We have a record for this date, show it
        setIsUserEditing(false);
        setIsFormInitialized(false);
        setSelectedDate(date);
      } else {
        toast({
          title: "Not Allowed",
          description: "Hours can only be submitted for the current day.",
          variant: "destructive",
        });
      }
      return;
    }
    
    // Reset editing state when selecting a new date
    setIsUserEditing(false);
    setIsFormInitialized(false);
    setSelectedDate(date);
  };

  const handleHoursSubmit = (hours: number, locationVal: string, descriptionVal?: string) => {
    if (!selectedDate || readOnly) {
      return;
    }

    // Verify that the selected date is the current day
    const isToday = dateUtils.isSameDay(selectedDate, new Date());

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
        hours,
        locationVal,
        descriptionVal || ''
      );
    } catch (error) {
      console.error("Error in ModernFullCalendarHours handleSubmit:", error);
    }

    // Reset form after submission
    setIsSubmitting(false);
    setSelectedDate(null);
    setIsFormInitialized(false);
    setIsUserEditing(false);
  };

  // Handle description change
  const handleDescriptionChange = (value: string) => {
    setIsUserEditing(true);
    setDescription(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="flex justify-center">
        <ModernCalendar
          selectedDate={selectedDate || undefined}
          onSelectDate={handleDateSelect}
          markedDates={formattedMarkedDates}
          className="w-full"
        />
      </div>

      <div>
        {selectedDate ? (
          selectedRecord ? (
            <RecordDetailsView record={selectedRecord} />
          ) : (
            <HoursEntryForm
              onSubmit={handleHoursSubmit}
              loading={isSubmitting}
              onDescriptionChange={handleDescriptionChange}
            />
          )
        ) : (
          <StaffDashboard />
        )}
      </div>
    </div>
  );
};

export default ModernFullCalendarHours; 