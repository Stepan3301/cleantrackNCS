import { useEffect, useState } from "react"
import { DashboardCard } from "@/components/ui/dashboard-card"
import { useAuth } from "@/contexts/auth-context"
import { 
  BarChart3, 
  Users, 
  ClipboardCheck, 
  Calendar,
  ArrowUpCircle,
  TrendingUp,
  Megaphone,
  CheckCircle,
  UserCheck,
  Clock,
  Target,
  AlertCircle,
  ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { announcementsService } from "@/lib/services/announcements-service"
import { useAnnouncements } from "@/contexts/announcements-context"
import { format, startOfMonth, endOfMonth } from "date-fns"
import { workTimeService } from "@/lib/services/work-time-service"
import { profilesService } from "@/lib/services/profiles-service"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { targetHoursService } from "@/lib/services/target-hours-service"
import bonusService from "@/lib/services/bonus-service"
import "../styles/modern-dashboard.css"

// Sample data interfaces
interface StatCardProps {
  title: string
  value: number | string
  icon: React.ReactNode
  isLoading?: boolean
}

interface Announcement {
  id: string
  title: string
  content: string
  announcement_type: 'general' | 'direct'
  created_at: string
  profiles?: {
    name: string
  }
}

interface WorkTimeRecord {
  id: string;
  date: string;
  hours_worked: number;
  location?: string;
  status: 'approved' | 'rejected' | 'pending';
  user_id: string;
  created_at: string;
  updated_at: string;
}

// AnnouncementsSection component to be reused in both dashboards
const AnnouncementsSection = () => {
  const { user } = useAuth();
  const { generalAnnouncements, userAnnouncements, refreshAnnouncements, isLoading, error } = useAnnouncements();
  const [combinedAnnouncements, setCombinedAnnouncements] = useState<Announcement[]>([]);
  
  // When generalAnnouncements or userAnnouncements change, combine them
  useEffect(() => {
    // If admin, just use the generalAnnouncements which already contains all announcements
    if (user?.role === "head_manager" || user?.role === "owner") {
      setCombinedAnnouncements(generalAnnouncements);
    } else {
      // For regular users, combine both types removing duplicates
      const allAnnouncements = [...generalAnnouncements, ...userAnnouncements];
      // Remove duplicates based on ID
      const uniqueAnnouncements = allAnnouncements.filter((announcement, index, self) =>
        index === self.findIndex((a) => a.id === announcement.id)
      );
      // Sort by creation date (newest first)
      uniqueAnnouncements.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setCombinedAnnouncements(uniqueAnnouncements);
    }
  }, [generalAnnouncements, userAnnouncements, user]);
  
  // Refresh announcements when the component mounts
  useEffect(() => {
    console.log('AnnouncementsSection mounted, refreshing announcements');
    refreshAnnouncements();
  }, [refreshAnnouncements]);

  // Only show the 3 most recent announcements
  const recentAnnouncements = combinedAnnouncements.slice(0, 3);
  
  console.log('Recent announcements:', recentAnnouncements);

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-destructive text-sm py-2">{error}</div>
    );
  }

  if (combinedAnnouncements.length === 0) {
    return (
      <div className="announcement-empty flex flex-col items-center justify-center py-6 px-4">
        <AlertCircle className="text-muted-foreground h-10 w-10 mb-2" />
        <h3 className="text-lg font-medium text-primary mb-1">No announcements at this time</h3>
        <p className="text-sm text-muted-foreground text-center">
          Important company updates will appear here when available
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recentAnnouncements.map((announcement, index) => (
        <div 
          key={announcement.id} 
          className="announcement"
        >
          <div className="flex items-start justify-between gap-2">
            <h4>{announcement.title}</h4>
            {announcement.announcement_type === 'direct' && (
              <Badge variant="outline" className="bg-primary/10 text-primary text-xs px-2 py-0.5 h-auto">
                <UserCheck size={12} className="mr-1" />
                Direct
              </Badge>
            )}
          </div>
          <p>{announcement.content}</p>
          <div className="text-xs text-muted-foreground mt-2 flex items-center">
            <Calendar size={12} className="mr-1" />
            {announcement.created_at 
              ? format(new Date(announcement.created_at), 'MMM d, yyyy')
              : 'Recent'
            } 
            {announcement.profiles?.name && ` by ${announcement.profiles.name}`}
          </div>
        </div>
      ))}
      
      <div className="text-center mt-2">
        <a href="/announcements" className="text-sm text-primary hover:text-primary/80 underline flex items-center justify-center">
          View all announcements
          <ChevronRight size={14} className="ml-1" />
        </a>
      </div>
    </div>
  );
};

