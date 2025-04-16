
import { useState } from "react";
import { HoursCalendar } from "./HoursCalendar";
import { HoursEntryForm } from "./HoursEntryForm";
import { StaffDashboard } from "./StaffDashboard";
import { User } from "@/contexts/auth-context";
import { HoursData, HoursRecord } from "@/types/hours";
import { supabase } from "@/integrations/supabase/client";

interface StaffHoursViewProps {
  user: User;
  mockHoursData: HoursData;
  users: User[];
  onHourSubmission: (hours: number) => void;
}

export function StaffHoursView({ 
  user,
  mockHoursData,
  users,
  onHourSubmission
}: StaffHoursViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [hoursWorked, setHoursWorked] = useState(0);
  const [location, setLocation] = useState("");
  const [peopleWorked, setPeopleWorked] = useState(1);

  // Create a HoursRecord specifically for the current user
  const userHours: HoursRecord = {
    [user.id]: mockHoursData.staffHours[user.id] || {}
  };

  const supervisor = users.find(u => u.id === user?.supervisorId);
  const supervisorName = supervisor ? supervisor.name : "Not Assigned";

  const handleHourSubmission = () => {
    onHourSubmission(hoursWorked);
    setHoursWorked(0);
    setLocation("");
    setPeopleWorked(1);
    setSelectedDay(null);
  };

  return (
    <div className="space-y-4">
      <HoursCalendar
        currentMonth={currentMonth}
        onMonthChange={setCurrentMonth}
        selectedDay={selectedDay}
        onDaySelect={setSelectedDay}
        hoursData={userHours}
        isStaff={true}
        isSupervisor={false}
      />
      <HoursEntryForm
        selectedDay={selectedDay}
        currentMonth={currentMonth}
        hoursWorked={hoursWorked}
        setHoursWorked={setHoursWorked}
        location={location}
        setLocation={setLocation}
        peopleWorked={peopleWorked}
        setPeopleWorked={setPeopleWorked}
        supervisorName={supervisorName}
        onSubmit={handleHourSubmission}
        onCancel={() => setSelectedDay(null)}
      />
      {!selectedDay && <StaffDashboard />}
    </div>
  );
}
