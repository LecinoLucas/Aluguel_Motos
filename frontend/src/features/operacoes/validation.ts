import { z } from "zod";

export const createContratoSchema = z.object({
  locadorIds: z.array(z.coerce.number().int().positive()).min(1, "Selecione ao menos um locador"),
  locatarioId: z.coerce.number().int().positive("Locatário é obrigatório"),
  motoId: z.coerce.number().int().positive("Veículo é obrigatório"),
  dataInicio: z.string().min(1, "Data de início é obrigatória"),
  dataFim: z.string().min(1, "Data de fim é obrigatória"),
  valorSemanal: z.coerce.number().positive("Valor semanal deve ser positivo"),
  diasAposFim: z.coerce.number().int().min(0, "Os dias devem ser zero ou mais"),
});

export type ContratoFormValues = z.infer<typeof createContratoSchema>;

export const createPagamentoSchema = z.object({
  contratoId: z.preprocess(
    (value) => (value === "" || value === null || value === undefined || Number(value) === 0 ? undefined : value),
    z.coerce.number().int().positive("Contrato inválido").optional(),
  ),
  motoId: z.preprocess(
    (value) => (value === "" || value === null || value === undefined || Number(value) === 0 ? undefined : value),
    z.coerce.number().int().positive("Moto inválida").optional(),
  ),
  tipo: z.enum(["receber", "pagar"]),
  descricao: z.string().optional(),
  valor: z.coerce.number().positive("Valor deve ser positivo"),
  data: z.string().min(1, "Data é obrigatória"),
  status: z.enum(["pendente", "pago", "atrasado"]),
});

export type PagamentoFormValues = z.infer<typeof createPagamentoSchema>;

export const createMultaSchema = z.object({
  contratoId: z.coerce.number().int().positive("Contrato é obrigatório"),
  tipo: z.enum(["multa", "prejuizo"]),
  responsavel: z.string().trim().min(2, "Informe quem gerou a ocorrência"),
  descricao: z.string().trim().min(3, "Descreva a multa ou prejuízo"),
  data: z.string().min(1, "Data é obrigatória"),
  valor: z.coerce.number().positive("Valor deve ser positivo"),
  status: z.enum(["pendente", "pago", "descontado_caucao"]),
  observacao: z.string().optional(),
});

export type MultaFormValues = z.infer<typeof createMultaSchema>;

export const createManutencaoSchema = z.object({
  contratoId: z.preprocess(
    (value) => (value === "" || value === null || value === undefined || Number(value) === 0 ? undefined : value),
    z.coerce.number().int().positive("Contrato inválido").optional(),
  ),
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
