
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Filter, 
  UserPlus, 
  MoreHorizontal,
  Star,
  Phone,
  Mail,
  Calendar,
  Clock
} from "lucide-react"

// Sample employee data
const employees = [
  { 
    id: 1, 
    name: "Ahmed Mahmoud", 
    role: "supervisor", 
    email: "ahmed@sparkle.ae", 
    phone: "+971 50 123 4567", 
    joinDate: "2021-06-15",
    target: 160,
    current: 142,
    photo: "https://i.pravatar.cc/300?img=1"
  },
  { 
    id: 2, 
    name: "Fatima Al Zahra", 
    role: "staff", 
    email: "fatima@sparkle.ae", 
    phone: "+971 50 987 6543", 
    joinDate: "2022-01-10",
    target: 140,
    current: 125,
    photo: "https://i.pravatar.cc/300?img=5"
  },
  { 
    id: 3, 
    name: "Mohammed Ali", 
    role: "supervisor", 
    email: "mohammed@sparkle.ae", 
    phone: "+971 54 456 7890", 
    joinDate: "2020-11-22",
    target: 160,
    current: 160,
    photo: "https://i.pravatar.cc/300?img=3"
  },
  { 
    id: 4, 
    name: "Sarah Khan", 
    role: "staff", 
    email: "sarah@sparkle.ae", 
    phone: "+971 52 345 6789", 
    joinDate: "2022-08-05",
    target: 140,
    current: 115,
    photo: "https://i.pravatar.cc/300?img=10"
  },
  { 
    id: 5, 
    name: "Omar Hussein", 
    role: "staff", 
    email: "omar@sparkle.ae", 
    phone: "+971 55 678 9012", 
    joinDate: "2023-01-15",
    target: 140,
    current: 132,
    photo: "https://i.pravatar.cc/300?img=7"
  },
  { 
    id: 6, 
    name: "Layla Nasser", 
    role: "staff", 
    email: "layla@sparkle.ae", 
    phone: "+971 56 789 0123", 
    joinDate: "2022-11-03",
    target: 140,
    current: 140,
    photo: "https://i.pravatar.cc/300?img=9"
  },
  { 
    id: 7, 
    name: "Khaled Rahman", 
    role: "manager", 
    email: "khaled@sparkle.ae", 
    phone: "+971 58 234 5678", 
    joinDate: "2020-03-02",
    target: 160,
    current: 160,
    photo: "https://i.pravatar.cc/300?img=12"
  },
  { 
    id: 8, 
    name: "Aisha Abdullah", 
    role: "staff", 
    email: "aisha@sparkle.ae", 
    phone: "+971 50 876 5432", 
    joinDate: "2022-05-17",
    target: 140,
    current: 122,
    photo: "https://i.pravatar.cc/300?img=23"
  }
]

