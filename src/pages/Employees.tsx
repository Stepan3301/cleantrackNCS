import { useState, useEffect } from "react"
import { useAuth, User } from "@/contexts/auth-context"

// Original components
import { EmployeeDetails } from "@/components/employees/EmployeeDetails"
import { DeactivateConfirmation } from "@/components/employees/DeactivateConfirmation"
import { AddEmployeeDialog } from "@/components/employees/AddEmployeeDialog"
import { AssignmentDialog } from "@/components/employees/AssignmentDialog"

// Modern components
import { ModernEmployeeGrid } from "@/components/employees/ModernEmployeeGrid"
import { ModernEmployeeFilters } from "@/components/employees/ModernEmployeeFilters"
import { ModernAddButton } from "@/components/employees/ModernAddButton"
import { ModernEmployeeCard } from "@/components/employees/ModernEmployeeCard"
import { initializeEmployeesPage } from "@/lib/employee-utils"
import { PageHeader } from "@/components/ui/PageHeader"
import { usePermissions } from "@/hooks/use-permissions.tsx"

// Import the styles
import "@/styles/modern-employees.css"

const Employees = () => {
  const { user, users, deactivateUser } = useAuth()
  const { canViewEmployee, canEditEmployee } = usePermissions(user);
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null)
  const [isEmployeeDetailsOpen, setIsEmployeeDetailsOpen] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false)
  const [showAddEmployeeDialog, setShowAddEmployeeDialog] = useState(false)
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false)
  const [isDialogOpening, setIsDialogOpening] = useState(false)
  
  useEffect(() => {
    const cleanup = initializeEmployeesPage();
    return cleanup;
  }, []);

  const handleEmployeeClick = (employee: User) => {
    if (canViewEmployee(employee) && !isDialogOpening) {
      setIsDialogOpening(true);
      setSelectedEmployee(employee);
      setIsEmployeeDetailsOpen(true);
      // Reset the flag after a short delay
      setTimeout(() => setIsDialogOpening(false), 500);
    }
  };

  const handleCloseEmployeeDetails = () => {
    if (!isDialogOpening) {
      setIsEmployeeDetailsOpen(false);
      setTimeout(() => setSelectedEmployee(null), 300);
    }
  };
  
  const visibleEmployees = users
    .filter(employee => employee.id !== user?.id && canViewEmployee(employee))
    .filter(employee => {
      return !selectedRole || employee.role === selectedRole
    })
  
  const handleDeactivateConfirm = () => {
    if (selectedEmployee) {
      deactivateUser(selectedEmployee.id)
      setShowDeactivateDialog(false)
      setSelectedEmployee(null)
    }
  }

  const canAddEmployee = user && (user.role === "owner" || user.role === "head_manager" || user.role === "manager");

  return (
    <>
      <div className="employees-container">
        <PageHeader
          title="Employees"
          subtitle="Manage your CleanTrack team"
          showDate={false}
        />
        
        <ModernEmployeeFilters
          selectedRole={selectedRole}
          onRoleChange={setSelectedRole}
          showManagerFilter={user?.role === "owner" || user?.role === "head_manager"}
          userRole={user?.role}
        />
        
        <div className="employees-grid" id="employeesGrid">
          {visibleEmployees.length === 0 ? (
            <div className="employee-grid-empty">
              <p>No employees found</p>
            </div>
          ) : (
            visibleEmployees.map((employee) => (
              <ModernEmployeeCard
                key={employee.id}
                employee={employee}
                onClick={() => handleEmployeeClick(employee)}
              />
            ))
          )}
        </div>
      </div>
      
      {canAddEmployee && (
        <ModernAddButton onClick={() => setShowAddEmployeeDialog(true)} />
      )}
      
      {selectedEmployee && (
        <EmployeeDetails
          employee={selectedEmployee}
          isOpen={isEmployeeDetailsOpen}
          onClose={handleCloseEmployeeDetails}
          onDeactivate={() => setShowDeactivateDialog(true)}
          showDeactivateOption={canEditEmployee(selectedEmployee)}
          showAssignOption={canEditEmployee(selectedEmployee)}
          onAssign={() => setShowAssignmentDialog(true)}
        />
      )}
      
      {selectedEmployee && (
        <DeactivateConfirmation
          isOpen={showDeactivateDialog}
          employeeName={selectedEmployee.name}
          onClose={() => setShowDeactivateDialog(false)}
          onConfirm={handleDeactivateConfirm}
        />
      )}
      
      <AddEmployeeDialog
        isOpen={showAddEmployeeDialog}
        onClose={() => setShowAddEmployeeDialog(false)}
      />
      
      {selectedEmployee && (
        <AssignmentDialog
          isOpen={showAssignmentDialog}
          employee={selectedEmployee}
          onClose={() => setShowAssignmentDialog(false)}
        />
      )}
    </>
  )
}

export default Employees
