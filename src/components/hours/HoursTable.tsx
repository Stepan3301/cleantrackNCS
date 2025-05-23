import React from 'react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WorkTimeRecord } from '@/lib/services/work-time-service';
import { Badge } from '@/components/ui/badge';

export interface HoursTableProps {
  records: WorkTimeRecord[];
  isToday: boolean;
}

export const HoursTable: React.FC<HoursTableProps> = ({ records, isToday }) => {
  if (!records || records.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No work records found for the selected day.
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="text-sm font-medium mb-2">
        {isToday ? 'Today\'s Records' : 'Records for Selected Day'}
      </h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>Hours</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record, index) => (
            <TableRow key={record.id || index}>
              <TableCell className="text-sm">
                {record.created_at 
                  ? format(new Date(record.created_at), 'h:mm a')
                  : 'Unknown'}
              </TableCell>
              <TableCell className="font-medium">{record.hours_worked}</TableCell>
              <TableCell className="text-sm">{record.location || 'N/A'}</TableCell>
              <TableCell>
                {record.status === 'approved' ? (
                  <Badge variant="secondary" className="text-xs">Approved</Badge>
                ) : record.status === 'rejected' ? (
                  <Badge variant="destructive" className="text-xs">Rejected</Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">Pending</Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
