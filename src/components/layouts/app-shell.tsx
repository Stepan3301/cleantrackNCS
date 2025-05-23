import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { useAuth } from "@/contexts/auth-context"
import { useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, isLoading } = useAuth()
  
  // Authentication redirection logic
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/")
    }
  }, [isAuthenticated, isLoading, location.pathname, navigate])

  // Show nothing while checking authentication
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

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

