
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Calendar, 
  Clock, 
  CheckCircle, 
  User, 
  MapPin,
  Filter
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

// Sample task data
const mockTasks = [
  { 
    id: 1, 
    title: "Dubai Marina Residence", 
    description: "Regular cleaning service for apartment 1204",
    date: "2025-04-17", 
    time: "09:00 - 12:00",
    location: "Dubai Marina, Building 7, Apt 1204",
    assigned: ["4", "8"],  // Staff IDs
    supervisor: "3",       // Supervisor ID
    status: "scheduled"
  },
  { 
    id: 2, 
    title: "Business Bay Office", 
    description: "Weekly office cleaning including carpets and kitchen area",
    date: "2025-04-16", 
    time: "18:00 - 22:00",
    location: "Business Bay, Aspect Tower, Floor 12",
    assigned: ["2", "5"],
    supervisor: "3", 
    status: "scheduled"
  },
  { 
    id: 3, 
    title: "JBR Apartment Complex", 
    description: "Deep cleaning service for new tenant move-in",
    date: "2025-04-15", 
    time: "14:00 - 20:00",
    location: "Jumeirah Beach Residence, Sadaf 6, Apt 1102",
    assigned: ["4"], 
    supervisor: "3",
    status: "in-progress"
  },
  { 
    id: 4, 
    title: "Palm Jumeirah Villa", 
    description: "Monthly maintenance cleaning including pool area",
    date: "2025-04-14", 
    time: "09:00 - 17:00",
    location: "Palm Jumeirah, Frond D, Villa 24",
    assigned: ["2", "4", "5"],
    supervisor: "3", 
    status: "completed"
  },
  { 
    id: 5, 
    title: "Downtown Apartment", 
    description: "Post-construction cleaning service",
    date: "2025-04-13", 
    time: "10:00 - 18:00",
    location: "Downtown Dubai, Burj Residence, Apt 2203",
    assigned: ["8"],
    supervisor: "3", 
    status: "completed"
  },
]

