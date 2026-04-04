import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { contratosRouter } from "./modules/contratos/contratos.router";
import { dashboardRouter } from "./modules/dashboard/dashboard.router";
import { documentosRouter } from "./modules/documentos/documentos.router";
import { manutencoesRouter } from "./modules/manutencoes/manutencoes.router";
import { pagamentosRouter } from "./modules/pagamentos/pagamentos.router";
import { systemRouter } from "./_core/systemRouter";
import { clientesRouter } from "./modules/clientes/clientes.router";
import { locadoresRouter } from "./modules/locadores/locadores.router";
import { motosRouter } from "./modules/motos/motos.router";
import { publicProcedure, router } from "./_core/trpc";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  documentos: documentosRouter,

  // ==================== MOTOS ====================
  motos: motosRouter,

  // ==================== CLIENTES ====================
  clientes: clientesRouter,

  // ==================== LOCADORES ====================
  locadores: locadoresRouter,

  // ==================== CONTRATOS ====================
  contratos: contratosRouter,

  // ==================== MANUTENÇÕES ====================
  manutencoes: manutencoesRouter,

  // ==================== PAGAMENTOS ====================
  pagamentos: pagamentosRouter,

  // ==================== DASHBOARD ====================
  dashboard: dashboardRouter,
});

export type AppRouter = typeof appRouter;
