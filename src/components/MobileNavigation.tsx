import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  Settings, 
  LogOut,
  PalmtreeIcon,
  Calendar,
  User
} from "lucide-react";
import { useEffect } from "react";

export function MobileNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  
  // If no user (not logged in), don't show the navigation
  if (!user) return null;
  
  // Determine which menu items to show based on user role
  const isStaff = user.role === "staff";
  const isSupervisor = user.role === "supervisor";
  
  // Handle navigation
  const handleNavigation = (path: string) => {
    navigate(path);
  };
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // Define navigation items based on role
  const navItems = [];
  
  // Dashboard - For all roles
  navItems.push({
    name: "Dashboard",
    path: "/dashboard",
    icon: <LayoutDashboard size={20} />,
  });
  
  // Hours - For all roles
  navItems.push({
    name: "Hours",
    path: "/hours",
    icon: <CalendarDays size={20} />,
  });
  
  // Employees - Only for supervisor
  if (isSupervisor) {
    navItems.push({
      name: "Team",
      path: "/employees",
      icon: <Users size={20} />,
    });
  }
  
  // Leave Request - For staff and supervisor
  if (isStaff || isSupervisor) {
    navItems.push({
      name: "Leave",
      path: "/leave/request",
      icon: <PalmtreeIcon size={20} />,
    });
  }
  
  // Settings - For all roles
  navItems.push({
    name: "Settings",
    path: "/settings",
    icon: <Settings size={20} />,
  });

  return (
    <>
      {/* Mobile Header */}
      <div className="mobile-header show-on-mobile">
        <div className="mobile-header-title">
          <span>CleanTrack</span>
        </div>
        <div className="mobile-user-menu">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
              {user.name.charAt(0)}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <nav className="mobile-nav show-on-mobile">
        {navItems.map((item) => (
          <a
            key={item.path}
            href={item.path}
            className={`mobile-nav-item ${location.pathname === item.path ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              handleNavigation(item.path);
            }}
          >
            <div className="mobile-nav-icon">{item.icon}</div>
            <span>{item.name}</span>
          </a>
        ))}
      </nav>
    </>
  );
} 