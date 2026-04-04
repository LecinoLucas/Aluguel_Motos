export interface LocadorFormData {
  nome: string;
  cpf: string;
  rg: string;
  orgaoEmissor: string;
  nacionalidade: string;
  estadoCivil: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  telefone: string;
}

export interface LocatarioFormData {
  nome: string;
  cpf: string;
  cnh: string;
  rg: string;
  orgaoEmissor: string;
  nacionalidade: string;
  estadoCivil: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  email: string;
  telefone: string;
}

export interface VeiculoFormData {
  marca: string;
  modelo: string;
  placa: string;
  ano: string;
  anoModelo: string;
  cor: string;
  chassi: string;
  renavam: string;
}

export type LocadorField = keyof LocadorFormData;
export type LocatarioField = keyof LocatarioFormData;
export type VeiculoField = keyof VeiculoFormData;

export type LocadorFormErrors = Partial<Record<LocadorField, string>>;
export type LocatarioFormErrors = Partial<Record<LocatarioField, string>>;
export type VeiculoFormErrors = Partial<Record<VeiculoField, string>>;

export interface LocadorRecord extends LocadorFormData {
  id: number;
}

export interface LocatarioRecord extends LocatarioFormData {
  id: number;
}

export interface VeiculoRecord {
  id: number;
  marca: string;
  modelo: string;
  placa: string;
  ano: number;
  anoModelo?: number | null;
  cor?: string | null;
  chassi?: string | null;
  renavam?: string | null;
  status: string;
}

export const defaultLocadorForm: LocadorFormData = {
  nome: "",
  cpf: "",
  rg: "",
  orgaoEmissor: "",
  nacionalidade: "brasileiro(a)",
  estadoCivil: "solteiro(a)",
  endereco: "",
  cidade: "",
  estado: "",
  cep: "",
  telefone: "",
};

export const defaultLocatarioForm: LocatarioFormData = {
  nome: "",
  cpf: "",
  cnh: "",
  rg: "",
  orgaoEmissor: "",
  nacionalidade: "brasileiro(a)",
  estadoCivil: "solteiro(a)",
  endereco: "",
  cidade: "",
  estado: "",
  cep: "",
  email: "",
  telefone: "",
};

export const defaultVeiculoForm: VeiculoFormData = {
  marca: "",
  modelo: "",
  placa: "",
  ano: "",
  anoModelo: "",
  cor: "",
  chassi: "",
  renavam: "",
};
