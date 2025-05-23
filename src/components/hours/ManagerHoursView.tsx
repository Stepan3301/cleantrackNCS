import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "@/contexts/auth-context";
import { WorkTimeRecord } from "@/lib/services/work-time-service";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ManagerHoursViewProps {
  allSupervisors: User[];
  workTimeRecords: WorkTimeRecord[];
  getStaffForSupervisor: (supervisorId: string) => User[];
  calculateTotalHours: (staffId: string) => number;
  getCellColor: (staffId: string, day: number) => string;
  isHeadManagerOrOwner: boolean;
  users: User[];
}

export function ManagerHoursView({ 
  allSupervisors,
  workTimeRecords,
  getStaffForSupervisor,
  calculateTotalHours,
  getCellColor,
  isHeadManagerOrOwner,
  users
}: ManagerHoursViewProps) {
  const [selectedSupervisor, setSelectedSupervisor] = useState<string>("none");
  const [currentMonth] = useState(new Date());

  // Determine if we're viewing already filtered records or not
  const isSupervisorFilteredFromPage = workTimeRecords.length > 0 && 
    workTimeRecords.every(record => {
      // Check if all records belong to staff under the same supervisor
      const staffMember = users.find(u => u.id === record.user_id);
      return staffMember && allSupervisors.some(s => s.id === staffMember.supervisor_id);
    });

  // If the page-level filter is active, find which supervisor is selected
  const pageLevelSupervisor = isSupervisorFilteredFromPage && workTimeRecords.length > 0 ? 
    (() => {
      // Get the supervisor of the first staff member in the records
      const firstRecord = workTimeRecords[0];
      const staffMember = users.find(u => u.id === firstRecord?.user_id);
      return staffMember?.supervisor_id || null;
    })() : null;

  // Filter records for the selected supervisor's staff if component filter is used
  const filteredRecords = !isSupervisorFilteredFromPage && selectedSupervisor && selectedSupervisor !== "none"
    ? workTimeRecords.filter(record => {
        const staffMembers = getStaffForSupervisor(selectedSupervisor);
        return staffMembers.some(staff => staff.id === record.user_id);
      })
    : workTimeRecords; // If page filter is active, use the records as is

  // Group records by user_id and date for easier display
  const groupedRecords = filteredRecords.reduce((acc, record) => {
    if (!acc[record.user_id]) {
      acc[record.user_id] = {};
    }
    
    const date = record.date;
    if (!acc[record.user_id][date]) {
      acc[record.user_id][date] = [];
    }
    
    acc[record.user_id][date].push(record);
    return acc;
  }, {} as Record<string, Record<string, WorkTimeRecord[]>>);

  // Get the active supervisor name for display
  const getActiveSupervisorName = () => {
    if (isSupervisorFilteredFromPage && pageLevelSupervisor) {
      return allSupervisors.find(s => s.id === pageLevelSupervisor)?.name || 'Selected Supervisor';
    } else if (selectedSupervisor !== "none") {
      return allSupervisors.find(s => s.id === selectedSupervisor)?.name || 'Selected Supervisor';
    }
    return null;
  };

  const activeSupervisorName = getActiveSupervisorName();
  const showComponentFilter = !isSupervisorFilteredFromPage;

  return (
    <>
      {/* Only show the component-level filter if page filter isn't active */}
      {showComponentFilter && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Select Supervisor</label>
          <Select
            value={selectedSupervisor}
            onValueChange={setSelectedSupervisor}
          >
            <SelectTrigger className="w-full md:w-72">
              <SelectValue placeholder="Select a supervisor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Select a supervisor</SelectItem>
              {allSupervisors.map(supervisor => (
                <SelectItem key={supervisor.id} value={supervisor.id}>
                  {supervisor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Tabs defaultValue="records">
        <TabsList>
          <TabsTrigger value="records">Staff Records</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>
        
        <TabsContent value="records">
          {(showComponentFilter && selectedSupervisor !== "none") || isSupervisorFilteredFromPage ? (
            <Card>
              <CardHeader>
                <CardTitle>Work Time Records</CardTitle>
                <CardDescription>
                  {activeSupervisorName && `Showing records for staff supervised by ${activeSupervisorName}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredRecords.length > 0 ? (
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Staff Name</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Hours</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Record Type</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRecords.map(record => {
                          const staffMember = users.find(u => u.id === record.user_id);
                          return (
                            <TableRow key={record.id}>
                              <TableCell>{staffMember?.name || 'Unknown'}</TableCell>
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
                                <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                                  record.status === 'approved' 
                                    ? 'bg-green-100 text-green-800' 
                                    : record.status === 'rejected'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                </span>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center p-6 bg-muted/20 rounded-md">
                    <p>No records found for {activeSupervisorName ? `staff supervised by ${activeSupervisorName}` : 'the selected filter'}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="text-center p-6 bg-muted/20 rounded-md">
              <p>Please select a supervisor to view staff records</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="summary">
          {(showComponentFilter && selectedSupervisor !== "none") || isSupervisorFilteredFromPage ? (
            <Card>
              <CardHeader>
                <CardTitle>Staff Hours Summary</CardTitle>
                <CardDescription>
                  {activeSupervisorName && `Total hours worked by staff supervised by ${activeSupervisorName}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {Object.keys(groupedRecords).length > 0 ? (
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Staff Name</TableHead>
                          <TableHead>Total Hours</TableHead>
                          <TableHead>Number of Records</TableHead>
                          <TableHead>Latest Record</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(groupedRecords).map(([userId, dates]) => {
                          const staffMember = users.find(u => u.id === userId);
                          const allRecords = Object.values(dates).flat();
                          const totalHours = allRecords.reduce((sum, record) => sum + record.hours_worked, 0);
                          const latestRecord = allRecords.sort((a, b) => 
                            new Date(b.date).getTime() - new Date(a.date).getTime()
                          )[0];
                          
                          return (
                            <TableRow key={userId}>
                              <TableCell>{staffMember?.name || 'Unknown'}</TableCell>
                              <TableCell>{totalHours.toFixed(1)} hours</TableCell>
                              <TableCell>{allRecords.length}</TableCell>
                              <TableCell>
                                {latestRecord ? format(new Date(latestRecord.date), 'MMM d, yyyy') : 'N/A'}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center p-6 bg-muted/20 rounded-md">
                    <p>No records found for {activeSupervisorName ? `staff supervised by ${activeSupervisorName}` : 'the selected filter'}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="text-center p-6 bg-muted/20 rounded-md">
              <p>Please select a supervisor to view summary</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}
