
import { User } from "@/contexts/auth-context"
import { EmployeeCard } from "./EmployeeCard"
import { Search } from "lucide-react"

interface EmployeeGridProps {
  employees: User[]
  onSelectEmployee: (employee: User) => void
}

export function EmployeeGrid({ employees, onSelectEmployee }: EmployeeGridProps) {
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
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {employees.map((employee) => (
        <EmployeeCard
          key={employee.id}
          employee={employee}
          onClick={() => onSelectEmployee(employee)}
        />
      ))}
    </div>
  )
}
