import { z } from "zod";

export const createContratoSchema = z.object({
  clienteId: z.coerce.number().int().positive("Cliente é obrigatório"),
  motoId: z.coerce.number().int().positive("Moto é obrigatória"),
  dataInicio: z.string().min(1, "Data de início é obrigatória"),
  dataFim: z.string().min(1, "Data de fim é obrigatória"),
  valorDiario: z.coerce.number().positive("Valor diário deve ser positivo"),
});

export type ContratoFormValues = z.infer<typeof createContratoSchema>;

export const createPagamentoSchema = z.object({
  contratoId: z.coerce.number().int().positive("Contrato é obrigatório"),
  valor: z.coerce.number().positive("Valor deve ser positivo"),
  data: z.string().min(1, "Data é obrigatória"),
  status: z.enum(["pendente", "pago", "atrasado"]),
});

export type PagamentoFormValues = z.infer<typeof createPagamentoSchema>;

export const createManutencaoSchema = z.object({
  motoId: z.coerce.number().int().positive("Moto é obrigatória"),
  peca: z.string().min(2, "Peça é obrigatória"),
  tipo: z.string().min(1, "Tipo de manutenção é obrigatório"),
  data: z.string().min(1, "Data é obrigatória"),
  custo: z.coerce.number().positive("Custo deve ser positivo"),
  kmAtual: z
    .preprocess(
      (value) => (value === "" || value === null || value === undefined ? undefined : value),
      z.coerce.number().int().positive().optional(),
    )
    .optional(),
  intervaloDiasPrevisto: z
    .preprocess(
      (value) => (value === "" || value === null || value === undefined ? undefined : value),
      z.coerce.number().int().positive().optional(),
    )
    .optional(),
  descricao: z.string().optional(),
});

export type ManutencaoFormValues = z.infer<typeof createManutencaoSchema>;
