import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Loader2, RotateCcw, Trash2 } from "lucide-react";
import type { PagamentoRecord } from "../types";
import { formatContratoCode, formatCurrencyBR, formatDateBR, getDaysOverdue } from "../utils";

interface PagamentosTableProps {
  items: PagamentoRecord[];
  contratos?: Array<{ id: number }>;
  motos?: Array<{ id: number; marca?: string | null; modelo?: string | null; placa?: string | null }>;
  isLoading: boolean;
  onDelete: (id: number) => void;
  deletePending: boolean;
  onMarkAsPaid: (id: number) => void;
  onReopen: (id: number) => void;
  updatePending: boolean;
}

export function PagamentosTable({
  items,
  contratos = [],
  motos = [],
  isLoading,
  onDelete,
  deletePending,
  onMarkAsPaid,
  onReopen,
  updatePending,
}: PagamentosTableProps) {
  const contratosById = new Map(contratos.map((contrato) => [contrato.id, contrato]));
  const motosById = new Map(motos.map((moto) => [moto.id, moto]));

  const formatMotoLabel = (motoId?: number | null) => {
    if (!motoId) return "-";
    const moto = motosById.get(motoId);
    if (!moto) return `Moto #${motoId}`;
    const nome = [moto.marca, moto.modelo].filter(Boolean).join(" / ");
    return moto.placa ? `${nome || "Moto"} (${moto.placa})` : nome || `Moto #${motoId}`;
  };

  const formatOrigemLabel = (item: PagamentoRecord) => {
    if (item.origem === "contrato") return "Contrato";
    if (item.origem === "manutencao") return "Manutenção";
    return "Manual";
  };

  return (
    <Card className="operacoes-section-card">
      <CardHeader>
        <CardTitle>Financeiro</CardTitle>
        <CardDescription>Total de lançamentos: {items.length}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : items.length > 0 ? (
          <div className="-mx-2 overflow-x-auto px-2">
            <table className="w-full min-w-[1180px] text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left font-medium">Conta</th>
                  <th className="px-4 py-3 text-left font-medium">Tipo</th>
                  <th className="px-4 py-3 text-left font-medium">Origem</th>
                  <th className="px-4 py-3 text-left font-medium">Contrato</th>
                  <th className="px-4 py-3 text-left font-medium">Moto</th>
                  <th className="px-4 py-3 text-left font-medium">Descrição</th>
                  <th className="px-4 py-3 text-left font-medium">Valor</th>
                  <th className="px-4 py-3 text-left font-medium">Vencimento</th>
                  <th className="px-4 py-3 text-left font-medium">Atraso</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">#{item.id}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">{item.tipo === "receber" ? "Receber" : "Pagar"}</Badge>
                    </td>
                    <td className="px-4 py-3">{formatOrigemLabel(item)}</td>
                    <td className="px-4 py-3">
                      {item.contratoId
                        ? contratosById.has(item.contratoId)
                          ? formatContratoCode(item.contratoId)
                          : `#${item.contratoId}`
                        : "-"}
                    </td>
                    <td className="px-4 py-3">{formatMotoLabel(item.motoId)}</td>
                    <td className="px-4 py-3">{item.descricao || "-"}</td>
                    <td className="px-4 py-3 font-medium">{formatCurrencyBR(item.valor)}</td>
                    <td className="px-4 py-3">{formatDateBR(item.data)}</td>
                    <td className="px-4 py-3">
                      {item.status === "atrasado" ? `${getDaysOverdue(item.data)} dia(s)` : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">
                        {item.status === "pago" ? "Pago" : item.status === "atrasado" ? "Atrasado" : "Pendente"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {item.status === "pago" ? (
                          <Button variant="ghost" size="sm" onClick={() => onReopen(item.id)} disabled={updatePending}>
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" onClick={() => onMarkAsPaid(item.id)} disabled={updatePending}>
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => onDelete(item.id)} disabled={deletePending}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            Nenhum lançamento encontrado. Contratos geram contas semanais automaticamente e manutenções geram contas a pagar.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
