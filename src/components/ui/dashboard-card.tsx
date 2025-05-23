import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardFooter, CardHeader } from "./card"

interface DashboardCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  icon?: React.ReactNode
  footer?: React.ReactNode
  isLoading?: boolean
  interactive?: boolean
  wide?: boolean
}

export function DashboardCard({
  title,
  description,
  icon,
  footer,
  isLoading = false,
  interactive = false,
  wide = false,
  children,
  className,
  ...props
}: DashboardCardProps) {
  return (
    <Card 
      className={cn(
        "overflow-hidden dashboard-card", 
        interactive && "interactive",
        wide && "wide",
        className
      )} 
      {...props}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <div className="flex flex-col space-y-1.5">
          {title && <h3 className="card-title leading-none tracking-tight">{title}</h3>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {icon && <div className="card-icon">{icon}</div>}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-[80px] items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          children
        )}
      </CardContent>
      {footer && (
        <CardFooter className="card-footer px-0 mt-auto">
          {footer}
        </CardFooter>
      )}
    </Card>
  )
}
