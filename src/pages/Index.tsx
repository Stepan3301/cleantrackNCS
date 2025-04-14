
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AuthDialog } from "@/components/ui/auth-dialog"
import { useAuth } from "@/contexts/auth-context"
import { useNavigate } from "react-router-dom"

const Index = () => {
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"login" | "register">("login")
  const { user } = useAuth()
  const navigate = useNavigate()
  
  // If user is already logged in, redirect to dashboard
  if (user) {
    navigate("/dashboard")
    return null
  }

  const openLogin = () => {
    setActiveTab("login")
    setAuthDialogOpen(true)
  }

  const openRegister = () => {
    setActiveTab("register")
    setAuthDialogOpen(true)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border py-4 px-6">
        <div className="container flex justify-between items-center">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-white font-bold mr-2">
              S
            </div>
            <h1 className="text-xl font-semibold text-foreground">Sparkle New Cleaning Service</h1>
          </div>
          <div className="space-x-2">
            <Button variant="outline" onClick={openLogin}>Log In</Button>
            <Button onClick={openRegister}>Sign Up</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center bg-secondary/30 px-6">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold mb-4 text-foreground">Internal Portal</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Welcome to the Sparkle New Cleaning Service internal portal - the hub for our team's collaboration and management.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Reliability</h3>
              <p className="text-muted-foreground">We deliver consistent, high-quality service that our clients can depend on.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Quality Service</h3>
              <p className="text-muted-foreground">Our attention to detail ensures spotless results every time.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-heart-handshake"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08v0c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.96 2.66"/><path d="m18 15-2-2"/><path d="m15 18-2-2"/></svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Customer Satisfaction</h3>
              <p className="text-muted-foreground">The happiness of our clients is our ultimate measure of success.</p>
            </div>
          </div>
          <div className="flex justify-center space-x-4">
            <Button size="lg" onClick={openLogin}>
              Log In
            </Button>
            <Button size="lg" variant="outline" onClick={openRegister}>
              Register
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-4 px-6 text-center text-sm text-muted-foreground">
        <div className="container">
          © {new Date().getFullYear()} Sparkle New Cleaning Service. All rights reserved.
        </div>
      </footer>
      
      {/* Auth Dialog */}
      <AuthDialog 
        open={authDialogOpen} 
        onOpenChange={setAuthDialogOpen}
        defaultTab={activeTab}
      />
    </div>
  )
}

export default Index
