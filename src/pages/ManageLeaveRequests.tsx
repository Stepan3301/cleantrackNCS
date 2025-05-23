import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { AlertCircle, Check, X, Loader2, User, Calendar } from 'lucide-react';
import { leaveService, LeaveRequest } from '@/lib/services/leave-service';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

// Type for the leave requests with profile information
interface LeaveRequestWithProfile extends LeaveRequest {
  profiles: {
    name: string;
    email: string;
    role: string;
  };
}

const ManageLeaveRequests = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<LeaveRequestWithProfile[]>([]);
  
  // Selected request for review
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequestWithProfile | null>(null);
  const [reviewAction, setReviewAction] = useState<'approved' | 'rejected' | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  
  // Check if user has permission to manage leave requests
  const canManageRequests = user && ['manager', 'head_manager', 'owner'].includes(user.role);
  
  // Load pending leave requests
  useEffect(() => {
    const loadPendingRequests = async () => {
      if (!canManageRequests) return;
      
      setIsLoading(true);
      
      try {
        const data = await leaveService.getPendingLeaveRequests();
        setPendingRequests(data);
      } catch (error) {
        console.error('Error loading pending leave requests:', error);
        toast({
          title: 'Error',
          description: 'Failed to load pending leave requests. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPendingRequests();
  }, [canManageRequests, toast]);
  
  // Handle request selection for review
  const handleSelectRequest = (request: LeaveRequestWithProfile, action: 'approved' | 'rejected') => {
    setSelectedRequest(request);
    setReviewAction(action);
    setReviewNotes('');
  };
  
  // Handle dialog close
  const handleCloseDialog = () => {
    setSelectedRequest(null);
    setReviewAction(null);
    setReviewNotes('');
  };
  
  // Handle request approval or rejection
  const handleSubmitReview = async () => {
    if (!selectedRequest || !reviewAction || !user?.id) return;
    
    setIsActionLoading(true);
    
    try {
      const result = await leaveService.updateLeaveRequestStatus(
        selectedRequest.id,
        user.id,
        {
          status: reviewAction,
          review_notes: reviewNotes,
        }
      );
      
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        });
        
        // Remove the processed request from the list
        setPendingRequests(prev => prev.filter(req => req.id !== selectedRequest.id));
        
        // Close the dialog
        handleCloseDialog();
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating leave request:', error);
      toast({
        title: 'Error',
        description: 'Failed to process the leave request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsActionLoading(false);
    }
  };
  
  // If user doesn't have permission, show unauthorized message
  if (!canManageRequests) {
    return (
      <div className="container mx-auto py-12 max-w-4xl">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <AlertCircle className="mr-2 h-5 w-5" />
              Unauthorized Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>You do not have permission to manage leave requests.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6">Manage Leave Requests</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Pending Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No pending leave requests to review
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Date Range</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="font-medium">{request.profiles.name}</div>
                      <div className="text-sm text-muted-foreground">{request.profiles.email}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>
                          {format(new Date(request.start_date), 'MMM d')} - {format(new Date(request.end_date), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {request.leave_type}
                      </Badge>
                    </TableCell>
                    <TableCell>{request.days_requested}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        Pending
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                          onClick={() => handleSelectRequest(request, 'approved')}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                          onClick={() => handleSelectRequest(request, 'rejected')}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Approval/Rejection Dialog */}
      {selectedRequest && (
        <Dialog open={!!selectedRequest} onOpenChange={handleCloseDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {reviewAction === 'approved' ? 'Approve Leave Request' : 'Reject Leave Request'}
              </DialogTitle>
              <DialogDescription>
                Review the details before {reviewAction === 'approved' ? 'approving' : 'rejecting'} this request.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Employee</h4>
                  <p className="font-medium flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    {selectedRequest.profiles.name}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Leave Type</h4>
                  <p className="font-medium capitalize">{selectedRequest.leave_type}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Date Range</h4>
                  <p className="font-medium">
                    {format(new Date(selectedRequest.start_date), 'MMM d, yyyy')} - {format(new Date(selectedRequest.end_date), 'MMM d, yyyy')}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Days Requested</h4>
                  <p className="font-medium">{selectedRequest.days_requested} days</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Reason</h4>
                <div className="bg-muted p-3 rounded-md">
                  <p className="whitespace-pre-line">{selectedRequest.reason}</p>
                </div>
              </div>
              
              {selectedRequest.leave_type === 'annual' && !selectedRequest.has_sufficient_balance && (
                <div className="bg-yellow-50 text-yellow-800 p-3 rounded-md flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Insufficient Leave Balance</h4>
                    <p className="text-sm">This employee may not have enough leave balance for this request.</p>
                  </div>
                </div>
              )}
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  {reviewAction === 'approved' ? 'Approval Notes (Optional)' : 'Rejection Reason'}
                </h4>
                <Textarea
                  placeholder={reviewAction === 'approved' 
                    ? "Add any notes for the approval (optional)"
                    : "Please provide a reason for rejecting this request"
                  }
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  required={reviewAction === 'rejected'}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog} disabled={isActionLoading}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitReview} 
                disabled={isActionLoading || (reviewAction === 'rejected' && !reviewNotes)}
                variant={reviewAction === 'approved' ? 'default' : 'destructive'}
              >
                {isActionLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : reviewAction === 'approved' ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Approve Request
                  </>
                ) : (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Reject Request
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ManageLeaveRequests; 