import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";

interface FinancialFlowChartCardProps {
  isLoading: boolean;
  chartData: Array<{ mes: string; receita: number; despesa: number; lucro: number }>;
}

export function FinancialFlowChartCard({ isLoading, chartData }: FinancialFlowChartCardProps) {
  return (
    <Card className={cn("dashboard-chart-card")}>
      <CardHeader>
        <CardTitle>Fluxo Financeiro</CardTitle>
        <CardDescription>Receita, despesa e lucro realizados nos últimos 12 meses</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="dashboard-card-state h-80">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip formatter={(value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value))} />
              <Legend />
              <Bar dataKey="receita" name="Receita" fill="#0f766e" radius={[6, 6, 0, 0]} />
              <Bar dataKey="despesa" name="Despesa" fill="#f97316" radius={[6, 6, 0, 0]} />
              <Line type="monotone" dataKey="lucro" name="Lucro" stroke="#1d4ed8" strokeWidth={3} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="dashboard-card-state h-80 text-muted-foreground">Sem dados disponíveis</div>
        )}
      </CardContent>
    </Card>
  );
}
