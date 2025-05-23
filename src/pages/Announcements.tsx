import { useState, useEffect, useContext } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { User, UserRole } from "@/contexts/auth-context"
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
import { Megaphone, Search, Send, Calendar, UserCheck, PenLine, Trash2, Users, ChevronDown, Loader2, AlertTriangle, X, MessageCircle, ChevronRight, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format, isAfter, isBefore, parseISO } from "date-fns"
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
import { announcementsService } from "@/lib/services/announcements-service"
import { profilesService } from "@/lib/services/profiles-service"
import { useAnnouncements } from "@/contexts/announcements-context"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { initializeAnnouncementsPage, formatAnnouncementDate, showAnnouncementNotification } from "@/lib/announcements-utils"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"

// Import modern styles
import "@/styles/modern-announcements.css"

const Announcements = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const { generalAnnouncements, createAnnouncement, refreshAnnouncements, isLoading: contextLoading } = useAnnouncements()
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tableExists, setTableExists] = useState<boolean | null>(null)
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    announcement_type: "general" as "general" | "direct", 
    recipients: [] as string[]
  })
  const [open, setOpen] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<any | null>(null)
  const [editForm, setEditForm] = useState({ title: '', content: '' })
  const [loading, setLoading] = useState(true)
  const [isEditSubmitting, setIsEditSubmitting] = useState(false)
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCalendar, setShowCalendar] = useState(false)
  const [dateFilter, setDateFilter] = useState<Date | null>(null)
  
  // Is this role allowed to create announcements
  const canCreateAnnouncements = user?.role === "head_manager" || user?.role === "owner" || user?.role === "manager"
  
  // Function to fetch user announcements
  const fetchUserAnnouncements = async () => {
    try {
      let data = [];
      console.log("🔍 Fetching announcements for user:", user?.id, user?.role);
      
      if (user) {
        if (user.role === "head_manager" || user.role === "owner") {
          try {
            // For admins, get all announcements
            console.log("🔍 Using getAllAnnouncements for head_manager");
            data = await announcementsService.getAllAnnouncements();
            console.log("✅ Fetched all announcements for admin:", data.length, data);
          } catch (err) {
            console.error("❌ Error fetching all announcements:", err);
            
            // Check for specific known errors
            if (err instanceof Error) {
              // Check if it's an RLS policy error
              if (err.message.includes("permission denied") || 
                  (err.message.includes("policy") && err.message.includes("check"))) {
                console.log("⚠️ RLS policy error detected");
                
                // Prompt user about RLS issues
                toast({
                  title: "Row-Level Security Issue",
                  description: "Permission denied by database security policies. Please contact an administrator.",
                  variant: "destructive"
                });
                
                setTableExists(true); // Table exists but has RLS issues
                setError("Database permissions error: Row-Level Security is preventing access");
              } else if (err.message.includes("does not exist")) {
                console.log("⚠️ Table does not exist error detected");
                setTableExists(false);
                setError("The announcements table does not exist. Please contact an administrator.");
              } else {
                setError(`Failed to load announcements: ${err.message}`);
              }
            } else {
              setError("An unknown error occurred while loading announcements");
            }
          }
        } else {
          try {
            // For regular users, get general announcements and their direct announcements
            data = await announcementsService.getAnnouncementsForUser(user.id);
            console.log("✅ Fetched announcements for user:", data.length);
          } catch (err) {
            console.error("❌ Error fetching user-specific announcements:", err);
            
            if (err instanceof Error) {
              if (err.message.includes("does not exist")) {
                console.log("⚠️ Table does not exist error detected");
                setTableExists(false);
                setError("The announcements table does not exist. Please contact an administrator.");
              } else {
                setError(`Error loading announcements: ${err.message}`);
              }
            } else {
              setError('An unknown error occurred while loading announcements');
            }
          }
        }
        
        // Update the state with fetched announcements - ensure it's always an array
        console.log("🔄 Updating state with announcements:", data ? data.length : 0);
        if (data && data.length > 0) {
          console.log("📊 First announcement:", data[0]);
        } else {
          console.log("📊 No announcements data available");
        }
        setAnnouncements(Array.isArray(data) ? data : []);
      } else {
        console.log("⚠️ No user available when fetching announcements");
      }
    } catch (err) {
      console.error("❌ Error in fetchUserAnnouncements:", err);
      if (err instanceof Error) {
        setError(`Error loading announcements: ${err.message}`);
      } else {
        setError('An unknown error occurred while loading announcements');
      }
      
      // Always ensure announcements is an array
      setAnnouncements([]);
    }
  };

  // Initialize modern styling and check if table exists
  useEffect(() => {
    const cleanup = initializeAnnouncementsPage();
    
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        
        // Check if table exists first
        try {
          const { data, error } = await supabase
            .from('announcements')
            .select('count(*)', { count: 'exact' })
            .limit(1);
          
          setTableExists(error ? 
            !error.message.includes("does not exist") : 
            true
          );
        } catch (err) {
          setTableExists(false);
        }
        
        await fetchUserAnnouncements();
      } catch (e) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
    
    // Return cleanup function
    return () => {
      cleanup();
    };
  }, []);

  // Load all users for the recipients dropdown
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const users = await profilesService.getAllProfiles();
        setAllUsers(users);
      } catch (err) {
        console.error("Error loading users:", err);
        toast({
          title: "Error",
          description: "Failed to load users for recipient selection",
          variant: "destructive"
        });
      }
    };

    if (user?.role === "head_manager" || user?.role === "owner") {
      loadUsers();
    }
  }, [user]);

  // Handle toggling recipient selection
  const toggleRecipient = (userId: string) => {
    setNewAnnouncement(prev => {
      const isSelected = prev.recipients.includes(userId);
      return {
        ...prev,
        recipients: isSelected 
          ? prev.recipients.filter(id => id !== userId)
          : [...prev.recipients, userId]
      };
    });
  };

  // Handle sending a new announcement
  const handleSendAnnouncement = async () => {
    setIsSubmitting(true);
    
    // Validate the form
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }
    
    if (newAnnouncement.announcement_type === 'direct' && newAnnouncement.recipients.length === 0) {
      toast({
        title: "No recipients selected",
        description: "Please select at least one recipient for a direct announcement",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }
    
    console.log("🔄 Creating announcement:", {
      title: newAnnouncement.title,
      content: newAnnouncement.content,
      type: newAnnouncement.announcement_type,
      recipients: newAnnouncement.recipients
    });
    
    try {
      let result;
      
      console.log("🔄 Using announcementsService.createAnnouncement directly");
      result = await announcementsService.createAnnouncement({
        title: newAnnouncement.title,
        content: newAnnouncement.content,
        announcement_type: newAnnouncement.announcement_type,
        recipients: newAnnouncement.recipients
      });
      console.log("✅ Announcement created successfully:", result);
      
      if (!result || !result.id) {
        throw new Error("No result returned from announcement creation");
      }
      
      // Manually refresh the announcements list
      console.log("🔄 Refreshing announcements list");
      // Use our direct function instead of the context
      await fetchUserAnnouncements();
      
      // Reset the form
      setNewAnnouncement({ 
        title: "", 
        content: "", 
        announcement_type: "general", 
        recipients: [] 
      });
      
      toast({
        title: "Announcement sent",
        description: "Your announcement has been successfully created and sent"
      });

      showAnnouncementNotification("Announcement sent successfully", "success");

    } catch (err) {
      console.error("❌ Final error creating announcement:", err);
      // More detailed error logging
      if (err instanceof Error) {
        console.error("❌ Error details:", {
          name: err.name,
          message: err.message,
          stack: err.stack
        });
      }
      
      // Provide a more helpful error message
      let errorMessage = "An error occurred while sending your announcement.";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      toast({
        title: "Failed to send announcement",
        description: errorMessage,
        variant: "destructive"
      });

      showAnnouncementNotification("Failed to send announcement", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      await announcementsService.deleteAnnouncement(id)
      setAnnouncements((prev) => prev.filter(a => a.id !== id))
      toast({ title: 'Announcement deleted', description: 'The announcement was deleted successfully.' })
      showAnnouncementNotification("Announcement deleted successfully", "success");
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to delete announcement', variant: 'destructive' })
      showAnnouncementNotification("Failed to delete announcement", "error");
    }
  }

  const handleEditAnnouncement = (announcement: any) => {
    setEditingAnnouncement(announcement)
    setEditForm({ title: announcement.title, content: announcement.content })
  }

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value })
  }

  const handleEditFormSubmit = async () => {
    if (!editingAnnouncement) return
    setIsEditSubmitting(true)
    try {
      const updated = await announcementsService.updateAnnouncement(editingAnnouncement.id, { title: editForm.title, content: editForm.content })
      setAnnouncements((prev) => prev.map(a => a.id === updated.id ? updated : a))
      setEditingAnnouncement(null)
      toast({ title: 'Announcement updated', description: 'The announcement was updated successfully.' })
      showAnnouncementNotification("Announcement updated successfully", "success");
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to update announcement', variant: 'destructive' })
      showAnnouncementNotification("Failed to update announcement", "error");
    } finally {
      setIsEditSubmitting(false)
    }
  }

  return (
    <div className="announcements-container">
      <div className="announcement-header">
        <h1>Announcements</h1>
        <Megaphone className="announcement-header-icon" size={32} />
      </div>

      {error && (
        <div className="announcement-alert">
          <div>
            <div className="alert-title">Error</div>
            <div className="alert-content">{error}</div>
          </div>
        </div>
      )}

      {tableExists === false && (
        <div className="announcement-alert">
          <div>
            <div className="alert-title">Database Error</div>
            <div className="alert-content">
              The announcements system is not properly set up. Please contact an administrator to run the setup process.
            </div>
          </div>
        </div>
      )}

      {canCreateAnnouncements && tableExists && (
        <div className="create-announcement-card">
          <div className="create-announcement-title">Create New Announcement</div>
          <div className="create-announcement-description">
            Send an important announcement to employees
          </div>
          <div className="create-announcement-form">
            <div className="form-group">
              <label className="form-label" htmlFor="title">
                Title
              </label>
              <input
                id="title"
                className="form-input"
                placeholder="Enter announcement title"
                value={newAnnouncement.title}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="announcement-type">
                Announcement Type
              </label>
              <Select
                value={newAnnouncement.announcement_type}
                onValueChange={(value) => setNewAnnouncement({ 
                  ...newAnnouncement, 
                  announcement_type: value as "general" | "direct",
                  recipients: [] // Clear recipients when changing type
                })}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select announcement type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General (All Staff)</SelectItem>
                  <SelectItem value="direct">Direct (Specific Recipients)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {newAnnouncement.announcement_type === 'direct' && (
              <div className="form-group">
                <label className="form-label">Recipients</label>
                <div className="recipients-container">
                  {allUsers.map(user => (
                    <div 
                      key={user.id} 
                      className={`recipient-item ${newAnnouncement.recipients.includes(user.id) ? 'selected' : ''}`}
                      onClick={() => toggleRecipient(user.id)}
                    >
                      {user.name || `${user.id}`}
                    </div>
                  ))}
                </div>
                <div className="recipients-count">
                  {newAnnouncement.recipients.length} recipient(s) selected
                </div>
              </div>
            )}
            
            <div className="form-group">
              <label className="form-label" htmlFor="content">
                Content
              </label>
              <textarea
                id="content"
                className="form-textarea"
                placeholder="Write your announcement message here..."
                value={newAnnouncement.content}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                rows={6}
                disabled={isSubmitting}
              />
            </div>
            
            <Button 
              className="create-button modern-send-button" 
              onClick={handleSendAnnouncement} 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Announcement
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      <div className="announcement-tools">
        <div className="search-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="Search in announcements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="search-icon" size={20} />
        </div>
        
        <div className="filters">
          <button
            className={`filter-button ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-button ${activeFilter === 'unread' ? 'active' : ''}`}
            onClick={() => setActiveFilter('unread')}
          >
            Unread
          </button>
          <button
            className={`filter-button ${activeFilter === 'read' ? 'active' : ''}`}
            onClick={() => setActiveFilter('read')}
          >
            Read
          </button>
          
          <button
            className="calendar-filter-button"
            onClick={() => setShowCalendar(!showCalendar)}
          >
            <Calendar size={18} />
            {dateFilter ? format(dateFilter, 'MMM d, yyyy') : 'Date'}
          </button>
          
          {showCalendar && (
            <div className="calendar-popup">
              <CalendarComponent
                mode="single"
                selected={dateFilter}
                onSelect={(date) => {
                  setDateFilter(date);
                  setShowCalendar(false);
                }}
                className="calendar-component"
              />
              <button 
                className="clear-date"
                onClick={() => {
                  setDateFilter(null);
                  setShowCalendar(false);
                }}
              >
                Clear Date
              </button>
            </div>
          )}
        </div>
        
        <div className="sort-controls">
          <Select
            value={sortOrder}
            onValueChange={(value) => setSortOrder(value as 'newest' | 'oldest')}
          >
            <SelectTrigger className="sort-trigger">
              <SelectValue placeholder="Sort Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div>Loading announcements...</div>
        </div>
      ) : announcements.length === 0 ? (
        <div className="no-announcements">
          <AlertCircle className="no-announcements-icon" size={48} />
          <div className="no-announcements-title">No Announcements</div>
          <div className="no-announcements-text">There are currently no announcements to display.</div>
        </div>
      ) : (
        <div className="announcements-list">
          {announcements
            .filter(announcement => {
              // Apply read/unread filter
              if (activeFilter === 'read' && (!announcement.read_by || !announcement.read_by.includes(user?.id))) {
                return false;
              }
              if (activeFilter === 'unread' && announcement.read_by && announcement.read_by.includes(user?.id)) {
                return false;
              }
              
              // Apply date filter
              if (dateFilter) {
                const announcementDate = parseISO(announcement.created_at);
                const startOfDay = new Date(dateFilter);
                startOfDay.setHours(0, 0, 0, 0);
                
                const endOfDay = new Date(dateFilter);
                endOfDay.setHours(23, 59, 59, 999);
                
                if (!(isAfter(announcementDate, startOfDay) && isBefore(announcementDate, endOfDay))) {
                  return false;
                }
              }
              
              // Apply search term
              if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                return (
                  announcement.title.toLowerCase().includes(searchLower) ||
                  announcement.content.toLowerCase().includes(searchLower)
                );
              }
              
              return true;
            })
            .sort((a, b) => {
              // Apply sort order
              const dateA = new Date(a.created_at).getTime();
              const dateB = new Date(b.created_at).getTime();
              return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
            })
            .map(announcement => (
              <div 
                key={announcement.id} 
                className={`announcement-card ${
                  announcement.read_by && announcement.read_by.includes(user?.id) 
                    ? 'read' 
                    : 'unread'
                }`}
              >
                <div className="announcement-info">
                  <div className="announcement-title">
                    {announcement.title}
                    {announcement.announcement_type === 'direct' && (
                      <Badge variant="outline" className="direct-badge">Direct</Badge>
                    )}
                  </div>
                  <div className="announcement-date">
                    {format(new Date(announcement.created_at), 'MMMM d, yyyy - h:mm a')}
                  </div>
                  <div className="announcement-content">{announcement.content}</div>
                  
                  <div className="announcement-actions">
                    {(user?.role === 'head_manager' || user?.role === 'owner' || user?.id === announcement.created_by) && (
                      <>
                        <button 
                          className="action-button edit"
                          onClick={() => handleEditAnnouncement(announcement)}
                          title="Edit announcement"
                        >
                          <PenLine size={16} />
                        </button>
                        <button 
                          className="action-button delete"
                          onClick={() => handleDeleteAnnouncement(announcement.id)}
                          title="Delete announcement"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Edit announcement dialog */}
      <Dialog open={!!editingAnnouncement} onOpenChange={(open) => {
        if (!open) setEditingAnnouncement(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Announcement</DialogTitle>
          </DialogHeader>
          
          <div className="form-group">
            <label className="form-label" htmlFor="edit-title">Title</label>
            <input
              id="edit-title"
              name="title"
              className="form-input"
              value={editForm.title}
              onChange={handleEditFormChange}
              disabled={isEditSubmitting}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="edit-content">Content</label>
            <textarea
              id="edit-content"
              name="content"
              className="form-textarea"
              value={editForm.content}
              onChange={handleEditFormChange}
              rows={6}
              disabled={isEditSubmitting}
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingAnnouncement(null)}>
              Cancel
            </Button>
            <Button onClick={handleEditFormSubmit} disabled={isEditSubmitting}>
              {isEditSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Announcements;
