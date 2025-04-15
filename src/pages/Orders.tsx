
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/auth-context"
import { FilePlus } from "lucide-react"
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
import { format } from "date-fns"
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

// Define the order interface
interface Order {
  id: string
  date: Date
  location: string
  workers: number
  expenses: number
  revenue: number
  profit: number
}

const Orders = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "1",
      date: new Date(2025, 3, 10),
      location: "Dubai Marina, Building 7",
      workers: 3,
      expenses: 450,
      revenue: 1200,
      profit: 750
    },
    {
      id: "2",
      date: new Date(2025, 3, 12),
      location: "Business Bay Office Complex",
      workers: 5,
      expenses: 720,
      revenue: 1800,
      profit: 1080
    },
    {
      id: "3",
      date: new Date(2025, 3, 14),
      location: "Palm Jumeirah Villa",
      workers: 4,
      expenses: 900,
      revenue: 2500,
      profit: 1600
    }
  ])
  const [showAddOrderDialog, setShowAddOrderDialog] = useState(false)
  const [newOrder, setNewOrder] = useState<Partial<Order>>({
    date: new Date(),
    location: "",
    workers: 1,
    expenses: 0,
    revenue: 0
  })

  // Calculate overall metrics
  const overallRevenue = orders.reduce((sum, order) => sum + order.revenue, 0)
  const overallExpenses = orders.reduce((sum, order) => sum + order.expenses, 0)
  const overallProfit = orders.reduce((sum, order) => sum + order.profit, 0)
  
  // Calculate efficiency percentage
  const efficiencyPercentage = overallRevenue > 0 
    ? Math.round(((overallProfit - overallExpenses) / overallProfit) * 100) 
    : 0

  const handleAddOrder = () => {
    if (!newOrder.location || !newOrder.date) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    const revenue = Number(newOrder.revenue) || 0
    const expenses = Number(newOrder.expenses) || 0
    const profit = revenue - expenses

    const order: Order = {
      id: (orders.length + 1).toString(),
      date: newOrder.date!,
      location: newOrder.location,
      workers: Number(newOrder.workers) || 1,
      expenses: expenses,
      revenue: revenue,
      profit: profit
    }

    setOrders([...orders, order])
    setShowAddOrderDialog(false)
    setNewOrder({
      date: new Date(),
      location: "",
      workers: 1,
      expenses: 0,
      revenue: 0
    })

    toast({
      title: "Order added",
      description: "New order has been successfully added"
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Orders</h1>
        <Button onClick={() => setShowAddOrderDialog(true)}>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Workers</TableHead>
                <TableHead>Expenses (AED)</TableHead>
                <TableHead>Revenue (AED)</TableHead>
                <TableHead>Profit (AED)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{format(order.date, "MMM dd, yyyy")}</TableCell>
                  <TableCell>{order.location}</TableCell>
                  <TableCell>{order.workers}</TableCell>
                  <TableCell>{order.expenses.toLocaleString()}</TableCell>
                  <TableCell>{order.revenue.toLocaleString()}</TableCell>
                  <TableCell className="font-medium">{order.profit.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="workers">Number of Workers</Label>
                <Input
                  id="workers"
                  type="number"
                  min="1"
                  value={newOrder.workers}
                  onChange={(e) => setNewOrder({ ...newOrder, workers: parseInt(e.target.value) || 1 })}
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
              <Label>Profit (AED)</Label>
              <div className="p-2 bg-muted rounded-md text-center">
                {((Number(newOrder.revenue) || 0) - (Number(newOrder.expenses) || 0)).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Automatically calculated from revenue and expenses</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddOrderDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddOrder}>Add Order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Orders
