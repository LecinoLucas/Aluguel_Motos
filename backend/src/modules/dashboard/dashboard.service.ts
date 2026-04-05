import * as contratosService from "../contratos/contratos.service";
import * as motosService from "../motos/motos.service";
import * as pagamentosService from "../pagamentos/pagamentos.service";

function toNumber(value: number | string) {
  return typeof value === "number" ? value : Number(value);
}

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthLabel(date: Date) {
  return date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
}

function getOrigemLabel(origem?: string | null) {
  if (origem === "manutencao") return "Manutenção";
  if (origem === "contrato") return "Contrato";
  return "Manual";
}

export async function getMetricas() {
  const motos = await motosService.listMotos();
  const motosDisponiveis = motos.filter((m: any) => m.status === "disponivel").length;

  const contratos = await contratosService.listContratos();
  const contratosAtivos = contratos.filter((c: any) => c.status === "ativo").length;

  const pagamentos = await pagamentosService.listPagamentos();
  const recebimentos = pagamentos.filter((p: any) => p.tipo === "receber");
  const despesas = pagamentos.filter((p: any) => p.tipo === "pagar");
  const pagamentosPendentes = recebimentos.filter((p: any) => p.status !== "pago").length;
  const contasPagarPendentes = despesas.filter((p: any) => p.status !== "pago").length;

  const receitaTotal = recebimentos
    .filter((p: any) => p.status === "pago")
    .reduce((acc: number, p: any) => acc + toNumber(p.valor), 0);

  const despesaTotal = despesas
    .filter((p: any) => p.status === "pago")
    .reduce((acc: number, p: any) => acc + toNumber(p.valor), 0);

  const receberEmAberto = recebimentos
    .filter((p: any) => p.status !== "pago")
    .reduce((acc: number, p: any) => acc + toNumber(p.valor), 0);

  const pagarEmAberto = despesas
    .filter((p: any) => p.status !== "pago")
    .reduce((acc: number, p: any) => acc + toNumber(p.valor), 0);

  const lucroReal = receitaTotal - despesaTotal;
  const saldoProjetado = receberEmAberto - pagarEmAberto;
  const margemReal = receitaTotal > 0 ? (lucroReal / receitaTotal) * 100 : 0;

  return {
    motosDisponiveis,
    contratosAtivos,
    pagamentosPendentes,
    contasPagarPendentes,
    receitaTotal,
    despesaTotal,
    lucroReal,
    receberEmAberto,
    pagarEmAberto,
    saldoProjetado,
    margemReal,
  };
}

export async function getReceitaMensal() {
  const hoje = new Date();
  const umAnoAtras = new Date(hoje.getFullYear() - 1, hoje.getMonth(), 1);
  const pagamentos = (await pagamentosService.getPagamentosByPeriodo(umAnoAtras, hoje)).filter((p: any) => p.tipo === "receber");

  const receitaPorMes: Record<string, number> = {};

  pagamentos.forEach((p: any) => {
    if (p.status === "pago") {
      const data = new Date(p.data);
      const mes = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;
      receitaPorMes[mes] = (receitaPorMes[mes] || 0) + parseFloat(p.valor.toString());
    }
  });

  return receitaPorMes;
}

export async function getFluxoMensal() {
  const hoje = new Date();
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 11, 1);
  const pagamentos = await pagamentosService.getPagamentosByPeriodo(inicio, hoje);

  const meses = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(inicio.getFullYear(), inicio.getMonth() + index, 1);
    return {
      key: getMonthKey(date),
      mes: getMonthLabel(date),
      receita: 0,
      despesa: 0,
      lucro: 0,
    };
  });

  const mesesPorChave = new Map(meses.map((item) => [item.key, item]));

  pagamentos.forEach((pagamento: any) => {
    if (pagamento.status !== "pago") return;
    const data = new Date(pagamento.data);
    const bucket = mesesPorChave.get(getMonthKey(data));
    if (!bucket) return;

    if (pagamento.tipo === "receber") {
      bucket.receita += toNumber(pagamento.valor);
    } else if (pagamento.tipo === "pagar") {
      bucket.despesa += toNumber(pagamento.valor);
    }
  });

  return meses.map((item) => ({
    ...item,
    lucro: item.receita - item.despesa,
  }));
}

