import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from '@/contexts/auth-context';
import { WorkTimeRecord } from "@/lib/services/work-time-service";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

interface HeadManagerHoursViewProps {
  users: User[];
  allSupervisors: User[];
  workTimeRecords: WorkTimeRecord[];
}

export function HeadManagerHoursView({
  users,
  allSupervisors,
  workTimeRecords
}: HeadManagerHoursViewProps) {
  const [selectedSupervisor, setSelectedSupervisor] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isPageFiltered, setIsPageFiltered] = useState<boolean>(false);
  const [pageSupervisorId, setPageSupervisorId] = useState<string | null>(null);

  // Check if records are already filtered at the page level
  useEffect(() => {
    if (workTimeRecords.length > 0) {
      // Get all unique staff IDs in the records
      const staffIds = [...new Set(workTimeRecords.map(record => record.user_id))];
      
      // Get the supervisors of these staff members
      const supervisorIds = staffIds
        .map(staffId => users.find(u => u.id === staffId)?.supervisor_id)
        .filter(Boolean) as string[];
      
      // If all staff have the same supervisor and it's not empty/null
      if (supervisorIds.length > 0 && new Set(supervisorIds).size === 1) {
        setIsPageFiltered(true);
        setPageSupervisorId(supervisorIds[0]);
        setSelectedSupervisor(supervisorIds[0]);
      } else {
        setIsPageFiltered(false);
        setPageSupervisorId(null);
      }
    }
  }, [workTimeRecords, users]);

  // Filter records based on selected supervisor and month
  const filteredRecords = workTimeRecords.filter(record => {
    const recordDate = new Date(record.date);
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const isInSelectedMonth = recordDate >= monthStart && recordDate <= monthEnd;

    // If we're already filtered at the page level, just filter by month
    if (isPageFiltered) {
      return isInSelectedMonth;
    }

    // Otherwise, apply both filters
    if (selectedSupervisor === "all") {
      return isInSelectedMonth;
    }

    const staffMember = users.find(u => u.id === record.user_id);
    return staffMember?.supervisor_id === selectedSupervisor && isInSelectedMonth;
  });

  // Get supervisor name for display
  const getSupervisorName = () => {
    if (isPageFiltered && pageSupervisorId) {
      return users.find(u => u.id === pageSupervisorId)?.name || 'Selected Supervisor';
    } else if (selectedSupervisor !== "all") {
      return users.find(u => u.id === selectedSupervisor)?.name || 'Selected Supervisor';
    }
    return 'All Supervisors';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 md:items-end">
        {/* Only show supervisor filter if not filtered at page level */}
        {!isPageFiltered && (
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Select Supervisor</label>
            <Select
              value={selectedSupervisor}
              onValueChange={setSelectedSupervisor}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a supervisor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Supervisors</SelectItem>
                {allSupervisors.map(supervisor => (
                  <SelectItem key={supervisor.id} value={supervisor.id}>
                    {supervisor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className={isPageFiltered ? "w-full" : "flex-1"}>
          <label className="block text-sm font-medium mb-2">Select Month</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, 'MMMM yyyy') : <span>Pick a month</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Staff Work Time Records</CardTitle>
          <CardDescription>
            {`Showing records for staff under ${getSupervisorName()} for ${format(selectedDate, 'MMMM yyyy')}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRecords.length > 0 ? (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Name</TableHead>
                    <TableHead>Supervisor</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Record Type</TableHead>
                    <TableHead>Equality Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map(record => {
                    const staffMember = users.find(u => u.id === record.user_id);
                    const supervisor = staffMember?.supervisor_id 
                      ? users.find(u => u.id === staffMember.supervisor_id)
                      : null;
                      
                    return (
                      <TableRow key={record.id}>
                        <TableCell>{staffMember?.name || 'Unknown'}</TableCell>
                        <TableCell>{supervisor?.name || 'No Supervisor'}</TableCell>
                        <TableCell>{format(new Date(record.date), 'MMM d, yyyy')}</TableCell>
                        <TableCell>{record.hours_worked}</TableCell>
                        <TableCell>{record.location || 'N/A'}</TableCell>
                        <TableCell>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                            record.record_type === 'supervisor' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {record.record_type === 'supervisor' ? 'Supervisor' : 'Self'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {record.equality === true && (
                            <span className="inline-block px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                              Matched
                            </span>
                          )}
                          {record.equality === false && (
                            <span className="inline-block px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                              Mismatch
                            </span>
                          )}
                          {record.equality === null && (
                            <span className="inline-block px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                              Pending Match
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center p-6 bg-muted/20 rounded-md">
              <p>No records found for the selected criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 