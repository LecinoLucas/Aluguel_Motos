export type ContratoStatusFilter = "all" | "ativo" | "encerrado" | "cancelado";
export type PagamentoStatusFilter = "all" | "pendente" | "pago" | "atrasado";
export type PagamentoTipoFilter = "all" | "receber" | "pagar";
export type MultaStatusFilter = "all" | "pendente" | "pago" | "descontado_caucao";
export type MultaTipoFilter = "all" | "multa" | "prejuizo";

export interface ContratoDocumentoSnapshot {
  locadores: Array<{
    nome: string;
    nacionalidade: string;
    estadoCivil: string;
    cpf: string;
    rg: string;
    orgaoEmissor: string;
    endereco: string;
    cidade: string;
    estado: string;
    cep: string;
    telefone: string;
  }>;
  locatario: {
    nome: string;
    nacionalidade: string;
    estadoCivil: string;
    cpf: string;
    rg: string;
    orgaoEmissor: string;
    endereco: string;
    cidade: string;
    estado: string;
    cep: string;
    telefone: string;
    cnh: string;
  };
  veiculo: {
    marca: string;
    modelo: string;
    ano: string;
    cor: string;
    placa: string;
    chassi: string;
    renavam: string;
  };
  termos: {
    localContrato: string;
    dataContrato: string;
    dataInicio: string;
    dataFim: string;
    valorSemanal: string;
    valorCaucao: string;
    formaPagamento: string;
    kmHodometro: string;
  };
}

export interface ContratoRecord {
  id: number;
  locadorIds: number[];
  locadores: Array<{ id: number; nome?: string | null; cpf?: string | null }>;
  locatarioId: number;
  motoId: number;
  dataInicio: string | Date;
  dataFim: string | Date;
  valorSemanal: string | number;
  diasAposFim: number;
  status: string;
  createdAt?: string | Date;
  documentoSnapshot?: ContratoDocumentoSnapshot | null;
}

export interface PagamentoRecord {
  id: number;
  contratoId?: number | null;
  motoId?: number | null;
  manutencaoId?: number | null;
  tipo: "receber" | "pagar";
  origem?: "manual" | "contrato" | "manutencao" | string;
  descricao?: string | null;
  valor: string | number;
  data: string | Date;
  status: string;
}

export interface ManutencaoRecord {
  id: number;
  contratoId?: number | null;
  motoId: number;
  peca?: string | null;
  tipo: string;
  data: string | Date;
  custo: string | number;
  kmAtual?: number | null;
  intervaloDiasPrevisto?: number | null;
  descricao?: string | null;
}

export interface MultaRecord {
  id: number;
  contratoId: number;
  motoId: number;
  tipo: "multa" | "prejuizo";
  responsavel: string;
  descricao: string;
  data: string | Date;
  valor: string | number;
  status: "pendente" | "pago" | "descontado_caucao";
  observacao?: string | null;
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

export const pagamentoTipoOptions: Array<{ value: PagamentoTipoFilter; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "receber", label: "Receber" },
  { value: "pagar", label: "Pagar" },
];

export const multaStatusOptions: Array<{ value: MultaStatusFilter; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "pendente", label: "Pendente" },
  { value: "pago", label: "Pago" },
  { value: "descontado_caucao", label: "Descontado da caução" },
];

export const multaTipoOptions: Array<{ value: MultaTipoFilter; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "multa", label: "Multa" },
  { value: "prejuizo", label: "Prejuízo" },
];
