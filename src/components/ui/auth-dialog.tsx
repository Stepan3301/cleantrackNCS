
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

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "login" | "register";
}

export function AuthDialog({ open, onOpenChange, defaultTab = "login" }: AuthDialogProps) {
  const [tab, setTab] = useState<"login" | "register">(defaultTab)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate login - replace with actual login logic
    setTimeout(() => {
      setIsLoading(false)
      onOpenChange(false)
      // Redirect or update state based on login success
    }, 1000)
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate registration - replace with actual registration logic
    setTimeout(() => {
      setIsLoading(false)
      // Show registration pending message
    }, 1000)
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
                <Label htmlFor="email">Username/Email</Label>
                <Input id="email" placeholder="Enter your username or email" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Button variant="link" size="sm" className="text-xs text-muted-foreground h-auto p-0">
                    Forgot password?
                  </Button>
                </div>
                <Input id="password" type="password" placeholder="••••••••" />
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
                Fill out the form below to request an account.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleRegister} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="John" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Doe" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="john.doe@example.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="+971 XX XXX XXXX" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Intended Role</Label>
                <select id="role" className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  <option value="" disabled selected>Select your role</option>
                  <option value="manager">Manager</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
              <DialogFooter className="pt-4 px-0">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Submitting..." : "Submit Registration"}
                </Button>
              </DialogFooter>
              <div className="text-xs text-center text-muted-foreground mt-2">
                Your registration will need to be approved by management before access is granted.
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
