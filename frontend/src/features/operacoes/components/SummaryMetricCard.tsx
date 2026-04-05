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
    <Card className="operacoes-section-card operacoes-metric-card">
      <CardHeader className="operacoes-metric-card__header">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`operacoes-metric-card__value text-2xl font-bold ${toneClassName}`.trim()}>{value}</div>
      </CardContent>
    </Card>
  );
}
