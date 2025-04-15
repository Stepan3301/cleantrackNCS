
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Calendar, Star } from "lucide-react"
import { User } from "@/contexts/auth-context"

interface EmployeeCardProps {
  employee: User
  onClick: () => void
  showProgress?: boolean
}

export function EmployeeCard({ employee, onClick, showProgress = true }: EmployeeCardProps) {
  const calculateProgress = (current: number = 0, target: number = 100) => {
    return Math.min(Math.round((current / target) * 100), 100)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <div 
      className="bg-white rounded-lg border border-border overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="aspect-[4/3] relative bg-secondary/30">
        <img 
          src={`https://i.pravatar.cc/300?img=${employee.id}`}
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
        {employee.role === "staff" && showProgress && (
          <div className="mb-3">
            <div className="text-sm text-muted-foreground mb-1">Working Hours</div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary"
                style={{ width: `${calculateProgress()}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span>0 hours</span>
              <span className="text-muted-foreground">100 target</span>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs text-muted-foreground flex items-center">
            <Calendar size={12} className="mr-1" />
            <span>Joined {formatDate(new Date().toISOString())}</span>
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
  )
}
