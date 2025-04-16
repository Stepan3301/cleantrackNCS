
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { OwnerDashboard } from "@/components/dashboard/owner-dashboard"
import { StaffDashboard } from "@/components/dashboard/staff-dashboard"

const Dashboard = () => {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  
  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>
      
      {user?.role === "owner" || user?.role === "head_manager" 
        ? <OwnerDashboard isLoading={isLoading} />
        : <StaffDashboard />}
    </div>
  )
}

export default Dashboard
