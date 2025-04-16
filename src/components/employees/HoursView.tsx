
import { useState } from "react";
import { User } from "@/contexts/auth-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HoursCalendar } from "@/components/hours/HoursCalendar";
import { HoursTable } from "@/components/hours/HoursTable";
import { mockHoursData } from "@/pages/Hours";

interface HoursViewProps {
  isOpen: boolean;
  employee: User;
  onClose: () => void;
}

export function HoursView({ isOpen, employee, onClose }: HoursViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const employeeHours = employee.role === "supervisor" 
    ? mockHoursData.supervisorHours[employee.id] || {}
    : mockHoursData.staffHours[employee.id] || {};

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Hours Records - {employee.name}</DialogTitle>
        </DialogHeader>

        <div className="mt-6">
          {employee.role === "staff" ? (
            <HoursCalendar
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
              selectedDay={null}
              onDaySelect={() => {}}
              hoursData={employeeHours}
              isStaff={true}
              isSupervisor={false}
            />
          ) : (
            <div className="overflow-x-auto">
              <HoursTable
                staffList={[employee]}
                allDaysInMonth={Array.from(
                  { length: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate() },
                  (_, i) => i + 1
                )}
                hoursData={mockHoursData.supervisorHours}
                isHeadManagerOrOwner={false}
                isSupervisor={true}
                handleUpdateHours={() => {}}
                calculateTotalHours={(staffId) => {
                  const hours = mockHoursData.supervisorHours[staffId] || {};
                  return Object.values(hours).reduce((sum, h) => sum + Number(h), 0);
                }}
                getCellColor={() => ""}
              />
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
