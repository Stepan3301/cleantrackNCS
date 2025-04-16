
import { useState } from "react";
import { User } from "@/contexts/auth-context";
import { HoursTable } from "./HoursTable";
import { HoursData } from "@/types/hours";

interface SupervisorHoursViewProps {
  user: User;
  mockHoursData: HoursData;
  users: User[];
}

export function SupervisorHoursView({ 
  user,
  mockHoursData,
  users
}: SupervisorHoursViewProps) {
  const [currentMonth] = useState(new Date());
  
  const supervisedStaff = users.filter(u => u.supervisorId === user?.id && u.role === "staff");
  
  const allDaysInMonth = Array.from(
    { length: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate() },
    (_, i) => i + 1
  );

  const calculateTotalHours = (staffId: string) => {
    const source = mockHoursData.supervisorHours;
    const staffHours = source[staffId] || {};
    return Object.values(staffHours).reduce((sum, hours) => sum + Number(hours), 0);
  };

  return (
    <div className="overflow-x-auto">
      <HoursTable
        staffList={supervisedStaff}
        allDaysInMonth={allDaysInMonth}
        hoursData={mockHoursData.supervisorHours}
        isHeadManagerOrOwner={false}
        isSupervisor={true}
        handleUpdateHours={(staffId: string, day: number, hours: number | null) => {
          if (hours !== null) {
            mockHoursData.supervisorHours[staffId] = {
              ...mockHoursData.supervisorHours[staffId],
              [day]: hours
            };
          }
        }}
        calculateTotalHours={calculateTotalHours}
        getCellColor={() => ""}
      />
    </div>
  );
}
