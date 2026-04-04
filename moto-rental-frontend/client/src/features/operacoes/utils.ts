export function formatDateBR(date: string | Date) {
  return new Date(date).toLocaleDateString("pt-BR");
}

export function formatCurrencyBR(value: number | string) {
  const amount = typeof value === "string" ? parseFloat(value) : value;
  return `R$ ${amount.toFixed(2)}`;
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
