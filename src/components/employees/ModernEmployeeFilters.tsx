import React from "react"
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"

interface ModernEmployeeFiltersProps {
  selectedRole: string | null;
  onRoleChange: (value: string | null) => void;
  showManagerFilter?: boolean;
  userRole?: string;
}

export function ModernEmployeeFilters({
  selectedRole,
  onRoleChange,
  showManagerFilter = false,
  userRole = 'staff'
}: ModernEmployeeFiltersProps) {
  const handleRoleChange = (value: string) => {
    onRoleChange(value === "all" ? null : value);
  };
  
  // Define available roles based on user permission
  let availableRoles = [
    { value: "all", label: "All Roles" },
    { value: "staff", label: "Staff" }
  ];
  
  // Supervisor can see other supervisors and staff
  if (userRole === "supervisor" || userRole === "manager" || userRole === "head_manager" || userRole === "owner") {
    availableRoles.push({ value: "supervisor", label: "Supervisor" });
  }
  
  // Manager and above can see managers
  if (showManagerFilter) {
    availableRoles.push({ value: "manager", label: "Manager" });
    availableRoles.push({ value: "head_manager", label: "Head Manager" });
  }
  
  return (
    <div className="filter-by-role mb-6">
      {/* Desktop Filter */}
      <div className="flex justify-end">
        <div className="w-56">
          <Select 
            value={selectedRole || "all"} 
            onValueChange={handleRoleChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {availableRoles.map(role => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Mobile Filter */}
      <div className="filter-container overflow-x-auto mt-4 md:hidden">
        <div className="flex gap-2 pb-2">
          {availableRoles.map(role => (
            <button
              key={role.value}
              className={`filter-item whitespace-nowrap px-3 py-1.5 rounded-full text-sm transition-colors ${
                (role.value === "all" && !selectedRole) || selectedRole === role.value
                  ? 'bg-primary text-white font-medium' 
                  : 'bg-gray-100 text-gray-700'
              }`}
              onClick={() => handleRoleChange(role.value)}
            >
              {role.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
} 