import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"

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

// Import the styles
import "@/styles/modern-employees.css"

const Employees = () => {
  const { user, users, canUserManage, deactivateUser } = useAuth()
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null)
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false)
  const [showAddEmployeeDialog, setShowAddEmployeeDialog] = useState(false)
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false)
  // Add a ref to track if dialog should be shown
  const employeeDetailsVisible = useRef(false)
  
  // Initialize the modern employees page
  useEffect(() => {
    const cleanup = initializeEmployeesPage();
    return cleanup;
  }, []);
  
  // Ensure selection persists
  useEffect(() => {
    if (selectedEmployee) {
      employeeDetailsVisible.current = true;
    }
  }, [selectedEmployee]);
  
  // Safe close handler that properly updates the state
  const handleCloseEmployeeDetails = () => {
    employeeDetailsVisible.current = false;
    setSelectedEmployee(null);
  };
  
  // Check user roles for permissions
  const isOwnerOrHeadManager = user?.role === "owner" || user?.role === "head_manager"
  const isManager = user?.role === "manager"
  const isSupervisor = user?.role === "supervisor"
  
  // Filter visible employees based on user role hierarchy and role filters
  const visibleEmployees = users
    .filter(employee => {
      if (employee.id === user?.id) return false
      
      // Owner and Head Manager can see everyone
      if (isOwnerOrHeadManager) return true
      
      // Manager can see supervisors and staff
      if (isManager && (employee.role === "supervisor" || employee.role === "staff")) return true
      
      // Supervisor can only see other supervisors and staff (no management)
      if (isSupervisor && (employee.role === "supervisor" || employee.role === "staff")) return true
      
      return false
    })
    .filter(employee => {
      // Filter by selected role
      return !selectedRole || employee.role === selectedRole
    })
  
  const handleDeactivateConfirm = () => {
    if (selectedEmployee) {
      deactivateUser(selectedEmployee.id)
      setShowDeactivateDialog(false)
      setSelectedEmployee(null)
    }
  }

  // Check if user can assign staff to supervisor
  const canAssignEmployee = (employee: any) => {
    // Owner and Head Manager can assign anyone
    if (isOwnerOrHeadManager) return true;
    
    // Manager can assign supervisors to themselves or staff to supervisors
    if (isManager) {
      if (employee.role === "supervisor") return true;
      if (employee.role === "staff") return true;
    }
    
    return false;
  }

  // Check if user can add employees
  const canAddEmployee = isOwnerOrHeadManager || isManager;
  
  // Check if user can deactivate employees
  const canDeactivateEmployee = (employee: any) => {
    // Owner and Head Manager can deactivate anyone
    if (isOwnerOrHeadManager) return true;
    
    // Manager can deactivate supervisors and staff
    if (isManager && (employee.role === "supervisor" || employee.role === "staff")) return true;
    
    return false;
  }

  return (
    <>
      <div className="employees-container">
        <div className="employees-header">
          <div>
            <h1>Employees</h1>
            <p>Manage your CleanTrack team</p>
          </div>
        </div>
        
        <ModernEmployeeFilters
          selectedRole={selectedRole}
          onRoleChange={setSelectedRole}
          showManagerFilter={isOwnerOrHeadManager}
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
                onClick={() => setSelectedEmployee(employee)}
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
          isOpen={!!selectedEmployee && employeeDetailsVisible.current}
          onClose={handleCloseEmployeeDetails}
          onDeactivate={() => setShowDeactivateDialog(true)}
          showDeactivateOption={canDeactivateEmployee(selectedEmployee)}
          showAssignOption={canAssignEmployee(selectedEmployee)}
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
