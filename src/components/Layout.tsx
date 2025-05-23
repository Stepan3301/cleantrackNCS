import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';

// Define a simple theme hook until we have the proper theme-provider
const useTheme = () => {
  const [theme, setTheme] = React.useState('light');
  
  return { theme, setTheme };
};

import {
  CalendarIcon,
  LayoutDashboardIcon,
  ClockIcon,
  UsersIcon,
  BellIcon,
  BarChartIcon,
  LogOutIcon,
  MoonIcon,
  SunIcon,
  PalmtreeIcon,
  CalendarCheckIcon,
  SettingsIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// Define role types
type Role = 'staff' | 'supervisor' | 'manager' | 'head_manager' | 'owner';

const NAV_ITEMS = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboardIcon className="w-5 h-5" />,
    roles: ['staff', 'supervisor', 'manager', 'head_manager', 'owner'] as Role[],
  },
  {
    title: 'Hours',
    href: '/hours',
    icon: <ClockIcon className="w-5 h-5" />,
    roles: ['staff', 'supervisor', 'manager', 'head_manager', 'owner'] as Role[],
  },
  {
    title: 'Staff Hours',
    href: '/staff-hours',
    icon: <CalendarIcon className="w-5 h-5" />,
    roles: ['manager', 'head_manager', 'owner'] as Role[],
  },
  {
    title: 'Employees',
    href: '/employees',
    icon: <UsersIcon className="w-5 h-5" />,
    roles: ['manager', 'head_manager', 'owner'] as Role[],
  },
  {
    title: 'Bonuses',
    href: '/bonuses',
    icon: <BarChartIcon className="w-5 h-5" />,
    roles: ['manager', 'head_manager', 'owner'] as Role[],
  },
  {
    title: 'Target Hours',
    href: '/targets',
    icon: <CalendarCheckIcon className="w-5 h-5" />,
    roles: ['manager', 'head_manager', 'owner'] as Role[],
  },
  {
    title: 'Announcements',
    href: '/announcements',
    icon: <BellIcon className="w-5 h-5" />,
    roles: ['staff', 'supervisor', 'manager', 'head_manager', 'owner'] as Role[],
  },
  {
    title: 'Request Leave',
    href: '/request-leave',
    icon: <PalmtreeIcon className="w-5 h-5" />,
    roles: ['staff', 'supervisor'] as Role[],
  },
  {
    title: 'Manage Leave',
    href: '/manage-leave',
    icon: <CalendarCheckIcon className="w-5 h-5" />,
    roles: ['manager', 'head_manager', 'owner'] as Role[],
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: <SettingsIcon className="w-5 h-5" />,
    roles: ['staff', 'supervisor', 'manager', 'head_manager', 'owner'] as Role[],
  },
];

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  
  // Debug: Log user role to console
  console.log('User role:', user?.role);
  
  const filteredNavItems = NAV_ITEMS.filter(item => 
    user && item.roles.includes(user.role as Role)
  );
  
  // Debug: Log filtered navigation items
  console.log('Filtered nav items:', filteredNavItems.map(item => item.title));

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-background border-r flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">CleanTrack</h1>
        </div>
        
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-2">
            {filteredNavItems.map((item) => (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground ${
                    location.pathname === item.href
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  {item.icon}
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-4 border-t">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>
                  {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={logout}
          >
            <LogOutIcon className="mr-2 h-4 w-4" />
            Log out
          </Button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
};

export default Layout; 