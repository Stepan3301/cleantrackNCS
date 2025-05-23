import { useState, useEffect } from "react";
import { User } from "@/contexts/auth-context";
import { WorkTimeRecord } from "@/lib/services/work-time-service";
import { format, startOfMonth, endOfMonth, isValid, getDate } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Clock, MapPin, FileText, User as UserIcon, CalendarIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { targetHoursService } from "@/lib/services/target-hours-service";
import { Card } from "@/components/ui/card";

// Record details component
interface RecordDetailsProps {
  record: WorkTimeRecord;
}

const RecordDetailsView: React.FC<RecordDetailsProps> = ({ record }) => {
  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-primary">Record Details</h3>
        <div className="text-sm text-muted-foreground">
          {record.status === 'approved' ? (
            <span className="text-green-600 font-medium">Approved</span>
          ) : record.status === 'pending' ? (
            <span className="text-amber-600 font-medium">Pending</span>
          ) : (
            <span className="text-red-600 font-medium">Rejected</span>
          )}
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <CalendarIcon className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <div className="text-sm font-medium">Date</div>
            <div>{format(new Date(record.date), 'MMMM d, yyyy')}</div>
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
          <UserIcon className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <div className="text-sm font-medium">Record Type</div>
            <div>{record.record_type === 'self' ? 'Self-reported' : 'Supervisor-reported'}</div>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground mt-2">
          Created: {format(new Date(record.created_at), 'MMMM d, yyyy h:mm a')}
        </div>
      </div>
    </Card>
  );
};

interface StaffHoursViewProps {
  user: User;
  users: User[];
  workTimeRecords: WorkTimeRecord[];
  onHourSubmission: (date: Date, hours: number, location: string, description?: string) => Promise<void>;
  isSubmitting: boolean;
}

