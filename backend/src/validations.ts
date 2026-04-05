import { z } from "zod";

/**
 * Validações de CPF
 */
export function validarCPF(cpf: string): boolean {
  const cpfLimpo = cpf.replace(/\D/g, "");

  if (cpfLimpo.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpfLimpo)) return false;

  let soma = 0;
  let resto;

  for (let i = 1; i <= 9; i++) {
    soma += parseInt(cpfLimpo.substring(i - 1, i)) * (11 - i);
  }

  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfLimpo.substring(9, 10))) return false;

  soma = 0;
  for (let i = 1; i <= 10; i++) {
    soma += parseInt(cpfLimpo.substring(i - 1, i)) * (12 - i);
  }

  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfLimpo.substring(10, 11))) return false;

  return true;
}

/**
 * Validações de CNH
 */
export function validarCNH(cnh: string): boolean {
  const cnhLimpo = cnh.replace(/\D/g, "");
  return cnhLimpo.length === 11 && /^\d{11}$/.test(cnhLimpo);
}

/**
 * Validações de CEP
 */
export function validarCEP(cep: string): boolean {
  const cepLimpo = cep.replace(/\D/g, "");
  return cepLimpo.length === 8;
}

/**
 * Validações de telefone com DDD
 */
export function validarTelefone(telefone: string): boolean {
  const telefoneLimpo = telefone.replace(/\D/g, "");
  return telefoneLimpo.length === 10 || telefoneLimpo.length === 11;
}

/**
 * Validações de placa Mercosul / antiga
 */
export function validarPlaca(placa: string): boolean {
  const placaLimpa = placa.replace(/\s/g, "").toUpperCase();
  return /^[A-Z]{3}-\d{4}$|^[A-Z]{3}\d[A-Z]\d{2}$/.test(placaLimpa);
}

/**
 * Validações de chassi
 */
export function validarChassi(chassi: string): boolean {
  const chassiLimpo = chassi.replace(/\s/g, "").toUpperCase();
  return /^[A-HJ-NPR-Z0-9]{17}$/.test(chassiLimpo);
}

/**
 * Validações de RENAVAM
 */
export function validarRenavam(renavam: string): boolean {
  const renavamLimpo = renavam.replace(/\D/g, "");
  return renavamLimpo.length >= 9 && renavamLimpo.length <= 11;
}

/**
 * Validar se moto está disponível para aluguel
 */
export function motoDisponivel(status: string): boolean {
  return status === "disponivel";
}

/**
 * Validar período de contrato
 */
export function validarPeriodoContrato(
  dataInicio: Date,
  dataFim: Date
): boolean {
  return dataFim > dataInicio;
}

/**
 * Calcular dias de aluguel
 */
export function calcularDiasAluguel(dataInicio: Date, dataFim: Date): number {
  const umDia = 24 * 60 * 60 * 1000;
  return Math.ceil((dataFim.getTime() - dataInicio.getTime()) / umDia);
}

/**
 * Calcular valor total do contrato
 */
export function calcularValorTotal(
  valorSemanal: number,
  dataInicio: Date,
  dataFim: Date
): number {
  const dias = calcularDiasAluguel(dataInicio, dataFim);
  const semanas = Math.max(1, Math.ceil(dias / 7));
  return semanas * valorSemanal;
}

/**
 * Calcular multa por atraso
 */
export function calcularMultaAtraso(
  valorSemanal: number,
  diasAtraso: number
): number {
  const percentualMulta = 0.1; // 10% por dia de atraso
  const valorBaseDiario = valorSemanal / 7;
  return valorBaseDiario * diasAtraso * percentualMulta;
}

/**
 * Verificar se contrato está próximo do vencimento (3 dias)
 */
export function contratoProximoVencimento(dataFim: Date): boolean {
  const hoje = new Date();
  const tresDias = 3 * 24 * 60 * 60 * 1000;
  const diferenca = dataFim.getTime() - hoje.getTime();
  return diferenca > 0 && diferenca <= tresDias;
}

/**
 * Verificar se pagamento está atrasado
 */
export function pagamentoAtrasado(dataPagamento: Date): boolean {
  const hoje = new Date();
  return dataPagamento < hoje;
}

/**
 * Schemas Zod para validação de entrada
 */

export const createMotoSchema = z.object({
  marca: z.string().min(2, "Marca é obrigatória"),
  modelo: z.string().min(3, "Modelo é obrigatório"),
  placa: z.string().min(1, "Placa é obrigatória").refine(validarPlaca, "Placa inválida"),
  ano: z.number().int().min(1900).max(new Date().getFullYear()),
  anoModelo: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  cor: z.string().min(2, "Cor é obrigatória"),
  chassi: z.string().refine(validarChassi, "Chassi inválido"),
  renavam: z.string().refine(validarRenavam, "RENAVAM inválido"),
});

