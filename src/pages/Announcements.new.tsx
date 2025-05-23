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
import { Megaphone, Send, Calendar, UserCheck, Users, ChevronDown, Loader2, AlertTriangle } from "lucide-react"
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
import { announcementsService } from "@/lib/services/announcements-service"
import { profilesService } from "@/lib/services/profiles-service"
import { useAnnouncements } from "@/contexts/announcements-context"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { initializeAnnouncementsPage, formatAnnouncementDate, showAnnouncementNotification } from "@/lib/announcements-utils"

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
  const [showDebugView, setShowDebugView] = useState(false)
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCalendar, setShowCalendar] = useState(false)
  const [dateFilter, setDateFilter] = useState<Date | null>(null)
  
  // Is this role allowed to create announcements
  const canCreateAnnouncements = user?.role === "head_manager" || user?.role === "owner" || user?.role === "manager"
  
  // Function to check Supabase connection
  const checkSupabaseConnection = async () => {
    try {
      // Try to get session as a simple connection test
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      // Try to select from announcements table to test access
      const { data: testData, error: testError } = await supabase
        .from('announcements')
        .select('count(*)', { count: 'exact' })
        .limit(1);
        
      if (testError) {
        return { 
          success: false, 
          error: testError.message.includes("does not exist") 
            ? "Table does not exist" 
            : testError.message 
        };
      }
      
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : "Unknown error" 
      };
    }
  };
  
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

  // Load announcements on component mount
  useEffect(() => {
    const loadAnnouncements = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        let data = []
        
        if (user) {
          // If user is head manager or owner, load all announcements
          if (user.role === "head_manager" || user.role === "owner") {
            data = await announcementsService.getAllAnnouncements()
          } else {
            // Otherwise, load announcements for the current user
            data = await announcementsService.getAnnouncementsForUser(user.id)
          }
          
          setAnnouncements(data)
        }
      } catch (err) {
        console.error("Error loading announcements:", err)
        setError("Failed to load announcements. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }
    
    // Either use the context to load announcements or load manually
    if (user?.role === "head_manager" || user?.role === "owner") {
      // For head managers and owners, we use their context data and update it if needed
      if (generalAnnouncements.length === 0 && !contextLoading) {
        refreshAnnouncements();
      } else {
        setAnnouncements(generalAnnouncements);
        setIsLoading(contextLoading);
      }
    } else {
      // For other users, we load their specific announcements
      loadAnnouncements();
    }
  }, [user, generalAnnouncements, contextLoading, refreshAnnouncements]);

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

  // Diagnostic function to check database and retrieve helpful error info
    console.log("🔍 Running announcements diagnostics...");
    
    try {
      // First check general DB connection
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      console.log("Auth session check:", sessionError ? "❌ Failed" : "✅ Passed");
      
      if (sessionError) {
        console.error("Auth session error:", sessionError);
        return;
      }
      
      // Check if the required SQL files exist
      console.log("Checking if required SQL files exist...");
      const requiredFiles = [
        '/db/create_announcements_table.sql',
        '/db/fix_announcements_rls.sql',
        '/db/create_exec_sql_function.sql'
      ];
      
      for (const file of requiredFiles) {
        try {
          const response = await fetch(file);
          if (response.ok) {
            console.log(`✅ File ${file} exists`);
          } else {
            console.error(`❌ File ${file} is missing or inaccessible (${response.status})`);
          }
        } catch (e) {
          console.error(`❌ Error checking file ${file}:`, e);
        }
      }
      
      // Check Supabase URL and key
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      console.log("Checking Supabase configuration:");
      console.log(`Supabase URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
      console.log(`Supabase Key: ${supabaseKey ? '✅ Set' : '❌ Missing'}`);

      // Check if URL is properly formatted
      if (supabaseUrl) {
        try {
          new URL(supabaseUrl);
          console.log("✅ Supabase URL is a valid URL format");
        } catch (e) {
          console.error("❌ Supabase URL is not a valid URL format");
        }
      }
      
      // Check if the announcements table exists
      try {
        console.log("Checking if announcements table exists...");
        const { data, error } = await supabase
          .from('announcements')
          .select('count(*)', { count: 'exact', head: true })
          .limit(1);
        
        console.log("Announcements table check:", error ? "❌ Failed" : "✅ Passed");
        
        if (error) {
          console.error("Announcements table error:", error);
          
          if (error.message.includes("does not exist")) {
            console.log("⚠️ The announcements table does not exist. Please run the debug fix.");
          } else if (error.code === 'PGRST301') {
            console.log("⚠️ Row Level Security policy issue. Please run the debug fix.");
          }
        } else {
          console.log("✅ Announcements table exists and is accessible");
        }
      } catch (tableError) {
        console.error("Error checking announcements table:", tableError);
      }

      // Check the RLS policies
      try {
        console.log("Testing exec_sql function...");
        
        // Don't actually insert, just check if the RPC works
        const { error: rpcError } = await supabase.rpc('exec_sql', { 
          sql_query: "SELECT 1" 
        });
        
        console.log("RPC check:", rpcError ? "❌ Failed" : "✅ Passed");
        
        if (rpcError) {
          console.error("RPC error:", rpcError);
          if (rpcError.message.includes("function") && rpcError.message.includes("does not exist")) {
            console.log("⚠️ The exec_sql function doesn't exist. Attempting to create it...");
            
            // Try to create the function directly
            const createResult = await createExecSqlFunction();
            console.log("Create exec_sql attempt:", createResult.success ? "✅ Succeeded" : "❌ Failed");
            
            if (!createResult.success) {
              console.error("Error creating exec_sql function:", createResult.error);
            }
          }
        }
      } catch (rpcError) {
        console.error("Error testing RPC:", rpcError);
      }
      
      // Try an actual fetch using the service for head_manager
      try {
        console.log("Testing announcementsService.getAllAnnouncements directly...");
        await announcementsService.getAllAnnouncements();
        console.log("✅ getAllAnnouncements successful");
      } catch (serviceError) {
        console.error("❌ getAllAnnouncements failed:", serviceError);
        
        // Check user role
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', sessionData.session?.user?.id)
            .single();
          
          console.log("Current user role:", profile?.role);
          if (profile?.role !== 'head_manager' && profile?.role !== 'owner') {
            console.log("⚠️ User doesn't have permissions to view all announcements");
          }
        } catch (profileError) {
          console.error("Error checking user profile:", profileError);
        }
      }
      
      console.log("🏁 Diagnostics complete");
    } catch (err) {
      console.error("General diagnostics error:", err);
    }
  };

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
            
            {newAnnouncement.announcement_type === "direct" && (
              <div className="form-group">
                <label className="form-label">Recipients</label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between"
                      disabled={isSubmitting}
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
                          {allUsers
                            .filter(u => u.id !== user?.id && u.is_active) // Filter out current user and inactive users
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
                                <span className="ml-2 text-xs text-muted-foreground capitalize">
                                  ({employee.role})
                                </span>
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            )}
            
            <div className="form-group">
              <label className="form-label" htmlFor="content">
                Announcement Content
              </label>
              <textarea
                id="content"
                className="form-textarea"
                placeholder="Type your announcement content here..."
                value={newAnnouncement.content}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                rows={5}
                disabled={isSubmitting}
              />
            </div>
            
            <div className="form-footer">
              <button 
                className="send-announcement-btn"
                onClick={handleSendAnnouncement}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Announcement
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Announcement Dialog */}
      {editingAnnouncement && (
        <div className="edit-dialog-overlay" onClick={() => setEditingAnnouncement(null)}>
          <div className="edit-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="edit-dialog-header">
              <div className="edit-dialog-title">Edit Announcement</div>
            </div>
            <div className="edit-dialog-content">
              <input 
                name="title" 
                value={editForm.title} 
                onChange={handleEditFormChange} 
                placeholder="Title" 
                className="form-input"
              />
              <textarea 
                name="content" 
                value={editForm.content} 
                onChange={handleEditFormChange} 
                placeholder="Content" 
                className="form-textarea"
                rows={5}
              />
            </div>
            <div className="edit-dialog-footer">
              <button 
                className="action-btn edit-btn"
                onClick={() => setEditingAnnouncement(null)}
              >
                Cancel
              </button>
              <button 
                className="send-announcement-btn"
                onClick={handleEditFormSubmit} 
                disabled={isEditSubmitting}
              >
                {isEditSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Announcements
