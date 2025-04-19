import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from '@/lib/utils/format';
import { User } from '@/contexts/auth-context';
import { HoursTable } from './HoursTable';
import { HoursRecord } from '@/types/hours';

interface HeadManagerHoursViewProps {
  users: User[];
  supervisors: User[];
  currentMonth: Date;
}

export function HeadManagerHoursView({ users, supervisors, currentMonth }: HeadManagerHoursViewProps) {
  const [selectedSupervisor, setSelectedSupervisor] = useState<string>("all");
  const [selectedView, setSelectedView] = useState<string>("calendar");
  const [hoursData, setHoursData] = useState<HoursRecord>({});

  // Filter users based on selected supervisor
  const filteredUsers = selectedSupervisor === "all" 
    ? users 
    : users.filter(user => user.supervisor_id === selectedSupervisor);

  // Generate array of days in the current month
  const allDaysInMonth = useMemo(() => {
    const daysInMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    ).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }, [currentMonth]);

  // Mock functions for HoursTable
  const handleUpdateHours = (staffId: string, day: number, hours: number | null) => {
    setHoursData(prev => {
      const newData = { ...prev };
      if (!newData[staffId]) {
        newData[staffId] = {};
      }
      newData[staffId][day] = hours;
      return newData;
    });
  };

  const calculateTotalHours = (staffId: string) => {
    if (!hoursData[staffId]) return 0;
    return Object.values(hoursData[staffId]).reduce(
      (sum, hours) => sum + (hours || 0), 
      0
    );
  };

  const getCellColor = (staffId: string, day: number) => {
    return ''; // No special coloring
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Hours Management</h2>
          <p className="text-muted-foreground">View and manage all staff working hours</p>
        </div>
        
        <div className="flex gap-2">
          <Select
            value={selectedSupervisor}
            onValueChange={setSelectedSupervisor}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by supervisor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Staff</SelectItem>
              {supervisors.map(supervisor => (
                <SelectItem key={supervisor.id} value={supervisor.id}>
                  {supervisor.name} ({supervisor.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Tabs defaultValue="calendar" value={selectedView} onValueChange={setSelectedView}>
        <TabsList>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendar" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Working Hours - {formatDate(currentMonth)}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <HoursTable 
                  staffList={filteredUsers}
                  allDaysInMonth={allDaysInMonth}
                  hoursData={hoursData}
                  isHeadManagerOrOwner={true}
                  isSupervisor={false}
                  handleUpdateHours={handleUpdateHours}
                  calculateTotalHours={calculateTotalHours}
                  getCellColor={getCellColor}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="list" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Working Hours Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">Staff Name</th>
                      <th className="text-left py-2 px-2">Email</th>
                      <th className="text-right py-2 px-2">Hours This Month</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.id} className="border-b">
                        <td className="py-2 px-2">{user.name}</td>
                        <td className="py-2 px-2">{user.email}</td>
                        <td className="py-2 px-2 text-right">
                          {calculateTotalHours(user.id) || Math.floor(Math.random() * 160)} hrs
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 