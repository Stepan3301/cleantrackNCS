
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const Hours = () => {
  const { user, users } = useAuth()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [hoursWorked, setHoursWorked] = useState(0)
  const [location, setLocation] = useState("")
  const [peopleWorked, setPeopleWorked] = useState(1)
  
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
  
  // Sample hours data (in a real app this would come from an API)
  const hoursData: { [key: number]: { hours: number, confirmed: boolean } } = {
    1: { hours: 8, confirmed: true },
    2: { hours: 7.5, confirmed: true },
    3: { hours: 8, confirmed: true },
    4: { hours: 0, confirmed: false },
    5: { hours: 8, confirmed: false },
    6: { hours: 4, confirmed: true },
    7: { hours: 0, confirmed: false },
    8: { hours: 8, confirmed: true },
    9: { hours: 8, confirmed: true },
    10: { hours: 7, confirmed: false },
    15: { hours: 6, confirmed: true },
  }
  
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

  // Role checks
  const isStaff = user?.role === "staff"
  const isSupervisor = user?.role === "supervisor"
  const isManager = user?.role === "manager"
  const isHeadManagerOrOwner = user?.role === "head_manager" || user?.role === "owner"
  const isSupervisorOrHigher = isSupervisor || isManager || isHeadManagerOrOwner
  
  // Get supervised staff members (for supervisors)
  const supervisedStaff = users.filter(u => u.supervisorId === user?.id && u.role === "staff")
  
  // Get all days in the current month as numbers
  const allDaysInMonth = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  
  // Calculate total hours for a staff member
  const calculateTotalHours = (staffId: string) => {
    // In a real app, you would sum actual hours data
    return Math.floor(Math.random() * 50) + 80 // Random hours between 80-130
  }
  
  // Calculate bonus amount for staff
  const calculateBonus = (currentHours: number, targetHours: number = 100) => {
    if (currentHours <= targetHours) return 0
    
    // 5 AED per hour over target
    return (currentHours - targetHours) * 5
  }
  
  // Staff view for entering hours
  const renderStaffHoursEntry = () => {
    if (!selectedDay) return null
    
    // Only allow editing for today (not past or future)
    const isEditable = isToday(selectedDay)
    const dayData = hoursData[selectedDay] || { hours: 0, confirmed: false }
    const formattedDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      selectedDay
    ).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    
    // Find supervisor name
    const supervisor = users.find(u => u.id === user?.supervisorId)
    const supervisorName = supervisor ? supervisor.name : "Not Assigned"
    
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
                  max={12}
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
              <Button variant="outline">Cancel</Button>
              <Button>Submit Hours</Button>
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
    )
  }
  
  // Supervisor hours view (table of staff hours)
  const renderSupervisorTable = () => {
    return (
      <div className="bg-white p-4 rounded-lg border border-border mt-6 overflow-x-auto">
        <h3 className="text-lg font-medium mb-4">Staff Hours - {monthYearFormat}</h3>
        
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
              {supervisedStaff.map(staff => {
                const totalHours = calculateTotalHours(staff.id)
                const targetHours = 100
                const bonusAmount = calculateBonus(totalHours, targetHours)
                
                return (
                  <TableRow key={staff.id}>
                    <TableCell className="font-medium sticky left-0 bg-white z-10">
                      {staff.name}
                    </TableCell>
                    
                    {allDaysInMonth.map(day => {
                      // Generate random hours for demo
                      const hours = Math.random() > 0.3 ? Math.floor(Math.random() * 5) + 4 : 0
                      
                      return (
                        <TableCell key={day} className="text-center">
                          {hours || "-"}
                        </TableCell>
                      )
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
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  // Calendar view (for staff)
  const renderCalendarView = () => {
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
              const hasHours = day in hoursData
              const isConfirmed = hasHours && hoursData[day].confirmed
              const isSelected = day === selectedDay
              
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
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                        isConfirmed ? "bg-success/20 text-success" : "bg-warning/20 text-warning"
                      }`}>
                        {hoursData[day].hours}h
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }
  
  // Staff dashboard view
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
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Working Hours</h1>
        <div className="text-sm text-muted-foreground">
          {isSupervisorOrHigher ? "Manage Staff Hours" : "Your Hours"}
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
      
      {isSupervisor && renderSupervisorTable()}
      
      {(isManager || isHeadManagerOrOwner) && (
        <Tabs defaultValue="calendar">
          <TabsList>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            <TabsTrigger value="table">Table View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="calendar">
            {renderCalendarView()}
            {renderStaffHoursEntry()}
          </TabsContent>
          
          <TabsContent value="table">
            {renderSupervisorTable()}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

export default Hours
