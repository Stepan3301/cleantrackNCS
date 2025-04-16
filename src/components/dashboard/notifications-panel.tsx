
import { Button } from "@/components/ui/button"

export function NotificationsPanel() {
  return (
    <div className="bg-white rounded-lg border border-border p-6">
      <h2 className="text-xl font-semibold mb-4">Recent Notifications</h2>
      <div className="space-y-4">
        <div className="flex items-start gap-3 pb-3 border-b border-border">
          <div className="w-8 h-8 rounded-full bg-info flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-plus"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="16" x2="22" y1="11" y2="11"/></svg>
          </div>
          <div>
            <p className="font-medium">New Registration Request</p>
            <p className="text-sm text-muted-foreground">Ahmed Mahmoud has requested to join as a Supervisor</p>
            <div className="flex gap-2 mt-2">
              <Button size="sm" variant="outline">Approve</Button>
              <Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10">
                Deny
              </Button>
            </div>
          </div>
          <div className="text-xs text-muted-foreground whitespace-nowrap">
            2 hours ago
          </div>
        </div>
        
        <div className="flex items-start gap-3 pb-3 border-b border-border">
          <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle-2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
          </div>
          <div>
            <p className="font-medium">Monthly Report Ready</p>
            <p className="text-sm text-muted-foreground">March 2023 performance report is ready for review</p>
            <Button size="sm" variant="link" className="px-0 py-0 h-auto mt-1">View Report</Button>
          </div>
          <div className="text-xs text-muted-foreground whitespace-nowrap">
            Yesterday
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-warning flex items-center justify-center text-black">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-alert-circle"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
          </div>
          <div>
            <p className="font-medium">Task Allocation Alert</p>
            <p className="text-sm text-muted-foreground">3 cleaners are under their target hours for this month</p>
            <Button size="sm" variant="link" className="px-0 py-0 h-auto mt-1">Review Hours</Button>
          </div>
          <div className="text-xs text-muted-foreground whitespace-nowrap">
            3 days ago
          </div>
        </div>
      </div>
    </div>
  )
}
