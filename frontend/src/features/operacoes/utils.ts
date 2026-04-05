export function formatDateBR(date: string | Date) {
  return new Date(date).toLocaleDateString("pt-BR");
}

export function parseCurrencyValue(value: number | string | null | undefined) {
  if (typeof value === "number") return value;
  if (value === null || value === undefined) return 0;

  const raw = String(value).trim();
  if (!raw) return 0;

  const normalized = raw.includes(",") ? raw.replace(/\./g, "").replace(",", ".") : raw;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatCurrencyBR(value: number | string) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(parseCurrencyValue(value));
}

export function formatContratoCode(id: number) {
  return `CTR-${String(id).padStart(6, "0")}`;
}

export function formatMotoLabel(moto?: { marca?: string | null; modelo?: string | null; placa?: string | null }) {
  if (!moto) return "Moto";
  const name = [moto.marca, moto.modelo].filter(Boolean).join(" / ");
  return `${name || "Moto"} ${moto.placa ? `(${moto.placa})` : ""}`.trim();
}

export function calculateContratoTotal(valorSemanal: number | string, dataInicio: string | Date, dataFim: string | Date) {
  const inicio = new Date(dataInicio);
  const fim = new Date(dataFim);
  const weekly = typeof valorSemanal === "string" ? parseFloat(valorSemanal) : valorSemanal;
  const dias = Math.max(1, Math.ceil((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)));
  const semanas = Math.max(1, Math.ceil(dias / 7));
  return weekly * semanas;
}

export function formatDateInputValue(date: string | Date) {
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

export function addDays(date: string | Date, days: number) {
  const value = new Date(date);
  value.setDate(value.getDate() + days);
  return value;
}

export function getDaysOverdue(date: string | Date) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const vencimento = new Date(date);
  vencimento.setHours(0, 0, 0, 0);

  const diff = hoje.getTime() - vencimento.getTime();
  if (diff <= 0) return 0;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function isContratoExpired(dataFim: string | Date, status?: string) {
  if (status === "encerrado") return true;
  if (status === "cancelado") return false;

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const fim = new Date(dataFim);
  fim.setHours(0, 0, 0, 0);

  return fim < hoje;
}

export function getContratoStatusColor(status: string) {
  switch (status) {
    case "ativo":
      return "bg-green-100 text-green-800";
    case "encerrado":
      return "bg-gray-100 text-gray-800";
    case "cancelado":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function getPagamentoStatusColor(status: string) {
  switch (status) {
    case "pago":
      return "bg-green-100 text-green-800";
    case "pendente":
      return "bg-yellow-100 text-yellow-800";
    case "atrasado":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}
