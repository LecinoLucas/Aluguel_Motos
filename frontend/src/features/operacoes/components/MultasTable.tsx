import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { MotoListItem } from "@/lib/trpc-types";
import { CheckCircle2, Loader2, Pencil, RotateCcw, ShieldAlert, Trash2 } from "lucide-react";
import type { ContratoRecord, MultaRecord } from "../types";
import { formatContratoCode, formatCurrencyBR, formatDateBR, formatMotoLabel } from "../utils";

interface MultasTableProps {
  items: MultaRecord[];
  contratos?: ContratoRecord[];
  motos?: MotoListItem[];
  isLoading: boolean;
  onEdit: (item: MultaRecord) => void;
  onDelete: (id: number) => void;
  onMarkAsPaid: (id: number) => void;
  onDiscountFromDeposit: (id: number) => void;
  onReopen: (id: number) => void;
  deletePending: boolean;
  updatePending: boolean;
}

function getTipoLabel(tipo: MultaRecord["tipo"]) {
  return tipo === "prejuizo" ? "Prejuízo" : "Multa";
}

function getStatusLabel(status: MultaRecord["status"]) {
  if (status === "pago") return "Pago";
  if (status === "descontado_caucao") return "Descontado da caução";
  return "Pendente";
}

export function MultasTable({
  items,
  contratos = [],
  motos = [],
  isLoading,
  onEdit,
  onDelete,
  onMarkAsPaid,
  onDiscountFromDeposit,
  onReopen,
  deletePending,
  updatePending,
}: MultasTableProps) {
  const contratosById = new Map(contratos.map((contrato) => [contrato.id, contrato]));
  const motosById = new Map(motos.map((moto) => [moto.id, moto]));

  return (
    <Card className="operacoes-section-card">
      <CardHeader>
        <CardTitle>Multas e prejuízos</CardTitle>
        <CardDescription>Total de ocorrências: {items.length}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : items.length > 0 ? (
          <div className="-mx-2 overflow-x-auto px-2">
            <table className="w-full min-w-[1320px] text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left font-medium">Ocorrência</th>
                  <th className="px-4 py-3 text-left font-medium">Contrato</th>
                  <th className="px-4 py-3 text-left font-medium">Moto</th>
                  <th className="px-4 py-3 text-left font-medium">Tipo</th>
                  <th className="px-4 py-3 text-left font-medium">Responsável</th>
                  <th className="px-4 py-3 text-left font-medium">Descrição</th>
                  <th className="px-4 py-3 text-left font-medium">Valor</th>
                  <th className="px-4 py-3 text-left font-medium">Data</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Observação</th>
                  <th className="px-4 py-3 text-left font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">#{item.id}</td>
                    <td className="px-4 py-3">
                      {contratosById.has(item.contratoId) ? formatContratoCode(item.contratoId) : `#${item.contratoId}`}
                    </td>
                    <td className="px-4 py-3">{formatMotoLabel(motosById.get(item.motoId))}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">{getTipoLabel(item.tipo)}</Badge>
                    </td>
                    <td className="px-4 py-3">{item.responsavel}</td>
                    <td className="px-4 py-3">{item.descricao}</td>
                    <td className="px-4 py-3 font-medium">{formatCurrencyBR(item.valor)}</td>
                    <td className="px-4 py-3">{formatDateBR(item.data)}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">{getStatusLabel(item.status)}</Badge>
                    </td>
                    <td className="px-4 py-3">{item.observacao || "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {item.status !== "pago" ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onMarkAsPaid(item.id)}
                            disabled={updatePending}
                            title="Marcar como pago"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        ) : null}
                        {item.status !== "descontado_caucao" ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDiscountFromDeposit(item.id)}
                            disabled={updatePending}
                            title="Descontar da caução"
                          >
                            <ShieldAlert className="h-4 w-4" />
                          </Button>
                        ) : null}
                        {item.status !== "pendente" ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onReopen(item.id)}
                            disabled={updatePending}
                            title="Voltar para pendente"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        ) : null}
                        <Button variant="ghost" size="sm" onClick={() => onEdit(item)} disabled={updatePending} title="Editar">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onDelete(item.id)} disabled={deletePending} title="Excluir">
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
            Nenhuma ocorrência encontrada. Cadastre multas e prejuízos para acompanhar cobrança, desconto na caução e saldo final da devolução.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
