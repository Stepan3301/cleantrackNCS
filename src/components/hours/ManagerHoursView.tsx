
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { HoursCalendar } from "./HoursCalendar";
import { HoursTable } from "./HoursTable";
import { User } from "@/contexts/auth-context";
import { HoursData } from "@/types/hours";

interface ManagerHoursViewProps {
  allSupervisors: User[];
  mockHoursData: HoursData;
  getStaffForSupervisor: (supervisorId: string) => User[];
  calculateTotalHours: (staffId: string) => number;
  getCellColor: (staffId: string, day: number) => string;
  isHeadManagerOrOwner: boolean;
  users: User[];
}

export function ManagerHoursView({ 
  allSupervisors,
  mockHoursData,
  getStaffForSupervisor,
  calculateTotalHours,
  getCellColor,
  isHeadManagerOrOwner,
  users
}: ManagerHoursViewProps) {
  const [selectedSupervisor, setSelectedSupervisor] = useState<string | null>(null);
  const [currentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const allDaysInMonth = Array.from(
    { length: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate() },
    (_, i) => i + 1
  );

  return (
    <>
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Select Supervisor</label>
        <Select
          value={selectedSupervisor || ""}
          onValueChange={(value) => setSelectedSupervisor(value || null)}
        >
          <SelectTrigger className="w-full md:w-72">
            <SelectValue placeholder="Select a supervisor" />
          </SelectTrigger>
          <SelectContent>
            {allSupervisors.map(supervisor => (
              <SelectItem key={supervisor.id} value={supervisor.id}>
                {supervisor.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="table">
        <TabsList>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="table">Table View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendar">
          <HoursCalendar
            currentMonth={currentMonth}
            onMonthChange={() => {}}
            selectedDay={selectedDay}
            onDaySelect={setSelectedDay}
            hoursData={selectedSupervisor ? { [selectedSupervisor]: mockHoursData.supervisorHours[selectedSupervisor] || {} } : {}}
            isStaff={false}
            isSupervisor={false}
          />
        </TabsContent>
        
        <TabsContent value="table">
          {selectedSupervisor && (
            <div className="bg-white p-4 rounded-lg border border-border">
              <HoursTable
                staffList={getStaffForSupervisor(selectedSupervisor)}
                allDaysInMonth={allDaysInMonth}
                hoursData={mockHoursData.supervisorHours}
                isHeadManagerOrOwner={isHeadManagerOrOwner}
                isSupervisor={false}
                handleUpdateHours={(staffId: string, day: number, hours: number | null) => {
                  if (hours !== null) {
                    mockHoursData.supervisorHours[staffId] = {
                      ...mockHoursData.supervisorHours[staffId],
                      [day]: hours
                    };
                  }
                }}
                calculateTotalHours={calculateTotalHours}
                getCellColor={getCellColor}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}
