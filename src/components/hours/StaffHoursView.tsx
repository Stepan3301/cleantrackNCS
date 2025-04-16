
import { useState, useEffect } from "react";
import { HoursCalendar } from "./HoursCalendar";
import { HoursEntryForm } from "./HoursEntryForm";
import { StaffDashboard } from "./StaffDashboard";
import { User } from "@/contexts/auth-context";
import { HoursData, HoursRecord } from "@/types/hours";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const [userHours, setUserHours] = useState<HoursRecord>({
    [user.id]: {}
  });
  const { toast } = useToast();

  const supervisor = users.find(u => u.id === user?.supervisorId);
  const supervisorName = supervisor ? supervisor.name : "Not Assigned";

  // Fetch user's hours when the month changes
  useEffect(() => {
    const fetchUserHours = async () => {
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      const { data, error } = await supabase
        .from('daily_hours')
        .select('*')
        .eq('employee_id', user.id)
        .gte('date', startOfMonth.toISOString())
        .lte('date', endOfMonth.toISOString());

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch hours data",
          variant: "destructive",
        });
        return;
      }

      // Transform the data into the expected format
      const hoursRecord: HoursRecord = {
        [user.id]: {}
      };

      data.forEach(record => {
        const day = new Date(record.date).getDate();
        hoursRecord[user.id][day] = record.hours;
      });

      setUserHours(hoursRecord);
    };

    fetchUserHours();
  }, [currentMonth, user.id]);

  const handleHourSubmission = async () => {
    if (!selectedDay) return;

    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), selectedDay);

    const { error } = await supabase
      .from('daily_hours')
      .insert({
        employee_id: user.id,
        date: date.toISOString(),
        hours: hoursWorked,
        created_by: user.id,
        notes: location || null
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to submit hours",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Hours submitted successfully",
    });

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
