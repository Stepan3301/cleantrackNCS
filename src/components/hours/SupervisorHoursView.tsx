import { useState, useEffect } from "react";
import { User } from "@/contexts/auth-context";
import { WorkTimeRecord } from "@/lib/services/work-time-service";
import { dateUtils } from "@/lib/utils/date";
import ModernCalendar from "@/components/ui/modern-calendar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface SupervisorHoursViewProps {
  user: User;
  users: User[];
  workTimeRecords: WorkTimeRecord[];
  onHourSubmission: (userId: string, date: Date, hours: number, location: string, description?: string) => Promise<void>;
  isSubmitting: boolean;
}

export const SupervisorHoursView = ({
  user,
  users,
  workTimeRecords,
  onHourSubmission,
  isSubmitting
}: SupervisorHoursViewProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");
  const [hours, setHours] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  // Filter staff members that this supervisor manages
  const supervisedStaff = users.filter(u => u.supervisor_id === user.id);

  // Format records for the selected staff member
  const staffRecords = workTimeRecords.filter(record => record.user_id === selectedStaffId);
  const formattedMarkedDates = staffRecords.reduce((acc, record) => {
    if (!record.date) return acc;
    
    const dateStr = record.date;
    if (!acc[dateStr]) {
      acc[dateStr] = {
        hours: record.hours_worked,
        location: record.location,
        description: record.description
      };
    } else {
      // If multiple records for the same date, sum the hours
      acc[dateStr].hours = (acc[dateStr].hours || 0) + (record.hours_worked || 0);
    }
    
    return acc;
  }, {} as Record<string, {hours?: number, location?: string, description?: string}>);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !hours || !location || !selectedStaffId) return;

    const hoursNum = parseFloat(hours);
    if (isNaN(hoursNum)) return;

    await onHourSubmission(selectedStaffId, selectedDate, hoursNum, location, description);
    
    // Clear form
    setHours("");
    setLocation("");
    setDescription("");
  };

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    // Only allow selection of current day
    if (dateUtils.isSameDay(date, new Date())) {
      setSelectedDate(date);
    }
  };

  // Get today's records for the selected staff member
  const todayRecords = workTimeRecords.filter(record => {
    if (record.user_id !== selectedStaffId) return false;
    return dateUtils.isSameDay(record.date, new Date());
  });

  const totalHoursToday = todayRecords.reduce((total, record) => total + record.hours_worked, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Submit Hours Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-4">Submit Hours for Staff</h3>
            <div className="text-sm text-muted-foreground mb-4">
              Note: You can submit supervisor hours records for your staff. These records are independent from staff's self-submitted records. 
              Staff members will still be able to create their own records for the same day.
            </div>
            <div>
              <label htmlFor="staff-member" className="text-sm font-medium mb-2 block">
                Staff Member
              </label>
              <Select
                name="staff-member"
                value={selectedStaffId}
                onValueChange={setSelectedStaffId}
              >
                <SelectTrigger aria-label="Select staff member">
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  {supervisedStaff.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedStaffId === "" && (
                <p className="text-sm text-destructive mt-1">Please select a staff member</p>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Date
            </label>
            <div className="flex justify-center">
              <ModernCalendar
                selectedDate={selectedDate}
                onSelectDate={handleDateSelect}
                markedDates={formattedMarkedDates}
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <label htmlFor="hours" className="text-sm font-medium mb-2 block">
                Hours Worked
              </label>
              <Input
                id="hours"
                type="number"
                placeholder="Hours worked"
                value={hours}
                onChange={(e) => {
                  const value = e.target.value;
                  const numValue = parseFloat(value);
                  if (value === "" || (!isNaN(numValue) && numValue >= 0 && numValue <= 24)) {
                    setHours(value);
                  }
                }}
                min="0"
                max="24"
                step="0.5"
                required
              />
              {hours !== "" && (parseFloat(hours) < 0 || parseFloat(hours) > 24) && (
                <p className="text-sm text-destructive mt-1">Hours must be between 0 and 24</p>
              )}
            </div>

            <div>
              <label htmlFor="location" className="text-sm font-medium mb-2 block">
                Location
              </label>
              <Input
                id="location"
                type="text"
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
              {location === "" && (
                <p className="text-sm text-destructive mt-1">Location is required</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="text-sm font-medium mb-2 block">
                Description (Optional)
              </label>
              <Textarea
                id="description"
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting || !selectedDate || !hours || !location || !selectedStaffId}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Hours"
            )}
          </Button>
        </form>

        {/* Today's Hours Summary */}
        <div>
          <h3 className="text-lg font-medium mb-4">Today's Supervisor Records</h3>
          <div className="text-sm text-muted-foreground mb-4">
            These are the hours you've submitted as a supervisor, not the staff member's self-submitted hours.
          </div>
          {selectedStaffId && (
            <div>
              <h3 className="text-lg font-medium mb-4">
                Today's Hours - {users.find(u => u.id === selectedStaffId)?.name}
              </h3>
              <div className="rounded-lg border p-4">
                <div className="text-2xl font-bold mb-2">{totalHoursToday} hours</div>
                <div className="space-y-2">
                  {todayRecords.map((record, index) => (
                    <div key={index} className="text-sm">
                      <div className="font-medium">{record.location}</div>
                      <div className="text-muted-foreground">
                        {record.hours_worked} hours - {new Date(record.created_at).toLocaleTimeString()}
                      </div>
                      {record.description && (
                        <div className="text-muted-foreground mt-1">{record.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
