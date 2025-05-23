import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserCog, AlertTriangle, History, Users, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { auditService } from "@/lib/services/audit-service";
import { RoleChangeHistory } from "@/components/employees/RoleChangeHistory";
import "@/styles/modern-roles-page.css";

const ROLES = [
  { value: "owner", label: "Owner" },
  { value: "head_manager", label: "Head Manager" },
  { value: "manager", label: "Manager" },
  { value: "supervisor", label: "Supervisor" },
  { value: "staff", label: "Staff" },
];

const ManageRoles = () => {
  const { user, users, updateUserProfile } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [historyUser, setHistoryUser] = useState<{ id: string; name: string } | null>(null);

  // Filter employees based on search query
  const filteredEmployees = users.filter((employee) => {
    if (employee.id === user?.id) return false; // Don't show current user
    
    return (
      employee.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Handle role change
  const handleRoleChange = (userId: string) => {
    const employeeToChange = users.find(u => u.id === userId);
    if (employeeToChange) {
      setSelectedUser(employeeToChange);
      setSelectedRole(employeeToChange.role);
      setShowConfirmDialog(true);
    }
  };

  // Handle viewing role history
  const handleViewHistory = (userId: string, userName: string) => {
    setHistoryUser({ id: userId, name: userName });
    setShowHistoryDialog(true);
  };

  // Handle confirmation of role change
  const handleConfirmRoleChange = async () => {
    if (!selectedUser || !selectedRole) return;

    try {
      // Only process if the role has actually changed
      if (selectedRole === selectedUser.role) {
        setShowConfirmDialog(false);
        return;
      }
      
      // Update the user's role
      const success = await updateUserProfile(selectedUser.id, {
        role: selectedRole as any,
      });

      if (success) {
        // Log the role change for audit purposes
        await auditService.logRoleChange({
          userId: selectedUser.id,
          changedByUserId: user?.id || '',
          oldRole: selectedUser.role,
          newRole: selectedRole,
        });
        
        toast({
          title: "Role updated",
          description: `${selectedUser.name}'s role has been updated to ${selectedRole.replace('_', ' ')}.`,
        });
        setShowConfirmDialog(false);
        setSelectedUser(null);
      } else {
        toast({
          title: "Failed to update role",
          description: "There was an error updating the role. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  // Format role for display
  const formatRole = (role: string) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="container roles-page-container mx-auto py-6">
      <div className="roles-page-header">
        <div className="flex items-center gap-3">
          <Users size={28} className="text-[var(--roles-primary)]" />
          <h1 className="roles-title">Manage Roles</h1>
        </div>
        <p className="roles-subtitle">
          Assign roles to employees to control their access and permissions
        </p>
      </div>

      <div className="roles-search-section">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--roles-primary)]" />
          <Input
            type="search"
            placeholder="Search employees..."
            className="pl-8 roles-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="roles-content-container">
        <Table className="roles-table">
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Current Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="roles-empty-state">
                  No employees found
                </TableCell>
              </TableRow>
            ) : (
              filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>
                    <span className="role-badge">
                      {formatRole(employee.role)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {employee.is_active ? (
                      <Badge className="status-badge-active">
                        Active
                      </Badge>
                    ) : (
                      <Badge className="status-badge-inactive">
                        Inactive
                      </Badge>
                    )}
                    {employee.status === "pending_approval" && (
                      <Badge className="status-badge-pending ml-2">
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        Pending Approval
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        className="roles-button roles-button-change"
                        size="sm"
                        onClick={() => handleRoleChange(employee.id)}
                        disabled={!employee.is_active}
                      >
                        <UserCog className="mr-1 h-4 w-4" />
                        Change Role
                      </Button>
                      <Button 
                        className="roles-button roles-button-history"
                        size="sm"
                        onClick={() => handleViewHistory(employee.id, employee.name)}
                      >
                        <History className="mr-1 h-4 w-4" />
                        History
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Confirmation Dialog */}
      {selectedUser && (
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[var(--roles-primary)]" />
                Change Role
              </DialogTitle>
              <DialogDescription>
                Change {selectedUser.name}'s role to grant different permissions.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <div className="mb-4 p-4 bg-[rgba(62,198,224,0.05)] rounded-md border border-[var(--roles-card-border)]">
                <h3 className="text-sm font-medium text-[var(--roles-primary)]">Employee Information</h3>
                <div className="text-sm mt-2 space-y-1">
                  <p><strong>Name:</strong> {selectedUser.name}</p>
                  <p><strong>Email:</strong> {selectedUser.email}</p>
                  <p><strong>Status:</strong> {selectedUser.is_active ? "Active" : "Inactive"}</p>
                </div>
              </div>
              
              <label className="text-sm font-medium mb-2 block text-[var(--roles-primary)]">
                Current Role: <span className="ml-1 px-2 py-1 rounded-full text-xs bg-[rgba(62,198,224,0.1)]">{formatRole(selectedUser.role)}</span>
              </label>
              
              <Select
                value={selectedRole}
                onValueChange={setSelectedRole}
              >
                <SelectTrigger className="mt-2 border-[var(--roles-card-border)] focus:ring-[var(--roles-primary)] focus:border-[var(--roles-primary)]">
                  <SelectValue placeholder="Select a new role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-700">
                <p className="text-sm font-medium flex items-center">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Important information
                </p>
                <ul className="list-disc ml-5 mt-1 text-sm space-y-1">
                  <li>This will update the user's permissions immediately</li>
                  <li>The user will see changes after their next login or page refresh</li>
                  <li>This action is logged for security purposes</li>
                </ul>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowConfirmDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                className="bg-gradient-to-r from-[var(--roles-primary)] to-[var(--roles-secondary)] hover:opacity-90"
                onClick={handleConfirmRoleChange}
                disabled={selectedRole === selectedUser.role}
              >
                Update Role
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Role Change History Dialog */}
      {historyUser && (
        <RoleChangeHistory
          userId={historyUser.id}
          userName={historyUser.name}
          isOpen={showHistoryDialog}
          onClose={() => {
            setShowHistoryDialog(false);
            setHistoryUser(null);
          }}
        />
      )}
    </div>
  );
};

export default ManageRoles; 