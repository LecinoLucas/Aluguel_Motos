import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertListCardProps<T> {
  title: string;
  description: string;
  items: T[] | undefined;
  isLoading: boolean;
  emptyMessage: string;
  itemToneClassName: string;
  renderItem: (item: T) => { title: string; subtitle: string };
}

export function AlertListCard<T>({
  title,
  description,
  items,
  isLoading,
  emptyMessage,
  itemToneClassName,
  renderItem,
}: AlertListCardProps<T>) {
  return (
    <Card className={cn("dashboard-alert-card")}>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="dashboard-card-state dashboard-card-state--compact">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        ) : items && items.length > 0 ? (
          <ul className="dashboard-alert-list">
            {items.slice(0, 3).map((item, index) => {
              const content = renderItem(item);

              return (
                <li key={index} className={`dashboard-alert-item ${itemToneClassName}`}>
                  <span className="font-medium">{content.title}</span>
                  <br />
                  <span className="text-xs text-muted-foreground">{content.subtitle}</span>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="dashboard-card-state dashboard-card-state--compact text-sm text-muted-foreground">{emptyMessage}</div>
        )}
      </CardContent>
    </Card>
  );
}