// Monthly Stats Section for Supervisor Dashboard
const SupervisorStatsSection = () => {
  const { user } = useAuth();
  const [staffHours, setStaffHours] = useState<number>(0);
  const [staffCount, setStaffCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSupervisorStats = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Get current date
        const currentDate = new Date();
        
        // Create date range for current month
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
        // Format dates as YYYY-MM-DD for API calls
        const formattedStartDate = firstDayOfMonth.toISOString().split('T')[0];
        const formattedEndDate = lastDayOfMonth.toISOString().split('T')[0];
        
        // Get all profiles to find staff members assigned to this supervisor
        const profiles = await profilesService.getAllProfiles();
        
        // Filter to get only staff members assigned to this supervisor
        const myStaff = profiles.filter(profile => 
          profile.supervisor_id === user.id && profile.role === 'staff'
        );
        
        // Set the staff count
        setStaffCount(myStaff.length);
        
        console.log(`Fetching supervisor-recorded hours from ${formattedStartDate} to ${formattedEndDate}`);
        
        // Get all work time records CREATED BY this supervisor (not self-records by staff)
        const { data: workTimeRecords, error: workTimeError } = await supabase
          .from('work_time')
          .select('*')
          .eq('created_by', user.id) // Records created by this supervisor
          .eq('record_type', 'supervisor') // Only supervisor records
          .gte('date', formattedStartDate)
          .lte('date', formattedEndDate)
          .eq('status', 'approved');
          
        if (workTimeError) {
          throw new Error(`Failed to get work time records: ${workTimeError.message}`);
        }
        
        console.log(`Found ${workTimeRecords?.length || 0} supervisor-recorded hours`);
        
        // Calculate total hours recorded by the supervisor
        const totalHours = (workTimeRecords || []).reduce((sum, record) => 
          sum + (record.hours_worked || 0), 0
        );
          
        setStaffHours(totalHours);
      } catch (err) {
        console.error("Error loading supervisor stats:", err);
        setError("Failed to load statistics");
      } finally {
        setIsLoading(false);
      }
    };

    loadSupervisorStats();
  }, [user]);

  // Format the current month name
  const currentMonthName = new Date().toLocaleString('default', { month: 'long' });

  return (
    <div className="dashboard-row">
      <DashboardCard
        title="My Staff Hours"
        description={`Hours recorded by you for ${currentMonthName}`}
        icon={<Clock className="h-5 w-5" />}
        isLoading={isLoading}
        interactive={true}
      >
        {error ? (
          <div className="text-sm text-destructive">{error}</div>
        ) : (
          <div className="flex flex-col">
            <span className="card-value">{staffHours.toFixed(1)}</span>
            <div className="text-xs text-muted-foreground mt-1">
              hours recorded by you for your staff
            </div>
          </div>
        )}
      </DashboardCard>
      
      <DashboardCard
        title="My Staff Members"
        description="Number of staff reporting to you"
        icon={<Users className="h-5 w-5" />}
        isLoading={isLoading}
        interactive={true}
      >
        {error ? (
          <div className="text-sm text-destructive">{error}</div>
        ) : (
          <div className="flex flex-col">
            <span className="card-value">{staffCount}</span>
            <div className="text-xs text-muted-foreground mt-1">
              staff members assigned to you
            </div>
          </div>
        )}
      </DashboardCard>
    </div>
  );
};

