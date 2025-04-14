
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { AuthContextProvider } from "@/contexts/auth-context"
import { useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <AuthContextProvider>
      <ShellContent>{children}</ShellContent>
    </AuthContextProvider>
  )
}

// Inner component to use auth hooks safely after context is provided
function ShellContent({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Authentication redirection logic would go here
  // This is a placeholder for the actual auth check
  useEffect(() => {
    // Example: Check if user is authenticated for protected routes
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true"
    const isPublicRoute = location.pathname === "/" || location.pathname === "/auth"
    
    if (!isAuthenticated && !isPublicRoute) {
      navigate("/")
    }
  }, [location.pathname, navigate])

  return (
    <>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <main className="flex-1 bg-background">
            <div className="container py-6">
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
      <Toaster />
      <Sonner />
    </>
  )
}
