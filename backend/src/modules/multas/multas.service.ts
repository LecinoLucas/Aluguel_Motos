import { TRPCError } from "@trpc/server";
import * as contratosService from "../contratos/contratos.service";
import * as motosRepository from "../motos/motos.repository";
import * as multasRepository from "./multas.repository";

export async function createMulta(input: {
  contratoId: number;
  motoId?: number;
  tipo: "multa" | "prejuizo";
  responsavel: string;
  descricao: string;
  data: Date;
  valor: number;
  status: "pendente" | "pago" | "descontado_caucao";
  observacao?: string;
}) {
  const contrato = await contratosService.getContratoById(input.contratoId);

  if (input.motoId && input.motoId !== contrato.motoId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "A moto informada não corresponde ao contrato selecionado.",
    });
  }

  const moto = await motosRepository.getMotoById(contrato.motoId);
  if (!moto) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Moto não encontrada",
    });
  }

  await multasRepository.createMulta({
    contratoId: contrato.id,
    motoId: contrato.motoId,
    tipo: input.tipo,
    responsavel: input.responsavel.trim(),
    descricao: input.descricao.trim(),
    data: input.data,
    valor: input.valor.toString(),
    status: input.status,
    observacao: input.observacao?.trim() || null,
  } as any);

  return { success: true } as const;
}

export async function listMultas(filters?: { status?: string; contratoId?: number; tipo?: string }) {
  return multasRepository.listMultas(filters);
}

export async function getMultaById(id: number) {
  const multa = await multasRepository.getMultaById(id);
  if (!multa) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Ocorrência não encontrada",
    });
  }
  return multa;
}

export async function updateMulta(
  id: number,
  data: {
    contratoId?: number;
    motoId?: number;
    tipo?: "multa" | "prejuizo";
    responsavel?: string;
    descricao?: string;
    data?: Date;
    valor?: number;
    status?: "pendente" | "pago" | "descontado_caucao";
    observacao?: string;
  },
) {
  const multa = await getMultaById(id);
  const contratoId = data.contratoId ?? multa.contratoId;
  const contrato = await contratosService.getContratoById(contratoId);
  const motoId = data.motoId ?? contrato.motoId;

  if (motoId !== contrato.motoId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "A moto informada não corresponde ao contrato selecionado.",
    });
  }

  const moto = await motosRepository.getMotoById(motoId);
  if (!moto) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Moto não encontrada",
    });
  }

  await multasRepository.updateMulta(
    id,
    {
      contratoId,
      motoId,
      tipo: data.tipo,
      responsavel: data.responsavel?.trim(),
      descricao: data.descricao?.trim(),
      data: data.data,
      valor: data.valor?.toString(),
      status: data.status,
      observacao: data.observacao?.trim() || data.observacao,
    } as any,
  );

  return { success: true } as const;
}

export async function deleteMulta(id: number) {
  await getMultaById(id);
  await multasRepository.deleteMulta(id);
  return { success: true } as const;
}

export async function getMultasByContrato(contratoId: number) {
  await contratosService.getContratoById(contratoId);
  return multasRepository.getMultasByContrato(contratoId);
}
