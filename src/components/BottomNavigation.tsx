import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  Settings, 
  PalmtreeIcon
} from "lucide-react";

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  roles: string[];
}

export function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  if (!user) return null;
  
  const allRoles = ["owner", "head_manager", "manager", "supervisor", "staff"];
  const managerRoles = ["owner", "head_manager", "manager", "supervisor"];
  
  const navItems: NavItem[] = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard size={20} />,
      roles: allRoles,
    },
    {
      name: "Hours",
      path: "/hours",
      icon: <CalendarDays size={20} />,
      roles: allRoles,
    },
    {
      name: "Team",
      path: "/employees",
      icon: <Users size={20} />,
      roles: managerRoles,
    },
    {
      name: "Leave",
      path: "/leave/request",
      icon: <PalmtreeIcon size={20} />,
      roles: allRoles,
    },
    {
      name: "Settings",
      path: "/settings",
      icon: <Settings size={20} />,
      roles: allRoles,
    }
  ];

  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(user.role)
  );

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="bottom-navigation" data-role={user.role}>
      <div className="bottom-nav-container">
        {filteredNavItems.map((item) => (
          <button
            key={item.path}
            onClick={() => handleNavigation(item.path)}
            className={`bottom-nav-item ${isActive(item.path) ? "active" : ""}`}
            aria-label={item.name}
          >
            <div className="bottom-nav-icon">
              {item.icon}
            </div>
            <span className="bottom-nav-label">{item.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
} 