
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
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "login" | "register";
}

export function AuthDialog({ open, onOpenChange, defaultTab = "login" }: AuthDialogProps) {
  const [tab, setTab] = useState<"login" | "register">(defaultTab)
  const [isLoading, setIsLoading] = useState(false)
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    const formData = new FormData(e.target as HTMLFormElement)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const success = await login(email, password)
    
    if (success) {
      toast({
        title: "Success",
        description: "Successfully logged in",
      })
      onOpenChange(false)
      navigate('/dashboard')
    } else {
      toast({
        title: "Error",
        description: "Invalid credentials",
        variant: "destructive",
      })
    }
    
    setIsLoading(false)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    const formData = new FormData(e.target as HTMLFormElement)
    const email = `${formData.get('firstName')}.${formData.get('lastName')}@sparkle.ae`.toLowerCase()
    const password = 'password123' // Default password for instant registration
    
    const userData = {
      email,
      password,
      name: `${formData.get('firstName')} ${formData.get('lastName')}`,
      role: formData.get('role') || 'staff'
    }

    const success = await register(userData)
    
    if (success) {
      // Automatically log in after registration
      const loginSuccess = await login(email, password)
      if (loginSuccess) {
        toast({
          title: "Success",
          description: "Successfully registered and logged in",
        })
        onOpenChange(false)
        navigate('/dashboard')
      }
    } else {
      toast({
        title: "Error",
        description: "Registration failed",
        variant: "destructive",
      })
    }
    
    setIsLoading(false)
  }

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
                <Input id="login-email" name="email" placeholder="Enter your username or email" required />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password">Password</Label>
                  <Button variant="link" size="sm" className="text-xs text-muted-foreground h-auto p-0">
                    Forgot password?
                  </Button>
                </div>
                <Input id="login-password" name="password" type="password" placeholder="••••••••" required />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
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
                  <Input id="firstName" name="firstName" placeholder="John" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" name="lastName" placeholder="Doe" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" placeholder="+971 XX XXX XXXX" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <select 
                  id="role" 
                  name="role"
                  defaultValue="staff"
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="staff">Staff</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="manager">Manager</option>
                  <option value="head_manager">Head Manager</option>
                </select>
              </div>
              <DialogFooter className="pt-4 px-0">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
