import { useState } from "react";
import { User } from "@/contexts/auth-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { WorkTimeRecord } from "@/lib/services/work-time-service";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import "@/styles/modern-employee-profile.css";

interface HoursViewProps {
  isOpen: boolean;
  employee: User;
  workTimeRecords: WorkTimeRecord[];
  onClose: () => void;
}

export function HoursView({ isOpen, employee, workTimeRecords, onClose }: HoursViewProps) {
  // Get current month's start and end dates
  const currentMonth = new Date();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  
  // Filter records for this employee and current month
  const employeeRecords = workTimeRecords
    .filter(record => {
      const recordDate = new Date(record.date);
      return record.user_id === employee.id &&
             recordDate >= monthStart &&
             recordDate <= monthEnd;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by date descending

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            Work Time Records - {employee.name} ({format(currentMonth, 'MMMM yyyy')})
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6">
          {employeeRecords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No records found for {format(currentMonth, 'MMMM yyyy')}
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Record Type</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employeeRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{format(new Date(record.date), 'MMM d, yyyy')}</TableCell>
                      <TableCell>{record.hours_worked}</TableCell>
                      <TableCell>{record.location || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={
                          record.record_type === 'supervisor' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }>
                          {record.record_type === 'supervisor' ? 'Supervisor' : 'Self'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          record.status === 'approved' 
                            ? 'secondary'
                            : record.status === 'rejected'
                            ? 'destructive'
                            : 'outline'
                        }>
                          {record.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-muted-foreground">
            Total Records: {employeeRecords.length}
          </div>
          <button 
            className="modern-employee-profile-button primary"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
