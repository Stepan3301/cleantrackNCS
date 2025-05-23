
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { 
  CalendarRange, 
  ArrowDownUp,
  TrendingUp,
  Users,
  Clock,
  ArrowRight,
  BarChart3,
  LineChart,
  PieChart
} from "lucide-react"

const Analytics = () => {
  const [dateRange, setDateRange] = useState("month")
  
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Performance Analytics</h1>
        
        <div className="flex items-center space-x-2">
          <CalendarRange size={18} className="text-muted-foreground" />
          <div className="flex bg-white rounded-md border border-border overflow-hidden">
            <Button 
              variant={dateRange === "week" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-none"
              onClick={() => setDateRange("week")}
            >
              Week
            </Button>
            <Button 
              variant={dateRange === "month" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-none"
              onClick={() => setDateRange("month")}
            >
              Month
            </Button>
            <Button 
              variant={dateRange === "quarter" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-none"
              onClick={() => setDateRange("quarter")}
            >
              Quarter
            </Button>
            <Button 
              variant={dateRange === "year" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-none"
              onClick={() => setDateRange("year")}
            >
              Year
            </Button>
          </div>
        </div>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Hours */}
        <div className="bg-white rounded-lg border border-border p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-sm text-muted-foreground block">Total Hours</span>
              <div className="flex items-baseline mt-1">
                <span className="text-3xl font-bold">2,384</span>
                <span className="text-xs text-success flex items-center ml-2">
                  <TrendingUp size={12} className="mr-0.5" />
                  +8.2%
                </span>
              </div>
            </div>
            <div className="bg-primary/10 p-2 rounded-full">
              <Clock size={20} className="text-primary" />
            </div>
          </div>
          <div className="flex justify-between items-baseline text-xs">
            <span className="text-muted-foreground">vs 2,203 prev period</span>
            <button className="text-primary flex items-center">
              Details <ArrowRight size={12} className="ml-1" />
            </button>
          </div>
        </div>
        
        {/* Completed Jobs */}
        <div className="bg-white rounded-lg border border-border p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-sm text-muted-foreground block">Completed Jobs</span>
              <div className="flex items-baseline mt-1">
                <span className="text-3xl font-bold">352</span>
                <span className="text-xs text-success flex items-center ml-2">
                  <TrendingUp size={12} className="mr-0.5" />
                  +12.4%
                </span>
              </div>
            </div>
            <div className="bg-primary/10 p-2 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
            </div>
          </div>
          <div className="flex justify-between items-baseline text-xs">
            <span className="text-muted-foreground">vs 313 prev period</span>
            <button className="text-primary flex items-center">
              Details <ArrowRight size={12} className="ml-1" />
            </button>
          </div>
        </div>
        
        {/* Active Employees */}
        <div className="bg-white rounded-lg border border-border p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-sm text-muted-foreground block">Active Employees</span>
              <div className="flex items-baseline mt-1">
                <span className="text-3xl font-bold">42</span>
                <span className="text-xs text-success flex items-center ml-2">
                  <TrendingUp size={12} className="mr-0.5" />
                  +5.0%
                </span>
              </div>
            </div>
            <div className="bg-primary/10 p-2 rounded-full">
              <Users size={20} className="text-primary" />
            </div>
          </div>
          <div className="flex justify-between items-baseline text-xs">
            <span className="text-muted-foreground">vs 40 prev period</span>
            <button className="text-primary flex items-center">
              Details <ArrowRight size={12} className="ml-1" />
            </button>
          </div>
        </div>
        
        {/* Efficiency Rate */}
        <div className="bg-white rounded-lg border border-border p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-sm text-muted-foreground block">Efficiency Rate</span>
              <div className="flex items-baseline mt-1">
                <span className="text-3xl font-bold">93.8%</span>
                <span className="text-xs text-success flex items-center ml-2">
                  <TrendingUp size={12} className="mr-0.5" />
                  +2.1%
                </span>
              </div>
            </div>
            <div className="bg-primary/10 p-2 rounded-full">
              <ArrowDownUp size={20} className="text-primary" />
            </div>
          </div>
          <div className="flex justify-between items-baseline text-xs">
            <span className="text-muted-foreground">vs 91.7% prev period</span>
            <button className="text-primary flex items-center">
              Details <ArrowRight size={12} className="ml-1" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardCard
          title="Hours Distribution"
          description="Hours by department and role"
          icon={<BarChart3 size={16} />}
        >
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <BarChart3 size={24} className="text-primary" />
              </div>
              <p className="text-muted-foreground">
                Chart visualization would appear here
              </p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
                <div className="p-2 rounded bg-secondary/50">
                  <div className="font-medium">Staff</div>
                  <div>1,462 hrs</div>
                </div>
                <div className="p-2 rounded bg-secondary/50">
                  <div className="font-medium">Supervisors</div>
                  <div>648 hrs</div>
                </div>
                <div className="p-2 rounded bg-secondary/50">
                  <div className="font-medium">Managers</div>
                  <div>274 hrs</div>
                </div>
              </div>
            </div>
          </div>
        </DashboardCard>
        
        <DashboardCard
          title="Performance Trends"
          description="Month-by-month comparison"
          icon={<LineChart size={16} />}
        >
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <LineChart size={24} className="text-primary" />
              </div>
              <p className="text-muted-foreground mb-4">
                Chart visualization would appear here
              </p>
              <div className="inline-flex items-center p-1 bg-secondary/50 rounded-md">
                <div className="flex items-center px-3 py-1">
                  <div className="w-3 h-3 bg-primary rounded-full mr-2"></div>
                  <span className="text-xs">Hours</span>
                </div>
                <div className="flex items-center px-3 py-1">
                  <div className="w-3 h-3 bg-success rounded-full mr-2"></div>
                  <span className="text-xs">Efficiency</span>
                </div>
                <div className="flex items-center px-3 py-1">
                  <div className="w-3 h-3 bg-warning rounded-full mr-2"></div>
                  <span className="text-xs">Target</span>
                </div>
              </div>
            </div>
          </div>
        </DashboardCard>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performers */}
        <DashboardCard
          title="Top Performers"
          description="Based on efficiency & hours"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-border">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg font-semibold">
                1
              </div>
              <div className="flex-1">
                <div className="font-medium">Mohammed Ali</div>
                <div className="text-sm text-muted-foreground">Supervisor • 98.2% Efficiency</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">160 hrs</div>
                <div className="text-xs text-success">100% of target</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 pb-3 border-b border-border">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg font-semibold">
                2
              </div>
              <div className="flex-1">
                <div className="font-medium">Layla Nasser</div>
                <div className="text-sm text-muted-foreground">Staff • 97.5% Efficiency</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">140 hrs</div>
                <div className="text-xs text-success">100% of target</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg font-semibold">
                3
              </div>
              <div className="flex-1">
                <div className="font-medium">Ahmed Mahmoud</div>
                <div className="text-sm text-muted-foreground">Supervisor • 95.8% Efficiency</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">142 hrs</div>
                <div className="text-xs text-success">88.8% of target</div>
              </div>
            </div>
          </div>
        </DashboardCard>
        
        {/* Location Distribution */}
        <DashboardCard
          title="Location Distribution"
          description="Hours by service location"
          icon={<PieChart size={16} />}
        >
          <div className="h-[220px] flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <PieChart size={24} className="text-primary" />
              </div>
              <p className="text-muted-foreground">
                Chart visualization would appear here
              </p>
              <div className="flex justify-center gap-4 mt-4 text-xs">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-primary rounded-full mr-1"></div>
                  <span>Dubai Marina</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-success rounded-full mr-1"></div>
                  <span>Palm Jumeirah</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-info rounded-full mr-1"></div>
                  <span>Business Bay</span>
                </div>
              </div>
            </div>
          </div>
        </DashboardCard>
        
        {/* Overtime Analysis */}
        <DashboardCard
          title="Overtime Analysis"
          description="Hours beyond target allocation"
        >
          <div className="space-y-4">
            <div className="bg-secondary/30 p-3 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Total Overtime Hours</span>
                <span className="font-bold text-lg">126.5</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">vs 112 prev period</span>
                <span className="text-warning">+12.9%</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Staff</span>
                  <span className="font-medium">76.5 hrs</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="bg-primary h-full" style={{ width: "60%" }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Supervisors</span>
                  <span className="font-medium">32 hrs</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="bg-primary h-full" style={{ width: "25%" }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Managers</span>
                  <span className="font-medium">18 hrs</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="bg-primary h-full" style={{ width: "15%" }}></div>
                </div>
              </div>
            </div>
          </div>
        </DashboardCard>
      </div>
      
      {/* Export Controls */}
      <div className="bg-white rounded-lg border border-border p-6">
        <h2 className="text-lg font-medium mb-4">Export Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            <span className="font-medium">Employee Performance</span>
            <span className="text-xs text-muted-foreground mt-1">Excel / PDF</span>
          </Button>
          
          <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            <span className="font-medium">Hours Summary</span>
            <span className="text-xs text-muted-foreground mt-1">Excel / PDF</span>
          </Button>
          
          <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            <span className="font-medium">Financial Report</span>
            <span className="text-xs text-muted-foreground mt-1">Excel / PDF</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Analytics
