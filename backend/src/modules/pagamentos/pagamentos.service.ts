import { TRPCError } from "@trpc/server";
import * as contratosService from "../contratos/contratos.service";
import * as pagamentosRepository from "./pagamentos.repository";

export async function createPagamento(input: {
  contratoId: number;
  valor: number;
  data: Date;
  status: "pendente" | "pago" | "atrasado";
}) {
  await contratosService.getContratoById(input.contratoId);

  await pagamentosRepository.createPagamento({
    contratoId: input.contratoId,
    valor: input.valor.toString(),
    data: input.data,
    status: input.status,
  } as any);

  return { success: true } as const;
}

export async function listPagamentos(status?: string) {
  return pagamentosRepository.listPagamentos(status);
}

export async function getPagamentoById(id: number) {
  const pagamento = await pagamentosRepository.getPagamentoById(id);
  if (!pagamento) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Pagamento não encontrado",
    });
  }
  return pagamento;
}

export async function updatePagamento(id: number, data: { status?: "pendente" | "pago" | "atrasado"; valor?: string }) {
  await getPagamentoById(id);
  await pagamentosRepository.updatePagamento(id, data as any);
  return { success: true } as const;
}

export async function deletePagamento(id: number) {
  await getPagamentoById(id);
  await pagamentosRepository.deletePagamento(id);
  return { success: true } as const;
}

export async function getPagamentosByContrato(contratoId: number) {
  return pagamentosRepository.getPagamentosByContrato(contratoId);
}

export async function getPagamentosByPeriodo(dataInicio: Date, dataFim: Date) {
  return pagamentosRepository.getPagamentosByPeriodo(dataInicio, dataFim);
}