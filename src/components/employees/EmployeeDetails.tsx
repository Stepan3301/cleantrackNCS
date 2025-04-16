import { useState } from "react"
import { User, useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Mail, Phone, Calendar, Users, Clock } from "lucide-react"
import { AssignmentDialog } from "./AssignmentDialog"
import { HoursView } from "./HoursView"

interface EmployeeDetailsProps {
  employee: User | null
  isOpen: boolean
  onClose: () => void
  onDeactivate: () => void
  showDeactivateOption: boolean
}

export function EmployeeDetails({ 
  employee, 
  isOpen, 
  onClose,
  onDeactivate,
  showDeactivateOption 
}: EmployeeDetailsProps) {
  const { user, users } = useAuth();
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showHoursView, setShowHoursView] = useState(false);
  
  if (!employee) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const getMonthsSinceJoin = (dateString: string) => {
    const joinDate = new Date(dateString)
    const today = new Date()
    return (today.getFullYear() - joinDate.getFullYear()) * 12 + 
           (today.getMonth() - joinDate.getMonth())
  }

  // Get assigned supervisor/manager
  const getAssignedTo = () => {
    if (employee.role === "staff" && employee.supervisorId) {
      const supervisor = users.find(u => u.id === employee.supervisorId);
      return supervisor ? `Assigned to Supervisor: ${supervisor.name}` : null;
    }
    if (employee.role === "supervisor" && employee.managerId) {
      const manager = users.find(u => u.id === employee.managerId);
      return manager ? `Assigned to Manager: ${manager.name}` : null;
    }
    return null;
  }

  const canViewHours = (
    (user?.role === "owner" || user?.role === "head_manager") && 
    (employee.role === "staff" || employee.role === "supervisor")
  );

  const assignedTo = getAssignedTo();

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Employee Details</DialogTitle>
            <DialogDescription>
              View employee information and manage their account
            </DialogDescription>
          </DialogHeader>
          
          <div className="relative">
            <div className="flex items-start space-x-4">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-secondary">
                <img 
                  src={`https://i.pravatar.cc/300?img=${employee.id}`}
                  alt={employee.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div>
                <h2 className="text-2xl font-bold">{employee.name}</h2>
                <div className="flex items-center">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium capitalize ${
                    employee.role === "manager" 
                      ? "bg-yellow-100 text-yellow-800" 
                      : employee.role === "supervisor"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {employee.role}
                  </span>
                  <span className="mx-2 text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">
                    {getMonthsSinceJoin(new Date().toISOString())} months at company
                  </span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div>
                <h3 className="text-lg font-medium mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Mail size={16} className="mr-2 text-muted-foreground" />
                    <span>{employee.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone size={16} className="mr-2 text-muted-foreground" />
                    <span>Not provided</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-2 text-muted-foreground" />
                    <span>Started on {formatDate(new Date().toISOString())}</span>
                  </div>
                  {assignedTo && (
                    <div className="flex items-center">
                      <Users size={16} className="mr-2 text-muted-foreground" />
                      <span>{assignedTo}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              {canViewHours && (
                <Button 
                  variant="outline"
                  onClick={() => setShowHoursView(true)}
                >
                  <Clock size={16} className="mr-2" />
                  Check Records
                </Button>
              )}
              
              {showDeactivateOption && (
                <Button 
                  variant="destructive" 
                  onClick={onDeactivate}
                >
                  Deactivate
                </Button>
              )}
              
              <Button onClick={onClose}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {employee && showAssignDialog && (
        <AssignmentDialog
          isOpen={showAssignDialog}
          employee={employee}
          onClose={() => setShowAssignDialog(false)}
        />
      )}

      {employee && showHoursView && (
        <HoursView
          isOpen={showHoursView}
          employee={employee}
          onClose={() => setShowHoursView(false)}
        />
      )}
    </>
  )
}
