import { TRPCError } from "@trpc/server";
import * as contratosService from "../contratos/contratos.service";
import * as motosRepository from "../motos/motos.repository";
import * as pagamentosRepository from "./pagamentos.repository";

function resolvePagamentoStatus<T extends { status: string; data: string | Date }>(pagamento: T) {
  if (pagamento.status === "pago") {
    return { ...pagamento, status: "pago" as const };
  }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const dataVencimento = new Date(pagamento.data);
  dataVencimento.setHours(0, 0, 0, 0);

  if (dataVencimento < hoje) {
    return { ...pagamento, status: "atrasado" as const };
  }

  return { ...pagamento, status: "pendente" as const };
}

export async function createPagamento(input: {
  contratoId?: number;
  motoId?: number;
  manutencaoId?: number;
  tipo: "receber" | "pagar";
  origem?: "manual" | "contrato" | "manutencao";
  descricao?: string;
  valor: number;
  data: Date;
  status: "pendente" | "pago" | "atrasado";
}) {
  let motoId = input.motoId;

  if (input.contratoId) {
    const contrato = await contratosService.getContratoById(input.contratoId);
    if (motoId && motoId !== contrato.motoId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "A moto informada não corresponde ao contrato selecionado.",
      });
    }
    motoId = motoId ?? contrato.motoId;
  }

  if (motoId) {
    const moto = await motosRepository.getMotoById(motoId);
    if (!moto) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Moto não encontrada",
      });
    }
  }

  if (!input.contratoId && !motoId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Informe um contrato ou uma moto para o lançamento.",
    });
  }

  await pagamentosRepository.createPagamento({
    contratoId: input.contratoId,
    motoId,
    manutencaoId: input.manutencaoId,
    tipo: input.tipo,
    origem: input.origem ?? "manual",
    descricao: input.descricao?.trim() || null,
    valor: input.valor.toString(),
    data: input.data,
    status: input.status,
  } as any);

  return { success: true } as const;
}

export async function listPagamentos(status?: string, tipo?: string) {
  const pagamentos = await pagamentosRepository.listPagamentos({ status, tipo });
  const normalizados = pagamentos.map((pagamento: any) => resolvePagamentoStatus(pagamento));
  return normalizados;
}

export async function getPagamentoById(id: number) {
  const pagamento = await pagamentosRepository.getPagamentoById(id);
  if (!pagamento) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Pagamento não encontrado",
    });
  }
  return resolvePagamentoStatus(pagamento);
}

export async function updatePagamento(
  id: number,
  data: {
    contratoId?: number | null;
    motoId?: number;
    status?: "pendente" | "pago" | "atrasado";
    valor?: string;
    descricao?: string;
    data?: Date;
  },
) {
  const pagamentoAtual = await getPagamentoById(id);
  const hasContratoUpdate = Object.prototype.hasOwnProperty.call(data, "contratoId");
  let motoId = data.motoId ?? pagamentoAtual.motoId ?? undefined;
  const contratoId = hasContratoUpdate ? data.contratoId ?? undefined : pagamentoAtual.contratoId ?? undefined;

  if (contratoId) {
    const contrato = await contratosService.getContratoById(contratoId);
    if (motoId && motoId !== contrato.motoId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "A moto informada não corresponde ao contrato selecionado.",
      });
    }
    motoId = motoId ?? contrato.motoId;
  }

  if (motoId) {
    const moto = await motosRepository.getMotoById(motoId);
    if (!moto) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Moto não encontrada",
      });
    }
  }

  await pagamentosRepository.updatePagamento(id, {
    ...data,
    contratoId,
    motoId,
    descricao: data.descricao?.trim() || data.descricao,
  } as any);
  return { success: true } as const;
}

export async function deletePagamento(id: number) {
  await getPagamentoById(id);
  await pagamentosRepository.deletePagamento(id);
  return { success: true } as const;
}

export async function getPagamentosByContrato(contratoId: number) {
  const pagamentos = await pagamentosRepository.getPagamentosByContrato(contratoId);
  return pagamentos.map((pagamento: any) => resolvePagamentoStatus(pagamento));
}

export async function getPagamentosByPeriodo(dataInicio: Date, dataFim: Date) {
  const pagamentos = await pagamentosRepository.getPagamentosByPeriodo(dataInicio, dataFim);
  return pagamentos.map((pagamento: any) => resolvePagamentoStatus(pagamento));
}

export async function getPagamentoByManutencaoId(manutencaoId: number) {
  const pagamento = await pagamentosRepository.getPagamentoByManutencaoId(manutencaoId);
  return pagamento ? resolvePagamentoStatus(pagamento) : undefined;
}
