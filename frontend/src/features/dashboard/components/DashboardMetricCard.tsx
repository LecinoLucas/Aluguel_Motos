import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardMetricCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  accentClassName: string;
  isLoading: boolean;
}

export function DashboardMetricCard({
  title,
  value,
  description,
  icon: Icon,
  accentClassName,
  isLoading,
}: DashboardMetricCardProps) {
  return (
    <Card className={cn("dashboard-metric-card border-l-4", accentClassName)}>
      <CardHeader className="dashboard-metric-card__header">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="dashboard-metric-card__icon">
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