export const createClienteSchema = z.object({
  nome: z.string().min(3, "Nome é obrigatório"),
  cpf: z.string().refine(validarCPF, "CPF inválido"),
  cnh: z.string().refine(validarCNH, "CNH inválida"),
  rg: z.string().min(4, "RG é obrigatório"),
  orgaoEmissor: z.string().min(2, "Órgão emissor é obrigatório"),
  nacionalidade: z.string().min(2, "Nacionalidade é obrigatória"),
  estadoCivil: z.string().min(2, "Estado civil é obrigatório"),
  endereco: z.string().min(8, "Endereço é obrigatório"),
  cidade: z.string().min(2, "Cidade é obrigatória"),
  estado: z.string().min(2, "Estado é obrigatório"),
  cep: z.string().refine(validarCEP, "CEP inválido"),
  email: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().email("Email inválido").optional()
  ),
  telefone: z.string().refine(validarTelefone, "Telefone inválido"),
});

export const createLocadorSchema = z.object({
  nome: z.string().min(3, "Nome é obrigatório"),
  cpf: z.string().refine(validarCPF, "CPF inválido"),
  rg: z.string().min(4, "RG é obrigatório"),
  orgaoEmissor: z.string().min(2, "Órgão emissor é obrigatório"),
  nacionalidade: z.string().min(2, "Nacionalidade é obrigatória"),
  estadoCivil: z.string().min(2, "Estado civil é obrigatório"),
  endereco: z.string().min(8, "Endereço é obrigatório"),
  cidade: z.string().min(2, "Cidade é obrigatória"),
  estado: z.string().min(2, "Estado é obrigatório"),
  cep: z.string().refine(validarCEP, "CEP inválido"),
  telefone: z.string().refine(validarTelefone, "Telefone inválido"),
});

export const createContratoSchema = z.object({
  locadorIds: z.array(z.number().int().positive()).min(1, "Selecione ao menos um locador"),
  locatarioId: z.number().int().positive(),
  motoId: z.number().int().positive(),
  dataInicio: z.coerce.date(),
  dataFim: z.coerce.date(),
  valorSemanal: z.number().positive("Valor semanal deve ser positivo"),
  diasAposFim: z.coerce.number().int().min(0, "Os dias devem ser zero ou mais"),
});

export const createManutencaoSchema = z.object({
  contratoId: z.number().int().positive().optional(),
  motoId: z.number().int().positive(),
  peca: z.string().min(2, "Peça é obrigatória"),
  tipo: z.string().min(1, "Tipo de manutenção é obrigatório"),
  data: z.coerce.date(),
  custo: z.number().positive("Custo deve ser positivo"),
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

export const createTipoManutencaoSchema = z.object({
  nome: z.string().min(2, "Nome do tipo é obrigatório"),
  descricao: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().max(240, "Descrição muito longa").optional(),
  ),
  intervaloDiasPadrao: z
    .preprocess(
      (value) => (value === "" || value === null || value === undefined ? undefined : value),
      z.coerce.number().int().positive().optional(),
    )
    .optional(),
});

export const createPecaSchema = z.object({
  nome: z.string().min(2, "Nome da peça é obrigatório"),
  descricao: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().max(240, "Descrição muito longa").optional(),
  ),
});

export const createPagamentoSchema = z.object({
  contratoId: z.number().int().positive().optional(),
  motoId: z.number().int().positive().optional(),
  manutencaoId: z.number().int().positive().optional(),
  tipo: z.enum(["receber", "pagar"]).default("receber"),
  origem: z.enum(["manual", "contrato", "manutencao"]).default("manual"),
  descricao: z.string().trim().optional(),
  valor: z.number().positive("Valor deve ser positivo"),
  data: z.coerce.date(),
  status: z.enum(["pendente", "pago", "atrasado"]),
});

export const createMultaSchema = z.object({
  contratoId: z.number().int().positive(),
  motoId: z.number().int().positive().optional(),
  tipo: z.enum(["multa", "prejuizo"]),
  responsavel: z.string().trim().min(2, "Informe quem gerou a ocorrência"),
  descricao: z.string().trim().min(3, "Descreva a multa ou prejuízo"),
  data: z.coerce.date(),
  valor: z.number().positive("Valor deve ser positivo"),
  status: z.enum(["pendente", "pago", "descontado_caucao"]),
  observacao: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().trim().optional(),
  ),
});

