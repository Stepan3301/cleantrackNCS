
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter } from "lucide-react"

interface EmployeeFiltersProps {
  searchQuery: string
  selectedRole: string | null
  onSearchChange: (query: string) => void
  onRoleChange: (role: string | null) => void
}

export function EmployeeFilters({
  searchQuery,
  selectedRole,
  onSearchChange,
  onRoleChange,
}: EmployeeFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4 items-center">
      <div className="relative grow max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input 
          placeholder="Search employees..." 
          className="pl-9"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <div className="flex items-center gap-2">
        <Filter size={16} className="text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Filter by:</span>
        <Button 
          variant={selectedRole === null ? "secondary" : "outline"} 
          size="sm"
          onClick={() => onRoleChange(null)}
        >
          All
        </Button>
        <Button 
          variant={selectedRole === "manager" ? "secondary" : "outline"} 
          size="sm"
          onClick={() => onRoleChange("manager")}
        >
          Managers
        </Button>
        <Button 
          variant={selectedRole === "supervisor" ? "secondary" : "outline"} 
          size="sm"
          onClick={() => onRoleChange("supervisor")}
        >
          Supervisors
        </Button>
        <Button 
          variant={selectedRole === "staff" ? "secondary" : "outline"} 
          size="sm"
          onClick={() => onRoleChange("staff")}
        >
          Staff
        </Button>
      </div>
    </div>
  )
}
