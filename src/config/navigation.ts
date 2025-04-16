
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
  staff: [
    {
      title: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard
    },
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
  headManager: [
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
