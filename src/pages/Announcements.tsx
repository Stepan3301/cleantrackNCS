
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Megaphone, Send, Calendar, UserCheck, Users, ChevronDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

// Sample announcements data
const sampleAnnouncements = [
  {
    id: "1",
    title: "New Cleaning Protocol",
    content: "We're implementing new eco-friendly cleaning protocols starting next week. All staff members are expected to review the updated guidelines in the employee handbook.",
    date: new Date(2025, 3, 10),
    author: "Management Team",
    type: "general",
    recipients: [] // Empty for general announcements
  },
  {
    id: "2",
    title: "Monthly Staff Meeting",
    content: "Reminder that our monthly staff meeting will be held next Friday at 4pm in the main conference room. Attendance is mandatory for all supervisors and managers.",
    date: new Date(2025, 3, 5),
    author: "HR Department",
    type: "general",
    recipients: []
  },
  {
    id: "3",
    title: "Feedback on Recent Project",
    content: "Great job with the Downtown Office cleaning last week. The client was very impressed with your attention to detail.",
    date: new Date(2025, 3, 12),
    author: "Sara Johnson",
    type: "direct",
    recipients: ["4"] // User ID
  }
]

const Announcements = () => {
  const { user, users } = useAuth()
  const { toast } = useToast()
  const [announcements, setAnnouncements] = useState(sampleAnnouncements)
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    type: "general", // Default to general announcements
    recipients: [] as string[]
  })
  const [open, setOpen] = useState(false)
  
  // Is this role allowed to create announcements
  const canCreateAnnouncements = user?.role === "head_manager" || user?.role === "owner"

  // Filter announcements for the current user
  const visibleAnnouncements = announcements.filter(announcement => {
    if (announcement.type === "general") return true;
    if (announcement.type === "direct" && announcement.recipients.includes(user?.id || "")) return true;
    // If the user is the author or has high permissions
    if (user?.role === "head_manager" || user?.role === "owner") return true;
    return false;
  });

  // Handle recipient selection/deselection
  const toggleRecipient = (userId: string) => {
    setNewAnnouncement(prev => {
      if (prev.recipients.includes(userId)) {
        return { ...prev, recipients: prev.recipients.filter(id => id !== userId) };
      } else {
        return { ...prev, recipients: [...prev.recipients, userId] };
      }
    });
  };

  const handleSendAnnouncement = () => {
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both a title and content for your announcement",
        variant: "destructive"
      })
      return
    }

    if (newAnnouncement.type === "direct" && newAnnouncement.recipients.length === 0) {
      toast({
        title: "No recipients selected",
        description: "Please select at least one recipient for a direct announcement",
        variant: "destructive"
      })
      return
    }

    const announcement = {
      id: (announcements.length + 1).toString(),
      title: newAnnouncement.title,
      content: newAnnouncement.content,
      date: new Date(),
      author: user?.name || "Administrator",
      type: newAnnouncement.type,
      recipients: newAnnouncement.recipients
    }

    setAnnouncements([announcement, ...announcements])
    setNewAnnouncement({ title: "", content: "", type: "general", recipients: [] })

    toast({
      title: "Announcement sent",
      description: newAnnouncement.type === "general" 
        ? "Your announcement has been sent to all employees" 
        : "Your announcement has been sent to selected employees"
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Announcements</h1>
        <Megaphone size={24} />
      </div>

      {canCreateAnnouncements && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Announcement</CardTitle>
            <CardDescription>
              Send an important announcement to employees
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="title"
                placeholder="Enter announcement title"
                value={newAnnouncement.title}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="announcement-type" className="text-sm font-medium">
                Announcement Type
              </label>
              <Select
                value={newAnnouncement.type}
                onValueChange={(value) => setNewAnnouncement({ 
                  ...newAnnouncement, 
                  type: value as "general" | "direct",
                  recipients: [] // Clear recipients when changing type
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select announcement type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">
                    <div className="flex items-center">
                      <Users size={16} className="mr-2" />
                      <span>General (All Employees)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="direct">
                    <div className="flex items-center">
                      <UserCheck size={16} className="mr-2" />
                      <span>Direct (Selected Employees)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {newAnnouncement.type === "direct" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Recipients</label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between"
                    >
                      <span>
                        {newAnnouncement.recipients.length > 0
                          ? `${newAnnouncement.recipients.length} recipient${newAnnouncement.recipients.length > 1 ? 's' : ''} selected`
                          : "Select recipients..."}
                      </span>
                      <ChevronDown size={16} className="ml-2" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search employees..." />
                      <CommandList>
                        <CommandEmpty>No employees found.</CommandEmpty>
                        <CommandGroup>
                          {users
                            .filter(u => u.id !== user?.id) // Can't send to yourself
                            .map((employee) => (
                              <CommandItem
                                key={employee.id}
                                value={employee.id}
                                onSelect={() => toggleRecipient(employee.id)}
                              >
                                <div className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border ${
                                  newAnnouncement.recipients.includes(employee.id)
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "border-primary/20"
                                }`}>
                                  {newAnnouncement.recipients.includes(employee.id) && (
                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M8.5 2.5L3.5 7.5L1.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  )}
                                </div>
                                <span>{employee.name}</span>
                                <span className="ml-auto text-xs text-muted-foreground capitalize">
                                  {employee.role}
                                </span>
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                
                {newAnnouncement.recipients.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newAnnouncement.recipients.map(id => {
                      const employee = users.find(u => u.id === id);
                      return (
                        <Badge key={id} variant="secondary" className="px-2 py-0.5">
                          {employee?.name || "Unknown"}
                          <button 
                            className="ml-1 text-muted-foreground hover:text-foreground" 
                            onClick={() => toggleRecipient(id)}
                          >
                            ×
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium">
                Content
              </label>
              <Textarea
                id="content"
                placeholder="Type your announcement message here..."
                className="min-h-[150px]"
                value={newAnnouncement.content}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleSendAnnouncement}>
              <Send size={16} className="mr-2" />
              Submit and Send
            </Button>
          </CardFooter>
        </Card>
      )}

      <h2 className="text-xl font-semibold mt-8">Announcements</h2>
      <div className="space-y-4">
        {visibleAnnouncements.length > 0 ? (
          visibleAnnouncements.map(announcement => (
            <Card key={announcement.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center">
                      {announcement.title}
                      {announcement.type === "direct" && (
                        <Badge variant="outline" className="ml-2">Direct</Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Calendar size={14} className="mr-1" />
                      {format(announcement.date, "MMMM d, yyyy")}
                      <span className="mx-2">•</span>
                      {announcement.author}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p>{announcement.content}</p>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center p-8 bg-muted/20 rounded-lg border border-border">
            <Megaphone size={36} className="mx-auto text-muted-foreground mb-2" />
            <p className="text-lg font-medium">No announcements yet</p>
            <p className="text-muted-foreground">
              {canCreateAnnouncements 
                ? "Create your first announcement above" 
                : "Check back later for updates"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Announcements
