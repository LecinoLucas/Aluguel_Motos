import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrencyBR } from "../utils";

export interface ManutencaoMonthlyPoint {
  mes: string;
  total: number;
  count: number;
}

interface ManutencaoMonthlyChartCardProps {
  isLoading: boolean;
  data: ManutencaoMonthlyPoint[];
  scopeLabel: string;
  className?: string;
}

function formatAxisCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

export function ManutencaoMonthlyChartCard({
  isLoading,
  data,
  scopeLabel,
  className,
}: ManutencaoMonthlyChartCardProps) {
  return (
    <Card className={cn("operacoes-section-card xl:col-span-3", className)}>
      <CardHeader>
        <CardTitle className="text-base">Gasto mensal</CardTitle>
        <CardDescription>Últimos 12 meses • {scopeLabel}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-80 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : data.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis tickFormatter={formatAxisCurrency} width={72} />
              <Tooltip
                formatter={(value: number) => formatCurrencyBR(value)}
                labelFormatter={(label) => `Mês: ${label}`}
              />
              <Bar dataKey="total" fill="#2563eb" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-80 items-center justify-center text-muted-foreground">
            Sem dados disponíveis
          </div>
        )}
      </CardContent>
    </Card>
  );
}
