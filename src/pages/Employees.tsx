
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { useAuth } from "@/contexts/auth-context"
import { 
  Search, 
  Filter, 
  UserPlus, 
  MoreHorizontal,
  Star,
  Phone,
  Mail,
  Calendar,
  Clock,
  AlertTriangle
} from "lucide-react"

const Employees = () => {
  const { user, users, canUserManage, deactivateUser } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null)
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false)
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  
  const isOwnerOrHeadManager = user?.role === "owner" || user?.role === "head_manager"
  
  // Filter visible employees based on user role hierarchy
  const visibleEmployees = users
    .filter(employee => {
      // Filter out the current user (don't show themselves in the list)
      if (employee.id === user?.id) return false
      
      // Apply role-based visibility filtering
      return canUserManage(user, employee.id)
    })
    .filter(employee => {
      // Apply search and role filters
      const matchesSearch = employee.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           employee.email?.toLowerCase().includes(searchQuery.toLowerCase())
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
  
  // Handle deactivation confirmation
  const handleDeactivateConfirm = () => {
    if (selectedEmployee) {
      deactivateUser(selectedEmployee.id)
      setShowDeactivateDialog(false)
      setSelectedEmployee(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Employee Database</h1>
        {isOwnerOrHeadManager && (
          <Button>
            <UserPlus size={16} className="mr-2" />
            Add New Employee
          </Button>
        )}
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
        {visibleEmployees.map((employee) => (
          <div 
            key={employee.id} 
            className="bg-white rounded-lg border border-border overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedEmployee(employee)}
          >
            <div className="aspect-[4/3] relative bg-secondary/30">
              <img 
                src={employee.photo || `https://i.pravatar.cc/300?img=${employee.id}`} 
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
              {/* Only show hours progress for staff members */}
              {employee.role === "staff" && (
                <div className="mb-3">
                  <div className="text-sm text-muted-foreground mb-1">Working Hours</div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        calculateProgress(employee.current || 0, employee.target || 100) >= 100 
                          ? "bg-success" 
                          : "bg-primary"
                      }`}
                      style={{ width: `${calculateProgress(employee.current || 0, employee.target || 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span>{employee.current || 0} hours</span>
                    <span className="text-muted-foreground">{employee.target || 100} target</span>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs text-muted-foreground flex items-center">
                  <Calendar size={12} className="mr-1" />
                  <span>Joined {formatDate(employee.joinDate || new Date().toISOString())}</span>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreHorizontal size={14} />
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground truncate">
                {employee.email}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Empty state */}
      {visibleEmployees.length === 0 && (
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
                  src={selectedEmployee.photo || `https://i.pravatar.cc/300?img=${selectedEmployee.id}`}
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
                      {getMonthsSinceJoin(selectedEmployee.joinDate || new Date().toISOString())} months at company
                    </span>
                  </div>
                </div>
                
                <div className="space-x-2">
                  {/* "Assign" button - for supervisors and managers */}
                  {isOwnerOrHeadManager && (
                    selectedEmployee.role === "staff" || selectedEmployee.role === "supervisor") && (
                    <Button variant="outline" size="sm" onClick={() => setShowAssignDialog(true)}>
                      Assign {selectedEmployee.role === "staff" ? "Supervisor" : "Manager"}
                    </Button>
                  )}
                  
                  {/* Only Owner and Head Manager can see Deactivate button */}
                  {isOwnerOrHeadManager && (
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeactivateDialog(true);
                      }}
                    >
                      Deactivate
                    </Button>
                  )}
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
                      <span>{selectedEmployee.phone || "Not provided"}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-2 text-muted-foreground" />
                      <span>Started on {formatDate(selectedEmployee.joinDate || new Date().toISOString())}</span>
                    </div>
                  </div>
                  
                  {/* Only show performance metrics for staff members */}
                  {selectedEmployee.role === "staff" && (
                    <>
                      <h3 className="text-lg font-medium mb-4 mt-6">Performance Metrics</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Working Hours</span>
                            <span className="text-sm font-medium">
                              {selectedEmployee.current || 0}/{selectedEmployee.target || 100} hours
                            </span>
                          </div>
                          <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
                                calculateProgress(selectedEmployee.current || 0, selectedEmployee.target || 100) >= 100 
                                  ? "bg-success" 
                                  : "bg-primary"
                              }`}
                              style={{ width: `${calculateProgress(selectedEmployee.current || 0, selectedEmployee.target || 100)}%` }}
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
                        
                        {/* Bonus section - only for staff members */}
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Bonus Earned</span>
                            <span className="text-sm font-medium">
                              {selectedEmployee.current > selectedEmployee.target 
                                ? `AED ${Math.floor((selectedEmployee.current - selectedEmployee.target) * 5)}` 
                                : "AED 0"}
                            </span>
                          </div>
                          {selectedEmployee.current >= selectedEmployee.target ? (
                            <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-success" 
                                style={{ 
                                  width: `${Math.min(
                                    ((selectedEmployee.current - selectedEmployee.target) / selectedEmployee.target) * 100, 
                                    100
                                  )}%` 
                                }}
                              ></div>
                            </div>
                          ) : (
                            <div className="text-xs text-muted-foreground">
                              Target hours must be reached before bonus accumulates
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
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
      
      {/* Deactivate Confirmation Dialog */}
      {showDeactivateDialog && (
        <Dialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center text-destructive">
                <AlertTriangle className="mr-2 h-5 w-5" /> Deactivate Employee
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to deactivate {selectedEmployee?.name}? This action will remove their account from the system.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowDeactivateDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeactivateConfirm}>
                Deactivate
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default Employees
