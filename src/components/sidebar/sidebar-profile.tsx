
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export function SidebarProfile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate("/")
  }

  if (!user) return null

  return (
    <div className="flex items-center justify-between">
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
      <Button
        variant="ghost"
        size="icon"
        onClick={handleLogout}
        className="ml-2"
      >
        <LogOut size={18} />
      </Button>
    </div>
  )
}
