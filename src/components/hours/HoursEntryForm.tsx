
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface HoursEntryFormProps {
  selectedDay: number | null;
  currentMonth: Date;
  hoursWorked: number;
  setHoursWorked: (hours: number) => void;
  location: string;
  setLocation: (location: string) => void;
  peopleWorked: number;
  setPeopleWorked: (people: number) => void;
  supervisorName: string;
  onSubmit: () => void;
  onCancel: () => void;
}

export const HoursEntryForm = ({
  selectedDay,
  currentMonth,
  hoursWorked,
  setHoursWorked,
  location,
  setLocation,
  peopleWorked,
  setPeopleWorked,
  supervisorName,
  onSubmit,
  onCancel
}: HoursEntryFormProps) => {
  if (!selectedDay) return null;

  const formattedDate = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    selectedDay
  ).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const isEditable = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    selectedDay
  ).toDateString() === new Date().toDateString();

  return (
    <div className="bg-white p-6 rounded-lg border border-border mt-6">
      <h3 className="text-lg font-medium mb-4">Hours for {formattedDate}</h3>
      
      {isEditable ? (
        <div>
          <div className="mb-4">
            <div className="text-sm font-medium mb-1">Supervisor</div>
            <div className="text-muted-foreground">{supervisorName}</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">Hours Worked</label>
              <Input 
                type="number" 
                value={hoursWorked}
                onChange={(e) => setHoursWorked(Number(e.target.value))}
                min={0}
                max={24}
                step={0.5}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">People Worked</label>
              <Input 
                type="number" 
                value={peopleWorked}
                onChange={(e) => setPeopleWorked(Number(e.target.value))}
                min={1}
                max={20}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <Input 
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter work location"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="outline" onClick={onCancel}>Cancel</Button>
            <Button onClick={onSubmit}>Submit Hours</Button>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-secondary/20 rounded-lg">
          <p className="text-center text-muted-foreground">
            Hours can only be submitted on the day of work.
          </p>
        </div>
      )}
    </div>
  );
};
