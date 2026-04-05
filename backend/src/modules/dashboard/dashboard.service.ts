import * as contratosService from "../contratos/contratos.service";
import * as motosService from "../motos/motos.service";
import * as pagamentosService from "../pagamentos/pagamentos.service";

export async function getMetricas() {
  const motos = await motosService.listMotos();
  const motosDisponiveis = motos.filter((m: any) => m.status === "disponivel").length;

  const contratos = await contratosService.listContratos();
  const contratosAtivos = contratos.filter((c: any) => c.status === "ativo").length;

  const pagamentos = await pagamentosService.listPagamentos();
  const pagamentosPendentes = pagamentos.filter((p: any) => p.status === "pendente").length;

  const receitaTotal = pagamentos
    .filter((p: any) => p.status === "pago")
    .reduce((acc: number, p: any) => acc + parseFloat(p.valor.toString()), 0);

  return {
    motosDisponiveis,
    contratosAtivos,
    pagamentosPendentes,
    receitaTotal,
  };
}

export async function getReceitaMensal() {
  const hoje = new Date();
  const umAnoAtras = new Date(hoje.getFullYear() - 1, hoje.getMonth(), 1);
  const pagamentos = await pagamentosService.getPagamentosByPeriodo(umAnoAtras, hoje);

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
  const pagamentos = await pagamentosService.listPagamentos("pendente");
  const hoje = new Date();

  return pagamentos.filter((p: any) => {
    const data = new Date(p.data);
    return data < hoje;
  });
}