import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { formatCurrencyBR, formatPercent } from "../utils";

interface ProfitabilityByMotoCardProps {
  isLoading: boolean;
  items: Array<{
    motoId: number;
    marca?: string | null;
    modelo?: string | null;
    placa?: string | null;
    status: string;
    contratosAtivos: number;
    receitaRecebida: number;
    despesaPaga: number;
    lucroReal: number;
    receberAberto: number;
    pagarAberto: number;
    saldoProjetado: number;
    margemReal: number;
  }>;
}

function formatMotoLabel(item: ProfitabilityByMotoCardProps["items"][number]) {
  const nome = [item.marca, item.modelo].filter(Boolean).join(" / ");
  return `${nome || "Moto"}${item.placa ? ` (${item.placa})` : ""}`;
}

export function ProfitabilityByMotoCard({ isLoading, items }: ProfitabilityByMotoCardProps) {
  return (
    <Card className="dashboard-chart-card">
      <CardHeader>
        <CardTitle>Rentabilidade Por Moto</CardTitle>
        <CardDescription>Quais motos estão gerando mais lucro e quais estão consumindo mais caixa</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="dashboard-card-state">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : items.length > 0 ? (
          <div className="dashboard-profitability-wrap">
            <table className="dashboard-profitability-table">
              <thead>
                <tr>
                  <th>Moto</th>
                  <th>Status</th>
                  <th>Ativos</th>
                  <th>Receita</th>
                  <th>Despesa</th>
                  <th>Lucro</th>
                  <th>A receber</th>
                  <th>A pagar</th>
                  <th>Saldo proj.</th>
                  <th>Margem</th>
                </tr>
              </thead>
              <tbody>
                {items.slice(0, 8).map((item) => (
                  <tr key={item.motoId}>
                    <td data-label="Moto">
                      <div className="dashboard-profitability-table__title">{formatMotoLabel(item)}</div>
                    </td>
                    <td data-label="Status">{item.status}</td>
                    <td data-label="Ativos">{item.contratosAtivos}</td>
                    <td data-label="Receita">{formatCurrencyBR(item.receitaRecebida)}</td>
                    <td data-label="Despesa">{formatCurrencyBR(item.despesaPaga)}</td>
                    <td data-label="Lucro" className={item.lucroReal >= 0 ? "dashboard-profitability--positive" : "dashboard-profitability--negative"}>
                      {formatCurrencyBR(item.lucroReal)}
                    </td>
                    <td data-label="A receber">{formatCurrencyBR(item.receberAberto)}</td>
                    <td data-label="A pagar">{formatCurrencyBR(item.pagarAberto)}</td>
                    <td data-label="Saldo proj." className={item.saldoProjetado >= 0 ? "dashboard-profitability--positive" : "dashboard-profitability--negative"}>
                      {formatCurrencyBR(item.saldoProjetado)}
                    </td>
                    <td data-label="Margem">{formatPercent(item.margemReal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="dashboard-card-state text-muted-foreground">Sem dados por moto disponíveis</div>
        )}
      </CardContent>
    </Card>
  );
}
