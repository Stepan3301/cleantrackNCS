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
      case 'owner': return 'owner-role';
      case 'head_manager': return 'head-manager-role';
      case 'manager': return 'manager-role';
      case 'supervisor': return 'supervisor-role';
      case 'staff': return 'staff-role';
      default: return '';
    }
  };
  
  return (
    <div 
      className="employee-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick();
        }
      }}
    >
      <div className="employee-card-content">
        <div className="employee-avatar">
          {employee.avatar_url ? (
            <img 
              src={employee.avatar_url} 
              alt={`${employee.name}'s profile`} 
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>
        
        <div className="employee-info">
          <h3 className="employee-name">{employee.name}</h3>
          <p className="employee-email">{employee.email}</p>
          <span className={`employee-role ${getRoleColorClass(employee.role)}`}>
            {getRoleDisplay(employee.role)}
          </span>
        </div>
      </div>
      
      <div className="employee-view-details">
        Tap to view details
      </div>
    </div>
  )
} 