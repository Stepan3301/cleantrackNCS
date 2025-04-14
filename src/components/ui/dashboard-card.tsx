
import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardFooter, CardHeader } from "./card"

interface DashboardCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  icon?: React.ReactNode
  footer?: React.ReactNode
  isLoading?: boolean
}

export function DashboardCard({
  title,
  description,
  icon,
  footer,
  isLoading = false,
  children,
  className,
  ...props
}: DashboardCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)} {...props}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <div className="flex flex-col space-y-1.5">
          {title && <h3 className="font-semibold leading-none tracking-tight">{title}</h3>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {icon && <div className="text-muted-foreground w-4 h-4">{icon}</div>}
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
      {footer && <CardFooter className="border-t px-6">{footer}</CardFooter>}
    </Card>
  )
}
