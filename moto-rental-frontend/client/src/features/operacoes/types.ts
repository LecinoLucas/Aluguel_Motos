export type ContratoStatusFilter = "all" | "ativo" | "encerrado" | "cancelado";
export type PagamentoStatusFilter = "all" | "pendente" | "pago" | "atrasado";

export interface ContratoRecord {
  id: number;
  clienteId: number;
  motoId: number;
  dataInicio: string | Date;
  dataFim: string | Date;
  valorDiario: string | number;
  status: string;
}

export interface PagamentoRecord {
  id: number;
  contratoId: number;
  valor: string | number;
  data: string | Date;
  status: string;
}

export interface ManutencaoRecord {
  id: number;
  motoId: number;
  tipo: string;
  data: string | Date;
  custo: string | number;
  descricao?: string | null;
}

export const contratoStatusOptions: Array<{ value: ContratoStatusFilter; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "ativo", label: "Ativo" },
  { value: "encerrado", label: "Encerrado" },
  { value: "cancelado", label: "Cancelado" },
];

export const pagamentoStatusOptions: Array<{ value: PagamentoStatusFilter; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "pendente", label: "Pendente" },
  { value: "pago", label: "Pago" },
  { value: "atrasado", label: "Atrasado" },
];
