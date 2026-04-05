export const LOCADOR_STORAGE_KEY = "contrato_locador_data";
export const CONTRATOS_HISTORY_STORAGE_KEY = "contratos_gerados_history";
export const CONTRATOS_HISTORY_LIMIT = 30;

export interface LocadorData {
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
}

export interface LocatarioData {
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
}

export interface VeiculoData {
  marca: string;
  modelo: string;
  ano: string;
  cor: string;
  placa: string;
  chassi: string;
  renavam: string;
}

export interface ContratoTermos {
  localContrato: string;
  dataContrato: string;
  dataInicio: string;
  dataFim: string;
  valorSemanal: string;
  valorCaucao: string;
  formaPagamento: string;
  kmHodometro: string;
}

export interface ContratoHistoryItem {
  id: string;
  createdAt: string;
  titulo: string;
  locador: LocadorData;
  locatario: LocatarioData;
  veiculo: VeiculoData;
  termos: ContratoTermos;
}

export interface ExtractedDocumentFields {
  nome: string;
  cpf: string;
  rg: string;
  orgaoEmissor: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  telefone: string;
  cnh: string;
  marca: string;
  modelo: string;
  ano: string;
  cor: string;
  placa: string;
  chassi: string;
  renavam: string;
}

export type ImportKind = "locador" | "cnh" | "comprovante" | "crlv";

export interface PendingImportReview {
  kind: ImportKind;
  fileName: string;
  fields: Partial<ExtractedDocumentFields>;
}

export const IMPORT_KIND_LABELS: Record<ImportKind, string> = {
  locador: "Documento do Locador",
  cnh: "CNH do Locatário",
  comprovante: "Comprovante de Residência",
  crlv: "CRLV do Veículo",
};

export const IMPORT_FIELD_LABELS: Record<keyof ExtractedDocumentFields, string> = {
  nome: "Nome",
  cpf: "CPF",
  rg: "RG",
  orgaoEmissor: "Órgão Emissor",
  endereco: "Endereço",
  cidade: "Cidade",
  estado: "Estado",
  cep: "CEP",
  telefone: "Telefone",
  cnh: "CNH",
  marca: "Marca",
  modelo: "Modelo",
  ano: "Ano",
  cor: "Cor",
  placa: "Placa",
  chassi: "Chassi",
  renavam: "RENAVAM",
};

export const IMPORT_FIELD_ORDER: Record<ImportKind, (keyof ExtractedDocumentFields)[]> = {
  locador: ["nome", "cpf", "rg", "orgaoEmissor", "telefone", "endereco", "cidade", "estado", "cep"],
  cnh: ["nome", "cpf", "rg", "orgaoEmissor", "estado", "telefone", "cnh"],
  comprovante: ["nome", "cpf", "telefone", "endereco", "cidade", "estado", "cep"],
  crlv: ["marca", "modelo", "ano", "cor", "placa", "chassi", "renavam"],
};

export const defaultLocador: LocadorData = {
  nome: "",
  nacionalidade: "brasileiro(a)",
  estadoCivil: "solteiro(a)",
  cpf: "",
  rg: "",
  orgaoEmissor: "",
  endereco: "",
  cidade: "Aparecida de Goiânia",
  estado: "Goiás",
  cep: "",
  telefone: "",
};

export const defaultLocatario: LocatarioData = {
  nome: "",
  nacionalidade: "brasileiro(a)",
  estadoCivil: "solteiro(a)",
  cpf: "",
  rg: "",
  orgaoEmissor: "",
  endereco: "",
  cidade: "",
  estado: "",
  cep: "",
  telefone: "",
  cnh: "",
};

export const defaultVeiculo: VeiculoData = {
  marca: "",
  modelo: "",
  ano: "",
  cor: "",
  placa: "",
  chassi: "",
  renavam: "",
};

export const defaultTermos: ContratoTermos = {
  localContrato: "Aparecida de Goiânia",
  dataContrato: new Date().toISOString().split("T")[0],
  dataInicio: "",
  dataFim: "",
  valorSemanal: "250,00",
  valorCaucao: "600,00",
  formaPagamento: "pagos toda segunda até às 18h",
  kmHodometro: "",
};

export const defaultImportState: Record<ImportKind, boolean> = {
  locador: false,
  cnh: false,
  comprovante: false,
  crlv: false,
};

export const defaultImportedFiles: Record<ImportKind, string> = {
  locador: "",
  cnh: "",
  comprovante: "",
  crlv: "",
};
