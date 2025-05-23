import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/auth-context"
import { FilePlus, Loader2 } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { format, parseISO } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { ordersService, OrderInput } from "@/lib/services/orders-service"
import { Order } from "@/types/database.types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const Orders = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddOrderDialog, setShowAddOrderDialog] = useState(false)
  const [newOrder, setNewOrder] = useState<{
    date: Date | undefined;
    location: string;
    description: string;
    workers_count: number;
    expenses: number;
    revenue: number;
    client_name: string;
    client_contact: string;
    status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  }>({
    date: new Date(),
    location: "",
    description: "",
    workers_count: 1,
    expenses: 0,
    revenue: 0,
    client_name: "",
    client_contact: "",
    status: "scheduled"
  })

  // Fetch orders on component mount
  useEffect(() => {
    async function fetchOrders() {
      try {
        setIsLoading(true)
        const data = await ordersService.getAllOrders()
        setOrders(data)
      } catch (error) {
        console.error("Error fetching orders:", error)
        toast({
          title: "Error",
          description: "Failed to load orders. Please try again.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [toast])

  // Calculate overall metrics
  const overallRevenue = orders.reduce((sum, order) => sum + Number(order.revenue), 0)
  const overallExpenses = orders.reduce((sum, order) => sum + Number(order.expenses), 0)
  const overallProfit = orders.reduce((sum, order) => sum + Number(order.profit), 0)
  
  // Calculate efficiency percentage
  const efficiencyPercentage = overallRevenue > 0 
    ? Math.round((overallProfit / overallRevenue) * 100) 
    : 0

  const handleAddOrder = async () => {
    if (!newOrder.date || !newOrder.location) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    try {
      setIsLoading(true)
      
      const orderInput: OrderInput = {
        date: newOrder.date.toISOString().split('T')[0],
        location: newOrder.location,
        description: newOrder.description || undefined,
        workers_count: newOrder.workers_count,
        expenses: newOrder.expenses,
        revenue: newOrder.revenue,
        client_name: newOrder.client_name || undefined,
        client_contact: newOrder.client_contact || undefined,
        status: newOrder.status
      }

      const createdOrder = await ordersService.createOrder(orderInput)
      
      if (createdOrder) {
        setOrders([createdOrder, ...orders])
        setShowAddOrderDialog(false)
        setNewOrder({
          date: new Date(),
          location: "",
          description: "",
          workers_count: 1,
          expenses: 0,
          revenue: 0,
          client_name: "",
          client_contact: "",
          status: "scheduled"
        })

        toast({
          title: "Order added",
          description: "New order has been successfully added"
        })
      }
    } catch (error) {
      console.error("Error creating order:", error)
      toast({
        title: "Error",
        description: "Failed to create order. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Orders</h1>
        <Button onClick={() => setShowAddOrderDialog(true)} disabled={isLoading}>
          <FilePlus size={16} className="mr-2" />
          Create New Order
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">AED {overallRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">AED {overallExpenses.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">AED {overallProfit.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overall Efficiency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{efficiencyPercentage}%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>
            All orders with revenue, expenses and profit information
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No orders found. Create your first order to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Workers</TableHead>
                  <TableHead>Expenses (AED)</TableHead>
                  <TableHead>Revenue (AED)</TableHead>
                  <TableHead>Profit (AED)</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{format(parseISO(order.date), "MMM dd, yyyy")}</TableCell>
                    <TableCell>{order.location}</TableCell>
                    <TableCell>{order.workers_count}</TableCell>
                    <TableCell>{Number(order.expenses).toLocaleString()}</TableCell>
                    <TableCell>{Number(order.revenue).toLocaleString()}</TableCell>
                    <TableCell className="font-medium">{Number(order.profit).toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        order.status === "completed" && "bg-success/20 text-success",
                        order.status === "in-progress" && "bg-info/20 text-info",
                        order.status === "scheduled" && "bg-primary/20 text-primary",
                        order.status === "cancelled" && "bg-destructive/20 text-destructive"
                      )}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add order dialog */}
      <Dialog open={showAddOrderDialog} onOpenChange={setShowAddOrderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Order</DialogTitle>
            <DialogDescription>
              Add a new cleaning order with all relevant details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newOrder.date ? format(newOrder.date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={newOrder.date}
                    onSelect={(date) => setNewOrder({ ...newOrder, date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Textarea
                id="location"
                placeholder="Enter the location details"
                value={newOrder.location}
                onChange={(e) => setNewOrder({ ...newOrder, location: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Enter any additional details"
                value={newOrder.description}
                onChange={(e) => setNewOrder({ ...newOrder, description: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client_name">Client Name (Optional)</Label>
                <Input
                  id="client_name"
                  placeholder="Enter client name"
                  value={newOrder.client_name}
                  onChange={(e) => setNewOrder({ ...newOrder, client_name: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="client_contact">Client Contact (Optional)</Label>
                <Input
                  id="client_contact"
                  placeholder="Enter client phone or email"
                  value={newOrder.client_contact}
                  onChange={(e) => setNewOrder({ ...newOrder, client_contact: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="workers_count">Number of Workers</Label>
                <Input
                  id="workers_count"
                  type="number"
                  min="1"
                  value={newOrder.workers_count}
                  onChange={(e) => setNewOrder({ ...newOrder, workers_count: parseInt(e.target.value) || 1 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expenses">Expenses (AED)</Label>
                <Input
                  id="expenses"
                  type="number"
                  min="0"
                  value={newOrder.expenses}
                  onChange={(e) => setNewOrder({ ...newOrder, expenses: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="revenue">Revenue (AED)</Label>
                <Input
                  id="revenue"
                  type="number"
                  min="0"
                  value={newOrder.revenue}
                  onChange={(e) => setNewOrder({ ...newOrder, revenue: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={newOrder.status} 
                onValueChange={(value) => setNewOrder({ 
                  ...newOrder, 
                  status: value as 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
                })}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Profit (AED)</Label>
              <div className="p-2 bg-muted rounded-md text-center">
                {((Number(newOrder.revenue) || 0) - (Number(newOrder.expenses) || 0)).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Automatically calculated from revenue and expenses</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddOrderDialog(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleAddOrder} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Orders
