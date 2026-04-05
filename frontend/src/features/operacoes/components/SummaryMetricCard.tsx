import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SummaryMetricCardProps {
  title: string;
  value: string;
  toneClassName?: string;
}

export function SummaryMetricCard({
  title,
  value,
  toneClassName = "",
}: SummaryMetricCardProps) {
  return (
    <Card className="operacoes-section-card">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${toneClassName}`.trim()}>{value}</div>
      </CardContent>
    </Card>
  );
}
