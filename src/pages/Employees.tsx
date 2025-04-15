
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { UserPlus } from "lucide-react"
import { EmployeeGrid } from "@/components/employees/EmployeeGrid"
import { EmployeeDetails } from "@/components/employees/EmployeeDetails"
import { DeactivateConfirmation } from "@/components/employees/DeactivateConfirmation"
import { EmployeeFilters } from "@/components/employees/EmployeeFilters"

const Employees = () => {
  const { user, users, canUserManage, deactivateUser } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null)
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false)
  
  const isOwnerOrHeadManager = user?.role === "owner" || user?.role === "head_manager"
  
  // Filter visible employees based on user role hierarchy and search/role filters
  const visibleEmployees = users
    .filter(employee => {
      if (employee.id === user?.id) return false
      return canUserManage(user, employee.id)
    })
    .filter(employee => {
      const matchesSearch = employee.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         employee.email?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesRole = !selectedRole || employee.role === selectedRole
      
      return matchesSearch && matchesRole
    })
  
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
      
      <EmployeeFilters
        searchQuery={searchQuery}
        selectedRole={selectedRole}
        onSearchChange={setSearchQuery}
        onRoleChange={setSelectedRole}
      />
      
      <EmployeeGrid
        employees={visibleEmployees}
        onSelectEmployee={setSelectedEmployee}
      />
      
      {selectedEmployee && (
        <EmployeeDetails
          employee={selectedEmployee}
          isOpen={!!selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
          onDeactivate={() => setShowDeactivateDialog(true)}
          showDeactivateOption={isOwnerOrHeadManager}
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
    </div>
  )
}

export default Employees
