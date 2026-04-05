import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Trash2 } from "lucide-react";
import type { MotoListItem } from "@/lib/trpc-types";
import type { ManutencaoRecord } from "../types";
import { formatCurrencyBR, formatDateBR } from "../utils";

interface ManutencoesTableProps {
  items: ManutencaoRecord[];
  motos?: MotoListItem[];
  isLoading: boolean;
  onDelete: (id: number) => void;
  deletePending: boolean;
}

function formatMotoLabel(moto?: MotoListItem) {
  if (!moto) return "Moto";
  const name = [moto.marca, moto.modelo].filter(Boolean).join(" / ");
  return `${name || "Moto"} ${moto.placa ? `(${moto.placa})` : ""}`.trim();
}

export function ManutencoesTable({ items, motos = [], isLoading, onDelete, deletePending }: ManutencoesTableProps) {
  const motoById = new Map(motos.map((moto) => [moto.id, moto]));

  return (
    <Card className="operacoes-section-card">
      <CardHeader>
        <CardTitle>Histórico de Manutenções</CardTitle>
        <CardDescription>Total: {items.length}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : items.length > 0 ? (
          <div className="-mx-2 overflow-x-auto px-2">
            <table className="w-full min-w-[1080px] text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left font-medium">Moto</th>
                  <th className="px-4 py-3 text-left font-medium">Peça</th>
                  <th className="px-4 py-3 text-left font-medium">Tipo</th>
                  <th className="px-4 py-3 text-left font-medium">Data</th>
                  <th className="px-4 py-3 text-left font-medium">Custo</th>
                  <th className="px-4 py-3 text-left font-medium">KM</th>
                  <th className="px-4 py-3 text-left font-medium">Intervalo</th>
                  <th className="px-4 py-3 text-left font-medium">Descrição</th>
                  <th className="px-4 py-3 text-left font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{formatMotoLabel(motoById.get(item.motoId))}</td>
                    <td className="px-4 py-3">{item.peca || "-"}</td>
                    <td className="px-4 py-3">{item.tipo}</td>
                    <td className="px-4 py-3">{formatDateBR(item.data)}</td>
                    <td className="px-4 py-3 font-medium">{formatCurrencyBR(item.custo)}</td>
                    <td className="px-4 py-3">{item.kmAtual ? item.kmAtual.toLocaleString("pt-BR") : "-"}</td>
                    <td className="px-4 py-3">{item.intervaloDiasPrevisto ? `${item.intervaloDiasPrevisto} dias` : "-"}</td>
                    <td className="px-4 py-3 text-xs">{item.descricao || "-"}</td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm" onClick={() => onDelete(item.id)} disabled={deletePending}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            Nenhuma manutenção registrada. Clique em "Registrar Manutenção" para adicionar.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