// Update CompletedTasksSection to filter based on user role and timeframe
const CompletedTasksSection = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<WorkTimeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTasks = async () => {
      if (!user) return;
      
      try {
        // Get current month date range for filtering
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        
        // First day of current month
        const firstDay = new Date(currentYear, currentMonth, 1);
        // Last day of current month
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        
        // Format dates for API
        const startDate = firstDay.toISOString().split('T')[0];
        const endDate = lastDay.toISOString().split('T')[0];
        
        if (user.role === 'supervisor') {
          // For supervisors, get all work_time records they created in the current month
          const { data: supervisorRecords, error: recordsError } = await supabase
            .from('work_time')
            .select('*')
            .eq('created_by', user.id)
            .eq('record_type', 'supervisor')
            .eq('status', 'approved')
            .gte('date', startDate)
            .lte('date', endDate)
            .order('date', { ascending: false });
          
          if (recordsError) {
            throw new Error(`Failed to fetch supervisor records: ${recordsError.message}`);
          }
          
          setTasks(supervisorRecords || []);
        } else {
          // For staff and other roles, use the existing method
          const records = await workTimeService.getWorkTimeInDateRange(user.id, startDate, endDate);
          
          // Filter records based on user role
          const filteredRecords = records.filter(record => {
            if (user.role === 'staff') {
              // For staff, only show self-records
              return record.status === 'approved' && record.record_type === 'self';
            }
            // For other roles, show all approved records
            return record.status === 'approved';
          });
          
          setTasks(filteredRecords);
        }
      } catch (err) {
        console.error('Error loading work time records:', err);
        setError('Failed to load completed tasks');
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-destructive text-center p-4">{error}</div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.length === 0 ? (
        <div className="text-center text-muted-foreground p-4">
          No completed tasks yet
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.slice(0, 5).map((task) => (
            <div key={task.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/40 transition-colors">
              <div className="bg-primary/10 text-primary text-center rounded-md p-2 min-w-14">
                <div className="text-xs">
                  {format(new Date(task.date), 'MMM')}
                </div>
                <div className="font-bold">
                  {format(new Date(task.date), 'd')}
                </div>
              </div>
              <div className="flex-1">
                <p className="font-medium">{task.location || 'Work'}</p>
                <p className="text-sm text-muted-foreground">{task.hours_worked} hours</p>
                <div className="flex items-center mt-1">
                  <CheckCircle size={14} className="text-success mr-1" />
                  <span className="text-xs text-success">Completed</span>
                </div>
              </div>
            </div>
          ))}
          
          {tasks.length > 5 && (
            <div className="text-center">
              <a href="/hours" className="text-sm text-primary hover:text-primary/80 underline">
                View all {tasks.length} completed tasks
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Optimize CurrentBonusSection for mobile usage and use actual data
const CurrentBonusSection = () => {
  const { user } = useAuth();
  const [bonusAmount, setBonusAmount] = useState<number>(0);
  const [bonusFormula, setBonusFormula] = useState<{ amount_per_hour: number, hours_threshold: number }>({ 
    amount_per_hour: 0, 
    hours_threshold: 0 
  });
  const [hoursWorked, setHoursWorked] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBonusData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        console.log("Loading bonus data for user:", user.id);
        
        // Get current date for date range
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        
        // Create first and last day of current month
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        
        // Format dates for API calls in YYYY-MM-DD format
        const startDate = firstDay.toISOString().split('T')[0];
        const endDate = lastDay.toISOString().split('T')[0];
        
        // Current period in YYYY-MM format for target hours
        const currentPeriod = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
        console.log(`Loading bonus data for period: ${currentPeriod}, date range: ${startDate} to ${endDate}`);
        
        // Step 1: Get target hours
        let targetHours = 200; // Default if nothing found
        try {
          const targetData = await targetHoursService.getTargetHoursByStaffId(user.id);
          if (targetData) {
            targetHours = targetData.hours || 200;
            console.log(`Got target hours for ${user.id}: ${targetHours}`);
          } else {
            console.log(`No target hours found for ${user.id}, using default: ${targetHours}`);
          }
        } catch (targetError) {
          console.error("Error getting target hours:", targetError);
          // Continue with default target hours
        }
        
        // Step 2: Get bonus formula
        let bonusRate = 0;
        try {
          const bonusData = await bonusService.getStaffBonus(user.id);
          if (bonusData) {
            bonusRate = bonusData.amount_per_hour || 0;
            console.log(`Got bonus rate for ${user.id}: ${bonusRate} AED/hour`);
          } else {
            console.log(`No bonus formula found for ${user.id}`);
          }
        } catch (bonusError) {
          console.error("Error getting bonus formula:", bonusError);
          // Continue with default bonus rate of 0
        }
        
        // Set the bonus formula with the values we've got
        setBonusFormula({
          amount_per_hour: bonusRate,
          hours_threshold: targetHours
        });
        
        // Step 3: Get worked hours - use direct supabase query to get hours
        try {
          // Get worked hours for current month - only count self records for the staff
          const { data: workedHoursRecords, error: workedHoursError } = await supabase
            .from('work_time')
            .select('hours_worked')
            .eq('user_id', user.id)
            .eq('record_type', 'self')  // Only count self records
            .eq('status', 'approved')
            .gte('date', startDate)     // Greater than or equal to start date
            .lte('date', endDate);      // Less than or equal to end date
            
          if (workedHoursError) {
            console.error('Error fetching worked hours:', workedHoursError);
            throw new Error(`Failed to fetch worked hours: ${workedHoursError.message}`);
          }
          
          console.log(`Found ${workedHoursRecords?.length || 0} worked hours records for ${user.id}`);
          
          const totalWorkedHours = workedHoursRecords?.reduce((sum, record) => 
            sum + (record.hours_worked || 0), 0
          ) || 0;
          
          setHoursWorked(totalWorkedHours);
          console.log(`Total hours worked: ${totalWorkedHours}`);
          
          // Step 4: Calculate bonus amount
          let calculatedBonus = 0;
          if (totalWorkedHours > targetHours && bonusRate > 0) {
            calculatedBonus = (totalWorkedHours - targetHours) * bonusRate;
            console.log(`Bonus calculation: (${totalWorkedHours} - ${targetHours}) × ${bonusRate} = ${calculatedBonus}`);
          } else {
            console.log(`No bonus: hours (${totalWorkedHours}) ≤ threshold (${targetHours}) or rate (${bonusRate}) = 0`);
          }
          
          setBonusAmount(calculatedBonus);
        } catch (hoursError) {
          console.error("Error processing worked hours:", hoursError);
          setError("Failed to calculate worked hours");
          // Still set with 0 hours so the card renders
          setHoursWorked(0);
          setBonusAmount(0);
        }
      } catch (err) {
        console.error("Error loading bonus data:", err);
        setError("Failed to load bonus information");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadBonusData();
  }, [user]);
  
  return (
    <DashboardCard
      title="Current Bonus"
      description="Based on your performance this month"
      icon={<ArrowUpCircle className="h-5 w-5" />}
      isLoading={isLoading}
      interactive={true}
    >
      {error ? (
        <div className="text-sm text-destructive">{error}</div>
      ) : (
        <div className="space-y-3">
          {/* Bonus Amount - More prominent on mobile */}
          <div className="flex flex-col items-center sm:flex-row sm:justify-between sm:items-center bg-primary/10 p-3 rounded-lg">
            <span className="text-sm font-medium mb-1 sm:mb-0">Current Bonus</span>
            <span className="card-value">{bonusAmount.toFixed(2)} AED</span>
          </div>
          
          {/* Formula and Progress - Stacked on mobile, side by side on larger screens */}
          <div className="overview-row">
            {/* Formula Section */}
            <div className="overview-block">
              <div className="overview-title">Bonus Formula</div>
              <div className="text-sm">
                {bonusFormula.amount_per_hour > 0 
                  ? `${bonusFormula.amount_per_hour} AED per hour after ${bonusFormula.hours_threshold} hours` 
                  : "No bonus formula set"}
              </div>
            </div>
            
            {/* Stats Section - Always in a row for counters */}
            <div className="overview-block">
              <div className="overview-title">Hours</div>
              <div className="overview-value">{hoursWorked}</div>
            </div>
            
            <div className="overview-block">
              <div className="overview-title">Target</div>
              <div className="overview-value">{bonusFormula.hours_threshold}</div>
            </div>
          </div>
          
          {/* Progress Bar - Full width on all screens */}
          {bonusFormula.hours_threshold > 0 && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>{Math.min(100, Math.round((hoursWorked / bonusFormula.hours_threshold) * 100))}% complete</span>
                <span>{hoursWorked}/{bonusFormula.hours_threshold}h</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full ${hoursWorked >= bonusFormula.hours_threshold ? 'bg-success' : 'bg-primary'}`}
                  style={{ width: `${Math.min(100, (hoursWorked / bonusFormula.hours_threshold) * 100)}%` }}
                ></div>
              </div>
              <div className="text-xs mt-1 text-muted-foreground">
                {hoursWorked >= bonusFormula.hours_threshold 
                  ? `+${(hoursWorked - bonusFormula.hours_threshold).toFixed(1)} bonus hours (${bonusFormula.amount_per_hour} AED/h)`
                  : `${(bonusFormula.hours_threshold - hoursWorked).toFixed(1)} more hours until bonus eligibility`}
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardCard>
  );
};

// Update MonthlyStatsSection for staff to only count self-records
const MonthlyStatsSection = () => {
  const { user } = useAuth();
  const [totalHours, setTotalHours] = useState<number>(0);
  const [targetHours, setTargetHours] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMonthlyStats = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Get current date
        const currentDate = new Date();
        
        // Create exact first day of current month (year, month index, day = 1)
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        // Create exact last day of current month (year, month index + 1, day = 0)
        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
        // Format dates as YYYY-MM-DD for API calls
        const formattedStartDate = firstDayOfMonth.toISOString().split('T')[0];
        const formattedEndDate = lastDayOfMonth.toISOString().split('T')[0];
        
        console.log(`Fetching hours from ${formattedStartDate} to ${formattedEndDate}`);
        
        // Get current month in YYYY-MM format for target hours
        const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
        
        // Get target hours for current month
        const targetData = await targetHoursService.getTargetHoursByStaffId(user.id);
        setTargetHours(targetData?.hours || 0);
        
        // Get records specifically for the date range
        const records = await workTimeService.getWorkTimeInDateRange(
          user.id,
          formattedStartDate,
          formattedEndDate
        );
        
        // Calculate total hours from the returned records
        // This ensures we're only counting approved records from the current month
        // For staff users, only count self-records
        const totalWorkedHours = records
          .filter(record => {
            if (user.role === 'staff') {
              return record.status === 'approved' && record.record_type === 'self';
            }
            return record.status === 'approved';
          })
          .reduce((sum, record) => sum + (record.hours_worked || 0), 0);
          
        setTotalHours(totalWorkedHours);
      } catch (err) {
        console.error("Error loading monthly stats:", err);
        setError("Failed to load monthly statistics");
      } finally {
        setIsLoading(false);
      }
    };

    loadMonthlyStats();
  }, [user]);

  // Format the current month name
  const currentMonthName = new Date().toLocaleString('default', { month: 'long' });

  return (
    <div className="dashboard-row">
      <DashboardCard
        title="Hours Worked This Month"
        description={`Total for ${currentMonthName}`}
        icon={<Clock className="h-5 w-5" />}
        isLoading={isLoading}
        interactive={true}
      >
        {error ? (
          <div className="text-sm text-destructive">{error}</div>
        ) : (
          <div className="flex flex-col">
            <span className="card-value">{totalHours.toFixed(1)}</span>
            <div className="text-xs text-muted-foreground mt-1">
              hours recorded
            </div>
          </div>
        )}
      </DashboardCard>
      
      <DashboardCard
        title="Target Hours"
        description={`Goal for ${currentMonthName}`}
        icon={<Target className="h-5 w-5" />}
        isLoading={isLoading}
        interactive={true}
      >
        {error ? (
          <div className="text-sm text-destructive">{error}</div>
        ) : (
          <div className="flex flex-col">
            <span className="card-value">{targetHours}</span>
            <div className="text-xs text-muted-foreground mt-1">
              {totalHours > 0 && targetHours > 0 ? 
                `${Math.round((totalHours / targetHours) * 100)}% completed` : 
                'No progress yet'}
            </div>
            {targetHours > 0 && (
              <div className="h-2 bg-muted rounded-full overflow-hidden mt-2">
                <div 
                  className="h-full bg-primary" 
                  style={{ 
                    width: `${Math.min(100, (totalHours / targetHours) * 100)}%` 
                  }}
                ></div>
              </div>
            )}
          </div>
        )}
      </DashboardCard>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth()
  const [employeeStats, setEmployeeStats] = useState({
    totalEmployees: 0,
    completedOrders: 0,
    totalHours: 0,
    roleDistribution: {
      managers: 0,
      supervisors: 0,
      staff: 0
    }
  })
  const [isLoading, setIsLoading] = useState(true)
  
  // Add useEffect to apply modern dashboard class to body
  useEffect(() => {
    // Add the modern-dashboard class to the body
    document.body.classList.add('modern-dashboard');
    
    // Remove the class when component unmounts
    return () => {
      document.body.classList.remove('modern-dashboard');
    }
  }, []);
  
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return
      
      try {
        // Get all profiles for total count and role distribution
        const profiles = await profilesService.getAllProfiles()
        
        // Calculate role distribution
        const roleDistribution = profiles.reduce((acc, profile) => {
          if (profile.role === "head_manager" || profile.role === "owner") {
            acc.managers++
          } else if (profile.role === "supervisor") {
            acc.supervisors++
          } else if (profile.role === "staff") {
            acc.staff++
          }
          return acc
        }, { managers: 0, supervisors: 0, staff: 0 })

        // Get current month's work time records
        const currentMonth = new Date()
        const startDate = startOfMonth(currentMonth)
        const endDate = endOfMonth(currentMonth)
        
        // Get all work time records for the current month
        const { data: workTimeRecords, error: workTimeError } = await supabase
          .from('work_time')
          .select('*')
          .gte('date', startDate.toISOString().split('T')[0])
          .lte('date', endDate.toISOString().split('T')[0]);
          
        if (workTimeError) {
          throw new Error(`Failed to get work time records: ${workTimeError.message}`);
        }

        // Filter records created by supervisors
        const supervisorRecords = (workTimeRecords || []).filter(record => {
          const creator = profiles.find(p => p.id === record.user_id)
          return creator?.role === "supervisor"
        })

        // Calculate total hours from supervisor records
        const totalHours = supervisorRecords.reduce((sum, record) => sum + record.hours_worked, 0)

        setEmployeeStats({
          totalEmployees: profiles.length,
          completedOrders: supervisorRecords.length,
          totalHours,
          roleDistribution
        })
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
      setIsLoading(false)
      }
    }
    
    loadDashboardData()
  }, [user])

  const StatCard = ({ title, value, icon, isLoading }: StatCardProps) => (
    <div className="dashboard-card">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="card-value mt-2">
            {isLoading ? (
              <div className="animate-pulse bg-muted rounded h-8 w-24" />
            ) : (
              value
            )}
          </h3>
        </div>
        <div className="card-icon">
          {icon}
        </div>
      </div>
    </div>
  )

  // Render different dashboards based on user role
  const renderOwnerDashboard = () => (
    <div className="space-y-6">
      <div className="dashboard-row">
        <StatCard
          title="Active Employees"
          value={employeeStats.totalEmployees}
          icon={<Users size={24} className="text-primary" />}
          isLoading={isLoading}
        />
        <StatCard
          title="Completed Orders"
          value={employeeStats.completedOrders}
          icon={<ClipboardCheck size={24} className="text-primary" />}
          isLoading={isLoading}
        />
        <StatCard
          title="Total Hours"
          value={employeeStats.totalHours}
          icon={<Calendar size={24} className="text-primary" />}
          isLoading={isLoading}
        />
      </div>
      
      <div className="dashboard-row">
        <DashboardCard 
          title="Employee Overview" 
          description="Staff distribution by role"
          icon={<Users size={16} />}
          isLoading={isLoading}
          interactive={true}
          wide={true}
          footer={
            <div className="w-full flex justify-between items-center">
              <span className="text-sm">
                Total: {employeeStats.totalEmployees} employees
              </span>
              <Button 
                variant="link" 
                size="sm" 
                onClick={() => window.location.href = "/employees"}
              >
                View All Employees
              </Button>
            </div>
          }
        >
          <div className="h-[300px]">
            <div className="overview-row">
              <div className="overview-block">
                <h4 className="overview-title">Management</h4>
                <div className="overview-value">{employeeStats.roleDistribution.managers}</div>
                <p className="overview-desc">
                  {((employeeStats.roleDistribution.managers / employeeStats.totalEmployees) * 100).toFixed(1)}% of staff
                </p>
              </div>
              <div className="overview-block">
                <h4 className="overview-title">Supervisors</h4>
                <div className="overview-value">{employeeStats.roleDistribution.supervisors}</div>
                <p className="overview-desc">
                  {((employeeStats.roleDistribution.supervisors / employeeStats.totalEmployees) * 100).toFixed(1)}% of staff
                </p>
              </div>
              <div className="overview-block">
                <h4 className="overview-title">Staff</h4>
                <div className="overview-value">{employeeStats.roleDistribution.staff}</div>
                <p className="overview-desc">
                  {((employeeStats.roleDistribution.staff / employeeStats.totalEmployees) * 100).toFixed(1)}% of staff
                </p>
              </div>
            </div>
          </div>
        </DashboardCard>
        
        <DashboardCard
          title="Recent Announcements"
          description="Stay updated with company news"
          icon={<Megaphone className="h-5 w-5" />}
          interactive={true}
        >
          <AnnouncementsSection />
        </DashboardCard>
      </div>
    </div>
  )
  
  // Staff Dashboard
  const renderStaffDashboard = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-5 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-primary">Welcome, {user?.name || 'Staff Member'}</h2>
            <p className="text-muted-foreground">Here's your performance overview for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="flex items-center bg-white/50 px-4 py-2 rounded-lg shadow-sm">
            <Clock className="h-5 w-5 text-primary mr-2" />
            <div className="text-sm">
              <span className="font-medium">Today: </span>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })}
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hours & Bonus Section */}
        <div className="space-y-6">
          <MonthlyStatsSection />
          <CurrentBonusSection />
          
          {/* Add Recent Announcements Section for Staff */}
          <DashboardCard
            title="Recent Announcements"
            description="Stay updated with company news"
            icon={<Megaphone className="h-5 w-5" />}
            interactive={true}
          >
            <AnnouncementsSection />
          </DashboardCard>
        </div>
        
        {/* Activity & Announcements Section */}
        <div className="space-y-6">
          <DashboardCard
            title="Recent Activity"
            description="Your latest completed tasks"
            icon={<ClipboardCheck className="h-5 w-5" />}
            interactive={true}
          >
            <CompletedTasksSection />
          </DashboardCard>
        </div>
      </div>
    </div>
  )

  // Add a supervisor dashboard in the return section
  const renderSupervisorDashboard = () => (
    <div className="space-y-6">
      <div className="dashboard-row">
        <SupervisorStatsSection />
      </div>
      <div className="dashboard-row">
        <DashboardCard
          title="Completed Tasks"
          description="Recently completed work"
          icon={<ClipboardCheck className="h-5 w-5" />}
          interactive={true}
        >
          <CompletedTasksSection />
        </DashboardCard>
        
        <DashboardCard
          title="Recent Announcements"
          description="Stay updated with company news"
          icon={<Megaphone className="h-5 w-5" />}
          interactive={true}
        >
          <AnnouncementsSection />
        </DashboardCard>
      </div>
    </div>
  )

  return (
    <div className="dashboard-layout dashboard-container space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>
      
      {/* Render different dashboard based on user role */}
      {user?.role === "owner" || user?.role === "head_manager" 
        ? renderOwnerDashboard() 
        : user?.role === "supervisor"
        ? renderSupervisorDashboard()
        : renderStaffDashboard()}
    </div>
  )
}

export default Dashboard
