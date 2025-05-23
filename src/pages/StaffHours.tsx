import React from 'react';
import { StaffHoursView } from '@/components/hours/StaffHoursView';
import { useAuth } from '@/contexts/auth-context';
import { useState, useEffect } from 'react';
import { WorkTimeRecord, workTimeService } from '@/lib/services/work-time-service';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

const StaffHours: React.FC = () => {
  const { user, users } = useAuth();
  const { toast } = useToast();
  const [workTimeRecords, setWorkTimeRecords] = useState<WorkTimeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    const fetchWorkTimeRecords = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const records = await workTimeService.getUserWorkTime(user.id);
        setWorkTimeRecords(records);
      } catch (error) {
        console.error('Error fetching work time records:', error);
        toast({
          title: 'Error',
          description: 'Failed to load work time records.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWorkTimeRecords();
  }, [user, toast]);
  
  const handleHourSubmission = async (date: Date, hours: number, location: string, description?: string) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      // Format date to YYYY-MM-DD
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      // Use createStaffRecord since this is a self-submission
      const result = await workTimeService.createStaffRecord(
        user.id,
        formattedDate,
        hours,
        location,
        description
      );
      
      if (result) {
        toast({
          title: 'Success',
          description: 'Hours submitted successfully.',
        });
        
        // Refresh the work time records
        const records = await workTimeService.getUserWorkTime(user.id);
        setWorkTimeRecords(records);
      }
    } catch (error) {
      console.error('Error submitting hours:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit hours.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading || !user) {
    return (
      <div className="container mx-auto py-6 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Staff Hours</h1>
      <StaffHoursView 
        user={user}
        users={users}
        workTimeRecords={workTimeRecords}
        onHourSubmission={handleHourSubmission}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default StaffHours; 