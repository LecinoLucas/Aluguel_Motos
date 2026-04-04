import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../../_core/trpc";
import * as validations from "../../validations";
import * as contratosService from "./contratos.service";

export const contratosRouter = router({
  create: protectedProcedure
    .input(validations.createContratoSchema)
    .mutation(async ({ input }) => {
      return contratosService.createContrato(input);
    }),

  list: publicProcedure
    .input(
      z.object({
        status: z.enum(["ativo", "encerrado", "cancelado"]).optional(),
      }),
    )
    .query(async ({ input }) => {
      return contratosService.listContratos(input.status);
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return contratosService.getContratoById(input.id);
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        data: validations.updateContratoSchema,
      }),
    )
    .mutation(async ({ input }) => {
      return contratosService.updateContrato(input.id, input.data);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return contratosService.deleteContrato(input.id);
    }),
});