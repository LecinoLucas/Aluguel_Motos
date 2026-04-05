import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, type LucideIcon } from "lucide-react";

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
    <Card className={`border-l-4 ${accentClassName}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4" />
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
