import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../../_core/trpc";
import * as validations from "../../validations";
import * as manutencoesService from "./manutencoes.service";

const updateManutencaoSchema = z.object({
  tipo: z.string().optional(),
  custo: z.number().optional().transform((value) => value?.toString()),
  descricao: z.string().optional(),
});

export const manutencoesRouter = router({
  create: protectedProcedure
    .input(validations.createManutencaoSchema)
    .mutation(async ({ input }) => {
      return manutencoesService.createManutencao(input);
    }),

  list: publicProcedure.query(async () => {
    return manutencoesService.listManutencoes();
  }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return manutencoesService.getManutencaoById(input.id);
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        data: updateManutencaoSchema,
      }),
    )
    .mutation(async ({ input }) => {
      return manutencoesService.updateManutencao(input.id, input.data);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return manutencoesService.deleteManutencao(input.id);
    }),

  getByMoto: publicProcedure
    .input(z.object({ motoId: z.number() }))
    .query(async ({ input }) => {
      return manutencoesService.getManutencoesByMoto(input.motoId);
    }),
});