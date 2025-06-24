import { useCallback } from 'react';
import { User } from '@/contexts/auth-context';

export const usePermissions = (user: User | null) => {
  const canViewEmployee = useCallback((targetEmployee: User) => {
    if (!user || !targetEmployee) return false;
    
    // Владелец и главный менеджер могут видеть всех
    if (['owner', 'head_manager'].includes(user.role)) {
      return true;
    }
    
    // Менеджер может видеть staff и supervisor
    if (user.role === 'manager') {
      return ['staff', 'supervisor'].includes(targetEmployee.role);
    }
    
    // Supervisor может видеть только staff
    if (user.role === 'supervisor') {
      return targetEmployee.role === 'staff' || targetEmployee.id === user.id;
    }
    
    // Staff может видеть только себя
    if (user.role === 'staff') {
      return targetEmployee.id === user.id;
    }
    
    return false;
  }, [user]);

  const canViewHours = useCallback((targetEmployee: User) => {
    if (!user || !targetEmployee) return false;
    
    // Управленческие роли могут видеть часы подчиненных
    const managerRoles = ['owner', 'head_manager', 'manager'];
    const staffRoles = ['staff', 'supervisor'];
    
    return managerRoles.includes(user.role) && 
           (staffRoles.includes(targetEmployee.role) || targetEmployee.id === user.id);
  }, [user]);

  const canEditEmployee = useCallback((targetEmployee: User) => {
    if (!user || !targetEmployee) return false;
    
    // Только owner и head_manager могут редактировать
    return ['owner', 'head_manager'].includes(user.role);
  }, [user]);

  return { canViewEmployee, canViewHours, canEditEmployee };
};

export default usePermissions; 