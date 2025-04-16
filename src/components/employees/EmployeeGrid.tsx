
import { useState } from "react"
import { User, useAuth } from "@/contexts/auth-context"
import { EmployeeCard } from "./EmployeeCard"
import { Button } from "@/components/ui/button"
import { UserPlus, Search } from "lucide-react"
import { AddEmployeeDialog } from "./AddEmployeeDialog"

interface EmployeeGridProps {
  employees: User[]
  onSelectEmployee: (employee: User) => void
}

export function EmployeeGrid({ employees, onSelectEmployee }: EmployeeGridProps) {
  const { user } = useAuth()
  const [showAddDialog, setShowAddDialog] = useState(false)
  
  const isOwnerOrHeadManager = user?.role === "owner" || user?.role === "head_manager"
  
  const handleAddEmployee = () => {
    setShowAddDialog(true)
  }
  
  if (employees.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-border p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/50 flex items-center justify-center">
          <Search size={24} className="text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">No employees found</h3>
        <p className="text-muted-foreground">
          Try adjusting your search or filter to find what you're looking for.
        </p>
        
        {isOwnerOrHeadManager && (
          <Button 
            className="mt-4"
            onClick={handleAddEmployee}
          >
            <UserPlus size={16} className="mr-2" />
            Add New Employee
          </Button>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-muted-foreground">
          {employees.length} employee{employees.length !== 1 ? 's' : ''} found
        </div>
        
        {isOwnerOrHeadManager && (
          <Button onClick={handleAddEmployee}>
            <UserPlus size={16} className="mr-2" />
            Add New Employee
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {employees.map((employee) => (
          <EmployeeCard
            key={employee.id}
            employee={employee}
            onClick={() => onSelectEmployee(employee)}
          />
        ))}
      </div>
      
      {showAddDialog && (
        <AddEmployeeDialog
          isOpen={showAddDialog}
          onClose={() => setShowAddDialog(false)}
        />
      )}
    </>
  )
}
