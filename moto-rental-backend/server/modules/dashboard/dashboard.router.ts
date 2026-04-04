import { publicProcedure, router } from "../../_core/trpc";
import * as dashboardService from "./dashboard.service";

export const dashboardRouter = router({
  metricas: publicProcedure.query(async () => {
    return dashboardService.getMetricas();
  }),

  receitaMensal: publicProcedure.query(async () => {
    return dashboardService.getReceitaMensal();
  }),

  contratosProximosVencimento: publicProcedure.query(async () => {
    return dashboardService.getContratosProximosVencimento();
  }),

  pagamentosAtrasados: publicProcedure.query(async () => {
    return dashboardService.getPagamentosAtrasados();
  }),
});