export async function getDespesasPorOrigem() {
  const pagamentos = await pagamentosService.listPagamentos(undefined, "pagar");
  const grouped = new Map<
    string,
    {
      origem: string;
      label: string;
      total: number;
      pago: number;
      pendente: number;
      quantidade: number;
    }
  >();

  pagamentos.forEach((pagamento: any) => {
    const origem = pagamento.origem || "manual";
    const current = grouped.get(origem) ?? {
      origem,
      label: getOrigemLabel(origem),
      total: 0,
      pago: 0,
      pendente: 0,
      quantidade: 0,
    };
    const valor = toNumber(pagamento.valor);
    current.total += valor;
    current.quantidade += 1;
    if (pagamento.status === "pago") {
      current.pago += valor;
    } else {
      current.pendente += valor;
    }
    grouped.set(origem, current);
  });

  return Array.from(grouped.values()).sort((left, right) => right.total - left.total);
}

export async function getRentabilidadePorMoto() {
  const [motos, contratos, pagamentos] = await Promise.all([
    motosService.listMotos(),
    contratosService.listContratos(),
    pagamentosService.listPagamentos(),
  ]);

  const contratosAtivosPorMoto = new Map<number, number>();
  contratos.forEach((contrato: any) => {
    if (contrato.status !== "ativo") return;
    contratosAtivosPorMoto.set(contrato.motoId, (contratosAtivosPorMoto.get(contrato.motoId) ?? 0) + 1);
  });

  const rows = motos.map((moto: any) => {
    const pagamentosMoto = pagamentos.filter((pagamento: any) => pagamento.motoId === moto.id);
    const recebimentosPagos = pagamentosMoto
      .filter((pagamento: any) => pagamento.tipo === "receber" && pagamento.status === "pago")
      .reduce((acc: number, pagamento: any) => acc + toNumber(pagamento.valor), 0);
    const despesasPagas = pagamentosMoto
      .filter((pagamento: any) => pagamento.tipo === "pagar" && pagamento.status === "pago")
      .reduce((acc: number, pagamento: any) => acc + toNumber(pagamento.valor), 0);
    const receberAberto = pagamentosMoto
      .filter((pagamento: any) => pagamento.tipo === "receber" && pagamento.status !== "pago")
      .reduce((acc: number, pagamento: any) => acc + toNumber(pagamento.valor), 0);
    const pagarAberto = pagamentosMoto
      .filter((pagamento: any) => pagamento.tipo === "pagar" && pagamento.status !== "pago")
      .reduce((acc: number, pagamento: any) => acc + toNumber(pagamento.valor), 0);
    const lucroReal = recebimentosPagos - despesasPagas;
    const saldoProjetado = receberAberto - pagarAberto;
    const margemReal = recebimentosPagos > 0 ? (lucroReal / recebimentosPagos) * 100 : 0;

    return {
      motoId: moto.id,
      marca: moto.marca,
      modelo: moto.modelo,
      placa: moto.placa,
      status: moto.status,
      contratosAtivos: contratosAtivosPorMoto.get(moto.id) ?? 0,
      receitaRecebida: recebimentosPagos,
      despesaPaga: despesasPagas,
      lucroReal,
      receberAberto,
      pagarAberto,
      saldoProjetado,
      margemReal,
    };
  });

  return rows.sort(
    (
      left: (typeof rows)[number],
      right: (typeof rows)[number],
    ) =>
      right.lucroReal - left.lucroReal ||
      right.saldoProjetado - left.saldoProjetado ||
      left.motoId - right.motoId,
  );
}

export async function getContratosProximosVencimento() {
  const contratos = await contratosService.listContratos("ativo");
  const hoje = new Date();
  const tresDias = 3 * 24 * 60 * 60 * 1000;

  return contratos.filter((c: any) => {
    const dataFim = new Date(c.dataFim);
    const diferenca = dataFim.getTime() - hoje.getTime();
    return diferenca > 0 && diferenca <= tresDias;
  });
}

export async function getPagamentosAtrasados() {
  return pagamentosService.listPagamentos("atrasado", "receber");
}

export async function getContasPagarAtrasadas() {
  return pagamentosService.listPagamentos("atrasado", "pagar");
}
