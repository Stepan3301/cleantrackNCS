
import { User } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Mail, Phone, Calendar, Clock, AlertTriangle } from "lucide-react"

interface EmployeeDetailsProps {
  employee: User | null
  isOpen: boolean
  onClose: () => void
  onDeactivate: () => void
  showDeactivateOption: boolean
}

export function EmployeeDetails({ 
  employee, 
  isOpen, 
  onClose,
  onDeactivate,
  showDeactivateOption 
}: EmployeeDetailsProps) {
  if (!employee) return null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const getMonthsSinceJoin = (dateString: string) => {
    const joinDate = new Date(dateString)
    const today = new Date()
    return (today.getFullYear() - joinDate.getFullYear()) * 12 + 
           (today.getMonth() - joinDate.getMonth())
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="relative h-48 bg-primary">
          <button 
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 rounded-full p-2 text-white transition-colors"
            onClick={onClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18"/><path d="M6 6L18 18"/></svg>
          </button>
          <div className="absolute -bottom-16 left-6 w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-secondary">
            <img 
              src={`https://i.pravatar.cc/300?img=${employee.id}`}
              alt={employee.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        <div className="pt-20 px-6 pb-6">
          {/* Employee header info */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">{employee.name}</h2>
              <div className="flex items-center">
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium capitalize ${
                  employee.role === "manager" 
                    ? "bg-yellow-100 text-yellow-800" 
                    : employee.role === "supervisor"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800"
                }`}>
                  {employee.role}
                </span>
                <span className="mx-2 text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">
                  {getMonthsSinceJoin(new Date().toISOString())} months at company
                </span>
              </div>
            </div>
            
            {showDeactivateOption && (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={onDeactivate}
              >
                Deactivate
              </Button>
            )}
          </div>
          
          {/* Employee details grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div>
              <h3 className="text-lg font-medium mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail size={16} className="mr-2 text-muted-foreground" />
                  <span>{employee.email}</span>
                </div>
                <div className="flex items-center">
                  <Phone size={16} className="mr-2 text-muted-foreground" />
                  <span>Not provided</span>
                </div>
                <div className="flex items-center">
                  <Calendar size={16} className="mr-2 text-muted-foreground" />
                  <span>Started on {formatDate(new Date().toISOString())}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-6">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
