
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from "lucide-react"

const Hours = () => {
  const { user } = useAuth()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  
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
  
  const isSupervisorOrHigher = ["owner", "head_manager", "manager", "supervisor"].includes(user?.role || "")
  
  // Render the hours entry form for staff or supervisor
  const renderHoursEntry = () => {
    if (!selectedDay) return null
    
    const dayData = hoursData[selectedDay] || { hours: 0, confirmed: false }
    const formattedDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      selectedDay
    ).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    
    return (
      <div className="bg-white p-6 rounded-lg border border-border mt-6">
        <h3 className="text-lg font-medium mb-4">Hours for {formattedDate}</h3>
        
        {isSupervisorOrHigher ? (
          // Supervisor view for entering staff hours
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Select Staff Member</label>
                  <select className="w-full rounded-md border-input bg-transparent p-2 border">
                    <option>Ahmed Mohammed</option>
                    <option>Sarah Khan</option>
                    <option>Fatima Ali</option>
                    <option>Omar Hussein</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <select className="w-full rounded-md border-input bg-transparent p-2 border">
                    <option>Dubai Marina Residence</option>
                    <option>Business Bay Office</option>
                    <option>JBR Apartment Complex</option>
                    <option>Downtown Apartment</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Hours Worked</label>
                  <div className="flex items-center">
                    <input 
                      type="number" 
                      className="w-full rounded-md border-input bg-transparent p-2 border"
                      defaultValue={dayData.hours}
                      min={0}
                      max={12}
                      step={0.5}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select className="w-full rounded-md border-input bg-transparent p-2 border">
                    <option value="completed">Completed</option>
                    <option value="partial">Partial</option>
                    <option value="absent">Absent</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea 
                className="w-full rounded-md border-input bg-transparent p-2 border min-h-[100px]"
                placeholder="Enter any notes about this work day..."
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline">Cancel</Button>
              <Button>Confirm Hours</Button>
            </div>
          </div>
        ) : (
          // Staff view for viewing their hours
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Your Submitted Hours</h4>
                <div className="flex items-center">
                  <Clock className="mr-2 text-muted-foreground" size={18} />
                  <span className="text-2xl font-bold">{dayData.hours || 0}</span>
                  <span className="ml-1 text-muted-foreground">hrs</span>
                </div>
                <div className="mt-1 text-xs">
                  {dayData.confirmed ? (
                    <span className="text-success">✓ Confirmed by supervisor</span>
                  ) : (
                    <span className="text-warning">Pending supervisor confirmation</span>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Location</h4>
                <p className="font-medium">Dubai Marina Residence</p>
                <p className="text-xs text-muted-foreground mt-1">Regular Cleaning</p>
              </div>
            </div>
            
            <div className="bg-secondary/30 p-4 rounded-lg">
              <h4 className="text-sm font-medium mb-1">Notes</h4>
              <p className="text-sm text-muted-foreground">Completed all assigned tasks. Additional bathroom cleaning requested by client.</p>
            </div>
            
            <div className="mt-6">
              <Button disabled={dayData.confirmed}>
                {dayData.confirmed ? "Hours Confirmed" : "Update Hours"}
              </Button>
            </div>
          </div>
        )}
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
                  } ${isToday(day) ? "bg-primary/5" : ""}`}
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
      
      {/* Hours entry form */}
      {renderHoursEntry()}
      
      {/* Monthly summary (only show if no day is selected) */}
      {!selectedDay && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
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
            <h3 className="text-lg font-medium mb-3">Status</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-success">12</div>
                <div className="text-xs text-muted-foreground">Confirmed Days</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-warning">3</div>
                <div className="text-xs text-muted-foreground">Pending Days</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-muted-foreground">2</div>
                <div className="text-xs text-muted-foreground">Days Off</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-border p-6">
            <h3 className="text-lg font-medium mb-3">Bonus Progress</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <div className="text-sm text-muted-foreground">Current Progress</div>
                <div className="text-sm font-medium">AED 350</div>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-success" style={{ width: "70%" }}></div>
              </div>
              <div className="text-xs text-muted-foreground">
                70% of max bonus (AED 500)
              </div>
              <div className="text-xs text-success">
                +15% compared to last month
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Hours
