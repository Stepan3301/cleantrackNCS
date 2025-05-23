import { User } from "@/contexts/auth-context"
import { Card } from "@/components/ui/card"

interface EmployeeGridProps {
  employees: User[]
  onSelectEmployee: (employee: User) => void
}

export function EmployeeGrid({ employees, onSelectEmployee }: EmployeeGridProps) {
  if (employees.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No employees found</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {employees.map((employee) => (
        <Card
          key={employee.id}
          className="p-4 cursor-pointer hover:bg-accent transition-colors"
          onClick={() => onSelectEmployee(employee)}
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-secondary">
              <img 
                src={`https://i.pravatar.cc/300?img=${employee.id}`}
                alt={employee.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-medium">{employee.name}</h3>
              <p className="text-sm text-muted-foreground">{employee.email}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