const Employees = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null)
  
  // Filter employees based on search query and selected role
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = !selectedRole || employee.role === selectedRole
    
    return matchesSearch && matchesRole
  })
  
  // Calculate progress percentage for employee
  const calculateProgress = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100)
  }
  
  // Format date to a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }
  
  // Calculate months since join date
  const getMonthsSinceJoin = (dateString: string) => {
    const joinDate = new Date(dateString)
    const today = new Date()
    return (today.getFullYear() - joinDate.getFullYear()) * 12 + 
           (today.getMonth() - joinDate.getMonth())
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Employee Database</h1>
        <Button>
          <UserPlus size={16} className="mr-2" />
          Add New Employee
        </Button>
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative grow max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search employees..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filter by:</span>
          <Button 
            variant={selectedRole === null ? "secondary" : "outline"} 
            size="sm"
            onClick={() => setSelectedRole(null)}
          >
            All
          </Button>
          <Button 
            variant={selectedRole === "manager" ? "secondary" : "outline"} 
            size="sm"
            onClick={() => setSelectedRole("manager")}
          >
            Managers
          </Button>
          <Button 
            variant={selectedRole === "supervisor" ? "secondary" : "outline"} 
            size="sm"
            onClick={() => setSelectedRole("supervisor")}
          >
            Supervisors
          </Button>
          <Button 
            variant={selectedRole === "staff" ? "secondary" : "outline"} 
            size="sm"
            onClick={() => setSelectedRole("staff")}
          >
            Staff
          </Button>
        </div>
      </div>
      
      {/* Employee Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredEmployees.map((employee) => (
          <div 
            key={employee.id} 
            className="bg-white rounded-lg border border-border overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedEmployee(employee)}
          >
            <div className="aspect-[4/3] relative bg-secondary/30">
              <img 
                src={employee.photo} 
                alt={employee.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/30 text-white p-3">
                <div className="font-medium">{employee.name}</div>
                <div className="text-sm flex items-center">
                  {employee.role === "manager" && (
                    <div className="flex items-center">
                      <Star size={14} className="mr-1 text-yellow-400" />
                      <span className="capitalize">Manager</span>
                    </div>
                  )}
                  {employee.role === "supervisor" && (
                    <div className="flex items-center">
                      <Star size={14} className="mr-1 text-blue-400" />
                      <span className="capitalize">Supervisor</span>
                    </div>
                  )}
                  {employee.role === "staff" && (
                    <span className="capitalize">Staff</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs text-muted-foreground flex items-center">
                  <Calendar size={12} className="mr-1" />
                  <span>Joined {formatDate(employee.joinDate)}</span>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreHorizontal size={14} />
                </Button>
              </div>
              
              <div className="mb-3">
                <div className="text-sm text-muted-foreground mb-1">Working Hours</div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${
                      calculateProgress(employee.current, employee.target) >= 100 
                        ? "bg-success" 
                        : "bg-primary"
                    }`}
                    style={{ width: `${calculateProgress(employee.current, employee.target)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span>{employee.current} hours</span>
                  <span className="text-muted-foreground">{employee.target} target</span>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground truncate">
                {employee.email}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Empty state */}
      {filteredEmployees.length === 0 && (
        <div className="bg-white rounded-lg border border-border p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/50 flex items-center justify-center">
            <Search size={24} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No employees found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filter to find what you're looking for.
          </p>
        </div>
      )}
      
      {/* Employee Detail Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="relative h-48 bg-primary">
              <button 
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 rounded-full p-2 text-white transition-colors"
                onClick={() => setSelectedEmployee(null)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18"/><path d="M6 6L18 18"/></svg>
              </button>
              <div className="absolute -bottom-16 left-6 w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-secondary">
                <img 
                  src={selectedEmployee.photo} 
                  alt={selectedEmployee.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <div className="pt-20 px-6 pb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">{selectedEmployee.name}</h2>
                  <div className="flex items-center">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium capitalize ${
                      selectedEmployee.role === "manager" 
                        ? "bg-yellow-100 text-yellow-800" 
                        : selectedEmployee.role === "supervisor"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {selectedEmployee.role}
                    </span>
                    <span className="mx-2 text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">
                      {getMonthsSinceJoin(selectedEmployee.joinDate)} months at company
                    </span>
                  </div>
                </div>
                
                <div className="space-x-2">
                  <Button variant="outline" size="sm">Edit</Button>
                  <Button variant="destructive" size="sm">Deactivate</Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div>
                  <h3 className="text-lg font-medium mb-4">Contact Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Mail size={16} className="mr-2 text-muted-foreground" />
                      <span>{selectedEmployee.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone size={16} className="mr-2 text-muted-foreground" />
                      <span>{selectedEmployee.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-2 text-muted-foreground" />
                      <span>Started on {formatDate(selectedEmployee.joinDate)}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-medium mb-4 mt-6">Performance Metrics</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Working Hours</span>
                        <span className="text-sm font-medium">
                          {selectedEmployee.current}/{selectedEmployee.target} hours
                        </span>
                      </div>
                      <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            calculateProgress(selectedEmployee.current, selectedEmployee.target) >= 100 
                              ? "bg-success" 
                              : "bg-primary"
                          }`}
                          style={{ width: `${calculateProgress(selectedEmployee.current, selectedEmployee.target)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Client Satisfaction</span>
                        <span className="text-sm font-medium">92%</span>
                      </div>
                      <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-success" style={{ width: "92%" }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Task Completion</span>
                        <span className="text-sm font-medium">88%</span>
                      </div>
                      <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: "88%" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 pb-3 border-b border-border">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary/10 text-primary">
                        <Clock size={16} />
                      </div>
                      <div>
                        <p className="font-medium">Hours Logged</p>
                        <p className="text-sm text-muted-foreground">8 hours at Dubai Marina Residence</p>
                        <p className="text-xs text-muted-foreground mt-1">Today</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 pb-3 border-b border-border">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-success/10 text-success">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                      </div>
                      <div>
                        <p className="font-medium">Task Completed</p>
                        <p className="text-sm text-muted-foreground">Deep cleaning at Business Bay Office</p>
                        <p className="text-xs text-muted-foreground mt-1">Yesterday</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100 text-blue-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
                      </div>
                      <div>
                        <p className="font-medium">Received Recognition</p>
                        <p className="text-sm text-muted-foreground">Client praised for exceptional service</p>
                        <p className="text-xs text-muted-foreground mt-1">3 days ago</p>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-medium mb-4 mt-6">Notes</h3>
                  <textarea 
                    className="w-full h-32 p-3 border border-border rounded-md bg-background resize-none"
                    placeholder="Add notes about this employee..."
                  ></textarea>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <Button onClick={() => setSelectedEmployee(null)}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Employees