export const StaffHoursView = ({
  user,
  users,
  workTimeRecords,
  onHourSubmission,
  isSubmitting
}: StaffHoursViewProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [hours, setHours] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [targetHours, setTargetHours] = useState<number | null>(null);
  const [completedHours, setCompletedHours] = useState<number>(0);
  const [loadingTarget, setLoadingTarget] = useState<boolean>(true);
  const [selectedRecord, setSelectedRecord] = useState<WorkTimeRecord | null>(null);

  // When selectedDate changes, check if there's an existing record
  useEffect(() => {
    if (selectedDate) {
      // Format date as YYYY-MM-DD to match record format
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      // Find record for this user and date
      const record = workTimeRecords.find(r => 
        r.user_id === user.id && r.date === dateStr
      );
      
      setSelectedRecord(record || null);
    } else {
      setSelectedRecord(null);
    }
  }, [selectedDate, workTimeRecords, user]);

  // Fetch target hours and calculate completed hours
  useEffect(() => {
    const fetchTargetHours = async () => {
      if (!user) return;
      
      setLoadingTarget(true);
      try {
        // Get current month in YYYY-MM format
        const currentMonth = new Date();
        const period = format(currentMonth, 'yyyy-MM');
        
        // Fetch target hours for all staff for this period
        const targets = await targetHoursService.getTargetHoursByStaffId(user.id);
        setTargetHours(targets?.hours || 200);
        
        // Calculate completed hours for current month
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(currentMonth);
        
        const total = workTimeRecords
          .filter(r => {
            const recordDate = new Date(r.date);
            return (
              recordDate >= monthStart && 
              recordDate <= monthEnd && 
              r.status === 'approved' &&
              r.user_id === user.id
            );
          })
          .reduce((sum, r) => sum + r.hours_worked, 0);
          
        setCompletedHours(total);
      } catch (err) {
        console.error('Error fetching target hours:', err);
        setTargetHours(200); // Default value
      } finally {
        setLoadingTarget(false);
      }
    };
    
    fetchTargetHours();
  }, [user, workTimeRecords]);

  // Format calendar marked dates with hours data
  const getDaysWithHoursData = () => {
    // Return an array of dates instead of an object
    return workTimeRecords
      .filter(record => record.user_id === user.id)
      .map(record => {
        try {
          if (!record.date) return null;
          return new Date(record.date);
        } catch (err) {
          console.error(`Error formatting record date: ${err}`);
          return null;
        }
      })
      .filter(date => date !== null) as Date[];
  };

  // Get hours for a specific date
  const getHoursForDate = (date: Date): number | undefined => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const record = workTimeRecords.find(r => 
      r.user_id === user.id && r.date === dateStr
    );
    return record?.hours_worked;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !hours || !location) return;

    const hoursNum = parseFloat(hours);
    if (isNaN(hoursNum)) return;

    await onHourSubmission(selectedDate, hoursNum, location, description);
    
    // Clear form
    setHours("");
    setLocation("");
    setDescription("");
  };

  // Get today's records
  const todayRecords = workTimeRecords.filter(record => {
    const recordDate = new Date(record.date);
    const today = new Date();
    return recordDate.getDate() === today.getDate() &&
           recordDate.getMonth() === today.getMonth() &&
           recordDate.getFullYear() === today.getFullYear() &&
           record.user_id === user.id;
  });

  const totalHoursToday = todayRecords.reduce((total, record) => total + record.hours_worked, 0);
  
  const disableDaysWithoutRecords = (date: Date) => {
    // Always allow today
    const today = new Date();
    const isToday = date.getDate() === today.getDate() &&
                   date.getMonth() === today.getMonth() &&
                   date.getFullYear() === today.getFullYear();
    
    if (isToday) return false;
    
    // Check if there's a record for this date
    const dateStr = format(date, 'yyyy-MM-dd');
    const hasRecord = workTimeRecords.some(r => 
      r.user_id === user.id && r.date === dateStr
    );
    
    // Allow dates with records, disable dates without records
    return !hasRecord;
  };

  return (
    <div className="space-y-6">
      {/* Mobile Progress Bar for Hours Target - Only visible on mobile */}
      <div className="show-on-mobile mobile-full-width mobile-pb">
        <h2 className="text-xl font-bold text-primary mb-2">Monthly Progress</h2>
        <div className="p-4 bg-white rounded-lg shadow-sm">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-600">Completed Hours</span>
            <span className="text-sm font-medium">{completedHours} / {targetHours || "---"}</span>
          </div>
          <Progress 
            value={targetHours ? (completedHours / targetHours) * 100 : 0} 
            className="h-3 bg-primary/10"
          />
          <div className="mt-2 text-xs text-right text-gray-500">
            {targetHours && `${Math.round((completedHours / targetHours) * 100)}% completed`}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Calendar Column */}
        <div className="lg:w-1/2 w-full">
          <h2 className="text-xl font-bold text-primary mb-4">Work Calendar</h2>
          <div className="hours-calendar bg-white p-4 rounded-lg shadow-sm">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={date => date > new Date()}
              className="border-none"
              modifiers={{
                dayWithHours: getDaysWithHoursData(),
              }}
              modifiersClassNames={{
                dayWithHours: "day-with-hours",
              }}
              components={{
                DayContent: ({ date }) => (
                  <div className="day-content-wrapper">
                    <div>{getDate(date)}</div>
                    {getHoursForDate(date) !== undefined && (
                      <div className="hours-indicator">
                        {getHoursForDate(date)}h
                      </div>
                    )}
                  </div>
                ),
              }}
            />
          </div>
          
          {/* Desktop Progress Bar - Hidden on mobile */}
          <div className="mt-6 bg-white p-4 rounded-lg shadow-sm hide-on-mobile">
            <h3 className="text-lg font-semibold mb-2">Monthly Target</h3>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Completed Hours</span>
              <span className="text-sm font-medium">{completedHours} / {targetHours || "---"}</span>
            </div>
            <Progress 
              value={targetHours ? (completedHours / targetHours) * 100 : 0} 
              className="h-2"
            />
          </div>
        </div>
        
        {/* Hours Entry and Details Column */}
        <div className="lg:w-1/2 w-full">
          {selectedRecord ? (
            <div className="record-details-view">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-primary">Record Details</h2>
                <Button
                  variant="outline"
                  onClick={() => setSelectedRecord(null)}
                  className="text-sm"
                >
                  Add New Hours
                </Button>
              </div>
              <RecordDetailsView record={selectedRecord} />
            </div>
          ) : (
            <div className="hours-entry-form">
              <h2 className="text-xl font-bold text-primary mb-4">Log Your Hours</h2>
              <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded-lg shadow-sm">
                {/* Date Display */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Selected Date
                  </label>
                  <div className="flex items-center h-10 px-3 border rounded-md bg-gray-50">
                    {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Please select a date'}
                  </div>
                </div>

                {/* Hours Input */}
                <div>
                  <label htmlFor="hours" className="block text-sm font-medium text-gray-700 mb-1">
                    Hours Worked
                  </label>
                  <Input
                    id="hours"
                    type="number"
                    min="0"
                    max="24"
                    step="0.5"
                    placeholder="Enter hours worked"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>

                {/* Location Input */}
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <Input
                    id="location"
                    placeholder="Enter work location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>

                {/* Description Textarea */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <Textarea
                    id="description"
                    placeholder="Describe your work"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full min-h-[80px]"
                  />
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full mt-4"
                  disabled={isSubmitting || !selectedDate || !hours || !location}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Hours'
                  )}
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
