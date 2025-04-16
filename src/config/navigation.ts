
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  BarChart3, 
  Settings, 
  FileText,
  Megaphone
} from "lucide-react"

export const navigationItems = {
  // Core items available to all authenticated users
  core: [
    {
      title: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard
    }
  ],
  // Staff level items (available to all roles)
  staff: [
    {
      title: "Hours",
      path: "/hours",
      icon: CalendarDays
    },
    {
      title: "Settings",
      path: "/settings",
      icon: Settings
    }
  ],
  // Role-specific items
  supervisor: [
    {
      title: "Employees",
      path: "/employees",
      icon: Users
    }
  ],
  manager: [
    {
      title: "Analytics",
      path: "/analytics",
      icon: BarChart3
    }
  ],
  head_manager: [
    {
      title: "Orders",
      path: "/orders",
      icon: FileText
    },
    {
      title: "Announcements",
      path: "/announcements",
      icon: Megaphone
    }
  ]
}
