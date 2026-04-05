import { publicProcedure, router } from "../../_core/trpc";
import * as dashboardService from "./dashboard.service";

export const dashboardRouter = router({
  metricas: publicProcedure.query(async () => {
    return dashboardService.getMetricas();
  }),

  receitaMensal: publicProcedure.query(async () => {
    return dashboardService.getReceitaMensal();
  }),

  fluxoMensal: publicProcedure.query(async () => {
    return dashboardService.getFluxoMensal();
  }),

  despesasPorOrigem: publicProcedure.query(async () => {
    return dashboardService.getDespesasPorOrigem();
  }),

  rentabilidadePorMoto: publicProcedure.query(async () => {
    return dashboardService.getRentabilidadePorMoto();
  }),

  contratosProximosVencimento: publicProcedure.query(async () => {
    return dashboardService.getContratosProximosVencimento();
  }),

  pagamentosAtrasados: publicProcedure.query(async () => {
    return dashboardService.getPagamentosAtrasados();
  }),

  contasPagarAtrasadas: publicProcedure.query(async () => {
    return dashboardService.getContasPagarAtrasadas();
  }),
});
