import { User } from "@/contexts/auth-context"
import { getInitials } from "@/lib/employee-utils"

interface ModernEmployeeCardProps {
  employee: User
  onClick: () => void
}

export function ModernEmployeeCard({ employee, onClick }: ModernEmployeeCardProps) {
  // Get role display name
  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'owner': return 'Owner';
      case 'head_manager': return 'Head Manager';
      case 'manager': return 'Manager';
      case 'supervisor': return 'Supervisor';
      case 'staff': return 'Staff';
      default: return role;
    }
  };
  
  // Get avatar initials as fallback
  const initials = getInitials(employee.name);
  
  // Get role color for visual indication
  const getRoleColorClass = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-600';
      case 'head_manager': return 'bg-blue-100 text-blue-600';
      case 'manager': return 'bg-indigo-100 text-indigo-600';
      case 'supervisor': return 'bg-teal-100 text-teal-600';
      case 'staff': return 'bg-sky-100 text-sky-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };
  
  return (
    <div 
      className="employee-card bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick();
        }
      }}
    >
      <div className="flex items-center gap-3">
        <div className="employee-avatar w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold bg-primary/10 text-primary">
          {initials}
        </div>
        <div className="employee-info overflow-hidden">
          <h3 className="employee-name text-base font-medium text-gray-800 truncate">{employee.name}</h3>
          <p className="employee-email text-sm text-gray-500 truncate">{employee.email}</p>
          <span className={`employee-role mt-1 inline-block px-2 py-0.5 text-xs rounded-full ${getRoleColorClass(employee.role)}`}>
            {getRoleDisplay(employee.role)}
          </span>
        </div>
      </div>
      
      {/* Mobile touch hint - only visible on mobile */}
      <div className="employee-card-touch-hint text-xs text-gray-400 mt-2 text-right show-on-mobile">
        Tap to view details
      </div>
    </div>
  )
} 