
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { User } from "@/contexts/auth-context";
import { HoursRecord } from "@/types/hours";

interface HoursTableProps {
  staffList: User[];
  allDaysInMonth: number[];
  hoursData: HoursRecord;
  isHeadManagerOrOwner: boolean;
  isSupervisor: boolean;
  handleUpdateHours: (staffId: string, day: number, hours: number | null) => void;
  calculateTotalHours: (staffId: string) => number;
  getCellColor: (staffId: string, day: number) => string;
}

export const HoursTable = ({
  staffList,
  allDaysInMonth,
  hoursData,
  isHeadManagerOrOwner,
  isSupervisor,
  handleUpdateHours,
  calculateTotalHours,
  getCellColor
}: HoursTableProps) => {
  const targetHours = 100;

  const calculateBonus = (currentHours: number) => {
    if (currentHours <= targetHours) return 0;
    return (currentHours - targetHours) * 5;
  };

  return (
    <div className="min-w-max">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="sticky left-0 bg-white z-10">Name</TableHead>
            {allDaysInMonth.map(day => (
              <TableHead key={day} className="text-center min-w-[60px]">{day}</TableHead>
            ))}
            <TableHead className="text-center bg-muted">Current</TableHead>
            <TableHead className="text-center bg-muted">Target</TableHead>
            <TableHead className="text-center bg-muted">Bonus</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staffList.map(staff => {
            const totalHours = calculateTotalHours(staff.id);
            const bonusAmount = calculateBonus(totalHours);
            
            return (
              <TableRow key={staff.id}>
                <TableCell className="font-medium sticky left-0 bg-white z-10">
                  {staff.name}
                </TableCell>
                
                {allDaysInMonth.map(day => {
                  const hours = hoursData[staff.id]?.[day] || null;
                  const cellColorClass = isHeadManagerOrOwner ? getCellColor(staff.id, day) : "";
                  
                  return (
                    <TableCell 
                      key={day} 
                      className={`text-center ${cellColorClass}`}
                    >
                      {isHeadManagerOrOwner ? (
                        <Input
                          type="number"
                          value={hours || ""}
                          onChange={(e) => {
                            const newValue = e.target.value ? Number(e.target.value) : null;
                            handleUpdateHours(staff.id, day, newValue);
                          }}
                          className="h-8 w-16 text-center"
                          min={0}
                          max={24}
                          step={0.5}
                          placeholder="-"
                        />
                      ) : (
                        hours || "-"
                      )}
                    </TableCell>
                  );
                })}
                
                <TableCell className="text-center font-medium bg-muted/50">
                  {totalHours}
                </TableCell>
                <TableCell className="text-center bg-muted/50">
                  {targetHours}
                </TableCell>
                <TableCell className={`text-center font-medium ${bonusAmount > 0 ? 'text-success' : ''} bg-muted/50`}>
                  {bonusAmount > 0 ? `AED ${bonusAmount}` : '-'}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
