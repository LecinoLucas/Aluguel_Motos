import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../../_core/trpc";
import * as validations from "../../validations";
import * as multasService from "./multas.service";

export const multasRouter = router({
  create: protectedProcedure
    .input(validations.createMultaSchema)
    .mutation(async ({ input }) => {
      return multasService.createMulta(input);
    }),

  list: publicProcedure
    .input(
      z.object({
        status: z.enum(["pendente", "pago", "descontado_caucao"]).optional(),
        contratoId: z.number().optional(),
        tipo: z.enum(["multa", "prejuizo"]).optional(),
      }),
    )
    .query(async ({ input }) => {
      return multasService.listMultas(input);
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return multasService.getMultaById(input.id);
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        data: validations.updateMultaSchema,
      }),
    )
    .mutation(async ({ input }) => {
      return multasService.updateMulta(input.id, input.data);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return multasService.deleteMulta(input.id);
    }),

  getByContrato: publicProcedure
    .input(z.object({ contratoId: z.number() }))
    .query(async ({ input }) => {
      return multasService.getMultasByContrato(input.contratoId);
    }),
});
