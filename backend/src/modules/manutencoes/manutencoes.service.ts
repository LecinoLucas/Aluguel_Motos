import { TRPCError } from "@trpc/server";
import * as contratosService from "../contratos/contratos.service";
import * as motosRepository from "../motos/motos.repository";
import * as pagamentosService from "../pagamentos/pagamentos.service";
import * as manutencoesRepository from "./manutencoes.repository";

export async function createManutencao(input: {
  contratoId?: number;
  motoId: number;
  peca: string;
  tipo: string;
  data: Date;
  custo: number;
  kmAtual?: number;
  intervaloDiasPrevisto?: number;
  descricao?: string;
}) {
  if (input.contratoId) {
    const contrato = await contratosService.getContratoById(input.contratoId);
    if (contrato.motoId !== input.motoId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "A moto informada não corresponde ao contrato selecionado.",
      });
    }
  }

  const moto = await motosRepository.getMotoById(input.motoId);
  if (!moto) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Moto não encontrada",
    });
  }

  const manutencao = await manutencoesRepository.createManutencao({
    contratoId: input.contratoId,
    motoId: input.motoId,
    peca: input.peca.trim(),
    tipo: input.tipo,
    data: input.data,
    custo: input.custo.toString(),
    kmAtual: input.kmAtual,
    intervaloDiasPrevisto: input.intervaloDiasPrevisto,
    descricao: input.descricao,
  } as any);

  await pagamentosService.createPagamento({
    contratoId: input.contratoId,
    motoId: input.motoId,
    manutencaoId: manutencao.id,
    tipo: "pagar",
    origem: "manutencao",
    descricao: [input.tipo, input.peca?.trim(), input.descricao?.trim()].filter(Boolean).join(" • "),
    valor: input.custo,
    data: input.data,
    status: "pendente",
  });

  return { success: true } as const;
}

export async function listManutencoes() {
  return manutencoesRepository.listManutencoes();
}

export async function getManutencaoById(id: number) {
  const manutencao = await manutencoesRepository.getManutencaoById(id);
  if (!manutencao) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Manutenção não encontrada",
    });
  }
  return manutencao;
}

export async function updateManutencao(
  id: number,
  data: {
    contratoId?: number | null;
    motoId?: number;
    peca?: string;
    tipo?: string;
    data?: Date;
    custo?: number;
    kmAtual?: number;
    intervaloDiasPrevisto?: number;
    descricao?: string;
  },
) {
  const manutencaoAtual = await getManutencaoById(id);
  const hasContratoUpdate = Object.prototype.hasOwnProperty.call(data, "contratoId");
  const contratoId = hasContratoUpdate ? data.contratoId ?? undefined : manutencaoAtual.contratoId ?? undefined;
  const motoId = data.motoId ?? manutencaoAtual.motoId;

  if (contratoId) {
    const contrato = await contratosService.getContratoById(contratoId);
    if (contrato.motoId !== motoId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "A moto informada não corresponde ao contrato selecionado.",
      });
    }
  }

  if (data.motoId != null || manutencaoAtual.motoId != null) {
    const moto = await motosRepository.getMotoById(motoId);
    if (!moto) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Moto não encontrada",
      });
    }
  }

  await manutencoesRepository.updateManutencao(
    id,
    {
      contratoId,
      ...data,
      custo: data.custo?.toString(),
      peca: data.peca?.trim(),
      tipo: data.tipo?.trim(),
    } as any,
  );

  const pagamentoVinculado = await pagamentosService.getPagamentoByManutencaoId(id);
  if (pagamentoVinculado) {
    await pagamentosService.updatePagamento(pagamentoVinculado.id, {
      contratoId,
      motoId,
      valor: (data.custo ?? Number(manutencaoAtual.custo)).toString(),
      data: data.data ?? new Date(manutencaoAtual.data),
      descricao: [
        data.tipo?.trim() || manutencaoAtual.tipo,
        data.peca?.trim() || manutencaoAtual.peca,
        data.descricao?.trim() || manutencaoAtual.descricao,
      ]
        .filter(Boolean)
        .join(" • "),
    });
  }

  return { success: true } as const;
}

export async function deleteManutencao(id: number) {
  await getManutencaoById(id);
  const pagamentoVinculado = await pagamentosService.getPagamentoByManutencaoId(id);
  if (pagamentoVinculado) {
    await pagamentosService.deletePagamento(pagamentoVinculado.id);
  }
  await manutencoesRepository.deleteManutencao(id);
  return { success: true } as const;
}

export async function getManutencoesByMoto(motoId: number) {
  return manutencoesRepository.getManutencoesByMoto(motoId);
}
