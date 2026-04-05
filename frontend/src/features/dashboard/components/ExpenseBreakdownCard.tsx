import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { formatCurrencyBR } from "../utils";

interface ExpenseBreakdownCardProps {
  isLoading: boolean;
  items: Array<{
    origem: string;
    label: string;
    total: number;
    pago: number;
    pendente: number;
    quantidade: number;
  }>;
}

export function ExpenseBreakdownCard({ isLoading, items }: ExpenseBreakdownCardProps) {
  const maxTotal = items.reduce((max, item) => Math.max(max, item.total), 0);

  return (
    <Card className="dashboard-chart-card">
      <CardHeader>
        <CardTitle>Despesas Por Origem</CardTitle>
        <CardDescription>Onde o dinheiro está saindo e o que ainda falta pagar</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="dashboard-card-state dashboard-card-state--compact">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : items.length > 0 ? (
          <div className="dashboard-expense-list">
            {items.map((item) => (
              <article key={item.origem} className="dashboard-expense-item">
                <div className="dashboard-expense-item__header">
                  <div>
                    <strong>{item.label}</strong>
                    <p>{item.quantidade} lançamento(s)</p>
                  </div>
                  <strong>{formatCurrencyBR(item.total)}</strong>
                </div>
                <div className="dashboard-expense-item__bar">
                  <span
                    className="dashboard-expense-item__bar-fill"
                    style={{ width: `${maxTotal > 0 ? (item.total / maxTotal) * 100 : 0}%` }}
                  />
                </div>
                <div className="dashboard-expense-item__meta">
                  <span>Pago: {formatCurrencyBR(item.pago)}</span>
                  <span>Pendente: {formatCurrencyBR(item.pendente)}</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="dashboard-card-state dashboard-card-state--compact text-sm text-muted-foreground">
            Nenhuma despesa encontrada
          </div>
        )}
      </CardContent>
    </Card>
  );
}
