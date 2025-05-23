import { useState, useCallback, useMemo, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { targetHoursService, UserWithTargetHours } from '@/lib/services/target-hours-service';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { CalendarIcon, Pencil, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getInitials, initializeTargetHoursPage, setupBulkSetModal, showSaveMessage } from '@/lib/target-hours-utils';
import { ModernEditDialog } from '@/components/targets/ModernEditDialog';

// Import the modern styles
import '@/styles/modern-target-hours.css';

// Create a client
const queryClient = new QueryClient();

// Wrap the component with the QueryClientProvider
const TargetsPage = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TargetsContent />
    </QueryClientProvider>
  );
};

// Main component content
const TargetsContent = () => {
  // Access auth context
  const { user } = useAuth();
  // Query client for managing cache
  const queryClient = useQueryClient();
  
  // State
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithTargetHours | null>(null);
  const [targetHours, setTargetHours] = useState<number>(200);
  const [bulkTargetHours, setBulkTargetHours] = useState<number>(200);

  // Initialize page with modern styling
  useEffect(() => {
    const cleanup = initializeTargetHoursPage();
    return cleanup;
  }, []);

  // Memoize current period to prevent unnecessary recalculations
  const period = useMemo(() => format(selectedDate, 'yyyy-MM'), [selectedDate]);

  // Fetch target hours data using React Query
  const {
    data: users = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['targetHours', period],
    queryFn: () => targetHoursService.getTargetHoursForPeriod(period),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  });

  // Mutation for updating a single user's target hours
  const updateTargetMutation = useMutation({
    mutationFn: ({ userId, period, hours }: { userId: string; period: string; hours: number }) => 
      targetHoursService.setTargetHours(userId, period, hours),
    onSuccess: () => {
      // Invalidate the current period's data to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['targetHours', period] });
      setEditDialogOpen(false);
      if (editingUser) {
        showSaveMessage(`Updated target hours for ${editingUser.name}`);
        toast.success(`Updated target hours for ${editingUser.name}`);
      }
    },
    onError: (error: any) => {
      console.error('Error updating target hours:', error);
      toast.error(`Failed to update target hours: ${error.message || 'Unknown error'}`);
    }
  });

  // Mutation for bulk updating all users' target hours
  const bulkUpdateMutation = useMutation({
    mutationFn: ({ period, hours }: { period: string; hours: number }) => 
      targetHoursService.bulkSetTargetHours(period, hours),
    onSuccess: () => {
      // Invalidate the current period's data to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['targetHours', period] });
      setBulkDialogOpen(false);
      showSaveMessage('Successfully updated target hours for all staff');
      toast.success('Successfully updated target hours for all staff');
    },
    onError: (error: any) => {
      console.error('Error bulk setting target hours:', error);
      toast.error(`Failed to update target hours for all staff: ${error.message || 'Unknown error'}`);
    }
  });

  // Setup bulk set modal
  useEffect(() => {
    setupBulkSetModal((value: number) => {
      bulkUpdateMutation.mutate({
        period,
        hours: value
      });
    });
  }, [period, bulkUpdateMutation]);

  // Memoized handler for opening the edit dialog
  const handleEdit = useCallback((user: UserWithTargetHours) => {
    setEditingUser(user);
    setTargetHours(user.target_hours);
    setEditDialogOpen(true);
  }, []);

  // Memoized handler for saving target hours
  const handleSaveTargetHours = useCallback(() => {
    if (!editingUser) return;
    
    updateTargetMutation.mutate({
      userId: editingUser.id,
      period,
      hours: targetHours
    });
  }, [editingUser, period, targetHours, updateTargetMutation]);

  // Check permissions
  if (!user || !['manager', 'head_manager', 'owner'].includes(user.role)) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <>
      <div className="target-container">
        <div className="target-header">
          <div>
            <h1>Target Hours</h1>
            <p>Set and manage target hours for your staff</p>
          </div>
          <button className="bulk-set-btn" id="bulkSetBtn" title="Bulk Set Target Hours">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/></svg>
            Bulk Set
          </button>
        </div>
        
        {/* Month Selector */}
        <div className="mb-6 flex items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, 'MMMM yyyy') : <span>Select month</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
                disabled={(date) => date > new Date()}
              />
            </PopoverContent>
          </Popover>

          {/* Refresh Button */}
          <Button 
            variant="outline" 
            onClick={() => refetch()} 
            disabled={isLoading || updateTargetMutation.isPending || bulkUpdateMutation.isPending}
          >
            <RefreshCw 
              size={16} 
              className={cn("mr-2", isLoading && "animate-spin")} 
            />
            Refresh
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-destructive">Error loading target hours</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        ) : (
          <div className="target-grid">
            {users.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', fontSize: '1.2rem', padding: '32px 0' }}>
                No staff found for this period.
              </div>
            ) : (
              users.map((staffMember) => (
                <div className="target-card" key={staffMember.id}>
                  <div className="target-avatar">
                    {getInitials(staffMember.name)}
                  </div>
                  <div className="target-name">{staffMember.name}</div>
                  <div className="target-role">{staffMember.role}</div>
                  <div className="target-hours-label">Target Hours</div>
                  <div className="target-hours-input-row">
                    <input 
                      type="number" 
                      min="0" 
                      max="500" 
                      className="target-hours-input" 
                      value={staffMember.target_hours} 
                      readOnly
                      onClick={() => handleEdit(staffMember)}
                    />
                    <span className="target-hours-unit">hrs</span>
                  </div>
                  <button 
                    className="employee-action-btn mt-3"
                    onClick={() => handleEdit(staffMember)}
                  >
                    <Pencil size={16} />
                    Edit
                  </button>
                  <div className="save-indicator">Saved!</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      
      {/* Floating Save Button */}
      <button 
        className="fab-save-targets" 
        id="saveAllBtn" 
        title="Save All Changes"
        style={{ display: 'none' }} // Hidden for now since we use single edit dialogs
      >
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 12l2 2l4-4"/></svg>
        <span>Save All</span>
      </button>
      
      <div className="save-message" id="saveMsg"></div>

      {/* Bulk Set Modal - HTML structure only */}
      <div className="bulk-set-modal-bg" id="bulkSetModalBg">
        <div className="bulk-set-modal">
          <h2>Bulk Set Target Hours</h2>
          <input type="number" min="0" max="500" id="bulkSetInput" placeholder="Enter hours..." />
          <div className="bulk-set-modal-actions">
            <button className="bulk-set-confirm" id="bulkSetConfirm">Set</button>
            <button className="bulk-set-cancel" id="bulkSetCancel">Cancel</button>
          </div>
        </div>
      </div>

      {/* Modern Edit Dialog */}
      {editingUser && (
        <ModernEditDialog
          isOpen={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          staffName={editingUser.name}
          period={period}
          targetHours={targetHours}
          onTargetHoursChange={setTargetHours}
          onSave={handleSaveTargetHours}
          isSaving={updateTargetMutation.isPending}
        />
      )}
    </>
  );
};

export default TargetsPage; 