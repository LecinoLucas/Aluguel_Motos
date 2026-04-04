import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PagamentoRecord } from "../types";
import { formatCurrencyBR, formatDateBR } from "../utils";

interface PagamentosTableProps {
  items: PagamentoRecord[];
  isLoading: boolean;
  onDelete: (id: number) => void;
  deletePending: boolean;
  onStatusChange: (id: number, status: string) => void;
}

export function PagamentosTable({
  items,
  isLoading,
  onDelete,
  deletePending,
  onStatusChange,
}: PagamentosTableProps) {
  return (
    <Card className="operacoes-section-card">
      <CardHeader>
        <CardTitle>Pagamentos</CardTitle>
        <CardDescription>Total: {items.length}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : items.length > 0 ? (
          <div className="-mx-2 overflow-x-auto px-2">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left font-medium">ID</th>
                  <th className="px-4 py-3 text-left font-medium">Contrato</th>
                  <th className="px-4 py-3 text-left font-medium">Valor</th>
                  <th className="px-4 py-3 text-left font-medium">Data</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">#{item.id}</td>
                    <td className="px-4 py-3">#{item.contratoId}</td>
                    <td className="px-4 py-3 font-medium">{formatCurrencyBR(item.valor)}</td>
                    <td className="px-4 py-3">{formatDateBR(item.data)}</td>
                    <td className="px-4 py-3">
                      <Select value={item.status} onValueChange={(value) => onStatusChange(item.id, value)}>
                        <SelectTrigger className="w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pendente">Pendente</SelectItem>
                          <SelectItem value="pago">Pago</SelectItem>
                          <SelectItem value="atrasado">Atrasado</SelectItem>
                        </SelectContent>
                      </Select>
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
            Nenhum pagamento registrado. Clique em "Registrar Pagamento" para adicionar.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
