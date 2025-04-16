
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, AlertTriangle } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"

// Sample hours data by user ID (in a real app this would come from an API)
const mockHoursData = {
  staffHours: {
    // userId: { day: hours }
    "4": { 1: 8, 2: 7.5, 5: 8, 8: 8, 15: 6 },
    "5": { 1: 7, 3: 8, 9: 6, 10: 4 },
    "8": { 2: 8, 6: 7, 12: 8 }
  },
  supervisorHours: {
    // userId: { day: hours }
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
  const { user, users } = useAuth()
  const { toast } = useToast()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [hoursWorked, setHoursWorked] = useState(0)
  const [location, setLocation] = useState("")
  const [peopleWorked, setPeopleWorked] = useState(1)
  const [selectedSupervisor, setSelectedSupervisor] = useState<string | null>(null)
  
  // Get days in current month
  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate()
  
  // Get first day of month (0 = Sunday, 1 = Monday, etc)
  const firstDay = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay()
  
  // Create array of day numbers
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  
  // Create array for empty cells before first day
  const emptyCells = Array.from({ length: firstDay }, (_, i) => i)
  
  // Role checks
  const isStaff = user?.role === "staff"
  const isSupervisor = user?.role === "supervisor"
  const isManager = user?.role === "manager"
  const isHeadManagerOrOwner = user?.role === "head_manager" || user?.role === "owner"
  
  // Navigate to previous month
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
    setSelectedDay(null)
  }
  
  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
    setSelectedDay(null)
  }
  
  // Format month and year
  const monthYearFormat = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  
  // Check if a date is today
  const isToday = (day: number) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    )
  }
  
  // Check if date is in the past
  const isPastDate = (day: number) => {
    const today = new Date()
    const checkDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    )
    return checkDate < new Date(today.setHours(0, 0, 0, 0))
  }
  
  // Check if date is in the future
  const isFutureDate = (day: number) => {
    const today = new Date()
    const checkDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    )
    return checkDate > new Date(today.setHours(23, 59, 59, 999))
  }

  // Get all days in the current month as numbers
  const allDaysInMonth = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  
  // Calculate total hours for a staff member
  const calculateTotalHours = (staffId: string, hoursSource: 'staff' | 'supervisor' = 'staff') => {
    const source = hoursSource === 'staff' ? mockHoursData.staffHours : mockHoursData.supervisorHours;
    const staffHours = source[staffId] || {};
    return Object.values(staffHours).reduce((sum, hours) => sum + hours, 0);
  }
  
  // Calculate bonus amount for staff
  const calculateBonus = (currentHours: number, targetHours: number = 100) => {
    if (currentHours <= targetHours) return 0
    
    // 5 AED per hour over target
    return (currentHours - targetHours) * 5
  }

  // Get supervised staff members (for supervisors)
  const supervisedStaff = users.filter(u => u.supervisorId === user?.id && u.role === "staff")
  
  // Get all supervisors (for head manager/owner view)
  const allSupervisors = users.filter(u => u.role === "supervisor")

  // Get staff members for selected supervisor
  const getStaffForSupervisor = (supervisorId: string) => {
    return users.filter(u => u.supervisorId === supervisorId && u.role === "staff")
  }
  
  // Check if records match between staff and supervisor
  const doRecordsMatch = (staffId: string, day: number) => {
    const staffHours = mockHoursData.staffHours[staffId]?.[day];
    const supervisorHours = mockHoursData.supervisorHours[staffId]?.[day];
    
    if (staffHours === undefined || supervisorHours === undefined) return null;
    
    return staffHours === supervisorHours;
  }
  
  // Get cell color based on record match status
  const getCellColor = (staffId: string, day: number) => {
    const match = doRecordsMatch(staffId, day);
    
    if (match === null) return ""; // No data for comparison
    if (match === true) return "bg-green-100 border-green-400"; // Records match
    return "bg-red-100 border-red-400"; // Records don't match
  }

  // Handle hour submission for staff/supervisor
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

    // Reset form
    setHoursWorked(0);
    setLocation("");
    setPeopleWorked(1);
    setSelectedDay(null);
  }

  // Update hours as manager/owner
  const handleUpdateHours = (staffId: string, day: number, hours: number, type: 'staff' | 'supervisor') => {
    toast({
      title: "Hours updated",
      description: `Updated ${type} hours to ${hours} for ${users.find(u => u.id === staffId)?.name}`
    });
  }

  // Staff view for entering hours
  const renderStaffHoursEntry = () => {
    if (!selectedDay) return null;
    
    // Only allow editing for today (not past or future)
    const isEditable = isToday(selectedDay);
    const formattedDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      selectedDay
    ).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    
    // Find supervisor name
    const supervisor = users.find(u => u.id === user?.supervisorId);
    const supervisorName = supervisor ? supervisor.name : "Not Assigned";
    
    return (
      <div className="bg-white p-6 rounded-lg border border-border mt-6">
        <h3 className="text-lg font-medium mb-4">Hours for {formattedDate}</h3>
        
        {isEditable ? (
          <div>
            <div className="mb-4">
              <div className="text-sm font-medium mb-1">Supervisor</div>
              <div className="text-muted-foreground">{supervisorName}</div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Hours Worked</label>
                <Input 
                  type="number" 
                  value={hoursWorked}
                  onChange={(e) => setHoursWorked(Number(e.target.value))}
                  min={0}
                  max={24}
                  step={0.5}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">People Worked</label>
                <Input 
                  type="number" 
                  value={peopleWorked}
                  onChange={(e) => setPeopleWorked(Number(e.target.value))}
                  min={1}
                  max={20}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <Input 
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter work location"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" onClick={() => setSelectedDay(null)}>Cancel</Button>
              <Button onClick={handleHourSubmission}>Submit Hours</Button>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-secondary/20 rounded-lg">
            <p className="text-center text-muted-foreground">
              {isPastDate(selectedDay) ? 
                "Hours can only be submitted on the day of work." : 
                "You cannot submit hours for future dates."}
            </p>
          </div>
        )}
      </div>
    );
  };
  
  // Calendar view (for staff and supervisor)
  const renderCalendarView = () => {
    // Get the right hours data based on user role
    const userHoursData = isStaff 
      ? mockHoursData.staffHours[user?.id ?? ""] || {}
      : mockHoursData.supervisorHours;
    
    return (
      <div className="bg-white border border-border rounded-lg overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-border">
          <Button variant="ghost" size="icon" onClick={prevMonth}>
            <ChevronLeft size={20} />
          </Button>
          
          <div className="flex items-center">
            <CalendarIcon size={18} className="mr-2 text-primary" />
            <h2 className="font-medium">{monthYearFormat}</h2>
          </div>
          
          <Button variant="ghost" size="icon" onClick={nextMonth}>
            <ChevronRight size={20} />
          </Button>
        </div>
        
        {/* Calendar grid */}
        <div className="p-4">
          {/* Day names */}
          <div className="grid grid-cols-7 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-2">
            {emptyCells.map((_, index) => (
              <div key={`empty-${index}`} className="h-24 rounded-md"></div>
            ))}
            
            {days.map((day) => {
              const hasHours = isStaff 
                ? userHoursData[day] !== undefined
                : (isSupervisor && supervisedStaff.some(staff => 
                    mockHoursData.supervisorHours[staff.id]?.[day] !== undefined
                  ));
              
              const isSelected = day === selectedDay;
              
              return (
                <div 
                  key={`day-${day}`} 
                  className={`h-24 rounded-md border border-border p-2 cursor-pointer transition-colors ${
                    isSelected ? "ring-2 ring-primary" : ""
                  } ${isToday(day) ? "bg-primary/5" : ""} ${
                    isPastDate(day) && !isToday(day) ? "bg-muted/20" : ""
                  } ${isFutureDate(day) ? "bg-muted/10" : ""}`}
                  onClick={() => setSelectedDay(day)}
                >
                  <div className="flex justify-between">
                    <span className={`text-sm font-medium ${isToday(day) ? "text-primary" : ""}`}>
                      {day}
                    </span>
                    {hasHours && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary/20 text-primary">
                        {isStaff ? `${userHoursData[day]}h` : '●'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };
  
  // Supervisor hours table
  const renderSupervisorTable = () => {
    const staffToDisplay = isSupervisor 
      ? supervisedStaff 
      : selectedSupervisor 
        ? getStaffForSupervisor(selectedSupervisor)
        : [];
    
    if (isHeadManagerOrOwner && !selectedSupervisor) {
      return (
        <div className="bg-white p-6 rounded-lg border border-border mt-6 text-center">
          <p className="text-muted-foreground">Please select a supervisor to view their staff records</p>
        </div>
      );
    }
    
    return (
      <div className="bg-white p-4 rounded-lg border border-border mt-6 overflow-x-auto">
        <h3 className="text-lg font-medium mb-4">
          Staff Hours - {monthYearFormat}
          {isHeadManagerOrOwner && selectedSupervisor && (
            <span className="ml-2 text-muted-foreground text-sm">
              Supervisor: {users.find(u => u.id === selectedSupervisor)?.name}
            </span>
          )}
        </h3>
        
        <div className="min-w-max">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-white z-10">Name</TableHead>
                {allDaysInMonth.map(day => (
                  <TableHead key={day} className="text-center min-w-[60px]">{day}</TableHead>
                ))}
                <TableHead className="text-center bg-muted">Current</TableHead>
                <TableHead className="text-center bg-muted">Target</TableHead>
                <TableHead className="text-center bg-muted">Bonus</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffToDisplay.map(staff => {
                const totalHours = calculateTotalHours(staff.id, isSupervisor ? 'supervisor' : 'staff');
                const targetHours = 100;
                const bonusAmount = calculateBonus(totalHours, targetHours);
                
                return (
                  <TableRow key={staff.id}>
                    <TableCell className="font-medium sticky left-0 bg-white z-10">
                      {staff.name}
                    </TableCell>
                    
                    {allDaysInMonth.map(day => {
                      // Get staff hours from mock data
                      const dataSource = isSupervisor ? mockHoursData.supervisorHours : mockHoursData.staffHours;
                      const hours = dataSource[staff.id]?.[day] || null;
                      const cellColorClass = isHeadManagerOrOwner ? getCellColor(staff.id, day) : "";
                      
                      return (
                        <TableCell 
                          key={day} 
                          className={`text-center ${cellColorClass}`}
                        >
                          {isHeadManagerOrOwner ? (
                            <Input
                              type="number"
                              value={hours || ""}
                              onChange={(e) => {
                                const newValue = e.target.value ? Number(e.target.value) : null;
                                if (newValue !== null) {
                                  handleUpdateHours(staff.id, day, newValue, isSupervisor ? 'supervisor' : 'staff');
                                }
                              }}
                              className="h-8 w-16 text-center"
                              min={0}
                              max={24}
                              step={0.5}
                              placeholder="-"
                            />
                          ) : (
                            hours || "-"
                          )}
                        </TableCell>
                      );
                    })}
                    
                    <TableCell className="text-center font-medium bg-muted/50">
                      {totalHours}
                    </TableCell>
                    <TableCell className="text-center bg-muted/50">
                      {targetHours}
                    </TableCell>
                    <TableCell className={`text-center font-medium ${bonusAmount > 0 ? 'text-success' : ''} bg-muted/50`}>
                      {bonusAmount > 0 ? `AED ${bonusAmount}` : '-'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  // Dashboard stats for staff
  const renderStaffDashboard = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-lg border border-border p-6">
          <h3 className="text-lg font-medium mb-3">Monthly Summary</h3>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Total Hours</div>
              <div className="text-3xl font-bold">65</div>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: "65%" }}></div>
            </div>
            <div className="text-xs text-muted-foreground">
              65% of monthly target (100 hours)
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-border p-6">
          <h3 className="text-lg font-medium mb-3">Bonus Progress</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <div className="text-sm text-muted-foreground">Current Progress</div>
              <div className="text-sm font-medium">AED 0</div>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-muted" style={{ width: "0%" }}></div>
            </div>
            <div className="text-xs text-muted-foreground">
              Bonus starts accruing after target hours (100) are reached
            </div>
            <div className="text-xs text-muted-foreground">
              Earn AED 5 for each hour worked beyond target
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Head Manager/Owner supervisor selector
  const renderSupervisorSelector = () => {
    if (!isHeadManagerOrOwner) return null;

    return (
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
    );
  };

  // Mismatch notifications
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
            const supervisor = users.find(u => u.id === notification.supervisorId);
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

  // Main hours page components
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Working Hours</h1>
        <div className="text-sm text-muted-foreground">
          {isSupervisor ? "Manage Staff Hours" : isStaff ? "Your Hours" : "Hours Management"}
        </div>
      </div>
      
      {/* Different views based on role */}
      {isStaff && (
        <>
          {renderCalendarView()}
          {renderStaffHoursEntry()}
          {!selectedDay && renderStaffDashboard()}
        </>
      )}
      
      {isSupervisor && (
        <>
          {renderCalendarView()}
          {renderSupervisorTable()}
        </>
      )}
      
      {(isManager || isHeadManagerOrOwner) && (
        <>
          {renderSupervisorSelector()}
          {renderNotifications()}
          <Tabs defaultValue={isHeadManagerOrOwner ? "table" : "calendar"}>
            <TabsList>
              <TabsTrigger value="calendar">Calendar View</TabsTrigger>
              <TabsTrigger value="table">Table View</TabsTrigger>
            </TabsList>
            
            <TabsContent value="calendar">
              {renderCalendarView()}
            </TabsContent>
            
            <TabsContent value="table">
              {renderSupervisorTable()}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}

export default Hours
