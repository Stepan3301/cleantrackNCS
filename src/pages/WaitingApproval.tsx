import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { AlertCircle, Clock, MailIcon, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function WaitingApproval() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [requestDetails, setRequestDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRequestStatus();
    }
  }, [user]);

  const fetchRequestStatus = async () => {
    try {
      setLoading(true);
      // Fetch the registration request for this user
      const { data, error } = await supabase
        .from("requests")
        .select("*")
        .eq("user_id", user?.id)
        .eq("request_type", "registration")
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) {
        console.error("Error fetching request status:", error);
      } else if (data && data.length > 0) {
        setRequestDetails(data[0]);
      }
    } catch (err) {
      console.error("Error in fetchRequestStatus:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const getStatusBadge = () => {
    return (
      <div className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
        <Clock className="mr-1 h-3 w-3" />
        Pending Approval
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-blue-50 to-cyan-50 p-4">
      <Card className="w-full max-w-md border border-blue-100 shadow-lg">
        <CardHeader className="text-center border-b border-blue-100 bg-blue-50 rounded-t-lg">
          <div className="mx-auto rounded-full bg-amber-100 p-3 w-16 h-16 flex items-center justify-center mb-4">
            <Clock className="h-8 w-8 text-amber-500" />
          </div>
          <CardTitle className="text-xl font-bold text-blue-800">Account Pending Approval</CardTitle>
          <CardDescription className="text-blue-600">
            Your account is waiting for administrator approval
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-gray-700">
                  Your account has been created successfully, but needs to be approved by an administrator before you can access the system. Please check back later or contact support if you need immediate assistance.
                </p>
              </div>
            </div>
            
            {user && (
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-2">Account Details</p>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
                <p className="text-sm text-gray-600 mt-1">Role: {user.role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                <div className="mt-2">{getStatusBadge()}</div>
              </div>
            )}
            
            {requestDetails && (
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-2">Request Information</p>
                <p className="text-sm">
                  <span className="text-gray-600">Submitted:</span>{" "}
                  <span className="font-medium">{formatDate(requestDetails.created_at)}</span>
                </p>
                {requestDetails.updated_at && requestDetails.updated_at !== requestDetails.created_at && (
                  <p className="text-sm mt-1">
                    <span className="text-gray-600">Last updated:</span>{" "}
                    <span className="font-medium">{formatDate(requestDetails.updated_at)}</span>
                  </p>
                )}
              </div>
            )}
            
            <div className="text-sm text-gray-600 bg-blue-50 border border-blue-100 rounded-lg p-4">
              <p className="font-medium text-blue-700 mb-2">What happens next?</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span>An administrator will review your registration request</span>
                </li>
                <li className="flex items-start gap-2">
                  <MailIcon className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span>You'll receive an email when your account is approved</span>
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span>Once approved, you can log in normally</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-gray-100 pt-4">
          <Button variant="outline" onClick={handleLogout} className="w-full">
            Log Out
          </Button>
        </CardFooter>
      </Card>
      
      <p className="mt-8 text-sm text-gray-500">
        If you have any questions, please contact support.
      </p>
    </div>
  );
} 