const Tasks = () => {
  const { user, users } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  
  // Determine which tasks to show based on user role
  const getVisibleTasks = () => {
    let filteredTasks = [...mockTasks]
    
    // Filter by user role
    if (user?.role === "supervisor") {
      // Supervisors see tasks assigned to them
      filteredTasks = filteredTasks.filter(task => task.supervisor === user.id)
    } else if (user?.role === "staff") {
      // Staff see tasks they are assigned to
      filteredTasks = filteredTasks.filter(task => 
        task.assigned.includes(user.id)
      )
    }
    // Managers, head managers and owners see all tasks
    
    // Apply search filter
    if (searchQuery) {
      filteredTasks = filteredTasks.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    // Apply status filter
    if (statusFilter) {
      filteredTasks = filteredTasks.filter(task => 
        task.status === statusFilter
      )
    }
    
    return filteredTasks
  }
  
  // Format date to readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }
  
  // Check if task is today
  const isToday = (dateString: string) => {
    const today = new Date()
    const taskDate = new Date(dateString)
    return (
      today.getDate() === taskDate.getDate() &&
      today.getMonth() === taskDate.getMonth() &&
      today.getFullYear() === taskDate.getFullYear()
    )
  }
  
  // Get staff names from IDs
  const getStaffNames = (staffIds: string[]) => {
    return staffIds.map(id => {
      const staff = users.find(user => user.id === id)
      return staff ? staff.name : "Unknown"
    }).join(", ")
  }
  
  // Get supervisor name
  const getSupervisorName = (supervisorId: string) => {
    const supervisor = users.find(user => user.id === supervisorId)
    return supervisor ? supervisor.name : "Not assigned"
  }
  
  const tasks = getVisibleTasks()
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Tasks</h1>
        
        {/* Only managers and up can create tasks */}
        {(user?.role === "manager" || user?.role === "head_manager" || user?.role === "owner") && (
          <Button>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Create New Task
          </Button>
        )}
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative grow max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search tasks..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Status:</span>
          <Button 
            variant={statusFilter === null ? "secondary" : "outline"} 
            size="sm"
            onClick={() => setStatusFilter(null)}
          >
            All
          </Button>
          <Button 
            variant={statusFilter === "scheduled" ? "secondary" : "outline"} 
            size="sm"
            onClick={() => setStatusFilter("scheduled")}
          >
            Scheduled
          </Button>
          <Button 
            variant={statusFilter === "in-progress" ? "secondary" : "outline"} 
            size="sm"
            onClick={() => setStatusFilter("in-progress")}
          >
            In Progress
          </Button>
          <Button 
            variant={statusFilter === "completed" ? "secondary" : "outline"} 
            size="sm"
            onClick={() => setStatusFilter("completed")}
          >
            Completed
          </Button>
        </div>
      </div>
      
      {/* Tasks List */}
      <div className="space-y-4">
        {tasks.map(task => (
          <div key={task.id} className="bg-white rounded-lg border border-border overflow-hidden hover:shadow-md transition-shadow">
            <div className="flex flex-wrap md:flex-nowrap">
              {/* Date column */}
              <div className={`w-full md:w-24 p-4 md:p-6 flex items-center justify-center md:border-r border-border ${
                isToday(task.date) ? "bg-primary/10" : "bg-secondary/20"
              }`}>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">
                    {formatDate(task.date)}
                  </div>
                  <div className="text-lg font-medium mt-1">
                    {task.time.split(' - ')[0]}
                  </div>
                  {isToday(task.date) && (
                    <span className="inline-block px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full mt-2">Today</span>
                  )}
                </div>
              </div>
              
              {/* Main content */}
              <div className="flex-1 p-4">
                <div className="flex flex-wrap md:flex-nowrap gap-4 justify-between">
                  <div className="w-full md:max-w-md">
                    <h3 className="text-lg font-medium">
                      {task.title}
                      <span className={`ml-2 inline-block px-2 py-0.5 text-xs rounded-full ${
                        task.status === "completed" 
                          ? "bg-success/20 text-success" 
                          : task.status === "in-progress"
                          ? "bg-warning/20 text-warning"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {task.status === "scheduled" ? "Scheduled" : 
                         task.status === "in-progress" ? "In Progress" : "Completed"}
                      </span>
                    </h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      {task.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-y-2 gap-x-4 mt-3">
                      <div className="flex items-center text-sm">
                        <Clock size={14} className="mr-1 text-muted-foreground" />
                        <span>{task.time}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <MapPin size={14} className="mr-1 text-muted-foreground" />
                        <span className="truncate max-w-[200px]">{task.location}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full md:w-auto">
                    <div className="text-sm text-muted-foreground mb-1">Supervisor</div>
                    <div className="flex items-center">
                      <User size={14} className="mr-1" />
                      <span>{getSupervisorName(task.supervisor)}</span>
                    </div>
                    
                    <div className="text-sm text-muted-foreground mt-3 mb-1">Staff Assigned</div>
                    <div>{getStaffNames(task.assigned)}</div>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="w-full md:w-48 p-4 border-t md:border-t-0 md:border-l border-border bg-secondary/10 flex md:flex-col justify-between md:justify-center items-center">
                <div className="text-center md:mb-4">
                  {task.status === "completed" ? (
                    <div className="flex items-center text-success">
                      <CheckCircle size={18} className="mr-1" />
                      <span>Completed</span>
                    </div>
                  ) : (
                    <div className="text-sm">
                      {task.status === "in-progress" 
                        ? "Started " + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                        : "Starts " + task.time.split(" - ")[0]}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Button 
                    size="sm" 
                    variant={task.status === "completed" ? "outline" : "default"}
                    disabled={task.status === "completed"}
                  >
                    {task.status === "completed" ? "View Details" : "Start Task"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Empty state */}
        {tasks.length === 0 && (
          <div className="bg-white rounded-lg border border-border p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/50 flex items-center justify-center">
              <Calendar size={24} className="text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No tasks found</h3>
            <p className="text-muted-foreground">
              {searchQuery || statusFilter 
                ? "Try adjusting your search or filters"
                : "No tasks have been assigned yet"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Tasks
