import { ChangeEvent } from "react"
import { Input } from "@/components/ui/input"
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"

interface ModernEmployeeFiltersProps {
  searchTerm: string
  roleFilter: string
  onSearchChange: (e: ChangeEvent<HTMLInputElement>) => void
  onRoleFilterChange: (value: string) => void
}

export function ModernEmployeeFilters({
  searchTerm,
  roleFilter,
  onSearchChange,
  onRoleFilterChange
}: ModernEmployeeFiltersProps) {
  const roles = [
    { value: "all", label: "All Roles" },
    { value: "staff", label: "Staff" },
    { value: "supervisor", label: "Supervisor" },
    { value: "manager", label: "Manager" },
    { value: "head_manager", label: "Head Manager" },
    { value: "owner", label: "Owner" }
  ]
  
  return (
    <div className="employee-filters mb-6">
      {/* Desktop Filters - Hidden on mobile */}
      <div className="flex gap-4 items-center hide-on-mobile">
        <div className="flex-1">
          <Input
            placeholder="Search employees by name, email, or role..."
            value={searchTerm}
            onChange={onSearchChange}
            className="w-full"
          />
        </div>
        <div className="w-56">
          <Select value={roleFilter} onValueChange={onRoleFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {roles.map(role => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Mobile Filters */}
      <div className="flex flex-col gap-4 show-on-mobile">
        <Input
          placeholder="Search employees..."
          value={searchTerm}
          onChange={onSearchChange}
          className="w-full mb-2"
        />
        
        <div className="filter-container overflow-x-auto">
          <div className="flex gap-2 pb-2">
            {roles.map(role => (
              <button
                key={role.value}
                className={`filter-item whitespace-nowrap px-3 py-1.5 rounded-full text-sm transition-colors ${
                  roleFilter === role.value 
                    ? 'bg-primary text-white font-medium' 
                    : 'bg-gray-100 text-gray-700'
                }`}
                onClick={() => onRoleFilterChange(role.value)}
              >
                {role.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 