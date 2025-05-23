import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, isThisMonth } from 'date-fns';
import { WorkTimeRecord } from '@/lib/services/work-time-service';

interface UserDashboardProps {
  workTimeRecords: WorkTimeRecord[];
  currentMonth: Date;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ workTimeRecords, currentMonth }) => {
  // Calculate total hours worked in current month
  const totalHours = workTimeRecords.reduce((sum, record) => sum + record.hours_worked, 0);
  
  // Get the most recent work record
  const sortedRecords = [...workTimeRecords].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const lastRecord = sortedRecords[0];
  
  // Get unique locations
  const uniqueLocations = [...new Set(workTimeRecords.map(record => record.location))];
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>
            {format(currentMonth, 'MMMM yyyy')} Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Hours</h3>
              <p className="text-2xl font-bold">{totalHours.toFixed(1)}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Days Worked</h3>
              <p className="text-2xl font-bold">{workTimeRecords.length}</p>
            </div>
            
            {uniqueLocations.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Locations</h3>
                <div className="flex flex-wrap gap-2">
                  {uniqueLocations.map(location => (
                    <span key={location} className="px-2 py-1 bg-muted rounded-md text-sm">
                      {location}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {lastRecord && (
        <Card>
          <CardHeader>
            <CardTitle>Last Submission</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Date</h3>
                <p>{format(new Date(lastRecord.date), 'MMMM d, yyyy')}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Hours</h3>
                <p>{lastRecord.hours_worked}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Location</h3>
                <p>{lastRecord.location}</p>
              </div>
              
              {lastRecord.description && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                  <p className="text-sm">{lastRecord.description}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserDashboard; 