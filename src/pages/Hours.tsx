
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HoursCalendar } from "@/components/hours/HoursCalendar";
import { HoursEntryForm } from "@/components/hours/HoursEntryForm";
import { StaffDashboard } from "@/components/hours/StaffDashboard";
import { HoursTable } from "@/components/hours/HoursTable";
import { HoursData } from "@/types/hours";

// Sample hours data
const mockHoursData: HoursData = {
  staffHours: {
    "4": { 1: 8, 2: 7.5, 5: 8, 8: 8, 15: 6 },
    "5": { 1: 7, 3: 8, 9: 6, 10: 4 },
    "8": { 2: 8, 6: 7, 12: 8 }
  },
  supervisorHours: {
    "4": { 1: 8, 2: 7, 5: 8, 8: 8, 15: 6 },
    "5": { 1: 7, 3: 7.5, 9: 6, 10: 4 },
    "8": { 2: 7.5, 6: 7, 12: 8 }
  },
  notifications: [
    { day: 2, staffId: "4", supervisorId: "3", staffHours: 7.5, supervisorHours: 7 },
    { day: 3, staffId: "5", supervisorId: "3", staffHours: 8, supervisorHours: 7.5 }
  ]
};

const Hours = () => {
  const { user, users } = useAuth();
  const { toast } = useToast();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [hoursWorked, setHoursWorked] = useState(0);
  const [location, setLocation] = useState("");
  const [peopleWorked, setPeopleWorked] = useState(1);
  const [selectedSupervisor, setSelectedSupervisor] = useState<string | null>(null);

  // Role checks
  const isStaff = user?.role === "staff";
  const isSupervisor = user?.role === "supervisor";
  const isManager = user?.role === "manager";
  const isHeadManagerOrOwner = user?.role === "head_manager" || user?.role === "owner";

  // Get all days in current month
  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();
  
  const allDaysInMonth = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Get supervised staff members (for supervisors)
  const supervisedStaff = users.filter(u => u.supervisorId === user?.id && u.role === "staff");
  
  // Get all supervisors (for head manager/owner view)
  const allSupervisors = users.filter(u => u.role === "supervisor");

  // Get staff for selected supervisor
  const getStaffForSupervisor = (supervisorId: string) => {
    return users.filter(u => u.supervisorId === supervisorId && u.role === "staff");
  };

  // Calculate total hours for a staff member
  const calculateTotalHours = (staffId: string) => {
    const source = isSupervisor ? mockHoursData.supervisorHours : mockHoursData.staffHours;
    const staffHours = source[staffId] || {};
    return Object.values(staffHours).reduce((sum, hours) => sum + Number(hours), 0);
  };

  // Check if records match between staff and supervisor
  const getCellColor = (staffId: string, day: number) => {
    const staffHours = mockHoursData.staffHours[staffId]?.[day];
    const supervisorHours = mockHoursData.supervisorHours[staffId]?.[day];
    
    if (staffHours === undefined || supervisorHours === undefined) return "";
    return staffHours === supervisorHours ? "bg-green-100 border-green-400" : "bg-red-100 border-red-400";
  };

  // Handle hour submission
  const handleHourSubmission = () => {
    if (hoursWorked < 0 || hoursWorked > 24) {
      toast({
        title: "Invalid hours",
        description: "Please enter a value between 0 and 24",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Hours submitted",
      description: `You have submitted ${hoursWorked} hours for ${new Date(currentMonth.getFullYear(), currentMonth.getMonth(), selectedDay || 1).toLocaleDateString()}`
    });

    setHoursWorked(0);
    setLocation("");
    setPeopleWorked(1);
    setSelectedDay(null);
  };

  // Update hours as manager/owner
  const handleUpdateHours = (staffId: string, day: number, hours: number | null) => {
    if (hours !== null) {
      toast({
        title: "Hours updated",
        description: `Updated hours to ${hours} for ${users.find(u => u.id === staffId)?.name}`
      });
    }
  };

  // Render notifications
  const renderNotifications = () => {
    if (!isHeadManagerOrOwner || mockHoursData.notifications.length === 0) return null;

    return (
      <div className="bg-white p-4 rounded-lg border border-border mt-6">
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <AlertTriangle size={18} className="text-warning mr-2" />
          Hours Discrepancies
        </h3>

        <div className="space-y-3">
          {mockHoursData.notifications.map((notification, index) => {
            const staff = users.find(u => u.id === notification.staffId);
            return (
              <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-md border border-red-200">
                <div>
                  <p className="font-medium">{staff?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Day {notification.day}: Staff reported {notification.staffHours}h, Supervisor reported {notification.supervisorHours}h
                  </p>
                </div>
                <Button size="sm" variant="outline">Resolve</Button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Find supervisor name for staff view
  const supervisor = users.find(u => u.id === user?.supervisorId);
  const supervisorName = supervisor ? supervisor.name : "Not Assigned";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Working Hours</h1>
        <div className="text-sm text-muted-foreground">
          {isSupervisor ? "Manage Staff Hours" : isStaff ? "Your Hours" : "Hours Management"}
        </div>
      </div>
      
      {isStaff && (
        <>
          <HoursCalendar
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
            selectedDay={selectedDay}
            onDaySelect={setSelectedDay}
            hoursData={mockHoursData.staffHours[user?.id || ""] || {}}
            isStaff={true}
            isSupervisor={false}
          />
          <HoursEntryForm
            selectedDay={selectedDay}
            currentMonth={currentMonth}
            hoursWorked={hoursWorked}
            setHoursWorked={setHoursWorked}
            location={location}
            setLocation={setLocation}
            peopleWorked={peopleWorked}
            setPeopleWorked={setPeopleWorked}
            supervisorName={supervisorName}
            onSubmit={handleHourSubmission}
            onCancel={() => setSelectedDay(null)}
          />
          {!selectedDay && <StaffDashboard />}
        </>
      )}
      
      {isSupervisor && (
        <>
          <HoursCalendar
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
            selectedDay={selectedDay}
            onDaySelect={setSelectedDay}
            hoursData={mockHoursData.supervisorHours}
            isStaff={false}
            isSupervisor={true}
            supervisedStaff={supervisedStaff}
          />
          <div className="bg-white p-4 rounded-lg border border-border mt-6">
            <HoursTable
              staffList={supervisedStaff}
              allDaysInMonth={allDaysInMonth}
              hoursData={mockHoursData.supervisorHours}
              isHeadManagerOrOwner={isHeadManagerOrOwner}
              isSupervisor={true}
              handleUpdateHours={handleUpdateHours}
              calculateTotalHours={calculateTotalHours}
              getCellColor={getCellColor}
            />
          </div>
        </>
      )}
      
      {(isManager || isHeadManagerOrOwner) && (
        <>
          {isHeadManagerOrOwner && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Select Supervisor</label>
              <Select
                value={selectedSupervisor || ""}
                onValueChange={(value) => setSelectedSupervisor(value || null)}
              >
                <SelectTrigger className="w-full md:w-72">
                  <SelectValue placeholder="Select a supervisor" />
                </SelectTrigger>
                <SelectContent>
                  {allSupervisors.map(supervisor => (
                    <SelectItem key={supervisor.id} value={supervisor.id}>
                      {supervisor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {renderNotifications()}
          
          <Tabs defaultValue={isHeadManagerOrOwner ? "table" : "calendar"}>
            <TabsList>
              <TabsTrigger value="calendar">Calendar View</TabsTrigger>
              <TabsTrigger value="table">Table View</TabsTrigger>
            </TabsList>
            
            <TabsContent value="calendar">
              <HoursCalendar
                currentMonth={currentMonth}
                onMonthChange={setCurrentMonth}
                selectedDay={selectedDay}
                onDaySelect={setSelectedDay}
                hoursData={mockHoursData.supervisorHours}
                isStaff={false}
                isSupervisor={false}
              />
            </TabsContent>
            
            <TabsContent value="table">
              {selectedSupervisor && (
                <div className="bg-white p-4 rounded-lg border border-border">
                  <HoursTable
                    staffList={getStaffForSupervisor(selectedSupervisor)}
                    allDaysInMonth={allDaysInMonth}
                    hoursData={mockHoursData.supervisorHours}
                    isHeadManagerOrOwner={isHeadManagerOrOwner}
                    isSupervisor={false}
                    handleUpdateHours={handleUpdateHours}
                    calculateTotalHours={calculateTotalHours}
                    getCellColor={getCellColor}
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default Hours;
