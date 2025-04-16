
import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"

export function StaffDashboard() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-border p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Your Performance</h2>
          <Button variant="outline" size="sm">
            <Calendar size={16} className="mr-2" />
            April 2023
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-secondary/30 rounded-lg p-4 flex flex-col">
            <span className="text-sm text-muted-foreground">Target Hours</span>
            <span className="text-3xl font-bold mt-1">160</span>
            <span className="text-xs text-muted-foreground mt-auto">Monthly Goal</span>
          </div>
          
          <div className="bg-secondary/30 rounded-lg p-4 flex flex-col">
            <span className="text-sm text-muted-foreground">Completed Hours</span>
            <span className="text-3xl font-bold mt-1">132</span>
            <span className="text-xs text-success mt-auto">82.5% of target</span>
          </div>
          
          <div className="bg-secondary/30 rounded-lg p-4 flex flex-col">
            <span className="text-sm text-muted-foreground">Current Bonus</span>
            <span className="text-3xl font-bold mt-1">AED 250</span>
            <span className="text-xs text-primary mt-auto">Projected: AED 400</span>
          </div>
        </div>
        
        <div className="mt-8">
          <h3 className="font-medium mb-3">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <div>
                <p className="font-medium">Dubai Marina Residence</p>
                <p className="text-sm text-muted-foreground">Regular Cleaning</p>
              </div>
              <div className="text-right">
                <p className="font-medium">8 hours</p>
                <p className="text-xs text-muted-foreground">Apr 14, 2023</p>
              </div>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <div>
                <p className="font-medium">Business Bay Office</p>
                <p className="text-sm text-muted-foreground">Deep Cleaning</p>
              </div>
              <div className="text-right">
                <p className="font-medium">6 hours</p>
                <p className="text-xs text-muted-foreground">Apr 12, 2023</p>
              </div>
            </div>
            <div className="flex justify-between items-center pb-2">
              <div>
                <p className="font-medium">JBR Apartment Complex</p>
                <p className="text-sm text-muted-foreground">Move-Out Cleaning</p>
              </div>
              <div className="text-right">
                <p className="font-medium">9 hours</p>
                <p className="text-xs text-muted-foreground">Apr 10, 2023</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-border p-6">
          <h3 className="font-semibold mb-4">Your Upcoming Schedule</h3>
          <div className="space-y-3">
            <div className="flex gap-3 items-start pb-3 border-b border-border">
              <div className="bg-primary/10 p-2 rounded-md text-center min-w-[3rem]">
                <div className="text-xs text-muted-foreground">APR</div>
                <div className="font-bold text-primary">15</div>
              </div>
              <div>
                <p className="font-medium">Downtown Apartment</p>
                <p className="text-sm text-muted-foreground">09:00 AM - 05:00 PM</p>
                <div className="flex items-center mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-success mr-1"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  <span className="text-xs text-muted-foreground">Assigned by Mohammed</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 items-start">
              <div className="bg-primary/10 p-2 rounded-md text-center min-w-[3rem]">
                <div className="text-xs text-muted-foreground">APR</div>
                <div className="font-bold text-primary">17</div>
              </div>
              <div>
                <p className="font-medium">Palm Jumeirah Villa</p>
                <p className="text-sm text-muted-foreground">10:00 AM - 02:00 PM</p>
                <div className="flex items-center mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-warning mr-1"><path d="M12 9v4l2 2"/><path d="M5 19a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4l2 2h4a2 2 0 0 1 2 2v1"/><circle cx="17" cy="17" r="3"/><path d="M21 17h-4"/></svg>
                  <span className="text-xs text-warning">Pending confirmation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-border p-6">
          <h3 className="font-semibold mb-4">Announcements</h3>
          <div className="space-y-4">
            <div className="pb-3 border-b border-border">
              <h4 className="font-medium">New Cleaning Protocol</h4>
              <p className="text-sm text-muted-foreground mt-1">Updated procedures for eco-friendly cleaning products are now in effect.</p>
              <div className="flex justify-between items-center mt-2">
                <Button variant="link" size="sm" className="p-0 h-auto">Read More</Button>
                <span className="text-xs text-muted-foreground">2 days ago</span>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium">Team Meeting</h4>
              <p className="text-sm text-muted-foreground mt-1">Monthly staff meeting scheduled for April 20th at 6:00 PM.</p>
              <div className="flex justify-between items-center mt-2">
                <Button variant="link" size="sm" className="p-0 h-auto">RSVP</Button>
                <span className="text-xs text-muted-foreground">1 week ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
