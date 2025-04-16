
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

    // Start with core items that everyone gets
    const items = [...navigationItems.core]

    // Add staff items for all authenticated users
    items.push(...navigationItems.staff)

    // Add role-specific items
    switch (user.role) {
      case 'head_manager':
        items.push(...navigationItems.head_manager)
        items.push(...navigationItems.manager)
        items.push(...navigationItems.supervisor)
        break
      case 'manager':
        items.push(...navigationItems.manager)
        items.push(...navigationItems.supervisor)
        break
      case 'supervisor':
        items.push(...navigationItems.supervisor)
        break
      default:
        // No additional items for basic cleaner role
        break
    }

    return items
  }

  const menuItems = getMenuItems()

  return (
    <SidebarMenu>
      {menuItems.map((item) => (
        <SidebarMenuItem key={item.title} active={location.pathname === item.path}>
          <SidebarMenuButton onClick={() => navigate(item.path)}>
            <item.icon size={18} />
            <span>{item.title}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}
