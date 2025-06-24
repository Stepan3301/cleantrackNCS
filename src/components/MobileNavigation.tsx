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
  User,
  ChevronRight,
  ChevronLeft,
  Menu
} from "lucide-react";
import { useEffect } from "react";
import { useMobileNav } from "@/contexts/mobile-nav-context";


export function MobileNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isDrawerOpen, setIsDrawerOpen } = useMobileNav();
  
  // Toggle the navigation drawer
  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };
  
  // If no user (not logged in), don't show the navigation
  if (!user) return null;
  
  // Determine which menu items to show based on user role
  const isStaff = user.role === "staff";
  const isSupervisor = user.role === "supervisor";
  
  // Handle navigation
  const handleNavigation = (path: string) => {
    navigate(path);
    // Close drawer after navigation on mobile
    setIsDrawerOpen(false);
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
        <div className="mobile-header-toggle">
          <button 
            onClick={toggleDrawer} 
            className="mobile-toggle-btn"
            aria-label="Toggle navigation menu"
          >
            <Menu size={24} />
          </button>
        </div>
        
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
      
      {/* Mobile Side Navigation */}
      <div className={`mobile-side-nav show-on-mobile ${isDrawerOpen ? 'open' : ''}`}>
        <div className="mobile-nav-header">
          <div className="mobile-nav-brand">
            <div className="mobile-brand-icon">CT</div>
            <span>CleanTrack</span>
          </div>
          <button 
            onClick={toggleDrawer} 
            className="mobile-close-btn"
            aria-label="Close navigation menu"
          >
            <ChevronLeft size={24} />
          </button>
        </div>
        
        <div className="mobile-nav-items">
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
              <span className="mobile-nav-label">{item.name}</span>
            </a>
          ))}
          
          {/* Logout item at the bottom */}
          <a
            href="#"
            className="mobile-nav-item logout"
            onClick={(e) => {
              e.preventDefault();
              handleLogout();
            }}
          >
            <div className="mobile-nav-icon">
              <LogOut size={20} />
            </div>
            <span className="mobile-nav-label">Logout</span>
          </a>
        </div>
      </div>
      
      {/* Collapsed side nav toggle button (visible when drawer is closed) */}
      <div className={`mobile-drawer-toggle show-on-mobile ${isDrawerOpen ? 'hidden' : ''}`}>
        <button 
          onClick={toggleDrawer} 
          className="mobile-drawer-btn"
          aria-label="Open navigation menu"
        >
          <ChevronRight size={24} />
        </button>
      </div>
      
      {/* Overlay for closing the drawer when clicking outside */}
      {isDrawerOpen && (
        <div 
          className="mobile-drawer-overlay" 
          onClick={toggleDrawer}
          aria-hidden="true"
        />
      )}
    </>
  );
} 