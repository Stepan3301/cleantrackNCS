import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Download, 
  BarChart3, 
  LineChart, 
  FileText, 
  Users, 
  Clock, 
  Calendar, 
  PieChart, 
  FilePlus 
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

const Reports: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("performance");
  const [dateRange, setDateRange] = useState("month");

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Reports</h1>
        
        <div className="flex items-center space-x-2">
          <Calendar size={18} className="text-muted-foreground" />
          <div className="flex bg-white rounded-md border border-border overflow-hidden">
            <Button 
              variant={dateRange === "week" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-none"
              onClick={() => setDateRange("week")}
            >
              Week
            </Button>
            <Button 
              variant={dateRange === "month" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-none"
              onClick={() => setDateRange("month")}
            >
              Month
            </Button>
            <Button 
              variant={dateRange === "quarter" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-none"
              onClick={() => setDateRange("quarter")}
            >
              Quarter
            </Button>
            <Button 
              variant={dateRange === "year" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-none"
              onClick={() => setDateRange("year")}
            >
              Year
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="performance" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full md:w-auto">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
        </TabsList>
        
        <TabsContent value="performance" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 size={18} />
                  Hours Distribution
                </CardTitle>
                <CardDescription>Hours by department and role</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 size={48} className="text-primary mx-auto mb-4 opacity-70" />
                    <p className="text-muted-foreground mb-4">
                      Hours distribution visualization
                    </p>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Download size={16} />
                      Export Chart
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart size={18} />
                  Performance Trends
                </CardTitle>
                <CardDescription>Month-by-month comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <div className="text-center">
                    <LineChart size={48} className="text-primary mx-auto mb-4 opacity-70" />
                    <p className="text-muted-foreground mb-4">
                      Performance trend visualization
                    </p>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Download size={16} />
                      Export Chart
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Performance Report</CardTitle>
              <CardDescription>Download detailed reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center">
                  <FileText className="mb-2 h-6 w-6 text-primary" />
                  <span className="font-medium">Hours Summary</span>
                  <span className="text-xs text-muted-foreground mt-1">Excel / PDF</span>
                </Button>
                
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center">
                  <FileText className="mb-2 h-6 w-6 text-primary" />
                  <span className="font-medium">Target Achievement</span>
                  <span className="text-xs text-muted-foreground mt-1">Excel / PDF</span>
                </Button>
                
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center">
                  <FileText className="mb-2 h-6 w-6 text-primary" />
                  <span className="font-medium">Efficiency Report</span>
                  <span className="text-xs text-muted-foreground mt-1">Excel / PDF</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="staff" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users size={18} />
                  Staff Performance
                </CardTitle>
                <CardDescription>Comparison by role and team</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <div className="text-center">
                    <Users size={48} className="text-primary mx-auto mb-4 opacity-70" />
                    <p className="text-muted-foreground mb-4">
                      Staff performance visualization
                    </p>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Download size={16} />
                      Export Chart
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock size={18} />
                  Hours by Staff
                </CardTitle>
                <CardDescription>Individual contribution analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <div className="text-center">
                    <Clock size={48} className="text-primary mx-auto mb-4 opacity-70" />
                    <p className="text-muted-foreground mb-4">
                      Staff hours visualization
                    </p>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Download size={16} />
                      Export Chart
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Staff Reports</CardTitle>
              <CardDescription>Download detailed staff reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center">
                  <FileText className="mb-2 h-6 w-6 text-primary" />
                  <span className="font-medium">Employee Performance</span>
                  <span className="text-xs text-muted-foreground mt-1">Excel / PDF</span>
                </Button>
                
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center">
                  <FileText className="mb-2 h-6 w-6 text-primary" />
                  <span className="font-medium">Attendance Summary</span>
                  <span className="text-xs text-muted-foreground mt-1">Excel / PDF</span>
                </Button>
                
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center">
                  <FileText className="mb-2 h-6 w-6 text-primary" />
                  <span className="font-medium">Staff Utilization</span>
                  <span className="text-xs text-muted-foreground mt-1">Excel / PDF</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="financial" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart size={18} />
                  Revenue Breakdown
                </CardTitle>
                <CardDescription>Revenue by service type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <div className="text-center">
                    <PieChart size={48} className="text-primary mx-auto mb-4 opacity-70" />
                    <p className="text-muted-foreground mb-4">
                      Revenue breakdown visualization
                    </p>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Download size={16} />
                      Export Chart
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 size={18} />
                  Profit Analysis
                </CardTitle>
                <CardDescription>Monthly profit comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 size={48} className="text-primary mx-auto mb-4 opacity-70" />
                    <p className="text-muted-foreground mb-4">
                      Profit analysis visualization
                    </p>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Download size={16} />
                      Export Chart
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Financial Reports</CardTitle>
              <CardDescription>Download detailed financial reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center">
                  <FileText className="mb-2 h-6 w-6 text-primary" />
                  <span className="font-medium">Revenue Report</span>
                  <span className="text-xs text-muted-foreground mt-1">Excel / PDF</span>
                </Button>
                
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center">
                  <FileText className="mb-2 h-6 w-6 text-primary" />
                  <span className="font-medium">Expense Summary</span>
                  <span className="text-xs text-muted-foreground mt-1">Excel / PDF</span>
                </Button>
                
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center">
                  <FileText className="mb-2 h-6 w-6 text-primary" />
                  <span className="font-medium">Profit & Loss</span>
                  <span className="text-xs text-muted-foreground mt-1">Excel / PDF</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports; 