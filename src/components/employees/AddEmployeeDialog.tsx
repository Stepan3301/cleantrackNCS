import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { Calendar as CalendarIcon, UserPlus } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

// Import modern employee dialog styles
import "@/styles/modern-employee-dialog.css"

const formSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(8, "Phone number must be at least 8 characters"),
  role: z.enum(["staff", "supervisor", "manager", "head_manager", "owner"]),
  dateOfBirth: z.date()
})

interface AddEmployeeDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function AddEmployeeDialog({ isOpen, onClose }: AddEmployeeDialogProps) {
  const { register } = useAuth()
  const { toast } = useToast()
  const [isVisible, setIsVisible] = useState(false)

  // Add a small delay for the animation to work properly
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }, [isOpen])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "staff",
      dateOfBirth: new Date(1990, 0, 1)
    }
  })

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    // Generate a temporary password - in a real app, you might send an email invitation
    const tempPassword = `${values.name.split(' ')[0].toLowerCase()}123`
    
    try {
      // Register the new employee
      const success = await register({
        name: values.name,
        email: values.email,
        phone: values.phone,
        role: values.role,
        password: tempPassword,
        dateOfBirth: values.dateOfBirth
      })

      if (success) {
        toast({
          title: "Employee added",
          description: "New employee has been successfully added"
        })
        form.reset()
        onClose()
      } else {
        toast({
          title: "Failed to add employee",
          description: "There was an error adding the employee",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error registering employee:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`modern-dialog add-employee-dialog ${isVisible ? 'visible' : ''}`}>
        {/* Decorative background bubbles */}
        <div className="add-employee-bubbles">
          <div className="bubble"></div>
          <div className="bubble"></div>
        </div>
        
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#3ec6e0] to-[#7fffd4] flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
          </div>
          <DialogTitle>Add New Employee</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="form-row">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="form-item">
                    <FormLabel className="form-label">Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="form-item">
                    <FormLabel className="form-label">Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="form-row">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="form-item">
                    <FormLabel className="form-label">Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="supervisor">Supervisor</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="head_manager">Head Manager</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem className="form-item">
                    <FormLabel className="form-label">Date of Birth</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal date-picker-button",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "MMMM d, yyyy")
                            ) : (
                              <span>Select date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          captionLayout="dropdown"
                          fromYear={1950}
                          toYear={new Date().getFullYear() - 16}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="form-row">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="form-item full">
                    <FormLabel className="form-label">Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+1234567890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose} className="dialog-btn-cancel">
                Reset
              </Button>
              <Button type="submit" className="dialog-btn-submit">
                Add Employee
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
