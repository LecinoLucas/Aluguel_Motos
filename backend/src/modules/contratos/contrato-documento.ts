import type { ContratoDocumentoSnapshot } from "../../../drizzle/schema";

const DEFAULT_LOCAL_CONTRATO = "Aparecida de Goiânia";
const DEFAULT_VALOR_CAUSAO = "600,00";
const DEFAULT_FORMA_PAGAMENTO = "pagos toda segunda até às 18h";

interface LocadorInput {
  nome?: string | null;
  nacionalidade?: string | null;
  estadoCivil?: string | null;
  cpf?: string | null;
  rg?: string | null;
  orgaoEmissor?: string | null;
  endereco?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
  telefone?: string | null;
}

interface LocatarioInput extends LocadorInput {
  cnh?: string | null;
}

interface MotoInput {
  marca?: string | null;
  modelo?: string | null;
  ano?: number | null;
  anoModelo?: number | null;
  cor?: string | null;
  placa?: string | null;
  chassi?: string | null;
  renavam?: string | null;
}

function formatDateInputValue(date: string | Date) {
  if (typeof date === "string") {
    const normalized = date.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
    if (normalized) return normalized;
  }

  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return "";
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseMoneyInput(value: number | string) {
  if (typeof value === "number") return value;

  const raw = value.trim();
  if (!raw) return Number.NaN;

  if (raw.includes(",")) {
    return Number(raw.replace(/\./g, "").replace(",", "."));
  }

  const parts = raw.split(".");
  if (parts.length > 2) {
    return Number(parts.join(""));
  }

  return Number(raw);
}

function formatMoneyForContract(value: number | string) {
  const amount = parseMoneyInput(value);
  if (Number.isNaN(amount)) return typeof value === "string" ? value : String(value);
  return amount.toFixed(2).replace(".", ",");
}

function formatVehicleYear(ano?: number | null, anoModelo?: number | null) {
  if (ano && anoModelo && ano !== anoModelo) return `${ano}/${anoModelo}`;
  if (anoModelo) return String(anoModelo);
  if (ano) return String(ano);
  return "";
}

export function buildContratoDocumentoSnapshot(input: {
  locadores: LocadorInput[];
  locatario: LocatarioInput;
  moto: MotoInput;
  dataInicio: Date;
  dataFim: Date;
  valorSemanal: number | string;
  dataContrato: Date;
  previousSnapshot?: ContratoDocumentoSnapshot | null;
}) {
  const previousTerms = input.previousSnapshot?.termos;

  return {
    locadores: input.locadores.map((locador) => ({
      nome: locador.nome ?? "",
      nacionalidade: locador.nacionalidade ?? "brasileiro(a)",
      estadoCivil: locador.estadoCivil ?? "solteiro(a)",
      cpf: locador.cpf ?? "",
      rg: locador.rg ?? "",
      orgaoEmissor: locador.orgaoEmissor ?? "",
      endereco: locador.endereco ?? "",
      cidade: locador.cidade ?? DEFAULT_LOCAL_CONTRATO,
      estado: locador.estado ?? "Goiás",
      cep: locador.cep ?? "",
      telefone: locador.telefone ?? "",
    })),
    locatario: {
      nome: input.locatario.nome ?? "",
      nacionalidade: input.locatario.nacionalidade ?? "brasileiro(a)",
      estadoCivil: input.locatario.estadoCivil ?? "solteiro(a)",
      cpf: input.locatario.cpf ?? "",
      rg: input.locatario.rg ?? "",
      orgaoEmissor: input.locatario.orgaoEmissor ?? "",
      endereco: input.locatario.endereco ?? "",
      cidade: input.locatario.cidade ?? "",
      estado: input.locatario.estado ?? "",
      cep: input.locatario.cep ?? "",
      telefone: input.locatario.telefone ?? "",
      cnh: input.locatario.cnh ?? "",
    },
    veiculo: {
      marca: input.moto.marca ?? "",
      modelo: input.moto.modelo ?? "",
      ano: formatVehicleYear(input.moto.ano, input.moto.anoModelo),
      cor: input.moto.cor ?? "",
      placa: input.moto.placa ?? "",
      chassi: input.moto.chassi ?? "",
      renavam: input.moto.renavam ?? "",
    },
    termos: {
      localContrato: previousTerms?.localContrato || input.locadores[0]?.cidade || DEFAULT_LOCAL_CONTRATO,
      dataContrato: previousTerms?.dataContrato || formatDateInputValue(input.dataContrato),
      dataInicio: formatDateInputValue(input.dataInicio),
      dataFim: formatDateInputValue(input.dataFim),
      valorSemanal: formatMoneyForContract(input.valorSemanal),
      valorCaucao: previousTerms?.valorCaucao || DEFAULT_VALOR_CAUSAO,
      formaPagamento: previousTerms?.formaPagamento || DEFAULT_FORMA_PAGAMENTO,
      kmHodometro: previousTerms?.kmHodometro || "",
    },
  } satisfies ContratoDocumentoSnapshot;
}
