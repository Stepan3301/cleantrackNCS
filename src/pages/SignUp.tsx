import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { registrationRequestsService } from "@/lib/services/registration-requests-service";
import { Loader2 } from "lucide-react";

export default function SignUp() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [desiredRole, setDesiredRole] = useState("staff");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create a registration request instead of directly registering
      await registrationRequestsService.createRequest({
        email,
        name,
        phone,
        desired_role: desiredRole
      });

      setSubmitted(true);
      toast({
        title: "Request Submitted",
        description: "Your registration request has been submitted for approval. You will be notified when it is processed.",
      });
      
      // Don't auto-navigate, let the user see the success message
    } catch (error) {
      console.error("Error submitting registration request:", error);
      toast({
        title: "Error",
        description: "Failed to submit registration request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Sign Up</CardTitle>
          <CardDescription>
            Create a new account
          </CardDescription>
        </CardHeader>
        
        {submitted ? (
          <CardContent className="space-y-4">
            <div className="bg-green-50 p-4 rounded-md text-green-800">
              <h3 className="font-medium text-lg">Registration Request Submitted</h3>
              <p className="mt-2">
                Thank you for your interest in joining our platform. Your registration request 
                has been submitted and is pending approval by an administrator.
              </p>
              <p className="mt-2">
                You will receive an email notification once your request has been processed.
              </p>
            </div>
            <Button 
              onClick={() => navigate("/")} 
              className="w-full"
            >
              Return to Home
            </Button>
          </CardContent>
        ) : (
          <>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (Optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                  <p className="text-xs text-muted-foreground">
                    Password must be at least 8 characters long
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Desired Role</Label>
                  <Select 
                    value={desiredRole} 
                    onValueChange={setDesiredRole}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="supervisor">Supervisor</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    The role you are applying for. This will be reviewed by an administrator.
                  </p>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Registration Request"
                  )}
                </Button>
              </form>
            </CardContent>
            
            <CardFooter className="justify-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/" className="text-primary hover:underline">
                  Sign In
                </Link>
              </p>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
} 