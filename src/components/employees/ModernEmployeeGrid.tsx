import { User } from "@/contexts/auth-context"
import { ModernEmployeeCard } from "./ModernEmployeeCard"

interface ModernEmployeeGridProps {
  employees: User[]
  onEmployeeClick: (employee: User) => void
}

export function ModernEmployeeGrid({ employees, onEmployeeClick }: ModernEmployeeGridProps) {
  return (
    <div className="employee-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {employees.map((employee) => (
        <ModernEmployeeCard
          key={employee.id}
          employee={employee}
          onClick={() => onEmployeeClick(employee)}
        />
      ))}
      {employees.length === 0 && (
        <div className="col-span-full text-center py-8 text-gray-500">
          No employees found matching the criteria
        </div>
      )}
    </div>
  )
} 