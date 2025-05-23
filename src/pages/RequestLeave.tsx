import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CalendarIcon, Loader2, Clock, FileText, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format, isBefore, isToday, differenceInBusinessDays, addDays } from 'date-fns';
import { leaveService, LeaveBalance, LeaveRequest } from '@/lib/services/leave-service';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DateRange } from 'react-day-picker';
import '../styles/modern-leave.css';

const RequestLeave = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // User data
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance | null>(null);
  const [previousRequests, setPreviousRequests] = useState<LeaveRequest[]>([]);
  
  // Form inputs
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [reason, setReason] = useState('');
  
  // Derived state
  const [businessDays, setBusinessDays] = useState(0);
  
  // Apply modern-leave class to body
  useEffect(() => {
    document.body.classList.add('modern-leave');
    
    return () => {
      document.body.classList.remove('modern-leave');
    };
  }, []);
  
  // Load leave balance and previous requests
  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      
      try {
        // Load leave balance
        const balance = await leaveService.getLeaveBalance(user.id);
        setLeaveBalance(balance);
        
        // Load previous requests
        const requests = await leaveService.getUserLeaveRequests(user.id);
        setPreviousRequests(requests);
      } catch (error) {
        console.error('Error loading leave data:', error);
        toast({
          title: 'Error',
          description: 'There was a problem loading your leave information. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [user?.id, toast]);
  
  // Calculate business days when dates change
  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      const days = differenceInBusinessDays(dateRange.to, dateRange.from) + 1;
      setBusinessDays(days > 0 ? days : 0);
    } else {
      setBusinessDays(0);
    }
  }, [dateRange]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id || !dateRange?.from || !dateRange?.to || !reason.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }
    
    // Check if leave has sufficient balance
    if (leaveBalance && leaveBalance.balance < businessDays) {
      toast({
        title: 'Insufficient leave balance',
        description: `You only have ${leaveBalance.balance} days of leave available.`,
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await leaveService.createLeaveRequest(user.id, {
        start_date: format(dateRange.from, 'yyyy-MM-dd'),
        end_date: format(dateRange.to, 'yyyy-MM-dd'),
        leave_type: 'annual', // Default to annual leave since we removed the type selection
        reason,
      });
      
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Your leave request has been submitted.',
        });
        
        // Reset form
        setDateRange(undefined);
        setReason('');
        
        // Refresh previous requests
        const requests = await leaveService.getUserLeaveRequests(user.id);
        setPreviousRequests(requests);
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error submitting leave request:', error);
      toast({
        title: 'Error',
        description: 'There was a problem submitting your leave request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Helper to disable past dates in calendar
  const disablePastDates = (date: Date) => {
    return isBefore(date, new Date()) && !isToday(date);
  };

  // Render status badge with icon
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <div className="leave-status leave-status-approved">
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
            Approved
          </div>
        );
      case 'rejected':
        return (
          <div className="leave-status leave-status-rejected">
            <XCircle className="h-3.5 w-3.5 mr-1" />
            Rejected
          </div>
        );
      default:
        return (
          <div className="leave-status leave-status-pending">
            <Clock className="h-3.5 w-3.5 mr-1" />
            Pending
          </div>
        );
    }
  };
  
  return (
    <div className="leave-container">
      <div className="leave-page-header">
        <h1 className="leave-page-title">Request Leave</h1>
        <div className="leave-page-date">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Leave Balance Card */}
        <div className="leave-card leave-fade-in md:col-span-1">
          <div className="leave-card-header">
            <h2 className="leave-card-title">Leave Balance</h2>
            <p className="leave-card-description">Your current leave entitlement</p>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--leave-primary)]" />
            </div>
          ) : leaveBalance ? (
            <div className="space-y-3">
              <div className="text-center">
                <div className="leave-balance-value">{leaveBalance.balance}</div>
                <div className="text-sm text-[#7ec6c6]">available days</div>
              </div>
              
              <div className="leave-balance-item">
                <span className="leave-balance-label">Monthly Accrual</span>
                <span className="font-medium">{leaveBalance.monthly_accrual_rate} days</span>
              </div>
              
              <div className="leave-balance-item">
                <span className="leave-balance-label">Last Accrual Date</span>
                <span className="font-medium">{format(new Date(leaveBalance.last_accrual_date), 'MMM d, yyyy')}</span>
              </div>
              
              <div className="leave-balance-item">
                <span className="leave-balance-label">Next Accrual</span>
                <span className="font-medium">{format(addDays(new Date(leaveBalance.last_accrual_date), 30), 'MMM d, yyyy')}</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6">
              <AlertCircle className="h-8 w-8 text-[var(--leave-primary)] mb-2" />
              <p className="text-center text-muted-foreground">No balance information available</p>
            </div>
          )}
        </div>
        
        {/* Leave Request Form */}
        <div className="leave-card leave-fade-in md:col-span-2">
          <div className="leave-card-header">
            <h2 className="leave-card-title">Submit Leave Request</h2>
            <p className="leave-card-description">Fill in the details to request time off</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Date Selection */}
            <div className="space-y-2">
              <Label htmlFor="date-range" className="text-[var(--leave-primary)] font-semibold">Select Date Range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date-range"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal border-[var(--leave-border)]",
                      !dateRange && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-[var(--leave-primary)]" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      "Select date range for your leave"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-[var(--leave-border)]" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    disabled={disablePastDates}
                    className="leave-date-picker"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Business Days Counter */}
            {dateRange?.from && dateRange?.to && businessDays > 0 && (
              <div className="leave-date-range-display">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm font-medium text-[var(--leave-primary)]">Business days:</span> 
                    <span className="leave-days-count ml-2">{businessDays}</span>
                  </div>
                  
                  {leaveBalance && (
                    <div>
                      <span className="text-sm font-medium text-[var(--leave-primary)]">Remaining after approval:</span>
                      <span className={cn(
                        "font-bold ml-2",
                        leaveBalance.balance < businessDays ? "text-red-500" : "text-[var(--leave-primary)]"
                      )}>
                        {Math.max(0, leaveBalance.balance - businessDays)}
                      </span>
                    </div>
                  )}
                </div>
                
                {leaveBalance && leaveBalance.balance < businessDays && (
                  <div className="mt-2 flex items-start gap-2 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4 mt-0.5" />
                    <span>The requested leave exceeds your available balance</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-[var(--leave-primary)] font-semibold">Reason for Leave</Label>
              <Textarea
                id="reason"
                placeholder="Briefly describe your reason for requesting leave"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="resize-none border-[var(--leave-border)]"
                required
              />
            </div>
            
            <div className="flex justify-end pt-2">
              <Button 
                type="submit" 
                className="bg-[var(--leave-primary)] hover:bg-[var(--leave-primary)]/90"
                disabled={
                  isSubmitting || 
                  !dateRange?.from || 
                  !dateRange?.to || 
                  businessDays <= 0 || 
                  !reason.trim() ||
                  (leaveBalance && leaveBalance.balance < businessDays)
                }
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Request'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Previous Requests */}
      <div className="leave-card leave-fade-in">
        <div className="leave-card-header">
          <h2 className="leave-card-title">Leave Request History</h2>
          <p className="leave-card-description">Your previous and pending leave requests</p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--leave-primary)]" />
          </div>
        ) : previousRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 bg-white/40 rounded-lg">
            <FileText className="h-12 w-12 text-[var(--leave-primary)] mb-3" />
            <p className="text-center text-lg font-semibold text-[var(--leave-primary)]">No Previous Requests</p>
            <p className="text-center text-muted-foreground mt-1">Your leave request history will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto mt-4">
            <table className="leave-table">
              <thead className="leave-table-header">
                <tr>
                  <th>Date Range</th>
                  <th>Business Days</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Submitted On</th>
                </tr>
              </thead>
              <tbody>
                {previousRequests.map((request) => (
                  <tr key={request.id} className="leave-table-row">
                    <td className="leave-table-cell font-medium">
                      {format(new Date(request.start_date), 'MMM d')} - {format(new Date(request.end_date), 'MMM d, yyyy')}
                    </td>
                    <td className="leave-table-cell">
                      <span className="font-semibold">{request.days_requested}</span> days
                    </td>
                    <td className="leave-table-cell capitalize">{request.leave_type}</td>
                    <td className="leave-table-cell">
                      {renderStatusBadge(request.status)}
                    </td>
                    <td className="leave-table-cell text-muted-foreground">
                      {format(new Date(request.created_at), 'MMM d, yyyy')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestLeave; 