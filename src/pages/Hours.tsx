import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StaffHoursView } from "@/components/hours/StaffHoursView";
import { SupervisorHoursView } from "@/components/hours/SupervisorHoursView";
import { ManagerHoursView } from "@/components/hours/ManagerHoursView";
import { HeadManagerHoursView } from "@/components/hours/HeadManagerHoursView";
import { ModernFullCalendarHours } from "@/components/hours/ModernFullCalendarHours";
import { User } from "@/contexts/auth-context";
import { useState, useEffect } from "react";
import { workTimeService, WorkTimeInput, WorkTimeRecord } from "@/lib/services/work-time-service";
import { isValid } from "date-fns";
import { dateUtils } from "@/lib/utils/date";
import ErrorBoundary from "../ErrorBoundary";
import { supabase } from "@/lib/supabase";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import "../styles/modern-dashboard.css";

const Hours = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [error, setError] = useState<Error | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [userHours, setUserHours] = useState<WorkTimeRecord[]>([]);
  const [submittingHours, setSubmittingHours] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // Add state for selected supervisor filter
  const [selectedSupervisor, setSelectedSupervisor] = useState<string>("all");
  
  // Default empty hoursData object to prevent errors
  const DEFAULT_HOURS_DATA = {};

  // Add useEffect to apply modern dashboard class to body
  useEffect(() => {
    // Add the modern-dashboard class to the body
    document.body.classList.add('modern-dashboard');
    
    // Remove the class when component unmounts
    return () => {
      document.body.classList.remove('modern-dashboard');
    }
  }, []);

  // Load users on component mount
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('*')
          .order('name');
          
        if (error) throw error;
        setUsers(profiles);
      } catch (err) {
        console.error('Error loading users:', err);
        setError(err instanceof Error ? err : new Error('Failed to load users'));
      }
    };
    
    loadUsers();
  }, []);

  // Get all supervisors for filtering
  const allSupervisors = users.filter(u => u.role === "supervisor");

  // Function to refresh user hours data
  const refreshUserHours = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      let hours: WorkTimeRecord[];
      
      // For managers and above, we need to fetch all work time records
      if (user.role === 'manager' || user.role === 'head_manager' || user.role === 'owner') {
        const { data, error } = await supabase
          .from('work_time')
          .select('*, profiles!work_time_user_id_fkey(name)')
          .order('date', { ascending: false });
          
        if (error) {
          throw new Error(`Failed to get work time records: ${error.message}`);
        }
        
        hours = data || [];
      } else if (user.role === 'supervisor') {
        hours = await workTimeService.getSupervisorWorkTime(user.id);
      } else {
        hours = await workTimeService.getUserWorkTime(user.id);
      }
      
      setUserHours(hours);
    } catch (err) {
      console.error("Error refreshing user hours:", err);
      toast({
        title: "Error refreshing hours",
        description: "Failed to load updated hours data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter records based on selected supervisor
  const filteredRecords = selectedSupervisor === "all" 
    ? userHours 
    : userHours.filter(record => {
        // Find the staff member this record belongs to
        const staffMember = users.find(u => u.id === record.user_id);
        // Check if their supervisor matches the selected one
        return staffMember?.supervisor_id === selectedSupervisor;
      });

  // Load hours data on component mount and when user changes
  useEffect(() => {
    refreshUserHours();
  }, [user]);

  // Handle hour submission
  const handleHourSubmission = async (
    date: Date,
    hours: number,
    location: string,
    description?: string
  ) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit hours",
        variant: "destructive"
      });
      return;
    }

    // Debug logging to check values
    console.log("[handleHourSubmission] Received values:", {
      date: date,
      hours: hours,
      hoursType: typeof hours,
      location: location,
      locationType: typeof location,
      description: description
    });

    // Validate hours
    if (typeof hours !== 'number' || isNaN(hours)) {
      toast({
        title: "Invalid hours",
        description: `Hours must be a valid number, got: ${hours} (${typeof hours})`,
        variant: "destructive"
      });
      return;
    }

    if (hours <= 0 || hours > 24) {
      toast({
        title: "Invalid hours",
        description: `Hours must be between 0 and 24, got: ${hours}`,
        variant: "destructive"
      });
      return;
    }

    // Validate location
    if (!location || typeof location !== 'string') {
      toast({
        title: "Invalid location",
        description: "Location is required and must be a string",
        variant: "destructive"
      });
      return;
    }

    setSubmittingHours(true);
    const submissionTimeout = setTimeout(() => {
      toast({
        title: "Submission taking longer than expected",
        description: "Please wait while we process your submission",
      });
    }, 3000);

    try {
      // Format the date
      const formattedDate = dateUtils.formatToString(date);
      
      // Ensure hours is a number before submission
      const hoursNumber = Number(hours);
      
      if (isNaN(hoursNumber)) {
        throw new Error(`Hours must be a valid number, got: ${hours}`);
      }
      
      // Submit to service with explicit parameter naming
      await workTimeService.submitWorkTime({
        user_id: user.id,
        date: formattedDate,
        hours_worked: hoursNumber,
        location: location,
        description: description
      });

      // Refresh the hours data
      await refreshUserHours();

      toast({
        title: "Hours submitted",
        description: `Successfully submitted ${hoursNumber} hours for ${formattedDate} at ${location}`,
      });
    } catch (err) {
      console.error("Error submitting hours:", err);
      toast({
        title: "Error submitting hours",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      clearTimeout(submissionTimeout);
      setSubmittingHours(false);
    }
  };

  // Handle hour submission for supervisor view
  const handleSupervisorHourSubmission = async (
    userId: string,
    date: Date,
    hours: number,
    location: string,
    description?: string
  ) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit hours",
        variant: "destructive"
      });
      return;
    }

    // Validate hours
    if (hours <= 0 || hours > 24) {
      toast({
        title: "Invalid hours",
        description: "Hours must be between 0 and 24",
        variant: "destructive"
      });
      return;
    }

    setSubmittingHours(true);
    const submissionTimeout = setTimeout(() => {
      toast({
        title: "Submission taking longer than expected",
        description: "Please wait while we process your submission",
      });
    }, 3000);

    try {
      // Format the date
      const formattedDate = dateUtils.formatToString(date);
      
      // Submit using supervisor record creation
      await workTimeService.createSupervisorRecord(
        user.id,
        userId,
        formattedDate,
        hours,
        location,
        description
      );

      // Refresh the hours data
      await refreshUserHours();

      toast({
        title: "Hours submitted",
        description: `Successfully submitted ${hours} hours for staff member`,
      });
    } catch (err) {
      console.error("Error submitting supervisor hours:", err);
      toast({
        title: "Error submitting hours",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      clearTimeout(submissionTimeout);
      setSubmittingHours(false);
    }
  };

  // Handle record update
  const handleUpdateRecord = async (
    recordId: string,
    hours: number,
    location: string,
    description?: string
  ) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to update hours",
        variant: "destructive"
      });
      return;
    }

    setSubmittingHours(true);
    const submissionTimeout = setTimeout(() => {
      toast({
        title: "Update taking longer than expected",
        description: "Please wait while we process your update",
      });
    }, 3000);

    try {
      // Update the record using the work time service
      await workTimeService.updateWorkTime(recordId, {
        hours_worked: hours,
        location: location,
        description: description
      });

      clearTimeout(submissionTimeout);
      
      // Refresh data
      await refreshUserHours();
      
      toast({
        title: "Hours updated successfully",
        description: `Updated ${hours} hours at ${location}`,
      });
    } catch (err) {
      clearTimeout(submissionTimeout);
      console.error("Error updating hours:", err);
      toast({
        title: "Failed to update hours",
        description: err instanceof Error ? err.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setSubmittingHours(false);
    }
  };

  if (!user) return null;

  // Role checks
  const isStaff = user.role === "staff";
  const isSupervisor = user.role === "supervisor";
  const isManager = user.role === "manager";
  const isHeadManagerOrOwner = user.role === "head_manager" || user.role === "owner";

  // Error handler to display errors
  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg border border-red-200">
        <h2 className="text-xl font-bold text-red-800 mb-2">Something went wrong</h2>
        <p className="text-red-600 mb-4">{error.message}</p>
        <Button onClick={() => setError(null)}>Try Again</Button>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Function to get staff members for a specific supervisor
  const getStaffForSupervisor = (supervisorId: string) => {
    return users.filter(user => user.supervisor_id === supervisorId && user.role === 'staff');
  };

  // Calculate total hours and get cell color for ManagerHoursView and HeadManagerHoursView
  const calculateTotalHours = (staffId: string) => {
    return filteredRecords
      .filter(r => r.user_id === staffId)
      .reduce((acc, r) => acc + (r.hours_worked || 0), 0);
  };

  const getCellColor = (staffId: string, day: number) => {
    const record = filteredRecords.find(r => {
      try {
        const recordDay = dateUtils.getDayFromString(r.date);
        return r.user_id === staffId && recordDay === day;
      } catch (error) {
        console.error('Error processing record date:', r.date, error);
        return false;
      }
    });
    
    return record ? 'bg-green-100' : '';
  };

  // Improved function to transform workTimeRecords into the hoursData format
  const formatHoursDataForUser = (userId: string, records: WorkTimeRecord[] = []) => {
    // If no records are provided, use the component's state
    const userRecords = records.length > 0 
      ? records.filter(r => r.user_id === userId)
      : filteredRecords.filter(r => r.user_id === userId);

    if (!userRecords.length) {
      return DEFAULT_HOURS_DATA; // Return default empty object
    }

    const formattedData: Record<string, {
      hours?: number;
      location?: string;
      description?: string;
    }> = {};

    for (const record of userRecords) {
      if (isValid(new Date(record.date))) {
        // We need to adjust for timezones by creating the date as local
        const recordDate = dateUtils.parseLocalDate(record.date);
        const formattedDate = dateUtils.formatToString(recordDate);
        
        formattedData[formattedDate] = {
          hours: record.hours_worked,
          location: record.location,
          description: record.description
        };
      }
    }
    
    return formattedData;
  };

  // Render supervisor filter for manager+ roles
  const renderSupervisorFilter = () => {
    if (!isManager && !isHeadManagerOrOwner) return null;
    
    return (
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Filter by Supervisor</label>
        <Select
          value={selectedSupervisor}
          onValueChange={setSelectedSupervisor}
        >
          <SelectTrigger className="w-full md:w-72">
            <SelectValue placeholder="Select a supervisor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Supervisors</SelectItem>
            {allSupervisors.map(supervisor => (
              <SelectItem key={supervisor.id} value={supervisor.id}>
                {supervisor.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  };

  // Format all hours data for manager/head_manager views
  const allHoursData = user.role === 'manager' || user.role === 'head_manager' || user.role === 'owner'
    ? users.reduce((acc, u) => {
        acc[u.id] = formatHoursDataForUser(u.id, filteredRecords);
        return acc;
      }, {} as Record<string, any>)
    : {};

  return (
    <div className="dashboard-layout dashboard-container space-y-6 px-1 sm:px-2 md:px-4 max-w-screen-xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-xl sm:text-2xl font-bold">Hours</h1>
      </div>
      
      {/* Show error message if there is an error */}
      {error && (
        <div className="bg-destructive/10 text-destructive p-3 sm:p-4 rounded-lg flex items-start space-x-2">
          <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium">Error</h3>
            <p className="text-sm">{error.message || "An unknown error occurred"}</p>
          </div>
        </div>
      )}
      
      {/* Supervisor filter for manager+ roles */}
      {renderSupervisorFilter()}
      
      {/* Render different views based on user role */}
      <ErrorBoundary>
        {isStaff && (
          <ModernFullCalendarHours 
            currentMonth={new Date()}
            hoursData={formatHoursDataForUser(user?.id || '', userHours) || DEFAULT_HOURS_DATA}
            workTimeRecords={userHours || []}
            onSubmitHours={handleHourSubmission}
            onUpdateRecord={handleUpdateRecord}
            readOnly={false}
          />
        )}
        
        {isSupervisor && (
          <SupervisorHoursView 
            user={user}
            users={users}
            workTimeRecords={userHours}
            onHourSubmission={handleSupervisorHourSubmission}
            isSubmitting={submittingHours}
          />
        )}
        
        {isManager && (
          <ManagerHoursView 
            users={users}
            allSupervisors={allSupervisors}
            workTimeRecords={filteredRecords}
            getStaffForSupervisor={getStaffForSupervisor}
            calculateTotalHours={calculateTotalHours}
            getCellColor={getCellColor}
            isHeadManagerOrOwner={false}
          />
        )}
        
        {isHeadManagerOrOwner && (
          <HeadManagerHoursView 
            users={users}
            allSupervisors={allSupervisors}
            workTimeRecords={filteredRecords}
          />
        )}
      </ErrorBoundary>
    </div>
  );
};

export default Hours;
