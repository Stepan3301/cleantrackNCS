
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface DeactivateConfirmationProps {
  isOpen: boolean
  employeeName: string
  onClose: () => void
  onConfirm: () => void
}

export function DeactivateConfirmation({
  isOpen,
  employeeName,
  onClose,
  onConfirm,
}: DeactivateConfirmationProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center text-destructive">
            <AlertTriangle className="mr-2 h-5 w-5" /> Deactivate Employee
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to deactivate {employeeName}? This action will remove their account from the system.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm}>
            Deactivate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
