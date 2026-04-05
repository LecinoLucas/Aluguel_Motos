import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../../_core/trpc";
import * as validations from "../../validations";
import * as clientesService from "./clientes.service";

export const clientesRouter = router({
  create: protectedProcedure
    .input(validations.createClienteSchema)
    .mutation(async ({ input }) => {
      return clientesService.createCliente({
        nome: input.nome,
        cpf: input.cpf,
        cnh: input.cnh,
        rg: input.rg,
        orgaoEmissor: input.orgaoEmissor,
        nacionalidade: input.nacionalidade,
        estadoCivil: input.estadoCivil,
        endereco: input.endereco,
        cidade: input.cidade,
        estado: input.estado,
        cep: input.cep,
        email: input.email,
        telefone: input.telefone,
      });
    }),

  list: publicProcedure.query(async () => {
    return clientesService.listClientes();
  }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return clientesService.getClienteById(input.id);
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        data: validations.updateClienteSchema,
      }),
    )
    .mutation(async ({ input }) => {
      return clientesService.updateCliente(input.id, input.data);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return clientesService.deleteCliente(input.id);
    }),

  searchByNome: publicProcedure
    .input(z.object({ nome: z.string() }))
    .query(async ({ input }) => {
      return clientesService.getClienteByNome(input.nome);
    }),
});