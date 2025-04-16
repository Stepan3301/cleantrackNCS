
import { ArrowUpCircle, TrendingUp } from "lucide-react"

interface StatCardProps {
  title: string
  value: number | string
  icon: React.ReactNode
  change?: number
  isPositive?: boolean
}

export function StatCard({ title, value, icon, change, isPositive }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg border border-border p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-3xl font-bold mt-2">{value}</h3>
          
          {change !== undefined && (
            <div className={`flex items-center mt-2 text-sm ${isPositive ? 'text-success' : 'text-destructive'}`}>
              {isPositive ? <ArrowUpCircle size={14} className="mr-1" /> : <TrendingUp size={14} className="mr-1" />}
              <span>{change}% {isPositive ? 'increase' : 'decrease'}</span>
            </div>
          )}
        </div>
        <div className="bg-primary/10 p-3 rounded-full">
          {icon}
        </div>
      </div>
    </div>
  )
}
