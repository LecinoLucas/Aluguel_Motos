import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Trash2 } from "lucide-react";
import type { ContratoRecord } from "../types";
import { formatCurrencyBR, formatDateBR, getContratoStatusColor } from "../utils";

interface ContratosTableProps {
  items: ContratoRecord[];
  isLoading: boolean;
  onDelete: (id: number) => void;
  deletePending: boolean;
}

export function ContratosTable({ items, isLoading, onDelete, deletePending }: ContratosTableProps) {
  return (
    <Card className="operacoes-section-card">
      <CardHeader>
        <CardTitle>Contratos</CardTitle>
        <CardDescription>Total: {items.length}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : items.length > 0 ? (
          <div className="-mx-2 overflow-x-auto px-2">
            <table className="w-full min-w-[840px] text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left font-medium">ID</th>
                  <th className="px-4 py-3 text-left font-medium">Cliente</th>
                  <th className="px-4 py-3 text-left font-medium">Moto</th>
                  <th className="px-4 py-3 text-left font-medium">Período</th>
                  <th className="px-4 py-3 text-left font-medium">Valor/Dia</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">#{item.id}</td>
                    <td className="px-4 py-3">Cliente {item.clienteId}</td>
                    <td className="px-4 py-3">Moto {item.motoId}</td>
                    <td className="px-4 py-3 text-xs">
                      {formatDateBR(item.dataInicio)} a {formatDateBR(item.dataFim)}
                    </td>
                    <td className="px-4 py-3">{formatCurrencyBR(item.valorDiario)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded px-2 py-1 text-xs font-medium ${getContratoStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
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
            Nenhum contrato cadastrado. Clique em "Novo Contrato" para adicionar.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
