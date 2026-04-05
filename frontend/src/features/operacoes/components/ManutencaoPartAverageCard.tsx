import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { formatCurrencyBR, formatDateBR } from "../utils";

export interface MaintenancePartAverageRow {
  partLabel: string;
  totalSpent: number;
  averageCost: number;
  occurrences: number;
  lastDate: Date;
  lastCost: number;
}

interface ManutencaoPartAverageCardProps {
  isLoading: boolean;
  rows: MaintenancePartAverageRow[];
  className?: string;
}

export function ManutencaoPartAverageCard({ isLoading, rows, className }: ManutencaoPartAverageCardProps) {
  return (
    <Card className={cn("operacoes-section-card xl:col-span-2", className)}>
      <CardHeader>
        <CardTitle className="text-base">Custo médio por peça</CardTitle>
        <CardDescription>Descubra quais peças estão consumindo mais dinheiro na frota filtrada.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="operacoes-card-state h-80">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : rows.length > 0 ? (
          <div className="operacoes-table-wrap">
            <table className="operacoes-table w-full min-w-[760px] text-sm">
              <thead>
                <tr>
                  <th>Peça</th>
                  <th>Trocas</th>
                  <th>Média</th>
                  <th>Total</th>
                  <th>Última troca</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.partLabel}>
                    <td data-label="Peça" className="font-medium">{row.partLabel}</td>
                    <td data-label="Trocas">{row.occurrences}</td>
                    <td data-label="Média">{formatCurrencyBR(row.averageCost)}</td>
                    <td data-label="Total" className="font-medium">{formatCurrencyBR(row.totalSpent)}</td>
                    <td data-label="Última troca">
                      <div className="flex flex-col">
                        <span>{formatDateBR(row.lastDate)}</span>
                        <span className="text-xs text-muted-foreground">{formatCurrencyBR(row.lastCost)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="operacoes-card-state h-80 text-muted-foreground">
            Nenhuma peça encontrada para este filtro.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
