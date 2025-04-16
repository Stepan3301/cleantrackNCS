
import { useState, useEffect } from "react"
import { BarChart3, Users, ClipboardCheck, Calendar } from "lucide-react"
import { StatCard } from "./stat-card"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { Button } from "@/components/ui/button"
import { NotificationsPanel } from "./notifications-panel"
import { supabase } from "@/integrations/supabase/client"
import { formatValue, formatCurrency, formatNumber } from "@/lib/format"

interface DashboardStats {
  activeEmployees: number | null;
  completedJobs: number | null;
  totalHours: number | null;
  revenue: number | null;
  employeeDistribution: {
    management: number;
    supervisors: number;
    cleaners: number;
    newHires: number;
  } | null;
  performanceRate: number | null;
}

export function OwnerDashboard({ isLoading: initialLoading }: { isLoading: boolean }) {
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [stats, setStats] = useState<DashboardStats>({
    activeEmployees: null,
    completedJobs: null,
    totalHours: null,
    revenue: null,
    employeeDistribution: null,
    performanceRate: null
  });

  useEffect(() => {
    // Only proceed when initialLoading is false
    if (initialLoading) return;

    async function fetchDashboardData() {
      setIsLoading(true);
      
      try {
        // Get active employees count
        const { count: activeEmployees } = await supabase
          .from('users_profiles')
          .select('*', { count: 'exact', head: true });
        
        // Get total hours worked across all employees
        const { data: hourData } = await supabase
          .from('daily_hours')
          .select('hours')
          .gte('date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());
        
        const totalHours = hourData ? hourData.reduce((sum, record) => sum + (record.hours || 0), 0) : 0;
        
        // Get employee distribution by role
        const { data: roleDistribution } = await supabase
          .from('users_profiles')
          .select('role, count')
          .select('role');
        
        const roleCounts = {
          management: 0,
          supervisors: 0, 
          cleaners: 0,
          newHires: 0
        };
        
        if (roleDistribution) {
          roleDistribution.forEach(user => {
            if (user.role === 'head_manager' || user.role === 'manager') {
              roleCounts.management += 1;
            } else if (user.role === 'supervisor') {
              roleCounts.supervisors += 1;
            } else if (user.role === 'staff') {
              roleCounts.cleaners += 1;
            }
          });
          
          // Get new hires (users added in the last 30 days)
          const { count: newHiresCount } = await supabase
            .from('users_profiles')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
          
          roleCounts.newHires = newHiresCount || 0;
        }
        
        setStats({
          activeEmployees,
          completedJobs: 356, // Placeholder - no jobs table yet
          totalHours,
          revenue: 125400, // Placeholder - no revenue table yet
          employeeDistribution: roleCounts,
          performanceRate: 87 // Placeholder - no performance metrics yet
        });
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchDashboardData();
  }, [initialLoading]);

  const employeeDistribution = stats.employeeDistribution;
  const totalEmployees = employeeDistribution ? 
    employeeDistribution.management + employeeDistribution.supervisors + employeeDistribution.cleaners : 
    0;
    
  const getPercentage = (value: number) => {
    return totalEmployees > 0 ? Math.round((value / totalEmployees) * 100) : 0;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Employees"
          value={formatValue(stats.activeEmployees)}
          icon={<Users size={24} className="text-primary" />}
          change={5}
          isPositive={true}
          isLoading={isLoading}
        />
        <StatCard
          title="Completed Jobs"
          value={formatValue(stats.completedJobs)}
          icon={<ClipboardCheck size={24} className="text-primary" />}
          change={12}
          isPositive={true}
          isLoading={isLoading}
        />
        <StatCard
          title="Total Hours"
          value={formatValue(stats.totalHours, formatNumber)}
          icon={<Calendar size={24} className="text-primary" />}
          change={3}
          isPositive={true}
          isLoading={isLoading}
        />
        <StatCard
          title="Revenue"
          value={formatValue(stats.revenue, formatCurrency)}
          icon={<BarChart3 size={24} className="text-primary" />}
          change={8}
          isPositive={true}
          isLoading={isLoading}
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
              <div className="text-4xl font-bold">{formatValue(stats.performanceRate)}%</div>
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
          {employeeDistribution && (
            <div className="h-[300px]">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-secondary/50 rounded-md">
                  <h4 className="font-medium">Management</h4>
                  <div className="text-3xl font-bold mt-2">{employeeDistribution.management || "-"}</div>
                  <p className="text-sm text-muted-foreground">
                    {getPercentage(employeeDistribution.management)}% of staff
                  </p>
                </div>
                <div className="p-4 bg-secondary/50 rounded-md">
                  <h4 className="font-medium">Supervisors</h4>
                  <div className="text-3xl font-bold mt-2">{employeeDistribution.supervisors || "-"}</div>
                  <p className="text-sm text-muted-foreground">
                    {getPercentage(employeeDistribution.supervisors)}% of staff
                  </p>
                </div>
                <div className="p-4 bg-secondary/50 rounded-md">
                  <h4 className="font-medium">Cleaners</h4>
                  <div className="text-3xl font-bold mt-2">{employeeDistribution.cleaners || "-"}</div>
                  <p className="text-sm text-muted-foreground">
                    {getPercentage(employeeDistribution.cleaners)}% of staff
                  </p>
                </div>
                <div className="p-4 bg-primary/10 rounded-md border-2 border-dashed border-primary/30">
                  <h4 className="font-medium text-primary">New Hires</h4>
                  <div className="text-3xl font-bold mt-2 text-primary">{employeeDistribution.newHires || "-"}</div>
                  <p className="text-sm text-primary/70">Last 30 days</p>
                </div>
              </div>
            </div>
          )}
        </DashboardCard>
      </div>
      
      <NotificationsPanel />
    </div>
  )
}
