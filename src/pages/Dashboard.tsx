
import { useEffect, useState } from "react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { useAuth } from "@/contexts/auth-context"
import { 
  BarChart3, 
  Users, 
  ClipboardCheck, 
  Calendar,
  ArrowUpCircle,
  TrendingUp
} from "lucide-react"
import { Button } from "@/components/ui/button"

// Sample data interfaces
interface StatCardProps {
  title: string
  value: number | string
  icon: React.ReactNode
  change?: number
  isPositive?: boolean
}

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

  const StatCard = ({ title, value, icon, change, isPositive }: StatCardProps) => (
    <div className="bg-white rounded-lg border border-border p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-3xl font-bold mt-2">{value}</h3>
          
          {change !== undefined && (
            <div className={`flex items-center mt-2 text-sm ${isPositive ? 'text-success' : 'text-destructive'}`}>
              {isPositive ? <ArrowUpCircle size={14} className="mr-1" /> : <TrendingUp size={14} className="mr-1" />}
              <span>{change}% {isPositive ? 'increase' : 'decrease'}</span>
            </div>
          )}
        </div>
        <div className="bg-primary/10 p-3 rounded-full">
          {icon}
        </div>
      </div>
    </div>
  )

  // Render different dashboards based on user role
  const renderOwnerDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Employees"
          value={42}
          icon={<Users size={24} className="text-primary" />}
          change={5}
          isPositive={true}
        />
        <StatCard
          title="Completed Jobs"
          value={356}
          icon={<ClipboardCheck size={24} className="text-primary" />}
          change={12}
          isPositive={true}
        />
        <StatCard
          title="Total Hours"
          value="2,345"
          icon={<Calendar size={24} className="text-primary" />}
          change={3}
          isPositive={true}
        />
        <StatCard
          title="Revenue"
          value="AED 125,400"
          icon={<BarChart3 size={24} className="text-primary" />}
          change={8}
          isPositive={true}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardCard 
          title="Monthly Performance" 
          description="Team performance over the last 30 days"
          icon={<BarChart3 size={16} />}
          isLoading={isLoading}
          footer={
            <div className="w-full flex justify-between items-center pt-2">
              <span className="text-sm text-muted-foreground">Updated 2 hours ago</span>
              <Button variant="link" size="sm">View Details</Button>
            </div>
          }
        >
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl font-bold">87%</div>
              <p className="text-muted-foreground">Efficiency Rate</p>
            </div>
          </div>
        </DashboardCard>
        
        <DashboardCard 
          title="Employee Overview" 
          description="Staff distribution by role"
          icon={<Users size={16} />}
          isLoading={isLoading}
          footer={
            <div className="w-full flex justify-between items-center pt-2">
              <span className="text-sm text-muted-foreground">Updated 4 hours ago</span>
              <Button variant="link" size="sm" onClick={() => window.location.href = "/employees"}>
                View All Employees
              </Button>
            </div>
          }
        >
          <div className="h-[300px]">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-secondary/50 rounded-md">
                <h4 className="font-medium">Management</h4>
                <div className="text-3xl font-bold mt-2">8</div>
                <p className="text-sm text-muted-foreground">19% of staff</p>
              </div>
              <div className="p-4 bg-secondary/50 rounded-md">
                <h4 className="font-medium">Supervisors</h4>
                <div className="text-3xl font-bold mt-2">12</div>
                <p className="text-sm text-muted-foreground">29% of staff</p>
              </div>
              <div className="p-4 bg-secondary/50 rounded-md">
                <h4 className="font-medium">Cleaners</h4>
                <div className="text-3xl font-bold mt-2">22</div>
                <p className="text-sm text-muted-foreground">52% of staff</p>
              </div>
              <div className="p-4 bg-primary/10 rounded-md border-2 border-dashed border-primary/30">
                <h4 className="font-medium text-primary">New Hires</h4>
                <div className="text-3xl font-bold mt-2 text-primary">3</div>
                <p className="text-sm text-primary/70">Last 30 days</p>
              </div>
            </div>
          </div>
        </DashboardCard>
      </div>
      
      <div className="bg-white rounded-lg border border-border p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Notifications</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3 pb-3 border-b border-border">
            <div className="w-8 h-8 rounded-full bg-info flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-plus"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="16" x2="22" y1="11" y2="11"/></svg>
            </div>
            <div>
              <p className="font-medium">New Registration Request</p>
              <p className="text-sm text-muted-foreground">Ahmed Mahmoud has requested to join as a Supervisor</p>
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="outline">Approve</Button>
                <Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10">
                  Deny
                </Button>
              </div>
            </div>
            <div className="text-xs text-muted-foreground whitespace-nowrap">
              2 hours ago
            </div>
          </div>
          
          <div className="flex items-start gap-3 pb-3 border-b border-border">
            <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle-2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
            </div>
            <div>
              <p className="font-medium">Monthly Report Ready</p>
              <p className="text-sm text-muted-foreground">March 2023 performance report is ready for review</p>
              <Button size="sm" variant="link" className="px-0 py-0 h-auto mt-1">View Report</Button>
            </div>
            <div className="text-xs text-muted-foreground whitespace-nowrap">
              Yesterday
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-warning flex items-center justify-center text-black">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-alert-circle"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
            </div>
            <div>
              <p className="font-medium">Task Allocation Alert</p>
              <p className="text-sm text-muted-foreground">3 cleaners are under their target hours for this month</p>
              <Button size="sm" variant="link" className="px-0 py-0 h-auto mt-1">Review Hours</Button>
            </div>
            <div className="text-xs text-muted-foreground whitespace-nowrap">
              3 days ago
            </div>
          </div>
        </div>
      </div>
    </div>
  )
  
  // Staff Dashboard
  const renderStaffDashboard = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-border p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Your Performance</h2>
          <Button variant="outline" size="sm">
            <Calendar size={16} className="mr-2" />
            April 2023
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-secondary/30 rounded-lg p-4 flex flex-col">
            <span className="text-sm text-muted-foreground">Target Hours</span>
            <span className="text-3xl font-bold mt-1">160</span>
            <span className="text-xs text-muted-foreground mt-auto">Monthly Goal</span>
          </div>
          
          <div className="bg-secondary/30 rounded-lg p-4 flex flex-col">
            <span className="text-sm text-muted-foreground">Completed Hours</span>
            <span className="text-3xl font-bold mt-1">132</span>
            <span className="text-xs text-success mt-auto">82.5% of target</span>
          </div>
          
          <div className="bg-secondary/30 rounded-lg p-4 flex flex-col">
            <span className="text-sm text-muted-foreground">Current Bonus</span>
            <span className="text-3xl font-bold mt-1">AED 250</span>
            <span className="text-xs text-primary mt-auto">Projected: AED 400</span>
          </div>
        </div>
        
        <div className="mt-8">
          <h3 className="font-medium mb-3">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <div>
                <p className="font-medium">Dubai Marina Residence</p>
                <p className="text-sm text-muted-foreground">Regular Cleaning</p>
              </div>
              <div className="text-right">
                <p className="font-medium">8 hours</p>
                <p className="text-xs text-muted-foreground">Apr 14, 2023</p>
              </div>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <div>
                <p className="font-medium">Business Bay Office</p>
                <p className="text-sm text-muted-foreground">Deep Cleaning</p>
              </div>
              <div className="text-right">
                <p className="font-medium">6 hours</p>
                <p className="text-xs text-muted-foreground">Apr 12, 2023</p>
              </div>
            </div>
            <div className="flex justify-between items-center pb-2">
              <div>
                <p className="font-medium">JBR Apartment Complex</p>
                <p className="text-sm text-muted-foreground">Move-Out Cleaning</p>
              </div>
              <div className="text-right">
                <p className="font-medium">9 hours</p>
                <p className="text-xs text-muted-foreground">Apr 10, 2023</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-border p-6">
          <h3 className="font-semibold mb-4">Your Upcoming Schedule</h3>
          <div className="space-y-3">
            <div className="flex gap-3 items-start pb-3 border-b border-border">
              <div className="bg-primary/10 p-2 rounded-md text-center min-w-[3rem]">
                <div className="text-xs text-muted-foreground">APR</div>
                <div className="font-bold text-primary">15</div>
              </div>
              <div>
                <p className="font-medium">Downtown Apartment</p>
                <p className="text-sm text-muted-foreground">09:00 AM - 05:00 PM</p>
                <div className="flex items-center mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-success mr-1"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  <span className="text-xs text-muted-foreground">Assigned by Mohammed</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 items-start">
              <div className="bg-primary/10 p-2 rounded-md text-center min-w-[3rem]">
                <div className="text-xs text-muted-foreground">APR</div>
                <div className="font-bold text-primary">17</div>
              </div>
              <div>
                <p className="font-medium">Palm Jumeirah Villa</p>
                <p className="text-sm text-muted-foreground">10:00 AM - 02:00 PM</p>
                <div className="flex items-center mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-warning mr-1"><path d="M12 9v4l2 2"/><path d="M5 19a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4l2 2h4a2 2 0 0 1 2 2v1"/><circle cx="17" cy="17" r="3"/><path d="M21 17h-4"/></svg>
                  <span className="text-xs text-warning">Pending confirmation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-border p-6">
          <h3 className="font-semibold mb-4">Announcements</h3>
          <div className="space-y-4">
            <div className="pb-3 border-b border-border">
              <h4 className="font-medium">New Cleaning Protocol</h4>
              <p className="text-sm text-muted-foreground mt-1">Updated procedures for eco-friendly cleaning products are now in effect.</p>
              <div className="flex justify-between items-center mt-2">
                <Button variant="link" size="sm" className="p-0 h-auto">Read More</Button>
                <span className="text-xs text-muted-foreground">2 days ago</span>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium">Team Meeting</h4>
              <p className="text-sm text-muted-foreground mt-1">Monthly staff meeting scheduled for April 20th at 6:00 PM.</p>
              <div className="flex justify-between items-center mt-2">
                <Button variant="link" size="sm" className="p-0 h-auto">RSVP</Button>
                <span className="text-xs text-muted-foreground">1 week ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>
      
      {/* Render different dashboard based on user role */}
      {user?.role === "owner" || user?.role === "head_manager" 
        ? renderOwnerDashboard() 
        : renderStaffDashboard()}
    </div>
  )
}

export default Dashboard
