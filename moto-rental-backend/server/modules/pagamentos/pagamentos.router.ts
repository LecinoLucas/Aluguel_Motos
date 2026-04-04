import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../../_core/trpc";
import * as validations from "../../validations";
import * as pagamentosService from "./pagamentos.service";

export const pagamentosRouter = router({
  create: protectedProcedure
    .input(validations.createPagamentoSchema)
    .mutation(async ({ input }) => {
      return pagamentosService.createPagamento(input);
    }),

  list: publicProcedure
    .input(
      z.object({
        status: z.enum(["pendente", "pago", "atrasado"]).optional(),
      }),
    )
    .query(async ({ input }) => {
      return pagamentosService.listPagamentos(input.status);
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return pagamentosService.getPagamentoById(input.id);
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        data: validations.updatePagamentoSchema,
      }),
    )
    .mutation(async ({ input }) => {
      return pagamentosService.updatePagamento(input.id, input.data);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return pagamentosService.deletePagamento(input.id);
    }),

  getByContrato: publicProcedure
    .input(z.object({ contratoId: z.number() }))
    .query(async ({ input }) => {
      return pagamentosService.getPagamentosByContrato(input.contratoId);
    }),

  getByPeriodo: publicProcedure
    .input(
      z.object({
        dataInicio: z.coerce.date(),
        dataFim: z.coerce.date(),
      }),
    )
    .query(async ({ input }) => {
      return pagamentosService.getPagamentosByPeriodo(input.dataInicio, input.dataFim);
    }),
});