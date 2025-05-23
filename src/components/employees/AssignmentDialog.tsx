import { useState, useEffect } from "react"
import { User, useAuth } from "@/contexts/auth-context"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import "@/styles/modern-employee-profile.css"

interface AssignmentDialogProps {
  isOpen: boolean
  employee: User
  onClose: () => void
}

export function AssignmentDialog({
  isOpen,
  employee,
  onClose,
}: AssignmentDialogProps) {
  const { users, assignSupervisor, assignManager } = useAuth()
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const { toast } = useToast()

  // Reset selection when dialog opens with different employee
  useEffect(() => {
    if (isOpen) {
      setSelectedUserId("")
    }
  }, [isOpen, employee.id])

  // Get list of potential supervisors or managers based on employee role
  const getEligibleUsers = () => {
    if (employee.role === "staff") {
      // Staff can be assigned to supervisors
      return users.filter(user => user.role === "supervisor")
    } else if (employee.role === "supervisor") {
      // Supervisors can be assigned to managers
      return users.filter(user => user.role === "manager" || user.role === "head_manager")
    }
    return []
  }

  const handleAssign = () => {
    if (!selectedUserId) {
      toast({
        title: "Error",
        description: "Please select a user to assign",
        variant: "destructive",
      })
      return
    }

    try {
      if (employee.role === "staff") {
        assignSupervisor(employee.id, selectedUserId)
        toast({
          title: "Success",
          description: `${employee.name} has been assigned to a supervisor`,
        })
      } else if (employee.role === "supervisor") {
        assignManager(employee.id, selectedUserId)
        toast({
          title: "Success",
          description: `${employee.name} has been assigned to a manager`,
        })
      }
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign user",
        variant: "destructive",
      })
    }
  }

  const eligibleUsers = getEligibleUsers()
  const assignmentType = employee.role === "staff" ? "supervisor" : "manager"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="modern-employee-profile-modal p-0 border-none bg-transparent shadow-none">
        <div className="modern-employee-profile-header">
          <DialogTitle className="modern-employee-profile-title">
            Assign {employee.name} to a {assignmentType}
          </DialogTitle>
          <DialogDescription className="modern-employee-profile-subtitle">
            {employee.role === "staff"
              ? "Select a supervisor to assign this staff member to."
              : "Select a manager to assign this supervisor to."}
          </DialogDescription>
        </div>

        <div className="modern-employee-profile-content">
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="user-select" className="form-label">Select {assignmentType}</Label>
              <Select
                value={selectedUserId}
                onValueChange={setSelectedUserId}
              >
                <SelectTrigger id="user-select" className="w-full form-select">
                  <SelectValue placeholder={`Select a ${assignmentType}`} />
                </SelectTrigger>
                <SelectContent>
                  {eligibleUsers.length > 0 ? (
                    eligibleUsers.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.role})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No eligible {assignmentType}s found
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="modern-employee-profile-footer">
            <button 
              className="modern-employee-profile-button cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              className="modern-employee-profile-button primary"
              onClick={handleAssign}
            >
              Assign
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
