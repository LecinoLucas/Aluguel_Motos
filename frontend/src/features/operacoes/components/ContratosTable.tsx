import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Pencil, Printer, RefreshCcw, Trash2 } from "lucide-react";
import type { ContratoRecord } from "../types";
import {
  calculateContratoTotal,
  formatContratoCode,
  formatCurrencyBR,
  formatDateBR,
  getContratoStatusColor,
} from "../utils";

interface ContratosTableProps {
  items: ContratoRecord[];
  locadores?: Array<{ id: number; nome?: string | null }>;
  locatarios?: Array<{ id: number; nome?: string | null }>;
  veiculos?: Array<{ id: number; marca?: string | null; modelo?: string | null; placa?: string | null }>;
  isLoading: boolean;
  onEdit: (item: ContratoRecord) => void;
  onRenew: (item: ContratoRecord) => void;
  canRenew: (item: ContratoRecord) => boolean;
  renewPending: boolean;
  onIssueAgain: (item: ContratoRecord) => void;
  onClose: (item: ContratoRecord) => void;
  closePending: boolean;
  onDelete: (id: number) => void;
  deletePending: boolean;
}

function formatVeiculoLabel(veiculo?: { marca?: string | null; modelo?: string | null; placa?: string | null }) {
  if (!veiculo) return "Veículo não encontrado";
  const nome = [veiculo.marca, veiculo.modelo].filter(Boolean).join(" / ");
  const base = nome || "Veículo";
  return veiculo.placa ? `${base} (${veiculo.placa})` : base;
}

export function ContratosTable({
  items,
  locadores = [],
  locatarios = [],
  veiculos = [],
  isLoading,
  onEdit,
  onRenew,
  canRenew,
  renewPending,
  onIssueAgain,
  onClose,
  closePending,
  onDelete,
  deletePending,
}: ContratosTableProps) {
  const locadorById = new Map(locadores.map((locador) => [locador.id, locador]));
  const locatarioById = new Map(locatarios.map((locatario) => [locatario.id, locatario]));
  const veiculoById = new Map(veiculos.map((veiculo) => [veiculo.id, veiculo]));

  return (
    <Card className="operacoes-section-card">
      <CardHeader>
        <CardTitle>Contratos</CardTitle>
        <CardDescription>Total: {items.length}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="operacoes-card-state">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : items.length > 0 ? (
          <div className="operacoes-table-wrap">
            <table className="operacoes-table w-full min-w-[1120px] text-sm">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Locadores</th>
                  <th>Locatário</th>
                  <th>Veículo</th>
                  <th>Período</th>
                  <th>Valor/Semana</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td data-label="Código">{formatContratoCode(item.id)}</td>
                    <td data-label="Locadores">
                      {item.locadores.length > 0
                        ? item.locadores
                            .map((locador) => locador.nome || locadorById.get(locador.id)?.nome || `Locador #${locador.id}`)
                            .join(", ")
                        : "Sem locador"}
                    </td>
                    <td data-label="Locatário">{locatarioById.get(item.locatarioId)?.nome || `Locatário #${item.locatarioId}`}</td>
                    <td data-label="Veículo">{formatVeiculoLabel(veiculoById.get(item.motoId))}</td>
                    <td data-label="Período" className="text-xs">
                      {formatDateBR(item.dataInicio)} a {formatDateBR(item.dataFim)}
                    </td>
                    <td data-label="Valor/Semana">{formatCurrencyBR(item.valorSemanal)}</td>
                    <td data-label="Total">{formatCurrencyBR(calculateContratoTotal(item.valorSemanal, item.dataInicio, item.dataFim))}</td>
                    <td data-label="Status">
                      <span className={`operacoes-status-chip ${getContratoStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td data-label="Ações">
                      <div className="flex items-center gap-1">
                        {item.status === "ativo" ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEdit(item)}
                              title="Editar contrato"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onIssueAgain(item)}
                              title="Reimprimir contrato"
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onClose(item)}
                              disabled={closePending}
                              title="Encerrar contrato"
                            >
                              Encerrar
                            </Button>
                          </>
                        ) : null}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRenew(item)}
                          disabled={!canRenew(item) || renewPending}
                          title={canRenew(item) ? "Renovar contrato vencido" : "Renovação disponível só após vencimento"}
                        >
                          <RefreshCcw className="h-4 w-4" />
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
            Nenhum contrato cadastrado. Clique em "Novo Contrato" para adicionar.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
