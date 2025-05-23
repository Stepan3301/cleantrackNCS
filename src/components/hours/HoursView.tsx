import React, { useEffect, useMemo, useState } from 'react';
import ModernCalendar from '@/components/ui/modern-calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import TodayHoursView from './TodayHoursView';
import { 
  WorkTimeRecord, 
  workTimeService 
} from '@/lib/services/work-time-service';
import { 
  targetHoursService 
} from '@/lib/services/target-hours-service';
import { useToast } from '@/components/ui/use-toast';
import { startOfDay, endOfDay, isToday, format } from 'date-fns';
import HoursEntryForm from './HoursEntryForm';
import { Profile } from '@/types/database.types';

export interface HoursViewProps {
  currentMonth?: Date;
  hoursData?: any;
  workTimeRecords?: WorkTimeRecord[];
  onSubmitHours?: (date: Date, hours: number, location: string, description?: string) => Promise<void>;
  readOnly?: boolean;
  employee?: Profile;
}

export const HoursView: React.FC<HoursViewProps> = ({
  currentMonth = new Date(),
  workTimeRecords = [],
  onSubmitHours,
  readOnly = false,
  employee,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [targetHours, setTargetHours] = useState<number>(0);
  const [completedHours, setCompletedHours] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [description, setDescription] = useState<string>('');

  const staffId = employee?.id || user?.id;

  // Filter out supervisor records for staff view
  const filteredWorkTimeRecords = useMemo(() => {
    // If the user is a staff member viewing their own records, only show 'self' records
    // This ensures supervisor-created records don't show up in the staff member's view
    if (user?.role === 'staff' && !employee) {
      return workTimeRecords.filter(record => record.record_type === 'self');
    }
    return workTimeRecords;
  }, [workTimeRecords, user?.role, employee]);

  // Format records into a structure for the calendar
  const formattedMarkedDates = useMemo(() => {
    const result: Record<string, { hours?: number, location?: string, description?: string }> = {};
    
    filteredWorkTimeRecords.forEach(record => {
      if (!record.date) return;
      
      const dateKey = record.date;
      if (!result[dateKey]) {
        result[dateKey] = {
          hours: record.hours_worked,
          location: record.location,
          description: record.description
        };
      } else {
        // If there are multiple entries for the same date, sum the hours
        result[dateKey].hours = (result[dateKey].hours || 0) + (record.hours_worked || 0);
      }
    });
    
    return result;
  }, [filteredWorkTimeRecords]);

  // Calculate today's records - records for the current day and current user
  const todayRecords = useMemo(() => {
    if (!filteredWorkTimeRecords?.length) return [];

    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);

    return filteredWorkTimeRecords.filter(record => {
      const recordDate = record.created_at ? new Date(record.created_at) : null;
      return (
        recordDate && 
        recordDate >= startOfToday && 
        recordDate <= endOfToday &&
        record.user_id === staffId
      );
    });
  }, [filteredWorkTimeRecords, staffId]);

  // Calculate total hours worked today
  const totalHoursToday = useMemo(() => {
    if (!todayRecords?.length) return 0;
    return todayRecords.reduce((total, record) => total + (record.hours_worked || 0), 0);
  }, [todayRecords]);

  const fetchTargetHours = async () => {
    try {
      if (!staffId) return;

      const targetData = await targetHoursService.getTargetHoursByStaffId(staffId);
      if (targetData) {
        setTargetHours(targetData.hours || 0);
      }
    } catch (error) {
      console.error('Error fetching target hours:', error);
    }
  };

  const fetchCompletedHours = async () => {
    try {
      if (!staffId) return;
      
      const { data, error } = await workTimeService.getCompletedHoursByStaffIdAndMonth(
        staffId,
        format(currentMonth, 'yyyy-MM')
      );
      
      if (error) throw error;
      setCompletedHours(data || 0);
    } catch (error) {
      console.error('Error fetching completed hours:', error);
    }
  };

  useEffect(() => {
    fetchTargetHours();
    fetchCompletedHours();
  }, [currentMonth, staffId]);

  const handleManualDescriptionChange = (value: string) => {
    setDescription(value);
  };

  const selectedDateRecords = useMemo(() => {
    if (!selectedDate || !filteredWorkTimeRecords?.length) return [];

    const start = startOfDay(selectedDate);
    const end = endOfDay(selectedDate);

    return filteredWorkTimeRecords.filter(record => {
      const recordDate = record.created_at ? new Date(record.created_at) : null;
      return (
        recordDate && 
        recordDate >= start && 
        recordDate <= end &&
        record.user_id === staffId
      );
    });
  }, [selectedDate, filteredWorkTimeRecords, staffId]);

  const handleSubmitHours = async (hoursWorked: number, locationName: string, descriptionText?: string) => {
    setLoading(true);
    
    try {
      // Log to verify correct data
      console.log('Hours submission data:', {
        date: selectedDate,
        hours: hoursWorked,
        location: locationName,
        description: descriptionText
      });
      
      // Validate hours
      if (typeof hoursWorked !== 'number' || isNaN(hoursWorked)) {
        throw new Error(`Hours must be a valid number, received: ${typeof hoursWorked}`);
      }
      
      if (hoursWorked <= 0 || hoursWorked > 24) {
        throw new Error(`Hours must be between 0 and 24, received: ${hoursWorked}`);
      }
      
      // Validate location
      if (!locationName || typeof locationName !== 'string') {
        throw new Error('Location is required and must be a string');
      }
      
      // Validate selected date
      if (!selectedDate) {
        throw new Error('A date must be selected');
      }
      
      // Call the submit handler provided
      if (onSubmitHours) {
        await onSubmitHours(selectedDate, hoursWorked, locationName, descriptionText);
        
        // Refresh the completed hours to update the progress bar
        await fetchCompletedHours();
        
        toast({
          title: "Hours submitted",
          description: `Your work hours (${hoursWorked} hours at ${locationName}) have been recorded successfully.`,
        });
      }
    } catch (error) {
      console.error('Error submitting hours:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "There was a problem submitting your hours. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Card */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle>Monthly Target Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Completed Hours:</span>
              <span className="font-medium">{completedHours} / {targetHours}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary" 
                style={{ 
                  width: `${targetHours > 0 ? Math.min(100, (completedHours / targetHours) * 100) : 0}%` 
                }}
              ></div>
            </div>
            <div className="text-xs text-muted-foreground">
              {targetHours > 0 
                ? `${Math.round((completedHours / targetHours) * 100)}% of monthly target completed`
                : "No target hours set for this month"}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today's Hours View */}
        <div className="col-span-1">
          <TodayHoursView records={todayRecords} totalHours={totalHoursToday} />
        </div>
        
        {/* Calendar and Form Section */}
        <div className="col-span-1 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Work Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 flex justify-center">
                  <ModernCalendar 
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                    markedDates={formattedMarkedDates}
                    className="w-full"
                  />
                </div>
                
                <div className="flex-1">
                  {!readOnly && isToday(selectedDate as Date) && (
                    <HoursEntryForm 
                      onSubmit={handleSubmitHours} 
                      loading={loading}
                      onDescriptionChange={handleManualDescriptionChange}
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
