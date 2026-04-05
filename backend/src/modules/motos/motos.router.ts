import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../../_core/trpc";
import * as validations from "../../validations";
import * as motosService from "./motos.service";

export const motosRouter = router({
  create: protectedProcedure
    .input(validations.createMotoSchema)
    .mutation(async ({ input }) => {
      return motosService.createMoto({
        marca: input.marca,
        modelo: input.modelo,
        placa: input.placa,
        ano: input.ano,
        anoModelo: input.anoModelo,
        cor: input.cor,
        chassi: input.chassi,
        renavam: input.renavam,
        status: "disponivel",
      });
    }),

  list: publicProcedure
    .input(
      z.object({
        status: z.enum(["disponivel", "alugada", "manutencao"]).optional(),
      }),
    )
    .query(async ({ input }) => {
      return motosService.listMotos(input.status);
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return motosService.getMotoById(input.id);
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        data: validations.updateMotoSchema,
      }),
    )
    .mutation(async ({ input }) => {
      return motosService.updateMoto(input.id, input.data);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return motosService.deleteMoto(input.id);
    }),
});