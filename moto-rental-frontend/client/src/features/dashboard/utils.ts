export function formatCurrencyBR(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDateBR(date: string | Date) {
  return new Date(date).toLocaleDateString("pt-BR");
}

export function mapReceitaMensalChartData(receitaMensal: Record<string, number> | undefined) {
  if (!receitaMensal) {
    return [];
  }

  return Object.entries(receitaMensal).map(([mes, valor]) => ({
    mes,
    receita: valor,
  }));
}