export const updateMotoSchema = z.object({
  marca: z.string().min(2, "Marca inválida").optional(),
  modelo: z.string().min(3, "Modelo inválido").optional(),
  placa: z.string().refine(validarPlaca, "Placa inválida").optional(),
  ano: z.number().int().optional(),
  anoModelo: z.number().int().optional(),
  cor: z.string().min(2, "Cor inválida").optional(),
  chassi: z.string().refine(validarChassi, "Chassi inválido").optional(),
  renavam: z.string().refine(validarRenavam, "RENAVAM inválido").optional(),
  status: z.enum(["disponivel", "alugada", "manutencao"]).optional(),
  disponibilidadeManual: z.enum(["automatico", "disponivel", "indisponivel"]).optional(),
});

export const updateClienteSchema = z.object({
  nome: z.string().min(3, "Nome inválido").optional(),
  rg: z.string().min(4, "RG inválido").optional(),
  orgaoEmissor: z.string().min(2, "Órgão emissor inválido").optional(),
  nacionalidade: z.string().min(2, "Nacionalidade inválida").optional(),
  estadoCivil: z.string().min(2, "Estado civil inválido").optional(),
  endereco: z.string().min(8, "Endereço inválido").optional(),
  cidade: z.string().min(2, "Cidade inválida").optional(),
  estado: z.string().min(2, "Estado inválido").optional(),
  cep: z.string().refine(validarCEP, "CEP inválido").optional(),
  email: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().email("Email inválido").optional()
  ),
  telefone: z.string().refine(validarTelefone, "Telefone inválido").optional(),
});

export const updateLocadorSchema = z.object({
  nome: z.string().min(3, "Nome inválido").optional(),
  rg: z.string().min(4, "RG inválido").optional(),
  orgaoEmissor: z.string().min(2, "Órgão emissor inválido").optional(),
  nacionalidade: z.string().min(2, "Nacionalidade inválida").optional(),
  estadoCivil: z.string().min(2, "Estado civil inválido").optional(),
  endereco: z.string().min(8, "Endereço inválido").optional(),
  cidade: z.string().min(2, "Cidade inválida").optional(),
  estado: z.string().min(2, "Estado inválido").optional(),
  cep: z.string().refine(validarCEP, "CEP inválido").optional(),
  telefone: z.string().refine(validarTelefone, "Telefone inválido").optional(),
});

export const updateContratoSchema = z.object({
  locadorIds: z.array(z.number().int().positive()).min(1, "Selecione ao menos um locador").optional(),
  locatarioId: z.number().int().positive().optional(),
  motoId: z.number().int().positive().optional(),
  dataInicio: z.coerce.date().optional(),
  status: z.enum(["ativo", "encerrado", "cancelado"]).optional(),
  dataFim: z.coerce.date().optional(),
  valorSemanal: z.number().positive("Valor semanal deve ser positivo").optional(),
  diasAposFim: z.coerce.number().int().min(0, "Os dias devem ser zero ou mais").optional(),
});

export const updatePagamentoSchema = z.object({
  contratoId: z.number().int().positive().nullable().optional(),
  motoId: z.number().int().positive().optional(),
  status: z.enum(["pendente", "pago", "atrasado"]).optional(),
  valor: z.number().positive().optional().transform((v) => v?.toString()),
  descricao: z.string().trim().optional(),
  data: z.coerce.date().optional(),
});

export const updateManutencaoSchema = z.object({
  contratoId: z.number().int().positive().nullable().optional(),
  motoId: z.number().int().positive().optional(),
  peca: z.string().min(2, "Peça é obrigatória").optional(),
  tipo: z.string().min(1, "Tipo de manutenção é obrigatório").optional(),
  data: z.coerce.date().optional(),
  custo: z.number().positive("Custo deve ser positivo").optional(),
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

export const updateMultaSchema = z.object({
  contratoId: z.number().int().positive().optional(),
  motoId: z.number().int().positive().optional(),
  tipo: z.enum(["multa", "prejuizo"]).optional(),
  responsavel: z.string().trim().min(2, "Informe quem gerou a ocorrência").optional(),
  descricao: z.string().trim().min(3, "Descreva a multa ou prejuízo").optional(),
  data: z.coerce.date().optional(),
  valor: z.number().positive("Valor deve ser positivo").optional(),
  status: z.enum(["pendente", "pago", "descontado_caucao"]).optional(),
  observacao: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().trim().optional(),
  ),
});

export const updateTipoManutencaoSchema = z.object({
  nome: z.string().min(2, "Nome do tipo inválido").optional(),
  descricao: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().max(240, "Descrição muito longa").optional(),
  ),
  intervaloDiasPadrao: z
    .preprocess(
      (value) => (value === "" || value === null || value === undefined ? undefined : value),
      z.coerce.number().int().positive().optional(),
    )
    .optional(),
});

export const updatePecaSchema = z.object({
  nome: z.string().min(2, "Nome da peça inválido").optional(),
  descricao: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().max(240, "Descrição muito longa").optional(),
  ),
});
