import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import type { ContratoListItem, MotoListItem } from "@/lib/trpc-types";
import type { ManutencaoRecord } from "../types";
import { formatContratoCode, formatCurrencyBR, formatDateBR } from "../utils";

interface ManutencoesTableProps {
  items: ManutencaoRecord[];
  contratos?: ContratoListItem[];
  motos?: MotoListItem[];
  isLoading: boolean;
  onEdit: (item: ManutencaoRecord) => void;
  onDelete: (id: number) => void;
  editPending: boolean;
  deletePending: boolean;
}

function formatMotoLabel(moto?: MotoListItem) {
  if (!moto) return "Moto";
  const name = [moto.marca, moto.modelo].filter(Boolean).join(" / ");
  return `${name || "Moto"} ${moto.placa ? `(${moto.placa})` : ""}`.trim();
}

export function ManutencoesTable({
  items,
  contratos = [],
  motos = [],
  isLoading,
  onEdit,
  onDelete,
  editPending,
  deletePending,
}: ManutencoesTableProps) {
  const contratosById = new Map(contratos.map((contrato) => [contrato.id, contrato]));
  const motoById = new Map(motos.map((moto) => [moto.id, moto]));

  return (
    <Card className="operacoes-section-card">
      <CardHeader>
        <CardTitle>Histórico de Manutenções</CardTitle>
        <CardDescription>Total: {items.length}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="operacoes-card-state">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : items.length > 0 ? (
          <div className="operacoes-table-wrap">
            <table className="operacoes-table w-full min-w-[1080px] text-sm">
              <thead>
                <tr>
                  <th>Contrato</th>
                  <th>Moto</th>
                  <th>Peça</th>
                  <th>Tipo</th>
                  <th>Data</th>
                  <th>Custo</th>
                  <th>KM</th>
                  <th>Intervalo</th>
                  <th>Descrição</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td data-label="Contrato">
                      {item.contratoId ? (contratosById.has(item.contratoId) ? formatContratoCode(item.contratoId) : `#${item.contratoId}`) : "-"}
                    </td>
                    <td data-label="Moto">{formatMotoLabel(motoById.get(item.motoId))}</td>
                    <td data-label="Peça">{item.peca || "-"}</td>
                    <td data-label="Tipo">{item.tipo}</td>
                    <td data-label="Data">{formatDateBR(item.data)}</td>
                    <td data-label="Custo" className="font-medium">{formatCurrencyBR(item.custo)}</td>
                    <td data-label="KM">{item.kmAtual ? item.kmAtual.toLocaleString("pt-BR") : "-"}</td>
                    <td data-label="Intervalo">{item.intervaloDiasPrevisto ? `${item.intervaloDiasPrevisto} dias` : "-"}</td>
                    <td data-label="Descrição" className="text-xs">{item.descricao || "-"}</td>
                    <td data-label="Ações">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => onEdit(item)} disabled={editPending}>
                          <Pencil className="h-4 w-4" />
                        </Button>
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
          <div className="operacoes-table-empty">
            Nenhuma manutenção registrada. Clique em "Registrar Manutenção" para adicionar.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
