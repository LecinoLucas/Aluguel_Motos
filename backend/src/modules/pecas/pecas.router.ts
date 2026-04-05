import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../../_core/trpc";
import * as validations from "../../validations";
import * as pecasService from "./pecas.service";

export const pecasRouter = router({
  create: protectedProcedure
    .input(validations.createPecaSchema)
    .mutation(async ({ input }) => {
      return pecasService.createPeca({
        nome: input.nome,
        descricao: input.descricao,
      });
    }),

  list: publicProcedure.query(async () => {
    return pecasService.listPecas();
  }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return pecasService.getPecaById(input.id);
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        data: validations.updatePecaSchema,
      }),
    )
    .mutation(async ({ input }) => {
      return pecasService.updatePeca(input.id, input.data);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return pecasService.deletePeca(input.id);
    }),
});
