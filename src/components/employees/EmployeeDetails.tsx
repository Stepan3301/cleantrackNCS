import { useState, useEffect } from "react"
import { User, useAuth } from "@/contexts/auth-context"
import { 
  Dialog,
  DialogContent,
  DialogPortal,
  DialogOverlay
} from "@/components/ui/dialog"
import { Mail, Calendar, Users, Clock, User as UserIcon, CheckCircle, AlertCircle } from "lucide-react"
import { HoursView } from "./HoursView"
import { workTimeService } from "@/lib/services/work-time-service"
import "../../../src/styles/modern-employee-profile.css"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cn } from "@/lib/utils"
import React from "react"

// Custom DialogContent that doesn't have the automatic close button
const CustomDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Content
    ref={ref}
    className={cn(
      "fixed left-[50%] top-[50%] z-[9999] grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
      className
    )}
    {...props}
  >
    {children}
  </DialogPrimitive.Content>
))
CustomDialogContent.displayName = DialogPrimitive.Content.displayName

interface EmployeeDetailsProps {
  employee: User | null
  isOpen: boolean
  onClose: () => void
  onDeactivate: () => void
  showDeactivateOption: boolean
  showAssignOption?: boolean
  onAssign?: () => void
}

export const EmployeeDetails: React.FC<EmployeeDetailsProps> = ({
  employee,
  isOpen,
  onClose,
  onDeactivate,
  showDeactivateOption,
  showAssignOption,
  onAssign
}) => {
  const { user, users } = useAuth();
  const [showHoursView, setShowHoursView] = useState(false);
  const [workTimeRecords, setWorkTimeRecords] = useState<any[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  
  if (!employee) return null;

  // Check if current user is a supervisor
  const isSupervisor = user?.role === "supervisor";
  
  // Get assigned supervisor/manager
  const getAssignedTo = () => {
    if (employee.role === "staff" && employee.supervisor_id) {
      const supervisor = users.find(u => u.id === employee.supervisor_id);
      return supervisor ? `${supervisor.name}` : null;
    }
    if (employee.role === "supervisor" && employee.manager_id) {
      const manager = users.find(u => u.id === employee.manager_id);
      return manager ? `${manager.name}` : null;
    }
    return null;
  }

  // Check if current user can view hours - supervisors cannot check records
  const canViewHours = (
    (user?.role === "owner" || user?.role === "head_manager" || user?.role === "manager") && 
    (employee.role === "staff" || employee.role === "supervisor")
  );

  const assignedTo = getAssignedTo();
  const assignedRole = employee.role === "staff" ? "Supervisor" : "Manager";

  // Format date string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  // Calculate months at company
  const getMonthsSinceJoin = (dateString: string) => {
    const joinDate = new Date(dateString);
    const today = new Date();
    const monthDiff = (today.getFullYear() - joinDate.getFullYear()) * 12 + 
                      (today.getMonth() - joinDate.getMonth());
    return monthDiff > 0 ? monthDiff : 0;
  }

  // Handle viewing hours records
  const handleViewHours = async () => {
    setIsLoadingRecords(true);
    try {
      const records = await workTimeService.getUserWorkTime(employee.id);
      setWorkTimeRecords(records);
      setShowHoursView(true);
    } catch (error) {
      console.error('Error loading work time records:', error);
    } finally {
      setIsLoadingRecords(false);
    }
  };

  // Get total hours worked in the current month
  const getCurrentMonthHours = () => {
    if (workTimeRecords.length === 0) return 0;
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Filter records for current month
    const monthRecords = workTimeRecords.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate.getMonth() === currentMonth && 
             recordDate.getFullYear() === currentYear;
    });
    
    // Sum hours
    return monthRecords.reduce((total, record) => total + record.hours_worked, 0);
  };

  // Calculate completion rate
  const getCompletionRate = () => {
    if (workTimeRecords.length === 0) return "N/A";
    
    const approved = workTimeRecords.filter(record => record.status === "approved").length;
    return `${Math.round((approved / workTimeRecords.length) * 100)}%`;
  };

  // For supervisors, create a simplified version with just essential information
  if (isSupervisor && employee) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogPortal>
          <DialogOverlay className="supervisor-dialog-overlay" />
          <CustomDialogContent 
            className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto modern-dialog supervisor-dialog supervisor-specific-dialog"
            onPointerDownOutside={(e) => {
              // Prevent dialog from closing when clicking on interactive elements
              const target = e.target as Element;
              if (target?.closest('button') || target?.closest('[role="button"]')) {
                e.preventDefault();
              }
            }}
          >
            <div className="modern-employee-profile">
              <div className="modern-employee-profile-header p-4">
                <div className="flex flex-col items-center mb-4">
                  <div className="modern-employee-profile-avatar-placeholder mb-3">
                    {employee.name.charAt(0)}
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-2">{employee.name}</h3>
                  <Badge 
                    variant={
                      employee.role === "supervisor"
                        ? "outline"
                        : "secondary"
                    }
                    className="capitalize"
                  >
                    {employee.role.replace('_', ' ')}
                  </Badge>
                </div>
                
                <div className="border-t border-gray-100 pt-4 mt-4">
                  <div className="flex flex-col gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-cyan-500" />
                      <span className="text-gray-700">{employee.email}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-cyan-500" />
                      <span className="text-gray-700">{getMonthsSinceJoin(new Date().toISOString())} months at company</span>
                    </div>
                    
                    {assignedTo && (
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-cyan-500" />
                        <span className="text-gray-700">Assigned to {assignedRole}: {assignedTo}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="border-t border-gray-100 pt-4 mt-4 flex justify-end">
                  <Button 
                    onClick={onClose}
                    className="supervisor-done-btn bg-gradient-to-r from-[#3ec6e0] to-[#7fffd4] text-white font-semibold border-none hover:shadow-lg transition-all"
                  >
                    Done
                  </Button>
                </div>
              </div>
            </div>
          </CustomDialogContent>
        </DialogPortal>
      </Dialog>
    );
  }

  // Regular dialog for other roles
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto modern-dialog"
        onPointerDownOutside={(e) => {
          // Prevent dialog from closing when clicking on interactive elements
          const target = e.target as Element;
          if (target?.closest('button') || target?.closest('[role="button"]')) {
            e.preventDefault();
          }
        }}
      >
        {employee && (
          <div className="modern-employee-profile">
            <div className="modern-employee-profile-header">
              <div className="modern-employee-profile-avatar">
                {employee.avatar_url ? (
                  <img 
                    src={employee.avatar_url} 
                    alt={employee.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                  />
                ) : (
                  <div className="modern-employee-profile-avatar-placeholder">
                    {employee.name.charAt(0)}
                  </div>
                )}
              </div>
              
              <div className="modern-employee-profile-info">
                <h3 className="modern-employee-profile-name">{employee.name}</h3>
                <div className="modern-employee-profile-role">
                  <Badge 
                    variant={
                      employee.role === "owner" || employee.role === "head_manager" 
                        ? "default" 
                        : employee.role === "manager" 
                          ? "secondary" 
                          : employee.role === "supervisor"
                            ? "outline"
                            : "secondary"
                    }
                  >
                    {employee.role.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
              
              <div className="modern-employee-profile-contact-container">
                <div className="modern-employee-profile-contact">
                  <div className="modern-employee-profile-contact-item">
                    <Mail size={16} className="modern-employee-profile-contact-icon" />
                    <span>{employee.email}</span>
                  </div>
                  
                  <div className="modern-employee-profile-contact-item">
                    <Calendar size={16} className="modern-employee-profile-contact-icon" />
                    <span>{getMonthsSinceJoin(new Date().toISOString())} months at company</span>
                  </div>
                  
                  {assignedTo && (
                    <div className="modern-employee-profile-contact-item">
                      <Users size={16} className="modern-employee-profile-contact-icon" />
                      <span>Assigned to {assignedRole}: {assignedTo}</span>
                    </div>
                  )}
                </div>
                
                <div className="modern-employee-profile-side-actions">
                  {canViewHours && !isLoadingRecords && (
                    <button 
                      className="modern-employee-profile-button side-button"
                      onClick={handleViewHours}
                      disabled={isLoadingRecords}
                    >
                      <Clock size={16} />
                      Check Records
                    </button>
                  )}
                  
                  {showAssignOption && onAssign && (
                    <button
                      className="modern-employee-profile-button side-button"
                      onClick={onAssign}
                    >
                      <UserIcon size={16} />
                      Assign
                    </button>
                  )}
                </div>
              </div>
              
              {isLoadingRecords ? (
                <div className="flex justify-center my-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : workTimeRecords.length > 0 ? (
                <div className="modern-employee-profile-stats">
                  <div className="modern-employee-profile-stat">
                    <div className="modern-employee-profile-stat-value">{workTimeRecords.length}</div>
                    <div className="modern-employee-profile-stat-label">Total Records</div>
                  </div>
                  
                  <div className="modern-employee-profile-stat">
                    <div className="modern-employee-profile-stat-value">{getCurrentMonthHours()}</div>
                    <div className="modern-employee-profile-stat-label">Hours This Month</div>
                  </div>
                  
                  <div className="modern-employee-profile-stat">
                    <div className="modern-employee-profile-stat-value">{getCompletionRate()}</div>
                    <div className="modern-employee-profile-stat-label">Completion Rate</div>
                  </div>
                </div>
              ) : null}
              
              {showHoursView && workTimeRecords.length > 0 ? (
                <div className="modern-employee-profile-hours">
                  <h4 className="text-lg font-medium mb-3">Work Records</h4>
                  <div className="max-h-[300px] overflow-y-auto">
                    <table className="w-full">
                      <thead>
                        <tr>
                          <th className="text-left pb-2">Date</th>
                          <th className="text-left pb-2">Hours</th>
                          <th className="text-left pb-2">Location</th>
                          <th className="text-left pb-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {workTimeRecords.map((record, index) => (
                          <tr key={index} className="border-t">
                            <td className="py-2">{formatDate(record.date)}</td>
                            <td className="py-2">{record.hours_worked}</td>
                            <td className="py-2">{record.location}</td>
                            <td className="py-2">
                              <Badge 
                                variant={
                                  record.status === "approved" 
                                    ? "default" 
                                    : record.status === "rejected"
                                      ? "destructive"
                                      : "secondary"
                                }
                              >
                                {record.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}
              
              <div className="mt-6 modern-dialog-footer">
                <div className="flex justify-between">
                  {showDeactivateOption && onDeactivate && (
                    <Button variant="destructive" onClick={onDeactivate}>
                      Deactivate
                    </Button>
                  )}
                  <Button 
                    onClick={onClose}
                    variant="outline"
                    className={!showDeactivateOption ? "ml-auto" : ""}
                  >
                    Done
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
