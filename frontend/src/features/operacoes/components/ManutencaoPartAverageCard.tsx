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
          <div className="flex h-80 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : rows.length > 0 ? (
          <div className="-mx-2 overflow-x-auto px-2">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left font-medium">Peça</th>
                  <th className="px-4 py-3 text-left font-medium">Trocas</th>
                  <th className="px-4 py-3 text-left font-medium">Média</th>
                  <th className="px-4 py-3 text-left font-medium">Total</th>
                  <th className="px-4 py-3 text-left font-medium">Última troca</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.partLabel} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{row.partLabel}</td>
                    <td className="px-4 py-3">{row.occurrences}</td>
                    <td className="px-4 py-3">{formatCurrencyBR(row.averageCost)}</td>
                    <td className="px-4 py-3 font-medium">{formatCurrencyBR(row.totalSpent)}</td>
                    <td className="px-4 py-3">
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
          <div className="flex h-80 items-center justify-center text-muted-foreground">
            Nenhuma peça encontrada para este filtro.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
