import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { authService } from "@/lib/auth-service";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface RegistrationRequest {
  id: string;
  user_id: string;
  request_type: string;
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  profiles?: {
    name: string;
    email: string;
    role: string;
    phone_number?: string;
  };
  user_details?: {
    name: string;
    email: string;
    role: string;
    phone_number?: string;
  };
}

// This interface represents a user with pending approval status 
// that might not have a corresponding request record
interface PendingUser {
  id: string;
  name: string;
  email: string;
  role: string;
  phone_number?: string;
  status: string;
  created_at: string;
  has_request: boolean;
}

export default function RegistrationRequests() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllPendingRegistrations();
  }, []);

  const fetchAllPendingRegistrations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Step 1: Fetch all users with pending_approval status
      const { data: pendingProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, email, role, phone_number, status, created_at')
        .eq('status', 'pending_approval')
        .order('created_at', { ascending: false });
      
      if (profilesError) {
        console.error("Error fetching pending profiles:", profilesError);
        setError("Failed to fetch pending profiles");
        return;
      }
      
      // Step 2: Fetch all pending registration requests - modified to avoid relation ambiguity
      const { data: pendingRequests, error: requestsError } = await supabase
        .from('requests')
        .select('*, profiles!requests_user_id_fkey(name, email, role, phone_number)')
        .eq('request_type', 'registration')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (requestsError) {
        console.error("Error fetching registration requests:", requestsError);
        setError("Failed to fetch registration requests");
        return;
      }
      
      // Transform the response to match our expected structure
      const formattedRequests = pendingRequests?.map(req => ({
        ...req,
        user_details: req.profiles
      })) || [];
      
      // Set the requests from the requests table
      setRequests(formattedRequests);
      
      // Map the profiles to PendingUser objects and check if they have a request record
      const pendingUsersList: PendingUser[] = (pendingProfiles || []).map(profile => {
        const hasRequest = pendingRequests?.some(req => req.user_id === profile.id) || false;
        return {
          ...profile,
          has_request: hasRequest
        };
      });
      
      // Set the combined list of pending users
      setPendingUsers(pendingUsersList);
      
      console.log("Fetched pending profiles:", pendingProfiles?.length);
      console.log("Fetched pending requests:", pendingRequests?.length);
      
    } catch (error) {
      console.error("Error fetching all pending registrations:", error);
      setError("Failed to load registration data");
      toast({
        title: "Error",
        description: "Failed to load registration requests",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserAction = async (pendingUser: PendingUser, action: "approve" | "reject") => {
    if (!user) return;
    
    setIsProcessing(true);
    setProcessingId(pendingUser.id);
    
    try {
      console.log(`Starting ${action} process for user ${pendingUser.id}...`);
      
      if (action === "approve") {
        await handleUserApproval(pendingUser);
        toast({
          title: "Registration Approved",
          description: `Registration for ${pendingUser.name} has been approved.`,
        });
      } else {
        // For rejection, we'll still use the confirmation dialog
        // as rejection is a destructive action that should be confirmed
        const confirmed = window.confirm(
          `Are you sure you want to reject the registration for ${pendingUser.name}? The user will not be able to access the system.`
        );
        
        if (confirmed) {
          await handleUserRejection(pendingUser);
          toast({
            title: "Registration Rejected",
            description: `Registration for ${pendingUser.name} has been rejected.`,
          });
        } else {
          // User canceled the rejection
          console.log("Rejection canceled by user");
          setIsProcessing(false);
          setProcessingId(null);
          return;
        }
      }
      
      // Refresh the lists
      console.log("Action completed successfully, refreshing data...");
      await fetchAllPendingRegistrations();
      
    } catch (error) {
      console.error(`Error ${action}ing registration:`, error);
      
      // Create a more descriptive error message
      let errorMessage = `Failed to ${action} registration.`;
      
      if (error instanceof Error) {
        errorMessage += ` Error: ${error.message}`;
      }
      
      // Check if it might be an RLS policy issue
      if (error && typeof error === 'object' && 'code' in error) {
        const errorCode = (error as any).code;
        if (errorCode === '42501') {
          errorMessage += " This appears to be a permissions issue. Please ensure you have the necessary rights to update profiles.";
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProcessingId(null);
    }
  };

  const handleRequestAction = async (request: RegistrationRequest, action: "approve" | "reject") => {
    if (!user) return;
    
    setIsProcessing(true);
    setProcessingId(request.id);
    
    try {
      console.log(`Starting ${action} process for request ${request.id}...`);
      
      if (action === "approve") {
        await handleApproval(request);
        toast({
          title: "Registration Approved",
          description: `Registration request for ${request.user_details?.name || 'user'} has been approved.`,
        });
      } else {
        // For rejection, we'll still use the confirmation dialog
        // as rejection is a destructive action that should be confirmed
        const confirmed = window.confirm(
          `Are you sure you want to reject the registration for ${request.user_details?.name || 'user'}? The user will not be able to access the system.`
        );
        
        if (confirmed) {
          await handleRejection(request);
          toast({
            title: "Registration Rejected",
            description: `Registration request for ${request.user_details?.name || 'user'} has been rejected.`,
          });
        } else {
          // User canceled the rejection
          console.log("Rejection canceled by user");
          setIsProcessing(false);
          setProcessingId(null);
          return;
        }
      }
      
      // Refresh the lists
      console.log("Action completed successfully, refreshing data...");
      await fetchAllPendingRegistrations();
      
    } catch (error) {
      console.error(`Error ${action}ing registration:`, error);
      
      // Create a more descriptive error message
      let errorMessage = `Failed to ${action} registration.`;
      
      if (error instanceof Error) {
        errorMessage += ` Error: ${error.message}`;
      }
      
      // Check if it might be an RLS policy issue
      if (error && typeof error === 'object' && 'code' in error) {
        const errorCode = (error as any).code;
        if (errorCode === '42501') {
          errorMessage += " This appears to be a permissions issue. Please ensure you have the necessary rights to update profiles.";
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProcessingId(null);
    }
  };

  const handleApproval = async (request: RegistrationRequest) => {
    console.log("Starting approval process for request:", request.id);
    
    try {
      // 1. Update the request status in the database
      const { data: requestData, error: requestError } = await supabase
        .from('requests')
        .update({
          status: 'approved',
          handled_by: user!.id,
          response_message: 'Registration approved. You can now log in.',
          updated_at: new Date().toISOString()
        })
        .eq('id', request.id)
        .select();
        
      if (requestError) {
        console.error("Error updating request:", requestError);
        throw requestError;
      }
      
      console.log("Request update successful:", requestData);
      
      // 2. Update the user's profile to set status to 'active'
      console.log("Updating profile status for user_id:", request.user_id);
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .update({
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', request.user_id)
        .select();
        
      if (profileError) {
        console.error("Error updating profile:", profileError);
        throw profileError;
      }
      
      console.log("Profile update successful:", profileData);
      
      // 3. Double-check that the profile was updated correctly
      const { data: checkProfile, error: checkError } = await supabase
        .from('profiles')
        .select('status')
        .eq('id', request.user_id)
        .single();
        
      if (checkError) {
        console.error("Error checking profile status:", checkError);
      } else {
        console.log("Current profile status:", checkProfile?.status);
        if (checkProfile?.status !== 'active') {
          console.warn("Profile status is not active after update!");
        }
      }
    } catch (error) {
      console.error("Error in handleApproval:", error);
      throw error;
    }
  };

  const handleUserApproval = async (pendingUser: PendingUser) => {
    console.log("Starting approval process for user:", pendingUser.id);
    
    try {
      // Create a request record if one doesn't exist
      if (!pendingUser.has_request) {
        console.log("Creating new request record for user:", pendingUser.id);
        
        const { data: requestData, error: createError } = await supabase
          .from('requests')
          .insert({
            user_id: pendingUser.id,
            request_type: 'registration',
            title: 'Registration Request',
            description: `User ${pendingUser.name} (${pendingUser.email}) has registered and is awaiting approval.`,
            status: 'approved',
            handled_by: user!.id,
            response_message: 'Registration approved. You can now log in.'
          })
          .select();
        
        if (createError) {
          console.error("Error creating request record:", createError);
          // Continue anyway since this is just for record-keeping
        } else {
          console.log("Request record created successfully:", requestData);
        }
      } else {
        console.log("User already has a request record, updating existing records");
        
        // Update existing request to approved
        const { error: updateError } = await supabase
          .from('requests')
          .update({
            status: 'approved',
            handled_by: user!.id,
            response_message: 'Registration approved. You can now log in.',
            updated_at: new Date().toISOString()
          })
          .eq('user_id', pendingUser.id)
          .eq('request_type', 'registration');
          
        if (updateError) {
          console.error("Error updating existing request:", updateError);
        }
      }
      
      // Update the user's profile status to active
      console.log("Updating profile status for user:", pendingUser.id);
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .update({
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', pendingUser.id)
        .select();
      
      if (profileError) {
        console.error("Error updating profile:", profileError);
        throw profileError;
      }
      
      console.log("Profile update successful:", profileData);
      
      // Double-check that the profile was updated correctly
      const { data: checkProfile, error: checkError } = await supabase
        .from('profiles')
        .select('status')
        .eq('id', pendingUser.id)
        .single();
        
      if (checkError) {
        console.error("Error checking profile status:", checkError);
      } else {
        console.log("Current profile status:", checkProfile?.status);
        if (checkProfile?.status !== 'active') {
          console.warn("Profile status is not active after update!");
        }
      }
    } catch (error) {
      console.error("Error in handleUserApproval:", error);
      throw error;
    }
  };

  const handleRejection = async (request: RegistrationRequest) => {
    console.log("Starting rejection process for request:", request.id);
    
    try {
      // 1. Update the request status in the database
      const { data: requestData, error: requestError } = await supabase
        .from('requests')
        .update({
          status: 'rejected',
          handled_by: user!.id,
          response_message: 'Registration rejected. Please contact an administrator for more information.',
          updated_at: new Date().toISOString()
        })
        .eq('id', request.id)
        .select();
        
      if (requestError) {
        console.error("Error updating request:", requestError);
        throw requestError;
      }
      
      console.log("Request update successful:", requestData);
      
      // 2. Update the user's profile to set status to 'inactive'
      console.log("Updating profile status for user_id:", request.user_id);
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .update({
          status: 'inactive',
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', request.user_id)
        .select();
        
      if (profileError) {
        console.error("Error updating profile:", profileError);
        throw profileError;
      }
      
      console.log("Profile update successful:", profileData);
      
      // 3. Double-check that the profile was updated correctly
      const { data: checkProfile, error: checkError } = await supabase
        .from('profiles')
        .select('status')
        .eq('id', request.user_id)
        .single();
        
      if (checkError) {
        console.error("Error checking profile status:", checkError);
      } else {
        console.log("Current profile status:", checkProfile?.status);
        if (checkProfile?.status !== 'inactive') {
          console.warn("Profile status is not inactive after update!");
        }
      }
    } catch (error) {
      console.error("Error in handleRejection:", error);
      throw error;
    }
  };

  const handleUserRejection = async (pendingUser: PendingUser) => {
    console.log("Starting rejection process for user:", pendingUser.id);
    
    try {
      // Create a request record if one doesn't exist
      if (!pendingUser.has_request) {
        console.log("Creating new request record for user:", pendingUser.id);
        
        const { data: requestData, error: createError } = await supabase
          .from('requests')
          .insert({
            user_id: pendingUser.id,
            request_type: 'registration',
            title: 'Registration Request',
            description: `User ${pendingUser.name} (${pendingUser.email}) has registered and is awaiting approval.`,
            status: 'rejected',
            handled_by: user!.id,
            response_message: 'Registration rejected. Please contact an administrator for more information.'
          })
          .select();
        
        if (createError) {
          console.error("Error creating request record:", createError);
          // Continue anyway since this is just for record-keeping
        } else {
          console.log("Request record created successfully:", requestData);
        }
      } else {
        console.log("User already has a request record, updating existing records");
        
        // Update existing request to rejected
        const { error: updateError } = await supabase
          .from('requests')
          .update({
            status: 'rejected',
            handled_by: user!.id,
            response_message: 'Registration rejected. Please contact an administrator for more information.',
            updated_at: new Date().toISOString()
          })
          .eq('user_id', pendingUser.id)
          .eq('request_type', 'registration');
          
        if (updateError) {
          console.error("Error updating existing request:", updateError);
        }
      }
      
      // Update the user's profile status to inactive
      console.log("Updating profile status for user:", pendingUser.id);
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .update({
          status: 'inactive',
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', pendingUser.id)
        .select();
      
      if (profileError) {
        console.error("Error updating profile:", profileError);
        throw profileError;
      }
      
      console.log("Profile update successful:", profileData);
      
      // Double-check that the profile was updated correctly
      const { data: checkProfile, error: checkError } = await supabase
        .from('profiles')
        .select('status')
        .eq('id', pendingUser.id)
        .single();
        
      if (checkError) {
        console.error("Error checking profile status:", checkError);
      } else {
        console.log("Current profile status:", checkProfile?.status);
        if (checkProfile?.status !== 'inactive') {
          console.warn("Profile status is not inactive after update!");
        }
      }
    } catch (error) {
      console.error("Error in handleUserRejection:", error);
      throw error;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "staff":
        return "bg-blue-100 text-blue-800";
      case "supervisor":
        return "bg-purple-100 text-purple-800";
      case "manager":
        return "bg-amber-100 text-amber-800";
      case "head_manager":
        return "bg-green-100 text-green-800";
      case "owner":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Calculate the total number of pending items
  const pendingCount = pendingUsers.length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Registration Requests</h1>
          {error && (
            <p className="text-sm text-red-500 mt-1">{error}</p>
          )}
        </div>
        <Button 
          variant="outline" 
          onClick={fetchAllPendingRegistrations}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : pendingCount === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-6">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No Pending Requests</h3>
              <p className="text-sm text-muted-foreground mt-2">
                All registration requests have been processed.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {/* Display pending users from the profiles table */}
          {pendingUsers.map((pendingUser) => (
            <Card key={`user-${pendingUser.id}`} className="border border-amber-100">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{pendingUser.name || 'Unknown User'}</CardTitle>
                    <CardDescription>{pendingUser.email || 'No email'}</CardDescription>
                  </div>
                  {pendingUser.role && (
                    <Badge className={getRoleBadgeColor(pendingUser.role)}>
                      {pendingUser.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Registered On</p>
                      <p>{format(new Date(pendingUser.created_at), "PPP")}</p>
                    </div>
                    {pendingUser.phone_number && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Phone</p>
                        <p>{pendingUser.phone_number}</p>
                      </div>
                    )}
                  </div>
                  
                  {!pendingUser.has_request && (
                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-2">
                      <p className="text-xs text-amber-800">
                        <AlertCircle className="inline-block h-3 w-3 mr-1" />
                        No request record found for this user. Approving will create one automatically.
                      </p>
                    </div>
                  )}
                  
                  <div className="flex justify-end space-x-3">
                    <Button 
                      variant="outline" 
                      onClick={() => handleUserAction(pendingUser, "reject")}
                      disabled={isProcessing && processingId === pendingUser.id}
                      className="border-red-200 hover:bg-red-50"
                    >
                      {isProcessing && processingId === pendingUser.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <XCircle className="mr-2 h-4 w-4" />
                      )}
                      Reject
                    </Button>
                    <Button 
                      onClick={() => handleUserAction(pendingUser, "approve")}
                      disabled={isProcessing && processingId === pendingUser.id}
                      className="bg-gradient-to-r from-green-400 to-emerald-600 hover:from-green-500 hover:to-emerald-700 text-white shadow-md"
                    >
                      {isProcessing && processingId === pendingUser.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="mr-2 h-4 w-4" />
                      )}
                      Approve
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 