
import { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { formatValue, formatCurrency } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";

export function StaffDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<{
    targetHours: number | null;
    completedHours: number | null;
    percentComplete: number | null;
    bonusAmount: number | null;
    projectedBonus: number | null;
  }>({
    targetHours: null,
    completedHours: null,
    percentComplete: null,
    bonusAmount: null,
    projectedBonus: null
  });
  const [recentActivity, setRecentActivity] = useState<Array<{
    location: string;
    type: string;
    hours: number;
    date: string;
  }>>([]);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      
      try {
        // Fetch monthly hours data
        if (user?.id) {
          const currentDate = new Date();
          const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
          
          // Get monthly summary if it exists
          const { data: monthlySummary } = await supabase
            .from('monthly_summaries')
            .select('total_hours, bonus_amount')
            .eq('employee_id', user.id)
            .eq('month', firstDayOfMonth.toISOString().split('T')[0])
            .maybeSingle();
            
          // Get role threshold hours
          const { data: thresholdData } = await supabase
            .from('bonus_thresholds')
            .select('monthly_hours, monthly_bonus_amount')
            .eq('role', user.role)
            .maybeSingle();
            
          // Calculate percentage complete
          const targetHours = thresholdData?.monthly_hours || null;
          const completedHours = monthlySummary?.total_hours || null;
          const percentComplete = targetHours && completedHours 
            ? Math.round((completedHours / targetHours) * 100) 
            : null;
            
          // Set the monthly data
          setMonthlyData({
            targetHours,
            completedHours,
            percentComplete,
            bonusAmount: monthlySummary?.bonus_amount || null,
            projectedBonus: (percentComplete && percentComplete >= 100)
              ? thresholdData?.monthly_bonus_amount || null
              : null
          });
          
          // Fetch recent activity
          const { data: dailyHours } = await supabase
            .from('daily_hours')
            .select('hours, notes, date')
            .eq('employee_id', user.id)
            .order('date', { ascending: false })
            .limit(3);
            
          if (dailyHours && dailyHours.length > 0) {
            setRecentActivity(dailyHours.map(record => ({
              location: record.notes || "Unknown Location",
              type: "Regular Cleaning", // Default type since we don't have this in the schema
              hours: record.hours,
              date: new Date(record.date).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })
            })));
          }
        }
      } catch (error) {
        console.error("Error fetching staff dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [user]);

  function renderContent() {
    if (isLoading) {
      return (
        <div className="space-y-6">
          {/* Skeleton for performance section */}
          <div className="bg-white rounded-lg border border-border p-6">
            <div className="flex justify-between items-center mb-6">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-8 w-28" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
            
            <div className="mt-8">
              <Skeleton className="h-6 w-36 mb-4" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i}>
                    <Skeleton className="h-14 w-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-border p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Your Performance</h2>
            <Button variant="outline" size="sm">
              <Calendar size={16} className="mr-2" />
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-secondary/30 rounded-lg p-4 flex flex-col">
              <span className="text-sm text-muted-foreground">Target Hours</span>
              <span className="text-3xl font-bold mt-1">
                {formatValue(monthlyData.targetHours)}
              </span>
              <span className="text-xs text-muted-foreground mt-auto">Monthly Goal</span>
            </div>
            
            <div className="bg-secondary/30 rounded-lg p-4 flex flex-col">
              <span className="text-sm text-muted-foreground">Completed Hours</span>
              <span className="text-3xl font-bold mt-1">
                {formatValue(monthlyData.completedHours)}
              </span>
              <span className="text-xs text-success mt-auto">
                {formatValue(monthlyData.percentComplete, value => `${value}% of target`)}
              </span>
            </div>
            
            <div className="bg-secondary/30 rounded-lg p-4 flex flex-col">
              <span className="text-sm text-muted-foreground">Current Bonus</span>
              <span className="text-3xl font-bold mt-1">
                {formatValue(monthlyData.bonusAmount, formatCurrency)}
              </span>
              <span className="text-xs text-primary mt-auto">
                Projected: {formatValue(monthlyData.projectedBonus, formatCurrency)}
              </span>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="font-medium mb-3">Recent Activity</h3>
            <div className="space-y-3">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div key={index} className={`flex justify-between items-center pb-2 ${
                    index < recentActivity.length - 1 ? 'border-b border-border' : ''
                  }`}>
                    <div>
                      <p className="font-medium">{activity.location}</p>
                      <p className="text-sm text-muted-foreground">{activity.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{activity.hours} hours</p>
                      <p className="text-xs text-muted-foreground">{activity.date}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No recent activity found
                </div>
              )}
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
    );
  }

  return renderContent();
}
