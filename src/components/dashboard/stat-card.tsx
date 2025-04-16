
import { ArrowUpCircle, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: number;
  isPositive?: boolean;
  isLoading?: boolean;
}

export function StatCard({ title, value, icon, change, isPositive, isLoading = false }: StatCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-border p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
    );
  }

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
  );
}
