import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../../_core/trpc";
import * as validations from "../../validations";
import * as tiposManutencaoService from "./tipos-manutencao.service";

export const tiposManutencaoRouter = router({
  create: protectedProcedure
    .input(validations.createTipoManutencaoSchema)
    .mutation(async ({ input }) => {
      return tiposManutencaoService.createTipoManutencao({
        nome: input.nome,
        descricao: input.descricao,
        intervaloDiasPadrao: input.intervaloDiasPadrao,
      });
    }),

  list: publicProcedure.query(async () => {
    return tiposManutencaoService.listTiposManutencao();
  }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return tiposManutencaoService.getTipoManutencaoById(input.id);
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        data: validations.updateTipoManutencaoSchema,
      }),
    )
    .mutation(async ({ input }) => {
      return tiposManutencaoService.updateTipoManutencao(input.id, input.data);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return tiposManutencaoService.deleteTipoManutencao(input.id);
    }),
});
