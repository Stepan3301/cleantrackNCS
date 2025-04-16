
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StaffHoursView } from "@/components/hours/StaffHoursView";
import { SupervisorHoursView } from "@/components/hours/SupervisorHoursView";
import { ManagerHoursView } from "@/components/hours/ManagerHoursView";
import { HoursData } from "@/types/hours";

// Exporting mockHoursData so it can be used by HoursView
export const mockHoursData: HoursData = {
  staffHours: {},
  supervisorHours: {},
  notifications: []
};

const Hours = () => {
  const { user, users } = useAuth();
  const { toast } = useToast();

  if (!user) return null;

  // Role checks
  const isStaff = user.role === "staff";
  const isSupervisor = user.role === "supervisor";
  const isManager = user.role === "manager";
  const isHeadManagerOrOwner = user.role === "head_manager" || user.role === "owner";

  // Get all supervisors (for head manager/owner view)
  const allSupervisors = users.filter(u => u.role === "supervisor");

  // Get staff for selected supervisor
  const getStaffForSupervisor = (supervisorId: string) => {
    return users.filter(u => u.supervisorId === supervisorId && u.role === "staff");
  };

  // Calculate total hours for a staff member
  const calculateTotalHours = (staffId: string) => {
    const source = isSupervisor ? mockHoursData.supervisorHours : mockHoursData.staffHours;
    const staffHours = source[staffId] || {};
    return Object.values(staffHours).reduce((sum, hours) => sum + Number(hours), 0);
  };

  // Check if records match between staff and supervisor
  const getCellColor = (staffId: string, day: number) => {
    const staffHours = mockHoursData.staffHours[staffId]?.[day];
    const supervisorHours = mockHoursData.supervisorHours[staffId]?.[day];
    
    if (staffHours === undefined || supervisorHours === undefined) return "";
    return staffHours === supervisorHours ? "bg-green-100 border-green-400" : "bg-red-100 border-red-400";
  };

  // Handle hour submission
  const handleHourSubmission = (hours: number) => {
    if (hours < 0 || hours > 24) {
      toast({
        title: "Invalid hours",
        description: "Please enter a value between 0 and 24",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Hours submitted",
      description: `You have submitted ${hours} hours`
    });
  };

  // Render notifications
  const renderNotifications = () => {
    if (!isHeadManagerOrOwner || mockHoursData.notifications.length === 0) return null;

    return (
      <div className="bg-white p-4 rounded-lg border border-border mt-6">
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <AlertTriangle size={18} className="text-warning mr-2" />
          Hours Discrepancies
        </h3>

        <div className="space-y-3">
          {mockHoursData.notifications.map((notification, index) => {
            const staff = users.find(u => u.id === notification.staffId);
            return (
              <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-md border border-red-200">
                <div>
                  <p className="font-medium">{staff?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Day {notification.day}: Staff reported {notification.staffHours}h, Supervisor reported {notification.supervisorHours}h
                  </p>
                </div>
                <Button size="sm" variant="outline">Resolve</Button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Working Hours</h1>
        <div className="text-sm text-muted-foreground">
          {isSupervisor ? "Manage Staff Hours" : isStaff ? "Your Hours" : "Hours Management"}
        </div>
      </div>
      
      {isStaff && (
        <StaffHoursView
          user={user}
          mockHoursData={mockHoursData}
          users={users}
          onHourSubmission={handleHourSubmission}
        />
      )}
      
      {isSupervisor && (
        <SupervisorHoursView
          user={user}
          mockHoursData={mockHoursData}
          users={users}
        />
      )}
      
      {(isManager || isHeadManagerOrOwner) && (
        <>
          {renderNotifications()}
          <ManagerHoursView
            allSupervisors={allSupervisors}
            mockHoursData={mockHoursData}
            getStaffForSupervisor={getStaffForSupervisor}
            calculateTotalHours={calculateTotalHours}
            getCellColor={getCellColor}
            isHeadManagerOrOwner={isHeadManagerOrOwner}
            users={users}
          />
        </>
      )}
    </div>
  );
};

export default Hours;
