
import { BarChart3, Users, ClipboardCheck, Calendar } from "lucide-react"
import { StatCard } from "./stat-card"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { Button } from "@/components/ui/button"
import { NotificationsPanel } from "./notifications-panel"

export function OwnerDashboard({ isLoading }: { isLoading: boolean }) {
  return (
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
      
      <NotificationsPanel />
    </div>
  )
}
