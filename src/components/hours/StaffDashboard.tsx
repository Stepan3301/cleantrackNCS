import React from 'react';
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { WorkTimeRecord } from '@/lib/services/work-time-service';
import { useAuth } from '@/contexts/auth-context';

interface StaffDashboardProps {
  todayRecords?: WorkTimeRecord[];
  totalHoursToday?: number;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({
  todayRecords = [],
  totalHoursToday = 0
}) => {
  const { user } = useAuth();
  
  return (
    <Card className="border shadow-sm h-full">
      <CardHeader className="pb-2">
        <CardTitle>Today's Hours</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border p-4">
          <div className="text-2xl font-bold mb-4">{totalHoursToday} hours</div>
          {todayRecords.length > 0 ? (
            <div className="space-y-3">
              {todayRecords.map((record, index) => (
                <div key={index} className="p-3 bg-muted/30 rounded-lg">
                  <div className="font-medium text-base">{record.location}</div>
                  <div className="text-sm text-muted-foreground">
                    {record.hours_worked} hours - {format(new Date(record.created_at || new Date()), 'h:mm a')}
                  </div>
                  {record.description && (
                    <div className="text-sm text-muted-foreground mt-1 italic">
                      "{record.description}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground text-center py-6">
              No hours recorded for today
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
