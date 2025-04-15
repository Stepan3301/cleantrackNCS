
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
import { Megaphone, Send, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

// Sample announcements data
const sampleAnnouncements = [
  {
    id: "1",
    title: "New Cleaning Protocol",
    content: "We're implementing new eco-friendly cleaning protocols starting next week. All staff members are expected to review the updated guidelines in the employee handbook.",
    date: new Date(2025, 3, 10),
    author: "Management Team"
  },
  {
    id: "2",
    title: "Monthly Staff Meeting",
    content: "Reminder that our monthly staff meeting will be held next Friday at 4pm in the main conference room. Attendance is mandatory for all supervisors and managers.",
    date: new Date(2025, 3, 5),
    author: "HR Department"
  }
]

const Announcements = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [announcements, setAnnouncements] = useState(sampleAnnouncements)
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: ""
  })

  const handleSendAnnouncement = () => {
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both a title and content for your announcement",
        variant: "destructive"
      })
      return
    }

    const announcement = {
      id: (announcements.length + 1).toString(),
      title: newAnnouncement.title,
      content: newAnnouncement.content,
      date: new Date(),
      author: user?.name || "Administrator"
    }

    setAnnouncements([announcement, ...announcements])
    setNewAnnouncement({ title: "", content: "" })

    toast({
      title: "Announcement sent",
      description: "Your announcement has been sent to all employees"
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Announcements</h1>
        <Megaphone size={24} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Announcement</CardTitle>
          <CardDescription>
            Send an important announcement to all employees
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

      <h2 className="text-xl font-semibold mt-8">Previous Announcements</h2>
      <div className="space-y-4">
        {announcements.map(announcement => (
          <Card key={announcement.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{announcement.title}</CardTitle>
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
        ))}
      </div>
    </div>
  )
}

export default Announcements
