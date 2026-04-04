import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../../_core/trpc";
import * as validations from "../../validations";
import * as locadoresService from "./locadores.service";

export const locadoresRouter = router({
  create: protectedProcedure
    .input(validations.createLocadorSchema)
    .mutation(async ({ input }) => {
      return locadoresService.createLocador({
        nome: input.nome,
        cpf: input.cpf,
        rg: input.rg,
        orgaoEmissor: input.orgaoEmissor,
        nacionalidade: input.nacionalidade,
        estadoCivil: input.estadoCivil,
        endereco: input.endereco,
        cidade: input.cidade,
        estado: input.estado,
        cep: input.cep,
        telefone: input.telefone,
      });
    }),

  list: publicProcedure.query(async () => {
    return locadoresService.listLocadores();
  }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return locadoresService.getLocadorById(input.id);
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        data: validations.updateLocadorSchema,
      }),
    )
    .mutation(async ({ input }) => {
      return locadoresService.updateLocador(input.id, input.data);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return locadoresService.deleteLocador(input.id);
    }),
});