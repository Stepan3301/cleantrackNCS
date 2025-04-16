
import { useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/auth-context"
import { navigationItems } from "@/config/navigation"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function SidebarNavigation() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  // Get available menu items based on user role
  const getMenuItems = () => {
    if (!user) return []

    const items = [...navigationItems.staff]

    if (["supervisor", "manager", "head_manager", "owner"].includes(user.role)) {
      items.push(...navigationItems.supervisor)
    }

    if (["manager", "head_manager", "owner"].includes(user.role)) {
      items.push(...navigationItems.manager)
    }

    if (["head_manager", "owner"].includes(user.role)) {
      items.push(...navigationItems.headManager)
    }

    return items
  }

  const menuItems = getMenuItems()

  return (
    <SidebarMenu>
      {menuItems.map((item) => (
        <SidebarMenuItem key={item.title} active={location.pathname === item.path}>
          <SidebarMenuButton
            onClick={() => navigate(item.path)}
          >
            <item.icon size={18} />
            <span>{item.title}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}
