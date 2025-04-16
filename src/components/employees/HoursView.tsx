
import { useState, useEffect } from "react";
import { User } from "@/contexts/auth-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HoursCalendar } from "@/components/hours/HoursCalendar";
import { HoursTable } from "@/components/hours/HoursTable";
import { HoursRecord } from "@/types/hours";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface HoursViewProps {
  isOpen: boolean;
  employee: User;
  onClose: () => void;
}

export function HoursView({ isOpen, employee, onClose }: HoursViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [employeeHours, setEmployeeHours] = useState<HoursRecord>({
    [employee.id]: {}
  });
  const { toast } = useToast();
  
  // Fetch employee's hours when the month changes
  useEffect(() => {
    const fetchEmployeeHours = async () => {
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      const { data, error } = await supabase
        .from('daily_hours')
        .select('*')
        .eq('employee_id', employee.id)
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
        [employee.id]: {}
      };

      data.forEach(record => {
        const day = new Date(record.date).getDate();
        hoursRecord[employee.id][day] = record.hours;
      });

      setEmployeeHours(hoursRecord);
    };

    fetchEmployeeHours();
  }, [currentMonth, employee.id]);
  
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
                hoursData={employeeHours}
                isHeadManagerOrOwner={false}
                isSupervisor={true}
                handleUpdateHours={() => {}}
                calculateTotalHours={(staffId) => {
                  const hours = employeeHours[staffId] || {};
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
