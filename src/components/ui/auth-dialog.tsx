import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState, useCallback, useMemo } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { Crown, Users, UserRoundCog, UserCheck, UserRound, Mail, Info, Loader2 } from "lucide-react"

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "login" | "register";
}

export function AuthDialog({ open, onOpenChange, defaultTab = "login" }: AuthDialogProps) {
  const [tab, setTab] = useState<"login" | "register">(defaultTab)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<string>("staff")
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [firstName, setFirstName] = useState<string>("")
  const [lastName, setLastName] = useState<string>("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const { login, register, error } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  // Reset form state when dialog opens/closes or tab changes
  React.useEffect(() => {
    if (open) {
      setFieldErrors({})
      setIsLoading(false)
      setEmail("")
      setPassword("")
      setFirstName("")
      setLastName("")
    }
  }, [open, tab])

  // Validate login form 
  const validateLoginForm = (formData: FormData): boolean => {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const errors: Record<string, string> = {}
    
    if (!email) errors.email = "Email is required"
    if (!password) errors.password = "Password is required"
    
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }
  
  // Validate registration form
  const validateRegisterForm = (formData: FormData): boolean => {
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const phone = formData.get('phone') as string
    const errors: Record<string, string> = {}
    
    if (!firstName) errors.firstName = "First name is required"
    if (!lastName) errors.lastName = "Last name is required"
    if (!email) errors.email = "Email is required"
    if (!password) errors.password = "Password is required"
    if (password && password.length < 6) errors.password = "Password must be at least 6 characters"
    if (!phone) errors.phone = "Phone number is required"
    
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Optimized handler for login
  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    const formData = new FormData(e.target as HTMLFormElement)
    
    // Validate form before submission
    if (!validateLoginForm(formData)) return;
    
    setIsLoading(true)
    
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    
    try {
      await login(email, password)
      
      toast({
        title: "Success",
        description: "Successfully logged in",
      })
      
      // Use setTimeout to ensure the animation completes
      setTimeout(() => {
        onOpenChange(false)
        navigate('/dashboard')
      }, 100)
    } catch (err) {
      console.error("Login error:", err)
      
      // Handle specific errors for registration status
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      
      if (errorMessage.includes("pending approval")) {
        toast({
          title: "Registration Pending",
          description: "Your registration request is still pending approval by an administrator. Please check back later.",
          variant: "destructive",
        });
      } else if (errorMessage.includes("rejected")) {
        toast({
          title: "Registration Rejected",
          description: "Your registration request has been rejected. Please contact an administrator for more information.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: errorMessage || "Invalid credentials",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false)
    }
  }, [login, navigate, onOpenChange, toast])

  // Optimized handler for registration
  const handleRegister = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    const formData = new FormData(e.target as HTMLFormElement)
    
    // Validate form before submission
    if (!validateRegisterForm(formData)) return;
    
    setIsLoading(true)
    
    try {
      const firstName = formData.get('firstName') as string
      const lastName = formData.get('lastName') as string
      const userEmail = formData.get('email') as string || email
      const password = formData.get('password') as string
      const phone = formData.get('phone') as string
      
      // Instead of directly registering, create a registration request
      const { registrationRequestsService } = await import('@/lib/services/registration-requests-service');
      
      await registrationRequestsService.createRequest({
        email: userEmail,
        name: `${firstName} ${lastName}`,
        phone,
        desired_role: selectedRole
      });
      
      toast({
        title: "Registration Request Submitted",
        description: "Your registration request has been submitted for approval. You will be notified when it is processed.",
      });
      
      // No direct navigation to dashboard since the user isn't registered yet
      setTimeout(() => {
        onOpenChange(false);
      }, 100);
      
    } catch (err) {
      console.error("Registration error:", err);
      toast({
        title: "Error",
        description: error || "An unexpected error occurred during registration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [email, selectedRole, onOpenChange, toast, error]);

  // Function to handle email generation based on first and last name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'firstName' | 'lastName') => {
    const value = e.target.value
    
    if (field === 'firstName') {
      setFirstName(value)
    } else {
      setLastName(value)
    }
    
    // Only generate email if both fields have values
    if (firstName && lastName) {
      const generatedEmail = `${firstName}.${lastName}@sparkle.ae`.toLowerCase();
      setEmail(generatedEmail);
    }
  };

  // Memoize role buttons to prevent re-renders
  const roleButtons = useMemo(() => [
    { role: 'owner', icon: <Crown className="h-5 w-5" />, title: 'Owner' },
    { role: 'head_manager', icon: <UserRoundCog className="h-5 w-5" />, title: 'Head Manager' },
    { role: 'manager', icon: <Users className="h-5 w-5" />, title: 'Manager' },
    { role: 'supervisor', icon: <UserCheck className="h-5 w-5" />, title: 'Supervisor' },
    { role: 'staff', icon: <UserRound className="h-5 w-5" />, title: 'Staff' }
  ], [])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden rounded-xl">
        <Tabs value={tab} onValueChange={(t) => setTab(t as "login" | "register")} className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-none">
            <TabsTrigger value="login" className="py-4 rounded-none data-[state=active]:bg-background">Login</TabsTrigger>
            <TabsTrigger value="register" className="py-4 rounded-none data-[state=active]:bg-background">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold">Welcome Back</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Enter your credentials to access your account.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleLogin} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Username/Email</Label>
                <Input 
                  id="login-email" 
                  name="email" 
                  placeholder="Enter your username or email" 
                  required 
                  aria-invalid={!!fieldErrors.email}
                  className={fieldErrors.email ? "border-red-500" : ""}
                  onChange={() => {
                    if (fieldErrors.email) {
                      setFieldErrors({...fieldErrors, email: ""})
                    }
                  }}
                />
                {fieldErrors.email && (
                  <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password">Password</Label>
                  <Button variant="link" size="sm" className="text-xs text-muted-foreground h-auto p-0">
                    Forgot password?
                  </Button>
                </div>
                <Input 
                  id="login-password" 
                  name="password" 
                  type="password" 
                  placeholder="••••••••" 
                  required 
                  aria-invalid={!!fieldErrors.password}
                  className={fieldErrors.password ? "border-red-500" : ""}
                  onChange={() => {
                    if (fieldErrors.password) {
                      setFieldErrors({...fieldErrors, password: ""})
                    }
                  }}
                />
                {fieldErrors.password && (
                  <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="register" className="p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold">Create an Account</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Fill out the form below to create an account.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleRegister} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName" 
                    name="firstName" 
                    placeholder="John" 
                    required 
                    value={firstName}
                    onChange={(e) => handleNameChange(e, 'firstName')}
                    aria-invalid={!!fieldErrors.firstName}
                    className={fieldErrors.firstName ? "border-red-500" : ""}
                  />
                  {fieldErrors.firstName && (
                    <p className="text-xs text-red-500 mt-1">{fieldErrors.firstName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName" 
                    name="lastName" 
                    placeholder="Doe" 
                    required 
                    value={lastName}
                    onChange={(e) => handleNameChange(e, 'lastName')}
                    aria-invalid={!!fieldErrors.lastName}
                    className={fieldErrors.lastName ? "border-red-500" : ""}
                  />
                  {fieldErrors.lastName && (
                    <p className="text-xs text-red-500 mt-1">{fieldErrors.lastName}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="john.doe@sparkle.ae"
                  aria-invalid={!!fieldErrors.email}
                  className={fieldErrors.email ? "border-red-500" : ""}
                />
                {fieldErrors.email && (
                  <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  placeholder="••••••••" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={!!fieldErrors.password}
                  className={fieldErrors.password ? "border-red-500" : ""}
                />
                {fieldErrors.password && (
                  <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  name="phone" 
                  placeholder="+971 XX XXX XXXX" 
                  required 
                  aria-invalid={!!fieldErrors.phone}
                  className={fieldErrors.phone ? "border-red-500" : ""}
                />
                {fieldErrors.phone && (
                  <p className="text-xs text-red-500 mt-1">{fieldErrors.phone}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Select Role</Label>
                <div className="grid grid-cols-3 gap-2">
                  {roleButtons.map((item) => (
                    <Button
                      key={item.role}
                      type="button"
                      variant={selectedRole === item.role ? "default" : "outline"}
                      className="flex flex-col items-center gap-1 h-auto py-2"
                      onClick={() => setSelectedRole(item.role)}
                    >
                      {item.icon}
                      <span className="text-xs">{item.title}</span>
                    </Button>
                  ))}
                </div>
              </div>
              <DialogFooter className="pt-4 px-0">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
