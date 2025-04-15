
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/auth-context"
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  BarChart3, 
  Settings, 
  LogOut,
  ClipboardCheck,
  FileText,
  Megaphone
} from "lucide-react"

export function AppSidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  
  // If no user (not logged in), don't show the sidebar
  if (!user) return null
  
  // Determine which menu items to show based on user role
  const showOwnerContent = user.role === "owner"
  const showHeadManagerContent = ["owner", "head_manager"].includes(user.role)
  const showManagerContent = ["owner", "head_manager", "manager"].includes(user.role)
  const showSupervisorContent = ["owner", "head_manager", "manager", "supervisor"].includes(user.role)

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-white font-semibold">
            S
          </div>
          <span className="ml-2 text-lg font-medium text-sidebar-foreground">
            Sparkle
          </span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Dashboard - For all users */}
              <SidebarMenuItem active={location.pathname === "/dashboard"}>
                <SidebarMenuButton
                  onClick={() => navigate("/dashboard")}
                >
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {/* Employee Database - For supervisors and up */}
              {showSupervisorContent && (
                <SidebarMenuItem active={location.pathname === "/employees"}>
                  <SidebarMenuButton
                    onClick={() => navigate("/employees")}
                  >
                    <Users size={18} />
                    <span>Employees</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              
              {/* Calendar/Hours - For all users */}
              <SidebarMenuItem active={location.pathname === "/hours"}>
                <SidebarMenuButton
                  onClick={() => navigate("/hours")}
                >
                  <CalendarDays size={18} />
                  <span>Hours</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {/* Tasks - For supervisors and up */}
              {showSupervisorContent && (
                <SidebarMenuItem active={location.pathname === "/tasks"}>
                  <SidebarMenuButton
                    onClick={() => navigate("/tasks")}
                  >
                    <ClipboardCheck size={18} />
                    <span>Tasks</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              
              {/* Orders - For head managers and owners */}
              {showHeadManagerContent && (
                <SidebarMenuItem active={location.pathname === "/orders"}>
                  <SidebarMenuButton
                    onClick={() => navigate("/orders")}
                  >
                    <FileText size={18} />
                    <span>Orders</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              
              {/* Announcements - For head managers and owners */}
              {showHeadManagerContent && (
                <SidebarMenuItem active={location.pathname === "/announcements"}>
                  <SidebarMenuButton
                    onClick={() => navigate("/announcements")}
                  >
                    <Megaphone size={18} />
                    <span>Announcements</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              
              {/* Analytics - For managers and up */}
              {showManagerContent && (
                <SidebarMenuItem active={location.pathname === "/analytics"}>
                  <SidebarMenuButton
                    onClick={() => navigate("/analytics")}
                  >
                    <BarChart3 size={18} />
                    <span>Analytics</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Settings - For owner only */}
              {showOwnerContent && (
                <SidebarMenuItem active={location.pathname === "/settings"}>
                  <SidebarMenuButton
                    onClick={() => navigate("/settings")}
                  >
                    <Settings size={18} />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              
              {/* Logout - For all users */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => {
                    logout()
                    navigate("/")
                  }}
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            {user.name?.charAt(0) || "U"}
          </div>
          <div className="ml-2">
            <div className="text-sm font-medium text-sidebar-foreground">
              {user.name || "User"}
            </div>
            <div className="text-xs text-muted-foreground capitalize">
              {user.role || "Staff"}
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
