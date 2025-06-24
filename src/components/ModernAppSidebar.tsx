import { useNavigate, useLocation } from "react-router-dom";
import { useAuth, User } from "@/contexts/auth-context";
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  Settings, 
  LogOut,
  Megaphone,
  Target,
  UserPlus,
  DollarSign,
  PalmtreeIcon,
  CalendarCheck,
  UserCog
} from "lucide-react";
import { useEffect, useState } from "react";
import { registrationRequestsService } from "@/lib/services/registration-requests-service";
import { Badge } from "@/components/ui/badge";
import '../styles/modern-sidebar.css';
import { setupSidebarNavigation } from "@/lib/sidebar-utils";

interface ModernAppSidebarProps {
  user: User;
  logout: () => void;
}

export function ModernAppSidebar({ user, logout }: ModernAppSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  
  // If no user (not logged in), don't show the sidebar
  if (!user) return null;
  
  // Determine which menu items to show based on user role
  const showOwnerContent = user.role === "owner";
  const showHeadManagerContent = ["owner", "head_manager"].includes(user.role);
  const showManagerContent = ["owner", "head_manager", "manager"].includes(user.role);
  const showSupervisorContent = ["owner", "head_manager", "manager", "supervisor"].includes(user.role);
  const showStaffContent = ["staff", "supervisor"].includes(user.role);

  // Set up sidebar navigation (active link highlighting)
  useEffect(() => {
    setupSidebarNavigation();
  }, [location.pathname]);
  
  // Fetch pending registration requests for owners/head managers
  useEffect(() => {
    if (showHeadManagerContent) {
      const fetchPendingRequests = async () => {
        try {
          const requests = await registrationRequestsService.getPendingRequests();
          setPendingRequestsCount(requests.length);
        } catch (error) {
          console.error("Error fetching pending requests:", error);
        }
      };
      
      fetchPendingRequests();
      
      // Poll for new requests every 5 minutes
      const interval = setInterval(fetchPendingRequests, 5 * 60 * 1000);
      
      return () => clearInterval(interval);
    }
  }, [showHeadManagerContent]);
  
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

  return (
    <nav className="sidebar-nav">
      <div className="sidebar-logo">
        <div className="sidebar-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="#7fffd4" fillOpacity="0.2" />
            <path d="M8 13l2 2 6-6" stroke="#7fffd4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span>SparkleNCS</span>
      </div>

      <div className="sidebar-menu">
        {/* Dashboard - For all users */}
        <a 
          href="/dashboard" 
          className={`sidebar-link ${location.pathname === "/dashboard" ? "active" : ""}`}
          onClick={(e) => { e.preventDefault(); handleNavigation("/dashboard"); }}
        >
          <div className="sidebar-icon">
            <LayoutDashboard size={22} />
          </div>
          <span>Dashboard</span>
        </a>
        
        {/* Hours - For all users */}
        <a 
          href="/hours" 
          className={`sidebar-link ${location.pathname === "/hours" ? "active" : ""}`}
          onClick={(e) => { e.preventDefault(); handleNavigation("/hours"); }}
        >
          <div className="sidebar-icon">
            <CalendarDays size={22} />
          </div>
          <span>Hours</span>
        </a>
        
        {/* Employee Database - For supervisors and up */}
        {showSupervisorContent && (
          <a 
            href="/employees" 
            className={`sidebar-link ${location.pathname === "/employees" ? "active" : ""}`}
            onClick={(e) => { e.preventDefault(); handleNavigation("/employees"); }}
          >
            <div className="sidebar-icon">
              <Users size={22} />
            </div>
            <span>Employees</span>
          </a>
        )}
        
        {/* Registration Requests - For managers and up */}
        {showManagerContent && (
          <a 
            href="/registration-requests" 
            className={`sidebar-link ${location.pathname === "/registration-requests" ? "active" : ""}`}
            onClick={(e) => { e.preventDefault(); handleNavigation("/registration-requests"); }}
          >
            <div className="sidebar-icon">
              <UserPlus size={22} />
            </div>
            <span>
              Registration Requests
              {pendingRequestsCount > 0 && (
                <Badge variant="destructive" className="ml-2 px-1.5 py-0.5 h-5 min-w-[1.25rem] flex items-center justify-center">
                  {pendingRequestsCount}
                </Badge>
              )}
            </span>
          </a>
        )}
        
        {/* Bonuses - For managers and up */}
        {showManagerContent && (
          <a 
            href="/bonuses" 
            className={`sidebar-link ${location.pathname === "/bonuses" ? "active" : ""}`}
            onClick={(e) => { e.preventDefault(); handleNavigation("/bonuses"); }}
          >
            <div className="sidebar-icon">
              <DollarSign size={22} />
            </div>
            <span>Bonuses</span>
          </a>
        )}
        
        {/* Announcements - For head managers and owners */}
        {showHeadManagerContent && (
          <a 
            href="/announcements" 
            className={`sidebar-link ${location.pathname === "/announcements" ? "active" : ""}`}
            onClick={(e) => { e.preventDefault(); handleNavigation("/announcements"); }}
          >
            <div className="sidebar-icon">
              <Megaphone size={22} />
            </div>
            <span>Announcements</span>
          </a>
        )}
        
        {/* Manage Roles - For head managers and owners */}
        {showHeadManagerContent && (
          <a 
            href="/manage-roles" 
            className={`sidebar-link ${location.pathname === "/manage-roles" ? "active" : ""}`}
            onClick={(e) => { e.preventDefault(); handleNavigation("/manage-roles"); }}
          >
            <div className="sidebar-icon">
              <UserCog size={22} />
            </div>
            <span>Manage Roles</span>
          </a>
        )}
        
        {/* Targets - For managers and up */}
        {showManagerContent && (
          <a 
            href="/targets" 
            className={`sidebar-link ${location.pathname === "/targets" ? "active" : ""}`}
            onClick={(e) => { e.preventDefault(); handleNavigation("/targets"); }}
          >
            <div className="sidebar-icon">
              <Target size={22} />
            </div>
            <span>Target Hours</span>
          </a>
        )}
        
        {/* Request Leave - For staff and supervisors */}
        {showStaffContent && (
          <a 
            href="/leave/request" 
            className={`sidebar-link ${location.pathname === "/leave/request" ? "active" : ""}`}
            onClick={(e) => { e.preventDefault(); handleNavigation("/leave/request"); }}
          >
            <div className="sidebar-icon">
              <PalmtreeIcon size={22} />
            </div>
            <span>Request Leave</span>
          </a>
        )}
        
        {/* Manage Leave Requests - For managers and up, not supervisors */}
        {showManagerContent && (
          <a 
            href="/leave/manage" 
            className={`sidebar-link ${location.pathname === "/leave/manage" ? "active" : ""}`}
            onClick={(e) => { e.preventDefault(); handleNavigation("/leave/manage"); }}
          >
            <div className="sidebar-icon">
              <CalendarCheck size={22} />
            </div>
            <span>Manage Leave</span>
          </a>
        )}
        
        {/* Settings - For all users */}
        <a 
          href="/settings" 
          className={`sidebar-link ${location.pathname === "/settings" ? "active" : ""}`}
          onClick={(e) => { e.preventDefault(); handleNavigation("/settings"); }}
        >
          <div className="sidebar-icon">
            <Settings size={22} />
          </div>
          <span>Settings</span>
        </a>
        
        {/* Logout - For all users */}
        <a 
          href="#" 
          className="sidebar-link"
          onClick={(e) => { e.preventDefault(); handleLogout(); }}
        >
          <div className="sidebar-icon">
            <LogOut size={22} />
          </div>
          <span>Logout</span>
        </a>
      </div>
      
      {/* User info */}
      <div className="sidebar-user">
        <div className="sidebar-user-avatar">
          {user.avatar_url ? (
            <img 
              src={user.avatar_url} 
              alt={user.name} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            user.name?.charAt(0) || '?'
          )}
        </div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">{user.name}</div>
          <div className="sidebar-user-role">{user.role.replace('_', ' ')}</div>
        </div>
      </div>
    </nav>
  );
}