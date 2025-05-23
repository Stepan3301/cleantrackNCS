import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { MoreHorizontal, AlertCircle, Users, Star, CircleDollarSign, Calculator } from "lucide-react";
import bonusService, { StaffWithBonus, BonusFormula } from "@/lib/services/bonus-service";
import { targetHoursService } from "@/lib/services/target-hours-service";
import { initializeBonusesPage, getInitials, getProgressStatusClass, showBonusUpdated } from "@/lib/bonus-utils";

// Import the modern styles
import '@/styles/modern-bonuses.css';

// Simple stats section component
const StatsSection = ({ title, stats }: { title: string, stats: { label: string, value: number }[] }) => {
  return (
    <div className="bonus-stat-card">
      <div className="bonus-stat-value">{stats.map(stat => stat.value).join(' ')}</div>
      <div className="bonus-stat-label">{title}</div>
    </div>
  );
};

export default function Bonuses() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [staff, setStaff] = useState<StaffWithBonus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState<StaffWithBonus | null>(null);
  const [openBonusDialog, setOpenBonusDialog] = useState(false);
  const [openBulkDialog, setOpenBulkDialog] = useState(false);
  const [formData, setFormData] = useState<BonusFormula>({
    amount_per_hour: 0,
    hours_threshold: 0,
  });
  const [bulkFormData, setBulkFormData] = useState<BonusFormula>({
    amount_per_hour: 0,
    hours_threshold: 0,
  });
  const [targetHours, setTargetHours] = useState<number>(200);
  const [currentPeriod, setCurrentPeriod] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'all' | 'eligible'>('all');

  // Initialize modern styling
  useEffect(() => {
    const cleanup = initializeBonusesPage();
    return cleanup;
  }, []);

  useEffect(() => {
    fetchStaffBonuses();
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    setCurrentPeriod(`${year}-${String(month).padStart(2, '0')}`);
  }, []);

  const fetchStaffBonuses = async () => {
    setIsLoading(true);
    try {
      const staffData = await bonusService.getAllStaffWithBonuses();
      
      // Fetch target hours for all staff members and update their progress
      const period = new Date().toISOString().substring(0, 7); // YYYY-MM
      const staffWithTargets = await targetHoursService.getTargetHoursForPeriod(period);
      
      // Update staff data with the correct progress based on target hours
      const updatedStaffData = staffData.map(staff => {
        const targetData = staffWithTargets.find(t => t.id === staff.id);
        const targetHours = targetData?.target_hours || 200;
        const progress = staff.hours_worked > 0 ? 
          Math.min(Math.round((staff.hours_worked / targetHours) * 100), 100) : 0;
        
        return {
          ...staff,
          progress,
          hours_threshold: targetHours // Update hours_threshold to be their target hours
        };
      });
      
      setStaff(updatedStaffData);
    } catch (error) {
      console.error("Error fetching staff bonuses:", error);
      toast({
        title: "Error",
        description: "Failed to fetch staff bonus data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenBonusDialog = (selectedStaff: StaffWithBonus) => {
    setSelectedStaff(selectedStaff);
    setFormData({
      amount_per_hour: selectedStaff.amount_per_hour || 0,
      hours_threshold: selectedStaff.hours_threshold || 200,
    });
    setTargetHours(selectedStaff.hours_threshold || 200);
    setOpenBonusDialog(true);
  };

  const handleOpenBulkDialog = () => {
    setBulkFormData({
      amount_per_hour: 0,
      hours_threshold: 200, // This won't be editable, but we'll still set a default
    });
    setOpenBulkDialog(true);
  };

  const handleSetBonus = async () => {
    if (!selectedStaff || !user) return;

    try {
      await bonusService.setStaffBonus(
        selectedStaff.id, 
        { 
          amount_per_hour: formData.amount_per_hour, 
          hours_threshold: targetHours // Use target hours as hours_threshold
        }, 
        user.id
      );
      setOpenBonusDialog(false);
      toast({
        title: "Success",
        description: `Bonus formula set for ${selectedStaff.name}`,
      });
      showBonusUpdated(selectedStaff.name);
      fetchStaffBonuses();
    } catch (error) {
      console.error("Error setting bonus:", error);
      toast({
        title: "Error",
        description: "Failed to set bonus formula.",
        variant: "destructive",
      });
    }
  };

  const handleBulkSetBonus = async () => {
    if (!user) return;

    try {
      // For bulk operations, we get the target hours for the current period
      const period = new Date().toISOString().substring(0, 7); // YYYY-MM
      const staffWithTargets = await targetHoursService.getTargetHoursForPeriod(period);
      
      // We need to update each staff member individually with their specific target hours
      for (const staffMember of staff) {
        const targetData = staffWithTargets.find(t => t.id === staffMember.id);
        const targetHours = targetData?.target_hours || 200;
        
        await bonusService.setStaffBonus(
          staffMember.id,
          { 
            amount_per_hour: bulkFormData.amount_per_hour, 
            hours_threshold: targetHours // Use staff member's individual target hours
          },
          user.id
        );
      }
      
      setOpenBulkDialog(false);
      toast({
        title: "Success",
        description: "Bonus formula set for all staff members",
      });
      showBonusUpdated("all staff");
      fetchStaffBonuses();
    } catch (error) {
      console.error("Error bulk setting bonuses:", error);
      toast({
        title: "Error",
        description: "Failed to set bonus formulas for staff.",
        variant: "destructive",
      });
    }
  };

  const renderProgressStatus = (staff: StaffWithBonus) => {
    const statusClass = getProgressStatusClass(staff.progress);
    
    if (staff.progress < 30) {
      return <span className={statusClass}>Below Target</span>;
    } else if (staff.progress < 80) {
      return <span className={statusClass}>Progressing</span>;
    } else if (staff.progress < 100) {
      return <span className={statusClass}>Near Target</span>;
    } else {
      return <span className={statusClass}>Achieved</span>;
    }
  };

  // Access check
  if (!user || !['manager', 'head_manager', 'owner'].includes(user.role)) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bonus-container">
        <div className="flex justify-center items-center h-96">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // Calculate stats for overview
  const totalStaff = staff.length;
  const targetAchieved = staff.filter(s => s.progress >= 100).length;
  const bonusEligible = staff.filter(s => s.hours_worked > s.hours_threshold).length;

  return (
    <div className="bonus-container">
      <div className="bonus-header">
        <div>
          <h1>Staff Bonuses</h1>
          <p>Manage and track bonuses for your staff members</p>
        </div>
        <button 
          className="bulk-set-bonus-btn"
          onClick={handleOpenBulkDialog}
        >
          <Calculator />
          Bulk Set Bonuses
        </button>
      </div>

      {/* Stats Overview */}
      <div className="bonus-stats-grid">
        <StatsSection title="Total Staff" stats={[{ label: "Total Staff", value: totalStaff }]} />
        <StatsSection title="Target Achieved" stats={[{ label: "Target Achieved", value: targetAchieved }]} />
        <StatsSection title="Bonus Eligible" stats={[{ label: "Bonus Eligible", value: bonusEligible }]} />
      </div>

      {/* Tabs */}
      <div className="bonus-tabs">
        <div className="bonus-tab-list">
          <button 
            className="bonus-tab" 
            data-state={activeTab === 'all' ? 'active' : 'inactive'}
            onClick={() => setActiveTab('all')}
          >
            All Staff
          </button>
          <button 
            className="bonus-tab" 
            data-state={activeTab === 'eligible' ? 'active' : 'inactive'}
            onClick={() => setActiveTab('eligible')}
          >
            Bonus Eligible
          </button>
        </div>

        {/* All Staff Tab Content */}
        {activeTab === 'all' && (
          <>
            <div className="bonus-alert">
              <AlertCircle className="bonus-alert-icon" size={24} />
              <div>
                <div className="bonus-alert-title">Important</div>
                <div className="bonus-alert-description">
                  Bonuses are calculated based on hours worked beyond the target hours threshold.
                  For example, if a staff member has worked 220 hours with a target of 200 hours and a bonus rate of 10 AED per hour,
                  they would receive (220-200) × 10 = 200 AED bonus.
                </div>
              </div>
            </div>
            
            <div className="bonus-table-container">
              <table className="bonus-table">
                <thead>
                  <tr>
                    <th>Staff</th>
                    <th>Hours Worked</th>
                    <th>Target Hours</th>
                    <th>Progress</th>
                    <th>Status</th>
                    <th>Bonus Rate</th>
                    <th>Current Bonus</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((staffMember) => (
                    <tr key={staffMember.id}>
                      <td>
                        <div className="bonus-staff-info">
                          <div className="bonus-avatar">
                            {getInitials(staffMember.name)}
                          </div>
                          <div>
                            <div className="bonus-staff-name">{staffMember.name}</div>
                            <div className="bonus-staff-role">
                              {staffMember.supervisor_name ? `Supervisor: ${staffMember.supervisor_name}` : "No supervisor"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{staffMember.hours_worked} hrs</td>
                      <td>{staffMember.hours_threshold} hrs</td>
                      <td>
                        <div className="bonus-progress-container">
                          <div className="bonus-progress-bar">
                            <div 
                              className="bonus-progress-fill" 
                              style={{ width: `${staffMember.progress}%` }}
                            ></div>
                          </div>
                          <div className="bonus-progress-text">{staffMember.progress}%</div>
                        </div>
                      </td>
                      <td>{renderProgressStatus(staffMember)}</td>
                      <td>{staffMember.amount_per_hour} AED/hr</td>
                      <td>{staffMember.current_month_bonus} AED</td>
                      <td>
                        <button 
                          className="bonus-action-btn" 
                          onClick={() => handleOpenBonusDialog(staffMember)}
                        >
                          <MoreHorizontal size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Eligible Staff Tab Content */}
        {activeTab === 'eligible' && (
          <div className="bonus-table-container">
            <table className="bonus-table">
              <thead>
                <tr>
                  <th>Staff</th>
                  <th>Hours Worked</th>
                  <th>Target Hours</th>
                  <th>Extra Hours</th>
                  <th>Bonus Rate</th>
                  <th>Bonus Amount</th>
                </tr>
              </thead>
              <tbody>
                {staff
                  .filter(s => s.hours_worked > s.hours_threshold)
                  .map((staffMember) => (
                    <tr key={staffMember.id}>
                      <td>
                        <div className="bonus-staff-info">
                          <div className="bonus-avatar">
                            {getInitials(staffMember.name)}
                          </div>
                          <div className="bonus-staff-name">{staffMember.name}</div>
                        </div>
                      </td>
                      <td>{staffMember.hours_worked} hrs</td>
                      <td>{staffMember.hours_threshold} hrs</td>
                      <td>{staffMember.hours_worked - staffMember.hours_threshold} hrs</td>
                      <td>{staffMember.amount_per_hour} AED/hr</td>
                      <td>{staffMember.current_month_bonus} AED</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Set Bonus Dialog */}
      {openBonusDialog && selectedStaff && (
        <div className="bonus-dialog-overlay" onClick={() => setOpenBonusDialog(false)}>
          <div className="bonus-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="bonus-dialog-header">
              <div className="bonus-dialog-title">Set Bonus Formula</div>
              <div className="bonus-dialog-description">
                Set the bonus formula for {selectedStaff.name}
              </div>
            </div>
            <div className="bonus-dialog-content">
              <div className="bonus-form-group">
                <label className="bonus-form-label">
                  Amount per hour (AED)
                </label>
                <input
                  type="number"
                  className="bonus-form-input"
                  value={formData.amount_per_hour}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      amount_per_hour: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="bonus-form-group">
                <label className="bonus-form-label">
                  Target Hours (fixed)
                </label>
                <input
                  type="number"
                  className="bonus-form-input"
                  value={targetHours}
                  disabled={true}
                />
              </div>
            </div>
            <div className="bonus-dialog-footer">
              <button 
                className="bonus-cancel-btn"
                onClick={() => setOpenBonusDialog(false)}
              >
                Cancel
              </button>
              <button 
                className="bonus-save-btn"
                onClick={handleSetBonus}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Set Bonus Dialog */}
      {openBulkDialog && (
        <div className="bonus-dialog-overlay" onClick={() => setOpenBulkDialog(false)}>
          <div className="bonus-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="bonus-dialog-header">
              <div className="bonus-dialog-title">Set Bonus Formula For All Staff</div>
              <div className="bonus-dialog-description">
                This will set the same bonus amount per hour for all staff.
                Target hours will be determined individually for each staff member.
              </div>
            </div>
            <div className="bonus-dialog-content">
              <div className="bonus-form-group">
                <label className="bonus-form-label">
                  Amount per hour (AED)
                </label>
                <input
                  type="number"
                  className="bonus-form-input"
                  value={bulkFormData.amount_per_hour}
                  onChange={(e) =>
                    setBulkFormData({
                      ...bulkFormData,
                      amount_per_hour: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
            <div className="bonus-dialog-footer">
              <button 
                className="bonus-cancel-btn"
                onClick={() => setOpenBulkDialog(false)}
              >
                Cancel
              </button>
              <button 
                className="bonus-save-btn"
                onClick={handleBulkSetBonus}
              >
                Save for All Staff
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 